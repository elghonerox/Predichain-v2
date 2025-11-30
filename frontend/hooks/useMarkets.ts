'use client'

import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '@/lib/contracts'
import { config } from '@/lib/wagmi'
import { useQuery } from '@tanstack/react-query'
import { readContract } from 'wagmi/actions'
import { useReadContract } from 'wagmi'

export interface Market {
  id: bigint
  question: string
  asset: string
  targetPrice: bigint
  resolutionTime: bigint
  creator: string
  status: number
  totalVolume: bigint
  yesVolume: bigint
  noVolume: bigint
  resolutionPrice: bigint
  outcome: boolean
}

// Hook to fetch all markets
export function useMarkets() {
  return useQuery({
    queryKey: ['markets'],
    queryFn: async () => {
      if (!PREDICTION_MARKET_ADDRESS) return []

      const marketCount = await readContract(config, {
        address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'getMarketCount',
      })

      const marketPromises = []
      for (let i = 1; i <= Number(marketCount); i++) {
        marketPromises.push(
          readContract(config, {
            address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
            abi: PREDICTION_MARKET_ABI,
            functionName: 'getMarket',
            args: [BigInt(i)],
          })
        )
      }

      const markets = await Promise.all(marketPromises)
      return markets as Market[]
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  })
}

// Hook to fetch a single market
export function useMarket(id: bigint) {
  return useReadContract({
    address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getMarket',
    args: [id],
    query: {
      refetchInterval: 3000, // Refetch every 3 seconds for active trading
    }
  })
}