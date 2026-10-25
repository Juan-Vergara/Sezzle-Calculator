import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  calculate,
  NETWORK_ERROR_MESSAGE,
  UNEXPECTED_RESPONSE_MESSAGE,
} from './client';
import {
  type BinaryOperation,
  isBinaryOperation,
  isUnaryOperation,
  type UnaryOperation,
} from '../calculator/types';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('api/client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('sends POST /api/v1/{op} with {"a", "b"} for every binary operation and resolves result', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(async () => jsonResponse({ result: 15 }));
    vi.stubGlobal('fetch', fetchMock);

    const binaryOps: BinaryOperation[] = [
      'add',
      'subtract',
      'multiply',
      'divide',
      'power',
    ];

    for (const op of binaryOps) {
      expect(isBinaryOperation(op)).toBe(true);
      const result = await calculate(op, [12, 3]);
      expect(result).toBe(15);
      expect(fetchMock).toHaveBeenLastCalledWith(`/api/v1/${op}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 12, b: 3 }),
        signal: undefined,
      });
    }
  });

  it('sends POST /api/v1/{op} with {"a"} for every unary operation and resolves result', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(async () => jsonResponse({ result: 9 }));
    vi.stubGlobal('fetch', fetchMock);

    const unaryOps: UnaryOperation[] = ['sqrt', 'percentage'];

    for (const op of unaryOps) {
      expect(isUnaryOperation(op)).toBe(true);
      const result = await calculate(op, [81]);
      expect(result).toBe(9);
      expect(fetchMock).toHaveBeenLastCalledWith(`/api/v1/${op}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 81 }),
        signal: undefined,
      });
    }
  });

  it('parses the backend error envelope into an ApiError with status, code, and message', async () => {
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

    await expect(calculate('divide', [10, 0])).rejects.toEqual(
      new ApiError(
        'DIVISION_BY_ZERO',
        'division by zero is not allowed',
        422,
      ),
    );

    try {
      await calculate('divide', [10, 0]);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.code).toBe('DIVISION_BY_ZERO');
      expect(apiErr.message).toBe('division by zero is not allowed');
      expect(apiErr.status).toBe(422);
    }
  });

  it('maps network failures to ApiError with NETWORK_ERROR_MESSAGE', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(calculate('add', [1, 2])).rejects.toEqual(
      new ApiError('NETWORK_ERROR', NETWORK_ERROR_MESSAGE, 0),
    );
  });

  it('maps non-JSON 500 responses to ApiError with UNEXPECTED_RESPONSE_MESSAGE', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('Internal Server Error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(calculate('add', [1, 2])).rejects.toEqual(
      new ApiError('UNEXPECTED_RESPONSE', UNEXPECTED_RESPONSE_MESSAGE, 500),
    );
  });

  it('maps malformed error JSON or malformed 200 JSON to UNEXPECTED_RESPONSE', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: 'not-an-object' }, 500))
      .mockResolvedValueOnce(jsonResponse({ error: { code: '' } }, 400))
      .mockResolvedValueOnce(jsonResponse({ wrongKey: 123 }, 200))
      .mockResolvedValueOnce(jsonResponse(null, 200));
    vi.stubGlobal('fetch', fetchMock);

    await expect(calculate('add', [1, 2])).rejects.toMatchObject({
      code: 'UNEXPECTED_RESPONSE',
      message: UNEXPECTED_RESPONSE_MESSAGE,
      status: 500,
    });
    await expect(calculate('add', [1, 2])).rejects.toMatchObject({
      code: 'UNEXPECTED_RESPONSE',
      message: UNEXPECTED_RESPONSE_MESSAGE,
      status: 400,
    });
    await expect(calculate('add', [1, 2])).rejects.toMatchObject({
      code: 'UNEXPECTED_RESPONSE',
      message: UNEXPECTED_RESPONSE_MESSAGE,
      status: 200,
    });
    await expect(calculate('add', [1, 2])).rejects.toMatchObject({
      code: 'UNEXPECTED_RESPONSE',
      message: UNEXPECTED_RESPONSE_MESSAGE,
      status: 200,
    });
  });

  it('forwards AbortSignal and re-throws AbortError without wrapping it in ApiError', async () => {
    const controller = new AbortController();
    const abortError = new DOMException('The operation was aborted.', 'AbortError');
    const fetchMock = vi.fn().mockRejectedValue(abortError);
    vi.stubGlobal('fetch', fetchMock);

    controller.abort();

    await expect(
      calculate('add', [1, 2], controller.signal),
    ).rejects.toBe(abortError);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/add',
      expect.objectContaining({ signal: controller.signal }),
    );
  });

  it('rejects wrong operand counts before calling fetch', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(calculate('sqrt', [4, 2])).rejects.toMatchObject({
      code: 'INVALID_REQUEST',
      status: 400,
    });
    await expect(calculate('add', [4])).rejects.toMatchObject({
      code: 'INVALID_REQUEST',
      status: 400,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
