interface DirectoryUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

interface DirectoryUsersResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: DirectoryUser[];
}

describe('Customer directory API — paginated users', () => {
  it('returns an authenticated, non-empty user collection with the core contract', () => {
    const baseUrl = Cypress.env('reqresBaseUrl') as string;
    const apiKey = Cypress.env('reqresApiKey') as string;

    expect(
      apiKey,
      'REQRES_API_KEY must be configured for authenticated directory coverage'
    ).to.be.a('string').and.not.be.empty;

    cy.request<DirectoryUsersResponse>({
      method: 'GET',
      url: `${baseUrl}/api/users?page=2`,
      headers: { 'x-api-key': apiKey },
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
