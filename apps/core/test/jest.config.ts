import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/integration/**/*.integration.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/test/tsconfig.json',
      },
    ],
  },
  globalSetup: '<rootDir>/test/global-setup.ts',
  moduleNameMapper: {
    '^@innogram/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
  testTimeout: 30_000,
  forceExit: true,
};

export default config;
