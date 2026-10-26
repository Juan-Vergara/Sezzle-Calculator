import { formatNumber, MAX_SIGNIFICANT_DIGITS } from './format';
import { BINARY_OPERATION_SYMBOLS } from './keys';
import type { Action, BinaryOperation, CalculatorState } from './types';

export const MAX_ENTRY_DIGITS = MAX_SIGNIFICANT_DIGITS;

export const INITIAL_STATE: CalculatorState = {
  entry: '0',
  accumulator: null,
  pendingOp: null,
  startNewEntry: false,
  awaitingSecondOperand: false,
  status: 'ready',
  error: null,
  request: null,
  lastRequestId: 0,
};

function countDigits(entry: string): number {
  let count = 0;
  for (let i = 0; i < entry.length; i += 1) {
    const ch = entry[i];
    if (ch >= '0' && ch <= '9') {
      count += 1;
    }
  }
  return count;
}

/**
 * Formats the secondary expression line (e.g. `"12 ×"`) shown above the main
 * display value when a binary operation is pending.
 */
export function formatExpression(
  accumulator: number | null,
  pendingOp: BinaryOperation | null,
): string {
  if (accumulator === null || pendingOp === null) {
    return '';
  }
  return `${formatNumber(accumulator)} ${BINARY_OPERATION_SYMBOLS[pendingOp]}`;
}

/**
 * Pure calculator state machine implementing immediate-execution (left-to-right)
 * keypad transitions without performing arithmetic on the frontend.
 *
 * Deterministic by value: transitions depend exclusively on `state` and `action`,
 * with no external mutable state or object-identity tracking.
 */
export function reducer(
  state: CalculatorState,
  action: Action,
): CalculatorState {
  // AC is always available, including during loading or error states.
  // Preserving `lastRequestId` ensures any subsequent request receives a strictly
  // newer ID than an in-flight request that was cleared.
  if (action.type === 'clear') {
    return {
      ...INITIAL_STATE,
      lastRequestId: state.lastRequestId,
    };
  }

  // Async completion actions are only processed if their requestId matches the active request.
  if (action.type === 'resolved') {
    if (!state.request || state.request.id !== action.requestId) {
      return state;
    }

    const formatted = formatNumber(action.result);
    const continuation = state.request.then;

    if (continuation.type === 'chain') {
      return {
        entry: formatted,
        accumulator: action.result,
        pendingOp: continuation.nextOp,
        startNewEntry: true,
        awaitingSecondOperand: true,
        status: 'ready',
        error: null,
        request: null,
        lastRequestId: state.lastRequestId,
      };
    }

    if (continuation.type === 'equals') {
      return {
        entry: formatted,
        accumulator: null,
        pendingOp: null,
        startNewEntry: true,
        awaitingSecondOperand: false,
        status: 'ready',
        error: null,
        request: null,
        lastRequestId: state.lastRequestId,
      };
    }

    // continuation.type === 'unary'
    return {
      ...state,
      entry: formatted,
      startNewEntry: true,
      awaitingSecondOperand: false,
      status: 'ready',
      error: null,
      request: null,
    };
  }

  if (action.type === 'failed') {
    if (!state.request || state.request.id !== action.requestId) {
      return state;
    }

    return {
      entry: '0',
      accumulator: null,
      pendingOp: null,
      startNewEntry: false,
      awaitingSecondOperand: false,
      status: 'error',
      error: action.message,
      request: null,
      lastRequestId: state.lastRequestId,
    };
  }

  // While a backend request is in flight, ignore all keypad actions except AC (handled above).
  if (state.status === 'loading') {
    return state;
  }

  // In error state, a digit or decimal resets the error and starts typing; other keys (except AC) are ignored.
  if (state.status === 'error') {
    if (action.type === 'digit') {
      return {
        ...INITIAL_STATE,
        entry: action.digit,
        lastRequestId: state.lastRequestId,
      };
    }
    if (action.type === 'decimal') {
      return {
        ...INITIAL_STATE,
        entry: '0.',
        lastRequestId: state.lastRequestId,
      };
    }
    return state;
  }

  switch (action.type) {
    case 'digit': {
      if (state.startNewEntry) {
        return {
          ...state,
          entry: action.digit,
          startNewEntry: false,
          awaitingSecondOperand: false,
        };
      }
      if (state.entry === '0') {
        return {
          ...state,
          entry: action.digit,
          awaitingSecondOperand: false,
        };
      }
      if (countDigits(state.entry) >= MAX_ENTRY_DIGITS) {
        return state;
      }
      return {
        ...state,
        entry: state.entry + action.digit,
        awaitingSecondOperand: false,
      };
    }

    case 'decimal': {
      if (state.startNewEntry) {
        return {
          ...state,
          entry: '0.',
          startNewEntry: false,
          awaitingSecondOperand: false,
        };
      }
      if (state.entry.includes('.')) {
        return state;
      }
      if (countDigits(state.entry) >= MAX_ENTRY_DIGITS) {
        return state;
      }
      return {
        ...state,
        entry: `${state.entry}.`,
        awaitingSecondOperand: false,
      };
    }

    case 'toggleSign': {
      if (state.entry === '0' || Number(state.entry) === 0) {
        return state;
      }
      const nextEntry = state.entry.startsWith('-')
        ? state.entry.slice(1)
        : `-${state.entry}`;
      return {
        ...state,
        entry: nextEntry,
        awaitingSecondOperand: false,
      };
    }

    case 'backspace': {
      if (state.startNewEntry) {
        return state;
      }
      const sliced = state.entry.slice(0, -1);
      const nextEntry =
        sliced === '' || sliced === '-' || sliced === '-0' ? '0' : sliced;
      return {
        ...state,
        entry: nextEntry,
      };
    }

    case 'binaryOp': {
      const currentVal = Number(state.entry);

      if (state.pendingOp !== null && state.accumulator !== null) {
        if (state.awaitingSecondOperand) {
          // Replace the pending operator without issuing a request.
          return {
            ...state,
            pendingOp: action.operation,
          };
        }

        // Immediate execution: evaluate pendingOp(acc, entry) on the backend, then chain action.operation.
        const id = state.lastRequestId + 1;
        return {
          ...state,
          status: 'loading',
          error: null,
          lastRequestId: id,
          request: {
            id,
            operation: state.pendingOp,
            operands: [state.accumulator, currentVal],
            then: { type: 'chain', nextOp: action.operation },
          },
        };
      }

      return {
        ...state,
        accumulator: currentVal,
        pendingOp: action.operation,
        startNewEntry: true,
        awaitingSecondOperand: true,
      };
    }

    case 'equals': {
      if (state.pendingOp === null || state.accumulator === null) {
        return state;
      }

      const id = state.lastRequestId + 1;
      return {
        ...state,
        status: 'loading',
        error: null,
        lastRequestId: id,
        request: {
          id,
          operation: state.pendingOp,
          operands: [state.accumulator, Number(state.entry)],
          then: { type: 'equals' },
        },
      };
    }

    case 'unaryOp': {
      const id = state.lastRequestId + 1;
      return {
        ...state,
        status: 'loading',
        error: null,
        lastRequestId: id,
        request: {
          id,
          operation: action.operation,
          operands: [Number(state.entry)],
          then: { type: 'unary' },
        },
      };
    }
  }
}
