// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDT
 * @dev ERC-20 Mock USDT token for Tokify testnet demo.
 */
contract MockUSDT is ERC20, Ownable {
    uint8 private constant _DECIMALS = 6; // USDT uses 6 decimals

    constructor(address initialOwner)
        ERC20("Mock USDT", "mUSDT")
        Ownable(initialOwner)
    {
        // Mint 1,000,000 mUSDT to deployer on init
        _mint(initialOwner, 1_000_000 * 10 ** _DECIMALS);
    }

    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }

    /**
     * @dev Mint tokens — callable only by owner (Edge Function wallet)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from caller's balance
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
