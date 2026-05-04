import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import basicSetup from './wallet-setup/basic.setup';

const test = testWithSynpress(metaMaskFixtures(basicSetup));
const { expect } = test;

test('MetaMask でウォレットを接続できる', async ({
  context,
  page,
  metamaskPage,
  extensionId,
}) => {
  const metamask = new MetaMask(
    context,
    metamaskPage,
    basicSetup.walletPassword,
    extensionId
  );

  await page.goto('/');

  await page.getByRole('button', { name: 'ウォレットを接続' }).click();

  await metamask.connectToDapp();

  const button = page.getByRole('button', { name: /0x/ });
  await expect(button).toBeVisible();
});
