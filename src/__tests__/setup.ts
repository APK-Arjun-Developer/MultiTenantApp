import '@testing-library/jest-dom/vitest';

import { cleanup, configure } from '@testing-library/react';
import { MotionGlobalConfig } from 'framer-motion';
import { toHaveNoViolations } from 'jest-axe';
import { afterAll, afterEach, beforeAll, expect } from 'vitest';

import { server } from './msw/server';

expect.extend(toHaveNoViolations);

// findBy*/waitFor wait up to 5s (default 1s): lazy route chunks and MUI forms load slower
// under coverage and on CI runners. Passing tests resolve as soon as the UI is ready.
configure({ asyncUtilTimeout: 5000 });

// Finish framer-motion animations instantly: page/step transitions (AnimatePresence
// mode="wait") otherwise depend on jsdom timer timing and flake under parallel load.
MotionGlobalConfig.skipAnimations = true;

// jsdom has no ResizeObserver; Recharts' ResponsiveContainer needs one to mount.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub;

// Every API call in a test must be mocked explicitly; unmocked calls fail the test.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  localStorage.clear();
});

afterAll(() => server.close());
