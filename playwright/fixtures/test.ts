import { test as base } from '@playwright/test';

const AD_HOSTS = [
  'googlesyndication',
  'doubleclick',
  'googletagmanager',
  'google-analytics',
  'adservice.google',
  'pagead2',
  'adsystem',
  'adnxs',
  'taboola',
  'outbrain'
];

/**
 * DemoQA renders heavy third-party ad iframes that frequently overlap form
 * controls and cause flaky clicks. The fixture aborts those requests at the
 * network layer so tests interact only with the application under test.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (AD_HOSTS.some((host) => url.includes(host))) {
        return route.abort();
      }
      return route.continue();
    });
    await use(page);
  }
});

export { expect } from '@playwright/test';
