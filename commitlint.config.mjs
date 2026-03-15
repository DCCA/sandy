const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [0, 'never'],
    'scope-enum': [0, 'never'],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [1, 'always', 200],
  },
};

export default config;
