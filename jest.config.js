export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: './jest-tsconfig.json' }]
    },
    testMatch: ['**/*.spec.ts'],
};
