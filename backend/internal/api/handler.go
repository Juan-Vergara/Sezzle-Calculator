package api

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/Juan-Vergara/sezzle-calculator/backend/internal/calculator"
)

// maxBodyBytes caps request payloads at 1 KiB as specified in the API contract.
const maxBodyBytes = 1024

type calculationResponse struct {
	Result float64 `json:"result"`
}

type healthResponse struct {
	Status string `json:"status"`
}

type calculationRequest struct {
	A operandField `json:"a"`
	B operandField `json:"b"`
}

// operandField wraps a *float64 so that omitted fields remain nil while an
// explicit JSON null or non-numeric token is rejected as errInvalidOperand.
type operandField struct {
	Value *float64
}

func (o *operandField) UnmarshalJSON(data []byte) error {
	trimmed := bytes.TrimSpace(data)
	if bytes.Equal(trimmed, []byte("null")) {
		return fmt.Errorf("%w: null is not a valid number", errInvalidOperand)
	}

	var v float64
	if err := json.Unmarshal(trimmed, &v); err != nil {
		var typeErr *json.UnmarshalTypeError
		if errors.As(err, &typeErr) || errors.Is(err, strconv.ErrRange) {
			return fmt.Errorf("%w: must be a finite float64 number", errInvalidOperand)
		}
		return fmt.Errorf("%w: invalid operand", errInvalidOperand)
	}

	o.Value = &v
	return nil
}

// operationHandler returns the single generic HTTP handler used by all
// calculator operation endpoints.
func operationHandler(op calculator.Operation) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		operands, err := decodeOperands(w, r, op.Arity)
		if err != nil {
			writeError(w, err)
			return
		}

		result, err := calculator.Calculate(op.Name, operands...)
		if err != nil {
			writeError(w, err)
			return
		}

		writeJSON(w, http.StatusOK, calculationResponse{Result: result})
	}
}

func decodeOperands(w http.ResponseWriter, r *http.Request, arity int) ([]float64, error) {
	limited := http.MaxBytesReader(w, r.Body, maxBodyBytes)
	raw, err := io.ReadAll(limited)
	if err != nil {
		var maxBytesErr *http.MaxBytesError
		if errors.As(err, &maxBytesErr) {
			return nil, errPayloadTooLarge
		}
		return nil, errInvalidRequest
	}

	trimmed := bytes.TrimSpace(raw)
	if len(trimmed) == 0 || trimmed[0] != '{' {
		return nil, fmt.Errorf("%w: request body must be a JSON object", errInvalidRequest)
	}

	dec := json.NewDecoder(bytes.NewReader(trimmed))
	dec.DisallowUnknownFields()

	var req calculationRequest
	if err := dec.Decode(&req); err != nil {
		if errors.Is(err, errInvalidOperand) {
			return nil, err
		}
		return nil, fmt.Errorf("%w: malformed JSON payload", errInvalidRequest)
	}

	// Ensure there is no trailing data after the first JSON object.
	if err := dec.Decode(&struct{}{}); err != io.EOF {
		return nil, fmt.Errorf("%w: unexpected trailing data after JSON object", errInvalidRequest)
	}

	if arity == 1 {
		if req.B.Value != nil {
			return nil, fmt.Errorf("%w: unary operation does not accept operand 'b'", errInvalidRequest)
		}
		if req.A.Value == nil {
			return nil, fmt.Errorf("%w: operand 'a' is required", errMissingOperand)
		}
		return []float64{*req.A.Value}, nil
	}

	if req.A.Value == nil {
		return nil, fmt.Errorf("%w: operand 'a' is required", errMissingOperand)
	}
	if req.B.Value == nil {
		return nil, fmt.Errorf("%w: operand 'b' is required", errMissingOperand)
	}
	return []float64{*req.A.Value, *req.B.Value}, nil
}

func healthHandler(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, healthResponse{Status: "ok"})
}
