export type BinaryOperation =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'power';

export type UnaryOperation = 'sqrt' | 'percentage';

export type Operation = BinaryOperation | UnaryOperation;

export type Digit =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9';

export type CalculatorStatus = 'ready' | 'loading' | 'error';

export type RequestContinuation =
  | { type: 'chain'; nextOp: BinaryOperation }
  | { type: 'equals' }
  | { type: 'unary' };

export interface CalculationRequest {
  id: number;
  operation: Operation;
  operands: [number] | [number, number];
  then: RequestContinuation;
}

export interface CalculatorState {
  entry: string;
  accumulator: number | null;
  pendingOp: BinaryOperation | null;
  startNewEntry: boolean;
  awaitingSecondOperand: boolean;
  status: CalculatorStatus;
  error: string | null;
  request: CalculationRequest | null;
  lastRequestId: number;
}

export type Action =
  | { type: 'digit'; digit: Digit }
  | { type: 'decimal' }
  | { type: 'toggleSign' }
  | { type: 'backspace' }
  | { type: 'clear' }
  | { type: 'binaryOp'; operation: BinaryOperation }
  | { type: 'unaryOp'; operation: UnaryOperation }
  | { type: 'equals' }
  | { type: 'resolved'; requestId: number; result: number }
  | { type: 'failed'; requestId: number; message: string };

export interface BinaryRequestPayload {
  a: number;
  b: number;
}

export interface UnaryRequestPayload {
  a: number;
}

export type CalculationRequestPayload =
  | BinaryRequestPayload
  | UnaryRequestPayload;

export interface CalculationSuccessResponse {
  result: number;
}

export type ApiErrorCode =
  | 'INVALID_REQUEST'
  | 'MISSING_OPERAND'
  | 'INVALID_OPERAND'
  | 'PAYLOAD_TOO_LARGE'
  | 'DIVISION_BY_ZERO'
  | 'NEGATIVE_SQUARE_ROOT'
  | 'RESULT_OUT_OF_RANGE'
  | 'UNDEFINED_RESULT'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'UNEXPECTED_RESPONSE';

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
  };
}

export function isUnaryOperation(op: Operation): op is UnaryOperation {
  return op === 'sqrt' || op === 'percentage';
}

export function isBinaryOperation(op: Operation): op is BinaryOperation {
  return !isUnaryOperation(op);
}
