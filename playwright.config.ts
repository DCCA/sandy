import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config for the Sandy sandbox. Boots the production server and runs the
 * specs in e2e/ against Chromium. In CI, build first (`npm run build`) so the
 * webServer command can `npm start`.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use the environment-provided Chromium instead of downloading one.
        // Falls back to Playwright's default resolution when the env var is unset.
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
        },
      },
    },
  ],
  webServer: {
    command: "npm run start -- --port 3100",
    url: "http://127.0.0.1:3100/sandbox",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
