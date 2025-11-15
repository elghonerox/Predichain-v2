// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IOracleAdapter.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OracleAdapter
 * @notice Adapter for integrating with Redstone oracle and other price feeds
 * @dev For MVP, this is a simplified version that can be extended with actual oracle integration
 */
contract OracleAdapter is IOracleAdapter, Ownable {
    // Mapping of asset symbol to price data
    mapping(string => PriceData) public prices;
    
    constructor() Ownable(msg.sender) {}
    
    struct PriceData {
        uint256 price;
        uint256 timestamp;
        bool isValid;
    }

    // Price validity period (1 hour)
    uint256 public constant PRICE_VALIDITY_PERIOD = 3600;

    event PriceUpdated(string indexed asset, uint256 price, uint256 timestamp);

    /**
     * @notice Update price for an asset (called by oracle or admin)
     * @param asset The asset symbol (e.g., "BTC", "ETH", "BNB")
     * @param price The price of the asset
     */
    function updatePrice(string memory asset, uint256 price) external onlyOwner {
        require(price > 0, "OracleAdapter: Invalid price");
        
        prices[asset] = PriceData({
            price: price,
            timestamp: block.timestamp,
            isValid: true
        });

        emit PriceUpdated(asset, price, block.timestamp);
    }

    /**
     * @notice Get the current price of an asset
     * @param asset The asset symbol
     * @return price The current price
     * @return timestamp The timestamp of the price data
     */
    function getPrice(string memory asset) external view override returns (uint256 price, uint256 timestamp) {
        PriceData memory data = prices[asset];
        require(data.isValid, "OracleAdapter: Price not available");
        require(block.timestamp - data.timestamp <= PRICE_VALIDITY_PERIOD, "OracleAdapter: Price expired");
        
        return (data.price, data.timestamp);
    }

    /**
     * @notice Check if the oracle is available
     * @return available True if the oracle is available
     */
    function isAvailable() external view override returns (bool available) {
        // For MVP, oracle is available if we have recent price data
        // In production, this would check actual oracle connectivity
        return true;
    }

    /**
     * @notice Batch update prices (for efficiency)
     * @param assets Array of asset symbols
     * @param priceArray Array of prices
     */
    function batchUpdatePrices(string[] memory assets, uint256[] memory priceArray) external onlyOwner {
        require(assets.length == priceArray.length, "OracleAdapter: Array length mismatch");
        
        for (uint256 i = 0; i < assets.length; i++) {
            require(priceArray[i] > 0, "OracleAdapter: Invalid price");
            prices[assets[i]] = PriceData({
                price: priceArray[i],
                timestamp: block.timestamp,
                isValid: true
            });
            emit PriceUpdated(assets[i], priceArray[i], block.timestamp);
        }
    }
}

