# Sezzle Full-Stack Calculator

A full-stack calculator web application featuring a **React + TypeScript** keypad frontend and a zero-dependency **Go** REST API microservice. All arithmetic operations and mathematical validations are executed on the backend.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Prerequisites](#4-prerequisites)
5. [Running Locally](#5-running-locally)
6. [Running with Docker](#6-running-with-docker)
7. [API Reference](#7-api-reference)
8. [API Examples](#8-api-examples)
9. [Error Handling](#9-error-handling)
10. [Testing & Coverage](#10-testing--coverage)
11. [Design Decisions](#11-design-decisions)
12. [Assumptions](#12-assumptions)
13. [Future Improvements](#13-future-improvements)
14. [AI Usage & Prompts](#14-ai-usage--prompts)

---

## 1. Overview

This project implements a responsive calculator application where the frontend provides a classic calculator display and keypad (`0–9`, `.`, `±`, `⌫`, `AC`, `+`, `−`, `×`, `÷`, `xʸ`, `√`, `%`, `=`), while delegating every arithmetic computation to a Go REST microservice.

### Supported Operations
- **Basic (Mandatory):** Addition (`add`), Subtraction (`subtract`), Multiplication (`multiply`), Division (`divide`)
- **Advanced (Optional):** Exponentiation (`power`), Square Root (`sqrt`), Percentage (`percentage`)

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

- **Frontend (`frontend/`):** Manages keypad entry and immediate-execution state transitions via a pure reducer (`reducer.ts`). Side effects (`fetch` with `AbortController`) are isolated in `useCalculator.ts`.
- **Backend (`backend/`):** Structured into three focused packages:
  - `cmd/server`: HTTP server wiring, timeouts, and graceful shutdown.
  - `internal/api`: HTTP routing, JSON decoding/validation, middleware, and unified error mapping.
  - `internal/calculator`: Pure domain arithmetic with zero HTTP or JSON dependencies.

---

## 3. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Backend Language | Go 1.27 | Idiomatic, fast, strong standard library |
| Backend HTTP | Standard library `net/http` (Go 1.22+ patterns) | Method-based routing (`POST /api/v1/add`) with zero external dependencies |
| Frontend Framework | React 19 + TypeScript (Vite) | Strict type safety, fast dev server, built-in `/api` proxy |
| Styling | Plain CSS (CSS Grid + Custom Properties) | Mobile-first responsive keypad layout without UI library bloat |
| Testing | Go `testing`/`httptest`, Vitest + React Testing Library | Fast, behavior-oriented unit and integration testing |
| Containerization | Docker + Docker Compose (Go distroless + Nginx) | Reproducible multi-stage production builds with same-origin reverse proxy |

---

## 4. Prerequisites

- **Go:** `>= 1.22` (tested with `go1.27.3`)
- **Node.js:** `>= 20` (tested with `v22.20.0`) and `npm` (`>= 10`)
- **Docker & Docker Compose:** *(Optional, for containerized execution)*

---

## 5. Running Locally

> _Detailed step-by-step instructions are finalized in T10 once backend and frontend packages are in place._

### 1. Start the Backend (`:8080`)
```powershell
cd backend
go run ./cmd/server
```

### 2. Start the Frontend (`:5173`)
```powershell
cd frontend
npm install
npm run dev
```

---

## 6. Running with Docker

```powershell
docker compose up --build
```
- **Frontend UI:** `http://localhost:3000`
- **Backend API:** `http://localhost:8080`

---

## 7. API Reference

All calculation endpoints accept `POST` requests with `Content-Type: application/json`.

| Method | Endpoint | Request Body | Description |
|---|---|---|---|
| `POST` | `/api/v1/add` | `{"a": number, "b": number}` | Computes `a + b` |
| `POST` | `/api/v1/subtract` | `{"a": number, "b": number}` | Computes `a - b` |
| `POST` | `/api/v1/multiply` | `{"a": number, "b": number}` | Computes `a * b` |
| `POST` | `/api/v1/divide` | `{"a": number, "b": number}` | Computes `a / b` |
| `POST` | `/api/v1/power` | `{"a": number, "b": number}` | Computes `a ^ b` |
| `POST` | `/api/v1/sqrt` | `{"a": number}` | Computes `√a` |
| `POST` | `/api/v1/percentage` | `{"a": number}` | Computes `a / 100` |
| `GET` | `/healthz` | — | Health check (`{"status": "ok"}`) |

---

## 8. API Examples

### Addition (`curl.exe`)
```powershell
curl.exe -s -X POST http://localhost:8080/api/v1/add -H "Content-Type: application/json" -d "{\"a\": 12.5, \"b\": 7.5}"
```
```json
{ "result": 20 }
```

### Division by Zero (`Invoke-RestMethod` / `curl.exe`)
```powershell
curl.exe -s -X POST http://localhost:8080/api/v1/divide -H "Content-Type: application/json" -d "{\"a\": 10, \"b\": 0}"
```
```json
{
  "error": {
    "code": "DIVISION_BY_ZERO",
    "message": "division by zero is not allowed"
  }
}
```

---

## 9. Error Handling

All API errors return a consistent JSON envelope:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```

| Scenario | HTTP Status | Error Code |
|---|---|---|
| Malformed JSON, empty body, unknown fields, trailing data, `b` on unary op | `400 Bad Request` | `INVALID_REQUEST` |
| Missing required operand (`a` or `b`) | `400 Bad Request` | `MISSING_OPERAND` |
| Non-numeric operand (`"5"`, `true`, `null`) or float64 overflow in input | `400 Bad Request` | `INVALID_OPERAND` |
| Request body exceeds 1 KiB | `413 Payload Too Large` | `PAYLOAD_TOO_LARGE` |
| Division by zero | `422 Unprocessable Entity` | `DIVISION_BY_ZERO` |
| Square root of a negative number | `422 Unprocessable Entity` | `NEGATIVE_SQUARE_ROOT` |
| Result overflows to `±Inf` | `422 Unprocessable Entity` | `RESULT_OUT_OF_RANGE` |
| Result is `NaN` (e.g., `(-8)^0.5`) | `422 Unprocessable Entity` | `UNDEFINED_RESULT` |
| Unknown route under `/api/` | `404 Not Found` | `NOT_FOUND` |
| Non-POST method on an operation endpoint | `405 Method Not Allowed` | `METHOD_NOT_ALLOWED` |
| Unexpected panic | `500 Internal Server Error` | `INTERNAL_ERROR` |

---

## 10. Testing & Coverage

> _Full test inventory and verified coverage reports will be documented in `docs/TESTING.md` upon completion of T2–T7 and T10._

- **Backend:** `cd backend; go test ./... -coverprofile=coverage.out`
- **Frontend:** `cd frontend; npm run test:coverage`

---

## 11. Design Decisions

1. **Standard Library `net/http` over External Frameworks:** Go 1.22+ provides native method and path routing. For 8 routes and 2 lightweight middlewares, stdlib eliminates external dependencies while remaining 100% idiomatic.
2. **Per-Operation Endpoints Backed by a Single Generic Handler:** Exposing `/api/v1/add`, `/api/v1/divide`, etc. satisfies the REST requirement directly while avoiding code duplication by iterating over `calculator.Operations()`.
3. **Classic Calculator Keypad with Pure State Machine:** Modeling the keypad as a pure reducer (`reducer.ts`) makes every key transition deterministic and unit-testable without DOM or network overhead.
4. **Same-Origin Proxy in Dev and Prod:** Vite proxies `/api` in development and Nginx proxies `/api/` in Docker, avoiding CORS complexity.

---

## 12. Assumptions

- **Immediate Execution (Left-to-Right):** Chained binary operations evaluate immediately as entered (e.g., `2 + 3 × 4 =` evaluates `(2 + 3) × 4 = 20`), matching standard desktop/mobile calculators.
- **Unary Percentage:** Pressing `%` divides the current displayed value by `100` via `/api/v1/percentage`.
- **IEEE 754 `float64` Precision:** Numbers are represented as standard 64-bit floats on the backend and formatted to up to 15 significant digits on the frontend display.
- **POST for Calculations:** Calculation endpoints use `POST` with a JSON body to enforce strict numeric type checking.

---

## 13. Future Improvements

- Expression mode with operator precedence and parentheses.
- Contextual percentage mode (e.g., `50 + 10% = 55`).
- `GET /api/v1/operations` discovery endpoint so the frontend dynamically learns operation metadata.
- Calculation history tape.

---

## 14. AI Usage & Prompts

All AI prompts and instructions used during the architecture, planning, and implementation of this project are logged verbatim in [`PROMPTS.md`](./PROMPTS.md).
