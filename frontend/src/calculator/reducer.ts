import { formatNumber, MAX_SIGNIFICANT_DIGITS } from './format';
import { BINARY_OPERATION_SYMBOLS } from './keys';
import type { Action, BinaryOperation, CalculatorState } from './types';

export const MAX_ENTRY_DIGITS = MAX_SIGNIFICANT_DIGITS;

export const INITIAL_STATE: CalculatorState = {
  entry: '0',
  accumulator: null,
  pendingOp: null,
  startNewEntry: false,
  status: 'ready',
  error: null,
  request: null,
};

// Tracks the last issued request ID along a state chain so sequential requests
// receive monotonically increasing IDs even after `request` resets to `null`,
// while fresh state objects in unit tests always start deterministically at 1.
const lastRequestIds = new WeakMap<CalculatorState, number>();

// Tracks states where `pendingOp` is active and `startNewEntry` is `true` because
// a unary operation (or sign toggle) produced the right-hand operand. In these
// states, digits still start a fresh entry, but pressing a binary operator must
// chain `pendingOp(accumulator, entry)` rather than replacing `pendingOp`.
const unaryOperandStates = new WeakSet<CalculatorState>();

function issueRequestId(state: CalculatorState): number {
  const prev = lastRequestIds.get(state) ?? 0;
  return prev + 1;
}

function withSequence(
  prevState: CalculatorState,
  nextState: CalculatorState,
): CalculatorState {
  const seq = nextState.request?.id ?? lastRequestIds.get(prevState) ?? 0;
  if (seq > 0) {
    lastRequestIds.set(nextState, seq);
  }
  return nextState;
}

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
 */
export function reducer(
  state: CalculatorState,
  action: Action,
): CalculatorState {
  // AC is always available, including during loading or error states.
  if (action.type === 'clear') {
    return withSequence(state, { ...INITIAL_STATE });
  }

  // Async completion actions are only processed if their requestId matches the active request.
  if (action.type === 'resolved') {
    if (!state.request || state.request.id !== action.requestId) {
      return state;
    }

    const formatted = formatNumber(action.result);
    const continuation = state.request.then;

    if (continuation.type === 'chain') {
      return withSequence(state, {
        entry: formatted,
        accumulator: action.result,
        pendingOp: continuation.nextOp,
        startNewEntry: true,
        status: 'ready',
        error: null,
        request: null,
      });
    }

    if (continuation.type === 'equals') {
      return withSequence(state, {
        entry: formatted,
        accumulator: null,
        pendingOp: null,
        startNewEntry: true,
        status: 'ready',
        error: null,
        request: null,
      });
    }

    // continuation.type === 'unary'
    const nextState = withSequence(state, {
      ...state,
      entry: formatted,
      startNewEntry: true,
      status: 'ready',
      error: null,
      request: null,
    });
    if (nextState.pendingOp !== null && nextState.accumulator !== null) {
      unaryOperandStates.add(nextState);
    }
    return nextState;
  }

  if (action.type === 'failed') {
    if (!state.request || state.request.id !== action.requestId) {
      return state;
    }

    return withSequence(state, {
      entry: '0',
      accumulator: null,
      pendingOp: null,
      startNewEntry: false,
      status: 'error',
      error: action.message,
      request: null,
    });
  }

  // While a backend request is in flight, ignore all keypad actions except AC (handled above).
  if (state.status === 'loading') {
    return state;
  }

  // In error state, a digit resets the error and starts typing; other keys (except AC) are ignored.
  if (state.status === 'error') {
    if (action.type === 'digit') {
      return withSequence(state, {
        ...INITIAL_STATE,
        entry: action.digit,
      });
    }
    return state;
  }

  switch (action.type) {
    case 'digit': {
      if (state.startNewEntry) {
        return withSequence(state, {
          ...state,
          entry: action.digit,
          startNewEntry: false,
        });
      }
      if (state.entry === '0') {
        return withSequence(state, {
          ...state,
          entry: action.digit,
        });
      }
      if (countDigits(state.entry) >= MAX_ENTRY_DIGITS) {
        return state;
      }
      return withSequence(state, {
        ...state,
        entry: state.entry + action.digit,
      });
    }

    case 'decimal': {
      if (state.startNewEntry) {
        return withSequence(state, {
          ...state,
          entry: '0.',
          startNewEntry: false,
        });
      }
      if (state.entry.includes('.')) {
        return state;
      }
      if (countDigits(state.entry) >= MAX_ENTRY_DIGITS) {
        return state;
      }
      return withSequence(state, {
        ...state,
        entry: `${state.entry}.`,
      });
    }

    case 'toggleSign': {
      if (state.entry === '0' || Number(state.entry) === 0) {
        return state;
      }
      const nextEntry = state.entry.startsWith('-')
        ? state.entry.slice(1)
        : `-${state.entry}`;
      const nextState = withSequence(state, {
        ...state,
        entry: nextEntry,
      });
      if (unaryOperandStates.has(state)) {
        unaryOperandStates.add(nextState);
      }
      return nextState;
    }

    case 'backspace': {
      if (state.startNewEntry) {
        return state;
      }
      const sliced = state.entry.slice(0, -1);
      const nextEntry =
        sliced === '' || sliced === '-' || sliced === '-0' ? '0' : sliced;
      return withSequence(state, {
        ...state,
        entry: nextEntry,
      });
    }

    case 'binaryOp': {
      const currentVal = Number(state.entry);

      if (state.pendingOp !== null && state.accumulator !== null) {
        if (state.startNewEntry && !unaryOperandStates.has(state)) {
          // Replace the pending operator without issuing a request.
          return withSequence(state, {
            ...state,
            pendingOp: action.operation,
          });
        }

        // Immediate execution: evaluate pendingOp(acc, entry) on the backend, then chain action.operation.
        const id = issueRequestId(state);
        return withSequence(state, {
          ...state,
          status: 'loading',
          error: null,
          request: {
            id,
            operation: state.pendingOp,
            operands: [state.accumulator, currentVal],
            then: { type: 'chain', nextOp: action.operation },
          },
        });
      }

      return withSequence(state, {
        ...state,
        accumulator: currentVal,
        pendingOp: action.operation,
        startNewEntry: true,
      });
    }

    case 'equals': {
      if (state.pendingOp === null || state.accumulator === null) {
        return state;
      }

      const id = issueRequestId(state);
      return withSequence(state, {
        ...state,
        status: 'loading',
        error: null,
        request: {
          id,
          operation: state.pendingOp,
          operands: [state.accumulator, Number(state.entry)],
          then: { type: 'equals' },
        },
      });
    }

    case 'unaryOp': {
      const id = issueRequestId(state);
      return withSequence(state, {
        ...state,
        status: 'loading',
        error: null,
        request: {
          id,
          operation: action.operation,
          operands: [Number(state.entry)],
          then: { type: 'unary' },
        },
      });
    }
  }
}
