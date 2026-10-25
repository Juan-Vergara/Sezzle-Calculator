import { useEffect } from 'react';
import { mapKeyboardKeyToAction } from '../calculator/keys';
import { useCalculator } from '../calculator/useCalculator';
import { Display } from './Display';
import { Keypad } from './Keypad';

export function Calculator() {
  const { state, dispatch, expression } = useCalculator();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      const action = mapKeyboardKeyToAction(event.key);
      if (!action) {
        return;
      }

      event.preventDefault();
      dispatch(action);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch]);

  return (
    <section className="calculator-card" aria-label="Calculator">
      <Display
        expression={expression}
        entry={state.entry}
        status={state.status}
        error={state.error}
      />
      <Keypad
        onAction={dispatch}
        isLoading={state.status === 'loading'}
        pendingOp={state.pendingOp}
      />
    </section>
  );
}
