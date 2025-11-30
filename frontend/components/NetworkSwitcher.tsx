'use client'

import { useAccount, useSwitchChain } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'
import { useEffect, useState } from 'react'
import { Button, Card } from './button'

export function NetworkSwitcher() {
    const { chain, isConnected } = useAccount()
    const { switchChain, isPending } = useSwitchChain()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted || !isConnected) return null

    // If we are on the correct chain (BSC Testnet), don't show anything
    if (chain?.id === bscTestnet.id) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="max-w-md w-full mx-4">
                <Card>
                    <div className="text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Wrong Network</h2>
                        <p className="text-purple-300 mb-6">
                            PrediChain is currently live on <strong>BNB Smart Chain Testnet</strong>.
                            Please switch your network to continue.
                        </p>

                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full"
                            onClick={() => switchChain({ chainId: bscTestnet.id })}
                            disabled={isPending}
                            isLoading={isPending}
                        >
                            {isPending ? 'Switching...' : 'Switch to BSC Testnet'}
                        </Button>

                        <p className="text-xs text-purple-400 mt-4">
                            Chain ID: {bscTestnet.id}
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
}
