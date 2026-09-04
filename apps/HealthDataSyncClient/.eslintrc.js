module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        // The shared React Native config disables this rule for TypeScript files.
        'react-native/no-inline-styles': 'error',
      },
    },
  ],
};
