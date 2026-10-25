# AI Prompts & Development Log

## Introduction

This document records **verbatim** all prompts and instructions used during the design, planning, implementation, testing, and documentation of the **Sezzle Full-Stack Calculator** technical assessment, in accordance with Sezzle's instructions (*"Share any prompts you used in your work"*).

### AI Workflow & Human Oversight
- **Environment:** Google Antigravity IDE
- **Developer (Human-in-the-Loop):** Juan Luis Vergara Novoa — responsible for all architectural decisions, scope approvals, UX choices, diff reviews, manual testing, and Git commits/pushes.
- **Model Orchestration:**
  - **Gemini 3.8 Flash:** Initial requirements analysis and environment check.
  - **Claude Opus 5.5:** Software architecture, technical planning, API contract design, state machine specification, backend implementation, and reducer logic.
  - **Gemini 4 Argon:** Repository bootstrap completion, frontend UI/CSS/accessibility, Docker configuration, and cross-model code review.
- **Logging Policy:** Prompts are logged at the time of execution in their original language (Spanish or English) without paraphrasing or post-hoc reconstruction.

---

## Prompt Index

| # | Phase | Task / Topic | Model | Outcome |
|---|---|---|---|---|
| [Prompt #1](#prompt-1--initial-requirements-understanding) | Planning | Initial Requirements Understanding | Gemini 3.8 Flash (High) | Accepted |
| [Prompt #2](#prompt-2--architecture--technical-plan) | Planning | Architecture & Technical Plan | Claude Opus 5.5 (High) | Modified (Refined via developer feedback in Prompt #3) |
| [Prompt #3](#prompt-3--plan-review--definitive-consolidation) | Planning | Plan Review & Definitive Consolidation | Claude Opus 5.5 (High) | Accepted (`implementation_plan.md` finalized; Go 1.27.3 installed) |
| [Prompt #4](#prompt-4--execute-t1-repository-bootstrap-interrupted) | Implementation (T1) | Execute T1 — Repository Bootstrap (Initial Attempt) | Claude Opus 5.5 (Medium) | Modified (Interrupted after `git init` and `.git/info/exclude`; completed in Prompt #5) |
| [Prompt #5](#prompt-5--execute-t1-repository-bootstrap-completion) | Implementation (T1) | Execute T1 — Repository Bootstrap (Completion) | Gemini 4 Argon (High) | Accepted |
| [Prompt #6](#prompt-6--execute-t2-backend-domain-interrupted) | Implementation (T2) | Execute T2 — Backend Domain (Initial Attempt) | Claude Opus 5.5 (High) | Modified (Implemented `go.mod`, `calculator.go`, `calculator_test.go` with 100% coverage; interrupted before logging prompt) |
| [Prompt #7](#prompt-7--recover--verify-t2-backend-domain) | Implementation (T2) | Recover & Verify T2 — Backend Domain | Gemini 4 Argon (High) | Accepted |
| [Prompt #8](#prompt-8--approve--commit-t1-and-t2) | Implementation (T1/T2) | Approve & Commit T1 and T2 | Gemini 4 Argon (High) | Accepted (Created Conventional Commits for T1 and T2) |
| [Prompt #9](#prompt-9--execute-t3-api--server) | Implementation (T3) | Execute T3 — API + Server | Gemini 4 Argon (High) | Accepted |
| [Prompt #10](#prompt-10--execute-t4-frontend-scaffold) | Implementation (T4) | Execute T4 — Frontend Scaffold | Gemini 4 Argon (High) | Accepted |
| [Prompt #11](#prompt-11--execute-t5-frontend-client--formatter--types) | Implementation (T5) | Execute T5 — Frontend Client + Formatter + Types | Gemini 4 Argon (High) | Accepted |
| [Prompt #12](#prompt-12--execute-t6-calculator-state-machine-reducer--keys) | Implementation (T6) | Execute T6 — Calculator State Machine (Reducer + Keys) | Gemini 4 Argon (High) | Accepted |
| [Prompt #13](#prompt-13--review--fix-unary-chaining-with-pending-binary-operation-t6) | Implementation (T6) | Review & Fix Unary Chaining with Pending Binary Operation (T6) | Gemini 4 Argon (High) | Modified (Refined in Prompts #14–#15 to eliminate `WeakSet`/`WeakMap` identity state) |
| [Prompt #14](#prompt-14--architectural-review-of-weaksetcalculatorstate-purity-t6) | Implementation (T6) | Architectural Review of `WeakSet<CalculatorState>` Purity (T6) | Gemini 4 Argon (High) | Accepted (Analyzed value collision and presented Options A/B/C) |
| [Prompt #15](#prompt-15--adopt-option-a-value-deterministic-reducer-state-t6) | Implementation (T6) | Adopt Option A: Value-Deterministic Reducer State (T6) | Gemini 4 Argon (High) | Accepted |
| [Prompt #16](#prompt-16--verify-reducer-code-transitions--stale-request-handling-t6) | Implementation (T6) | Verify Reducer Code Transitions & Stale Request Handling (T6) | Gemini 4 Argon (High) | Accepted |
| [Prompt #17](#prompt-17--inspect-diff--commit-t6-value-deterministic-reducer) | Implementation (T6) | Inspect Diff & Commit T6 Value-Deterministic Reducer | Gemini 4 Argon (High) | Accepted |
| [Prompt #18](#prompt-18--execute-t7-hook--ui) | Implementation (T7) | Execute T7 — Hook + UI | Gemini 4 Argon (High) | Accepted |
| [Prompt #19](#prompt-19--acceptance-review--integration-test-hardening-for-t7) | Implementation (T7) | Acceptance Review & Integration Test Hardening for T7 | Gemini 4 Argon (High) | Accepted |
| [Prompt #20](#prompt-20--approve--commit-t7) | Implementation (T7) | Approve & Commit T7 | Gemini 4 Argon (High) | Accepted (Created Conventional Commit for T7) |

---

## Phase 1 — Planning & Architecture

### Prompt #1 — Initial Requirements Understanding

- **Phase:** Planning
- **Model:** Gemini 3.8 Flash (High)
- **Objective:** Understand the Sezzle full-stack calculator assignment requirements, constraints, deliverables, and inspect the initial workspace without writing code.
- **Outcome:** Accepted — Summarized functional/non-functional requirements, deliverables, and verified Node.js and Docker availability while identifying that Go was not yet installed.
- **Files Affected:** None (read-only analysis)

**Verbatim Prompt:**

```text
Hola, tengo una asignacion ha realizar un proyecto especifco, por ahora quiero que unicamente entiedas lo que se nos esta pidiendo. Te dejo la asignacion la cual es la siguiente:

Estimado Juan Luis Vergara Novoa,

¡Gracias por tu continuo interés en Sezzle! Nos entusiasma seguir ayudándote a avanzar en nuestro proceso y te agradecemos sinceramente que hayas dedicado tiempo a completar el examen Wonderlic.

Como siguiente paso, complete lo siguiente en los próximos 5 días hábiles.

Objetivo
Desarrollar una aplicación de calculadora full-stack con un frontend en React y un microservicio backend. El frontend debe consumir la API del backend para realizar operaciones aritméticas básicas y avanzadas. Priorizar un diseño limpio, código mantenible y una arquitectura comprobable. Requisitos
Funcional
Operaciones:
Suma, resta, multiplicación, división
Opcional: Exponenciación, raíz cuadrada, porcentaje
Interfaz de usuario (React):
Interfaz de usuario intuitiva para introducir datos y mostrar resultados.
Validación de entrada y manejo de errores
Diseño adaptable (compatibilidad básica con dispositivos móviles)
Backend (API REST):
Exponer los puntos finales para las operaciones de la calculadora.
Validar la entrada y gestionar los casos excepcionales (división por cero, datos no válidos).
Devuelve los resultados en formato JSON.
No funcional
Código limpio, legible e idiomático (tanto para el frontend como para el backend).
Pruebas unitarias que cubren la funcionalidad clave para ambas capas.
Documentación: instrucciones de configuración, uso de la API y fundamentos del diseño.
Opcional: Dockerfile para despliegue full-stack
Restricciones
Desarrollo frontend: React (se prefiere TypeScript)
Backend: Se prefiere Go
Entregables
Repositorio Git con código de frontend y backend
README con instrucciones de configuración, ejemplos de API y decisiones de diseño.
Informe de pruebas unitarias y cobertura
Opcional: Dockerfile para ejecutar el frontend y el backend juntos.
Instrucciones
Utilice cualquier herramienta de IA que desee.
Dedica entre 2 y 4 horas a esta tarea. Prioriza la corrección, la claridad y la facilidad de mantenimiento por encima de las funciones adicionales.
Sube tu solución a GitHub, GitLab u otro repositorio Git .
Comparta con nosotros el enlace del repositorio para su evaluación.
Comparte cualquier indicación que hayas utilizado en tu trabajo.
Asegúrate de que tu archivo README incluya:
Instrucciones de configuración
Cómo ejecutar el frontend y el backend
Ejemplos de llamadas a la API (si se utiliza REST)
Decisiones o suposiciones de diseño
```

---

### Prompt #2 — Architecture & Technical Plan

- **Phase:** Planning
- **Model:** Claude Opus 5.5 (High)
- **Objective:** Inspect the workspace and produce a pragmatic, executable 14-section architectural and implementation plan (`implementation_plan.md`) with open decisions for developer approval.
- **Outcome:** Modified — The core backend architecture (Go stdlib `net/http`, per-operation endpoints with a generic handler, `float64`), Docker topology, and testing strategy were approved, while the developer requested a classic calculator keypad + display UI instead of a two-input form and local-only exclusion for `.agents/` and `AGENTS.md`.
- **Files Affected:** `implementation_plan.md` (planning artifact)

**Verbatim Prompt:**

```text
Actúa como un **Senior Software Engineer / Software Architect** encargado de planificar una solución profesional para una este assignment.

Tu objetivo en esta etapa NO es implementar el proyecto. Tu objetivo es **analizar los requisitos, inspeccionar el workspace y producir un plan técnico preciso, pragmático y ejecutable** que posteriormente utilizaremos para implementar la solución.

## CONTEXTO

Estoy realizando una prueba técnica para Sezzle.

> Desarrollar una aplicación de calculadora full-stack con un frontend en React y un microservicio backend. El frontend debe consumir la API del backend para realizar operaciones aritméticas básicas y avanzadas. Priorizar un diseño limpio, código mantenible y una arquitectura comprobable.

### Requisitos funcionales

Operaciones obligatorias:

- Suma
- Resta
- Multiplicación
- División

Operaciones opcionales:

- Exponenciación
- Raíz cuadrada
- Porcentaje

### Frontend

- React
- TypeScript es preferido
- Interfaz intuitiva para introducir datos y mostrar resultados
- Validación de entrada
- Manejo de errores
- Diseño adaptable / responsive básico para dispositivos móviles

### Backend

- Go es el lenguaje seleccionado (evalua usar una biblioteca de backend como Chi)
- API REST
- Exponer endpoints para las operaciones de la calculadora
- Validar entradas
- Manejar casos excepcionales, especialmente división por cero
- Devolver resultados en JSON

### Requisitos no funcionales

- Código limpio, legible e idiomático
- Código mantenible
- Arquitectura comprobable/testable
- Pruebas unitarias para la funcionalidad clave tanto del frontend como del backend
- Documentación de configuración, uso de la API y decisiones de diseño

### Entregables

1. Repositorio Git con frontend y backend
2. README con:
   - configuración
   - ejecución del frontend
   - ejecución del backend
   - ejemplos de API
   - decisiones y suposiciones de diseño
3. Informe de pruebas unitarias y cobertura
4. Dockerfile / Docker opcional para despliegue full-stack
5. Sezzle solicita compartir las indicaciones/prompts utilizados durante el desarrollo

### Restricción importante

Sezzle recomienda dedicar **2–4 horas** a la tarea.

Por lo tanto, la solución debe priorizar:

1. Corrección
2. Claridad
3. Mantenibilidad
4. Testabilidad
5. Calidad de la implementación

por encima de funcionalidades adicionales o sobreingeniería.

## ENTORNO

Estoy trabajando en **Google Antigravity** y utilizaré agentes/modelos de IA durante el desarrollo.

En esta primera etapa quiero que tú, Claude Opus 5.5, actúes como el **arquitecto principal y responsable de la planificación técnica**.

No quiero que implementes código todavía.

---

# FASE 1 — INSPECCIÓN DEL WORKSPACE

Antes de proponer una arquitectura definitiva:

1. Inspecciona el workspace actual.
2. Determina si ya existen archivos, proyectos, configuraciones o dependencias.
3. Identifica el sistema operativo/entorno relevante si es necesario.
4. Comprueba las herramientas disponibles que sean relevantes para el proyecto.
5. No modifiques archivos existentes durante esta fase.

Si el workspace está vacío, indícalo explícitamente.

No asumas que existen tecnologías, archivos o configuraciones que no hayas comprobado.

---

# FASE 2 — ANÁLISIS DE REQUISITOS

Analiza los requisitos de Sezzle y clasifícalos en:

### Obligatorios

Lo que debe estar implementado para considerar la prueba completa.

### Recomendados

Elementos que aportan calidad y que razonablemente deberían incluirse si caben dentro del límite de tiempo.

### Opcionales

Elementos que solamente debemos implementar si el núcleo de la aplicación ya está sólido.

Presta especial atención a no convertir funcionalidades opcionales en requisitos innecesarios.

---

# FASE 3 — DECISIONES ARQUITECTÓNICAS

Propón una arquitectura sencilla y profesional para este proyecto.

Debes decidir y justificar:

### Frontend

- React + TypeScript
- Herramienta de build recomendada
- Estrategia de componentes
- Gestión de estado
- Comunicación con el backend
- Manejo de errores
- Validación
- Testing

### Backend

Evalúa explícitamente las alternativas razonables para este proyecto:

- `net/http`
- `chi`
- otros frameworks ligeros de Go si consideras que tienen una ventaja clara

No elijas una tecnología únicamente porque sea popular.

La decisión debe considerar:

- simplicidad
- idiomaticidad de Go
- cantidad de dependencias
- mantenibilidad
- testabilidad
- tiempo disponible
- adecuación a una prueba técnica pequeña

### API

Diseña el contrato de la API REST.

Define:

- endpoints
- métodos HTTP
- request bodies
- response bodies
- códigos HTTP
- formato de errores
- validaciones
- casos límite

Evalúa si es mejor:

A. utilizar un endpoint independiente por operación

o

B. utilizar un endpoint genérico de cálculo.

Elige una alternativa y explica por qué.

No quiero una API innecesariamente compleja.

---

# FASE 4 — MODELO DE DOMINIO Y LÓGICA

Define cómo debería separarse:

```
HTTP/API
   ↓
Handler/Controller
   ↓
Calculator/Business Logic
```

o la alternativa que consideres más apropiada profesioanlmente.

La lógica matemática debe ser independiente de HTTP para poder probarla fácilmente.

Define también cómo deberían representarse los errores.

Considera al menos:

- división por cero
- operandos inválidos
- operación inválida
- raíz cuadrada de número negativo, si implementamos sqrt
- valores faltantes
- valores no numéricos
- resultados no finitos (`NaN`, `Infinity`) cuando corresponda
- posibles problemas de overflow o límites numéricos

No implementes validaciones artificialmente complejas si no aportan valor real a esta prueba.

---

# FASE 5 — FUNCIONALIDADES

Determina el conjunto exacto de funcionalidades que recomiendas implementar dentro del límite de 2–4 horas.

Quiero una recomendación explícita:

### MVP obligatorio

Qué debemos terminar sí o sí.

### Valor añadido

Qué funcionalidades opcionales vale la pena añadir si el MVP está terminado.

### No hacer

Qué funcionalidades debemos evitar aunque parezcan interesantes.

La prioridad debe ser entregar una solución pequeña pero excelente antes que una solución grande e incompleta.

---

# FASE 6 — TESTING

Diseña una estrategia de pruebas para ambas capas.

## Backend

Determina:

- qué lógica debe probarse unitariamente
- qué casos normales
- qué edge cases
- si conviene utilizar table-driven tests
- qué partes deben probarse mediante HTTP handler tests
- cómo obtener cobertura

## Frontend

Determina:

- qué componentes necesitan pruebas
- qué comportamiento debe probarse
- interacción con botones
- llamadas al API
- resultados exitosos
- errores
- estados de loading
- validaciones

No quiero tests que simplemente comprueben detalles internos de implementación. Prioriza comportamiento observable.

Define también un objetivo razonable de cobertura.

No persigas artificialmente el 100% si eso requiere tests de poco valor.

---

# FASE 7 — ESTRUCTURA DEL REPOSITORIO

Propón la estructura final del repositorio.

Por ejemplo, evalúa una organización como:

```text
/
├── frontend/
├── backend/
├── README.md
├── PROMPTS.md
└── docker-compose.yml
```

Pero no asumas que esta estructura es obligatoria.

Dentro de cada aplicación define solamente las carpetas que tengan una razón clara de existir.

Quiero evitar una estructura empresarial exagerada para una aplicación pequeña.

Adicionalmente tener una carpeta para las Skills, que tambien evalues para estructurarla de la forma que consideres mas apropiada.

---

# FASE 8 — DOCKER

Evalúa si Docker realmente vale la pena para esta prueba.

Si lo recomiendas:

- explica qué debería contener
- cómo deberían comunicarse frontend y backend
- cómo se ejecutarían ambos
- qué parte debería ser producción y qué parte desarrollo

Si consideras que Docker podría poner en riesgo el límite de 2–4 horas, indícalo y establece que debe hacerse solamente después de completar y probar el MVP.

---

# FASE 9 — README Y ENTREGABLES

Define exactamente qué debería contener el README final.

Como mínimo:

- descripción del proyecto
- arquitectura
- tecnologías
- requisitos previos
- instalación
- ejecución local
- ejecución mediante Docker si se implementa
- API
- ejemplos de requests/responses
- manejo de errores
- testing
- cobertura
- decisiones de diseño
- suposiciones
- posibles mejoras futuras

También define qué debería contener `PROMPTS.md`, dado que Sezzle solicita compartir las indicaciones utilizadas durante el desarrollo.

No inventes prompts utilizados todavía. Solo define cómo deberíamos documentarlos.

---

# FASE 10 — PLAN DE IMPLEMENTACIÓN

Construye un roadmap concreto dividido en tareas pequeñas y ejecutables.

Cada tarea debe incluir:

- objetivo
- archivos que probablemente afectará
- dependencia respecto a otras tareas
- criterio de finalización
- pruebas que deben ejecutarse

Ordena las tareas para minimizar retrabajo.

Propón una distribución aproximada del tiempo, por ejemplo:

```text
Planificación       X min
Backend              X min
Testing backend      X min
Frontend             X min
Testing frontend     X min
Integración          X min
Documentación        X min
Revisión final       X min
```

No gastes una cantidad desproporcionada de tiempo en Docker o funcionalidades opcionales.

---

# FASE 11 — ESTRATEGIA DE USO DE AGENTES

Como este proyecto se desarrollará utilizando IA dentro de Antigravity, diseña también una estrategia de orquestación.

Indica qué tareas deberían ser realizadas por:

- Claude Opus 5.5
- Gemini 4 Argon
- un modelo más rápido/liviano, si resulta apropiado
- yo como desarrollador

No quiero delegar ciegamente todo el proyecto a un único agente.

Quiero que la IA ayude a implementar, pero que las decisiones importantes permanezcan bajo control humano.

Para cada agente especifica:

```
Modelo
↓
Responsabilidad
↓
Entrada que necesita
↓
Resultado esperado
↓
Cómo verificarlo
```

---

# FASE 12 — CALIDAD Y REVISIÓN

Define una checklist final que podamos utilizar antes de entregar el repositorio.

Debe cubrir:

### Funcionalidad
- [ ] operaciones
- [ ] validación
- [ ] errores
- [ ] integración frontend/backend

### Backend
- [ ] Go idiomático
- [ ] separación de responsabilidades
- [ ] API consistente
- [ ] HTTP status codes
- [ ] tests

### Frontend
- [ ] TypeScript correctamente utilizado
- [ ] componentes claros
- [ ] manejo de estados
- [ ] errores
- [ ] responsive
- [ ] tests

### Ingeniería
- [ ] sin código muerto
- [ ] sin dependencias innecesarias
- [ ] configuración reproducible
- [ ] README
- [ ] prompts documentados
- [ ] Docker, si se implementa

### Entrega
- [ ] repositorio limpio
- [ ] commits razonables
- [ ] sin secretos
- [ ] aplicación ejecutable desde cero

---

# REGLAS IMPORTANTES

1. **NO escribas código todavía.**
2. **NO crees archivos de implementación todavía.**
3. Primero inspecciona el workspace.
4. No agregues tecnologías solamente para impresionar al evaluador.
5. Evita sobreingeniería.
6. Prioriza una solución que un ingeniero pueda leer y entender rápidamente.
7. Cada dependencia debe tener una razón.
8. Cada capa arquitectónica debe justificar su existencia.
9. No asumas que "más funcionalidades" significa una mejor solución.
10. La aplicación debe ser fácil de probar.
11. El frontend debe consumir realmente el backend.
12. No implementes la lógica matemática principal directamente en el frontend.
13. Considera seguridad, robustez y manejo de errores, pero sin convertir una calculadora en una plataforma empresarial.
14. Mantén siempre presente la restricción de **2-4 horas, Max 5 horas**.
15. Si existe una decisión entre una solución sofisticada y una solución simple que cumple mejor los requisitos, favorece la solución simple.

---

# FORMATO DE TU RESPUESTA

Quiero que tu respuesta final de esta fase tenga exactamente estas secciones:

1. **Executive Summary**
2. **Workspace Assessment**
3. **Requirements Analysis**
4. **Recommended Architecture**
5. **API Design**
6. **Backend Design**
7. **Frontend Design**
8. **Testing Strategy**
9. **Repository Structure**
10. **Docker Assessment**
11. **Implementation Roadmap**
12. **AI Agent Orchestration**
13. **Final Quality Checklist**
14. **Open Decisions**

En **Open Decisions**, enumera únicamente las decisiones que necesiten mi aprobación antes de comenzar la implementación.

No implementes nada hasta que yo revise y apruebe este plan.
```

---

### Prompt #3 — Plan Review & Definitive Consolidation

- **Phase:** Planning
- **Model:** Claude Opus 5.5 (High)
- **Objective:** Consolidate all developer review comments into the definitive `implementation_plan.md` (switching UI to a classic keypad + display calculator with a pure state machine, keeping `.agents/` and `AGENTS.md` local via `.git/info/exclude`, resolving unary percentage, and installing the Go toolchain).
- **Outcome:** Accepted — Definitive `implementation_plan.md` approved and Go `1.27.3` verified and installed in user space.
- **Files Affected:** `implementation_plan.md` (planning artifact)

**Verbatim Prompt:**

```text
Comments on artifact URI: file:///c%3A/Users/user/.gemini/antigravity/brain/cbbe291a-d4dc-4981-9dc5-361c36bd9e91/implementation_plan.md

Selection:
>Router del backend: net/http estándar, sin dependencias (recomendado) — o chi.

Comment: "Sin dependencias si parece bien."

Selection:
>Estilo de API: endpoint por operación con handler genérico (recomendado) — o un único POST /api/v1/calculate.

Comment: "endpont por operacion como recomiendas"

Selection:
>Paradigma de UI: formulario estilo calculadora (A, operación, B, Calcular) (recomendado) — o teclado clásico de calculadora con pantalla (más riesgo y tiempo).

Comment: "teclado clasico de calculadora con pantalla (como app de calculadora)"

Selection:
>Tipo numérico: float64 documentando su precisión (recomendado) — o aritmética decimal exacta (librería externa; complica potencia/raíz).

Comment: "lo recomendado"

Selection:
>Operaciones opcionales: implementar las tres (potencia, √, %) (recomendado) — o solo las 4 obligatorias.

Comment: "Implementar las opcionales tambien"

Selection:
>Topología Docker: compose con 2 servicios, Go + Nginx (recomendado) — o un solo contenedor con Go sirviendo el frontend.

Comment: "el recomendado"

Selection:
>CI con GitHub Actions: incluir si sobra tiempo tras T8 (recomendado) — o no incluir.

Comment: "Incluir si al final todo esta correcto y se tiene la posibilidad"

Selection:
>Idioma de código y documentación: inglés (recomendado; Sezzle es una empresa de EE. UU.), con los prompts en su idioma original — o español.

Comment: "Ingles"

Selection:
>Versionar .agents/ y AGENTS.md en el repo entregado (recomendado, como evidencia del proceso con IA) — o mantenerlos solo en local.

Comment: "mentenerlos en local y el final evaluo yo para entregarlos"

Selection:
>Prerrequisito (acción tuya): instalar Go e iniciar Docker Desktop (T0), y confirmar que el remoto será GitHub.

Comment: "Puedes ayudarme instalando lo necesario?"

Selection:
>7. Frontend Design

Comment: "Ten en cuanta que el diseño de la calculadora que busco es como una de teclado y pantalla comun (como la app de calucladora)"

Ahora que revisaste mis comentarios sobre el plan anterior, quiero que consolides el diseño definitivo antes de comenzar la implementación.

Toma tu plan original y TODOS mis comentarios/correcciones como fuente de verdad.

Haz lo siguiente:

1. Incorpora explícitamente mis cambios.
2. Resuelve cualquier decisión que haya quedado abierta.
3. Elimina cualquier parte del plan que haya quedado obsoleta.
4. Verifica nuevamente que la solución sea proporcional a una prueba técnica de maximo 5 horas.
5. Define la arquitectura final.
6. Define el contrato final de la API.
7. Define la estructura final del repositorio.
8. Define la estrategia final de testing.
9. Define el orden exacto de implementación.
10. Identifica cualquier riesgo técnico antes de comenzar.

No implementes código todavía.

Al finalizar, presenta el plan de implementacion definitivo:

## IMPLEMENTATION PLAN

Debe contener las decisiones que consideraremos definitivas durante la implementación.

No agregues nuevas tecnologías, funcionalidades o capas arquitectónicas que no sean necesarias para cumplir los requisitos o mejorar claramente la calidad de la solución.

Quiero que este documento sea la referencia que utilizaremos para todas las siguientes tareas de implementación.
```

---

## Phase 2 — Implementation

### Prompt #4 — Execute T1: Repository Bootstrap (Interrupted)

- **Phase:** T1 — Repository Bootstrap
- **Model:** Claude Opus 5.5 (Medium)
- **Objective:** Initialize the Git repository, configure `.git/info/exclude`, and create the T1 bootstrap files.
- **Outcome:** Modified — Execution was interrupted after running `git init -b main` and adding `/.agents/` and `/AGENTS.md` to `.git/info/exclude`. Resumed and completed in Prompt #5.
- **Files Affected:** `.git/info/exclude`

**Verbatim Prompt:**

```text
Me parece bien. Ahora sigue las instrucciones:

Execute **T1 — Repository Bootstrap** from the approved `implementation_plan.md`.

Follow the approved plan exactly. Do not redesign the architecture or expand the scope.

### Tasks
1. Read `implementation_plan.md` and any existing workspace instructions.
2. Inspect the workspace and Git state before modifying anything.
3. Initialize Git if necessary.
4. Create only the files and configuration assigned to T1 in the approved plan, including the initial README skeleton and `PROMPTS.md`.
5. Configure `.gitignore`, `.gitattributes`, and `.git/info/exclude` as specified in the plan. Keep `.agents/` and `AGENTS.md` local-only; do not accidentally stage or commit them.
6. Record this prompt literally in `PROMPTS.md`, following the planned format. If the project’s prompt-logging skill is available, use it.
7. Run the T1 verification commands and inspect `git status` and the staged diff.

### Constraints
- Do not implement backend or frontend functionality.
- Do not install additional dependencies.
- Do not create Docker or CI configuration yet.
- Do not push to GitHub.
- Do not commit automatically unless the approved plan explicitly requires it and you have shown me the staged changes first.
- Do not overwrite existing files without inspecting their contents first.

### Final report
Summarize:
- files created or modified
- commands executed and their actual results
- Git status and any staged files
- confirmation that local-only agent instructions are not tracked
- any deviation from T1 or blocker

Stop after T1. Wait for my review before proceeding to T2.
```

---

### Prompt #5 — Execute T1: Repository Bootstrap (Completion)

- **Phase:** T1 — Repository Bootstrap
- **Model:** Gemini 4 Argon (High)
- **Objective:** Inspect actual workspace state after the interrupted T1 run and complete all remaining T1 files (`.gitignore`, `.gitattributes`, `AGENTS.md`, `.agents/skills/*`, `README.md`, `PROMPTS.md`), verifying local exclusion of `.agents/` and `AGENTS.md`.
- **Outcome:** Accepted — All T1 bootstrap files created and verified; `.agents/` and `AGENTS.md` confirmed ignored via `.git/info/exclude` and absent from `git status`.
- **Files Affected:** `.gitignore`, `.gitattributes`, `.git/info/exclude`, `AGENTS.md`, `.agents/skills/log-prompt/SKILL.md`, `.agents/skills/run-tests/SKILL.md`, `.agents/skills/add-operation/SKILL.md`, `.agents/skills/pre-delivery-review/SKILL.md`, `README.md`, `PROMPTS.md`

**Verbatim Prompt:**

```text
Execute **T1 — Repository Bootstrap** from the existing `implementation_plan.md`.

Claude's previous execution was interrupted before T1 was completed. The current workspace is reported to contain only `implementation_plan.md`. Treat that as unverified information and inspect the actual workspace before making changes.

### Objective

Complete T1 only, following the approved implementation plan exactly. Do not redesign the architecture, expand the scope, or begin implementing calculator functionality.

### Steps

1. Read `implementation_plan.md` completely, along with any workspace instructions that actually exist.
2. Inspect the current directory, existing files, and Git status. Do not assume a clean workspace or overwrite anything without inspecting it first.
3. Identify the exact files and configuration assigned to T1 in the approved plan.
4. Initialize Git only if needed.
5. Create or configure only the files explicitly assigned to T1. This includes the initial README skeleton, `PROMPTS.md`, `.gitignore`, `.gitattributes`, and `.git/info/exclude` where required by the plan.
6. Preserve `.agents/` and `AGENTS.md` as local-only files according to the plan. Ensure they are not accidentally tracked or staged. Do not delete existing files to achieve this.
7. Record this prompt verbatim in `PROMPTS.md`, following the approved logging format. If a relevant prompt-logging skill is actually available, use it.
8. Run the verification commands specified for T1. Report actual results; do not claim a check passed unless you executed it.
9. Inspect the final `git status` and any staged diff. Do not stage or commit files automatically unless the approved plan explicitly requires it.

### Constraints

- Do not implement any Go backend, REST endpoints, React components, calculator operations, or keyboard logic.
- Do not install dependencies or introduce new tools.
- Do not create Docker or CI configuration unless the approved plan explicitly assigns a specific initial file to T1.
- Do not create a GitHub repository or push anything remotely.
- Do not modify the approved plan.
- Do not silently skip a requirement. If the plan is ambiguous or a required action is blocked, explain the issue and stop rather than inventing a solution.
- Request my approval before any destructive action or action with external side effects.

### Final report

Provide:
1. Files created or modified and the purpose of each.
2. Verification commands executed and their actual results.
3. Current Git status and whether any files are staged.
4. How you verified that local-only agent instructions are not tracked.
5. Any deviation, unresolved issue, or blocker.
6. A clear PASS/FAIL assessment of T1, with evidence.

**Stop after T1. Do not proceed to T2
```

---

### Prompt #6 — Execute T2: Backend Domain (Interrupted)

- **Phase:** T2 — Backend Domain
- **Model:** Claude Opus 5.5 (High)
- **Objective:** Implement the pure Go mathematical domain package (`internal/calculator`) and comprehensive table-driven unit tests (`calculator_test.go`) for all 7 operations and edge cases.
- **Outcome:** Modified — Created `backend/go.mod`, `backend/internal/calculator/calculator.go`, and `backend/internal/calculator/calculator_test.go` (105 subtests passing with 100.0% statement coverage), but reached the session usage limit right before updating `PROMPTS.md`. Completed and verified in Prompt #7.
- **Files Affected:** `backend/go.mod`, `backend/internal/calculator/calculator.go`, `backend/internal/calculator/calculator_test.go`

**Verbatim Prompt:**

```text
Execute **T2 — Backend Domain** from the existing `implementation_plan.md`.

T1 has been reported as complete, but you must inspect the actual workspace before proceeding. Follow the approved plan and the existing `AGENTS.md` instructions if available. Do not redesign the architecture.

### Objective

Implement the backend's pure mathematical domain logic in Go and its unit tests, completing T2 only.

### Step 1 — Preflight

1. Read the relevant sections of `implementation_plan.md`, especially the T2 task, acceptance criteria, architecture decisions, and testing requirements.
2. Read `AGENTS.md` and the applicable local skills if they exist.
3. Inspect the current file tree and Git status.
4. Confirm which files T2 is allowed to create or modify.
5. Check the installed Go version using `go version`. If the command fails, report the blocker rather than installing or changing tools.

Do not overwrite existing files without inspecting them first.

### Step 2 — Implement the domain layer

Implement only the pure Go arithmetic domain functionality assigned to T2 in the approved plan.

Requirements:

- Follow the exact operation names, function signatures, package layout, error conventions, and numeric behavior specified in `implementation_plan.md`.
- Cover the seven planned operations: addition, subtraction, multiplication, division, exponentiation, square root, and percentage, if those are indeed assigned to T2.
- Keep the domain logic independent of HTTP, JSON, frontend code, and network concerns.
- Validate domain inputs and handle invalid mathematical cases according to the approved plan. Pay particular attention to division by zero, square roots of negative values, non-finite values, and exponentiation edge cases.
- Do not invent behavior where the plan is ambiguous. Identify the ambiguity and follow the plan's documented decisions or stop for clarification if it affects correctness.
- Keep the implementation idiomatic, simple, maintainable, and free of unnecessary dependencies.

### Step 3 — Unit tests

Create comprehensive Go unit tests for the domain functionality.

Include, where applicable:

- Ordinary positive and negative inputs.
- Zero inputs and identity cases.
- Decimal values.
- Division by zero.
- Negative square-root inputs.
- Exponentiation edge cases, including zero and negative exponents if supported.
- Percentage behavior as explicitly defined in the plan.
- Invalid or non-finite inputs and results, where the domain contract requires handling them.

Tests must verify expected values and expected errors. Do not weaken tests simply to make them pass.

### Step 4 — Verify

1. Run `gofmt` on the Go files you created or modified.
2. Run the relevant Go unit tests.
3. Run `go test ./...` from the correct Go module directory if the project structure supports it.
4. Run `go vet ./...` if applicable and supported by the current setup.
5. Inspect the final diff and Git status.
6. Record this prompt verbatim in `PROMPTS.md`, using the existing prompt-logging skill and format. Do not rewrite or silently omit the prompt.

Report actual command outputs and any failures. Do not claim tests passed unless they were executed successfully.

### Strict scope limits

- Do not implement HTTP handlers, REST routes, JSON request/response models, or middleware.
- Do not implement React, frontend state, keypad behavior, or UI components.
- Do not add Docker, CI, or external dependencies.
- Do not push to a remote repository.
- Do not commit automatically.
- Do not modify `implementation_plan.md`.
- Do not proceed to T3.

### Final report

Provide:

1. Files created or modified.
2. A concise description of the domain API and its error behavior.
3. Tests added and the cases they cover.
4. Verification commands and their actual results.
5. Any ambiguity, deviation, or unresolved issue.
6. Git status and confirmation that no commit or push occurred.
7. A PASS/FAIL assessment of T2 supported by evidence.

Stop after T2 and wait for my review before proceeding.
```

---

### Prompt #7 — Recover & Verify T2: Backend Domain

- **Phase:** T2 — Backend Domain
- **Model:** Gemini 4 Argon (High)
- **Objective:** Inspect the workspace after the interrupted T2 session, verify the existing `internal/calculator` implementation and unit tests without duplicating work, and record Prompts #6 and #7 verbatim in `PROMPTS.md`.
- **Outcome:** Accepted — Confirmed `backend/go.mod`, `backend/internal/calculator/calculator.go`, and `backend/internal/calculator/calculator_test.go` are complete and pass `gofmt`, `go vet ./...`, and `go test ./...` with 100.0% coverage; updated `PROMPTS.md`.
- **Files Affected:** `PROMPTS.md`

**Verbatim Prompt:**

```text
Continue the previously interrupted **T2 — Backend Domain** task.

The previous Claude Opus 5.5 session reached the weekly usage limit while T2 was in progress. **Do not restart T2 from scratch and do not assume that T2 is complete or incomplete. Inspect the actual workspace and determine the exact current state first. An follow strictly the instructiosn previously given for T2**

The approved architecture and requirements remain defined by:

- `implementation_plan.md`
- `AGENTS.md`, if present
- the existing project files
- the decisions already established during T1 and T2

## IMPORTANT: RECOVERY FIRST

Before modifying anything:

1. Read `implementation_plan.md`.
2. Read `AGENTS.md` and any applicable local skills.
3. Inspect the complete current file tree relevant to the backend.
4. Inspect `git status` and the current diff.
5. Identify exactly what T2 implementation already exists.
6. Inspect the existing Go source files and tests.
7. Determine which parts of T2 are:
   - complete and correct,
   - partially implemented,
   - missing,
   - implemented but unverified.
8. Do NOT recreate files or rewrite working code merely because Claude was interrupted.

If T2 is already complete, do not implement it again. Instead, verify it thoroughly and report its status.

## T2 SCOPE

T2 is **Backend Domain** only.

Its responsibility is the pure mathematical domain logic and unit tests defined by the approved plan.

It must remain independent from:

- HTTP
- REST routes
- JSON
- frontend
- React
- Docker
- CI

Do not begin T3.

## IMPLEMENTATION REQUIREMENTS

For the portions of T2 that are incomplete:

1. Implement only what is explicitly required by `implementation_plan.md`.
2. Follow the already-approved architecture and naming decisions.
3. Keep the mathematical logic independent of HTTP and infrastructure.
4. Use idiomatic Go.
5. Avoid unnecessary dependencies.
6. Preserve existing correct work.

The approved calculator behavior includes the seven planned operations:

- addition
- subtraction
- multiplication
- division
- exponentiation
- square root
- percentage

However, **do not assume that every operation is currently missing**. Inspect the workspace first.

Pay particular attention to the already-approved behavior for:

- division by zero
- square root of negative numbers
- percentage
- zero values
- negative values
- decimal values
- exponentiation edge cases
- `NaN`
- `Infinity`
- non-finite results
- any other edge cases explicitly defined in `implementation_plan.md`

Do not invent new mathematical behavior if the plan already specifies it.

## TESTS

Inspect the tests already created by the previous agent.

Add or correct tests only where necessary.

Tests should cover the actual domain contract rather than implementation details.

Use table-driven tests where appropriate.

At minimum, verify normal cases and relevant edge/error cases for every implemented operation.

Run:

- `gofmt`
- the relevant Go tests
- `go test ./...`
- `go vet ./...` where applicable

Do not claim that a test passed unless you actually executed it.

## PROMPT LOG

Because Sezzle explicitly asks for the AI prompts used during development:

- Preserve the existing `PROMPTS.md`.
- Do not delete or rewrite previous entries.
- Add this exact prompt to the existing prompt log using the project's established prompt-logging mechanism/skill.
- Do not fabricate prompts or execution history.

## STRICT BOUNDARIES

Do NOT:

- implement REST endpoints
- implement HTTP handlers
- implement JSON models
- implement React
- implement the calculator keypad
- implement Docker
- implement CI
- modify `implementation_plan.md`
- push to GitHub
- commit automatically
- proceed to T3

If you discover that a T2 decision is genuinely ambiguous and cannot be resolved from the approved plan or existing implementation, stop and report the ambiguity instead of making a large architectural decision yourself.

## FINAL VERIFICATION

After completing the remaining T2 work:

1. Run `gofmt`.
2. Run all relevant tests.
3. Run `go test ./...`.
4. Run `go vet ./...` if applicable.
5. Inspect the final Git diff.
6. Inspect Git status.
7. Confirm that no unrelated files were modified.
8. Confirm that T3 has not been started.

Then provide a recovery report with:

### T2 Recovery Assessment

- What was already completed when you took over.
- What was missing.
- What you changed.
- What you deliberately left untouched.

### Verification

For every command executed, provide the actual result.

### Tests

List the important domain cases covered.

### Git

Report the current status and whether anything was staged or committed.

### Remaining Work

List anything still required to consider T2 complete.

### Final Status

Choose exactly one:

- `T2 PASS`
- `T2 PASS WITH NOTES`
- `T2 INCOMPLETE`
- `T2 BLOCKED`

**Stop after T2. Do not continue to T3.** And also give me your opinion on the github repo, should we constantly commit? so that it looks better proggress when reviewed by sezzle, I think it could be better, in which case whe whould follow the Conventional commits convention.
```

---

### Prompt #8 — Approve & Commit T1 and T2

- **Phase:** T1 / T2 — Git Commit
- **Model:** Gemini 4 Argon (High)
- **Objective:** Stage and commit the reviewed T1 (Repository Bootstrap) and T2 (Backend Domain) deliverables using Conventional Commits while keeping `.agents/` and `AGENTS.md` untracked locally.
- **Outcome:** Accepted — Created two atomic commits (`chore: bootstrap repository structure and documentation` and `feat(backend): implement pure calculator domain and unit tests`).
- **Files Affected:** `.gitattributes`, `.gitignore`, `README.md`, `PROMPTS.md`, `backend/go.mod`, `backend/internal/calculator/calculator.go`, `backend/internal/calculator/calculator_test.go`

**Verbatim Prompt:**

```text
Reviewed. Looks good. Commit T1 and T2. 
```

---

### Prompt #9 — Execute T3: API + Server

- **Phase:** T3 — Backend HTTP API & Server
- **Model:** Gemini 4 Argon (High)
- **Objective:** Implement the Go standard library HTTP API layer (`internal/api`: router, generic operation handler, JSON decoding/validation, error mapping, logging & panic recovery middlewares), server entrypoint (`cmd/server/main.go`), and comprehensive `httptest` test suite (`handler_test.go`), plus verify with `go test`, coverage, and live `curl.exe` requests.
- **Outcome:** Accepted — All 6 T3 files implemented with zero external dependencies, passing `gofmt`, `go vet`, `go test ./...` with high coverage, and live HTTP verification via `curl.exe`.
- **Files Affected:** `backend/internal/api/errors.go`, `backend/internal/api/handler.go`, `backend/internal/api/middleware.go`, `backend/internal/api/router.go`, `backend/internal/api/handler_test.go`, `backend/cmd/server/main.go`, `PROMPTS.md`

**Verbatim Prompt:**

```text
Execute **T3 — API + Server**, following `implementation_plan.md` as the definitive specification. Remenber to follow whats on the plan over what the prompt says in case something differs or its incoherent, and do it in the way you consider more appropiate for the plan, the assignment, functionality, and profesionalism.

T1 and T2 are complete and committed:

Implement T3 only. 

### 1. Inspect the existing project

Before modifying anything:

1. Read `implementation_plan.md`, especially sections 3, 4, 6, 10, and 12.
2. Read `AGENTS.md` and the applicable local skills if available.
3. Inspect Git status, recent commits, `backend/go.mod`, and the existing calculator implementation and tests.
4. Confirm the current module path and Go toolchain.
5. Preserve existing T1 and T2 work.

### 2. Implement the exact backend structure specified in section 4

Create the T3 files:

- `backend/internal/api/router.go`
- `backend/internal/api/handler.go`
- `backend/internal/api/errors.go`
- `backend/internal/api/middleware.go`
- `backend/internal/api/handler_test.go`
- `backend/cmd/server/main.go`

Follow the approved design:

- Use Go's standard library `net/http` router, compatible with Go 1.22 or later.
- Use one generic operation handler.
- Register operation routes by iterating over `calculator.Operations()`.
- Reuse `calculator.Calculate` and the existing domain sentinel errors.
- Keep the three existing architectural layers: `cmd/server`, `internal/api`, and `internal/calculator`.
- Add no external dependencies and no separate service or repository layer.

### 3. Follow the API contract in section 3 exactly

Implement these endpoints:

| Method | Route | JSON body |
|---|---|---|
| POST | `/api/v1/add` | `{"a": n, "b": n}` |
| POST | `/api/v1/subtract` | `{"a": n, "b": n}` |
| POST | `/api/v1/multiply` | `{"a": n, "b": n}` |
| POST | `/api/v1/divide` | `{"a": n, "b": n}` |
| POST | `/api/v1/power` | `{"a": n, "b": n}` |
| POST | `/api/v1/sqrt` | `{"a": n}` |
| POST | `/api/v1/percentage` | `{"a": n}` |
| GET | `/healthz` | No body |

Successful operations return HTTP `200`, `Content-Type: application/json`, and `{"result": n}`.

Errors must use the exact JSON envelope:

`{"error":{"code":"ERROR_CODE","message":"error message"}}`

Implement the status codes, error codes, and behavior defined in section 3 of the plan:

- `400 INVALID_REQUEST`: malformed or empty JSON, unknown fields, trailing JSON data, or an extra operand for a unary operation.
- `400 MISSING_OPERAND`: a required operand is absent.
- `400 INVALID_OPERAND`: a nonnumeric operand, explicit `null`, or a number outside the `float64` range.
- `413 PAYLOAD_TOO_LARGE`: request body larger than 1 KiB.
- `422 DIVISION_BY_ZERO`: division by zero.
- `422 NEGATIVE_SQUARE_ROOT`: square root of a negative number.
- `422 RESULT_OUT_OF_RANGE`: an infinite result.
- `422 UNDEFINED_RESULT`: a `NaN` result.
- `404 NOT_FOUND`: an unknown route under `/api/`.
- `405 METHOD_NOT_ALLOWED`: an incorrect method on an operation route, with `Allow: POST`.
- `500 INTERNAL_ERROR`: an unexpected panic.

Follow the plan's additional requirements:

- Decode JSON with `json.Decoder` and `DisallowUnknownFields`.
- Use `*float64` to distinguish missing operands from zero.
- Distinguish `json.UnmarshalTypeError` from JSON syntax errors.
- Treat explicit `null` as `INVALID_OPERAND`, not as a missing operand.
- Verify that the second JSON decode returns `io.EOF`.
- Normalize negative zero to zero through the existing domain behavior.
- Limit the body to 1 KiB with `http.MaxBytesReader`.

Do not invent alternative status codes, error codes, routes, or response schemas.

### 4. Implement the approved middleware and server startup

Follow section 4:

- Middleware provides request logging with `slog` and panic recovery that returns a `500 INTERNAL_ERROR` JSON response.
- The server reads `PORT`, defaulting to `8080`.
- Configure `http.Server` with the specified read, write, idle, and read-header timeouts.
- Implement graceful shutdown using `signal.NotifyContext`.
- Keep `main.go` focused on server wiring, with no arithmetic or handler business logic.

### 5. Implement the tests specified in section 6

In `handler_test.go`, use Go's `testing` package and `net/http/httptest`, with table-driven tests where appropriate.

Cover the cases listed in section 6:

- HTTP 200 for each operation route.
- Malformed JSON and empty bodies.
- Unknown fields and trailing JSON data.
- Missing operands.
- `"a":"5"`, `"a":null`, and `1e400`.
- An extra `b` operand for `sqrt`.
- A body larger than 1 KiB returning 413.
- Division by zero and negative square root returning 422 with the correct error envelope.
- Unknown API routes returning 404 JSON.
- GET on an operation route returning 405 and `Allow: POST`.
- Response `Content-Type`.
- `/healthz` returning `{"status":"ok"}`.

Keep the existing calculator tests unchanged unless an actual incompatibility with the approved plan is discovered. Do not duplicate the domain implementation in HTTP tests.

### 6. Verify against the plan

From the `backend` module directory, execute and report the actual results of:

1. `gofmt` on modified Go files.
2. `gofmt -l .`
3. `go vet ./...`
4. `go test ./... -coverprofile=coverage.out`
5. `go tool cover -func=coverage.out`

Verify the plan's coverage targets

Also run the server with `go run ./cmd/server` and verify the API using `curl.exe`, as required by T3's acceptance criteria. Use a separate terminal for requests if necessary. Do not claim the live API check succeeded unless it was actually performed.

Do not modify `implementation_plan.md` or claim that an unmet coverage target passed.

### 7. Record the prompt and report results

Preserve all existing entries in `PROMPTS.md`. Record this exact prompt verbatim using the
```

---

### Prompt #10 — Execute T4: Frontend Scaffold

- **Phase:** T4 — Frontend Scaffold
- **Model:** Gemini 4 Argon (High)
- **Objective:** Scaffold the React + TypeScript + Vite frontend under `frontend/`, configure the `/api` dev proxy to `http://localhost:8080`, set up Vitest (`jsdom`, React Testing Library, `user-event`, `jest-dom`, `@vitest/coverage-v8`), remove starter boilerplate, and verify `npm run build`, `npm run lint`, `npm run typecheck`, and `npm test`.
- **Outcome:** Accepted — Created the clean Vite `react-ts` scaffold with strict TypeScript, ESLint, Vitest + coverage configuration, and verified `build`, `lint`, `typecheck`, and `test`.
- **Files Affected:** `frontend/package.json`, `frontend/package-lock.json`, `frontend/tsconfig.json`, `frontend/tsconfig.app.json`, `frontend/tsconfig.node.json`, `frontend/vite.config.ts`, `frontend/eslint.config.js`, `frontend/index.html`, `frontend/src/vite-env.d.ts`, `frontend/src/test/setup.ts`, `frontend/src/index.css`, `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/App.test.tsx`, `PROMPTS.md`

**Verbatim Prompt:**

```text
Execute **T4 — Frontend Scaffold**, following `implementation_plan.md` as the specification. If this prompt conflicts with the plan, follow the plan.

T1, T2, and T3 are complete and committed. Implement T4 only.

### 1. Inspect before modifying

1. Read `implementation_plan.md`, especially sections 0, 5, 7, 10, 11, and 12.
2. Read `AGENTS.md` and the applicable local skills if available.
3. Inspect Git status, recent commits, existing `PROMPTS.md`, and the backend module.
4. Confirm the installed Node.js and npm versions.
5. Preserve existing work and do not modify backend implementation.

### 2. Create the frontend scaffold

Create the base project under `frontend/` using **Vite with the React TypeScript template**.

Follow the approved frontend stack in section 5:
- React and TypeScript with strict type checking.
- Vite.
- Plain CSS, using CSS variables and CSS Grid where appropriate.
- Native `fetch` for future API calls.
- npm and a committed `package-lock.json`.
- No state-management, UI, or CSS framework dependencies.

Configure the project structure and scripts needed for later tasks. Set up the planned Vitest testing environment, including `jsdom`, React Testing Library, `user-event`, `jest-dom`, and `@vitest/coverage-v8`, using only the dependencies specified in section 5.

Configure:
- Vite development proxy for `/api` to the Go backend at `http://localhost:8080`.
- Vitest through the approved Vite configuration.
- `test/setup.ts` for the testing-library setup.
- Scripts for `build`, `lint`, `typecheck`, `test`, and `test:coverage`.
- ESLint and TypeScript configuration compatible with the approved stack.

Use sensible configuration consistent with the plan. Do not add dependencies beyond those specified without approval.

### 3. Remove starter boilerplate

Remove the default Vite demo content that is not part of the approved architecture. Establish the planned base structure under `frontend/src/`, including the application entry points and stylesheet.

Do not implement the calculator UI, reducer, API client, number formatter, keyboard handling, or calculator-specific behavior yet. Those belong to T5–T7.

Do not add Docker files, Nginx configuration, CI, documentation expansions, or other later-task deliverables.

### 4. Verify T4

From `frontend/`, actually execute:

1. `npm run build`
2. `npm run lint`
3. `npm run typecheck`
4. `npm test`

All must pass. If dependency installation requires network access or approval in the current environment, stop and report the blocker instead of claiming success or silently changing the stack.

Inspect the final Git diff and status. Preserve the existing backend and earlier task work.

### 5. Record the prompt

Preserve all existing entries in `PROMPTS.md`. Record this exact prompt verbatim using the local `log-prompt` skill if available, including the model, objective, result, and affected files as required by the plan.

Do not stage, commit, or push.

### 6. Report and stop

Report:
- Files created or modified.
- Dependencies added and their purpose.
- Vite proxy and test configuration.
- Actual output/status of all four verification commands.
- Git status and any blockers or deviations from the plan.
- Whether T4 is `PASS`, `PASS WITH NOTES`, `INCOMPLETE`, or `BLOCKED`.

Stop after T4 and wait for review. Do not begin T5.
```

---

### Prompt #11 — Execute T5: Frontend Client + Formatter + Types

- **Phase:** T5 — Frontend Client + Formatter + Types
- **Model:** Gemini 4 Argon (High)
- **Objective:** Implement the frontend TypeScript domain/API types (`src/calculator/types.ts`), 15-significant-digit number formatter (`src/calculator/format.ts`), native `fetch` API client (`src/api/client.ts`), and unit tests (`format.test.ts`, `client.test.ts`).
- **Outcome:** Accepted — Implemented all T5 modules and unit tests (16 tests passing across 3 test files with 95.86% line coverage and 93.75% branch coverage).
- **Files Affected:** `frontend/src/calculator/types.ts`, `frontend/src/calculator/format.ts`, `frontend/src/calculator/format.test.ts`, `frontend/src/api/client.ts`, `frontend/src/api/client.test.ts`, `PROMPTS.md`

**Verbatim Prompt:**

```text
Execute **T5 — Frontend Client + Formatter + Types**, following `implementation_plan.md` as the specification. If this prompt conflicts with the plan, follow the plan.

T1–T4 are complete. T5 is the only task authorized in this execution.

### 1. Inspect the existing project

Before modifying anything:

1. Read `implementation_plan.md`, especially the decisions, frontend architecture, API contract, testing strategy, task breakdown, and relevant T5 acceptance criteria.
2. Read `AGENTS.md` and the applicable local skills if available.
3. Inspect Git status, recent commits, `PROMPTS.md`, and the existing frontend and backend implementations.
4. Confirm the API client, formatter, types, and test file locations specified by the plan.
5. Preserve all existing work.

### 2. Implement T5 exactly as specified

Implement only the frontend API client, number formatter, and TypeScript types assigned to T5.

- Follow the API contract in the plan and the existing Go backend implementation.
- Use native `fetch` as approved; do not add an HTTP client dependency.
- Keep arithmetic on the backend. Do not implement calculator operations in the frontend.
- Follow the plan's exact request and response schemas, endpoint names, error handling, and number-formatting rules.
- Preserve the approved architecture and naming conventions.
- Add the unit tests required by T5, following the existing Vitest setup.
- Do not implement the calculator reducer, state management, React hook, full UI, keyboard handling, Docker, CI, or later-task deliverables unless the plan explicitly assigns something to T5.

Do not introduce new features, dependencies, error codes, or API behavior. If an actual conflict between the plan and existing code prevents implementation, explain it and stop rather than silently changing the approved design.

### 3. Verify the implementation

Run the verification commands required by T5 and the plan. At minimum, verify the relevant frontend tests, type checking, linting, and production build as applicable to the task.

Report actual command results. Do not claim a test or check passed unless it was executed successfully.

### 4. Update the prompt log

Preserve all existing entries in `PROMPTS.md`. Record this exact prompt verbatim using the local `log-prompt` skill if available, following the logging format required by the plan.

Inspect the final diff and Git status. Confirm that the changes are limited to T5 deliverables and the prompt log.

Do not stage, commit, or push.

### 5. Report and stop

Report:
- Files created or modified.
- The API client, types, and formatter implemented.
- Tests added and their actual results.
- Results of the required verification commands.
- Git status, blockers, and any deviations from the plan.
- Status: `PASS`, `PASS WITH NOTES`, `INCOMPLETE`, or `BLOCKED`.

Stop after T5 and wait for review. Do not begin T6.
```

---

### Prompt #12 — Execute T6: Calculator State Machine (Reducer + Keys)

- **Phase:** T6 — Calculator State Machine (Reducer + Keys)
- **Model:** Gemini 4 Argon (High)
- **Objective:** Implement the pure calculator state machine (`src/calculator/reducer.ts`), keypad definitions and keyboard mapping (`src/calculator/keys.ts`), and unit tests (`src/calculator/reducer.test.ts`) covering all transitions and edge cases defined in `implementation_plan.md` §5 and §6.
- **Outcome:** Accepted — Implemented `keys.ts`, `reducer.ts`, and `reducer.test.ts` with 100% statement/branch/function/line coverage on both `keys.ts` and `reducer.ts` (33 total frontend tests passing across 4 test files).
- **Files Affected:** `frontend/src/calculator/keys.ts`, `frontend/src/calculator/reducer.ts`, `frontend/src/calculator/reducer.test.ts`, `PROMPTS.md`

**Verbatim Prompt:**

```text
Execute **T6 — Calculator State Machine (Reducer + Keys)**, following `implementation_plan.md` as the specification. If this prompt conflicts with the plan, follow the plan.

T1–T5 are complete. Implement T6 only.

### 1. Inspect the existing project

Before modifying anything:

1. Read `implementation_plan.md`, especially the approved decisions, frontend architecture, state-machine design, keyboard behavior, test strategy, and T6 acceptance criteria.
2. Read `AGENTS.md` and the applicable local skills if available.
3. Inspect Git status, recent commits, `PROMPTS.md`, and the existing calculator types, formatter, API client, and tests.
4. Preserve the existing implementation and follow the established names and interfaces wherever the plan requires them.

### 2. Implement the T6 state machine

Implement the reducer and related state-transition logic specified for T6.

- Use the existing types in `frontend/src/calculator/types.ts` where appropriate.
- Follow the plan's exact state shape, action definitions, transitions, and calculator behavior.
- Preserve immediate execution from left to right; do not introduce operator precedence or an expression parser.
- Keep arithmetic on the backend. The reducer must coordinate calculator state and requests, not independently calculate results.
- Handle the user actions and edge cases specified in the plan, including clearing, digit entry, decimal input, operator selection, evaluation, and unary operations wherever T6 assigns them.
- Implement keyboard mappings only to the extent explicitly assigned to T6.
- Keep the implementation focused. Do not build the full React UI or implement later-task hooks and integration unless the plan explicitly assigns them to T6.

Do not invent state transitions, add features, change the API contract, or introduce dependencies. If the plan leaves a detail unspecified, choose the simplest behavior consistent with its existing decisions. If a genuine contradiction prevents implementation, report it instead of silently changing the plan.

### 3. Add reducer and keyboard tests

Use the existing Vitest setup. Add the tests required by T6's acceptance criteria, covering the defined state transitions and keyboard behavior.

Tests must validate observable state changes and edge cases rather than merely checking that the reducer executes. Keep tests deterministic and do not make real network requests.

Do not modify existing T5 tests unless a real incompatibility is discovered.

### 4. Verify

Run the relevant frontend tests, followed by:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test:coverage`

Report actual results. If a command fails, investigate and fix the cause within T6's scope; do not weaken tests or coverage thresholds merely to obtain a pass.

### 5. Record the prompt and inspect the diff

Preserve all existing entries in `PROMPTS.md`. Record this exact prompt verbatim using the local `log-prompt` skill if available, following the plan's logging conventions.

Inspect Git status and the final diff. Confirm that changes are limited to T6 deliverables and `PROMPTS.md`.

Do not stage, commit, or push.

### 6. Report and stop

Report:
- Files created or modified.
- State transitions and keyboard behavior implemented.
- Tests added and their results.
- Actual results of lint, typecheck, build, and coverage.
- Git status, blockers, and deviations from the plan.
- Status: `PASS`, `PASS WITH NOTES`, `INCOMPLETE`, or `BLOCKED`.

Stop after T6 and wait for review. Do not begin T7.
```

---

### Prompt #13 — Review & Fix Unary Chaining with Pending Binary Operation (T6)

- **Phase:** T6 — Calculator State Machine (Reducer + Keys)
- **Model:** Gemini 4 Argon (High)
- **Objective:** Inspect and resolve the edge case where a unary operation (`√`, `%`) resolves while a binary operation is pending (`pendingOp !== null`) and is followed by another binary operator (e.g. `2 + 9 √ × 4 =` or `50 + 10 % + 5 =`), then commit T6.
- **Outcome:** Accepted — Fixed `reducer.ts` so a resolved unary operation while `pendingOp` is active marks the right-hand operand as ready for binary chaining (`request(pendingOp, [acc, entry], then: chain(op))`) instead of replacing `pendingOp`, added regression tests in `reducer.test.ts` (100% coverage on `reducer.ts` and `keys.ts`), and committed T6.
- **Files Affected:** `frontend/src/calculator/reducer.ts`, `frontend/src/calculator/reducer.test.ts`, `PROMPTS.md`

**Verbatim Prompt:**

```text
Creo que hay algo pendiente, aunque recuerda siempre apegarte al plan si estoy en lo incorrecto. hay un punto funcional que sí merece atención: el manejo de operaciones unarias mientras existe una operación binaria pendiente.

Si es asi, resolvamoslo y entonces si es necesario hacemos el commit
```

---

### Prompt #14 — Architectural Review of `WeakSet<CalculatorState>` Purity (T6)

- **Phase:** T6 — Calculator State Machine (Reducer + Keys)
- **Model:** Gemini 4 Argon (High)
- **Objective:** Evaluate whether using `WeakSet<CalculatorState>` (and `WeakMap<CalculatorState, number>`) introduces hidden object-identity state outside `CalculatorState` that breaks referential transparency when states are shallow-copied or constructed literally.
- **Outcome:** Accepted — Proved the value collision between `3 +` and `3 + 9 √` under the 7 base fields and presented three options, recommending Option A (explicit value-based fields in `CalculatorState`).
- **Files Affected:** None (architectural analysis)

**Verbatim Prompt:**

```text
La corrección del reducer parece abordar el caso borde, pero hay un detalle importante: el uso de un WeakSet<CalculatorState> introduce información de estado fuera de CalculatorState. Antes de aceptarlo definitivamente, conviene comprobar que esa solución no dependa de identidades de objetos que se pierdan al copiar estados o que hagan que las transiciones sean difíciles de razonar. No significa que esté mal, pero sí es una decisión que merece revisión, especialmente en una máquina de estados pura.
```

---

### Prompt #15 — Adopt Option A: Value-Deterministic Reducer State (T6)

- **Phase:** T6 — Calculator State Machine (Reducer + Keys)
- **Model:** Gemini 4 Argon (High)
- **Objective:** Replace `WeakSet<CalculatorState>` and `WeakMap<CalculatorState, number>` with explicit value-based fields in `CalculatorState` (`awaitingSecondOperand: boolean` and `lastRequestId: number`), make `reducer(state, action)` 100% deterministic by value, and add regression tests across reducer-produced states, shallow copies, and manual object literals.
- **Outcome:** Accepted — Removed `WeakSet` and `WeakMap`, added `awaitingSecondOperand` and `lastRequestId` to `CalculatorState`, verified 100% statement/branch/function/line coverage on `reducer.ts` and `keys.ts`, and left changes uncommitted for review.
- **Files Affected:** `frontend/src/calculator/types.ts`, `frontend/src/calculator/reducer.ts`, `frontend/src/calculator/reducer.test.ts`, `PROMPTS.md`

**Verbatim Prompt:**

```text
Adopt **Option A**, following `implementation_plan.md` as the definitive specification.

Before changing code:
1. Inspect the current `CalculatorState`, reducer, reducer tests, `keys.ts`, and the relevant sections of `implementation_plan.md`.
2. Confirm exactly how `WeakSet<CalculatorState>` and `WeakMap<CalculatorState, number>` are currently used.
3. Identify the smallest plan-consistent change that removes hidden identity-based state and preserves all approved calculator behaviors.

Implement the correction with these requirements:

- Make the reducer deterministic by value: `reducer(state, action)` must not depend on object identity, prior calls, or external mutable collections.
- Remove the `WeakSet` and `WeakMap` workaround.
- Represent any additional information needed for correct transitions explicitly in the state or in the approved request/action contract. Keep the change minimal; do not redesign unrelated parts of the state machine.
- Preserve the distinction between replacing a pending binary operator when its second operand has not been entered and chaining the pending operation after a unary result has resolved.
- Preserve correct behavior for digit entry, decimal entry, sign toggling, backspace, `AC`, equals, `√`, `%`, operator replacement, left-to-right chaining, loading/error handling, and stale-response protection.
- Preserve the approved API contract and avoid adding features or scope beyond the plan.
- Add regression tests that pass both reducer-produced states and equivalent shallow-copied or manually constructed states. Include at least:
  1. `3 +`, then `×` replaces `+`.
  2. `3 + 9 √`, then `×` resolves `3 + 3` before chaining multiplication.
  3. `50 + 10 % =` produces `50.1`.
  4. After `50 + 10 %`, entering a digit follows the intended calculator behavior and does not accidentally concatenate with `0.1`.
  5. Stale requests are ignored without identity-based metadata.
- Update existing tests as needed, without weakening assertions or coverage thresholds.
- Record the exact prompt in `PROMPTS.md` using the existing prompt-logging convention.

Run the frontend tests, lint, typecheck, build, and coverage commands required by the plan. Report actual results and inspect the final diff.

Do not amend the T6 commit automatically. Leave changes uncommitted and report the recommended commit message. Do not start T7 or any later task until this correction has been reviewed.

If the plan does not clearly determine an edge case, explain the ambiguity and propose the smallest resolution rather than silently inventing behavior.
```

---

### Prompt #16 — Verify Reducer Code Transitions & Stale Request Handling (T6)

- **Phase:** T6 — Calculator State Machine (Reducer + Keys)
- **Model:** Gemini 4 Argon (High)
- **Objective:** Audit `reducer.ts` line by line to demonstrate how `lastRequestId` is incremented, how it is preserved on `AC` (`clear`), how stale `resolved`/`failed` responses are rejected after clearing or starting another operation, and that `awaitingSecondOperand` and `lastRequestId` are initialized in every state transition.
- **Outcome:** Accepted — Provided a complete transition-by-transition code audit and expanded `reducer.test.ts` to assert stale `resolved` and `failed` rejection both immediately after `AC` (while idle) and after starting a subsequent operation.
- **Files Affected:** `frontend/src/calculator/reducer.test.ts`, `PROMPTS.md`

**Verbatim Prompt:**

```text
Bien, una observacion creo, aunque recuerda siempre procurar el plan. Hay un detalle importante: el reporte no demuestra por sí solo que todas las transiciones sean correctas. En particular, conviene comprobar en el código cómo se incrementa lastRequestId, cómo se conserva al pulsar AC y cómo se rechazan respuestas antiguas después de limpiar o iniciar otra operación. También hay que confirmar que las nuevas propiedades estén inicializadas en todos los estados pertinentes.
```

---

### Prompt #17 — Inspect Diff & Commit T6 Value-Deterministic Reducer

- **Phase:** T6 — Calculator State Machine (Reducer + Keys)
- **Model:** Gemini 4 Argon (High)
- **Objective:** Run `git status --short`, `git diff --check`, `git diff --stat`, and `git diff` on the 4 modified T6 files (`types.ts`, `reducer.ts`, `reducer.test.ts`, `PROMPTS.md`), confirm no unrelated changes exist, and create a new Conventional Commit.
- **Outcome:** Accepted — Verified clean diff and created commit `refactor(frontend): make calculator reducer state transitions deterministic by value`.
- **Files Affected:** `frontend/src/calculator/types.ts`, `frontend/src/calculator/reducer.ts`, `frontend/src/calculator/reducer.test.ts`, `PROMPTS.md`

**Verbatim Prompt:**

```text
Bien, si primero ejecuta

git status --short
git diff --check
git diff --stat
git diff -- frontend/src/calculator/types.ts frontend/src/calculator/reducer.ts frontend/src/calculator/reducer.test.ts PROMPTS.md

Si el resultado coincide con el reporte y no aparecen cambios ajenos a T6, puedes hacer el commit como comit nuevo.
```

---

### Prompt #18 — Execute T7: Hook + UI

- **Phase:** T7 — Hook + UI
- **Model:** Gemini 4 Argon (High)
- **Objective:** Implement `useCalculator.ts` (`useReducer` + `useEffect` with `AbortController`), `Display.tsx` (two-line expression + value/error display with `aria-live="polite"` and adaptive font sizing), `Keypad.tsx` (4×6 CSS Grid with `>=56px` touch targets, `aria-label`s, and loading-state disabling except `AC`), `Calculator.tsx` (physical keyboard shortcut listener), `App.tsx`, `index.css` (responsive mobile full-screen and desktop ~380px card), and `Calculator.test.tsx` (integration tests with stubbed `fetch`).
- **Outcome:** Accepted — Implemented all T7 deliverables; `lint`, `typecheck`, `build`, and `test:coverage` pass with 41 tests across 5 test files (98.94% line coverage, 97.05% branch coverage, 100% function coverage).
- **Files Affected:** `frontend/src/calculator/useCalculator.ts`, `frontend/src/components/Display.tsx`, `frontend/src/components/Keypad.tsx`, `frontend/src/components/Calculator.tsx`, `frontend/src/components/Calculator.test.tsx`, `frontend/src/App.tsx`, `frontend/src/index.css`, `PROMPTS.md`

**Verbatim Prompt:**

```text
T6 has been reviewed and corrected. The reducer now uses explicit `awaitingSecondOperand` and `lastRequestId` fields in `CalculatorState`, with no `WeakSet` or `WeakMap` identity-based state.

Before implementing T7, inspect the current committed or working-tree version of T6 and verify that the reducer, tests, and types agree with `implementation_plan.md`. Preserve the value-deterministic state transitions and request-ID handling. Do not reintroduce identity-based metadata or redesign the reducer unless a concrete defect is demonstrated.

Proceed with T7 only, following the existing T7 (real integration) prompt and `implementation_plan.md` as the definitive specification. Do not begin T8 or commit/push changes.
```

---

### Prompt #19 — Acceptance Review & Integration Test Hardening for T7

- **Phase:** T7 — Hook + UI
- **Model:** Gemini 4 Argon (High)
- **Objective:** Review T7 against `implementation_plan.md`, verify `POST /api/v1/percentage` UI-to-fetch integration coverage and cancelled/stale request protection across `AC` and subsequent operations in `Calculator.test.tsx`, and confirm whether 360 px responsive layout was visually verified.
- **Outcome:** Accepted — Added UI integration test for `50 + 10 % =` (`POST /api/v1/percentage {"a":10}` -> `0.1`, `POST /api/v1/add {"a":50,"b":0.1}` -> `50.1`), expanded cancelled/stale request integration test in `Calculator.test.tsx` to cover both late failure after `AC` and late success from an earlier request while a newer request is active (42 tests passing across 5 test files), and reported honestly that 360 px has not yet been visually rendered in a real browser.
- **Files Affected:** `frontend/src/components/Calculator.test.tsx`, `PROMPTS.md`

**Verbatim Prompt:**

```text
Review the completed T7 implementation against `implementation_plan.md`. Do not begin T8, commit, or push.

The reported lint, typecheck, build, and coverage results are passing. Perform a focused acceptance review of the actual code and tests, especially these two points:

1. **Percentage integration coverage:** Verify that `Calculator.test.tsx` tests the complete UI-to-fetch flow for `%`, including the expected `POST /api/v1/percentage` payload and displayed result. If this is missing, add the smallest appropriate integration test using the existing fetch-stubbing conventions. Do not duplicate reducer unit tests.
2. **Cancelled and stale requests:** Verify that after `AC` cancels a pending request, a late success or failure cannot overwrite the cleared state. Also verify that a late response from an earlier request cannot overwrite a newer operation. Inspect both the hook's effect cleanup and the reducer's request-ID guards. Add a focused integration test only if the current tests do not establish the required behavior.

Also confirm whether the responsive layout was actually tested at 360 px. If it was not, report that honestly; do not claim visual verification without evidence.

Keep all changes within T7 and `PROMPTS.md`. Do not weaken existing assertions or coverage thresholds. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, and `npm run test:coverage` after any changes.

Report the files inspected or changed, the tests added, actual command results, whether 360 px was visually verified, and the final Git status. Leave all changes uncommitted and stop for review.
```

---

### Prompt #20 — Approve & Commit T7

- **Phase:** T7 — Git Commit
- **Model:** Gemini 4 Argon (High)
- **Objective:** Stage and commit the reviewed T7 (Hook + UI + Integration Tests) deliverables using Conventional Commits while keeping `.agents/` and `AGENTS.md` untracked locally.
- **Outcome:** Accepted — Created commit `feat(frontend): implement calculator hook, UI components, and integration tests`.
- **Files Affected:** `frontend/src/calculator/useCalculator.ts`, `frontend/src/components/Display.tsx`, `frontend/src/components/Keypad.tsx`, `frontend/src/components/Calculator.tsx`, `frontend/src/components/Calculator.test.tsx`, `frontend/src/App.tsx`, `frontend/src/index.css`, `PROMPTS.md`

**Verbatim Prompt:**

```text
Good, make the corresponding commit
```


