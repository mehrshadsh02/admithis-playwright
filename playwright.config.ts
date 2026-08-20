import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import { getLoggerConfig, getPlaywrightArtifactSettings } from './helpers/logger';

dotenv.config();

const isCI = ['true', '1', 'yes'].includes((process.env.CI ?? '').trim().toLowerCase());

const parseNumber = (
  value: string | undefined,
  fallback: number | undefined,
): number | undefined => {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

const workers = parseNumber(
  process.env.PW_WORKERS,
  isCI ? 2 : undefined,
);

const retries = parseNumber(
  process.env.PW_RETRIES,
  isCI ? 2 : 0,
);

const outputDir = resolve(process.env.PW_OUTPUT_DIR?.trim() || 'test-results');

const loggerConfig = getLoggerConfig(process.env);
const artifactMode = isCI && loggerConfig.mode === 'NORMAL' ? 'FAILURE' : loggerConfig.mode;
const artifactSettings = getPlaywrightArtifactSettings(artifactMode, {
  trace: 'off',
  screenshot: 'off',
  video: 'off',
});

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: isCI,

  retries,

  workers,

  timeout: 600_000,

  expect: {
    timeout: 100_000,
  },

  reporter: [
    ['./helpers/logger/PlaywrightLoggerReporter.ts'],
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL: process.env.ADMITHIS_APP_URL,
    ...artifactSettings,
    actionTimeout: parseNumber(process.env.PW_ACTION_TIMEOUT, 15_000),
    navigationTimeout: parseNumber(
      process.env.PW_NAVIGATION_TIMEOUT,
      300_000,
    ),
    ignoreHTTPSErrors: true,
    headless: !['true', '1', 'yes'].includes(
      (process.env.PW_HEADED ?? '').trim().toLowerCase(),
    ),
  },
  projects: [
    {
      name: 'chrome',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        viewport: null,
        launchOptions: {
          args: ['--start-maximized'],
        },
      },
    },
  ],

  outputDir,
  preserveOutput: 'failures-only',
});
