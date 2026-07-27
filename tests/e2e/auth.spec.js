import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("renders the login form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("requires email and password before submitting", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: /sign in/i }).click();

    // Native required validation keeps us on the login page
    await expect(page).toHaveURL(/\/login$/);
    const emailInvalid = await page
      .locator('input[name="email"]')
      .evaluate((el) => el.matches(":invalid"));
    expect(emailInvalid).toBe(true);
  });

  test("links to the signup page", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("link", { name: /register/i }).click();
    await expect(page).toHaveURL(/\/signup$/);
  });

  test("redirects unauthenticated users away from the dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });
});
