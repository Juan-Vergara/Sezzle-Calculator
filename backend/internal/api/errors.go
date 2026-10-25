// Package api implements the HTTP transport layer for the calculator service.
package api

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/Juan-Vergara/sezzle-calculator/backend/internal/calculator"
)

// Machine-readable error codes defined by the API contract.
const (
	CodeInvalidRequest     = "INVALID_REQUEST"
	CodeMissingOperand     = "MISSING_OPERAND"
	CodeInvalidOperand     = "INVALID_OPERAND"
	CodePayloadTooLarge    = "PAYLOAD_TOO_LARGE"
	CodeDivisionByZero     = "DIVISION_BY_ZERO"
	CodeNegativeSquareRoot = "NEGATIVE_SQUARE_ROOT"
	CodeResultOutOfRange   = "RESULT_OUT_OF_RANGE"
	CodeUndefinedResult    = "UNDEFINED_RESULT"
	CodeNotFound           = "NOT_FOUND"
	CodeMethodNotAllowed   = "METHOD_NOT_ALLOWED"
	CodeInternalError      = "INTERNAL_ERROR"
)

// Transport-level validation sentinel errors.
var (
	errInvalidRequest  = errors.New("invalid request payload")
	errMissingOperand  = errors.New("missing required operand")
	errInvalidOperand  = errors.New("operand must be a finite number")
	errPayloadTooLarge = errors.New("request body exceeds 1 KiB limit")
)

type errorEnvelope struct {
	Error apiError `json:"error"`
}

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// writeJSON serializes v as JSON with the given HTTP status code.
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// writeErrorEnvelope writes a standardized JSON error response with an explicit
// HTTP status, error code, and human-readable message.
func writeErrorEnvelope(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, errorEnvelope{
		Error: apiError{
			Code:    code,
			Message: message,
		},
	})
}

// writeError is the single place that maps domain and request validation errors
// to HTTP status codes and API error envelopes.
func writeError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, errPayloadTooLarge):
		writeErrorEnvelope(w, http.StatusRequestEntityTooLarge, CodePayloadTooLarge, err.Error())
	case errors.Is(err, errMissingOperand):
		writeErrorEnvelope(w, http.StatusBadRequest, CodeMissingOperand, err.Error())
	case errors.Is(err, errInvalidOperand), errors.Is(err, calculator.ErrInvalidOperand):
		writeErrorEnvelope(w, http.StatusBadRequest, CodeInvalidOperand, err.Error())
	case errors.Is(err, errInvalidRequest), errors.Is(err, calculator.ErrArity):
		writeErrorEnvelope(w, http.StatusBadRequest, CodeInvalidRequest, err.Error())
	case errors.Is(err, calculator.ErrDivisionByZero):
		writeErrorEnvelope(w, http.StatusUnprocessableEntity, CodeDivisionByZero, calculator.ErrDivisionByZero.Error())
	case errors.Is(err, calculator.ErrNegativeSqrt):
		writeErrorEnvelope(w, http.StatusUnprocessableEntity, CodeNegativeSquareRoot, calculator.ErrNegativeSqrt.Error())
	case errors.Is(err, calculator.ErrOutOfRange):
		writeErrorEnvelope(w, http.StatusUnprocessableEntity, CodeResultOutOfRange, calculator.ErrOutOfRange.Error())
	case errors.Is(err, calculator.ErrUndefinedResult):
		writeErrorEnvelope(w, http.StatusUnprocessableEntity, CodeUndefinedResult, calculator.ErrUndefinedResult.Error())
	case errors.Is(err, calculator.ErrUnknownOperation):
		writeErrorEnvelope(w, http.StatusNotFound, CodeNotFound, "endpoint not found")
	default:
		writeErrorEnvelope(w, http.StatusInternalServerError, CodeInternalError, "internal server error")
	}
}
