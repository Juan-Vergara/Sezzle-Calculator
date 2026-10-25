import type { CalculatorStatus } from '../calculator/types';

export interface DisplayProps {
  expression: string;
  entry: string;
  status: CalculatorStatus;
  error: string | null;
}

function getDisplaySizeClass(text: string, isError: boolean): string {
  if (isError) {
    return 'display-value--error';
  }
  if (text.length >= 14) {
    return 'display-value--small';
  }
  if (text.length >= 10) {
    return 'display-value--compact';
  }
  return 'display-value--normal';
}

export function Display({ expression, entry, status, error }: DisplayProps) {
  const isError = status === 'error' && error !== null;
  const isLoading = status === 'loading';
  const mainText = isError ? error : entry;
  const sizeClass = getDisplaySizeClass(mainText, isError);

  return (
    <div className="calculator-display" data-status={status}>
      <div
        className="display-expression"
        data-testid="calculator-expression"
        aria-label="Pending expression"
      >
        {expression || '\u00A0'}
      </div>
      <output
        className={`display-value ${sizeClass}`}
        data-testid="calculator-display"
        aria-live="polite"
        aria-atomic="true"
        aria-busy={isLoading}
        aria-label="Calculator display"
      >
        {mainText}
      </output>
    </div>
  );
}
