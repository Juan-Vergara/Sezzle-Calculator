package api

import (
	"net/http"

	"github.com/Juan-Vergara/sezzle-calculator/backend/internal/calculator"
)

// NewRouter builds the HTTP handler for the calculator service, registering all
// operation endpoints from the domain registry alongside health, 404, and 405
// handlers wrapped with panic recovery and structured request logging.
func NewRouter() http.Handler {
	mux := http.NewServeMux()

	for _, op := range calculator.Operations() {
		route := "/api/v1/" + op.Name
		mux.HandleFunc("POST "+route, operationHandler(op))
		mux.HandleFunc(route, methodNotAllowedHandler(http.MethodPost))
	}

	mux.HandleFunc("GET /healthz", healthHandler)
	mux.HandleFunc("/healthz", methodNotAllowedHandler(http.MethodGet))

	mux.HandleFunc("/api/", notFoundHandler)
	mux.HandleFunc("/", notFoundHandler)

	return loggingMiddleware(recoverMiddleware(mux))
}

func notFoundHandler(w http.ResponseWriter, _ *http.Request) {
	writeErrorEnvelope(w, http.StatusNotFound, CodeNotFound, "endpoint not found")
}

func methodNotAllowedHandler(allowed string) http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Allow", allowed)
		writeErrorEnvelope(w, http.StatusMethodNotAllowed, CodeMethodNotAllowed, "method not allowed")
	}
}
