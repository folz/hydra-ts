// ESLint flat config (ESLint 9). Replaces the legacy .eslintrc.json +
// .eslintignore, and the separate @typescript-eslint/{parser,eslint-plugin}
// packages with the unified `typescript-eslint`.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      // the codebase uses `any` deliberately in a few compiler/regl seams;
      // keep it a warning (as it was under the old config), not an error.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    // dev/ is a live-coding scratchpad that intentionally destructures every
    // source/output/generator so they're ready to tweak; don't flag the
    // ones a given sketch doesn't use.
    files: ['dev/**'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
);
