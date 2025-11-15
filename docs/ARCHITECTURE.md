# PrediChain Technical Architecture

## System Overview

PrediChain is a decentralized prediction market platform built on BNB Smart Chain (BSC) that enables fast-resolution prediction markets with gasless user experience. The system consists of three main components:

1. **Smart Contracts** (BNB Chain): Core market logic, oracle integration, fee management
2. **Frontend** (Next.js): User interface, wallet integration, market interaction
3. **Oracle Layer** (Redstone/Chainlink): Price feeds and market resolution

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Wallet Conn  │  │ Market UI    │  │ Trading UI   │  │
│  │ (wagmi)      │  │ (Browse)     │  │ (Buy/Sell)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │ Account Abst │  │ Analytics   │                     │
│  │ (Plena)      │  │ (Charts)    │                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Web3 Calls (wagmi/viem)
                          ▼
┌─────────────────────────────────────────────────────────┐
│              BNB Smart Chain (BSC)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │PredictionMkt │  │OracleAdapter │  │  Treasury    │  │
│  │   .sol       │  │    .sol      │  │    .sol      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Oracle Calls
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Oracle Layer                                 │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │  Redstone    │  │  Chainlink   │                     │
│  │  (Primary)   │  │  (Backup)     │                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

## Smart Contract Architecture

### Core Contracts

#### 1. PredictionMarket.sol

**Purpose**: Main contract handling market creation, trading, and resolution.

**Key Functions:**
- `createMarket()`: Create a new prediction market
- `buyPosition()`: Buy a position (Yes/No) in a market
- `resolveMarket()`: Resolve market using oracle price
- `claimPayout()`: Claim payout for winning positions

**State Management:**
- `markets`: Mapping of market ID to Market struct
- `positions`: Mapping of (marketId, user) to Position struct
- `userMarkets`: Mapping of user to array of market IDs

**Events:**
- `MarketCreated`: Emitted when a new market is created
- `PositionTraded`: Emitted when a position is traded
- `MarketResolved`: Emitted when a market is resolved

**Security:**
- ReentrancyGuard for all state-changing functions
- Access control for admin functions
- Input validation for all parameters

#### 2. OracleAdapter.sol

**Purpose**: Adapter for integrating with price oracles (Redstone, Chainlink).

**Key Functions:**
- `updatePrice()`: Update price for an asset (admin only)
- `getPrice()`: Get current price of an asset
- `isAvailable()`: Check if oracle is available
- `batchUpdatePrices()`: Batch update multiple prices

**State Management:**
- `prices`: Mapping of asset symbol to PriceData struct
- Price validity period: 1 hour

**Integration:**
- Primary: Redstone Finance (fast, BNB Chain partnership)
- Secondary: Chainlink (backup, additional data sources)
- Fallback: Direct API calls (CoinGecko, CoinMarketCap)

#### 3. Treasury.sol

**Purpose**: Manages fee collection and distribution.

**Key Functions:**
- `collectFee()`: Collect trading fees
- `distributeFees()`: Distribute fees to recipients
- `setFeeRate()`: Set protocol fee rate (admin only)
- `withdrawProtocolFees()`: Withdraw protocol fees (admin only)

**Fee Distribution:**
- 80% to protocol treasury
- 20% to market creators

**Security:**
- ReentrancyGuard for all functions
- Access control for admin functions

### Contract Interactions

```
PredictionMarket
    ├── Uses OracleAdapter for price resolution
    ├── Sends fees to Treasury
    └── Emits events for frontend updates

OracleAdapter
    ├── Called by PredictionMarket for resolution
    └── Updated by admin/oracle service

Treasury
    ├── Receives fees from PredictionMarket
    └── Distributes fees to market creators
```

### State Management

**Market Lifecycle:**
1. **Active**: Market is created and accepting trades
2. **Resolved**: Market has been resolved with oracle price
3. **Cancelled**: Market has been cancelled (future feature)

**Position Management:**
- Users can buy positions (Yes/No) in active markets
- Positions are stored per user per market
- Users can add to existing positions (same side only)
- Payouts are calculated on resolution

### Event System

**Events for Frontend:**
- `MarketCreated`: New market created → Update market list
- `PositionTraded`: Position traded → Update market volume, user positions
- `MarketResolved`: Market resolved → Update market status, enable payouts
- `FeeCollected`: Fee collected → Update treasury balance

**Event Listening:**
- Frontend uses wagmi hooks to listen for events
- Real-time updates via WebSocket or polling

## Oracle Integration

### Redstone Finance (Primary)

**Why Redstone:**
- Fast resolution (minutes/hours vs. 24-48 hours)
- BNB Chain partnership
- Specialized for prediction markets
- Cost-efficient

**Integration:**
- OracleAdapter contract calls Redstone API
- Price updates can be automated or manual
- Supports multiple assets (BTC, ETH, BNB, etc.)

### Chainlink (Secondary)

**Why Chainlink:**
- Backup oracle
- Additional data sources
- Economic data feeds
- Verifiable Random Function (VRF)

**Integration:**
- Used if Redstone unavailable
- Chainlink Data Feeds for price data
- Economic data for financial markets

### Fallback Mechanism

**Direct API Integration:**
- CoinGecko API
- CoinMarketCap API
- Manual price updates (admin)

## Frontend Architecture

### Framework: Next.js 14

**Why Next.js:**
- Server-side rendering for SEO
- App Router for modern React patterns
- Built-in API routes (if needed)
- Easy deployment (Vercel)

### Web3 Integration: wagmi + viem

