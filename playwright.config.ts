import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e', workers: 1, retries: 0,
  use: { baseURL: 'http://127.0.0.1:5173', browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: [
    { command: 'node tests/e2e/server.ts', url: 'http://127.0.0.1:3001/api/health', reuseExistingServer: false },
    { command: 'vite --config apps/web/vite.config.ts', url: 'http://127.0.0.1:5173', reuseExistingServer: false }
  ]
});
