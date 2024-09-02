import { expect, test } from '@playwright/test';
import { authenticateTestUser } from './test-auth-service';
import { resetDatabase } from './test-db';

test.beforeEach(async () => {
  await resetDatabase();
})

test('unauthenticated user should not see logout button', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId("logout-button")).not.toBeAttached();
});

test('authenticated user should see logout button', async ({ page, context }) => {
  await authenticateTestUser(context);

  await page.goto('http://localhost:4173/');
  await expect(page.getByTestId("logout-button")).toBeAttached();
});