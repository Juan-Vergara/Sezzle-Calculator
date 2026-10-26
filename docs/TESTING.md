# Testing & Coverage Guide

This document details how to execute all automated test suites, static analysis checks, coverage reports, manual API checks (`curl.exe` and PowerShell `Invoke-RestMethod`), and Docker Compose verifications for the **Sezzle Full-Stack Calculator**.

- **Last Verified Date:** `2026-10-25`
- **Last Verified Commit:** `cb02add` (`fix(frontend): refine keyboard shortcuts, decimal error recovery, and UI polish`)

---

## Table of Contents

1. [Quick Start — Running the Complete Test Suite](#1-quick-start--running-the-complete-test-suite)
2. [Backend Testing & Coverage (`backend/`)](#2-backend-testing--coverage-backend)
3. [Frontend Testing & Coverage (`frontend/`)](#3-frontend-testing--coverage-frontend)
4. [Test Inventory](#4-test-inventory)
5. [Manual API Testing (`curl.exe` & PowerShell)](#5-manual-api-testing-curlexe--powershell)
6. [Docker Compose Verification](#6-docker-compose-verification)
7. [Scope & Limitations of Automated Tests](#7-scope--limitations-of-automated-tests)

---

## 1. Quick Start — Running the Complete Test Suite

In **Windows PowerShell 5.1**, chain commands with `;` (or run each line separately):

### Backend (`backend/`)
```powershell
Set-Location backend
gofmt -l .
go vet ./...
go test ./... "-coverprofile=coverage.out"
go tool cover "-func=coverage.out"
Set-Location ..
```

### Frontend (`frontend/`)
```powershell
Set-Location frontend
npm test
npm run test:coverage
npm run lint
npm run typecheck
npm run build
Set-Location ..
```

---

## 2. Backend Testing & Coverage (`backend/`)

### Commands

| Step | Command | Expected Output |
|---|---|---|
| **Format Check** | `gofmt -l .` | *(Empty output — all files formatted)* |
| **Static Analysis** | `go vet ./...` | *(Empty output — exit code `0`)* |
| **Unit & HTTP Tests** | `go test -v ./...` | All tests in `internal/calculator` and `internal/api` pass |
| **Coverage Profile** | `go test ./... "-coverprofile=coverage.out"` | Generates `coverage.out` (gitignored) |
| **Coverage Breakdown** | `go tool cover "-func=coverage.out"` | Prints function-by-function statement coverage |

> **Note on `-race` on Windows:** Go's race detector (`-race`) requires `CGO_ENABLED=1` and a local C toolchain (`gcc`). On Windows without a C compiler, run `go test ./...`; use `go test -race ./...` in Linux/CI environments where `gcc` is preinstalled.

### Configured Targets vs. Actual Coverage

| Package | Target | Verified Coverage | Status |
|---|---|---|---|
| `internal/calculator` | `>= 95%` | **100.0%** of statements | PASS |
| `internal/api` | `>= 85%` | **99.0%** of statements | PASS |
| `cmd/server` *(wiring entrypoint)* | — | `0.0%` (`main()` verified via live server & Docker) | — |

### Verified `go tool cover -func=coverage.out` Output

```text
github.com/Juan-Vergara/sezzle-calculator/backend/cmd/server/main.go:27:		main			0.0%
github.com/Juan-Vergara/sezzle-calculator/backend/internal/api/errors.go:45:		writeJSON		100.0%
github.com/Juan-Vergara/sezzle-calculator/backend/internal/api/errors.go:53:		writeErrorEnvelope	100.0%
github.com/Juan-Vergara/sezzle-calculator/backend/internal/api/errors.go:64:		writeError		100.0%
github.com/Juan-Vergara/sezzle-calculator/backend/internal/api/handler.go:37:		UnmarshalJSON		90.9%
github.com/Juan-Vergara/sezzle-calculator/backend/internal/api/handler.go:58:		operationHandler	100.0%
github.com/Juan-Vergara/sezzle-calculator/backend/internal/api/handler.go:76:		decodeOperands		100.0%
github.com/Juan-Vergara/sezzle-calculator/backend/internal/api/handler.go:127:		healthHandler		100.0%
github.com/Juan-Vergara/sezzle-calculator/backend/internal/api/middleware.go:15:	WriteHeader		100.0%
github.com/Juan-Vergara/sezzle-calculator/backend/internal/api/middleware.go:25:	loggingMiddleware	100.0%
github.com/Juan-Vergara/sezzle-calculator/backend/internal/api/middleware.go:46:	recoverMiddleware	100.0%
github.com/Juan-Vergara/sezzle-calculator/backend/internal/api/router.go:12:		NewRouter		100.0%
github.com/Juan-Vergara/sezzle-calculator/backend/internal/api/router.go:30:		notFoundHandler		100.0%
github.com/Juan-Vergara/sezzle-calculator/backend/internal/api/router.go:34:		methodNotAllowedHandler	100.0%
github.com/Juan-Vergara/sezzle-calculator/backend/internal/calculator/calculator.go:82:	Operations		100.0%
github.com/Juan-Vergara/sezzle-calculator/backend/internal/calculator/calculator.go:96:	Calculate		100.0%
github.com/Juan-Vergara/sezzle-calculator/backend/internal/calculator/calculator.go:127:	lookup			100.0%
total:											(statements)		82.1%
```

---

## 3. Frontend Testing & Coverage (`frontend/`)

### Commands

| Step | Command | Expected Output |
|---|---|---|
| **Unit & Integration Tests** | `npm test` | `5 passed (5)` test files, `42 passed (42)` tests |
| **Coverage Report (`v8`)** | `npm run test:coverage` | Enforces `lines >= 80%` and `branches >= 80%` thresholds |
| **ESLint** | `npm run lint` | `0` errors, `0` warnings |
| **TypeScript Typecheck** | `npm run typecheck` | `tsc -b --noEmit` exits with `0` |
| **Production Build** | `npm run build` | `tsc -b && vite build` outputs production bundle to `dist/` |

### Configured Thresholds vs. Actual Coverage

Configured in `frontend/vite.config.ts` (excluding `src/main.tsx`, `src/vite-env.d.ts`, `src/test/**`, `src/**/*.test.{ts,tsx}`, and `src/**/types.ts`):
- **Configured Minimum Thresholds:** `lines: 80%`, `branches: 80%`
- **Verified Overall Coverage:** **99.21% Statements / 97.74% Branches / 100% Functions / 99.21% Lines**

### Verified `npm run test:coverage` Output

```text
 Test Files  5 passed (5)
      Tests  42 passed (42)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   99.21 |    97.74 |     100 |   99.21 |                   
 src               |     100 |      100 |     100 |     100 |                   
  App.tsx          |     100 |      100 |     100 |     100 |                   
 src/api           |   96.72 |    95.12 |     100 |   96.72 |                   
  client.ts        |   96.72 |    95.12 |     100 |   96.72 | 58-59,114-115     
 src/calculator    |   99.61 |    98.03 |     100 |   99.61 |                   
  format.ts        |   88.23 |    88.88 |     100 |   88.23 | 22-23             
  keys.ts          |     100 |      100 |     100 |     100 |                   
  reducer.ts       |     100 |      100 |     100 |     100 |                   
  useCalculator.ts |     100 |    91.66 |     100 |     100 | 52                
 src/components    |     100 |      100 |     100 |     100 |                   
  Calculator.tsx   |     100 |      100 |     100 |     100 |                   
  Display.tsx      |     100 |      100 |     100 |     100 |                   
  Keypad.tsx       |     100 |      100 |     100 |     100 |                   
-------------------|---------|----------|---------|---------|-------------------
```

---

## 4. Test Inventory

### Backend (`testing` + `net/http/httptest`)

| Test File | Scope & Key Cases Covered |
|---|---|
| `backend/internal/calculator/calculator_test.go` | Table-driven unit tests across all 7 operations (`add`, `subtract`, `multiply`, `divide`, `power`, `sqrt`, `percentage`): positive/negative integers, decimals, zero and identity cases, `-0` normalization (`-1 * 0 -> 0`), division by `0` and `-0` (`ErrDivisionByZero`), negative square root (`ErrNegativeSqrt`), overflow (`10^400`, `MaxFloat64 * 2`, `0^-1` -> `ErrOutOfRange`), `NaN` results (`(-8)^0.5` -> `ErrUndefinedResult`), non-finite inputs (`NaN`, `±Inf` -> `ErrInvalidOperand`), unknown operation (`ErrUnknownOperation`), wrong operand count (`ErrArity`), and defensive copy of `Operations()`. |
| `backend/internal/api/handler_test.go` | Table-driven HTTP handler and router tests using `httptest`: `200 OK` on all 7 `POST /api/v1/{op}` routes and `GET /healthz`; `400 INVALID_REQUEST` on empty body, malformed JSON, non-object JSON (`[1,2]`), unknown fields (`{"a":1,"b":2,"c":3}`), trailing JSON data (`{"a":1,"b":2}{}`), and extra operand `b` on unary `sqrt`/`percentage`; `400 MISSING_OPERAND` when `a` or `b` is omitted; `400 INVALID_OPERAND` on `"a":"5"`, `"a":true`, `"a":null`, and `1e400`; `413 PAYLOAD_TOO_LARGE` when body exceeds 1 KiB; `422` domain errors (`DIVISION_BY_ZERO`, `NEGATIVE_SQUARE_ROOT`, `RESULT_OUT_OF_RANGE`, `UNDEFINED_RESULT`); `404 NOT_FOUND` on unknown routes; `405 METHOD_NOT_ALLOWED` + `Allow` header on `GET /api/v1/add` and `POST /healthz`; panic recovery middleware returning `500 INTERNAL_ERROR` JSON envelope. |

### Frontend (Vitest + React Testing Library + `user-event`)

| Test File | Scope & Key Cases Covered |
|---|---|
| `frontend/src/calculator/format.test.ts` | Formatting integers, decimals, IEEE 754 precision cleanup (`0.1 + 0.2 -> "0.3"`), negative numbers, `-0` and non-finite normalization (`-> "0"`), and exponential notation for large (`>= 1e15`) and small (`< 1e-6`) magnitudes. |
| `frontend/src/api/client.test.ts` | Request URL, `POST` method, headers, and JSON payload for binary (`{a, b}`) and unary (`{a}`) operations; parsing `200 OK` result; mapping backend error envelopes into `ApiError(code, message, status)`; network failure (`NETWORK_ERROR`); non-JSON 500 response (`UNEXPECTED_RESPONSE`); invalid result payload; client-side arity guard; and `AbortController` signal propagation. |
| `frontend/src/calculator/reducer.test.ts` | Pure state machine transitions: leading-zero prevention, single decimal point, 15-digit entry limit, `±` sign toggle on active entry and results, `⌫` backspace, `AC` clear, binary operator selection and replacement (`3 + ×`), immediate left-to-right chaining (`2 + 3 × 4 =`), unary `√` and `%` preserving pending binary operations (`3 + 9 √ ×`, `50 + 10 % =`), `resolved` and `failed` continuations, error recovery via digit/decimal/`AC`, ignoring keys during `loading` (except `AC`), stale request ID rejection across shallow-copied and manually constructed states, and physical keyboard shortcut mapping (`keys.ts`). |
| `frontend/src/components/Calculator.test.tsx` | Full UI + `useCalculator` + `client.ts` integration tests with stubbed `fetch`: `1 2 + 3 = -> 15`, `2 + 3 × 4 = -> 20` (2 sequential API calls), `50 + 10 % = -> 50.1`, `9 √ -> 3`, `8 ÷ 0 =` displaying backend error message and recovering on digit entry, network failure message, keypad button disabling during `loading` and stale/cancelled request protection after `AC`, physical keyboard `7 * 6 Enter -> 42`, and adaptive display font classes for long numbers. |
| `frontend/src/App.test.tsx` | Verifies the main application shell and `"Calculator"` heading render cleanly. |

---

## 5. Manual API Testing (`curl.exe` & PowerShell)

Start the backend server in one terminal:
```powershell
Set-Location backend
go run ./cmd/server
```

In a second PowerShell terminal, run the following commands to verify success and error responses:

### Health Check (`200 OK`)
```powershell
curl.exe -i -s http://localhost:8080/healthz
```

### Representative Success Requests (`200 OK`)
```powershell
# Addition: 12 + 3 = 15
curl.exe -s -X POST http://localhost:8080/api/v1/add -H "Content-Type: application/json" -d "{\"a\":12,\"b\":3}"

# Subtraction: 12 - 3 = 9
curl.exe -s -X POST http://localhost:8080/api/v1/subtract -H "Content-Type: application/json" -d "{\"a\":12,\"b\":3}"

# Multiplication: 12 * 3 = 36
curl.exe -s -X POST http://localhost:8080/api/v1/multiply -H "Content-Type: application/json" -d "{\"a\":12,\"b\":3}"

# Division: 12 / 3 = 4
curl.exe -s -X POST http://localhost:8080/api/v1/divide -H "Content-Type: application/json" -d "{\"a\":12,\"b\":3}"

# Exponentiation: 2 ^ 3 = 8
curl.exe -s -X POST http://localhost:8080/api/v1/power -H "Content-Type: application/json" -d "{\"a\":2,\"b\":3}"

# Square Root: sqrt(9) = 3
curl.exe -s -X POST http://localhost:8080/api/v1/sqrt -H "Content-Type: application/json" -d "{\"a\":9}"

# Percentage: 50% = 0.5
curl.exe -s -X POST http://localhost:8080/api/v1/percentage -H "Content-Type: application/json" -d "{\"a\":50}"
```

### Representative Error Requests (`400`, `404`, `405`, `422`)
```powershell
# 422 DIVISION_BY_ZERO
curl.exe -i -s -X POST http://localhost:8080/api/v1/divide -H "Content-Type: application/json" -d "{\"a\":8,\"b\":0}"

# 422 NEGATIVE_SQUARE_ROOT
curl.exe -i -s -X POST http://localhost:8080/api/v1/sqrt -H "Content-Type: application/json" -d "{\"a\":-9}"

# 422 RESULT_OUT_OF_RANGE
curl.exe -i -s -X POST http://localhost:8080/api/v1/power -H "Content-Type: application/json" -d "{\"a\":10,\"b\":400}"

# 422 UNDEFINED_RESULT
curl.exe -i -s -X POST http://localhost:8080/api/v1/power -H "Content-Type: application/json" -d "{\"a\":-8,\"b\":0.5}"

# 400 MISSING_OPERAND
curl.exe -i -s -X POST http://localhost:8080/api/v1/add -H "Content-Type: application/json" -d "{\"a\":10}"

# 400 INVALID_OPERAND (explicit null)
curl.exe -i -s -X POST http://localhost:8080/api/v1/add -H "Content-Type: application/json" -d "{\"a\":10,\"b\":null}"

# 400 INVALID_REQUEST (extra operand b on unary sqrt)
curl.exe -i -s -X POST http://localhost:8080/api/v1/sqrt -H "Content-Type: application/json" -d "{\"a\":9,\"b\":2}"

# 405 METHOD_NOT_ALLOWED (Allow: POST)
curl.exe -i -s -X GET http://localhost:8080/api/v1/add

# 404 NOT_FOUND
curl.exe -i -s -X POST http://localhost:8080/api/v1/modulo -H "Content-Type: application/json" -d "{\"a\":10,\"b\":3}"
```

### PowerShell `Invoke-RestMethod` Examples
```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:8080/healthz
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/v1/multiply -ContentType "application/json" -Body '{"a": 7, "b": 6}'
```

---

## 6. Docker Compose Verification

From the repository root, validate, build, start, and verify the containerized stack:

```powershell
# 1. Validate docker-compose.yml syntax and resolved config
docker compose config

# 2. Build multi-stage backend (distroless) and frontend (Nginx) images
docker compose build

# 3. Start services in detached mode
docker compose up -d

# 4. Inspect running containers and port bindings (:3000 -> :80, :8080 -> :8080)
docker compose ps

# 5. Verify direct backend healthcheck (:8080) and Nginx-proxied healthcheck (:3000)
curl.exe -s http://localhost:8080/healthz
curl.exe -s http://localhost:3000/healthz

# 6. Verify API call through the frontend Nginx reverse proxy (:3000/api/v1/add -> backend:8080)
curl.exe -s -X POST http://localhost:3000/api/v1/add -H "Content-Type: application/json" -d "{\"a\":12,\"b\":3}"

# 7. Inspect container logs
docker compose logs

# 8. Stop and remove containers when finished
docker compose down
```

---

## 7. Scope & Limitations of Automated Tests

1. **`jsdom` vs. Real Browser Layout Engine:**
   - Vitest component tests run in `jsdom`, which validates DOM structure, ARIA attributes (`aria-label`, `aria-live`, `aria-busy`, `aria-pressed`), keyboard events, and state transitions, but does not compute real CSS Grid pixel geometry or visual overflow at `360 px` vs. desktop viewports.
   - Real browser visual layout (`1280×800` desktop and `360×800` mobile) and touch-target dimensions (`>= 56 px`) were verified separately in a real Chromium browser during T8 and T9.
2. **Stubbed `fetch` in Unit/Integration Tests vs. Network Proxy:**
   - `Calculator.test.tsx` stubs `window.fetch` to deterministically test asynchronous loading, error recovery, and `AbortController` race conditions without requiring a live backend process.
   - End-to-end communication across the Vite dev proxy (`:5173 -> :8080`) and the Docker Nginx reverse proxy (`:3000 -> backend:8080`) is verified via the live server and Docker Compose checks above.
3. **`cmd/server/main.go` Coverage:**
   - `main.go` contains only process startup, environment variable reading (`PORT`), `http.Server` timeout configuration, and OS signal handling (`SIGINT`/`SIGTERM`), so it shows `0.0%` in `go test` and is exercised by running the binary directly and in Docker.
