package api

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"math"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Juan-Vergara/sezzle-calculator/backend/internal/calculator"
)

func init() {
	// Silence structured logs during unit tests to keep test output clean.
	slog.SetDefault(slog.New(slog.NewTextHandler(io.Discard, nil)))
}

func TestOperationsSuccess(t *testing.T) {
	router := NewRouter()

	tests := []struct {
		name string
		path string
		body string
		want float64
	}{
		{"add", "/api/v1/add", `{"a": 12.5, "b": 7.5}`, 20},
		{"add zero operands", "/api/v1/add", `{"a": 0, "b": 0}`, 0},
		{"subtract", "/api/v1/subtract", `{"a": 10, "b": 15}`, -5},
		{"multiply", "/api/v1/multiply", `{"a": 6, "b": 7}`, 42},
		{"multiply normalizes negative zero", "/api/v1/multiply", `{"a": -1, "b": 0}`, 0},
		{"divide", "/api/v1/divide", `{"a": 22, "b": 4}`, 5.5},
		{"power", "/api/v1/power", `{"a": 2, "b": 10}`, 1024},
		{"sqrt", "/api/v1/sqrt", `{"a": 81}`, 9},
		{"sqrt zero", "/api/v1/sqrt", `{"a": 0}`, 0},
		{"percentage", "/api/v1/percentage", `{"a": 50}`, 0.5},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, tc.path, strings.NewReader(tc.body))
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()

			router.ServeHTTP(rec, req)

			if rec.Code != http.StatusOK {
				t.Fatalf("status = %d, want %d; body = %s", rec.Code, http.StatusOK, rec.Body.String())
			}
			if gotCT := rec.Header().Get("Content-Type"); gotCT != "application/json" {
				t.Errorf("Content-Type = %q, want %q", gotCT, "application/json")
			}

			var resp calculationResponse
			if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
				t.Fatalf("failed to decode response JSON: %v", err)
			}
			if resp.Result != tc.want || math.Signbit(resp.Result) != math.Signbit(tc.want) {
				t.Errorf("result = %v, want %v", resp.Result, tc.want)
			}
		})
	}
}

