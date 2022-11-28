import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';

import * as blockMock from 'mocks/blocks/block';
import TestApp from 'playwright/TestApp';

import BlockDetails from './BlockDetails';

const API_URL = '/node-api/blocks/1';
const hooksConfig = {
  router: {
    query: { id: 1 },
  },
};

test('regular block +@mobile +@dark-mode', async({ mount, page }) => {
  await page.route(API_URL, (route) => route.fulfill({
    status: 200,
    body: JSON.stringify(blockMock.base),
  }));

  const component = await mount(
    <TestApp>
      <BlockDetails/>
    </TestApp>,
    { hooksConfig },
  );

  await page.waitForResponse(API_URL),
  await page.getByText('View details').click();

  await expect(component).toHaveScreenshot();
});

test('genesis block', async({ mount, page }) => {
  await page.route(API_URL, (route) => route.fulfill({
    status: 200,
    body: JSON.stringify(blockMock.genesis),
  }));

  const component = await mount(
    <TestApp>
      <BlockDetails/>
    </TestApp>,
    { hooksConfig },
  );

  await page.waitForResponse(API_URL),
  await page.getByText('View details').click();

  await expect(component).toHaveScreenshot();
});