import nx from '@nx/eslint-plugin';
import prettier from 'eslint-config-prettier';
import jsoncParser from 'jsonc-eslint-parser';

export default [
  // Nx base + TS + JS (includes parser & sensible defaults for monorepos)
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],

  // Keep ESLint from fighting Prettier
  prettier,

  // Global ignores for build artifacts and caches
  {
    ignores: ['**/dist', '**/.angular/cache', '**/coverage'],
  },

  // Workspace boundaries across ALL TS/JS flavors (Angular, Node, React, etc.)
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },

  // Lint JSON / JSONC files (tsconfig*.json, nx.json, *.eslintrc.json, etc.)
  {
    files: ['**/*.json', '**/*.json5', '**/*.jsonc'],
    languageOptions: { parser: jsoncParser },
    rules: {},
  },
];
