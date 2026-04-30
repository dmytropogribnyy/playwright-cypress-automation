# QA Automation Assignment — Cypress + Playwright

[![CI](https://github.com/dmytropogribnyy/playwright-cypress-automation/actions/workflows/ci.yml/badge.svg)](https://github.com/dmytropogribnyy/playwright-cypress-automation/actions/workflows/ci.yml)

Two test runners, one repo. **Cypress** covers SauceDemo (UI + network + API); **Playwright** covers DemoQA (UI + diagnostics) and JSONPlaceholder (API). Both use TypeScript, Page Objects, and environment-driven config. CI runs on GitHub Actions.

---

## Stack

| | |
|---|---|
| Cypress | `cypress@15` + TypeScript |
| Playwright | `@playwright/test@1.59` + TypeScript |
| Structure | Page Objects + typed test data |
| Config | `dotenv` → `cypress.config.ts` / `playwright.config.ts` |
| Diagnostics | Screenshots, video, Playwright trace — all on failure |
| Stability | No fixed waits · stable selectors · ad-blocker fixture for DemoQA |

---

## Project layout

```
cypress/
  e2e/
    api/    reqres.api.cy.ts          # Task 3 — Reqres API
    ui/     saucedemo.login.cy.ts     # Task 1 — UI flow
            saucedemo.network.cy.ts   # Task 2 — network interception
  pages/    SauceLoginPage.ts  SauceInventoryPage.ts

playwright/
  fixtures/ test.ts                   # ad-blocker route fixture
  pages/    TextBoxPage.ts  PracticeFormPage.ts
  tests/
    api/    posts.api.spec.ts          # Task 6 — JSONPlaceholder
    ui/     text-box.spec.ts           # Task 4 — Text Box
            practice-form.spec.ts      # Task 5 — Practice Form (pos + neg)

.github/workflows/ci.yml
scripts/check-no-hard-waits.js        # enforces no fixed waits
```

---

## Setup

```bash
npm install
npm run pw:install      # download Playwright Chromium binary
cp .env.example .env    # fill in REQRES_API_KEY (see below)
```

> **Reqres API key — required.**
> Reqres.in requires an `x-api-key` header since 2025 — without it the API returns 401.
> Get a free key at [app.reqres.in/api-keys](https://app.reqres.in/api-keys), then:
> - **Local:** set `REQRES_API_KEY=<your_key>` in `.env`
> - **CI:** add `REQRES_API_KEY` as a repository secret *(GitHub → Settings → Secrets and variables → Actions)*

---

## Running tests

```bash
npm run cy:run        # Cypress headless
npm run cy:open       # Cypress interactive

npm run pw:test       # Playwright headless
npm run pw:headed     # Playwright headed
npm run pw:report     # Open HTML report

npm test              # both runners back-to-back

npm run lint:waits    # check for forbidden fixed waits
```

---

## Test coverage

| # | Task | Runner | File |
|---|------|--------|------|
| 1 | SauceDemo — login → add to cart → badge = 1 | Cypress | `e2e/ui/saucedemo.login.cy.ts` |
| 2 | Network interception during login + product load | Cypress | `e2e/ui/saucedemo.network.cy.ts` |
| 3 | Reqres `GET /api/users?page=2` — status 200 + data array | Cypress | `e2e/api/reqres.api.cy.ts` |
| 4 | DemoQA Text Box — fill all fields, submit, validate output | Playwright | `tests/ui/text-box.spec.ts` |
| 5 | DemoQA Practice Form — 1 positive + 2 negative cases | Playwright | `tests/ui/practice-form.spec.ts` |
| 6 | JSONPlaceholder `GET /posts` — status 200 + array with `id` | Playwright | `tests/api/posts.api.spec.ts` |
| 7 | Failure diagnostics: screenshot, trace, video, HTML report | Both | `playwright.config.ts`, `cypress.config.ts` |

---

## Failure diagnostics

**Cypress** — `screenshotOnRunFailure: true`, `video: true`. Artifacts in `cypress/screenshots/` and `cypress/videos/`. Two retries in run mode.

**Playwright** — `screenshot: 'only-on-failure'`, `trace: 'retain-on-failure'`, `video: 'retain-on-failure'` + HTML report. Two retries in CI. Inspect a trace with:
```bash
npx playwright show-trace test-results/<run>/trace.zip
```

---

## Notes on the test targets

**SauceDemo** is a static SPA with no JSON API. Task 2 intercepts the real HTTP traffic it does generate — JS bundle and product image requests — validating status code and `content-type` at the network layer, independent of UI assertions.

**DemoQA** serves heavy ad iframes that overlap form controls and cause flaky clicks. A Playwright fixture (`playwright/fixtures/test.ts`) aborts ad-network requests at the route layer before each test.

**Reqres.in** requires an API key. The test uses `cy.request` (Node.js-level HTTP client, no CORS), so the key is passed as a header and the test will fail with a clear 401 if it is missing — no silent fallbacks.

---

## Engineering reflection

### 1. How would you scale this to 300+ tests?

The core idea: scale the *pyramid*, not just the suite size.

- **Architecture** — pages → flows/actions → specs. Specs stay short and behavioural; reusable logic lives in page objects or flow classes; API clients are typed and contract-tested separately.
- **Tagging** — `@smoke`, `@critical`, `@regression`, `@flaky` drive different pipelines. Teams run the slice they own.
- **Test data** — factories / builders per entity, generated fresh per test. No shared mutable state between tests.
- **Parallelism** — Playwright sharding (`--shard=1/4`) and Cypress parallel mode across CI workers. Target: full suite under ~10 minutes wall-clock on PR.
- **Ownership** — `CODEOWNERS` per directory. A failing test with no owner is treated as a bug.
- **Reporting** — aggregated dashboard (Allure or custom) tracking pass-rate, duration trend, and retry-rate per spec.

### 2. How would you reduce and monitor flakiness in CI?

Prevention and detection are equally important — fixing flake without measuring it is guesswork.

- **Prevent** — no fixed waits; only web-first assertions and network-driven waits. Stable selectors (`data-test`, roles) instead of DOM-positional ones. Full test isolation: each test owns its state, user, and data. Third-party noise (ads, analytics) blocked at the network layer.
- **Detect** — track *retry rate*, not just pass rate. A test that passes on attempt 2 is a defect. Surface p95 duration and top-10 flakiest specs on a dashboard.
- **Quarantine** — flaky test gets a `@flaky` tag and a linked ticket with an SLA. It still runs nightly (so data accumulates) but does not block PRs. Quarantine without follow-up is just rot with extra steps.
- **Diagnostics** — trace, video, screenshot, and console/network logs uploaded as CI artifacts on every failure. Reproduction should never require a local rerun.

### 3. PR strategy vs nightly runs

**Every PR** (target: under 10 minutes) — lint, type-check, API contract tests, `@smoke` + `@critical` UI on Chromium. Fail-fast. Required to merge.

**Nightly on `main`** — full regression on both runners, cross-browser (Firefox + WebKit), longer negative paths (network failures, timeouts, idempotency), visual regression, and live third-party integrations that are too noisy for PRs. Failures page the on-call test owner.

**On-demand** — performance/load tests, security scans, full visual sweep.
