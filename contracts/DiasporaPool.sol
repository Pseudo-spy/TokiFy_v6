// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DiasporaPool
 * @dev Liquidity pool for cross-border remittance via USDT.
 *
 * - deposit(): Sender deposits USDT into pool (on-ramp)
 * - withdraw(): Receiver burns USDT to trigger bank payout (off-ramp)
 */
contract DiasporaPool is Ownable, ReentrancyGuard {
    IERC20 public immutable usdt;

    // user address => pooled USDT balance (in 6-decimal units)
    mapping(address => uint256) public poolBalance;

    // Total USDT locked in pool
    uint256 public totalPooled;

    // Simulated INR/USDT rate (scaled by 100 for decimals, e.g. 9200 = 92.00)
    uint256 public inrPerUsdt = 9200;

    /* ── Events ── */
    event Deposited(address indexed user, uint256 usdtAmount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 usdtAmount, uint256 inrEquivalent, uint256 timestamp);
    event RateUpdated(uint256 newRate);

    constructor(address _usdt, address initialOwner) Ownable(initialOwner) {
        usdt = IERC20(_usdt);
    }

    /**
     * @dev Deposit USDT into the pool (on-ramp / tokenize remittance)
     * @param amount Amount in USDT (6 decimals)
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(usdt.transferFrom(msg.sender, address(this), amount), "USDT transfer failed");

        poolBalance[msg.sender] += amount;
        totalPooled += amount;

        emit Deposited(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Withdraw USDT from pool and simulate INR bank payout.
     * Burns USDT and emits event — off-ramp trigger.
     * @param amount Amount in USDT (6 decimals)
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(poolBalance[msg.sender] >= amount, "Insufficient pool balance");

        poolBalance[msg.sender] -= amount;
        totalPooled -= amount;

        // Transfer USDT back to caller for burning
        require(usdt.transfer(msg.sender, amount), "USDT transfer failed");

        // Calculate INR equivalent (inrPerUsdt is scaled by 100)
        uint256 inrEquivalent = (amount * inrPerUsdt) / (100 * 10 ** 6);

        emit Withdrawn(msg.sender, amount, inrEquivalent, block.timestamp);
    }

    /**
     * @dev Owner updates INR/USDT rate (e.g. oracle feed)
     * @param newRate Rate scaled by 100 (9200 = ₹92.00 per USDT)
     */
    function updateRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Invalid rate");
        inrPerUsdt = newRate;
        emit RateUpdated(newRate);
    }

    /**
     * @dev Get INR equivalent for a given USDT amount
     */
    function getInrEquivalent(uint256 usdtAmount) external view returns (uint256) {
        return (usdtAmount * inrPerUsdt) / (100 * 10 ** 6);
    }
}
