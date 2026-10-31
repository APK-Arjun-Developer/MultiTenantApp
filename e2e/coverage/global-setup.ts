import MCR from 'monocart-coverage-reports';

import { coverageOptions, isCoverageEnabled } from './options';

const globalSetup = () => {
  if (isCoverageEnabled) MCR(coverageOptions).cleanCache();
};

export default globalSetup;
