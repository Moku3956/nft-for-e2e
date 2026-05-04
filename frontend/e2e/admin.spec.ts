import { test, expect } from '@playwright/test';

test.describe('管理者機能（オンチェーン検証）', () => {
  test('販売開始後に isSaleActive がオンチェーンで true になる', async ({ page }) => {});

  test('販売停止後に isSaleActive がオンチェーンで false になる', async ({ page }) => {});

  test('価格変更後に price がオンチェーンで更新される', async ({ page }) => {});

  test('引き出し後に Marketplace の JPYC 残高がオンチェーンで 0 になる', async ({ page }) => {});

  test('引き出し後にオーナーの JPYC 残高が増える', async ({ page }) => {});
});

test.describe('異常系（管理者）（オンチェーン検証）', () => {
  test('販売開始をオーナー以外ができない', async ({ page }) => {});

  test('販売停止をオーナー以外ができない', async ({ page }) => {});

  test('価格変更をオーナー以外ができない', async ({ page }) => {});

  test('売上引き出しをオーナー以外ができない', async ({ page }) => {});

  test('販売開始・停止・価格変更・引き出しを MetaMask でキャンセルすると状態が変わらない', async ({ page }) => {});
});
