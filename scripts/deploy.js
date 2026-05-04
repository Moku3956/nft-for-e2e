const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer, ...testAccounts] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // 1. Deploy MyNFT (nonce 0 → 0x5FbDB2315678afecb367f032d93F642f64180aa3)
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();
  await myNFT.waitForDeployment();
  console.log("MyNFT deployed to:", await myNFT.getAddress());

  // 2. Deploy TestERC20 (nonce 1 → 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512)
  const initialSupply = ethers.parseEther("1000000"); // 1,000,000 JPYC
  const TestERC20 = await ethers.getContractFactory("TestERC20");
  const testERC20 = await TestERC20.deploy(initialSupply);
  await testERC20.waitForDeployment();
  console.log("TestERC20 deployed to:", await testERC20.getAddress());

  // 3. Deploy NFTMarketplace (nonce 2 → 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0)
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplace.deploy(
    await myNFT.getAddress(),
    await testERC20.getAddress()
  );
  await marketplace.waitForDeployment();
  console.log("NFTMarketplace deployed to:", await marketplace.getAddress());

  // 4. Transfer MyNFT ownership to NFTMarketplace
  //    (safeMint is onlyOwner, so marketplace must own it to mint on purchase)
  const tx = await myNFT.transferOwnership(await marketplace.getAddress());
  await tx.wait();
  console.log("MyNFT ownership transferred to NFTMarketplace");

  // 5. Distribute JPYC to test accounts (accounts[1] to accounts[4])
  const jpycPerAccount = ethers.parseEther("10000"); // 10,000 JPYC each
  for (let i = 0; i < Math.min(testAccounts.length, 4); i++) {
    const transferTx = await testERC20.transfer(testAccounts[i].address, jpycPerAccount);
    await transferTx.wait();
    console.log(`Transferred 10,000 JPYC to account[${i + 1}]: ${testAccounts[i].address}`);
  }

  console.log("\n=== Deploy Complete ===");
  console.log("MyNFT:          ", await myNFT.getAddress());
  console.log("TestERC20:      ", await testERC20.getAddress());
  console.log("NFTMarketplace: ", await marketplace.getAddress());
  console.log("\nNext: MetaMask で localhost:8545 に接続し、Hardhat のテストアカウントをインポートしてください。");
  console.log("販売を開始するには管理者画面から「販売開始」を押してください。");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
