// SPDX-License-Identifier: MIT
// FILEPATH: /c:/Users/simsh/Documents/BlockChain/GA_MetaTest2/contracts/MyNFT.sol
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyNFT is ERC721URIStorage {
    uint256 public tokenCount;

    constructor() ERC721("MyNFT", "MNFT") {}

    function mint(string memory _tokenURI) public returns (uint256) {
        tokenCount += 1;
        uint256 newItemId = tokenCount;
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, _tokenURI);
        return newItemId;
    }
}