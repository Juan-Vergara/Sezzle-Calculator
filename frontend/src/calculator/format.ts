/**
 * Maximum number of significant digits displayed on the calculator screen
 * (Decision D6 in implementation_plan.md).
 */
export const MAX_SIGNIFICANT_DIGITS = 15;

const EXP_UPPER_THRESHOLD = 1e15;
const EXP_LOWER_THRESHOLD = 1e-6;

/**
 * Formats a finite numeric result into a display string with at most 15
 * significant digits, eliminating IEEE 754 binary floating-point noise
 * (such as `0.1 + 0.2 -> "0.3"`) and normalizing `-0` to `"0"`.
 */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value) || value === 0) {
    return '0';
  }

  const rounded = Number(value.toPrecision(MAX_SIGNIFICANT_DIGITS));
  if (rounded === 0) {
    return '0';
  }

  const abs = Math.abs(rounded);
  if (abs >= EXP_UPPER_THRESHOLD || abs < EXP_LOWER_THRESHOLD) {
    return rounded.toExponential();
  }

  return String(rounded);
}
