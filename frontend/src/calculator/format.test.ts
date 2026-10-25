import { formatNumber, MAX_SIGNIFICANT_DIGITS } from './format';

describe('formatNumber', () => {
  it('formats positive and negative integers', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(42)).toBe('42');
    expect(formatNumber(-1024)).toBe('-1024');
    expect(formatNumber(123456789012345)).toBe('123456789012345');
  });

  it('normalizes negative zero and non-finite numbers to "0"', () => {
    expect(formatNumber(-0)).toBe('0');
    expect(formatNumber(Number.NaN)).toBe('0');
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('0');
    expect(formatNumber(Number.NEGATIVE_INFINITY)).toBe('0');
  });

  it('strips IEEE 754 floating-point representation noise within 15 significant digits', () => {
    expect(formatNumber(0.1 + 0.2)).toBe('0.3');
    expect(formatNumber(0.3 - 0.1)).toBe('0.2');
    expect(formatNumber(-0.1 - 0.2)).toBe('-0.3');
  });

  it('caps repeating decimals to 15 significant digits', () => {
    const formatted = formatNumber(1 / 3);
    expect(formatted).toBe('0.333333333333333');
    expect(formatted.replace('0.', '').length).toBe(MAX_SIGNIFICANT_DIGITS);
  });

  it('formats ordinary negative and positive decimals cleanly', () => {
    expect(formatNumber(12.5)).toBe('12.5');
    expect(formatNumber(-0.000125)).toBe('-0.000125');
    expect(formatNumber(0.000001)).toBe('0.000001');
  });

  it('uses exponential notation for very large numbers (>= 1e15)', () => {
    expect(formatNumber(1e15)).toBe('1e+15');
    expect(formatNumber(1.25e20)).toBe('1.25e+20');
    expect(formatNumber(-9.87654321e18)).toBe('-9.87654321e+18');
  });

  it('uses exponential notation for very small non-zero numbers (< 1e-6)', () => {
    expect(formatNumber(1e-7)).toBe('1e-7');
    expect(formatNumber(-2.5e-12)).toBe('-2.5e-12');
  });
});
