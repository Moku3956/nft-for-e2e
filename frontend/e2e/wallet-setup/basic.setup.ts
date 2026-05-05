import { defineWalletSetup } from '@synthetixio/synpress';
import { MetaMask } from '@synthetixio/synpress/playwright';

export default defineWalletSetup('Tester@1234', async (context, walletPage) => {
  const metamask = new MetaMask(context, walletPage, 'Tester@1234');
  await metamask.importWallet('test test test test test test test test test test test junk');

  const done = walletPage.getByTestId('onboarding-complete-done');
  if (await done.isVisible({ timeout: 5000 }).catch(() => false)) {
    await done.click();
  }
});
