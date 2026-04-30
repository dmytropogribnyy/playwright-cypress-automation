import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  e2e: {
    baseUrl: process.env.SAUCE_BASE_URL || 'https://www.saucedemo.com',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1366,
    viewportHeight: 900,
    retries: { runMode: 2, openMode: 0 },
    setupNodeEvents(_on, config) {
      config.env.sauceUsername = process.env.SAUCE_USERNAME || 'standard_user';
      config.env.saucePassword = process.env.SAUCE_PASSWORD || 'secret_sauce';
      config.env.reqresBaseUrl = process.env.REQRES_BASE_URL || 'https://reqres.in';
      config.env.reqresApiKey = process.env.REQRES_API_KEY || '';
      return config;
    }
  }
});
