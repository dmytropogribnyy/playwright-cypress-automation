# Release Gates

## Purpose

The pipeline is designed to answer a practical release question: is the change safe enough to merge, and will a failure leave enough evidence for the team to act quickly?

## Required pull-request gates

### 1. Quality policy

Command:

```bash
npm run quality
```

Checks:

- TypeScript compilation with strict settings;
- repository-wide prohibition of fixed waits.

A failure here blocks the browser suites because type and stability-policy violations should be resolved before spending CI time on full execution.

### 2. Cypress coverage

Command:

```bash
npm run cy:run
```

Protects:

- authentication;
- rejected credentials;
- cart state;
- network resource health;
- Cypress API coverage.

Failure evidence:

- screenshots;
- video;
- CI logs.

### 3. Playwright coverage

Command:

```bash
npm run pw:test
```

Protects:

- customer-data form behaviour;
- required-field validation;
- invalid-format validation;
- Playwright API coverage;
- browser diagnostics.

Failure evidence:

- screenshots;
- trace;
- video;
- HTML report;
- CI logs.

## Local release check

Before opening a pull request:

```bash
npm run verify
```

This runs the quality policy followed by both automation runners.

## Scheduled regression

The workflow runs on weekday schedules in addition to pull requests and pushes. Scheduled execution is useful for detecting:

- public target drift;
- dependency or browser changes;
- environmental instability;
- failures that are independent of a repository change.

A scheduled failure is investigated separately from a change-induced pull-request failure. Public targets are external dependencies and may change without notice.

## Merge policy

A change is considered merge-ready when:

- all required CI jobs pass;
- no test is disabled to obtain a green build;
- retries are reviewed when they hide a first-attempt failure;
- new behaviour includes the appropriate layer of coverage;
- failure evidence remains available and actionable;
- environment-specific values are not committed as secrets.

## Failure triage

Classify a failed gate before changing the test:

| Category | Example | Response |
|---|---|---|
| Product defect | Cart state is not updated | Preserve evidence and raise a defect |
| Automation defect | Selector no longer represents intent | Repair the automation and add regression protection |
| Environment defect | Public target unavailable | Record dependency failure; do not weaken assertions silently |
| Test-data defect | Shared account or state collision | Isolate or regenerate data |
| Flaky behaviour | Passes only on retry | Investigate timing, ownership, and dependency signals |

The default response is never to add a fixed wait or remove the assertion that exposed the risk.
