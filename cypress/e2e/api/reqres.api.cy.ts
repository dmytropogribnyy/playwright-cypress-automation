interface ReqresUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

interface ReqresUsersResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: ReqresUser[];
}

describe('Reqres API — GET /api/users?page=2', () => {
  it('returns 200 with a non-empty users array', () => {
    const baseUrl = Cypress.env('reqresBaseUrl') as string;
    const apiKey = Cypress.env('reqresApiKey') as string;

    const headers: Record<string, string> = {};
    if (apiKey) headers['x-api-key'] = apiKey;

    cy.request<ReqresUsersResponse>({
      method: 'GET',
      url: `${baseUrl}/api/users?page=2`,
      headers,
    }).then((response) => {
      expect(response.status, 'status code must be 200').to.eq(200);

      const body = response.body;
      expect(body.data, 'data must be a non-empty array')
        .to.be.an('array')
        .and.have.length.greaterThan(0);
      expect(body.data[0]).to.have.property('id').that.is.a('number');
      expect(body.data[0]).to.have.property('email').that.is.a('string');
      expect(body.data[0]).to.have.property('first_name').that.is.a('string');
    });
  });
});
