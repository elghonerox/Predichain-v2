// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title Errors
 * @notice Custom errors for gas-efficient reverts
 * @dev Using custom errors saves ~200 gas per revert vs require(condition, "string")
 * 
 * Gas Savings Example:
 * - require(amount > 0, "Amount must be positive") = ~24,000 gas
 * - if (amount == 0) revert InvalidAmount(amount) = ~23,800 gas
 * - Savings: ~200 gas per error
 * 
 * Standard practice in 2024+ Solidity (OpenZeppelin, Uniswap V4, Aave V3)
 */

// =============================================================
//                    ORACLE ADAPTER ERRORS
// =============================================================

/// @notice Price must be greater than zero
error InvalidPrice(uint256 provided);

/// @notice Asset symbol cannot be empty
error EmptyAsset();

/// @notice Circuit breaker has been triggered due to excessive price deviation
/// @param asset Asset symbol
/// @param oldPrice Previous price
/// @param newPrice Attempted new price
/// @param deviation Calculated deviation in basis points
error CircuitBreakerTriggered(
    string asset,
    uint256 oldPrice,
    uint256 newPrice,
    uint256 deviation
);

/// @notice Update attempted too soon after previous update
/// @param asset Asset symbol
/// @param lastUpdate Last update timestamp
/// @param minInterval Minimum required interval
error UpdateTooFrequent(string asset, uint256 lastUpdate, uint256 minInterval);

/// @notice Price history does not span the required TWAP period
/// @param asset Asset symbol
/// @param actualSpan Actual time span of data
/// @param requiredPeriod Required TWAP period
error InsufficientHistorySpan(string asset, uint256 actualSpan, uint256 requiredPeriod);

/// @notice Insufficient price data points for TWAP calculation
error InsufficientPriceHistory();

/// @notice No price data available for the requested period
error NoPricesInPeriod();

/// @notice Invalid price data (price is zero or stale)
error InvalidPriceData();

/// @notice Caller is not an authorized price feeder
error UnauthorizedFeeder(address caller);

// =============================================================
//                   PREDICTION MARKET ERRORS
// =============================================================

/// @notice Trade amount below minimum threshold
/// @param provided Amount provided
/// @param minimum Minimum required
error AmountTooLow(uint256 provided, uint256 minimum);

/// @notice Market resolution time invalid
/// @param provided Provided resolution time
/// @param minDuration Minimum duration required
/// @param maxDuration Maximum duration allowed
error InvalidResolutionTime(uint256 provided, uint256 minDuration, uint256 maxDuration);

/// @notice Market does not exist
/// @param marketId ID that was queried
error MarketNotFound(uint256 marketId);

/// @notice Market is not in active state for trading
/// @param marketId Market ID
/// @param currentStatus Current market status
error MarketNotActive(uint256 marketId, uint8 currentStatus);

/// @notice Market resolution time has not been reached
/// @param marketId Market ID
/// @param resolutionTime When market can be resolved
/// @param currentTime Current block timestamp
error MarketNotReadyToResolve(uint256 marketId, uint256 resolutionTime, uint256 currentTime);

/// @notice Market has already been resolved
/// @param marketId Market ID
error MarketAlreadyResolved(uint256 marketId);

/// @notice User has no position to claim
/// @param user User address
/// @param marketId Market ID
error NoPositionToClaim(address user, uint256 marketId);

/// @notice Payout has already been claimed
/// @param user User address
/// @param marketId Market ID
error PayoutAlreadyClaimed(address user, uint256 marketId);

/// @notice User did not win the market
/// @param user User address
/// @param marketId Market ID
/// @param userSide Side user bet on
/// @param outcome Actual outcome
error PositionNotWinning(address user, uint256 marketId, bool userSide, bool outcome);

/// @notice Creator has reached maximum allowed markets
/// @param creator Creator address
/// @param maximum Maximum markets allowed
error TooManyMarkets(address creator, uint256 maximum);

/// @notice Question cannot be empty
error EmptyQuestion();

/// @notice Question is too long
error QuestionTooLong();

/// @notice Empty asset symbol
error EmptyAssetSymbol();

/// @notice Asset symbol is too long
error AssetSymbolTooLong();

// =============================================================
//                      TREASURY ERRORS
// =============================================================

/// @notice Withdrawal amount exceeds available balance
/// @param requested Amount requested
/// @param available Available balance
error InsufficientBalance(uint256 requested, uint256 available);

/// @notice Withdrawal has already been executed
/// @param withdrawalId ID of withdrawal
error WithdrawalAlreadyExecuted(uint256 withdrawalId);

/// @notice Timelock period has not elapsed
/// @param withdrawalId ID of withdrawal
/// @param availableAt When withdrawal becomes available
/// @param currentTime Current block timestamp
error TimelockNotExpired(uint256 withdrawalId, uint256 availableAt, uint256 currentTime);

/// @notice Withdrawal request does not exist
/// @param withdrawalId ID that was queried
error WithdrawalNotFound(uint256 withdrawalId);

/// @notice Fee rate exceeds maximum allowed
/// @param provided Provided fee rate
/// @param maximum Maximum allowed rate
error FeeRateTooHigh(uint256 provided, uint256 maximum);

/// @notice Cannot set fee to 100% (would brick the system)
error FeeRateCannotBe100Percent();

/// @notice Fee collection failed
error FeeCollectionFailed();

// =============================================================
//                      COMMON ERRORS
// =============================================================

/// @notice Zero address provided where not allowed
error ZeroAddress();

/// @notice Transfer failed
error TransferFailed();

/// @notice Contract is paused
error ContractPaused();

/// @notice Contract is not paused
error ContractNotPaused();
