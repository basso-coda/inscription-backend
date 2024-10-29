/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  verbose: true,
  clearMocks: true,
  testMatch: ['**/__tests__/**/*.test.js'],
  coveragePathIgnorePatterns: ['node_modules'],
};
