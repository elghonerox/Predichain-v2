// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOracleAdapter {
    /**
     * @notice Get the current price of an asset from the oracle
     * @param asset The asset symbol (e.g., "BTC", "ETH", "BNB")
     * @return price The current price of the asset
     * @return timestamp The timestamp of the price data
     */
    function getPrice(string memory asset) external view returns (uint256 price, uint256 timestamp);

    /**
     * @notice Check if the oracle is available
     * @return available True if the oracle is available
     */
    function isAvailable() external view returns (bool available);
}

