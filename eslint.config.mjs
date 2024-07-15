import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  js.configs.recommended,
  ...fixupConfigRules(
    compat.extends(
      'plugin:@typescript-eslint/recommended',
      'plugin:react/jsx-runtime'
    )
  ),
  {
    ignores: ['src/components/ui/*.tsx'],
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      react: fixupPluginRules(react),
      'react-hooks': fixupPluginRules(reactHooks),
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      semi: ['error', 'always'],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];
