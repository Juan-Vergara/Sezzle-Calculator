import { useEffect, useReducer, type Dispatch } from 'react';
import { calculate, UNEXPECTED_RESPONSE_MESSAGE } from '../api/client';
import { formatExpression, INITIAL_STATE, reducer } from './reducer';
import type { Action, CalculatorState } from './types';

export interface UseCalculatorResult {
  state: CalculatorState;
  dispatch: Dispatch<Action>;
  expression: string;
}

/**
 * Connects the pure calculator reducer to the backend HTTP API.
 *
 * Whenever `state.request` is non-null, executes `calculate(...)` with an
 * `AbortController` and dispatches `resolved` or `failed`. Cleanup aborts the
 * in-flight request (handling `AC` cancellation and React StrictMode double effects).
 */
export function useCalculator(): UseCalculatorResult {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const activeRequest = state.request;

  useEffect(() => {
    if (!activeRequest) {
      return undefined;
    }

    const controller = new AbortController();

    calculate(
      activeRequest.operation,
      activeRequest.operands,
      controller.signal,
    )
      .then((result) => {
        if (!controller.signal.aborted) {
          dispatch({
            type: 'resolved',
            requestId: activeRequest.id,
            result,
          });
        }
      })
      .catch((err: unknown) => {
        if (
          controller.signal.aborted ||
          (err instanceof Error && err.name === 'AbortError')
        ) {
          return;
        }
        const message =
          err instanceof Error ? err.message : UNEXPECTED_RESPONSE_MESSAGE;
        dispatch({
          type: 'failed',
          requestId: activeRequest.id,
          message,
        });
      });

    return () => {
      controller.abort();
    };
  }, [activeRequest]);

  return {
    state,
    dispatch,
    expression: formatExpression(state.accumulator, state.pendingOp),
  };
}
