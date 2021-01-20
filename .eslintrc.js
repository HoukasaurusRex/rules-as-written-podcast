module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb',
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/prettier',
    'prettier/react',
    'prettier/@typescript-eslint'
  ],
  plugins: ['react-hooks', '@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/ban-ts-comment': 'warn',
    'prettier/prettier': ['error'],
    'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],
    'react/prop-types': 'off',
    'no-use-before-define': 'off',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'no-unused-vars': 'warn',
    semi: ['error', 'never'],
    'import/prefer-default-export': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never'
      }
    ],
    'template-curly-spacing': 0
  },
  parserOptions: {
    ecmaVersion: 2021,
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  }
}
