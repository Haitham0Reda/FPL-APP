module.exports = {
  extends: ['expo'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // Allow unused vars with underscore prefix
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    // Relax some rules for development
    'no-console': 'warn',
    'react/prop-types': 'off',
    'react/display-name': 'off',
  },
};
