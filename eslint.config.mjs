import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

const config = defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'simple-import-sort': simpleImportSort },
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
      // ── Import / export ordering ─────────────────────────────────────────────
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side-effect imports first (e.g. import './polyfill')
            ['^\\u0000'],
            // External packages: react, @mui, @tanstack, axios, zod, etc.
            ['^react', '^@?\\w'],
            // Internal aliases: @/app, @/features, @/shared, @/pages, @/types
            ['^@/'],
            // Relative imports: ./foo, ../bar
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      // ── Export discipline ────────────────────────────────────────────────────
      // Every file must use a single grouped export { } at the bottom.
      // ExportNamedDeclaration[declaration.type] matches any inline export that
      // carries a declaration node (export const/interface/type/function/class/enum).
      // It does NOT match export { }, export type { }, export default, export * from.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportNamedDeclaration[declaration.type]',
          message:
            'Inline exports are not allowed. Remove the export keyword from the declaration and use a single grouped export { } statement at the bottom of the file.',
        },
      ],
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
    // Component files: enforce arrow functions, no inline exports, export default only.
    // This block overrides the global no-restricted-syntax for .tsx files, so all
    // rules (including the inline-export ban) must be listed here too.
    files: ['src/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          // Shared with .ts files: ban any inline export with a declaration node.
          selector: 'ExportNamedDeclaration[declaration.type]',
          message:
            'Inline exports are not allowed. Remove the export keyword from the declaration and use a single grouped export { } statement at the bottom of the file.',
        },
        {
          // Block: function expression inside memo() — use arrow instead.
          selector:
            'CallExpression[callee.name="memo"] > FunctionExpression, CallExpression[callee.object.name="React"][callee.property.name="memo"] > FunctionExpression',
          message:
            'Use an arrow function inside memo() instead of a named function expression. Exception: generic components may keep function expressions for TypeScript compatibility.',
        },
      ],
    },
  },
  {
    // Hook files in .tsx: override component block — hooks use named exports.
    files: ['src/shared/hooks/**/*.tsx'],
    rules: { 'no-restricted-syntax': 'off' },
  },
]);

export default config;
