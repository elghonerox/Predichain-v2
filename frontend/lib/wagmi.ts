import { defaultWagmiConfig } from '@web3modal/wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '0893b6579e0a17ca509b1e6e231e8240'

const metadata = {
  name: 'PrediChain',
  description: 'Fast-Resolution Prediction Markets with Gasless UX on BNB Chain',
  url: 'https://predichain.xyz',
  icons: ['https://predichain.xyz/logo.png']
}

// SECURITY FIX M-4: Enhanced wagmi config
export const config = defaultWagmiConfig({
  chains: [bscTestnet, bsc], // BNB Chain testnet and mainnet
  projectId,
  metadata,
})

// SECURITY FIX M-4: Connection timeout constants
export const CONNECTION_TIMEOUT = 30000 // 30 seconds
export const MAX_RECONNECT_ATTEMPTS = 3

// SECURITY FIX M-4: Connection state cleanup
export function cleanupWalletConnection(): void {
  if (typeof window !== 'undefined') {
    try {
      // Clear WalletConnect storage
      localStorage.removeItem('walletconnect')
      localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE')

      // Clear wallet-specific storage
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (
          key.startsWith('wc@') ||
          key.startsWith('wallet') ||
          key.includes('connector')
        )) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // Clear session storage
      sessionStorage.clear()

      console.log('Wallet connection cleanup completed')
    } catch (error) {
      console.error('Wallet cleanup error:', error)
    }
  }
}

// SECURITY FIX M-4: Connection with timeout
export async function connectWithTimeout<T>(
  connectFn: () => Promise<T>,
  timeoutMs: number = CONNECTION_TIMEOUT
): Promise<T> {
  return Promise.race([
    connectFn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout - please try again')), timeoutMs)
    )
  ])
}

// SECURITY FIX M-4: Reconnection with exponential backoff
export async function connectWithRetry<T>(
  connectFn: () => Promise<T>,
  maxAttempts: number = MAX_RECONNECT_ATTEMPTS
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await connectWithTimeout(connectFn)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      if (attempt < maxAttempts) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000
        console.log(`Connection attempt ${attempt} failed, retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Connection failed after maximum retries')
}

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