const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("NFTMarketplaceModule", (m) => {
  // nonce 0
  const myNFT = m.contract("MyNFT");

  // nonce 1 (after myNFT to fix deployment order → address matches contracts.config.ts)
  const testERC20 = m.contract("TestERC20", [1_000_000n * 10n ** 18n], {
    after: [myNFT],
  });

  // nonce 2
  const marketplace = m.contract("NFTMarketplace", [myNFT, testERC20]);

  // safeMint is onlyOwner → marketplace must own MyNFT
  m.call(myNFT, "transferOwnership", [marketplace]);

  return { myNFT, testERC20, marketplace };
});
