import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', 'electron/'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  prettier,
  // CommonJS preload: `import x = require()` is the only typed way to load electron there.
  { files: ['**/*.cts'], rules: { '@typescript-eslint/no-require-imports': 'off' } },
);
