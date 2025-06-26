import { expect, test } from '@playwright/test';
import { authenticateTestUser } from './test-auth-service';
import { resetDatabase } from './test-db';

test.beforeEach(async () => {
  await resetDatabase();
})

test('unauthenticated user should not see account dropdown', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId("nav-bar-account")).not.toBeAttached();
});

test('authenticated user should see account dropdown', async ({ page, context }) => {
  await authenticateTestUser(context);

  await page.goto('http://localhost:4173/');
  await expect(page.getByTestId("nav-bar-account")).toBeAttached();
});