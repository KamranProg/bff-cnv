import baseConfig from '../../eslint.config.mjs';
import globals from 'globals';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: { globals: globals.node },
    rules: {
      // Server apps often log; adjust to taste
      'no-console': 'off',
    },
  },
];
