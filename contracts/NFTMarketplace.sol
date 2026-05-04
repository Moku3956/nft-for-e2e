//SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

// contract NFTMarketplace is Ownable, ERC721 {

//     bool isSale = false;

//     constructor() ERC721("Marketplace", "MP") Ownable(msg.sender){}

//     function startSale() private onlyOwner {
//         isSale = true;
//     }

//     function pauseSale() private onlyOwner {
//         isSale = false;
//     }

//     function withdraw() private onlyOwner {

//     }

//     function purchase() public {
//         // check if the price is correct
//         // check if sale is started
//         // check if the stock is enough
//         // pull JPYC from buyer's wallet
//         // approve to give NFT to buyer
//         // mint NFT
//         // trasfer NFT to buyer
//     }
// }

pragma solidity ^0.8.28;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IERC20.sol";
import "./MyNFT.sol";

contract NFTMarketplace is Ownable {
    MyNFT private _nft;
    IERC20 private _token;
    uint256 public price = 100 * 1e18;
    uint256 public maxSupply = 100;
    bool public isSaleActive = false;
    uint256 private _soldCount;
    event NFTSold(uint256 indexed tokenId, address indexed buyer);

    constructor(address nftAddress, address tokenAddress) Ownable(msg.sender) {
        _nft = MyNFT(nftAddress);
        _token = IERC20(tokenAddress);
    }

    function purchase() public {
        require(isSaleActive, "Sale is not active");
        require(_soldCount < maxSupply, "Sold out");

        _token.transferFrom(msg.sender, address(this), price);
        _nft.safeMint(
            msg.sender,
            "MyNFT",
            "ipfs://bafybeigj3x62k6ihtjew7u3jukfdcolqqrsovypf2i5ctgqyil43ottw5m",
            "Description"
        );
        emit NFTSold(_soldCount, msg.sender);
        _soldCount++;
    }

    function setPrice(uint256 _newPrice) public onlyOwner {
        price = _newPrice;
    }

    function startSale() public onlyOwner {
        isSaleActive = true;
    }

    function pauseSale() public onlyOwner {
        isSaleActive = false;
    }

    function withdraw() public onlyOwner {
        uint256 balance = _token.balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        _token.transfer(owner(), balance);
    }
    
    function getSoldCount() public view returns (uint256) {
        return _soldCount;
    }
}
