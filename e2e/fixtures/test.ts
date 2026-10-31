import { test as base } from '@playwright/test';
import MCR from 'monocart-coverage-reports';

import { coverageOptions, isCoverageEnabled } from '../coverage/options';

const test = base.extend<{ collectCoverage: void }>({
  collectCoverage: [
    async ({ page }, use) => {
      if (!isCoverageEnabled) {
        await use();
        return;
      }
      await page.coverage.startJSCoverage({ resetOnNavigation: false });
      await use();
      const coverage = await page.coverage.stopJSCoverage();
      await MCR(coverageOptions).add(coverage);
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
export { test };
