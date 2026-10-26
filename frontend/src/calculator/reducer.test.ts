import { describe, expect, it } from 'vitest';
import {
  BINARY_OPERATION_SYMBOLS,
  KEYPAD_KEYS,
  mapKeyboardKeyToAction,
} from './keys';
import {
  formatExpression,
  INITIAL_STATE,
  MAX_ENTRY_DIGITS,
  reducer,
} from './reducer';
import type { Action, CalculatorState, Digit } from './types';

function applyActions(
  initial: CalculatorState,
  actions: readonly Action[],
): CalculatorState {
  return actions.reduce((state, action) => reducer(state, action), initial);
}

describe('calculator/reducer', () => {
  describe('digit and decimal entry', () => {
    it('replaces initial "0" with a non-zero digit and ignores leading zeros', () => {
      const s0 = reducer(INITIAL_STATE, { type: 'digit', digit: '0' });
      expect(s0.entry).toBe('0');

      const s1 = reducer(INITIAL_STATE, { type: 'digit', digit: '7' });
      expect(s1.entry).toBe('7');

      const s2 = reducer(s1, { type: 'digit', digit: '5' });
      expect(s2.entry).toBe('75');
    });

    it('enforces a single decimal point and starts "0." when startNewEntry is true', () => {
      const s1 = applyActions(INITIAL_STATE, [
        { type: 'decimal' },
        { type: 'digit', digit: '5' },
        { type: 'decimal' },
        { type: 'digit', digit: '2' },
      ]);
      expect(s1.entry).toBe('0.52');

      const afterOp = reducer(s1, { type: 'binaryOp', operation: 'add' });
      expect(afterOp.startNewEntry).toBe(true);

      const s2 = reducer(afterOp, { type: 'decimal' });
      expect(s2.entry).toBe('0.');
      expect(s2.startNewEntry).toBe(false);
    });

    it('caps entry length at 15 digits (excluding decimal point and minus sign)', () => {
      const digits: Action[] = Array.from(
        { length: MAX_ENTRY_DIGITS + 3 },
        (_, i) => ({
          type: 'digit',
          digit: String((i % 9) + 1) as Digit,
        }),
      );

      const state = applyActions(INITIAL_STATE, digits);
      expect(state.entry).toHaveLength(MAX_ENTRY_DIGITS);

      // Decimal point is also ignored once 15 digits have been entered.
      const withDecimal = reducer(state, { type: 'decimal' });
      expect(withDecimal).toBe(state);
    });

    it('replaces entry when typing a digit after startNewEntry is true', () => {
      const s1 = applyActions(INITIAL_STATE, [
        { type: 'digit', digit: '9' },
        { type: 'binaryOp', operation: 'multiply' },
        { type: 'digit', digit: '4' },
      ]);
      expect(s1.entry).toBe('4');
      expect(s1.startNewEntry).toBe(false);
    });
  });

  describe('toggleSign (±), backspace (⌫), and clear (AC)', () => {
    it('toggles sign on non-zero entries and results, ignoring "0" and "0."', () => {
      expect(reducer(INITIAL_STATE, { type: 'toggleSign' })).toBe(
        INITIAL_STATE,
      );

      const zeroDot = reducer(INITIAL_STATE, { type: 'decimal' });
      expect(reducer(zeroDot, { type: 'toggleSign' })).toBe(zeroDot);

      const s1 = reducer(INITIAL_STATE, { type: 'digit', digit: '8' });
      const neg = reducer(s1, { type: 'toggleSign' });
      expect(neg.entry).toBe('-8');

      const pos = reducer(neg, { type: 'toggleSign' });
      expect(pos.entry).toBe('8');

      // Also works on a resolved result where startNewEntry is true
      const afterUnary = reducer(s1, { type: 'unaryOp', operation: 'sqrt' });
      const resolved = reducer(afterUnary, {
        type: 'resolved',
        requestId: afterUnary.request!.id,
        result: 4,
      });
      expect(resolved.startNewEntry).toBe(true);
      const negatedResult = reducer(resolved, { type: 'toggleSign' });
      expect(negatedResult.entry).toBe('-4');
    });

    it('deletes the last character while typing and resets single/negative digits to "0"', () => {
      const s1 = applyActions(INITIAL_STATE, [
        { type: 'digit', digit: '1' },
        { type: 'digit', digit: '2' },
      ]);
      const s2 = reducer(s1, { type: 'backspace' });
      expect(s2.entry).toBe('1');

      const s3 = reducer(s2, { type: 'backspace' });
      expect(s3.entry).toBe('0');

      const negSingle = applyActions(INITIAL_STATE, [
        { type: 'digit', digit: '5' },
        { type: 'toggleSign' },
        { type: 'backspace' },
      ]);
      expect(negSingle.entry).toBe('0');
    });

    it('ignores backspace when startNewEntry is true', () => {
      const s1 = applyActions(INITIAL_STATE, [
        { type: 'digit', digit: '4' },
        { type: 'digit', digit: '2' },
        { type: 'binaryOp', operation: 'add' },
      ]);
      expect(s1.startNewEntry).toBe(true);
      expect(reducer(s1, { type: 'backspace' })).toBe(s1);
    });

    it('resets calculator state on AC from any state, including loading, while preserving lastRequestId against stale responses', () => {
      const loadingState = applyActions(INITIAL_STATE, [
        { type: 'digit', digit: '9' },
        { type: 'unaryOp', operation: 'sqrt' },
      ]);
      expect(loadingState.status).toBe('loading');
      expect(loadingState.lastRequestId).toBe(1);

      const cleared = reducer(loadingState, { type: 'clear' });
      expect(cleared).toEqual({
        ...INITIAL_STATE,
        lastRequestId: 1,
      });
    });
  });

  describe('binary, unary, and equals request flows', () => {
    it('stores accumulator and pendingOp on first binary operator and replaces operator if pressed again before typing', () => {
      const s1 = applyActions(INITIAL_STATE, [
        { type: 'digit', digit: '1' },
        { type: 'digit', digit: '2' },
        { type: 'binaryOp', operation: 'add' },
      ]);
      expect(s1.accumulator).toBe(12);
      expect(s1.pendingOp).toBe('add');
      expect(s1.startNewEntry).toBe(true);
      expect(s1.request).toBeNull();

      // Pressing another operator before typing a second operand replaces pendingOp
      const s2 = reducer(s1, { type: 'binaryOp', operation: 'multiply' });
      expect(s2.accumulator).toBe(12);
      expect(s2.pendingOp).toBe('multiply');
      expect(s2.request).toBeNull();
    });

    it('creates a chain request when a binary operator is pressed after entering a second operand (immediate execution)', () => {
      const s1 = applyActions(INITIAL_STATE, [
        { type: 'digit', digit: '2' },
        { type: 'binaryOp', operation: 'add' },
        { type: 'digit', digit: '3' },
        { type: 'binaryOp', operation: 'multiply' },
      ]);

      expect(s1.status).toBe('loading');
      expect(s1.request).toEqual({
        id: 1,
        operation: 'add',
        operands: [2, 3],
        then: { type: 'chain', nextOp: 'multiply' },
      });

      const s2 = reducer(s1, {
        type: 'resolved',
        requestId: 1,
        result: 5,
      });
      expect(s2.status).toBe('ready');
      expect(s2.entry).toBe('5');
      expect(s2.accumulator).toBe(5);
      expect(s2.pendingOp).toBe('multiply');
      expect(s2.startNewEntry).toBe(true);
      expect(s2.request).toBeNull();

      // Completing `2 + 3 × 4 =` -> 20
      const s3 = applyActions(s2, [
        { type: 'digit', digit: '4' },
        { type: 'equals' },
      ]);
      expect(s3.request).toEqual({
        id: 2,
        operation: 'multiply',
        operands: [5, 4],
        then: { type: 'equals' },
      });

      const s4 = reducer(s3, {
        type: 'resolved',
        requestId: 2,
        result: 20,
      });
      expect(s4.entry).toBe('20');
      expect(s4.accumulator).toBeNull();
      expect(s4.pendingOp).toBeNull();
      expect(s4.startNewEntry).toBe(true);
    });

    it('supports `5 + =` (using current entry as second operand) and ignores `=` when no pendingOp exists', () => {
      expect(reducer(INITIAL_STATE, { type: 'equals' })).toBe(INITIAL_STATE);

      const s1 = applyActions(INITIAL_STATE, [
        { type: 'digit', digit: '5' },
        { type: 'binaryOp', operation: 'add' },
        { type: 'equals' },
      ]);
      expect(s1.request).toEqual({
        id: 1,
        operation: 'add',
        operands: [5, 5],
        then: { type: 'equals' },
      });
    });

    it('creates a unary request and preserves pendingOp (e.g. `50 + 10 % =` -> `50.1`), and starts a fresh entry if a digit is typed after `%`', () => {
      const s1 = applyActions(INITIAL_STATE, [
        { type: 'digit', digit: '5' },
        { type: 'digit', digit: '0' },
        { type: 'binaryOp', operation: 'add' },
        { type: 'digit', digit: '1' },
        { type: 'digit', digit: '0' },
        { type: 'unaryOp', operation: 'percentage' },
      ]);

      expect(s1.status).toBe('loading');
      expect(s1.accumulator).toBe(50);
      expect(s1.pendingOp).toBe('add');
      expect(s1.request).toEqual({
        id: 1,
        operation: 'percentage',
        operands: [10],
        then: { type: 'unary' },
      });

      const s2 = reducer(s1, {
        type: 'resolved',
        requestId: 1,
        result: 0.1,
      });
      expect(s2.entry).toBe('0.1');
      expect(s2.accumulator).toBe(50);
      expect(s2.pendingOp).toBe('add');
      expect(s2.startNewEntry).toBe(true);
      expect(s2.awaitingSecondOperand).toBe(false);

      // Entering a digit after `50 + 10 %` replaces `0.1` instead of concatenating `0.17`
      const afterDigit = reducer({ ...s2 }, { type: 'digit', digit: '7' });
      expect(afterDigit.entry).toBe('7');
      expect(afterDigit.startNewEntry).toBe(false);

      // Pressing `=` on `50 + 10 %` (including on a shallow-copied state) evaluates `50 + 0.1 = 50.1`
      const s3 = reducer({ ...s2 }, { type: 'equals' });
      expect(s3.request).toEqual({
        id: 2,
        operation: 'add',
        operands: [50, 0.1],
        then: { type: 'equals' },
      });

      const s4 = reducer({ ...s3 }, {
        type: 'resolved',
        requestId: 2,
        result: 50.1,
      });
      expect(s4.entry).toBe('50.1');
      expect(s4.accumulator).toBeNull();
      expect(s4.pendingOp).toBeNull();
    });

    it('is deterministic by value for `3 +` vs `3 + 9 √` followed by `×` across reducer states, shallow copies, and manual literals', () => {
      // Case 1: `3 +`, then `×` replaces `+`
      const afterThreePlus = applyActions(INITIAL_STATE, [
        { type: 'digit', digit: '3' },
        { type: 'binaryOp', operation: 'add' },
      ]);
      const manualThreePlus: CalculatorState = {
        entry: '3',
        accumulator: 3,
        pendingOp: 'add',
        startNewEntry: true,
        awaitingSecondOperand: true,
        status: 'ready',
        error: null,
        request: null,
        lastRequestId: 0,
      };
      expect(afterThreePlus).toEqual(manualThreePlus);

      for (const candidate of [
        afterThreePlus,
        { ...afterThreePlus },
        manualThreePlus,
      ]) {
        const replaced = reducer(candidate, {
          type: 'binaryOp',
          operation: 'multiply',
        });
        expect(replaced.status).toBe('ready');
        expect(replaced.pendingOp).toBe('multiply');
        expect(replaced.accumulator).toBe(3);
        expect(replaced.request).toBeNull();
      }

      // Case 2: `3 + 9 √`, then `×` resolves `3 + 3` before chaining multiplication
      const beforeSqrt = applyActions(INITIAL_STATE, [
        { type: 'digit', digit: '3' },
        { type: 'binaryOp', operation: 'add' },
        { type: 'digit', digit: '9' },
        { type: 'unaryOp', operation: 'sqrt' },
      ]);
      const afterSqrt = reducer(beforeSqrt, {
        type: 'resolved',
        requestId: 1,
        result: 3,
      });
      const manualAfterSqrt: CalculatorState = {
        entry: '3',
        accumulator: 3,
        pendingOp: 'add',
        startNewEntry: true,
        awaitingSecondOperand: false,
        status: 'ready',
        error: null,
        request: null,
        lastRequestId: 1,
      };
      expect(afterSqrt).toEqual(manualAfterSqrt);

      for (const candidate of [
        afterSqrt,
        { ...afterSqrt },
        manualAfterSqrt,
      ]) {
        const chained = reducer(candidate, {
          type: 'binaryOp',
          operation: 'multiply',
        });
        expect(chained.status).toBe('loading');
        expect(chained.lastRequestId).toBe(2);
        expect(chained.request).toEqual({
          id: 2,
          operation: 'add',
          operands: [3, 3],
          then: { type: 'chain', nextOp: 'multiply' },
        });
      }
    });

    it('ignores stale resolved or failed actions without identity-based metadata, including across AC and shallow copies', () => {
      expect(
        reducer(INITIAL_STATE, { type: 'resolved', requestId: 99, result: 42 }),
      ).toBe(INITIAL_STATE);
      expect(
        reducer(INITIAL_STATE, {
          type: 'failed',
          requestId: 99,
          message: 'stale',
        }),
      ).toBe(INITIAL_STATE);

      const loading1 = reducer(INITIAL_STATE, {
        type: 'unaryOp',
        operation: 'sqrt',
      });
      expect(loading1.request?.id).toBe(1);

      // Shallow-copied loading state rejects mismatched requestId
      const copiedLoading1 = { ...loading1 };
      expect(
        reducer(copiedLoading1, { type: 'resolved', requestId: 999, result: 3 }),
      ).toBe(copiedLoading1);
      expect(
        reducer(copiedLoading1, {
          type: 'failed',
          requestId: 999,
          message: 'stale error',
        }),
      ).toBe(copiedLoading1);

      // Clearing during request #1 preserves lastRequestId = 1, sets request = null,
      // and rejects late resolved/failed responses from request #1 while idle.
      const cleared = { ...reducer(copiedLoading1, { type: 'clear' }) };
      expect(cleared.request).toBeNull();
      expect(cleared.lastRequestId).toBe(1);
      expect(cleared.awaitingSecondOperand).toBe(false);
      expect(
        reducer(cleared, { type: 'resolved', requestId: 1, result: 3 }),
      ).toBe(cleared);
      expect(
        reducer(cleared, {
          type: 'failed',
          requestId: 1,
          message: 'late error after AC',
        }),
      ).toBe(cleared);

      // Starting request #2 on a shallow-copied cleared state issues requestId 2
      // and ignores both late resolved and late failed responses from request #1.
      const loading2 = reducer(
        reducer(cleared, { type: 'digit', digit: '4' }),
        { type: 'unaryOp', operation: 'sqrt' },
      );
      expect(loading2.lastRequestId).toBe(2);
      expect(loading2.request?.id).toBe(2);

      const manualLoading2: CalculatorState = { ...loading2 };
      expect(
        reducer(manualLoading2, { type: 'resolved', requestId: 1, result: 3 }),
      ).toBe(manualLoading2);
      expect(
        reducer(manualLoading2, {
          type: 'failed',
          requestId: 1,
          message: 'late error from request 1',
        }),
      ).toBe(manualLoading2);

      const resolved2 = reducer(manualLoading2, {
        type: 'resolved',
        requestId: 2,
        result: 2,
      });
      expect(resolved2.entry).toBe('2');
      expect(resolved2.status).toBe('ready');
      expect(resolved2.lastRequestId).toBe(2);
      expect(resolved2.awaitingSecondOperand).toBe(false);
    });
  });

  describe('loading and error state guards', () => {
    it('ignores all keypad actions except AC while status is loading', () => {
      const loading = applyActions(INITIAL_STATE, [
        { type: 'digit', digit: '9' },
        { type: 'unaryOp', operation: 'sqrt' },
      ]);

      const ignoredActions: Action[] = [
        { type: 'digit', digit: '1' },
        { type: 'decimal' },
        { type: 'toggleSign' },
        { type: 'backspace' },
        { type: 'binaryOp', operation: 'add' },
        { type: 'unaryOp', operation: 'percentage' },
        { type: 'equals' },
      ];

      for (const action of ignoredActions) {
        expect(reducer(loading, action)).toBe(loading);
      }
    });

    it('transitions to error state on failed(message), ignores operators, and recovers on digit or AC', () => {
      const loading = applyActions(INITIAL_STATE, [
        { type: 'digit', digit: '8' },
        { type: 'binaryOp', operation: 'divide' },
        { type: 'digit', digit: '0' },
        { type: 'equals' },
      ]);

      const errored = reducer(loading, {
        type: 'failed',
        requestId: loading.request!.id,
        message: 'division by zero is not allowed',
      });

      expect(errored).toEqual({
        entry: '0',
        accumulator: null,
        pendingOp: null,
        startNewEntry: false,
        awaitingSecondOperand: false,
        status: 'error',
        error: 'division by zero is not allowed',
        request: null,
        lastRequestId: 1,
      });

      // Operators, toggleSign, and backspace are ignored while in error state
      expect(
        reducer(errored, { type: 'binaryOp', operation: 'add' }),
      ).toBe(errored);
      expect(
        reducer(errored, { type: 'unaryOp', operation: 'sqrt' }),
      ).toBe(errored);
      expect(reducer(errored, { type: 'equals' })).toBe(errored);
      expect(reducer(errored, { type: 'toggleSign' })).toBe(errored);
      expect(reducer(errored, { type: 'backspace' })).toBe(errored);

      // Typing a digit clears the error and starts a new entry with that digit
      const recoveredByDigit = reducer(errored, {
        type: 'digit',
        digit: '3',
      });
      expect(recoveredByDigit.status).toBe('ready');
      expect(recoveredByDigit.error).toBeNull();
      expect(recoveredByDigit.entry).toBe('3');
      expect(recoveredByDigit.lastRequestId).toBe(1);

      // Pressing decimal clears the error and starts "0."
      const recoveredByDecimal = reducer(errored, { type: 'decimal' });
      expect(recoveredByDecimal.status).toBe('ready');
      expect(recoveredByDecimal.error).toBeNull();
      expect(recoveredByDecimal.entry).toBe('0.');
      expect(recoveredByDecimal.lastRequestId).toBe(1);

      // Pressing AC also clears the error while keeping lastRequestId
      const recoveredByAC = reducer(errored, { type: 'clear' });
      expect(recoveredByAC).toEqual({
        ...INITIAL_STATE,
        lastRequestId: 1,
      });
    });
  });

  describe('formatExpression and keyboard mapping', () => {
    it('formats the pending expression line or returns empty string when idle', () => {
      expect(formatExpression(null, null)).toBe('');
      expect(formatExpression(12, null)).toBe('');
      expect(formatExpression(12, 'multiply')).toBe('12 ×');
      expect(formatExpression(2, 'power')).toBe('2 ^');
      expect(BINARY_OPERATION_SYMBOLS.divide).toBe('÷');
    });

    it('maps physical keyboard shortcuts to calculator actions and returns null for unknown keys', () => {
      expect(KEYPAD_KEYS).toHaveLength(22);
      expect(mapKeyboardKeyToAction('7')).toEqual({
        type: 'digit',
        digit: '7',
      });
      expect(mapKeyboardKeyToAction('.')).toEqual({ type: 'decimal' });
      expect(mapKeyboardKeyToAction(',')).toEqual({ type: 'decimal' });
      expect(mapKeyboardKeyToAction('+')).toEqual({
        type: 'binaryOp',
        operation: 'add',
      });
      expect(mapKeyboardKeyToAction('-')).toEqual({
        type: 'binaryOp',
        operation: 'subtract',
      });
      expect(mapKeyboardKeyToAction('*')).toEqual({
        type: 'binaryOp',
        operation: 'multiply',
      });
      expect(mapKeyboardKeyToAction('x')).toEqual({
        type: 'binaryOp',
        operation: 'multiply',
      });
      expect(mapKeyboardKeyToAction('X')).toEqual({
        type: 'binaryOp',
        operation: 'multiply',
      });
      expect(mapKeyboardKeyToAction('/')).toEqual({
        type: 'binaryOp',
        operation: 'divide',
      });
      expect(mapKeyboardKeyToAction('^')).toEqual({
        type: 'binaryOp',
        operation: 'power',
      });
      expect(mapKeyboardKeyToAction('%')).toEqual({
        type: 'unaryOp',
        operation: 'percentage',
      });
      expect(mapKeyboardKeyToAction('r')).toEqual({
        type: 'unaryOp',
        operation: 'sqrt',
      });
      expect(mapKeyboardKeyToAction('R')).toEqual({
        type: 'unaryOp',
        operation: 'sqrt',
      });
      expect(mapKeyboardKeyToAction('F9')).toEqual({ type: 'toggleSign' });
      expect(mapKeyboardKeyToAction('Enter')).toEqual({ type: 'equals' });
      expect(mapKeyboardKeyToAction('=')).toEqual({ type: 'equals' });
      expect(mapKeyboardKeyToAction('Backspace')).toEqual({
        type: 'backspace',
      });
      expect(mapKeyboardKeyToAction('Escape')).toEqual({ type: 'clear' });
      expect(mapKeyboardKeyToAction('Delete')).toEqual({ type: 'clear' });
      expect(mapKeyboardKeyToAction('c')).toEqual({ type: 'clear' });
      expect(mapKeyboardKeyToAction('C')).toEqual({ type: 'clear' });
      expect(mapKeyboardKeyToAction('a')).toBeNull();
      expect(mapKeyboardKeyToAction('F1')).toBeNull();
    });
  });
});
