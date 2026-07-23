# Quality Strategy

## Objective

Provide fast, trustworthy release feedback for critical web-commerce behaviour while keeping the automation maintainable, diagnosable, and safe to run in CI.

The framework is intentionally risk-driven. It does not aim to automate every visible interaction. It protects the workflows whose failure would most directly block a customer, hide a broken dependency, or slow incident investigation.

## Quality risks

| Risk | Impact | Current control |
|---|---|---|
| Authentication failure | Customers cannot enter the product | Positive and negative login scenarios |
| Cart-state failure | A core purchase journey is blocked | Add-to-cart flow and cart badge assertion |
| Resource or dependency failure | UI may load partially or misleadingly | Network status and content-type validation |
| Invalid customer data accepted | Downstream processing and support risk | Required-field and format validation |
| API contract drift | Consumers receive unusable responses | Status and payload-shape assertions |
| Environmental UI noise | False failures reduce trust in CI | Third-party ad traffic blocked at route level |
| Timing-based flakiness | Unstable release decisions | No fixed waits; web-first assertions |
| Weak diagnostics | Failures require expensive local reproduction | Trace, video, screenshot, and HTML report |

## Test layers

### UI journeys

UI tests are reserved for behaviour that must be proven through the browser: authentication, cart state, form validation, and rendered confirmation.

Principles:

- assert user-visible outcomes, not implementation details;
- keep selectors stable and intent-revealing;
- isolate reusable interaction logic in Page Objects;
- avoid shared mutable state;
- use browser-native waiting and web-first assertions.

### Network checks

Network checks verify that required resources or service calls are not silently failing underneath an apparently healthy page.

For the current public commerce target, this includes bundle and product-resource responses. In a private product, the same pattern would bind to session, catalogue, pricing, inventory, or cart endpoints.

### API checks

API checks provide fast feedback below the UI layer. Assertions currently focus on availability and core response shape. A broader engagement would add typed clients, schema validation, authorization boundaries, negative contracts, idempotency, and domain-specific invariants.

## Stability policy

A retry is diagnostic evidence, not proof that a test is healthy.

The framework follows these rules:

1. No fixed sleeps or hard waits.
2. Use deterministic selectors and web-first assertions.
3. Block known third-party noise when it is outside the behaviour under test.
4. Keep scenarios independent and repeatable.
5. Preserve evidence on failure.
6. Treat recurring retry success as flakiness requiring investigation.

The repository enforces the no-hard-waits rule through `npm run lint:waits` and includes it in the required quality gate.

## Test data

Current public targets use dedicated, non-sensitive test values and environment-driven credentials.

For a production engagement, the preferred model is:

- generated data per scenario;
- explicit ownership and cleanup;
- no production personal data;
- isolated users or entities for parallel tests;
- secrets stored only in the CI secret manager;
- environment-specific configuration without code changes.

## Diagnostics

A failed test should answer three questions quickly:

1. What failed?
2. What did the browser or service return?
3. What evidence is available without rerunning locally?

Cypress provides screenshots and video. Playwright provides screenshots, trace, video, and HTML reporting. CI uploads these artifacts on failure.

## Expansion priorities

A larger product would add coverage in this order:

1. smoke tagging for release-blocking paths;
2. typed API clients and schema validation;
3. domain-level flow objects above Page Objects;
4. test-data factories and isolated provisioning;
5. cross-browser nightly regression;
6. accessibility and visual checks for stable high-value surfaces;
7. retry-rate, duration, and failure-trend reporting;
8. explicit suite ownership and quarantine SLAs.

The goal is not simply more tests. The goal is faster, more reliable release decisions.
