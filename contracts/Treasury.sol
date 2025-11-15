// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Treasury
 * @notice Manages fee collection and distribution for PrediChain
 */
contract Treasury is Ownable, ReentrancyGuard {
    uint256 public totalFeesCollected;
    uint256 public protocolFeeRate = 80; // 80% to protocol, 20% to market creators
    uint256 public constant FEE_DENOMINATOR = 100;
    
    constructor() Ownable(msg.sender) {}

    event FeeCollected(address indexed marketId, uint256 amount, uint256 timestamp);
    event FeesDistributed(address indexed recipient, uint256 amount);
    event FeeRateUpdated(uint256 newProtocolFeeRate);

    /**
     * @notice Collect fees from a trade
     * @param amount The fee amount to collect
     */
    function collectFee(uint256 amount) external nonReentrant {
        require(amount > 0, "Treasury: Amount must be greater than 0");
        
        totalFeesCollected += amount;
        
        emit FeeCollected(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Distribute fees to a recipient (market creator)
     * @param recipient The address to receive the fees
     * @param amount The amount to distribute
     */
    function distributeFees(address recipient, uint256 amount) external onlyOwner nonReentrant {
        require(recipient != address(0), "Treasury: Invalid recipient");
        require(amount > 0, "Treasury: Amount must be greater than 0");
        require(address(this).balance >= amount, "Treasury: Insufficient balance");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Treasury: Transfer failed");

        emit FeesDistributed(recipient, amount);
    }

    /**
     * @notice Set the protocol fee rate
     * @param newProtocolFeeRate The new protocol fee rate (0-100)
     */
    function setFeeRate(uint256 newProtocolFeeRate) external onlyOwner {
        require(newProtocolFeeRate <= 100, "Treasury: Invalid fee rate");
        protocolFeeRate = newProtocolFeeRate;
        emit FeeRateUpdated(newProtocolFeeRate);
    }

    /**
     * @notice Withdraw protocol fees (admin only)
     * @param amount The amount to withdraw
     */
    function withdrawProtocolFees(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Treasury: Amount must be greater than 0");
        require(address(this).balance >= amount, "Treasury: Insufficient balance");

        (bool success, ) = owner().call{value: amount}("");
        require(success, "Treasury: Withdrawal failed");
    }

    /**
     * @notice Get the current balance of the treasury
     * @return balance The current balance
     */
    function getBalance() external view returns (uint256 balance) {
        return address(this).balance;
    }

    // Allow contract to receive BNB
    receive() external payable {}
}

