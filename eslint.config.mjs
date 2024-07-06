import config from 'eslint-config-standard';

export default [
  {
    extends: ['react-app', 'react-app/jest'],
  },
  ...[].concat(config),
];
