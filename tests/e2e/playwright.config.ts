import { defineConfig, devices } from "@playwright/test";

import * as dotenv from "dotenv";
import * as path from "node:path";

// Read from default ".env" file.
dotenv.config({ path: path.resolve(__dirname, ".env"), quiet: true });

export default defineConfig({
  testDir: "./tests",
  globalSetup: "playwright.setup.ts",

  fullyParallel: true,
  reporter: "html",

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  expect: { timeout: 15000 },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
