/**
 * Presets are declared inline with `configFile: false` on purpose: a root
 * babel.config.js carrying @babel/preset-env would be picked up by Metro and break
 * the app bundle. Every test target is either a pure TypeScript module or a static
 * read of source text, so no React renderer and no native mocks are needed.
 */
module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      {
        babelrc: false,
        configFile: false,
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript',
        ],
      },
    ],
  },
};
