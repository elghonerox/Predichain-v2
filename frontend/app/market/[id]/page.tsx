'use client'

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useState, useEffect, use } from 'react'
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '@/lib/contracts'
import { formatEther, parseEther } from 'viem'
import Link from 'next/link'
import { Button, Input, Card, Alert, Badge } from '@/components/button'
import { simulateTransaction, SimulationResult } from '@/lib/simulation'
import { TransactionSimulation } from '@/components/TransactionSimulation'
import { useMarket, type Market } from '@/hooks/useMarkets'
import { config } from '@/lib/wagmi'

export default function MarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { address, isConnected } = useAccount()

  const { data: market, isLoading: loading } = useMarket(BigInt(id))

  const [amount, setAmount] = useState('')
  const [side, setSide] = useState<boolean | null>(null)
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [simulating, setSimulating] = useState(false)

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Simulation Effect
  useEffect(() => {
    const runSimulation = async () => {
      if (!isConnected || !amount || side === null || !market || !PREDICTION_MARKET_ADDRESS || !address) {
        setSimulationResult(null)
        return
      }

      setSimulating(true)
      try {
        const value = parseEther(amount)
        const result = await simulateTransaction(config, {
          address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
          abi: PREDICTION_MARKET_ABI,
          functionName: 'buyPosition',
          args: [BigInt(id), side],
          value,
          account: address
        })
        setSimulationResult(result)
      } catch (e) {
        console.error(e)
        setSimulationResult({ success: false, error: 'Simulation failed' })
      } finally {
        setSimulating(false)
      }
    }

    const timeoutId = setTimeout(runSimulation, 500)
    return () => clearTimeout(timeoutId)
  }, [amount, side, isConnected, market, id, address])

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !amount || side === null) return

    try {
      writeContract({
        address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'buyPosition',
        args: [BigInt(id), side],
        value: parseEther(amount),
      })
    } catch (error) {
      console.error('Trade failed:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center text-white">Loading...</div>
  }

  if (!market) {
    return <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center text-white">Market not found</div>
  }

  const statusLabels = ['Active', 'Resolved', 'Cancelled']
  const statusText = statusLabels[market.status] || 'Unknown'
  const badgeVariant = market.status === 0 ? 'success' : market.status === 1 ? 'info' : 'warning'

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-purple-300 hover:text-white mb-6 transition">
          <span className="mr-2">←</span> Back to Markets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <Badge variant={badgeVariant}>{statusText}</Badge>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1 animate-pulse">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    LIVE
                  </span>
                </div>
                <span className="text-purple-300 text-sm">#{market.id.toString()}</span>
              </div>

              <h1 className="text-3xl font-bold text-white mb-6">{market.question}</h1>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-purple-300 text-sm mb-1">Target Price</p>
                  <p className="text-xl font-bold text-white">${parseFloat(formatEther(market.targetPrice)).toLocaleString()}</p>
                  <p className="text-xs text-purple-400 mt-1">{market.asset}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-purple-300 text-sm mb-1">Resolution Date</p>
                  <p className="text-xl font-bold text-white">
                    {new Date(Number(market.resolutionTime) * 1000).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-purple-400 mt-1">
                    {new Date(Number(market.resolutionTime) * 1000).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Volume</h3>
                <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-green-500"
                    style={{ width: `${Number(market.totalVolume) > 0 ? (Number(market.yesVolume) / Number(market.totalVolume)) * 100 : 50}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-400 font-bold">YES: {parseFloat(formatEther(market.yesVolume)).toFixed(4)} BNB</span>
                  <span className="text-red-400 font-bold">NO: {parseFloat(formatEther(market.noVolume)).toFixed(4)} BNB</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-xl font-bold text-white mb-6">Trade Position</h2>

              {market.status !== 0 ? (
                <Alert type="info" title="Market Closed" message="This market is no longer active for trading." />
              ) : !isConnected ? (
                <div className="text-center py-8">
                  <p className="text-purple-300 mb-4">Connect wallet to trade</p>
                </div>
              ) : (
                <form onSubmit={handleTrade} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSide(true)}
                      className={`p-4 rounded-lg border-2 transition ${side === true
                          ? 'border-green-500 bg-green-500/20 text-white'
                          : 'border-white/10 bg-white/5 text-purple-300 hover:bg-white/10'
                        }`}
                    >
                      <span className="block text-lg font-bold">YES</span>
                      <span className="text-xs">Predict Higher</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide(false)}
                      className={`p-4 rounded-lg border-2 transition ${side === false
                          ? 'border-red-500 bg-red-500/20 text-white'
                          : 'border-white/10 bg-white/5 text-purple-300 hover:bg-white/10'
                        }`}
                    >
                      <span className="block text-lg font-bold">NO</span>
                      <span className="text-xs">Predict Lower</span>
                    </button>
                  </div>

                  <Input
                    label="Amount (BNB)"
                    type="number"
                    step="0.001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.1"
                    required
                  />

                  <TransactionSimulation result={simulationResult} isLoading={simulating} />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isPending || isConfirming || (simulationResult?.success === false)}
                    isLoading={isPending || isConfirming}
                  >
                    {isPending || isConfirming ? 'Confirming...' : 'Place Trade'}
                  </Button>

                  {isSuccess && (
                    <Alert
                      type="success"
                      title="Trade Successful!"
                      message="Your position has been recorded."
                    />
                  )}
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
