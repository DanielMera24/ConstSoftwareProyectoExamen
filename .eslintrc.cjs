module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'no-console': 'off',
    'no-undef': 'off',
    'eqeqeq': 'error',
    'curly': 'error',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'prettier/prettier': ['warn', {
      singleQuote: true,
      semi: true,
      tabWidth: 2,
      trailingComma: 'es5',
    }],
  },
};