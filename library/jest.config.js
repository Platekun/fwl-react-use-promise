/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  testEnvironment: 'jsdom',
};
