import {
  type ApiErrorEnvelope,
  type CalculationRequestPayload,
  type CalculationSuccessResponse,
  type Operation,
  isUnaryOperation,
} from '../calculator/types';

export const NETWORK_ERROR_MESSAGE = 'Cannot reach the calculator service.';
export const UNEXPECTED_RESPONSE_MESSAGE = 'Unexpected server response.';

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

function buildPayload(
  operation: Operation,
  operands: readonly number[],
): CalculationRequestPayload {
  if (isUnaryOperation(operation)) {
    if (operands.length !== 1) {
      throw new ApiError(
        'INVALID_REQUEST',
        `Unary operation '${operation}' requires exactly 1 operand.`,
        400,
      );
    }
    return { a: operands[0] };
  }

  if (operands.length !== 2) {
    throw new ApiError(
      'INVALID_REQUEST',
      `Binary operation '${operation}' requires exactly 2 operands.`,
      400,
    );
  }
  return { a: operands[0], b: operands[1] };
}

function isAbortError(err: unknown, signal?: AbortSignal): boolean {
  if (signal?.aborted) {
    return true;
  }
  return err instanceof Error && err.name === 'AbortError';
}

function isErrorEnvelope(data: unknown): data is ApiErrorEnvelope {
  if (typeof data !== 'object' || data === null || !('error' in data)) {
    return false;
  }
  const errObj = (data as { error: unknown }).error;
  if (typeof errObj !== 'object' || errObj === null) {
    return false;
  }
  const { code, message } = errObj as { code?: unknown; message?: unknown };
  return (
    typeof code === 'string' &&
    code.trim().length > 0 &&
    typeof message === 'string' &&
    message.trim().length > 0
  );
}

function isSuccessResponse(data: unknown): data is CalculationSuccessResponse {
  if (typeof data !== 'object' || data === null || !('result' in data)) {
    return false;
  }
  const { result } = data as { result?: unknown };
  return typeof result === 'number' && Number.isFinite(result);
}

/**
 * Calls `POST /api/v1/{operation}` with the appropriate JSON payload and
 * returns the numeric result computed by the Go backend.
 */
export async function calculate(
  operation: Operation,
  operands: readonly number[],
  signal?: AbortSignal,
): Promise<number> {
  const payload = buildPayload(operation, operands);

  let response: Response;
  try {
    response = await fetch(`/api/v1/${operation}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err) {
    if (isAbortError(err, signal)) {
      throw err;
    }
    throw new ApiError('NETWORK_ERROR', NETWORK_ERROR_MESSAGE, 0);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (err) {
    if (isAbortError(err, signal)) {
      throw err;
    }
    throw new ApiError(
      'UNEXPECTED_RESPONSE',
      UNEXPECTED_RESPONSE_MESSAGE,
      response.status,
    );
  }

  if (!response.ok) {
    if (isErrorEnvelope(data)) {
      throw new ApiError(
        data.error.code,
        data.error.message,
        response.status,
      );
    }
    throw new ApiError(
      'UNEXPECTED_RESPONSE',
      UNEXPECTED_RESPONSE_MESSAGE,
      response.status,
    );
  }

  if (!isSuccessResponse(data)) {
    throw new ApiError(
      'UNEXPECTED_RESPONSE',
      UNEXPECTED_RESPONSE_MESSAGE,
      response.status,
    );
  }

  return data.result;
}
