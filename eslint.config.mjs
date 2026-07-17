import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

const config = defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      eslintConfigPrettier,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // ── TypeScript ───────────────────────────────────────────────────────────
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // ── General JS ──────────────────────────────────────────────────────────
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': 'warn',
      'prefer-const': 'error',
      'object-shorthand': 'error',
      // ── Import discipline ────────────────────────────────────────────────────
      // Multiple import statements from the same path must be merged into one.
      'no-duplicate-imports': 'error',
      // Always import shared components and layouts through their barrel index,
      // not via direct sub-path (e.g. '@/shared/components/Icon'). Files inside
      // the same directory should use relative imports instead ('../../Icon').
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/shared/components/*'],
              message: 'Import from "@/shared/components" barrel instead of the direct file path.',
            },
            {
              group: ['@/shared/layouts/*'],
              message: 'Import from "@/shared/layouts" barrel instead of the direct file path.',
            },
          ],
        },
      ],
    },
  },
  {
    // router.tsx intentionally mixes lazy page components with the router constant —
    // fast refresh does not apply to this infrastructure file.
    files: ['src/app/router.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // Component files: enforce arrow functions and export default only.
    files: ['src/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          // Block: export const X = ... (named value export in component files)
          selector: 'ExportNamedDeclaration[declaration.type="VariableDeclaration"]',
          message:
            'Component files must use export default only. Remove export from the declaration and keep export default at the bottom.',
        },
        {
          // Block: export function X() {} (named function declaration)
          selector: 'ExportNamedDeclaration > FunctionDeclaration',
          message:
            'Component files must use export default only, and arrow functions instead of function declarations.',
        },
        {
          // Block: function expression inside memo() — use arrow instead.
          // Exception: DataTable uses function DataTable<TData> to preserve TS generics through React.memo.
          selector:
            'CallExpression[callee.name="memo"] > FunctionExpression, CallExpression[callee.object.name="React"][callee.property.name="memo"] > FunctionExpression',
          message:
            'Use an arrow function inside memo() instead of a named function expression. Exception: generic components may keep function expressions for TypeScript compatibility.',
        },
      ],
    },
  },
  {
    // Hook files in .tsx: named exports and function declarations are valid for hooks — override the component block above.
    files: ['src/shared/hooks/**/*.tsx'],
    rules: { 'no-restricted-syntax': 'off' },
  },
]);

export default config;