**wagmi:**
- React hooks for Ethereum/BNB Chain
- `useAccount`, `useWriteContract`, `useReadContract`
- Wallet connection management

**viem:**
- TypeScript Ethereum library
- Type-safe contract interactions
- Utility functions (formatEther, parseEther)

### Wallet Connection

**Supported Wallets:**
- MetaMask
- Trust Wallet
- Binance Wallet
- WalletConnect (via Web3Modal)

**Connection Flow:**
1. User clicks "Connect Wallet"
2. Web3Modal shows available wallets
3. User selects wallet and approves connection
4. Frontend stores connection state
5. All transactions use connected wallet

### Account Abstraction (Plena Finance)

**Purpose**: Enable gasless transactions for users.

**Integration:**
- Plena Finance SDK
- ERC-4337 support on BNB Chain
- Sponsored transactions (protocol pays gas)
- Social login (optional)

**User Experience:**
- Users don't need BNB for gas
- Transactions appear instant
- Lower barrier to entry

### Component Structure

```
app/
├── layout.tsx          # Root layout with Providers
├── page.tsx            # Home page (market list)
├── create/
│   └── page.tsx        # Create market page
├── market/
│   └── [id]/
│       └── page.tsx    # Market details page
└── providers.tsx       # Web3 providers setup

lib/
├── wagmi.ts            # wagmi configuration
└── contracts.ts        # Contract ABIs and addresses
```

### State Management

**React Hooks:**
- `useState`: Local component state
- `useEffect`: Side effects (loading markets, listening to events)
- `useAccount`: Wallet connection state
- `useWriteContract`: Contract write operations
- `useReadContract`: Contract read operations

**Real-Time Updates:**
- Event listeners via wagmi
- Polling for market updates (fallback)
- WebSocket connection (future enhancement)

## Revenue Implementation

### Fee Collection Mechanism

**Trading Fees:**
1. User calls `buyPosition()` with BNB
2. Contract calculates fee (2% of trade amount)
3. Fee sent to Treasury contract
4. Remaining amount used for position

**Fee Distribution:**
- 80% to protocol treasury (future development)
- 20% to market creators (incentivize quality markets)

**Premium Features:**
- Subscription managed off-chain (database)
- On-chain verification (check subscription status)
- Lower trading fees (1.5% vs. 2%) for premium users

### Analytics Tracking

**On-Chain Metrics:**
- Trading volume (from events)
- Fee collection (from events)
- User activity (from events)

**Off-Chain Analytics:**
- User engagement (page views, time spent)
- Market creation rate
- Trading patterns

## Security Considerations

### Smart Contract Security

**OpenZeppelin Contracts:**
- ReentrancyGuard: Prevents reentrancy attacks
- AccessControl: Role-based access control
- Ownable: Admin functions

**Best Practices:**
- Integer overflow protection (Solidity 0.8+)
- Input validation for all parameters
- Safe math operations
- Event emission for transparency

### Oracle Security

**Multiple Sources:**
- Primary: Redstone (fast)
- Secondary: Chainlink (backup)
- Fallback: Direct APIs

**Validation:**
- Price validity period (1 hour)
- Multiple source verification (future)
- Admin override for edge cases

### Frontend Security

**Wallet Security:**
- Users control their private keys
- No server-side wallet storage
- Transaction signing on client side

**Input Validation:**
- Client-side validation
- Contract-side validation (final check)
- Sanitize user inputs

## BNB Chain Optimizations

### Gas Optimization

**Strategies:**
- Pack structs efficiently (reduce storage slots)
- Use events instead of storage (cheaper)
- Batch operations (multiple actions in one transaction)
- Optimize loops (avoid unnecessary iterations)

**Gas Costs:**
- Average transaction: $0.03 (vs. $5+ on Ethereum)
- Market creation: ~50,000 gas
- Position trade: ~100,000 gas
- Market resolution: ~80,000 gas

### Network Performance

**BNB Chain Advantages:**
- Fast finality: ~3 seconds (vs. 12+ seconds on Ethereum)
- High throughput: 4M+ daily transactions
- Low fees: $0.03 average
- EVM compatibility: Reuse Ethereum tooling

## Deployment Architecture

### Smart Contracts

**Deployment:**
1. Deploy OracleAdapter
2. Deploy Treasury
3. Deploy PredictionMarket (with OracleAdapter and Treasury addresses)
4. Verify contracts on BSCScan

**Network:**
- Testnet: BNB Smart Chain Testnet (chainId: 97)
- Mainnet: BNB Smart Chain (chainId: 56)

### Frontend

**Deployment:**
- Platform: Vercel or Netlify
- Environment variables: WalletConnect Project ID, contract addresses
- Build: `npm run build`
- Deploy: Automatic via Git push

### Oracle Service

**Deployment:**
- Backend service (Node.js) for price updates
- Scheduled jobs (cron) for regular updates
- API integration (Redstone, Chainlink, CoinGecko)
- Manual override for edge cases

## Future Enhancements

### Phase 1: Production Ready
- [ ] Automated oracle price updates
- [ ] Plena Finance account abstraction integration
- [ ] Mainnet deployment
- [ ] Security audit

### Phase 2: Advanced Features
- [ ] AMM-style liquidity pools (LMSR, CPMM)
- [ ] Advanced analytics dashboard
- [ ] Historical data and charts
- [ ] Social features (sharing, leaderboards)

### Phase 3: Ecosystem Growth
- [ ] Multiple market types (sports, politics, DeFi)
- [ ] Mobile app (React Native)
- [ ] Token launch (utility token)
- [ ] Governance system

---

**Architecture Status:** Complete  
**Last Updated:** November 9, 2025

