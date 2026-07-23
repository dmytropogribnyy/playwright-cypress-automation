# Risk and Coverage Traceability

This matrix connects product risk to executable automation and the CI gate that makes the result operationally useful.

| Risk ID | Product risk | Acceptance signal | Cypress evidence | Playwright evidence | Required gate |
|---|---|---|---|---|---|
| AUTH-01 | A valid customer cannot authenticate | Inventory is visible after login | `cypress/e2e/smoke/commerce-checkout.cy.ts` | `playwright/tests/commerce/checkout.spec.ts` | Both smoke gates |
| AUTH-02 | Invalid credentials are accepted or poorly explained | Login remains blocked and an actionable error is shown | `cypress/e2e/ui/saucedemo.login.cy.ts` | Planned parity increment | Cypress regression |
| CART-01 | Selected product is not retained in cart | Badge is updated and the named item has quantity 1 | `cypress/e2e/smoke/commerce-checkout.cy.ts` | `playwright/tests/commerce/checkout.spec.ts` | Both smoke gates |
| CHK-01 | Customer cannot complete the critical purchase journey | Checkout reaches order confirmation | `cypress/e2e/smoke/commerce-checkout.cy.ts` | `playwright/tests/commerce/checkout.spec.ts` | Both smoke gates |
| CHK-02 | Checkout accepts incomplete customer data | Missing postal code blocks progression with a clear error | `cypress/e2e/ui/saucedemo.checkout-validation.cy.ts` | `playwright/tests/commerce/checkout.spec.ts` | Both regression gates |
| FIN-01 | Displayed order total is internally inconsistent | `subtotal + tax = total` | Critical checkout smoke | Critical checkout parity smoke | Both smoke gates |
| NET-01 | Required application resources fail while UI appears healthy | Script and product-media responses have successful status and expected content type | `cypress/e2e/ui/saucedemo.network.cy.ts` | Network parity is not yet required | Cypress regression |
| API-01 | User-service response becomes unavailable or structurally unusable | Successful response with non-empty typed user data | `cypress/e2e/api/reqres.api.cy.ts` | Not duplicated | Cypress regression |
| API-02 | Content-service collection drifts | Successful JSON response with required post properties | Not duplicated | `playwright/tests/api/posts.api.spec.ts` | Playwright regression |
| FORM-01 | Required or formatted customer fields are accepted incorrectly | Positive submission and negative validation remain correct | Not duplicated | `playwright/tests/ui/practice-form.spec.ts` | Playwright regression |
| OBS-01 | A CI failure cannot be investigated remotely | Failure artifacts are uploaded and linked to the run | Screenshot + video | Screenshot + video + trace + HTML report | All browser gates |
| STAB-01 | Timing workarounds create unreliable release decisions | No fixed waits are present | Repository-wide rule | Repository-wide rule | Quality policy |

## Release interpretation

- **Smoke failure:** the release is blocked because a critical commerce journey or its migration parity is broken.
- **Regression failure:** the release is blocked because supporting UI, API, validation, or network coverage regressed.
- **Quality-policy failure:** browser execution is not trusted until type or stability-policy violations are fixed.
- **Cross-browser scheduled failure:** investigate browser-specific compatibility or public-target drift before promoting the Playwright migration slice.

## Maintenance rule

Every new release-blocking scenario must add or update a risk row in the same pull request. Every deleted scenario must identify the replacement control or explicitly record the accepted gap.
