import { expect, test } from '@playwright/test';
import { authenticateTestUser } from './test-auth-service';
import { resetDatabase } from './test-db';

test.beforeEach(async () => {
  await resetDatabase();
})

test('unauthenticated user should see login button', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId("login-button-google")).toBeAttached();
});

test('authenticated user should not see login button', async ({ page, context }) => {
  await authenticateTestUser(context);

  await page.goto('http://localhost:4173/');
  await expect(page.getByTestId("login-button-google")).not.toBeAttached();
});