func TestOperationErrors(t *testing.T) {
	router := NewRouter()

	oversizedBody := `{"a": 1, "b": 2, "pad": "` + strings.Repeat("x", maxBodyBytes+100) + `"}`

	tests := []struct {
		name       string
		method     string
		path       string
		body       string
		wantStatus int
		wantCode   string
		wantAllow  string
	}{
		// 400 INVALID_REQUEST
		{"empty body", http.MethodPost, "/api/v1/add", "", http.StatusBadRequest, CodeInvalidRequest, ""},
		{"whitespace only body", http.MethodPost, "/api/v1/add", "   \n\t  ", http.StatusBadRequest, CodeInvalidRequest, ""},
		{"malformed JSON", http.MethodPost, "/api/v1/add", `{"a": 1,`, http.StatusBadRequest, CodeInvalidRequest, ""},
		{"malformed field syntax", http.MethodPost, "/api/v1/add", `{"a": tru}`, http.StatusBadRequest, CodeInvalidRequest, ""},
		{"root JSON null", http.MethodPost, "/api/v1/add", `null`, http.StatusBadRequest, CodeInvalidRequest, ""},
		{"root JSON array", http.MethodPost, "/api/v1/add", `[1, 2]`, http.StatusBadRequest, CodeInvalidRequest, ""},
		{"root JSON number", http.MethodPost, "/api/v1/add", `42`, http.StatusBadRequest, CodeInvalidRequest, ""},
		{"unknown field", http.MethodPost, "/api/v1/add", `{"a": 1, "b": 2, "extra": 3}`, http.StatusBadRequest, CodeInvalidRequest, ""},
		{"trailing JSON object", http.MethodPost, "/api/v1/add", `{"a": 1, "b": 2}{"a": 3, "b": 4}`, http.StatusBadRequest, CodeInvalidRequest, ""},
		{"trailing garbage", http.MethodPost, "/api/v1/add", `{"a": 1, "b": 2} trailing`, http.StatusBadRequest, CodeInvalidRequest, ""},
		{"extra operand b on sqrt", http.MethodPost, "/api/v1/sqrt", `{"a": 4, "b": 2}`, http.StatusBadRequest, CodeInvalidRequest, ""},
		{"extra operand b on percentage", http.MethodPost, "/api/v1/percentage", `{"a": 50, "b": 10}`, http.StatusBadRequest, CodeInvalidRequest, ""},

		// 400 MISSING_OPERAND
		{"empty object on binary op", http.MethodPost, "/api/v1/add", `{}`, http.StatusBadRequest, CodeMissingOperand, ""},
		{"missing b on binary op", http.MethodPost, "/api/v1/add", `{"a": 5}`, http.StatusBadRequest, CodeMissingOperand, ""},
		{"missing a on binary op", http.MethodPost, "/api/v1/add", `{"b": 5}`, http.StatusBadRequest, CodeMissingOperand, ""},
		{"empty object on unary sqrt", http.MethodPost, "/api/v1/sqrt", `{}`, http.StatusBadRequest, CodeMissingOperand, ""},
		{"empty object on unary percentage", http.MethodPost, "/api/v1/percentage", `{}`, http.StatusBadRequest, CodeMissingOperand, ""},

		// 400 INVALID_OPERAND
		{"string operand a", http.MethodPost, "/api/v1/add", `{"a": "5", "b": 2}`, http.StatusBadRequest, CodeInvalidOperand, ""},
		{"string operand b", http.MethodPost, "/api/v1/add", `{"a": 5, "b": "2"}`, http.StatusBadRequest, CodeInvalidOperand, ""},
		{"null operand a", http.MethodPost, "/api/v1/add", `{"a": null, "b": 2}`, http.StatusBadRequest, CodeInvalidOperand, ""},
		{"null operand b", http.MethodPost, "/api/v1/add", `{"a": 2, "b": null}`, http.StatusBadRequest, CodeInvalidOperand, ""},
		{"null operand on sqrt", http.MethodPost, "/api/v1/sqrt", `{"a": null}`, http.StatusBadRequest, CodeInvalidOperand, ""},
		{"boolean operand", http.MethodPost, "/api/v1/add", `{"a": true, "b": 2}`, http.StatusBadRequest, CodeInvalidOperand, ""},
		{"array operand", http.MethodPost, "/api/v1/add", `{"a": [1], "b": 2}`, http.StatusBadRequest, CodeInvalidOperand, ""},
		{"object operand", http.MethodPost, "/api/v1/add", `{"a": {}, "b": 2}`, http.StatusBadRequest, CodeInvalidOperand, ""},
		{"float64 overflow in input", http.MethodPost, "/api/v1/add", `{"a": 1e400, "b": 1}`, http.StatusBadRequest, CodeInvalidOperand, ""},

		// 413 PAYLOAD_TOO_LARGE
		{"payload exceeds 1 KiB", http.MethodPost, "/api/v1/add", oversizedBody, http.StatusRequestEntityTooLarge, CodePayloadTooLarge, ""},

		// 422 Domain errors
		{"division by zero", http.MethodPost, "/api/v1/divide", `{"a": 10, "b": 0}`, http.StatusUnprocessableEntity, CodeDivisionByZero, ""},
		{"negative square root", http.MethodPost, "/api/v1/sqrt", `{"a": -9}`, http.StatusUnprocessableEntity, CodeNegativeSquareRoot, ""},
		{"result out of range power", http.MethodPost, "/api/v1/power", `{"a": 10, "b": 400}`, http.StatusUnprocessableEntity, CodeResultOutOfRange, ""},
		{"result out of range zero to negative", http.MethodPost, "/api/v1/power", `{"a": 0, "b": -1}`, http.StatusUnprocessableEntity, CodeResultOutOfRange, ""},
		{"undefined result negative fractional power", http.MethodPost, "/api/v1/power", `{"a": -8, "b": 0.5}`, http.StatusUnprocessableEntity, CodeUndefinedResult, ""},

		// 404 NOT_FOUND
		{"unknown v1 operation", http.MethodPost, "/api/v1/modulo", `{"a": 5, "b": 2}`, http.StatusNotFound, CodeNotFound, ""},
		{"unknown api path", http.MethodGet, "/api/unknown", "", http.StatusNotFound, CodeNotFound, ""},
		{"unknown root path", http.MethodGet, "/nonexistent", "", http.StatusNotFound, CodeNotFound, ""},

		// 405 METHOD_NOT_ALLOWED
		{"GET on add", http.MethodGet, "/api/v1/add", "", http.StatusMethodNotAllowed, CodeMethodNotAllowed, http.MethodPost},
		{"PUT on divide", http.MethodPut, "/api/v1/divide", `{"a": 4, "b": 2}`, http.StatusMethodNotAllowed, CodeMethodNotAllowed, http.MethodPost},
		{"DELETE on sqrt", http.MethodDelete, "/api/v1/sqrt", "", http.StatusMethodNotAllowed, CodeMethodNotAllowed, http.MethodPost},
		{"POST on healthz", http.MethodPost, "/healthz", `{}`, http.StatusMethodNotAllowed, CodeMethodNotAllowed, http.MethodGet},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(tc.method, tc.path, strings.NewReader(tc.body))
			rec := httptest.NewRecorder()

			router.ServeHTTP(rec, req)

			if rec.Code != tc.wantStatus {
				t.Fatalf("status = %d, want %d; body = %s", rec.Code, tc.wantStatus, rec.Body.String())
			}
			if gotCT := rec.Header().Get("Content-Type"); gotCT != "application/json" {
				t.Errorf("Content-Type = %q, want %q", gotCT, "application/json")
			}
			if tc.wantAllow != "" {
				if gotAllow := rec.Header().Get("Allow"); gotAllow != tc.wantAllow {
					t.Errorf("Allow = %q, want %q", gotAllow, tc.wantAllow)
				}
			}

			var env errorEnvelope
			if err := json.NewDecoder(rec.Body).Decode(&env); err != nil {
				t.Fatalf("failed to decode error envelope: %v", err)
			}
			if env.Error.Code != tc.wantCode {
				t.Errorf("error.code = %q, want %q", env.Error.Code, tc.wantCode)
			}
			if strings.TrimSpace(env.Error.Message) == "" {
				t.Error("error.message must not be empty")
			}
		})
	}
}

