module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'standard',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:react/recommended',
    'prettier',
    'prettier-standard/prettier-file'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'jest', 'import'],
  rules: {
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'arrow-parens': 'error',
    camelcase: 'off',
    'import/no-unresolved': 'error',
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc'
        },
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always',
        pathGroups: [
          {
            pattern: 'react',
            group: 'builtin',
            position: 'before'
          }
        ],
        pathGroupsExcludedImportTypes: ['builtin']
      }
    ],
    'generator-star-spacing': 'off',
    'jest/expect-expect': 'off',
    'no-empty': 'off',
    'no-undef': 'error',
    'no-use-before-define': 'off',
    'prettier/prettier': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    semi: ['error', 'never'],
    'space-before-function-paren': [
      'error',
      {
        named: 'never'
      }
    ],

    // Rules we should stop disabling
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': 'off'

    // Rules we should enable
    // curly: 'error',
    // 'max-params': ['error', 1],
    // 'sort-keys': 'error',
    // 'import/no-default-export': 'error'
  },
  settings: {
    // Only modules resolved from these folders will be considered "external".
    // If you are `npm link`ing from a directory not listed here you may run
    // into linting issues
    'import/external-module-folders': [
      'node_modules',
      'stems',
      'audius-protocol'
    ],
    'import/resolver': {
      // NOTE: sk - These aliases are required for the import/order rule.
      // We are using the typescript baseUrl to do absolute import paths
      // relative to /src, which eslint can't tell apart from 3rd party deps
      alias: {
        map: [
          ['__mocks__', './src/__mocks__'],
          ['audio', './src/audio'],
          ['assets', './src/assets'],
          ['common', './src/common'],
          ['components', './src/components'],
          ['containers', './src/containers'],
          ['hooks', './src/hooks'],
          ['models', './src/models'],
          ['schemas', './src/schemas'],
          ['services', './src/services'],
          ['store', './src/store'],
          ['stories', './src/stories'],
          ['types', './src/types'],
          ['utils', './src/utils'],
          ['workers', './src/workers']
        ],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
      }
    }
  }
}
