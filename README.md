# Northstar Commerce Quality Framework

[![CI](https://github.com/dmytropogribnyy/playwright-cypress-automation/actions/workflows/ci.yml/badge.svg)](https://github.com/dmytropogribnyy/playwright-cypress-automation/actions/workflows/ci.yml)

A production-oriented web quality automation framework for protecting critical commerce journeys across **UI, API, and network layers**.

Built with **Playwright, Cypress, TypeScript, and GitHub Actions**, the framework demonstrates how I structure release assurance for a web product: business-risk-driven coverage, stable automation patterns, environment-based configuration, fast CI feedback, and failure evidence that engineers can act on without rerunning tests locally.

> **Portfolio context:** the framework is publicly shareable and executable. Public sandbox applications are used as replaceable test targets so the architecture, quality gates, and diagnostics can be reviewed without exposing proprietary product code, customer data, credentials, or private infrastructure.

---

## Business context

The framework models the quality baseline needed by an e-commerce team increasing release frequency while keeping critical customer journeys protected.

The initial delivery focuses on risks that commonly block or damage a release:

| Product risk | Automated response |
|---|---|
| Customers cannot authenticate | Positive and negative login coverage |
| A product cannot be added to the cart | Critical commerce-path UI validation |
| The interface looks healthy while required resources fail | Network response and content-type checks |
| Forms accept incomplete or invalid customer data | Positive and negative validation scenarios |
| An API changes shape or availability | Contract-oriented status and payload assertions |
| A CI failure is difficult to reproduce | Screenshot, video, trace, and HTML-report evidence |
| Timing-based tests become flaky | Web-first assertions, stable selectors, and a no-hard-waits gate |

This is deliberately a compact framework: the goal is to show sound engineering decisions and a maintainable delivery model rather than inflate the repository with repetitive test cases.

---

## Delivery scope

### Cypress

- Commerce login and add-to-cart journey
- Negative authentication behaviour
- Network interception during authentication and inventory loading
- API validation through a Node-level HTTP client
- Screenshots and video on failure
- CI retries for diagnostic signal, not as a substitute for stability

### Playwright

- Customer-data form submission
- Required-field and format validation
- Text-entry workflow validation
- API response checks
- Route-level blocking of third-party ad noise
- Screenshot, trace, video, and HTML report on failure

### Shared engineering standards

- TypeScript with strict compiler settings
- Page Object separation
- Typed test data
- Environment-driven configuration
- No fixed waits
- Parallel-capable execution
- Independent Cypress and Playwright CI jobs
- Actionable failure artifacts

---

## Architecture

```text
                    ┌──────────────────────────┐
                    │       Test intent        │
                    │ business risks / flows   │
                    └────────────┬─────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
        ┌────────▼────────┐             ┌────────▼────────┐
        │ Cypress suites  │             │ Playwright      │
        │ UI / network /  │             │ UI / API /      │
        │ API             │             │ diagnostics     │
        └────────┬────────┘             └────────┬────────┘
                 │                               │
        ┌────────▼────────┐             ┌────────▼────────┐
        │ Page Objects &  │             │ Fixtures, Page  │
        │ environment     │             │ Objects & config│
        └────────┬────────┘             └────────┬────────┘
                 └───────────────┬───────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │ GitHub Actions quality  │
                    │ gates + failure evidence│
                    └──────────────────────────┘
```

The execution targets are adapters around the framework. In a commercial environment, product URLs, selectors, API clients, authentication, and test-data providers change; the quality strategy, layering, CI model, and diagnostic approach remain reusable.

More detail:

- [Quality strategy](docs/QUALITY_STRATEGY.md)
- [Release gates](docs/RELEASE_GATES.md)

---

## Repository structure

```text
cypress/
  e2e/
    api/       reqres.api.cy.ts
    ui/        saucedemo.login.cy.ts
               saucedemo.network.cy.ts
  pages/       SauceLoginPage.ts
               SauceInventoryPage.ts

playwright/
  fixtures/    test.ts
  pages/       TextBoxPage.ts
               PracticeFormPage.ts
  tests/
    api/       posts.api.spec.ts
    ui/        text-box.spec.ts
               practice-form.spec.ts

docs/
  QUALITY_STRATEGY.md
  RELEASE_GATES.md

.github/workflows/ci.yml
scripts/check-no-hard-waits.js
scripts/cypress-run.js
```

---

## Quality gates

The repository exposes one local verification command:

```bash
npm run verify
```

It runs:

1. TypeScript compilation checks
2. The no-hard-waits policy
3. Cypress coverage
4. Playwright coverage

GitHub Actions separates the pipeline into:

- **Quality policy** — type checking and stability rules
- **Cypress** — UI, API, and network coverage
- **Playwright** — UI, API, and diagnostic coverage

A pull request is considered releasable only when all required jobs pass.

---

## Failure diagnostics

### Cypress

- Screenshot on failure
- Video recording
- Two retries in CI/run mode
- Uploaded CI artifacts when a job fails

### Playwright

- Screenshot only on failure
- Retained trace on failure
- Retained video on failure
- HTML report
- Uploaded report and test results when a job fails

Inspect a Playwright trace locally:

```bash
npx playwright show-trace test-results/<run>/trace.zip
```

The diagnostic goal is simple: a failed pipeline should provide enough evidence for an engineer to understand the failure without first reproducing it on a workstation.

---

## Setup

```bash
npm install
npm run pw:install
cp .env.example .env
npm run quality
```

### Environment configuration

| Variable | Purpose | Default |
|---|---|---|
| `SAUCE_BASE_URL` | Commerce UI target | `https://www.saucedemo.com` |
| `SAUCE_USERNAME` | Test user | `standard_user` |
| `SAUCE_PASSWORD` | Test password | `secret_sauce` |
| `DEMOQA_BASE_URL` | Form-validation target | `https://demoqa.com` |
| `REQRES_BASE_URL` | Cypress API target | `https://reqres.in` |
| `REQRES_API_KEY` | Reqres authentication | Required for that API check |

Reqres requires an `x-api-key` header. Store the value in `.env` locally and as a GitHub Actions repository secret in CI. The test fails clearly when authentication is unavailable; there is no silent fallback.

---

## Running the framework

```bash
# Complete local release check
npm run verify

# Quality policy only
npm run quality

# Cypress
npm run cy:run
npm run cy:open

# Playwright
npm run pw:test
npm run pw:headed
npm run pw:report

# Both runners
npm test
```

---

## Engineering decisions

### Why two runners?

The framework shows deliberate tool selection rather than treating one runner as universally superior:

- Cypress provides productive browser workflow development, network interception, and direct API requests.
- Playwright provides strong cross-browser architecture, fixtures, tracing, isolated browser contexts, and rich diagnostics.

In a real engagement I would normally standardize on the runner that best fits the product, team, and delivery constraints. This repository keeps both to demonstrate migration, comparison, and mixed-estate support.

### Why block third-party ads in Playwright?

The form target serves advertising iframes that can overlap controls and create failures unrelated to the product behaviour under test. A route fixture blocks known ad-network traffic before each test. This keeps the suite focused on product risk while making the environmental workaround visible and reviewable.

### Why validate network resources in the commerce flow?

The selected public commerce target is a client-side application without a product JSON API. The network scenario therefore verifies real bundle and product-image responses. In a private product this layer would typically bind to inventory, pricing, cart, or session endpoints while retaining the same interception and assertion pattern.

---

## Current coverage

| Area | Runner | Coverage |
|---|---|---|
| Authentication | Cypress | Valid login and rejected credentials |
| Cart | Cypress | Add first product and verify cart state |
| Network | Cypress | Bundle and product-resource responses |
| API | Cypress | Authenticated users endpoint response |
| Customer details | Playwright | Text-entry submission and rendered output |
| Registration form | Playwright | Positive submission and negative validation |
| API | Playwright | Posts collection status and payload structure |
| Diagnostics | Both | Screenshots, video, trace, and reports |

---

## Scaling path

For a larger product, the next increments would be:

- domain-level flow objects above Page Objects
- typed API clients and schema validation
- test-data builders and isolated data provisioning
- `@smoke`, `@critical`, and `@regression` execution slices
- Playwright sharding and Cypress parallel workers
- cross-browser nightly regression
- retry-rate and duration-trend reporting
- explicit ownership through `CODEOWNERS`
- visual regression for stable high-value surfaces

The strategy is to scale the test pyramid and feedback model—not only the number of UI specifications.

---

## Known boundaries

- Public targets can change without notice and are not controlled by this repository.
- The suite is intentionally compact and does not represent complete commerce coverage.
- No production customer data or proprietary application code is included.
- Performance, accessibility, security, and visual testing are natural extensions but are outside the current executable scope.

These boundaries are explicit so the repository remains credible: it demonstrates how the solution is engineered, what it protects today, and what would be added for a broader product engagement.
