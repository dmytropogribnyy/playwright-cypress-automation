# Senior QA Automation Assignment — Cypress + Playwright

A compact, production-style automation framework covering the assignment in two
runners side-by-side: **Cypress** for SauceDemo (UI + network + API) and
**Playwright** for DemoQA (UI + diagnostics) with JSONPlaceholder as the API
target. TypeScript is used for both, configuration is environment-driven, and
the suites are designed to be CI-friendly out of the box.

## Stack

| Concern | Choice |
| --- | --- |
| Cypress runner | `cypress@13` (TypeScript) |
| Playwright runner | `@playwright/test@1.59` (TypeScript) |
| Config | `dotenv` → `cypress.config.ts` / `playwright.config.ts` |
| Structure | Page Objects + Playwright fixtures + typed test data |
| Diagnostics | Cypress: screenshots + video on failure. Playwright: screenshot + trace + video, all `retain-on-failure`, plus HTML report |
| Stability | No fixed waits anywhere. Web-first / `should()` assertions only. Stable selectors (`data-test`, IDs, role-based). Network ad-blocker fixture for DemoQA. |

## Project Layout

```
.
├── cypress/
│   ├── e2e/
│   │   ├── api/reqres.api.cy.ts                # Task 3
│   │   └── ui/
│   │       ├── saucedemo.login.cy.ts           # Task 1
│   │       └── saucedemo.network.cy.ts         # Task 2
│   ├── pages/
│   │   ├── SauceLoginPage.ts
│   │   └── SauceInventoryPage.ts
│   ├── support/e2e.ts
│   └── tsconfig.json
├── playwright/
│   ├── fixtures/test.ts                        # ad-blocker fixture
│   ├── pages/
│   │   ├── TextBoxPage.ts
│   │   └── PracticeFormPage.ts
│   └── tests/
│       ├── api/posts.api.spec.ts               # Task 6
│       └── ui/
│           ├── text-box.spec.ts                # Task 4
│           └── practice-form.spec.ts           # Task 5 (positive + negative)
├── .github/workflows/ci.yml                    # GitHub Actions
├── cypress.config.ts
├── playwright.config.ts
├── tsconfig.json
├── .env.example
└── package.json
```

## Setup

```bash
# 1. Clone and install
npm install

# 2. Install the Playwright Chromium binary
npm run pw:install

# 3. Copy env template (defaults are already wired in configs, .env is optional)
cp .env.example .env
```

> **Reqres API key (optional).** Reqres.in introduced a mandatory `x-api-key`
> header in 2025. The Cypress test (`reqres.api.cy.ts`) hits the live endpoint
> when `REQRES_API_KEY` is set in `.env`, and falls back to a fixture-based
> contract assertion otherwise so the suite stays green on any machine. See
> *Notes on third-party APIs* below for the rationale.

## Running tests

```bash
# Cypress (headless)
npm run cy:run

# Cypress (interactive UI)
npm run cy:open

# Playwright (headless, all projects)
npm run pw:test

# Playwright (headed)
npm run pw:headed

# Playwright HTML report
npm run pw:report

# Both runners back-to-back
npm test
```

## Test Coverage Matrix

| # | Task | Runner | Spec |
| --- | --- | --- | --- |
| 1 | SauceDemo UI flow (login → add to cart → badge=1) | Cypress | `cypress/e2e/ui/saucedemo.login.cy.ts` |
| 2 | Network interception during login + product loading | Cypress | `cypress/e2e/ui/saucedemo.network.cy.ts` |
| 3 | Reqres `GET /api/users?page=2` contract | Cypress | `cypress/e2e/api/reqres.api.cy.ts` |
| 4 | DemoQA Text Box — fill, submit, validate output | Playwright | `playwright/tests/ui/text-box.spec.ts` |
| 5 | DemoQA Practice Form — positive + 2 negative cases | Playwright | `playwright/tests/ui/practice-form.spec.ts` |
| 6 | JSONPlaceholder `GET /posts` via request context | Playwright | `playwright/tests/api/posts.api.spec.ts` |
| 7 | Failure diagnostics (screenshot, trace, video, HTML report) | Both | `playwright.config.ts`, `cypress.config.ts` |

## Failure diagnostics

- **Cypress** — `screenshotOnRunFailure: true`, `video: true`. Artifacts land
  in `cypress/screenshots/` and `cypress/videos/`. Two retries in `runMode`
  to absorb transient demo-site flake.
- **Playwright** — `screenshot: 'only-on-failure'`, `trace: 'retain-on-failure'`,
  `video: 'retain-on-failure'`, plus an HTML reporter. Two retries in CI.
  Open the trace viewer with `npx playwright show-trace test-results/<...>/trace.zip`.

## Troubleshooting

### Cypress: `Cypress.exe: bad option: --smoke-test` on Windows

