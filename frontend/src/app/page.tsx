"use client"
import { useWallet } from "@/hooks/useWallet";
import { ethers } from 'ethers';
import { marketplaceAddress, marketplaceAbi, tokenAddress, tokenAbi } from '@/contracts.config';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


export default function Home() {
  const HARDHAT_CHAIN_ID = 31337;
  // ウォレットアドレスをsessionStorageに保存
  const { account, provider, connectWallet } = useWallet();
  const router = useRouter();
  const [price, setPrice] = useState<string>("");
  const [soldCount, setSoldCount] = useState<number>(0);
  const [currentPrice, setCurrentPrice] = useState<string>("");
  useEffect(() => {
    const fetchSaleInfo = async () => {
      if (!provider) return;

      try {
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== HARDHAT_CHAIN_ID) {
          return;
        }

        const code = await provider.getCode(marketplaceAddress);
        if (!code || code === "0x") {
          return;
        }

        const contract = new ethers.Contract(marketplaceAddress, marketplaceAbi, provider);
        const salePrice = await contract.price();
        const count = await contract.getSoldCount();
        setPrice(ethers.formatEther(salePrice));
        setSoldCount(Number(count));
        setCurrentPrice(String(Math.floor(Number(ethers.formatEther(salePrice)))));
      } catch {
        setPrice("");
        setCurrentPrice("");
      }
    };
    fetchSaleInfo();
  }, [provider]);
  const handlePurchase = async () => {
    if (!provider || !account) {
      alert("ウォレットを接続してください。");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
      const marketplaceContract = new ethers.Contract(marketplaceAddress, marketplaceAbi, signer);

      let purchasePrice = price;
      let numericPrice = Number(purchasePrice);
      if (!purchasePrice || !Number.isFinite(numericPrice) || numericPrice <= 0) {
        const onChainPrice = await marketplaceContract.price();
        purchasePrice = ethers.formatEther(onChainPrice);
        numericPrice = Number(purchasePrice);
        setPrice(purchasePrice);
        setCurrentPrice(String(Math.floor(numericPrice)));
      }

      if (!purchasePrice || !Number.isFinite(numericPrice) || numericPrice <= 0) {
        alert("価格情報の取得に失敗しました。");
        return;
      }

      // 1. Approve 処理
      console.log("Approve をリクエスト中...");
      const approveTx = await tokenContract.approve(
        marketplaceAddress,
        ethers.parseEther(purchasePrice),
      );
      await approveTx.wait();
      console.log("Approve が成功しました!");
      // 2. Purchase 処理
      console.log("購入処理をリクエスト中...");
      const purchaseTx = await marketplaceContract.purchase();
      await purchaseTx.wait(); // トランザクションが承認されるまで待機
      alert("NFT の購入が成功しました!");
      // 在庫数などを再取得
      // fetchSaleInfo();
    } catch (error) {
      console.error("購入処理に失敗しました:", error);
      alert("購入処理に失敗しました。");
    }
  };
  // 管理者画面へ遷移する関数
  const routeAdmin = () => {
    router.push('/admin');
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-white text-black dark:bg-black dark:text-white">
      {/* トップヘッダーとウォレット接続ボタンを含むコンテナ */}
      <div className="fixed top-0 left-0 w-full p-6 flex justify-center items-center text-sm z-10">
        <div className="absolute right-6 top-6">
          <button onClick={connectWallet}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : "ウォレットを接続"}
          </button>
        </div>
        <p>ステーブルコインで NFT を購入しよう</p>
      </div>
      {/* NFT コンテンツを中央に配置するためのコンテナ */}
      <div className="flex flex-col items-center justify-center flex-grow mt-10">
        {/* NFT 情報と購入ボタンのブロック */}
        <div className="flex flex-col items-center text-center p-8 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md max-w-sm">
          <h2 className="mb-3 text-2xl font-semibold">MyNFT #{soldCount + 1}</h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-70">
            これはフルオンチェーン NFT です。ブロックチェーン上に全ての情報が刻ま
            れています。
          </p>
          <p className="mt-4 font-bold text-lg">{currentPrice} JPYC</p>
          {/* 購入ボタン */}

          <button onClick={handlePurchase} className="mt-6 px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">

            購入する
          </button>
        </div>
      </div>
      {/* 右下の管理者画面遷移ボタン */}
      <button
        onClick={routeAdmin}
        className="fixed bottom-6 right-6 z-50 px-6 py-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
      >
        管理者画面へ
      </button>
    </main>
  );
}
