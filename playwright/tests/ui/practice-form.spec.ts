import { test } from '../../fixtures/test';
import {
  PracticeFormPage,
  PracticeFormData,
} from '../../pages/PracticeFormPage';

const validData: PracticeFormData = {
  firstName: 'Alex',
  lastName: 'Turner',
  email: 'alex.turner@testmail.com',
  gender: 'Male',
  mobile: '7804321567',
};

test.describe('Customer registration — successful submission', () => {
  test('accepts complete customer data and confirms the submitted values', async ({
    page,
  }) => {
    const form = new PracticeFormPage(page);
    await form.goto();
    await form.fill(validData);
    await form.submitForm();
    await form.assertSuccessModal(validData);
  });
});

test.describe('Customer registration — validation controls', () => {
  test('blocks submission when required identity fields are empty', async ({
    page,
  }) => {
    const form = new PracticeFormPage(page);
    await form.goto();
    await form.fill({
      email: validData.email,
      gender: validData.gender,
      mobile: validData.mobile,
    });
    await form.submitForm();
    await form.assertModalNotVisible();
    await form.assertFieldInvalid('firstName');
    await form.assertFieldInvalid('lastName');
  });

  test('blocks submission when the mobile number has an invalid length', async ({
    page,
  }) => {
    const form = new PracticeFormPage(page);
    await form.goto();
    await form.fill({ ...validData, mobile: '123' });
    await form.submitForm();
    await form.assertModalNotVisible();
    await form.assertFieldInvalid('mobile');
  });
});
