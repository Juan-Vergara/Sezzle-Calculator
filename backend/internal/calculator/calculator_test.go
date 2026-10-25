package calculator_test

import (
	"errors"
	"math"
	"slices"
	"testing"

	"github.com/Juan-Vergara/sezzle-calculator/backend/internal/calculator"
)

// negZero is IEEE 754 negative zero. A Go constant such as -0.0 cannot be
// used here because untyped constants have no negative zero.
var negZero = math.Copysign(0, -1)

func TestCalculate(t *testing.T) {
	tests := []struct {
		name     string
		op       string
		operands []float64
		want     float64
		wantErr  error
	}{
		// add
		{"add positives", "add", []float64{2, 3}, 5, nil},
		{"add negatives", "add", []float64{-2, -3}, -5, nil},
		{"add mixed signs", "add", []float64{-2, 3}, 1, nil},
		{"add zero identity", "add", []float64{5, 0}, 5, nil},
		{"add decimals", "add", []float64{1.25, 2.5}, 3.75, nil},
		{"add keeps float64 precision", "add", []float64{0.1, 0.2}, 0.30000000000000004, nil},
		{"add overflow", "add", []float64{math.MaxFloat64, math.MaxFloat64}, 0, calculator.ErrOutOfRange},

		// subtract
		{"subtract positives", "subtract", []float64{5, 3}, 2, nil},
		{"subtract to negative", "subtract", []float64{3, 5}, -2, nil},
		{"subtract negatives to zero", "subtract", []float64{-5, -5}, 0, nil},
		{"subtract zero identity", "subtract", []float64{5, 0}, 5, nil},
		{"subtract keeps float64 precision", "subtract", []float64{0.3, 0.1}, 0.19999999999999998, nil},
		{"subtract overflow", "subtract", []float64{-math.MaxFloat64, math.MaxFloat64}, 0, calculator.ErrOutOfRange},

		// multiply
		{"multiply decimals", "multiply", []float64{4, 2.5}, 10, nil},
		{"multiply mixed signs", "multiply", []float64{-3, 4}, -12, nil},
		{"multiply negatives", "multiply", []float64{-3, -4}, 12, nil},
		{"multiply one identity", "multiply", []float64{7, 1}, 7, nil},
		{"multiply by zero", "multiply", []float64{7, 0}, 0, nil},
		{"multiply normalizes negative zero", "multiply", []float64{-1, 0}, 0, nil},
		{"multiply overflow", "multiply", []float64{math.MaxFloat64, 2}, 0, calculator.ErrOutOfRange},

		// divide
		{"divide exact", "divide", []float64{10, 2}, 5, nil},
		{"divide negative dividend", "divide", []float64{-9, 3}, -3, nil},
		{"divide negative divisor", "divide", []float64{7, -2}, -3.5, nil},
		{"divide repeating decimal", "divide", []float64{1, 3}, 0.3333333333333333, nil},
		{"divide zero dividend", "divide", []float64{0, 5}, 0, nil},
		{"divide normalizes negative zero", "divide", []float64{0, -5}, 0, nil},
		{"divide by zero", "divide", []float64{10, 0}, 0, calculator.ErrDivisionByZero},
		{"divide zero by zero", "divide", []float64{0, 0}, 0, calculator.ErrDivisionByZero},
		{"divide by negative zero", "divide", []float64{1, negZero}, 0, calculator.ErrDivisionByZero},
		{"divide overflow", "divide", []float64{math.MaxFloat64, 0.1}, 0, calculator.ErrOutOfRange},

		// power
		{"power positive integer exponent", "power", []float64{2, 10}, 1024, nil},
		{"power negative base odd exponent", "power", []float64{-2, 3}, -8, nil},
		{"power negative base even exponent", "power", []float64{-2, 2}, 4, nil},
		{"power negative exponent", "power", []float64{2, -2}, 0.25, nil},
		{"power fractional exponent", "power", []float64{4, 0.5}, 2, nil},
		{"power zero exponent", "power", []float64{5, 0}, 1, nil},
		{"power zero to zero", "power", []float64{0, 0}, 1, nil},
		{"power zero base", "power", []float64{0, 5}, 0, nil},
		{"power underflow to zero", "power", []float64{10, -400}, 0, nil},
		{"power overflow", "power", []float64{10, 400}, 0, calculator.ErrOutOfRange},
		{"power zero to negative exponent", "power", []float64{0, -1}, 0, calculator.ErrOutOfRange},
		{"power negative zero to negative exponent", "power", []float64{negZero, -1}, 0, calculator.ErrOutOfRange},
		{"power negative base fractional exponent", "power", []float64{-8, 0.5}, 0, calculator.ErrUndefinedResult},
		{"power negative base cube root", "power", []float64{-8, 1.0 / 3}, 0, calculator.ErrUndefinedResult},

		// sqrt
		{"sqrt perfect square", "sqrt", []float64{4}, 2, nil},
		{"sqrt decimal", "sqrt", []float64{2.25}, 1.5, nil},
		{"sqrt zero", "sqrt", []float64{0}, 0, nil},
		{"sqrt normalizes negative zero", "sqrt", []float64{negZero}, 0, nil},
		{"sqrt negative", "sqrt", []float64{-1}, 0, calculator.ErrNegativeSqrt},
		{"sqrt tiny negative", "sqrt", []float64{-math.SmallestNonzeroFloat64}, 0, calculator.ErrNegativeSqrt},

		// percentage (unary: a / 100)
		{"percentage half", "percentage", []float64{50}, 0.5, nil},
		{"percentage above hundred", "percentage", []float64{200}, 2, nil},
		{"percentage negative", "percentage", []float64{-25}, -0.25, nil},
		{"percentage decimal", "percentage", []float64{12.5}, 0.125, nil},
		{"percentage zero", "percentage", []float64{0}, 0, nil},
		{"percentage normalizes negative zero", "percentage", []float64{negZero}, 0, nil},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got, err := calculator.Calculate(tc.op, tc.operands...)

			if tc.wantErr != nil {
				if !errors.Is(err, tc.wantErr) {
					t.Fatalf("Calculate(%q, %v) error = %v, want %v", tc.op, tc.operands, err, tc.wantErr)
				}
				if got != 0 {
					t.Errorf("Calculate(%q, %v) = %v alongside an error, want 0", tc.op, tc.operands, got)
				}
				return
			}

			if err != nil {
				t.Fatalf("Calculate(%q, %v) unexpected error: %v", tc.op, tc.operands, err)
			}
			// Signbit distinguishes 0 from -0, which == alone cannot.
			if got != tc.want || math.Signbit(got) != math.Signbit(tc.want) {
				t.Errorf("Calculate(%q, %v) = %v, want %v", tc.op, tc.operands, got, tc.want)
			}
		})
	}
}

