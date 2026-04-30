import { test, expect } from '../../fixtures/test';
import { TextBoxPage, TextBoxData } from '../../pages/TextBoxPage';

test.describe('DemoQA — Text Box form', () => {
  test('submits the form and renders all values in the output', async ({ page }) => {
    const data: TextBoxData = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      currentAddress: '221B Baker Street, London',
      permanentAddress: '742 Evergreen Terrace, Springfield'
    };

    const textBox = new TextBoxPage(page);
    await textBox.goto();
    await textBox.fillAndSubmit(data);
    await textBox.assertSubmittedValues(data);
  });

  test('does not render output when form has not been submitted', async ({ page }) => {
    const textBox = new TextBoxPage(page);
    await textBox.goto();
    await expect(page.locator('#output #name')).toHaveCount(0);
  });
});
