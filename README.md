# Sezzle Full-Stack Calculator

A full-stack calculator web application built with a **React + TypeScript** keypad frontend and a zero-dependency **Go** REST API microservice. Every arithmetic operation and mathematical validation is executed on the backend.

---

## Table of Contents

1. [Overview & Features](#1-overview--features)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Repository Structure](#4-repository-structure)
5. [Prerequisites](#5-prerequisites)
6. [Running Locally](#6-running-locally)
7. [Running with Docker Compose](#7-running-with-docker-compose)
8. [Calculator Semantics & Evaluation Model](#8-calculator-semantics--evaluation-model)
9. [API Reference](#9-api-reference)
10. [API Examples (`curl.exe` & PowerShell)](#10-api-examples-curlexe--powershell)
11. [Error Handling & Numerical Precision](#11-error-handling--numerical-precision)
12. [Testing & Coverage](#12-testing--coverage)
13. [Design Decisions](#13-design-decisions)
14. [Assumptions & Limitations](#14-assumptions--limitations)
15. [Future Improvements](#15-future-improvements)
16. [AI Usage & Prompts](#16-ai-usage--prompts)

---

## 1. Overview & Features

This application pairs a classic calculator keypad interface (`0–9`, `.`, `±`, `⌫`, `AC`, `+`, `−`, `×`, `÷`, `xʸ`, `√`, `%`, `=`) with a Go HTTP microservice that performs all calculations and domain validations.

### Supported Operations

| Category | Operation | Keypad | Endpoint | Semantics |
|---|---|---|---|---|
| **Basic (Required)** | Addition | `+` | `POST /api/v1/add` | Computes `a + b` |
| **Basic (Required)** | Subtraction | `−` | `POST /api/v1/subtract` | Computes `a - b` |
| **Basic (Required)** | Multiplication | `×` | `POST /api/v1/multiply` | Computes `a * b` |
| **Basic (Required)** | Division | `÷` | `POST /api/v1/divide` | Computes `a / b` (rejects `b == 0` with HTTP `422`) |
| **Advanced (Optional)** | Exponentiation | `xʸ` | `POST /api/v1/power` | Computes $a^b$ (`math.Pow(a, b)`) |
| **Advanced (Optional)** | Square Root | `√` | `POST /api/v1/sqrt` | Computes $\sqrt{a}$ (rejects `a < 0` with HTTP `422`) |
| **Advanced (Optional)** | Percentage | `%` | `POST /api/v1/percentage` | Unary conversion: computes `a / 100` |

### Key Capabilities
- **Zero Frontend Arithmetic:** The frontend only manages digit entry strings and keypad state transitions; all mathematical evaluation happens on the Go backend.
- **Two-Line Display:** Shows the pending expression (e.g., `12 ×`) on the secondary line and the active entry, result, or error message on the primary line (`aria-live="polite"`).
- **Concurrency & Stale-Response Protection:** Locks keypad buttons (except `AC`) while a request is in flight, cancels aborted requests via `AbortController`, and guards state transitions with monotonically increasing request IDs.
- **Full Physical Keyboard Support:** Supports number keys, operators, `Enter`/`=`, `Backspace`, `Escape`/`Delete`/`c`, `r` (`√`), `F9` (`±`), and `.`/`,` without intercepting browser shortcuts (`Ctrl`/`Alt`/`Meta`).
- **Responsive Layout:** Adapts from a centered `380 px` calculator card on desktop viewports (`>= 480 px`) to a full-width touch-friendly layout (`>= 56 px` button targets) on mobile viewports (`360 px`).

---

## 2. Architecture

```mermaid
flowchart LR
    U["Browser"] --> UI["React Components: Calculator, Display, Keypad"]
    UI --> SM["Pure Reducer (State Machine)"]
    SM -- "request intent" --> HK["useCalculator Hook (Effect + AbortController)"]
    HK --> CL["api/client.ts (fetch)"]
    CL -- "POST /api/v1/{op}" --> PX["Vite Proxy (Dev) / Nginx (Docker)"]
    PX --> RT["Go: internal/api (Router, Handler, Errors)"]
    RT --> DM["Go: internal/calculator (Pure Domain)"]
```

### Architectural Principles
1. **Strict Backend Layering (`backend/`):**
   - `cmd/server`: HTTP server wiring, timeouts (`ReadHeaderTimeout`, `ReadTimeout`, `WriteTimeout`, `IdleTimeout`), structured JSON logging (`log/slog`), and graceful shutdown (`signal.NotifyContext`).
   - `internal/api`: Go 1.22+ `net/http` routing, generic operation handler, strict JSON decoding (`DisallowUnknownFields`, 1 KiB body limit, trailing-token rejection, `*float64` nil vs. `null` distinction), panic recovery, and centralized error mapping.
   - `internal/calculator`: Pure mathematical domain logic and sentinel errors with zero HTTP or JSON imports.
2. **Pure Value-Deterministic State Machine (`frontend/`):**
   - `src/calculator/reducer.ts` is a pure function `reducer(state, action) -> state` with zero side effects or object-identity dependencies.
   -When an operation requires backend evaluation, the reducer emits a declarative `request` descriptor (`{ id, operation, operands, then }`).
   - `src/calculator/useCalculator.ts` observes `state.request`, executes the HTTP call through `src/api/client.ts` with an `AbortController`, and dispatches `resolved` or `failed`.
3. **Same-Origin Requests Across Environments:**
   - In local development, Vite proxies `/api` to `http://localhost:8080`.
   - In Docker production, Nginx serves the compiled static bundle and proxies `/api/` and `/healthz` to `http://backend:8080` over the internal Compose network, eliminating CORS configuration.

---

## 3. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Backend Language** | Go `1.27` (`>= 1.22` compatible) | Fast compilation, strong type safety, comprehensive standard library |
| **Backend HTTP & JSON** | Go stdlib (`net/http`, `encoding/json`, `log/slog`, `math`) | Native method+path routing, zero external dependencies |
| **Frontend UI** | React `19` + TypeScript `~5.7` (`strict`) + Vite `6` | Strict type checking, fast HMR and production bundling |
| **Styling** | Plain CSS (CSS Grid + Custom Properties) | Responsive 4×6 keypad layout without external CSS framework bloat |
| **HTTP Client** | Browser native `fetch` + `AbortController` | Native request cancellation and zero client library overhead |
| **Testing** | Go `testing`/`httptest`; Vitest + React Testing Library + `v8` coverage | Deterministic table-driven backend tests and behavioral UI integration tests |
| **Containers** | Docker + Docker Compose (`golang:1.27-alpine` → `distroless`, `node:22-alpine` → `nginx:alpine`) | Minimal production images with unprivileged `nonroot` backend execution |

---

## 4. Repository Structure

```text
Sezzle-Calculator/
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI (Go backend + React frontend)
├── backend/
│   ├── cmd/server/
│   │   └── main.go                 # HTTP server entrypoint, timeouts, graceful shutdown
│   ├── internal/
│   │   ├── api/
│   │   │   ├── errors.go           # Unified error envelope and domain-to-HTTP mapping
│   │   │   ├── handler.go          # Generic operation handler, strict JSON decoder, /healthz
│   │   │   ├── handler_test.go     # Table-driven HTTP integration tests (httptest)
│   │   │   ├── middleware.go       # Structured slog request logging and panic recovery
│   │   │   └── router.go           # Go 1.22+ ServeMux route registration from domain registry
│   │   └── calculator/
│   │       ├── calculator.go       # Pure arithmetic domain, operation registry, sentinel errors
│   │       └── calculator_test.go  # Table-driven unit tests for all 7 operations & edge cases
│   ├── .dockerignore
│   ├── Dockerfile                  # Multi-stage build -> gcr.io/distroless/static-debian12:nonroot
│   └── go.mod
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts           # Native fetch client, ApiError, payload builder
│   │   │   └── client.test.ts      # API client unit tests
│   │   ├── calculator/
│   │   │   ├── format.ts           # 15-significant-digit number formatter
│   │   │   ├── format.test.ts      # Formatter unit tests
│   │   │   ├── keys.ts             # Keypad definitions and physical keyboard shortcut map
│   │   │   ├── reducer.ts          # Pure value-deterministic calculator state machine
│   │   │   ├── reducer.test.ts     # Comprehensive state machine & keyboard unit tests
│   │   │   ├── types.ts            # TypeScript domain, state, action, and API types
│   │   │   └── useCalculator.ts    # React hook bridging useReducer and AbortController fetch
│   │   ├── components/
│   │   │   ├── Calculator.tsx      # Main calculator container + window keydown listener
│   │   │   ├── Calculator.test.tsx # Full UI-to-fetch integration tests
│   │   │   ├── Display.tsx         # Two-line expression & adaptive-font value/error display
│   │   │   └── Keypad.tsx          # 4x6 CSS Grid keypad component
│   │   ├── test/
│   │   │   └── setup.ts            # Vitest + jest-dom test setup
│   │   ├── App.tsx
│   │   ├── App.test.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .dockerignore
│   ├── Dockerfile                  # Multi-stage build -> nginx:alpine
│   ├── eslint.config.js
│   ├── index.html
│   ├── nginx.conf                  # Static asset serving + /api/ and /healthz reverse proxy
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vite.config.ts              # Vite dev proxy (/api -> :8080) + Vitest configuration
├── docs/
│   └── TESTING.md                  # Full test commands, test inventory, and coverage reports
├── .gitattributes
├── .gitignore
├── docker-compose.yml              # Full-stack orchestration (frontend :3000 + backend :8080)
├── PROMPTS.md                      # Verbatim log of all AI prompts used during development
└── README.md
```

---

## 5. Prerequisites

- **Git** (to clone the repository from GitHub)

### Option A — Local Development
- **Go:** `>= 1.22` (configured and tested with `go 1.27.3`)
- **Node.js:** `>= 20` (tested with `v22.20.0`) and **npm** (`>= 10`)

### Option B — Docker Execution
- **Docker Engine / Docker Desktop** with **Docker Compose v2** (`docker compose`). No local Go or Node.js installation is required when running via Docker.

---

## 6. Running Locally

### Step 1 — Clone the Repository from GitHub

Clone the **`Sezzle-Calculator`** repository and move into the project directory:

```powershell
git clone https://github.com/Juan-Vergara/Sezzle-Calculator.git
cd Sezzle-Calculator
```

Run the backend and frontend in two separate terminals starting from the `Sezzle-Calculator` root directory:

### Step 2 (Terminal 1) — Start the Go Backend (`http://localhost:8080`)

From `Sezzle-Calculator/`:

```powershell
cd backend
go run ./cmd/server
```

The backend listens on port `8080` by default (configurable via the `PORT` environment variable). Verify it is up:

```powershell
curl.exe -s http://localhost:8080/healthz
```
```json
{"status":"ok"}
```

### Step 3 (Terminal 2) — Start the React/Vite Frontend (`http://localhost:5173`)

Open a second terminal in `Sezzle-Calculator/`:

```powershell
cd frontend
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser. Vite automatically proxies all `/api/*` requests to `http://localhost:8080`.

---

## 7. Running with Docker Compose

If you have not cloned the repository yet, clone **`Sezzle-Calculator`** from GitHub and enter the project folder:

```powershell
git clone https://github.com/Juan-Vergara/Sezzle-Calculator.git
cd Sezzle-Calculator
```

From the `Sezzle-Calculator/` root directory, build and start both production containers:

```powershell
# Validate the Compose configuration
docker compose config

# Build images and start services in the background
docker compose build
docker compose up -d
```

Or in a single command from `Sezzle-Calculator/`:

```powershell
docker compose up --build -d
```

### Service Endpoints & Ports

| Service | Host URL | Internal Container Port | Description |
|---|---|---|---|
| **Frontend (`nginx:alpine`)** | **`http://localhost:3000`** | `80` | Production React UI + reverse proxy for `/api/` and `/healthz` |
| **Backend (`distroless`)** | **`http://localhost:8080`** | `8080` | Direct access to Go REST API (`POST /api/v1/*` and `GET /healthz`) |

### Inspecting & Stopping Containers

```powershell
# Check running container status and port mappings
docker compose ps

# View structured backend JSON logs and Nginx access logs
docker compose logs

# Stop and remove containers and internal network
docker compose down
```

---

## 8. Calculator Semantics & Evaluation Model

### Immediate Left-to-Right Execution
Like standard desktop and mobile calculators (such as the Windows Standard Calculator), binary operations use **immediate left-to-right execution** rather than algebraic operator precedence:

- Entering `2 + 3 × 4 =` performs:
  1. When `×` is pressed after `2 + 3`, the calculator immediately sends `POST /api/v1/add` with `{"a": 2, "b": 3}` → displays `5` and sets `5 ×` as the pending expression.
  2. When `=` is pressed after `4`, the calculator sends `POST /api/v1/multiply` with `{"a": 5, "b": 4}` → displays `20`.

### Unary Operations (`√` and `%`) & Chaining
- Pressing `√` or `%` immediately evaluates the currently displayed entry via `POST /api/v1/sqrt` or `POST /api/v1/percentage` (`a / 100`).
- If a binary operation is already pending, **the pending binary operation is preserved** and the unary result becomes its second operand:
  - `50 + 10 % =` → `10 %` resolves via `/api/v1/percentage` to `0.1`, and `=` resolves `50 + 0.1` via `/api/v1/add` to **`50.1`**.
  - `3 + 9 √ × 4 =` → `9 √` resolves to `3`, pressing `×` chains `3 + 3 = 6`, and `4 =` resolves `6 × 4` to **`24`**.

### Operator Replacement & Self-Operand Equals
- Pressing a binary operator immediately after another binary operator (before typing a second operand, e.g., `3 + ×`) **replaces** `+` with `×` without making a network request.
- Pressing `=` immediately after a binary operator (e.g., `5 + =`) uses the accumulator as both operands (`5 + 5 = 10`).

### Physical Keyboard Shortcuts

| Key(s) | Calculator Action |
|---|---|
| `0`–`9` | Digit entry (up to 15 digits) |
| `.` or `,` | Decimal point |
| `+`, `-`, `*` / `x` / `X`, `/`, `^` | Binary operations (`add`, `subtract`, `multiply`, `divide`, `power`) |
| `%` | Unary percentage (`percentage`) |
| `r` or `R` | Unary square root (`sqrt`) |
| `F9` | Toggle sign (`±`) |
| `Enter` or `=` | Equals (`=`) |
| `Backspace` | Delete last typed character (`⌫`) |
| `Escape`, `Delete`, `c`, or `C` | All Clear (`AC` — also cancels any in-flight request) |

---

## 9. API Reference

All calculation endpoints accept `POST` requests with `Content-Type: application/json` and a maximum body size of **1 KiB (1024 bytes)**.

| Method | Route | Request JSON Body | Success Response (`200 OK`) | Description |
|---|---|---|---|---|
| `POST` | `/api/v1/add` | `{"a": <number>, "b": <number>}` | `{"result": <number>}` | Addition (`a + b`) |
| `POST` | `/api/v1/subtract` | `{"a": <number>, "b": <number>}` | `{"result": <number>}` | Subtraction (`a - b`) |
| `POST` | `/api/v1/multiply` | `{"a": <number>, "b": <number>}` | `{"result": <number>}` | Multiplication (`a * b`) |
| `POST` | `/api/v1/divide` | `{"a": <number>, "b": <number>}` | `{"result": <number>}` | Division (`a / b`) |
| `POST` | `/api/v1/power` | `{"a": <number>, "b": <number>}` | `{"result": <number>}` | Exponentiation ($a^b$) |
| `POST` | `/api/v1/sqrt` | `{"a": <number>}` | `{"result": <number>}` | Square root ($\sqrt{a}$) |
| `POST` | `/api/v1/percentage` | `{"a": <number>}` | `{"result": <number>}` | Unary percentage (`a / 100`) |
| `GET` | `/healthz` | *(No body)* | `{"status": "ok"}` | Service health check |

---

## 10. API Examples (`curl.exe` & PowerShell)

> **Windows PowerShell Note:** In Windows PowerShell 5.1, `curl` is an alias for `Invoke-WebRequest`. Always invoke `curl.exe` explicitly or use `Invoke-RestMethod`.

### 1. Binary Operation (`POST /api/v1/add`)

**Using `curl.exe`:**
```powershell
curl.exe -s -X POST http://localhost:8080/api/v1/add -H "Content-Type: application/json" -d "{\"a\": 12.5, \"b\": 7.5}"
```
```json
{"result":20}
```

**Using PowerShell `Invoke-RestMethod`:**
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/v1/add -ContentType "application/json" -Body '{"a": 12.5, "b": 7.5}'
```

### 2. Exponentiation (`POST /api/v1/power`)
```powershell
curl.exe -s -X POST http://localhost:8080/api/v1/power -H "Content-Type: application/json" -d "{\"a\": 2, \"b\": 10}"
```
```json
{"result":1024}
```

### 3. Unary Square Root & Percentage (`POST /api/v1/sqrt`, `POST /api/v1/percentage`)
```powershell
curl.exe -s -X POST http://localhost:8080/api/v1/sqrt -H "Content-Type: application/json" -d "{\"a\": 81}"
```
```json
{"result":9}
```

```powershell
curl.exe -s -X POST http://localhost:8080/api/v1/percentage -H "Content-Type: application/json" -d "{\"a\": 50}"
```
```json
{"result":0.5}
```

### 4. Domain Error — Division by Zero (`422 Unprocessable Entity`)
```powershell
curl.exe -i -s -X POST http://localhost:8080/api/v1/divide -H "Content-Type: application/json" -d "{\"a\": 8, \"b\": 0}"
```
```json
{"error":{"code":"DIVISION_BY_ZERO","message":"division by zero is not allowed"}}
```

### 5. Domain Error — Negative Square Root (`422 Unprocessable Entity`)
```powershell
curl.exe -i -s -X POST http://localhost:8080/api/v1/sqrt -H "Content-Type: application/json" -d "{\"a\": -4}"
```
```json
{"error":{"code":"NEGATIVE_SQUARE_ROOT","message":"square root of a negative number is not allowed"}}
```

### 6. Validation Error — Missing Operand (`400 Bad Request`)
```powershell
curl.exe -i -s -X POST http://localhost:8080/api/v1/add -H "Content-Type: application/json" -d "{\"a\": 5}"
```
```json
{"error":{"code":"MISSING_OPERAND","message":"missing required operand: operand 'b' is required"}}
```

---

## 11. Error Handling & Numerical Precision

### Standardized Error Envelope
Every non-200 API response returns `Content-Type: application/json` with the structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "human-readable description"
  }
}
```

### Complete Error Code Reference

| HTTP Status | Error Code | Trigger Condition |
|---|---|---|
| `400 Bad Request` | `INVALID_REQUEST` | Malformed JSON, empty body, non-object JSON, unknown fields, trailing data after JSON object, or providing `b` to a unary operation (`sqrt`, `percentage`) |
| `400 Bad Request` | `MISSING_OPERAND` | Required operand `a` (or `b` for binary operations) is omitted |
| `400 Bad Request` | `INVALID_OPERAND` | Operand is non-numeric (`"5"`, `true`, `{}`), explicit `null`, or overflows `float64` on input (`1e400`) |
| `404 Not Found` | `NOT_FOUND` | Unknown route under `/api/` or `/` |
| `405 Method Not Allowed` | `METHOD_NOT_ALLOWED` | Non-`POST` method on an operation route (sets `Allow: POST`) or non-`GET` on `/healthz` (sets `Allow: GET`) |
| `413 Payload Too Large` | `PAYLOAD_TOO_LARGE` | Request body exceeds `1024` bytes (1 KiB) |
| `422 Unprocessable Entity` | `DIVISION_BY_ZERO` | Dividing by `0` or `-0` |
| `422 Unprocessable Entity` | `NEGATIVE_SQUARE_ROOT` | Square root of a negative number (`a < 0`) |
| `422 Unprocessable Entity` | `RESULT_OUT_OF_RANGE` | Calculation overflows to `±Inf` (e.g., `10^400`, `MaxFloat64 * 2`, `0^-1`) |
| `422 Unprocessable Entity` | `UNDEFINED_RESULT` | Calculation produces `NaN` (e.g., `(-8)^0.5`) |
| `500 Internal Server Error` | `INTERNAL_ERROR` | Unexpected panic recovered by `recoverMiddleware` |

### Numerical Precision & Formatting
- **Backend (`float64`):** Uses IEEE 754 double-precision floating-point arithmetic. Every calculation result passes through a unified post-check that rejects `NaN` (`422 UNDEFINED_RESULT`) and `±Inf` (`422 RESULT_OUT_OF_RANGE`) before JSON serialization, and normalizes `-0` to `0`.
- **Frontend (`format.ts`):** Formats numbers to at most **15 significant digits** (`Number(value.toPrecision(15))`), eliminating IEEE 754 representation artifacts such as `0.1 + 0.2 = 0.30000000000000004` (`-> "0.3"`). Values with magnitude `>= 1e15` or `< 1e-6` (non-zero) are formatted in compact exponential notation. Keypad digit entry is capped at 15 digits.

---

## 12. Testing & Coverage

See **[`docs/TESTING.md`](./docs/TESTING.md)** for the complete test inventory, manual API test scripts, and full coverage tables.

### Backend Test Commands (`backend/`)

```powershell
cd backend
gofmt -l .
go vet ./...
go test ./... -coverprofile=coverage.out
go tool cover -func=coverage.out
```

- **Configured Targets & Verified Results:**
  - `internal/calculator`: **100.0%** statement coverage (target `>= 95%`)
  - `internal/api`: **99.0%** statement coverage (target `>= 85%`)

### Frontend Test Commands (`frontend/`)

```powershell
cd frontend
npm test
npm run test:coverage
npm run lint
npm run typecheck
npm run build
```

- **Configured Thresholds & Verified Results:**
  - Vitest thresholds enforced in `vite.config.ts`: `lines: 80`, `branches: 80`.
  - Verified overall coverage: **99.21% Statements / 97.74% Branches / 100% Functions / 99.21% Lines** (`reducer.ts`, `keys.ts`, `App.tsx`, `Calculator.tsx`, `Display.tsx`, and `Keypad.tsx` at **100%**).

---

## 13. Design Decisions

| ID | Topic | Decision & Rationale |
|---|---|---|
| **D1** | Backend Router | **Go stdlib `net/http` (Go 1.22+)** with zero external dependencies. Eliminates third-party router bloat while supporting method-prefixed patterns (`POST /api/v1/add`). |
| **D2** | API Style | **One endpoint per operation (`POST /api/v1/{operation}`)** served by a **single generic handler** iterating over `calculator.Operations()`. |
| **D3** | User Interface | **Classic calculator keypad + two-line display** instead of text inputs, preventing malformed string entry in the UI while keeping full validation on the backend. |
| **D4** | Evaluation Model | **Immediate execution (left-to-right)** (`2 + 3 × 4 = 20`), matching standard desktop/mobile calculators without an expression parser. |
| **D5** | Percentage Semantics | **Unary (`a / 100`)** evaluated by `POST /api/v1/percentage`. Preserves any active binary operation (`50 + 10 % = 50.1`). |
| **D6** | Numeric Type | **`float64`** with 15-significant-digit formatting on the frontend and `NaN`/`±Inf`/`-0` post-checks on the backend. |
| **D7** | Operations | Full set of 7 operations: `add`, `subtract`, `multiply`, `divide`, `power`, `sqrt`, `percentage`. |
| **D8** | Docker Architecture | **Multi-stage production builds** (`golang:1.27-alpine` → `distroless:nonroot` and `node:22-alpine` → `nginx:alpine`) orchestrated via `docker-compose.yml`. |
| **D9** | State Machine Purity | **Value-deterministic reducer** using explicit `awaitingSecondOperand` and `lastRequestId` state fields (no external mutable refs or object-identity maps). |

---

## 14. Assumptions & Limitations

- **Immediate Execution vs. BODMAS:** Chained binary operations evaluate left-to-right as entered (`2 + 3 × 4 = 20`) rather than deferring multiplication until `=`.
- **Unary Percentage:** `%` computes `a / 100` rather than contextual percentage-of-accumulator (`a + (a * b / 100)`).
- **Repeated `=`:** Pressing `=` when no binary operation is pending is a no-op (does not repeat the previous binary operation).
- **Distroless Runtime Container:** The backend runtime image (`gcr.io/distroless/static-debian12:nonroot`) intentionally contains no shell (`/bin/sh`), `curl`, or `wget`. Health checks against `/healthz` are performed over HTTP (`http://localhost:8080/healthz` or `http://localhost:3000/healthz`).

---

## 15. Future Improvements

- Optional algebraic expression mode with operator precedence (`×`/`÷` before `+`/`−`) and parentheses.
- Contextual percentage option (`50 + 10 % = 55`).
- `GET /api/v1/operations` discovery endpoint so clients can dynamically query supported operations and arities.
- Calculation history tape and memory keys (`MC`, `MR`, `M+`, `M-`).

---

## 16. AI Usage & Prompts

All prompts used across architecture, planning, implementation, debugging, testing, Dockerization, and documentation are recorded verbatim in **[`PROMPTS.md`](./PROMPTS.md)**, including the model used, objective, outcome, and files affected for each step.
