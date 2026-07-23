import { sauceLoginPage } from '../../pages/SauceLoginPage';
import { sauceInventoryPage } from '../../pages/SauceInventoryPage';

/**
 * The public commerce target is a client-side application rather than a
 * service-backed product API. This scenario therefore verifies the real
 * resources required to render the authenticated inventory experience.
 *
 * Match by resource type instead of a build-tool-specific directory such as
 * `/static/js/`. Bundlers and deployment layouts can change while the quality
 * requirement remains the same: executable assets and product media must load
 * successfully with the expected content type.
 */
describe('Commerce UI — network health during authentication and inventory load', () => {
  it('validates script and product-media responses independently of UI assertions', () => {
    cy.intercept({
      method: 'GET',
      url: /\.js(?:\?.*)?$/i,
    }).as('scriptAsset');

    cy.intercept({
      method: 'GET',
      url: /\.(?:png|jpe?g|webp|svg)(?:\?.*)?$/i,
    }).as('productMedia');

    sauceLoginPage.visit();
    sauceLoginPage.login(
      Cypress.env('sauceUsername'),
      Cypress.env('saucePassword')
    );

    cy.wait('@scriptAsset').then(({ response }) => {
      expect(response, 'script response').to.exist;
      expect(response!.statusCode).to.be.oneOf([200, 304]);
      expect(String(response!.headers['content-type'])).to.match(
        /javascript|ecmascript/i
      );
    });

    cy.wait('@productMedia').then(({ response }) => {
      expect(response, 'product-media response').to.exist;
      expect(response!.statusCode).to.be.oneOf([200, 304]);
      expect(String(response!.headers['content-type'])).to.match(/image\//i);
    });

    sauceInventoryPage.assertLoaded();
  });
});
