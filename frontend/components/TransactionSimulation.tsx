'use client'

import { Alert } from '@/components/button'
import { SimulationResult } from '@/lib/simulation'

interface TransactionSimulationProps {
    result: SimulationResult | null
    isLoading: boolean
}

export function TransactionSimulation({ result, isLoading }: TransactionSimulationProps) {
    if (isLoading) {
        return (
            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
            </div>
        )
    }

    if (!result) return null

    if (!result.success) {
        return (
            <div className="mt-4">
                <Alert
                    type="error"
                    title="Transaction Will Fail"
                    message={result.error || 'Unknown error'}
                />
            </div>
        )
    }

    return (
        <div className="mt-4">
            <Alert
                type="success"
                title="Simulation Successful"
                message={`Estimated Gas: ${result.gasEstimate?.toString() || 'Unknown'}`}
            />
            {/* Advanced details could go here */}
        </div>
    )
}
