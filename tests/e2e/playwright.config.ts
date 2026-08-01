import { defineConfig, devices, ReporterDescription } from "@playwright/test";

import * as dotenv from "dotenv";
import * as path from "node:path";

// Read from default ".env" file.
dotenv.config({ path: path.resolve(__dirname, ".env"), quiet: true });

const isCoverageEnabled =
  process.env.E2E_COVERAGE === "true" || process.env.COVERAGE === "true";

const reporters: ReporterDescription[] = [["html"]];

if (isCoverageEnabled) {
  reporters.push([
    "monocart-reporter",
    {
      name: "Saldu E2E Frontend Coverage Report",
      outputDir: "./coverage",
      reports: ["v8", "html", "console-summary"],
      entryFilter: (entry: { url: string }) =>
        entry.url.includes("/_next/static/") &&
        !entry.url.includes("node_modules"),
      sourceFilter: (sourcePath: string) => sourcePath.includes("apps/web/src"),
    },
  ]);
}

export default defineConfig({
  testDir: "./tests",
  globalSetup: "playwright.setup.ts",

  fullyParallel: false,
  reporter: reporters,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  use: {
    baseURL: process.env.E2E_WEB_URL || "http://localhost:3000",
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
