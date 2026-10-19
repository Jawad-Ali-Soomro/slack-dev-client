import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for the Slack Dev client.
 * Docs: https://playwright.dev/docs/test-configuration
 *
 * The `webServer` block boots the Vite dev server automatically before the
 * tests run (reusing an already-running server locally). Override the target
 * with the PLAYWRIGHT_BASE_URL env var to run against a deployed environment.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173";

export default defineConfig({
  testDir: "./tests/e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if test.only is left in the source */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel workers on CI */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use */
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "html",

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    /* The app disables its GSAP/intro animations under reduced motion, which
       keeps elements stable for click actionability checks. */
    reducedMotion: "reduce",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
