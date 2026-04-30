import { sauceLoginPage } from '../../pages/SauceLoginPage';
import { sauceInventoryPage } from '../../pages/SauceInventoryPage';

/**
 * SauceDemo is a fully client-side SPA: it does not expose a real product
 * REST API, so "network validation" here targets the actual requests the
 * application fires during login → inventory load. This same pattern would
 * apply unchanged to a real /api/inventory call in a production system.
 *
 * We intercept two layers:
 *   1. The bundled JS (cy.intercept reliably catches XHR/static asset
 *      requests; navigation requests are less reliable cross-version).
 *   2. A product image request — proves the product-load network round-trip
 *      succeeded, independent of UI assertions.
 *
 * Each interception validates status, content-type, and (where applicable)
 * a body marker — beyond a single UI check.
 */
describe('SauceDemo — network interception during login + product load', () => {
  it('validates JS bundle and product image responses at the network layer', () => {
    cy.intercept('GET', '**/static/js/*.js').as('jsBundle');
    cy.intercept('GET', '**/static/media/*.jpg').as('productImage');

    sauceLoginPage.visit();
    sauceLoginPage.login(
      Cypress.env('sauceUsername'),
      Cypress.env('saucePassword')
    );

    cy.wait('@jsBundle').then(({ response }) => {
      expect(response, 'JS bundle response').to.exist;
      expect(response!.statusCode).to.be.oneOf([200, 304]);
      expect(response!.headers).to.have.property('content-type');
      expect(String(response!.headers['content-type'])).to.match(
        /javascript|application\/json/i
      );
    });

    cy.wait('@productImage').then(({ response }) => {
      expect(response, 'product image response').to.exist;
      expect(response!.statusCode).to.be.oneOf([200, 304]);
      expect(String(response!.headers['content-type'])).to.match(/image\//i);
    });

    sauceInventoryPage.assertLoaded();
  });
});
