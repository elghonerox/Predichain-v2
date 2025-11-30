'use client'

import { useAccount } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button, Card, Badge, EmptyState, SkeletonCard } from '@/components/button'
import { useMarkets } from '@/hooks/useMarkets'
import { formatEther } from 'viem'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Home() {
  const { address, isConnected } = useAccount()
  const { open } = useWeb3Modal()
  const [mounted, setMounted] = useState(false)

  const { data: markets = [], isLoading: loading } = useMarkets()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Subtle background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6366f1] rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#06b6d4] rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b backdrop-blur-xl" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-secondary)' }}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#6366f1] to-[#06b6d4] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  <span className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>⚡</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>PrediChain</h1>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>BNB Chain</p>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <ThemeToggle />
                {isConnected && (
                  <Link href="/create">
                    <Button variant="secondary" size="md">
                      + Create Market
                    </Button>
                  </Link>
                )}
                {!isConnected ? (
                  <Button onClick={() => open()} variant="primary" size="md">
                    Connect Wallet
                  </Button>
                ) : (
                  <div className="px-4 py-2 rounded-lg border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Connected</p>
                    <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-[rgba(99,102,241,0.1)] text-[#a5b4fc] rounded-full text-sm font-semibold border border-[rgba(99,102,241,0.3)]">
                🏆 Seedify Prediction Markets Hackathon
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-primary)' }}>
              Trade the Future
              <br />
              <span className="bg-gradient-to-r from-[#6366f1] via-[#06b6d4] to-[#10b981] text-transparent bg-clip-text">
                With Confidence
              </span>
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Fast-resolution prediction markets powered by TWAP oracles. Trade on crypto prices with <span className="font-semibold text-[#06b6d4]">institutional-grade</span> security.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="rounded-2xl p-6 border hover:border-[rgba(99,102,241,0.3)] transition-all duration-200" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
                <div className="text-4xl font-bold bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-transparent bg-clip-text mb-2">⚡ Fast</div>
                <p style={{ color: 'var(--text-secondary)' }}>Hours to Resolution</p>
              </div>
              <div className="rounded-2xl p-6 border hover:border-[rgba(6,182,212,0.3)] transition-all duration-200" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
                <div className="text-4xl font-bold bg-gradient-to-r from-[#06b6d4] to-[#10b981] text-transparent bg-clip-text mb-2">🔒 Secure</div>
                <p style={{ color: 'var(--text-secondary)' }}>TWAP Oracle Protection</p>
              </div>
              <div className="rounded-2xl p-6 border hover:border-[rgba(16,185,129,0.3)] transition-all duration-200" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
                <div className="text-4xl font-bold bg-gradient-to-r from-[#10b981] to-[#6366f1] text-transparent bg-clip-text mb-2">💎 2%</div>
                <p style={{ color: 'var(--text-secondary)' }}>Trading Fees</p>
              </div>
            </div>

            {!isConnected && (
              <Button
                onClick={() => open()}
                variant="primary"
                size="lg"
                className="transform hover:scale-105 text-lg px-12"
              >
                Get Started →
              </Button>
            )}
          </div>

          {/* Markets Section */}
          {isConnected && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Active Markets</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-lg border transition-all hover:border-[rgba(99,102,241,0.3)]" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-default)' }}>
                    All
                  </button>
                  <button className="px-4 py-2 rounded-lg transition-all" style={{ background: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    Active
                  </button>
                  <button className="px-4 py-2 rounded-lg transition-all" style={{ background: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    Resolved
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : markets.length === 0 ? (
                <EmptyState
                  icon="📊"
                  title="No Markets Yet"
                  description="Be the first to create a prediction market!"
                  action={
                    <Link href="/create">
                      <Button variant="primary" size="lg">
                        Create First Market
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {markets.map((market) => {
                    const statusLabels = ['Active', 'Resolved', 'Cancelled']
                    const statusText = statusLabels[market.status] || 'Unknown'
                    const badgeVariant = market.status === 0 ? 'success' : market.status === 1 ? 'info' : 'warning'

                    return (
                      <Card key={market.id.toString()} hover>
                        <div className="mb-4">
                          <div className="flex justify-between items-start mb-3">
                            <Badge variant={badgeVariant}>{statusText}</Badge>
                            <span className="text-[#64748b] text-sm">#{market.id.toString()}</span>
                          </div>
                          <h4 className="text-lg font-bold text-white mb-2 leading-snug">{market.question}</h4>
                          <p className="text-sm text-[#64748b]">
                            Target: <span className="text-[#06b6d4] font-semibold">${parseFloat(formatEther(market.targetPrice)).toLocaleString()}</span> {market.asset}
                          </p>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div>
                            <div className="flex justify-between text-xs text-[#64748b] mb-1">
                              <span>Volume Distribution</span>
                              <span>{parseFloat(formatEther(market.totalVolume)).toFixed(4)} BNB</span>
                            </div>
                            <div className="h-2 bg-[#0f1318] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#10b981] to-[#06b6d4]"
                                style={{ width: `${Number(market.totalVolume) > 0 ? (Number(market.yesVolume) / Number(market.totalVolume)) * 100 : 50}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-[#10b981] font-semibold">YES {((Number(market.yesVolume) / Number(market.totalVolume)) * 100 || 50).toFixed(0)}%</span>
                              <span className="text-[#f43f5e] font-semibold">NO {((Number(market.noVolume) / Number(market.totalVolume)) * 100 || 50).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>

                        <Link href={`/market/${market.id.toString()}`}>
                          <Button variant="outline" size="md" className="w-full">
                            Trade Now →
                          </Button>
                        </Link>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Features Section - Only show when not connected */}
          {!isConnected && (
            <div className="mt-24">
              <h3 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--text-primary)' }}>Why PrediChain?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="rounded-2xl p-8 border hover:border-[rgba(99,102,241,0.3)] transition-all duration-200" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
                  <div className="text-4xl mb-4">💡</div>
                  <h4 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Transaction Simulation</h4>
                  <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>See exactly what will happen before you trade. No surprises, no failed transactions.</p>
                </div>
                <div className="rounded-2xl p-8 border hover:border-[rgba(6,182,212,0.3)] transition-all duration-200" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
                  <div className="text-4xl mb-4">🛡️</div>
                  <h4 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>TWAP Protection</h4>
                  <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Time-weighted average pricing prevents flash loan attacks and manipulation.</p>
                </div>
                <div className="rounded-2xl p-8 border hover:border-[rgba(16,185,129,0.3)] transition-all duration-200" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
                  <div className="text-4xl mb-4">⚡</div>
                  <h4 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Instant Clarity</h4>
                  <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Markets resolve in hours, not days. Get your winnings faster than ever.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t mt-24" style={{ borderColor: 'var(--border-default)' }}>
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              <p>© 2025 PrediChain. Built for Seedify Hackathon on BNB Chain.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
