import { testWithSynpress } from '@synthetixio/synpress';
import { metaMaskFixtures } from '@synthetixio/synpress/playwright';
import basicSetup from './wallet-setup/basic.setup';

const test = testWithSynpress(metaMaskFixtures(basicSetup));
const { expect } = test;

test('MetaMask でウォレットを接続できる', async ({
  context,
  page,
  metamaskPage,
}) => {
  // onboarding 完了画面が残っている場合は閉じる
  const done = metamaskPage.getByTestId('onboarding-complete-done');
  if (await done.isVisible({ timeout: 3000 }).catch(() => false)) {
    await done.click();
  }

  await page.goto('/');

  // notification ページの出現を先に待機してからボタンクリック
  const notificationPagePromise = context.waitForEvent('page', {
    predicate: (p) => p.url().includes('notification.html'),
    timeout: 15000,
  });

  await page.getByRole('button', { name: 'ウォレットを接続' }).click();

  // MetaMask v13.13.1 の Connect ボタン (data-testid="confirm-btn")
  const notificationPage = await notificationPagePromise;
  await notificationPage.waitForLoadState('domcontentloaded');
  await notificationPage.getByTestId('confirm-btn').click();
  // ここまでが、connectToDapp()の代わり
  
  const button = page.getByRole('button', { name: /0x/ });
  await expect(button).toBeVisible();
});
