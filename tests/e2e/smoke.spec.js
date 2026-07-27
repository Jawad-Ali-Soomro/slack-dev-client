import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("loads the landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Slack Developers/i);
  });

  test("shows the primary call to action", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/Get Started Free/i).first()
    ).toBeVisible();
  });

  test("can navigate to the login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page).toHaveTitle(/Login/i);
  });
});