func TestHealthz(t *testing.T) {
	router := NewRouter()

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
	}
	if gotCT := rec.Header().Get("Content-Type"); gotCT != "application/json" {
		t.Errorf("Content-Type = %q, want %q", gotCT, "application/json")
	}

	var resp healthResponse
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode healthz response: %v", err)
	}
	if resp.Status != "ok" {
		t.Errorf("status = %q, want %q", resp.Status, "ok")
	}
}

func TestRecoverMiddlewareReturns500JSON(t *testing.T) {
	panicking := loggingMiddleware(recoverMiddleware(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		panic("simulated unexpected panic")
	})))

	req := httptest.NewRequest(http.MethodPost, "/api/v1/add", bytes.NewBufferString(`{"a":1,"b":2}`))
	rec := httptest.NewRecorder()

	panicking.ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusInternalServerError)
	}
	if gotCT := rec.Header().Get("Content-Type"); gotCT != "application/json" {
		t.Errorf("Content-Type = %q, want %q", gotCT, "application/json")
	}

	var env errorEnvelope
	if err := json.NewDecoder(rec.Body).Decode(&env); err != nil {
		t.Fatalf("failed to decode error envelope: %v", err)
	}
	if env.Error.Code != CodeInternalError {
		t.Errorf("error.code = %q, want %q", env.Error.Code, CodeInternalError)
	}
}

type failingReader struct{}

func (failingReader) Read([]byte) (int, error) {
	return 0, errors.New("simulated read error")
}

func TestDecodeReadFailureAndErrorMappingFallbacks(t *testing.T) {
	// 1. Non-MaxBytesReader I/O error while reading request body -> 400 INVALID_REQUEST
	h := operationHandler(calculator.Operation{Name: "add", Arity: 2})
	req := httptest.NewRequest(http.MethodPost, "/api/v1/add", failingReader{})
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("read failure status = %d, want %d", rec.Code, http.StatusBadRequest)
	}

	// 2. Unknown operation in operationHandler -> 404 NOT_FOUND
	unknownHandler := operationHandler(calculator.Operation{Name: "nonexistent", Arity: 1})
	reqUnknown := httptest.NewRequest(http.MethodPost, "/api/v1/nonexistent", strings.NewReader(`{"a": 1}`))
	recUnknown := httptest.NewRecorder()
	unknownHandler.ServeHTTP(recUnknown, reqUnknown)

	if recUnknown.Code != http.StatusNotFound {
		t.Fatalf("unknown operation status = %d, want %d", recUnknown.Code, http.StatusNotFound)
	}

	// 3. Unexpected generic error in writeError -> 500 INTERNAL_ERROR
	recInternal := httptest.NewRecorder()
	writeError(recInternal, errors.New("unexpected internal failure"))
	if recInternal.Code != http.StatusInternalServerError {
		t.Fatalf("fallback writeError status = %d, want %d", recInternal.Code, http.StatusInternalServerError)
	}
}
