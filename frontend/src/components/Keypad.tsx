import { KEYPAD_KEYS } from '../calculator/keys';
import type { Action, BinaryOperation } from '../calculator/types';

export interface KeypadProps {
  onAction: (action: Action) => void;
  isLoading: boolean;
  pendingOp: BinaryOperation | null;
}

export function Keypad({ onAction, isLoading, pendingOp }: KeypadProps) {
  return (
    <div className="calculator-keypad" role="group" aria-label="Calculator keypad">
      {KEYPAD_KEYS.map((keyDef) => {
        const isDisabled = isLoading && keyDef.id !== 'clear';
        const isActiveOperator =
          keyDef.action.type === 'binaryOp' &&
          pendingOp === keyDef.action.operation;

        const classNames = [
          'keypad-button',
          `keypad-button--${keyDef.variant}`,
          keyDef.gridSpan ? `keypad-button--${keyDef.gridSpan}` : '',
          isActiveOperator ? 'keypad-button--active' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={keyDef.id}
            type="button"
            className={classNames}
            aria-label={keyDef.ariaLabel}
            aria-pressed={
              keyDef.action.type === 'binaryOp' ? isActiveOperator : undefined
            }
            disabled={isDisabled}
            onClick={() => onAction(keyDef.action)}
          >
            {keyDef.label}
          </button>
        );
      })}
    </div>
  );
}
