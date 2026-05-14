/**
 * @type {import('@types/eslint').Linter.Config}
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    sourceType: 'module',
    extraFileExtensions: ['.json'],
  },
  plugins: ['eslint-plugin-n8n-nodes-base'],
  extends: ['plugin:eslint-plugin-n8n-nodes-base/community'],
  rules: {
    'n8n-nodes-base/node-param-default-missing': 'warn',
    'n8n-nodes-base/cred-class-field-documentation-url-missing': 'warn',
  },
};
