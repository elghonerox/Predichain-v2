import { type Config } from 'wagmi'
import { simulateContract } from 'wagmi/actions'
import { type Abi } from 'viem'

export type SimulationResult = {
    success: boolean
    error?: string
    gasEstimate?: bigint
    decodedOutput?: unknown
}

export async function simulateTransaction(
    config: Config,
    params: {
        address: `0x${string}`
        abi: Abi
        functionName: string
        args: unknown[]
        value?: bigint
        account: `0x${string}`
    }
): Promise<SimulationResult> {
    try {
        const result = await simulateContract(config, {
            ...params,
        })

        return {
            success: true,
            gasEstimate: result.request.gas,
            decodedOutput: result.result,
        }
    } catch (error: unknown) {
        console.error('Simulation failed:', error)

        // Extract readable error message
        let errorMessage = 'Transaction would fail'

        if (error instanceof Error && error.message) {
            if (error.message.includes('User rejected')) {
                errorMessage = 'User rejected request'
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Insufficient funds for gas + value'
            } else if ('shortMessage' in error && typeof error.shortMessage === 'string') {
                errorMessage = error.shortMessage
            } else {
                // Try to find custom error name
                const match = error.message.match(/Error: ([A-Za-z0-9_]+)\(/)
                if (match) {
                    errorMessage = `Contract Error: ${match[1]}`
                }
            }
        }

        return {
            success: false,
            error: errorMessage,
        }
    }
}
