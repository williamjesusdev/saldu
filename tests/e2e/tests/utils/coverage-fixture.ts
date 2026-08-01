import { test as baseTest } from '@playwright/test';
import { addCoverageReport } from 'monocart-reporter';

export const test = baseTest.extend({
  autoTestCoverage: [
    async ({ page }, use, testInfo) => {
      const isCoverageEnabled =
        process.env.E2E_COVERAGE === 'true' || process.env.COVERAGE === 'true';
      const isChromium = page.context().browser()?.browserType().name() === 'chromium';

      if (isCoverageEnabled && isChromium) {
        await Promise.all([
          page.coverage.startJSCoverage({ resetOnNavigation: false }),
          page.coverage.startCSSCoverage({ resetOnNavigation: false }),
        ]);
      }

      await use();

      if (isCoverageEnabled && isChromium) {
        const [jsCoverage, cssCoverage] = await Promise.all([
          page.coverage.stopJSCoverage(),
          page.coverage.stopCSSCoverage(),
        ]);
        const coverageList = [...jsCoverage, ...cssCoverage];
        await addCoverageReport(coverageList, testInfo);
      }
    },
    { scope: 'test', auto: true },
  ],
});

export { expect } from '@playwright/test';
