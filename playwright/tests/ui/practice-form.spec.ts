import { test } from '../../fixtures/test';
import { PracticeFormPage, PracticeFormData } from '../../pages/PracticeFormPage';

const validData: PracticeFormData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  gender: 'Male',
  mobile: '5551234567'
};

test.describe('DemoQA — Practice Form (positive)', () => {
  test('submits with all required fields and shows confirmation modal', async ({ page }) => {
    const form = new PracticeFormPage(page);
    await form.goto();
    await form.fill(validData);
    await form.submitForm();
    await form.assertSuccessModal(validData);
  });
});

test.describe('DemoQA — Practice Form (negative)', () => {
  test('does not submit when required first/last name are empty', async ({ page }) => {
    const form = new PracticeFormPage(page);
    await form.goto();
    await form.fill({
      email: validData.email,
      gender: validData.gender,
      mobile: validData.mobile
    });
    await form.submitForm();
    await form.assertModalNotVisible();
    await form.assertFieldInvalid('firstName');
    await form.assertFieldInvalid('lastName');
  });

  test('does not submit when mobile number has fewer than 10 digits', async ({ page }) => {
    const form = new PracticeFormPage(page);
    await form.goto();
    await form.fill({ ...validData, mobile: '123' });
    await form.submitForm();
    await form.assertModalNotVisible();
    await form.assertFieldInvalid('mobile');
  });
});
