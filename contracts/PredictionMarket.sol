// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./OracleAdapter.sol";
import "./Treasury.sol";

/**
 * @title PredictionMarket
 * @notice Core prediction market contract for PrediChain
 * @dev Handles market creation, trading, and resolution
 */
contract PredictionMarket is Ownable, ReentrancyGuard {
    OracleAdapter public oracleAdapter;
    Treasury public treasury;
    
    uint256 public constant TRADING_FEE_RATE = 200; // 2% (basis points: 200/10000)
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    uint256 public marketCounter;
    
    enum MarketStatus {
        Active,
        Resolved,
        Cancelled
    }
    
    struct Market {
        uint256 id;
        string question;
        string asset; // e.g., "BTC", "ETH", "BNB"
        uint256 targetPrice;
        uint256 resolutionTime;
        address creator;
        MarketStatus status;
        uint256 totalVolume;
        uint256 yesVolume;
        uint256 noVolume;
        uint256 resolutionPrice;
        bool outcome; // true = yes, false = no
    }
    
    struct Position {
        address user;
        uint256 marketId;
        bool side; // true = yes, false = no
        uint256 amount;
        uint256 price; // price at which position was opened
    }
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Position)) public positions; // marketId => user => position
    mapping(address => uint256[]) public userMarkets; // user => marketIds
    
    event MarketCreated(
        uint256 indexed marketId,
        string question,
        string asset,
        uint256 targetPrice,
        uint256 resolutionTime,
        address creator
    );
    
    event PositionTraded(
        uint256 indexed marketId,
        address indexed user,
        bool side,
        uint256 amount,
        uint256 price,
        uint256 fee
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        bool outcome,
        uint256 resolutionPrice,
        uint256 timestamp
    );
    
    constructor(address _oracleAdapter, address _treasury) Ownable(msg.sender) {
        require(_oracleAdapter != address(0), "PredictionMarket: Invalid oracle adapter");
        require(_treasury != address(0), "PredictionMarket: Invalid treasury");
        
        oracleAdapter = OracleAdapter(_oracleAdapter);
        treasury = Treasury(payable(_treasury));
    }
    
    /**
     * @notice Create a new prediction market
     * @param question The market question
     * @param asset The asset symbol (e.g., "BTC", "ETH")
     * @param targetPrice The target price to predict
     * @param resolutionTime The timestamp when the market should resolve
     */
    function createMarket(
        string memory question,
        string memory asset,
        uint256 targetPrice,
        uint256 resolutionTime
    ) external returns (uint256 marketId) {
        require(bytes(question).length > 0, "PredictionMarket: Invalid question");
        require(bytes(asset).length > 0, "PredictionMarket: Invalid asset");
        require(targetPrice > 0, "PredictionMarket: Invalid target price");
        require(resolutionTime > block.timestamp, "PredictionMarket: Invalid resolution time");
        
        marketId = ++marketCounter;
        
        markets[marketId] = Market({
            id: marketId,
            question: question,
            asset: asset,
            targetPrice: targetPrice,
            resolutionTime: resolutionTime,
            creator: msg.sender,
            status: MarketStatus.Active,
            totalVolume: 0,
            yesVolume: 0,
            noVolume: 0,
            resolutionPrice: 0,
            outcome: false
        });
        
        userMarkets[msg.sender].push(marketId);
        
        emit MarketCreated(marketId, question, asset, targetPrice, resolutionTime, msg.sender);
        
        return marketId;
    }
    
    /**
     * @notice Buy a position in a market
     * @param marketId The market ID
     * @param side True for "Yes", false for "No"
     */
    function buyPosition(uint256 marketId, bool side) external payable nonReentrant {
        require(msg.value > 0, "PredictionMarket: Amount must be greater than 0");
        
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Active, "PredictionMarket: Market not active");
        require(block.timestamp < market.resolutionTime, "PredictionMarket: Market expired");
        
        // Calculate fee (2% of trade amount)
        uint256 fee = (msg.value * TRADING_FEE_RATE) / FEE_DENOMINATOR;
        uint256 tradeAmount = msg.value - fee;
        
        // Update market volume
        market.totalVolume += msg.value;
        if (side) {
            market.yesVolume += msg.value;
        } else {
            market.noVolume += msg.value;
        }
        
        // Update or create position
        Position storage position = positions[marketId][msg.sender];
        if (position.amount == 0) {
            // New position
            position.user = msg.sender;
            position.marketId = marketId;
            position.side = side;
            position.amount = tradeAmount;
            position.price = msg.value; // Price per unit
        } else {
            // Existing position - add to it
            require(position.side == side, "PredictionMarket: Cannot change position side");
            position.amount += tradeAmount;
            // Update average price
            position.price = (position.price * (position.amount - tradeAmount) + msg.value * tradeAmount) / position.amount;
        }
        
        // Send fee to treasury
        (bool success, ) = address(treasury).call{value: fee}("");
        require(success, "PredictionMarket: Fee transfer failed");
        treasury.collectFee(fee);
        
        emit PositionTraded(marketId, msg.sender, side, tradeAmount, position.price, fee);
    }
    
    /**
     * @notice Resolve a market using oracle price
     * @param marketId The market ID
     */
    function resolveMarket(uint256 marketId) external nonReentrant {
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Active, "PredictionMarket: Market not active");
        require(block.timestamp >= market.resolutionTime, "PredictionMarket: Market not ready for resolution");
        
        // Get price from oracle
        (uint256 currentPrice, ) = oracleAdapter.getPrice(market.asset);
        market.resolutionPrice = currentPrice;
        
        // Determine outcome: true if current price >= target price
        market.outcome = currentPrice >= market.targetPrice;
        market.status = MarketStatus.Resolved;
        
        emit MarketResolved(marketId, market.outcome, currentPrice, block.timestamp);
    }
    
    /**
     * @notice Claim payout for a winning position
     * @param marketId The market ID
     */
    function claimPayout(uint256 marketId) external nonReentrant {
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Resolved, "PredictionMarket: Market not resolved");
        
        Position storage position = positions[marketId][msg.sender];
        require(position.amount > 0, "PredictionMarket: No position found");
        require(position.side == market.outcome, "PredictionMarket: Position did not win");
        
        // Calculate payout (simplified: 1:1 for now, can be enhanced with AMM)
        uint256 payout = position.amount;
        
        // Reset position
        position.amount = 0;
        
        // Transfer payout
        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "PredictionMarket: Payout transfer failed");
    }
    
    /**
     * @notice Get market details
     * @param marketId The market ID
     * @return market The market struct
     */
    function getMarket(uint256 marketId) external view returns (Market memory market) {
        return markets[marketId];
    }
    
    /**
     * @notice Get user's position in a market
     * @param marketId The market ID
     * @param user The user address
     * @return position The position struct
     */
    function getPosition(uint256 marketId, address user) external view returns (Position memory position) {
        return positions[marketId][user];
    }
    
    /**
     * @notice Get all markets created by a user
     * @param user The user address
     * @return marketIds Array of market IDs
     */
    function getUserMarkets(address user) external view returns (uint256[] memory marketIds) {
        return userMarkets[user];
    }
    
    /**
     * @notice Get total number of markets
     * @return count The total number of markets
     */
    function getMarketCount() external view returns (uint256 count) {
        return marketCounter;
    }
    
    // Allow contract to receive BNB
    receive() external payable {}
}

