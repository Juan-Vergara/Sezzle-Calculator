import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NETWORK_ERROR_MESSAGE } from '../api/client';
import { Calculator } from './Calculator';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Calculator integration (UI + useCalculator + API client)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('evaluates `1 2 + 3 =` -> `15` via POST /api/v1/add {"a":12,"b":3}', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(async () => jsonResponse({ result: 15 }));
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    render(<Calculator />);

    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('12');

    await user.click(screen.getByRole('button', { name: 'add' }));
    expect(screen.getByTestId('calculator-expression')).toHaveTextContent(
      '12 +',
    );

    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: 'equals' }));

    await waitFor(() => {
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('15');
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/v1/add');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ a: 12, b: 3 });
  });

  it('evaluates `2 + 3 × 4 =` -> `20` using immediate left-to-right execution (2 API calls)', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async () => jsonResponse({ result: 5 }))
      .mockImplementationOnce(async () => jsonResponse({ result: 20 }));
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    render(<Calculator />);

    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: 'add' }));
    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: 'multiply' }));

    await waitFor(() => {
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('5');
    });
    expect(screen.getByTestId('calculator-expression')).toHaveTextContent(
      '5 ×',
    );

    await user.click(screen.getByRole('button', { name: '4' }));
    await user.click(screen.getByRole('button', { name: 'equals' }));

    await waitFor(() => {
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('20');
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/v1/add');
    expect(
      JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string),
    ).toEqual({ a: 2, b: 3 });
    expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/v1/multiply');
    expect(
      JSON.parse((fetchMock.mock.calls[1]?.[1] as RequestInit).body as string),
    ).toEqual({ a: 5, b: 4 });
  });

  it('evaluates unary `9 √` -> `3` via POST /api/v1/sqrt {"a":9}', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(async () => jsonResponse({ result: 3 }));
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    render(<Calculator />);

    await user.click(screen.getByRole('button', { name: '9' }));
    await user.click(screen.getByRole('button', { name: 'square root' }));

    await waitFor(() => {
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('3');
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/v1/sqrt');
    expect(
      JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string),
    ).toEqual({ a: 9 });
  });

  it('evaluates unary `%` and preserves pending binary operation (`50 + 10 % =` -> `50.1`) via POST /api/v1/percentage {"a":10}', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async () => jsonResponse({ result: 0.1 }))
      .mockImplementationOnce(async () => jsonResponse({ result: 50.1 }));
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    render(<Calculator />);

    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: '0' }));
    await user.click(screen.getByRole('button', { name: 'add' }));
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '0' }));
    await user.click(screen.getByRole('button', { name: 'percentage' }));

    await waitFor(() => {
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('0.1');
    });
    expect(screen.getByTestId('calculator-expression')).toHaveTextContent(
      '50 +',
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/v1/percentage');
    expect(
      JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string),
    ).toEqual({ a: 10 });

    await user.click(screen.getByRole('button', { name: 'equals' }));

    await waitFor(() => {
      expect(screen.getByTestId('calculator-display')).toHaveTextContent(
        '50.1',
      );
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/v1/add');
    expect(
      JSON.parse((fetchMock.mock.calls[1]?.[1] as RequestInit).body as string),
    ).toEqual({ a: 50, b: 0.1 });
  });

  it('displays the backend error message on `8 ÷ 0 =` and recovers when a digit is pressed', async () => {
    const fetchMock = vi.fn().mockImplementation(async () =>
      jsonResponse(
        {
          error: {
            code: 'DIVISION_BY_ZERO',
            message: 'division by zero is not allowed',
          },
        },
        422,
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    render(<Calculator />);

    await user.click(screen.getByRole('button', { name: '8' }));
    await user.click(screen.getByRole('button', { name: 'divide' }));
    await user.click(screen.getByRole('button', { name: '0' }));
    await user.click(screen.getByRole('button', { name: 'equals' }));

    await waitFor(() => {
      expect(screen.getByTestId('calculator-display')).toHaveTextContent(
        'division by zero is not allowed',
      );
    });

    // Pressing a digit clears the error and starts a new entry
    await user.click(screen.getByRole('button', { name: '4' }));
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('4');
  });

  it('displays the network error message when the backend is unreachable', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    render(<Calculator />);

    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: 'percentage' }));

    await waitFor(() => {
      expect(screen.getByTestId('calculator-display')).toHaveTextContent(
        NETWORK_ERROR_MESSAGE,
      );
    });
  });

  it('disables all keypad buttons except AC during loading and prevents cancelled or stale requests from overwriting cleared or newer operations', async () => {
    let resolveFirst!: (value: Response) => void;
    let rejectSecond!: (reason?: unknown) => void;
    let resolveThird!: (value: Response) => void;

    const fetchMock = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise<Response>((_, reject) => {
            rejectSecond = reject;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveThird = resolve;
          }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    render(<Calculator />);

    // 1. Start request #1 (`9 √`)
    await user.click(screen.getByRole('button', { name: '9' }));
    await user.click(screen.getByRole('button', { name: 'square root' }));

    // While request #1 is pending, all buttons except AC must be disabled
    expect(screen.getByRole('button', { name: '7' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'add' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'equals' })).toBeDisabled();
    const acButton = screen.getByRole('button', { name: 'all clear' });
    expect(acButton).not.toBeDisabled();

    const firstSignal = (fetchMock.mock.calls[0]?.[1] as RequestInit).signal;
    expect(firstSignal?.aborted).toBe(false);

    // Clicking AC aborts request #1 and resets to ready state
    await user.click(acButton);
    expect(firstSignal?.aborted).toBe(true);
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');
    expect(screen.getByRole('button', { name: '7' })).not.toBeDisabled();

    // 2. Start request #2 (`5 %`), then cancel with AC; late failure of #2 must not overwrite cleared state
    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: 'percentage' }));
    await user.click(acButton);
    rejectSecond(new TypeError('Late network failure'));
    await Promise.resolve();
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');

    // 3. Start request #3 (`4 √`); late success from request #1 must not overwrite request #3
    await user.click(screen.getByRole('button', { name: '4' }));
    await user.click(screen.getByRole('button', { name: 'square root' }));

    resolveFirst(jsonResponse({ result: 999 }));
    await Promise.resolve();
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('4');

    resolveThird(jsonResponse({ result: 2 }));
    await waitFor(() => {
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('2');
    });
  });

  it('supports physical keyboard input `7 * 6 Enter` -> `42` and scales display font classes for long numbers', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(async () => jsonResponse({ result: 42 }));
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    render(<Calculator />);

    // Unmapped keys and Ctrl/Alt/Meta shortcuts are ignored
    await user.keyboard('a{Control>}7{/Control}');
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');

    // Type 14 digits to exercise compact and small display size classes, then Escape (AC)
    await user.keyboard('1234567890');
    expect(screen.getByTestId('calculator-display')).toHaveClass(
      'display-value--compact',
    );
    await user.keyboard('1234');
    expect(screen.getByTestId('calculator-display')).toHaveClass(
      'display-value--small',
    );
    await user.keyboard('{Escape}');
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');

    // Execute `7 * 6 Enter` -> `42`
    await user.keyboard('7*6{Enter}');

    await waitFor(() => {
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('42');
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/v1/multiply');
    expect(
      JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string),
    ).toEqual({ a: 7, b: 6 });
  });
});
