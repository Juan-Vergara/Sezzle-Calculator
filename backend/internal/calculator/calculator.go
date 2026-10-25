// Package calculator implements the arithmetic domain of the calculator service.
//
// It is deliberately free of HTTP, JSON, and any other transport concern so that
// every rule can be tested in isolation. Transport layers discover the available
// operations through Operations and execute them through Calculate.
package calculator

import (
	"errors"
	"fmt"
	"math"
)

// Domain errors. Callers should compare them with errors.Is, because some of
// them are returned wrapped with additional context.
var (
	// ErrUnknownOperation is returned when the requested operation does not exist.
	ErrUnknownOperation = errors.New("unknown operation")
	// ErrArity is returned when the number of operands does not match the operation.
	ErrArity = errors.New("wrong number of operands")
	// ErrInvalidOperand is returned when an operand is NaN or ±Inf.
	ErrInvalidOperand = errors.New("operands must be finite numbers")
	// ErrDivisionByZero is returned when dividing by zero (including negative zero).
	ErrDivisionByZero = errors.New("division by zero is not allowed")
	// ErrNegativeSqrt is returned for the square root of a negative number.
	ErrNegativeSqrt = errors.New("square root of a negative number is not allowed")
	// ErrUndefinedResult is returned when a result is mathematically undefined (NaN).
	ErrUndefinedResult = errors.New("result is undefined")
	// ErrOutOfRange is returned when a result cannot be represented as a finite float64.
	ErrOutOfRange = errors.New("result is out of range")
)

// Operation describes a supported operation: its stable identifier and the
// number of operands it takes (1 for unary, 2 for binary).
type Operation struct {
	Name  string
	Arity int
}

// definition binds an Operation to its implementation. Implementations may
// assume that the operand count already matches Arity and that every operand
// is finite; Calculate guarantees both.
type definition struct {
	Operation
	apply func(x []float64) (float64, error)
}

// definitions is the single source of truth for the supported operations.
// Its order is the order reported by Operations.
var definitions = []definition{
	{Operation{Name: "add", Arity: 2}, func(x []float64) (float64, error) {
		return x[0] + x[1], nil
	}},
	{Operation{Name: "subtract", Arity: 2}, func(x []float64) (float64, error) {
		return x[0] - x[1], nil
	}},
	{Operation{Name: "multiply", Arity: 2}, func(x []float64) (float64, error) {
		return x[0] * x[1], nil
	}},
	{Operation{Name: "divide", Arity: 2}, func(x []float64) (float64, error) {
		if x[1] == 0 {
			return 0, ErrDivisionByZero
		}
		return x[0] / x[1], nil
	}},
	{Operation{Name: "power", Arity: 2}, func(x []float64) (float64, error) {
		return math.Pow(x[0], x[1]), nil
	}},
	{Operation{Name: "sqrt", Arity: 1}, func(x []float64) (float64, error) {
		if x[0] < 0 {
			return 0, ErrNegativeSqrt
		}
		return math.Sqrt(x[0]), nil
	}},
	{Operation{Name: "percentage", Arity: 1}, func(x []float64) (float64, error) {
		return x[0] / 100, nil
	}},
}

// Operations returns the supported operations in a stable order. The returned
// slice is a copy and may be modified freely by the caller.
func Operations() []Operation {
	ops := make([]Operation, len(definitions))
	for i, d := range definitions {
		ops[i] = d.Operation
	}
	return ops
}

// Calculate executes the named operation on the given operands.
//
// Besides the operation-specific rules (division by zero, square root of a
// negative number), every result goes through the same checks: NaN is reported
// as ErrUndefinedResult, ±Inf as ErrOutOfRange, and negative zero is
// normalized to zero.
func Calculate(name string, operands ...float64) (float64, error) {
	def, ok := lookup(name)
	if !ok {
		return 0, fmt.Errorf("%w: %q", ErrUnknownOperation, name)
	}
	if len(operands) != def.Arity {
		return 0, fmt.Errorf("%w: %s expects %d, got %d", ErrArity, name, def.Arity, len(operands))
	}
	for _, x := range operands {
		if math.IsNaN(x) || math.IsInf(x, 0) {
			return 0, ErrInvalidOperand
		}
	}

	result, err := def.apply(operands)
	if err != nil {
		return 0, err
	}

	switch {
	case math.IsNaN(result):
		return 0, ErrUndefinedResult
	case math.IsInf(result, 0):
		return 0, ErrOutOfRange
	case result == 0:
		return 0, nil // also turns -0 into 0
	default:
		return result, nil
	}
}

func lookup(name string) (definition, bool) {
	for _, d := range definitions {
		if d.Name == name {
			return d, true
		}
	}
	return definition{}, false
}
