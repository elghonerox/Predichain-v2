import { getDefaultConfig } from '@web3modal/wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ''

if (!projectId) {
  throw new Error('Project ID is not set. Please set NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID in your .env file')
}

export const config = getDefaultConfig({
  chains: [bscTestnet, bsc], // BNB Chain testnet and mainnet
  projectId,
  appName: 'PrediChain',
  appDescription: 'Fast-Resolution Prediction Markets with Gasless UX on BNB Chain',
  appUrl: 'https://predichain.xyz',
  appIcon: 'https://predichain.xyz/logo.png',
})

// BNB Chain configuration
export const bscTestnetConfig = {
  id: 97,
  name: 'BNB Smart Chain Testnet',
  network: 'bsc-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: {
      http: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    },
    public: {
      http: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    },
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://testnet.bscscan.com' },
  },
  testnet: true,
}

