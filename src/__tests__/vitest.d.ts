import 'vitest';

interface AxeMatchers<R = void> {
  toHaveNoViolations: () => R;
}

declare module 'vitest' {
  // Must mirror Vitest's own generic signature for declaration merging.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
  interface Assertion<T = any> extends AxeMatchers {}
}