func TestCalculateRejectsNonFiniteOperands(t *testing.T) {
	nonFinite := map[string]float64{
		"NaN":  math.NaN(),
		"+Inf": math.Inf(1),
		"-Inf": math.Inf(-1),
	}

	for _, op := range calculator.Operations() {
		for position := range op.Arity {
			for label, bad := range nonFinite {
				operands := make([]float64, op.Arity)
				for i := range operands {
					operands[i] = 1
				}
				operands[position] = bad

				t.Run(op.Name+"/"+label, func(t *testing.T) {
					got, err := calculator.Calculate(op.Name, operands...)
					if !errors.Is(err, calculator.ErrInvalidOperand) {
						t.Fatalf("Calculate(%q, %v) error = %v, want %v", op.Name, operands, err, calculator.ErrInvalidOperand)
					}
					if got != 0 {
						t.Errorf("Calculate(%q, %v) = %v alongside an error, want 0", op.Name, operands, got)
					}
				})
			}
		}
	}
}

func TestCalculateRejectsWrongArity(t *testing.T) {
	tests := []struct {
		op       string
		operands []float64
	}{
		{"add", nil},
		{"add", []float64{1}},
		{"add", []float64{1, 2, 3}},
		{"divide", []float64{1}},
		{"power", []float64{2}},
		{"sqrt", nil},
		{"sqrt", []float64{4, 2}},
		{"percentage", []float64{50, 10}},
	}

	for _, tc := range tests {
		t.Run(tc.op, func(t *testing.T) {
			_, err := calculator.Calculate(tc.op, tc.operands...)
			if !errors.Is(err, calculator.ErrArity) {
				t.Fatalf("Calculate(%q, %v) error = %v, want %v", tc.op, tc.operands, err, calculator.ErrArity)
			}
		})
	}
}

func TestCalculateRejectsUnknownOperation(t *testing.T) {
	for _, name := range []string{"", "modulo", "ADD", " add", "Sqrt"} {
		t.Run(name, func(t *testing.T) {
			_, err := calculator.Calculate(name, 1, 2)
			if !errors.Is(err, calculator.ErrUnknownOperation) {
				t.Fatalf("Calculate(%q) error = %v, want %v", name, err, calculator.ErrUnknownOperation)
			}
		})
	}
}

func TestOperations(t *testing.T) {
	want := []calculator.Operation{
		{Name: "add", Arity: 2},
		{Name: "subtract", Arity: 2},
		{Name: "multiply", Arity: 2},
		{Name: "divide", Arity: 2},
		{Name: "power", Arity: 2},
		{Name: "sqrt", Arity: 1},
		{Name: "percentage", Arity: 1},
	}

	got := calculator.Operations()
	if !slices.Equal(got, want) {
		t.Fatalf("Operations() = %v, want %v", got, want)
	}

	// The result must be a copy: mutating it must not affect the registry.
	got[0].Name = "mutated"
	if again := calculator.Operations(); !slices.Equal(again, want) {
		t.Fatalf("Operations() after mutating a previous result = %v, want %v", again, want)
	}
}
