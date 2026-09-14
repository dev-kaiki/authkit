import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Formato flat, exigido pelo ESLint 9. Substitui o .eslintrc.cjs antigo,
// que o ESLint 9 não lê mais.
export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  },
);
