import { defineConfig, devices } from '@playwright/test';

// Local sandbox has only Chromium; CI installs Chromium, Firefox and WebKit (determinism gate D3-24 is mandatory there).
const ci = !!process.env.CI;
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  retries: 0,
  use: { baseURL: 'http://localhost:4173', trace: 'off' },
  webServer: { command: 'npx vite preview --port 4173 --strictPort', port: 4173, reuseExistingServer: !ci },
  projects: ci
    ? [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ]
    : [{ name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: { executablePath: process.env.PW_CHROMIUM ?? undefined } } }],
});
