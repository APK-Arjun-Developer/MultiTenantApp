/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'ci', 'chore', 'docs', 'refactor', 'test', 'perf', 'hotfix'],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [1, 'always', 100],
  },
  // Dependabot titles ("chore(deps): bump the minor-and-patch group ...") can exceed 72 chars
  // and still reach main inside dev -> main PRs.
  ignores: [(message) => /^chore\(deps(-dev)?\): bump /.test(message)],
};

export default config;
