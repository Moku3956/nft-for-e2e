// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract MyNFT is Ownable, ERC721 {
    uint256 private _nextTokenId;
    struct Metadata {
        string title;
        string imageURI;
        string description;
    }
    mapping(uint256 => Metadata) private _tokenMetadata;

    // _tokenMetadata is for linking "tokenId(unique)" and "Metadata"

    constructor() ERC721("My Full On-Chain NFT", "MFON") Ownable(msg.sender) {}

    function safeMint(
        address to,
        string memory title,
        string memory imageURI,
        string memory description
    ) public onlyOwner {
        uint256 tokenId = _nextTokenId;
        _safeMint(to, tokenId);
        _nextTokenId++;
        _tokenMetadata[tokenId] = Metadata(title, imageURI, description);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        ownerOf(tokenId);
        Metadata memory metadata = _tokenMetadata[tokenId];
        string memory json = Base64.encode(
            bytes(
                string.concat(
                    '{"name": "',
                    metadata.title,
                    '",',
                    '"description": "',
                    metadata.description,
                    '",',
                    '"image": "',
                    metadata.imageURI,
                    '"}'
                )
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", json));
    }
}
