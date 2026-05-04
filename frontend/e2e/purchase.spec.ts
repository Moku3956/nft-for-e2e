import { test, expect } from '@playwright/test';

test.describe('購入フロー（オンチェーン検証）', () => {
  test('ウォレット接続後にアドレスが表示される', async ({ page }) => {});

  test('購入ボタン押下で approve が発生する', async ({ page }) => {});

  test('approve 承認後に purchase が発生する', async ({ page }) => {});

  test('購入完了後に soldCount が 1 増える', async ({ page }) => {});

  test('購入完了後に買い手の JPYC が減る', async ({ page }) => {});

  test('購入完了後に Marketplace の JPYC が増える', async ({ page }) => {});
});

test.describe('異常系（購入）（オンチェーン検証）', () => {
  test('ウォレット未接続で購入できない', async ({ page }) => {});

  test('approve をキャンセルすると購入がキャンセルされる', async ({ page }) => {});

  test('購入承認をキャンセルすると購入がキャンセルされる', async ({ page }) => {});

  test('販売停止中に購入できない', async ({ page }) => {});

  test('残高不足で購入できない', async ({ page }) => {});
});
