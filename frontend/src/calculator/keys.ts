import type { Action, BinaryOperation, Digit } from './types';

export type KeyVariant = 'utility' | 'operator' | 'digit' | 'equals';

export interface KeyDefinition {
  id: string;
  label: string;
  ariaLabel: string;
  action: Action;
  variant: KeyVariant;
  shortcuts: readonly string[];
  gridSpan?: 'col-2' | 'row-2';
}

export const BINARY_OPERATION_SYMBOLS: Readonly<
  Record<BinaryOperation, string>
> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
  power: '^',
};

/**
 * Keypad layout ordered for a 4-column x 6-row CSS Grid as specified in
 * implementation_plan.md section 5:
 *
 *   AC   ⌫    %    ÷
 *   √    xʸ   ±    ×
 *   7    8    9    −
 *   4    5    6    +
 *   1    2    3    =
 *   0 (2 col) .    =   (= spans 2 rows)
 */
export const KEYPAD_KEYS: readonly KeyDefinition[] = [
  // Row 1
  {
    id: 'clear',
    label: 'AC',
    ariaLabel: 'all clear',
    action: { type: 'clear' },
    variant: 'utility',
    shortcuts: ['Escape'],
  },
  {
    id: 'backspace',
    label: '⌫',
    ariaLabel: 'backspace',
    action: { type: 'backspace' },
    variant: 'utility',
    shortcuts: ['Backspace'],
  },
  {
    id: 'percentage',
    label: '%',
    ariaLabel: 'percentage',
    action: { type: 'unaryOp', operation: 'percentage' },
    variant: 'utility',
    shortcuts: ['%'],
  },
  {
    id: 'divide',
    label: '÷',
    ariaLabel: 'divide',
    action: { type: 'binaryOp', operation: 'divide' },
    variant: 'operator',
    shortcuts: ['/'],
  },

  // Row 2
  {
    id: 'sqrt',
    label: '√',
    ariaLabel: 'square root',
    action: { type: 'unaryOp', operation: 'sqrt' },
    variant: 'utility',
    shortcuts: [],
  },
  {
    id: 'power',
    label: 'xʸ',
    ariaLabel: 'power',
    action: { type: 'binaryOp', operation: 'power' },
    variant: 'utility',
    shortcuts: ['^'],
  },
  {
    id: 'toggle-sign',
    label: '±',
    ariaLabel: 'toggle sign',
    action: { type: 'toggleSign' },
    variant: 'utility',
    shortcuts: [],
  },
  {
    id: 'multiply',
    label: '×',
    ariaLabel: 'multiply',
    action: { type: 'binaryOp', operation: 'multiply' },
    variant: 'operator',
    shortcuts: ['*'],
  },

  // Row 3
  {
    id: 'digit-7',
    label: '7',
    ariaLabel: '7',
    action: { type: 'digit', digit: '7' },
    variant: 'digit',
    shortcuts: ['7'],
  },
  {
    id: 'digit-8',
    label: '8',
    ariaLabel: '8',
    action: { type: 'digit', digit: '8' },
    variant: 'digit',
    shortcuts: ['8'],
  },
  {
    id: 'digit-9',
    label: '9',
    ariaLabel: '9',
    action: { type: 'digit', digit: '9' },
    variant: 'digit',
    shortcuts: ['9'],
  },
  {
    id: 'subtract',
    label: '−',
    ariaLabel: 'subtract',
    action: { type: 'binaryOp', operation: 'subtract' },
    variant: 'operator',
    shortcuts: ['-'],
  },

  // Row 4
  {
    id: 'digit-4',
    label: '4',
    ariaLabel: '4',
    action: { type: 'digit', digit: '4' },
    variant: 'digit',
    shortcuts: ['4'],
  },
  {
    id: 'digit-5',
    label: '5',
    ariaLabel: '5',
    action: { type: 'digit', digit: '5' },
    variant: 'digit',
    shortcuts: ['5'],
  },
  {
    id: 'digit-6',
    label: '6',
    ariaLabel: '6',
    action: { type: 'digit', digit: '6' },
    variant: 'digit',
    shortcuts: ['6'],
  },
  {
    id: 'add',
    label: '+',
    ariaLabel: 'add',
    action: { type: 'binaryOp', operation: 'add' },
    variant: 'operator',
    shortcuts: ['+'],
  },

  // Row 5
  {
    id: 'digit-1',
    label: '1',
    ariaLabel: '1',
    action: { type: 'digit', digit: '1' },
    variant: 'digit',
    shortcuts: ['1'],
  },
  {
    id: 'digit-2',
    label: '2',
    ariaLabel: '2',
    action: { type: 'digit', digit: '2' },
    variant: 'digit',
    shortcuts: ['2'],
  },
  {
    id: 'digit-3',
    label: '3',
    ariaLabel: '3',
    action: { type: 'digit', digit: '3' },
    variant: 'digit',
    shortcuts: ['3'],
  },
  {
    id: 'equals',
    label: '=',
    ariaLabel: 'equals',
    action: { type: 'equals' },
    variant: 'equals',
    shortcuts: ['Enter', '='],
    gridSpan: 'row-2',
  },

  // Row 6
  {
    id: 'digit-0',
    label: '0',
    ariaLabel: '0',
    action: { type: 'digit', digit: '0' },
    variant: 'digit',
    shortcuts: ['0'],
    gridSpan: 'col-2',
  },
  {
    id: 'decimal',
    label: '.',
    ariaLabel: 'decimal point',
    action: { type: 'decimal' },
    variant: 'digit',
    shortcuts: ['.'],
  },
];

const SHORTCUT_MAP: ReadonlyMap<string, Action> = new Map(
  KEYPAD_KEYS.flatMap((keyDef) =>
    keyDef.shortcuts.map((shortcut) => [shortcut, keyDef.action] as const),
  ),
);

/**
 * Maps a physical keyboard `KeyboardEvent.key` value to a calculator reducer
 * `Action`, or `null` if the key is not bound.
 */
export function mapKeyboardKeyToAction(key: string): Action | null {
  if (key.length === 1 && key >= '0' && key <= '9') {
    return { type: 'digit', digit: key as Digit };
  }
  return SHORTCUT_MAP.get(key) ?? null;
}
