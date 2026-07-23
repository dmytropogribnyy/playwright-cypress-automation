# Cypress to Playwright Migration Strategy

## Decision context

The framework represents a common delivery situation: a stable Cypress suite already protects key browser behaviour while the team introduces Playwright for stronger browser isolation, tracing, cross-browser execution, and long-term platform consolidation.

A big-bang rewrite would temporarily reduce release confidence and make regressions difficult to attribute. Northstar therefore uses a controlled parity model: migrate business journeys one at a time, run both implementations against the same observable outcomes, and retire the legacy scenario only after the replacement proves stable.

## Migration principles

1. **Migrate business journeys, not individual selectors.** A migrated scenario must preserve the customer outcome and risk coverage, not reproduce implementation details line by line.
2. **Keep one source of business intent.** The traceability matrix defines the protected risk and acceptance criteria shared by both runners.
3. **Run in parallel during the proof window.** Cypress remains the baseline while Playwright executes the same critical path in CI.
4. **Compare evidence quality as well as pass/fail.** The replacement must leave actionable screenshots, video, trace, report, and logs.
5. **Do not hide instability with retries.** Retry-only passes are investigated before a scenario is considered migration-ready.
6. **Retire deliberately.** A Cypress scenario is removed only when Playwright parity is demonstrated, ownership is agreed, and the release gate is updated in the same change.

## Current parity slice

| Capability | Cypress baseline | Playwright replacement | Status |
|---|---|---|---|
| Valid authentication | `cypress/e2e/smoke/commerce-checkout.cy.ts` | `playwright/tests/commerce/checkout.spec.ts` | Parity implemented |
| Product selection | Same critical flow | Same critical flow | Parity implemented |
| Cart state | Badge + cart item/quantity | Badge + cart item/quantity | Parity implemented |
| Checkout customer data | Page model + flow | Page model + flow | Parity implemented |
| Order financial reconciliation | Subtotal + tax = total | Subtotal + tax = total | Parity implemented |
| Order confirmation | Confirmation header + return action | Confirmation header + return action | Parity implemented |
| Missing postal code | Cypress regression | Playwright regression | Parity implemented |
| Cross-browser critical path | Not applicable to Cypress baseline | Chromium, Firefox, WebKit on scheduled/manual runs | Implemented |

## Parity acceptance criteria

A journey is migration-ready when both implementations:

- start from an isolated, known account state;
- exercise the same customer intent;
- assert the same release-blocking outcomes;
- validate important domain invariants, including order-total reconciliation;
- avoid fixed sleeps and hidden state dependencies;
- pass the required CI gates without relying on retries;
- leave sufficient evidence for failure triage;
- are mapped to the same risk IDs in `TRACEABILITY.md`.

## Delivery stages

### Stage 1 — Baseline

Document the existing Cypress journey, its business risk, selectors, data dependencies, runtime, and diagnostic gaps.

### Stage 2 — Playwright parity

Implement the same journey with Playwright using browser-native waiting, isolated contexts, Page Objects, and a domain flow above the page layer.

### Stage 3 — Dual-run proof

Run Cypress smoke and Playwright parity smoke as independent required jobs. Compare outcomes and investigate any disagreement instead of weakening one implementation.

### Stage 4 — Broader confidence

Run the Playwright critical path across Chromium, Firefox, and WebKit on scheduled and manual workflows. Keep PR feedback focused on Chromium for speed.

### Stage 5 — Retirement

Remove the Cypress duplicate only when the Playwright path is stable, the CI gate and documentation are updated, and no unique Cypress-only diagnostic or network coverage is being lost.

## What remains in Cypress

Cypress continues to provide value for:

- the existing network-interception scenario;
- direct API checks already integrated with the suite;
- legacy regression coverage that has not yet reached migration parity;
- comparison of failure signal during the controlled transition.

The goal is not to maintain two permanent copies of every test. The dual-runner period exists to protect releases while the framework evolves.
