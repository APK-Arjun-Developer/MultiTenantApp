import type { CoverageReportOptions } from 'monocart-coverage-reports';
import { posix } from 'node:path';

const isCoverageEnabled = process.env.E2E_COVERAGE === 'true';

const toPosix = (path: string) => path.replace(/\\/g, '/');

const isAppSource = (path: string) => {
  const file = toPosix(path);
  return (
    /(^|\/)src\/.+\.tsx?$/.test(file) &&
    !file.endsWith('.d.ts') &&
    !/\.test\.tsx?$/.test(file) &&
    !file.includes('src/__tests__/')
  );
};

// Vite sourcemaps list sources relative to the module (e.g. "LoginPage.tsx"),
// so resolve them against the served module path (e.g. "src/pages/LoginPage.tsx").
const resolveSourcePath = (filePath: string, distFile?: string) => {
  const file = toPosix(filePath);
  if (file.includes('/') || !distFile) return file.replace(/^.*?(src\/)/, '$1');
  return posix.join(posix.dirname(toPosix(distFile)), file);
};

const coverageOptions: CoverageReportOptions = {
  name: 'E2E Coverage',
  outputDir: './coverage-e2e',
  reports: ['lcovonly', 'console-summary', 'json-summary', 'html'],
  // Vite serves app modules as /src/...; drops deps, the Vite client and virtual modules.
  entryFilter: (entry) => new URL(entry.url).pathname.startsWith('/src/'),
  sourceFilter: (sourcePath) => /\.tsx?$/.test(sourcePath),
  sourcePath: (filePath, { distFile }) => resolveSourcePath(filePath, distFile),
  outputFilter: {
    'src/__tests__/**': false,
    '**/*.test.{ts,tsx}': false,
    '**/*.d.ts': false,
    'src/**/*.{ts,tsx}': true,
  },
  // Count files no test loaded, so the percentage is over the whole app.
  all: {
    dir: ['./src'],
    filter: isAppSource,
  },
};

export { coverageOptions, isCoverageEnabled };
