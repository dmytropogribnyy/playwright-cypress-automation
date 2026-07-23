import { test, expect } from '../../fixtures/test';
import { TextBoxPage, TextBoxData } from '../../pages/TextBoxPage';

test.describe('Customer profile — contact and address details', () => {
  test('submits customer details and renders the confirmed values', async ({
    page,
  }) => {
    const data: TextBoxData = {
      fullName: 'Alex Turner',
      email: 'alex.turner@testmail.com',
      currentAddress: '14 Maple Avenue, Austin TX 78701',
      permanentAddress: '9 Riverside Drive, Portland OR 97201',
    };

    const textBox = new TextBoxPage(page);
    await textBox.goto();
    await textBox.fillAndSubmit(data);
    await textBox.assertSubmittedValues(data);
  });

  test('does not expose a confirmation state before submission', async ({
    page,
  }) => {
    const textBox = new TextBoxPage(page);
    await textBox.goto();
    await expect(page.locator('#output #name')).toHaveCount(0);
  });
});