If `npx cypress run` fails with the above error and `Cypress.exe` appears to
launch as raw Node, the most likely cause is the environment variable
`ELECTRON_RUN_AS_NODE=1` being inherited from the host shell. VS Code's
integrated terminal sometimes propagates this variable, which forces every
Electron-based binary (Cypress included) to behave as a Node process and
reject Cypress-specific CLI flags.

Unset it before running Cypress:

```powershell
# PowerShell
Remove-Item Env:\ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
npx cypress run
```

```bash
# Git Bash / WSL
unset ELECTRON_RUN_AS_NODE
npx cypress run
```

For a permanent fix, launch the terminal outside VS Code or remove the
variable from your user environment.

## Notes on third-party APIs and SUTs

- **SauceDemo is a static SPA without a real backend API.** The "network
  interception" task (Task 2) targets the genuine HTTP traffic the app
  actually generates during product loading: the `/inventory.html` navigation
  request and a product image asset. Both are validated at the network layer
  (status, content-type, body markers). The same `cy.intercept` pattern
  applies unchanged to a real `/api/inventory` endpoint in production.
- **Reqres.in changed its access model in 2025** and now requires a per-user
  API key. The test runs in *live mode* when `REQRES_API_KEY` is set, and
  falls back to a *fixture mode* that exercises the same contract assertions
  against a payload mirroring the documented response shape. In a real
  framework this third-party would be wrapped behind a contract-tested client
  and replaced with a mock service (WireMock / Mockoon / MSW) for fast,
  deterministic CI runs, with the live integration covered by a small
  separate suite running nightly.
- **DemoQA** loads heavy third-party ad iframes that often overlap form
  controls and cause flaky clicks. A Playwright fixture
  (`playwright/fixtures/test.ts`) aborts ad-network requests at the route
  layer, so the suite only interacts with the app under test.

---

## Engineering Reflection

### 1. How would you scale this framework to support 300+ tests?

Scaling is mostly an *organisation* problem, not a code problem. I'd keep the
test pyramid in mind: contract / API tests are cheap and fast, so push as much
coverage there as possible; reserve UI for journeys that cannot be validated
any other layer. Concretely:

- **Layered architecture** — pages → flows/actions → specs. Specs stay short
  and behavioural; reusable interaction lives in pages or flow classes;
  shared API clients are typed and contract-tested.
- **Tagging and grouping** — `@smoke`, `@critical`, `@regression`, `@flaky`
  drive different pipelines (PR vs nightly vs on-demand) and let teams run
  the slice they need.
- **Test data** — builders / factories per entity, dynamically generated
  per test, with isolation guarantees (no shared mutable fixtures).
- **Parallelism & sharding** — Playwright's native sharding
  (`--shard=1/4`) and Cypress parallel mode across CI workers; aim for
  total wall-clock under ~10 minutes on PR.
- **Ownership** — `CODEOWNERS` per test directory; failing tests are routed
  to the owning team automatically. A flaky test without an owner is a bug.
- **Reporting** — aggregated dashboard (Allure / custom) with pass-rate,
  duration trend, and retry-rate per spec, surfaced to engineering leadership.

### 2. How would you reduce and monitor flakiness in CI?

The two halves are equally important: prevent flake in the code, and detect
flake in the data.

- **Prevent**: no fixed waits — only web-first assertions and network-driven
  waits. Stable selectors (`data-test`, role-based) over CSS/DOM positional
  selectors. Each test is fully isolated (own state, own user, own data).
  Third-party noise (ads, analytics) blocked at the network layer.
- **Detect**: track *retry rate*, not just pass rate. A test that passes on
  attempt #2 is a defect, even if green. Surface p95 duration, top-10
  flakiest specs, and pass-rate trends per branch on a dashboard.
- **Quarantine** — a flaky test moves to a `@flaky` tag with a linked ticket;
  it still runs in nightly so we collect data, but does not block PRs. The
  ticket has an SLA. Quarantine without follow-up is rot.
- **Diagnostics on every failure** — trace, video, screenshot, console + network
  logs uploaded as CI artifacts. Reproduction should not require local rerun.

### 3. What test strategy would you run on every Pull Request vs nightly runs?

The PR pipeline optimises for *fast signal*; nightly optimises for *broad
confidence*.

- **On every PR (target: under ~10 minutes)** — lint + type-check, unit tests,
  API contract tests, Cypress + Playwright `@smoke` and `@critical` UI on a
  single browser (Chromium). Fail-fast. Required to merge.
- **Nightly on `main`** — full regression across both runners, cross-browser
  (Firefox + WebKit), longer-running negative paths (network failures,
  timeouts, idempotency under retry), visual regression where applicable, and
  the live third-party integrations that are too noisy for PRs (e.g. the
  reqres live-mode test). Failures page the on-call test owner.
- **On-demand** — performance / load tests, security scans, full visual sweep.

This split keeps the developer feedback loop tight while still maintaining a
deep regression net.
