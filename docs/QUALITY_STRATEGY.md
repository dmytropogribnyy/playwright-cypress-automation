# Quality Strategy

## Objective

Provide fast, trustworthy release feedback for the critical commerce journey while keeping the automation maintainable, diagnosable, and safe to evolve from Cypress to Playwright.

Northstar is risk-driven. It does not automate every visible interaction. It protects behaviours whose failure would block a customer, corrupt an order decision, hide a broken dependency, or make incident investigation unnecessarily expensive.

## Quality risks

| Risk | Impact | Executable control |
|---|---|---|
| Authentication failure | Customers cannot enter the product | Positive critical path and rejected-credential regression |
| Cart-state failure | The purchase journey is blocked | Named product, badge, and quantity assertions |
| Checkout failure | Revenue flow cannot complete | End-to-end confirmation journey in both runners |
| Invalid customer data accepted | Downstream processing and support risk | Missing-field and format validation |
| Financial inconsistency | Displayed order total cannot be trusted | Subtotal + tax = total invariant in both runners |
| Resource or dependency failure | UI may load partially or misleadingly | Network status and content-type validation |
| API contract drift | Consumers receive unusable responses | Status, type, collection, and required-property assertions |
| Environmental UI noise | False failures reduce trust in CI | Third-party ad traffic blocked at route level |
| Timing-based flakiness | Release decisions become unstable | No fixed waits; web-first assertions |
| Weak diagnostics | Failures require local reproduction | Trace, video, screenshot, report, and CI summaries |
| Migration coverage loss | Tool modernization silently removes protection | Independent Cypress baseline and Playwright parity smoke |

Risk-to-test ownership is maintained in `TRACEABILITY.md`.

## Test layers

### Domain flows

`PurchaseFlow` represents the business journey above individual pages. It coordinates authentication, product selection, cart verification, checkout, financial reconciliation, and confirmation.

Both Cypress and Playwright expose the same business intent while retaining runner-appropriate mechanics. This makes migration comparison meaningful without forcing identical implementation code.

### Page models

Page models own selectors and local interactions. Tests and flows should not duplicate selector knowledge.

Principles:

- use stable `data-test` attributes and role-based locators;
- assert user-visible outcomes rather than CSS structure;
- select products by business name rather than list position;
- keep navigation expectations close to the action that triggers them;
- avoid shared mutable state between scenarios.

### UI journeys

UI coverage is reserved for behaviour that must be proven through a browser:

- authentication;
- cart state;
- customer-data validation;
- checkout review;
- order confirmation;
- rendered form results.

### Network checks

Network checks verify that required resources or service calls are not silently failing underneath an apparently healthy page.

For the current public commerce target, Cypress validates JavaScript and product-media responses by resource type rather than by bundler-specific paths. In a private product, the same pattern would normally bind to session, catalogue, pricing, inventory, or cart endpoints.

### API checks

API checks provide feedback below the UI layer. Current assertions cover availability and important response properties. A broader engagement would add schema validation, authorization boundaries, negative contracts, idempotency, and domain-specific invariants.

## Migration quality control

The critical purchase journey is executed independently in Cypress and Playwright.

Parity requires both runners to prove:

- successful authentication;
- named product selection;
- cart quantity;
- checkout progression;
- product presence in review;
- subtotal, tax, and total reconciliation;
- order confirmation;
- actionable diagnostics on failure.

The detailed retirement model is documented in `MIGRATION_STRATEGY.md`.

## Stability policy

A retry is diagnostic evidence, not proof that a test is healthy.

The framework follows these rules:

1. No fixed sleeps or hard waits.
2. Use deterministic selectors and web-first assertions.
3. Block known third-party noise when it is outside the behaviour under test.
4. Keep scenarios independent and repeatable.
5. Use named entities and explicit invariants instead of positional assumptions.
6. Preserve evidence on failure.
7. Treat recurring retry success as flakiness requiring investigation.
8. Do not weaken assertions to accommodate public-target drift silently.

The repository enforces the no-hard-waits rule through `npm run lint:waits` and includes it in the required quality gate.

## Execution profiles

### Smoke

The smoke slice protects the complete purchase path and runs independently in both runners. It is intended to fail quickly when a release-blocking customer outcome is broken.

### Regression

Regression slices cover supporting authentication, validation, network, API, and form behaviour. They run after their corresponding smoke gates.

### Cross-browser

The Playwright critical path runs across Chromium, Firefox, and WebKit on scheduled and manual workflows. Pull requests remain Chromium-focused for faster feedback.

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

1. What customer or service outcome failed?
2. What did the browser or service return?
3. What evidence is available without rerunning locally?

Cypress provides screenshots and video. Playwright provides screenshots, trace, video, and HTML reporting. CI uploads evidence packages and produces an operator-facing release summary.

## Expansion priorities

The next valuable increments are:

1. migrate invalid-authentication parity to Playwright;
2. add JSON-schema validation for service contracts;
3. isolate test data through factories or builders;
4. add accessibility checks for stable critical pages;
5. add visual comparison for high-value surfaces;
6. track retry rate, duration, and failure trends;
7. define explicit suite ownership and quarantine SLAs.

The goal is not simply more tests. The goal is faster, more reliable release decisions with controlled framework evolution.
