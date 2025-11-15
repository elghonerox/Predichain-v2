# Deployment Guide

## Smart Contract Deployment

### Prerequisites

1. **BNB Testnet Tokens**: Get testnet BNB from [BNB Chain Faucet](https://testnet.bnbchain.org/faucet-smart)
2. **Private Key**: Set up a wallet with testnet BNB
3. **BSCScan API Key**: Get from [BSCScan](https://bscscan.com/apis) for contract verification

### Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` with your values:
```env
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545
PRIVATE_KEY=your_private_key_here
BSCSCAN_API_KEY=your_bscscan_api_key_here
```

### Deployment Steps

1. **Compile Contracts**:
```bash
npm run compile
```

2. **Run Tests**:
```bash
npm test
```

3. **Deploy to Testnet**:
```bash
npm run deploy:testnet
```

4. **Verify Contracts on BSCScan**:
```bash
# After deployment, verify each contract on BSCScan testnet
# https://testnet.bscscan.com
```

### Deployment Output

After deployment, you'll get contract addresses:
- OracleAdapter: `0x...`
- Treasury: `0x...`
- PredictionMarket: `0x...`

**Save these addresses** - you'll need them for the frontend!

## Frontend Deployment

### Prerequisites

1. **WalletConnect Project ID**: Get from [Reown Cloud](https://cloud.reown.com)
2. **Contract Addresses**: From smart contract deployment above
3. **Vercel/Netlify Account**: For hosting

### Environment Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

3. Edit `.env.local`:
```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x... (from deployment)
```

### Local Development

1. **Install Dependencies**:
```bash
npm install
```

2. **Run Development Server**:
```bash
npm run dev
```

3. **Open Browser**: http://localhost:3000

### Production Deployment (Vercel)

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Deploy**:
```bash
cd frontend
vercel
```

3. **Set Environment Variables**:
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`
   - Add `NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS`

4. **Redeploy**:
```bash
vercel --prod
```

### Production Deployment (Netlify)

1. **Install Netlify CLI**:
```bash
npm i -g netlify-cli
```

2. **Build**:
```bash
cd frontend
npm run build
```

3. **Deploy**:
```bash
netlify deploy --prod
```

4. **Set Environment Variables**:
   - Go to Netlify dashboard
   - Site Settings → Environment Variables
   - Add `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`
   - Add `NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS`

## Post-Deployment Checklist

### Smart Contracts

- [ ] Contracts deployed to BNB testnet
- [ ] Contracts verified on BSCScan
- [ ] Contract addresses saved
- [ ] Test transactions successful
- [ ] Oracle price updates working

### Frontend

- [ ] Frontend deployed to Vercel/Netlify
- [ ] Environment variables set
- [ ] Wallet connection working
- [ ] Market creation working
- [ ] Trading working
- [ ] Mobile responsive

### Testing

- [ ] Create a test market
- [ ] Place a test trade
- [ ] Resolve a test market
- [ ] Claim a test payout
- [ ] Verify fees collected

## Troubleshooting

### Contract Deployment Issues

**Error: Insufficient funds**
- Solution: Get more testnet BNB from faucet

**Error: Nonce too high**
- Solution: Reset nonce or use a fresh wallet

**Error: Contract verification failed**
- Solution: Check compiler version matches, verify manually on BSCScan

### Frontend Issues

**Error: Wallet not connecting**
- Solution: Check WalletConnect Project ID is correct
- Solution: Ensure wallet is on BNB Chain testnet

**Error: Contract not found**
- Solution: Check contract address is correct
- Solution: Ensure contract is deployed and verified

**Error: Transaction failed**
- Solution: Check user has enough BNB for gas
- Solution: Check contract is on correct network

## Mainnet Deployment (Post-Hackathon)

### Prerequisites

1. **Security Audit**: Complete smart contract audit
2. **Mainnet BNB**: Have BNB for deployment and initial operations
3. **Oracle Setup**: Configure automated oracle price updates
4. **Monitoring**: Set up monitoring and alerts

### Deployment Steps

1. Update `hardhat.config.js` with mainnet RPC
2. Deploy contracts to mainnet:
```bash
npm run deploy:mainnet
```

3. Verify contracts on BSCScan mainnet
4. Update frontend with mainnet contract addresses
5. Deploy frontend to production
6. Test all functionality on mainnet

---

**Deployment Status:** Testnet Ready  
**Last Updated:** November 9, 2025

