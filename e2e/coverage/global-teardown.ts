import MCR from 'monocart-coverage-reports';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { coverageOptions, isCoverageEnabled } from './options';

type Metric = 'statements' | 'branches' | 'functions' | 'lines';

const METRICS: Metric[] = ['statements', 'branches', 'functions', 'lines'];
const THRESHOLDS_FILE = fileURLToPath(new URL('./thresholds.json', import.meta.url));

const globalTeardown = async () => {
  if (!isCoverageEnabled) return;

  const results = await MCR(coverageOptions).generate();
  if (!results) throw new Error('E2E coverage report was not generated.');

  const thresholds = JSON.parse(readFileSync(THRESHOLDS_FILE, 'utf8')) as Record<Metric, number>;
  const actual = Object.fromEntries(
    METRICS.map((metric) => [metric, Number(results.summary[metric].pct) || 0]),
  ) as Record<Metric, number>;

  const failures = METRICS.filter((metric) => actual[metric] < thresholds[metric]);
  if (failures.length > 0) {
    const details = failures
      .map((metric) => `${metric} ${actual[metric]}% < ${thresholds[metric]}%`)
      .join(', ');
    throw new Error(`E2E coverage below threshold: ${details}`);
  }

  // Ratchet: locally, raise thresholds to the new floor so coverage can't drop later.
  if (!process.env.CI) {
    const raised = Object.fromEntries(
      METRICS.map((metric) => [metric, Math.max(thresholds[metric], Math.floor(actual[metric]))]),
    );
    writeFileSync(THRESHOLDS_FILE, `${JSON.stringify(raised, null, 2)}\n`);
  }
};

export default globalTeardown;
