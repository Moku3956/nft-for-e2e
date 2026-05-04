"use client";
import { ethers } from "ethers";
import {
    marketplaceAbi,
    marketplaceAddress,
    tokenAddress,
    tokenAbi,
} from "@/contracts.config";
import { useWallet } from "@/hooks/useWallet";
import { useState, useEffect } from "react";

type ContractFactory = (address: string, abi: any, runner: ethers.ContractRunner) => any;

const defaultContractFactory: ContractFactory = (address, abi, runner) =>
    new ethers.Contract(address, abi, runner);

export default function AdminPage({ contractFactory = defaultContractFactory }: { contractFactory?: ContractFactory } = {}) {
    const { provider } = useWallet();
    const [balanceOfContract, setBalance] = useState<string>("0");
    const [isSaleActive, setIsSaleActive] = useState<boolean>(false);
    const [isTogglingSale, setIsTogglingSale] = useState<boolean>(false);

    const [currentPrice, setCurrentPrice] = useState<string>("");
    const [newPrice, setNewPrice] = useState<string>("");
    const [editButton, setEditButton] = useState<boolean>(false);

    const getMarketplaceContract = (signerOrProvider: ethers.ContractRunner) =>
        contractFactory(marketplaceAddress, marketplaceAbi, signerOrProvider);

    const getTokenContract = (signerOrProvider: ethers.ContractRunner) =>
        contractFactory(tokenAddress, tokenAbi, signerOrProvider);

    const fetchAdminData = async () => {
        if (!provider) return;

        const marketplaceContract = getMarketplaceContract(provider);
        const tokenContract = getTokenContract(provider);

        const [balance, saleStatus, price] = await Promise.all([
            tokenContract.balanceOf(marketplaceAddress),
            marketplaceContract.isSaleActive(),
            marketplaceContract.price(),
        ]);

        setBalance(String(Math.floor(Number(ethers.formatEther(balance)))));
        setIsSaleActive(Boolean(saleStatus));
        setCurrentPrice(String(Math.floor(Number(ethers.formatEther(price)))));
    };

    useEffect(() => {
        fetchAdminData();
    }, [provider]);

    const withdrawSales = async () => {
        if (!provider) {
            alert("ウォレットを接続してください。");
            return;
        }
        try {
            const signer = await provider.getSigner();
            const marketplaceContract = getMarketplaceContract(signer);
            const withdrawTx = await marketplaceContract.withdraw();
            await withdrawTx.wait();
            await fetchAdminData();
            alert("引き出しが完了しました。");
        } catch (error) {
            console.error("売り上げが0の可能性があります:", error);
            alert("引き出しに失敗しました。");
        }
    };

    const toggleSaleStatus = async () => {
        if (!provider) {
            alert("ウォレットを接続してください。");
            return;
        }
        if (isTogglingSale) return;

        try {
            setIsTogglingSale(true);
            const signer = await provider.getSigner();
            const marketplaceContract = getMarketplaceContract(signer);

            const signerAddress = await signer.getAddress();
            const ownerAddress = await marketplaceContract.owner();
            if (signerAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
                alert("管理者のみ操作できます。");
                return;
            }

            const tx = isSaleActive
                ? await marketplaceContract.pauseSale()
                : await marketplaceContract.startSale();

            await tx.wait();
            await fetchAdminData();
        } catch (error) {
            console.error("販売状態の変更に失敗:", error);
            alert("販売状態の変更に失敗しました。");
        } finally {
            setIsTogglingSale(false);
        }
    };

    const changePrice = async () => {
        if (!provider) {
            alert("ウォレットを接続してください。");
            return;
        }
        if (!newPrice || isNaN(Number(newPrice)) || Number(newPrice) <= 0) {
            alert("正しい価格を入力してください。");
            return;
        }

        try {
            const signer = await provider.getSigner();
            const marketplaceContract = getMarketplaceContract(signer);
            const setPriceTx = await marketplaceContract.setPrice(ethers.parseEther(newPrice));
            await setPriceTx.wait();
            await fetchAdminData();
            alert("価格を変更しました。");
        } catch (error) {
            console.error("価格変更に失敗:", error);
            alert("価格変更に失敗しました。");
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white text-black dark:bg-black dark:text-white">
            <h1 className="text-3xl font-bold mb-8">管理者ページ</h1>
            <div className="flex flex-col gap-6 w-full max-w-xs">
                <button
                    onClick={withdrawSales}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    <span>売上引き出し</span>
                    <span className="text-xs mt-1 opacity-80 block">コントラクト残高: {balanceOfContract}</span>
                </button>

                <button
                    onClick={toggleSaleStatus}
                    disabled={isTogglingSale}
                    className="w-full px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-60"
                >
                    {isSaleActive ? "販売停止" : "販売開始"}
                </button>

                {!editButton ? (
                    <button
                        onClick={() => setEditButton(true)}
                        className="w-full px-6 py-3 h-12 text-base font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        価格を変更する
                    </button>
                ) : (
                    <div className="w-full flex flex-col gap-4">
                        <div className="text-base text-center">
                            現在価格: <span className="text-2xl font-bold">{currentPrice}</span>
                        </div>
                        <input
                            type="text"
                            placeholder="新しい価格を入力"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            className="w-full px-4 h-12 border border-gray-300 rounded-lg"
                        />
                        <div className="flex w-full gap-3">
                            <button onClick={changePrice} className="flex-1 h-12 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                確定
                            </button>
                            <button onClick={() => setEditButton(false)} className="flex-1 h-12 bg-gray-200 rounded-lg hover:bg-gray-300">
                                キャンセル
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
