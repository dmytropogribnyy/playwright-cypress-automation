// Loaded automatically before every spec.
// SauceDemo's bundle throws benign errors on resource preload — we keep
// Cypress's default uncaught-exception behaviour but add a narrow allow-list.
Cypress.on('uncaught:exception', (err) => {
  if (/ResizeObserver loop/i.test(err.message)) {
    return false;
  }
  return undefined;
});
