# Release Gates

## Purpose

The pipeline answers two questions:

1. Is the change safe enough to merge?
2. Will a failure leave enough evidence for the team to act quickly?

The framework separates fast critical-path feedback from supporting regression coverage, then aggregates required results into one explicit release decision.

## Required pull-request gates

### 1. Quality policy

Command:

```bash
npm run quality
```

Checks:

- strict TypeScript compilation;
- repository-wide prohibition of fixed waits.

A failure blocks browser suites because type and stability-policy violations must be resolved before spending CI time on browser execution.

### 2. Cypress smoke

Command:

```bash
npm run cy:smoke
```

Protects the established purchase baseline:

- valid authentication;
- named product selection;
- cart badge and quantity;
- checkout customer data;
- order-review product presence;
- subtotal, tax, and total reconciliation;
- order confirmation.

Failure evidence:

- screenshot;
- video;
- CI logs;
- job summary.

### 3. Playwright migration-parity smoke

Command:

```bash
npm run pw:smoke
```

Protects the same business outcome using the Playwright replacement path. The job is independent of Cypress so a disagreement remains visible.

Failure and review evidence:

- screenshot;
- retained trace;
- retained video;
- HTML report uploaded on success or failure;
- CI logs;
- job summary.

### 4. Cypress regression

Command:

```bash
npm run cy:regression
```

Protects:

- rejected credentials;
- missing checkout data;
- network resource health;
- Cypress service-contract coverage;
- supporting commerce UI checks.

### 5. Playwright regression

Command:

```bash
npm run pw:regression
```

Protects:

- missing checkout data;
- customer-data form behaviour;
- required-field and invalid-format validation;
- Playwright service-contract coverage;
- browser diagnostics outside the smoke slice.

### 6. Release decision

The final job runs even when an upstream gate fails. It writes a table of required results to the GitHub Actions summary and exits unsuccessfully unless every required gate is green.

Required inputs:

- quality policy;
- Cypress smoke;
- Playwright parity smoke;
- Cypress regression;
- Playwright regression.

The final output is explicitly either:

```text
Release decision: PASS
```

or:

```text
Release decision: BLOCKED
```

This avoids treating a partially green workflow as release approval.

## Local release check

Before opening a pull request:

```bash
npm run verify
```

This runs the quality policy, Cypress smoke and regression, and Playwright smoke and regression on Chromium.

## Scheduled and manual cross-browser gate

Scheduled and manually dispatched workflows additionally execute:

```bash
npm run pw:cross-browser
```

The critical Playwright journey runs on:

- Chromium;
- Firefox;
- WebKit.

This layer detects browser-specific behaviour, dependency changes, and public-target drift without increasing normal pull-request feedback time.

## Merge policy

A change is merge-ready when:

- every required gate passes;
- the final release decision is `PASS`;
- no test is disabled to obtain a green build;
- retry-only passes are reviewed as potential flakiness;
- new release-blocking behaviour is mapped in `TRACEABILITY.md`;
- migration changes preserve or explicitly replace existing risk coverage;
- failure evidence remains available and actionable;
- environment-specific values are not committed as secrets.

## Failure triage

Classify a failed gate before changing the test:

| Category | Example | Response |
|---|---|---|
| Product defect | Cart state or checkout result is wrong | Preserve evidence and raise a defect |
| Automation defect | Locator no longer represents intent | Repair automation and add regression protection |
| Migration mismatch | Cypress and Playwright disagree | Compare business outcomes and evidence before promotion |
| Environment defect | Public target is unavailable | Record dependency failure; do not weaken assertions silently |
| Test-data defect | Shared account or state collision | Isolate or regenerate data |
| Flaky behaviour | Scenario passes only on retry | Investigate timing, ownership, and dependency signals |

The default response is never to add a fixed wait, remove the assertion that exposed the risk, or claim release confidence from only one side of the migration proof.
