# E2E テスト設計思想

## 目的

MetaMask を使ってトランザクションが行われたことをオンチェーンで確認する。

## 技術スタック

- **Synpress** — MetaMask 自動化のラッパー
- **Playwright** — Synpress の土台となるテストフレームワーク
- **ethers.js** — テストコードからチェーンの状態を読む
- **Hardhat** — ローカルブロックチェーン

## 設計方針

### オンチェーン検証

UI の表示ではなく、チェーン上の状態の変化を直接検証する。
トランザクション前後でコントラクトの状態を比較することで、トランザクションが確実に行われたことを証明する。

### 相対的な検証

チェーンをリセットせず、トランザクション前後の差分で検証する。

```ts
const before = await marketplace.getSoldCount();
// 購入操作
const after = await marketplace.getSoldCount();
expect(after).toBe(before + 1n);
```

**メリット**
- テストの実行順序に依存しない
- 毎回の再デプロイが不要
- タイムアウトのリスクを減らせる

### 実行環境

以下の3つを手動で起動した状態でテストを実行する。

| プロセス | コマンド |
|---|---|
| Hardhat node | `npm run node`（ルート） |
| コントラクトデプロイ | `npm run deploy:local`（ルート） |
| Next.js | `npm run dev`（frontend） |

手動起動にすることで各プロセスのログをリアルタイムで確認でき、デバッグがしやすい。

### MetaMask の自動化

Synpress が提供する `metamask` fixture を使い、MetaMask のポップアップ操作を自動化する。

```ts
await metamask.confirmTransaction();   // 承認
await metamask.rejectTransaction();    // 拒否
await metamask.approveTokenPermission(); // トークン承認
```
