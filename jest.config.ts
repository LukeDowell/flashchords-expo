import type {Config} from "jest"

export default async (): Promise<Config> => {
  return {
    preset: "jest-expo",
    collectCoverage: process.env.NODE_ENV === "production",
    resetMocks: true,
    roots: ["<rootDir>/src"],
    setupFilesAfterEnv: ['<rootDir>/src/jest.setup.tsx'],
    testEnvironment: '<rootDir>/src/jest-environment-jsdom-structured-clone.ts',
    testMatch: ['**/*.test.[jt]s?(x)'],
    moduleNameMapper: { // Matching paths listed in tsconfig.json
      "@/(.*)": ["<rootDir>/src/$1"],
      "@/assets/(.*)": ["<rootDir>/src/components/$1"]
    }
  } as Config
}
