import { test as base, expect } from '@playwright/test';
import { attachPlaywrightNetworkLogger } from '../helpers/logger/PlaywrightNetworkLogger';

export const test = base.extend({
  context: async ({ context }, use, testInfo) => {
    attachPlaywrightNetworkLogger(context, {
      testName: testInfo.title,
      project: testInfo.project.name,
      browser:
        typeof testInfo.project.use.browserName === 'string'
          ? testInfo.project.use.browserName
          : undefined,
      worker: testInfo.workerIndex,
      retry: testInfo.retry,
    });

    await use(context);
  },
});

export { expect };
