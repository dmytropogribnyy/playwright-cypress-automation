import { expect, request, test } from '@playwright/test';

const BASE_URL =
  process.env.JSONPLACEHOLDER_BASE_URL || 'https://jsonplaceholder.typicode.com';

test.describe('Content service API — posts collection', () => {
  test('returns an available JSON collection with the expected core contract', async () => {
    const apiContext = await request.newContext({ baseURL: BASE_URL });

    try {
      const response = await apiContext.get('/posts');

      expect(response.status(), 'status code must be 200').toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body = await response.json();

      expect(Array.isArray(body), 'response body must be an array').toBeTruthy();
      expect(body.length).toBeGreaterThan(0);

      const first = body[0];
      expect(first).toHaveProperty('id');
      expect(typeof first.id).toBe('number');
      expect(first).toHaveProperty('title');
      expect(first).toHaveProperty('userId');
    } finally {
      await apiContext.dispose();
    }
  });
});
