'use client'

import { useAccount, useConnectModal } from '@web3modal/wagmi/react'
import { useState, useEffect } from 'react'
import { readContract } from 'wagmi/actions'
import { config } from '@/lib/wagmi'
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '@/lib/contracts'
import { formatEther, parseEther } from 'viem'

export default function Home() {
  const { address, isConnected } = useAccount()
  const { open } = useConnectModal()
  const [markets, setMarkets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isConnected && PREDICTION_MARKET_ADDRESS) {
      loadMarkets()
    } else {
      setLoading(false)
    }
  }, [isConnected])

  const loadMarkets = async () => {
    try {
      if (!PREDICTION_MARKET_ADDRESS) {
        setLoading(false)
        return
      }

      const marketCount = await readContract(config, {
        address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'getMarketCount',
      })

      const marketArray = []
      for (let i = 1; i <= Number(marketCount); i++) {
        try {
          const market = await readContract(config, {
            address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
            abi: PREDICTION_MARKET_ABI,
            functionName: 'getMarket',
            args: [BigInt(i)],
          })
          marketArray.push({ id: i, ...market })
        } catch (e) {
          // Market doesn't exist
        }
      }
      setMarkets(marketArray)
    } catch (error) {
      console.error('Error loading markets:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">PrediChain</h1>
              <p className="text-lg text-gray-600">
                Fast-Resolution Prediction Markets with Gasless UX on BNB Chain
              </p>
            </div>
            {!isConnected ? (
              <button
                onClick={() => open()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="text-right">
                <p className="text-sm text-gray-600">Connected</p>
                <p className="text-xs text-gray-500 font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main>
          {!isConnected ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Connect Your Wallet to Get Started
              </h2>
              <p className="text-gray-600 mb-8">
                Connect your MetaMask, Trust Wallet, or Binance Wallet to start trading prediction markets
              </p>
              <button
                onClick={() => open()}
                className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-lg"
              >
                Connect Wallet
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-16">
              <p className="text-gray-600">Loading markets...</p>
            </div>
          ) : markets.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Markets Yet</h2>
              <p className="text-gray-600">
                Be the first to create a prediction market!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {markets.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600 text-sm">
          <p>Built for Seedify Prediction Markets Hackathon - Powered by BNB Chain</p>
        </footer>
      </div>
    </div>
  )
}

function MarketCard({ market }: { market: any }) {
  const statusLabels = ['Active', 'Resolved', 'Cancelled']
  const status = statusLabels[market.status] || 'Unknown'

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="mb-4">
        <span className={`px-2 py-1 rounded text-xs ${
          market.status === 0 ? 'bg-green-100 text-green-800' :
          market.status === 1 ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{market.question}</h3>
      <div className="space-y-2 text-sm text-gray-600">
        <p><span className="font-medium">Asset:</span> {market.asset}</p>
        <p><span className="font-medium">Target Price:</span> ${formatEther(market.targetPrice)}</p>
        {market.status === 1 && (
          <>
            <p><span className="font-medium">Resolution Price:</span> ${formatEther(market.resolutionPrice)}</p>
            <p><span className="font-medium">Outcome:</span> {market.outcome ? 'Yes' : 'No'}</p>
          </>
        )}
        <p><span className="font-medium">Volume:</span> {formatEther(market.totalVolume)} BNB</p>
      </div>
    </div>
  )
}
