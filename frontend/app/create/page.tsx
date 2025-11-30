'use client'

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useState, useEffect } from 'react'
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '@/lib/contracts'
import { parseEther } from 'viem'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Input, Card, Alert } from '@/components/button'
import { config } from '@/lib/wagmi'
import { simulateTransaction, SimulationResult } from '@/lib/simulation'
import { TransactionSimulation } from '@/components/TransactionSimulation'

export default function CreateMarket() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [asset, setAsset] = useState('BTC')
  const [targetPrice, setTargetPrice] = useState('')
  const [resolutionTime, setResolutionTime] = useState('')
  const [mounted, setMounted] = useState(false)

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [simulating, setSimulating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Simulation Effect
  useEffect(() => {
    const runSimulation = async () => {
      if (!isConnected || !question || !targetPrice || !resolutionTime || !PREDICTION_MARKET_ADDRESS || !address) {
        setSimulationResult(null)
        return
      }

      setSimulating(true)
      try {
        const targetPriceWei = parseEther(targetPrice)
        const resolutionTimestamp = Math.floor(new Date(resolutionTime).getTime() / 1000)

        const result = await simulateTransaction(config, {
          address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
          abi: PREDICTION_MARKET_ABI,
          functionName: 'createMarket',
          args: [question, asset, targetPriceWei, BigInt(resolutionTimestamp)],
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
  }, [question, asset, targetPrice, resolutionTime, isConnected, address])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !PREDICTION_MARKET_ADDRESS) return

    try {
      const targetPriceWei = parseEther(targetPrice)
      const resolutionTimestamp = Math.floor(new Date(resolutionTime).getTime() / 1000)

      writeContract({
        address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'createMarket',
        args: [question, asset, targetPriceWei, BigInt(resolutionTimestamp)],
      })
    } catch (error) {
      console.error('Error creating market:', error)
    }
  }

  useEffect(() => {
    if (isSuccess) {
      const timeout = setTimeout(() => router.push('/'), 2000)
      return () => clearTimeout(timeout)
    }
  }, [isSuccess, router])

  if (!mounted) {
    return null
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366f1] rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>
        </div>
        <div className="relative z-10 text-center max-w-md mx-4">
          <Card>
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-[#cbd5e1] mb-6">You need to connect your wallet to create a market.</p>
            <Link href="/">
              <Button variant="primary" size="lg" className="w-full">
                Go Back Home
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#6366f1] rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#06b6d4] rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-[rgba(255,255,255,0.08)] backdrop-blur-xl bg-[#0f1318]/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#6366f1] to-[#06b6d4] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  <span className="text-white font-bold text-xl">⚡</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">PrediChain</h1>
                  <p className="text-xs text-[#64748b]">BNB Chain</p>
                </div>
              </Link>

              <div className="px-4 py-2 bg-[#1a1f29] rounded-lg border border-[rgba(255,255,255,0.08)]">
                <p className="text-xs text-[#64748b]">Connected</p>
                <p className="text-sm text-white font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <Link href="/" className="inline-flex items-center text-[#64748b] hover:text-white mb-6 transition">
                <span className="mr-2">←</span> Back to Markets
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Create Prediction Market
              </h1>
              <p className="text-lg text-[#cbd5e1]">
                Set up a new crypto price prediction market
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <div className="space-y-6">
                  {/* Question */}
                  <Input
                    label="Market Question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., Will BTC price exceed $100,000 by Dec 31, 2025?"
                    required
                    helperText="Make it clear and specific"
                  />

                  {/* Asset Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Asset <span className="text-[#f43f5e]">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['BTC', 'ETH', 'BNB'].map((crypto) => (
                        <button
                          key={crypto}
                          type="button"
                          onClick={() => setAsset(crypto)}
                          className={`px-4 py-3 rounded-lg font-semibold transition-all ${asset === crypto
                              ? 'bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                              : 'bg-[#1a1f29] border border-[rgba(255,255,255,0.08)] text-[#cbd5e1] hover:border-[rgba(99,102,241,0.3)]'
                            }`}
                        >
                          {crypto}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Price */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Target Price (USD) <span className="text-[#f43f5e]">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-[#64748b] text-lg">$</span>
                      <input
                        type="number"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        placeholder="100000"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-3 bg-[#0f1318] border border-[rgba(255,255,255,0.08)] rounded-lg text-white placeholder-[#64748b] focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <p className="text-xs text-[#64748b] mt-1">The price point you&apos;re predicting</p>
                  </div>

                  {/* Resolution Time */}
                  <Input
                    label="Resolution Time"
                    type="datetime-local"
                    value={resolutionTime}
                    onChange={(e) => setResolutionTime(e.target.value)}
                    required
                    helperText="When should this market resolve?"
                  />

                  {/* Info Box */}
                  <Alert
                    type="info"
                    title="Market Creation"
                    message="Creating a market is free. You'll earn 20% of trading fees from your market. Markets resolve automatically using Redstone oracle."
                  />

                  {/* Transaction Simulation */}
                  <TransactionSimulation result={simulationResult} isLoading={simulating} />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isPending || isConfirming}
                    disabled={isPending || isConfirming || (simulationResult?.success === false)}
                    className="w-full"
                  >
                    {isPending || isConfirming ? 'Creating Market...' : '🚀 Create Market'}
                  </Button>

                  {/* Success Message */}
                  {isSuccess && (
                    <Alert
                      type="success"
                      title="Market created successfully!"
                      message={`Transaction: ${hash?.slice(0, 10)}...${hash?.slice(-8)} - Redirecting to markets...`}
                    />
                  )}
                </div>
              </Card>
            </form>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card>
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="text-white font-semibold mb-1">Fast Resolution</h4>
                <p className="text-xs text-[#64748b]">Resolves in minutes using Redstone oracle</p>
              </Card>
              <Card>
                <div className="text-2xl mb-2">💰</div>
                <h4 className="text-white font-semibold mb-1">Earn Fees</h4>
                <p className="text-xs text-[#64748b]">Get 20% of all trading fees from your market</p>
              </Card>
              <Card>
                <div className="text-2xl mb-2">🔒</div>
                <h4 className="text-white font-semibold mb-1">Secure</h4>
                <p className="text-xs text-[#64748b]">Built on BNB Chain with verified contracts</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}