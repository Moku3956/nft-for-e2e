import { useState, useEffect } from "react";
import { ethers } from "ethers";
export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const connectWallet = async () => {
    const eth = typeof window !== "undefined" ? (window as any).ethereum : null;
    if (eth) {
      try {
        const browserProvider = new ethers.BrowserProvider(eth);
        await browserProvider.send("eth_requestAccounts", []);
        const signer = await browserProvider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        setProvider(browserProvider);
        sessionStorage.setItem("walletAddress", address);
      } catch (error) {
        console.error("ウォレット接続失敗", error);
      }
    } else {
      alert("MetaMaskをインストールして");
    }
  };
  useEffect(() => {
    // ページ読み込み時にsessionStorageのアドレスがあれば自動接続
    // eth_requestAccounts（MetaMaskポップアップ）ではなく
    // eth_accounts（サイレント・既承認アカウント取得）を使う
    const savedAddress =
      typeof window !== "undefined"
        ? sessionStorage.getItem("walletAddress")
        : null;
    if (!savedAddress) return;

    const eth = typeof window !== "undefined" ? (window as any).ethereum : null;
    if (!eth) return;

    const browserProvider = new ethers.BrowserProvider(eth);
    browserProvider
      .send("eth_accounts", [])
      .then(async (accounts: string[]) => {
        if (accounts.length > 0) {
          const signer = await browserProvider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);
          setProvider(browserProvider);
          sessionStorage.setItem("walletAddress", address);
        } else {
          // MetaMask がロック中 or 未承認 → stale なアドレスを削除
          sessionStorage.removeItem("walletAddress");
        }
      })
      .catch(() => {
        sessionStorage.removeItem("walletAddress");
      });
  }, []);
  return { account, provider, connectWallet };
};
