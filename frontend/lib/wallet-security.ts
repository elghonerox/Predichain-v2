import { verifyMessage } from 'viem'
import type { Address } from 'viem'

/**
 * SECURITY FIX M-4: Wallet Signature Verification
 * 
 * Provides utilities for verifying wallet ownership through signature verification.
 * This helps prevent phishing attacks and ensures users are connecting authentic wallets.
 */

export interface SignatureVerificationResult {
    valid: boolean
    address: Address
    timestamp: number
}

/**
 * Generate a secure message for signature verification
 * 
 * @param address - The wallet address to verify
 * @param nonce - A random nonce for replay attack prevention
 * @returns A formatted message string for signing
 */
export function generateVerificationMessage(address: Address, nonce: string): string {
    const timestamp = Date.now()
    return `PrediChain - Verify Wallet Ownership

Address: ${address}
Nonce: ${nonce}
Timestamp: ${timestamp}

This signature will not trigger any blockchain transaction or cost.
By signing this message, you verify ownership of this wallet.`
}

/**
 * Verify wallet signature
 * 
 * @param message - The original message that was signed
 * @param signature - The signature from the wallet
 * @param expectedAddress - The address that should have signed the message
 * @returns Verification result with validity status
 */
export async function verifyWalletSignature(
    message: string,
    signature: `0x${string}`,
    expectedAddress: Address
): Promise<SignatureVerificationResult> {
    try {
        const recoveredAddress = await verifyMessage({
            address: expectedAddress,
            message,
            signature,
        })

        // Extract timestamp from message
        const timestampMatch = message.match(/Timestamp: (\d+)/)
        const timestamp = timestampMatch ? parseInt(timestampMatch[1]) : 0

        // Verify signature is recent (within 5 minutes to prevent replay attacks)
        const SIGNATURE_TIMEOUT = 5 * 60 * 1000 // 5 minutes
        const isRecent = Date.now() - timestamp < SIGNATURE_TIMEOUT

        return {
            valid: recoveredAddress && isRecent,
            address: expectedAddress,
            timestamp,
        }
    } catch (error) {
        console.error('Signature verification failed:', error)
        return {
            valid: false,
            address: expectedAddress,
            timestamp: 0,
        }
    }
}

/**
 * Generate a cryptographically secure random nonce
 * 
 * @returns A random nonce string
 */
export function generateNonce(): string {
    // Generate 32 random characters
    const array = new Uint8Array(16)
    if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(array)
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    }

    // Fallback for non-browser environments
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
}

/**
 * Session storage for verified addresses
 * Prevents requiring signature on every page load
 */
class VerifiedAddressStore {
    private storageKey = 'predichain_verified_addresses'

    /**
     * Mark an address as verified
     */
    setVerified(address: Address, timestamp: number): void {
        if (typeof window === 'undefined') return

        try {
            const verified = this.getAll()
            verified[address.toLowerCase()] = timestamp
            sessionStorage.setItem(this.storageKey, JSON.stringify(verified))
        } catch (error) {
            console.error('Failed to store verified address:', error)
        }
    }

    /**
     * Check if an address has been verified in this session
     */
    isVerified(address: Address): boolean {
        if (typeof window === 'undefined') return false

        try {
            const verified = this.getAll()
            const timestamp = verified[address.toLowerCase()]

            if (!timestamp) return false

            // Consider verification valid for 1 hour
            const VERIFICATION_TIMEOUT = 60 * 60 * 1000 // 1 hour
            return Date.now() - timestamp < VERIFICATION_TIMEOUT
        } catch (error) {
            return false
        }
    }

    /**
     * Clear verified address on disconnect
     */
    clearVerified(address: Address): void {
        if (typeof window === 'undefined') return

        try {
            const verified = this.getAll()
            delete verified[address.toLowerCase()]
            sessionStorage.setItem(this.storageKey, JSON.stringify(verified))
        } catch (error) {
            console.error('Failed to clear verified address:', error)
        }
    }

    /**
     * Clear all verified addresses
     */
    clearAll(): void {
        if (typeof window === 'undefined') return

        try {
            sessionStorage.removeItem(this.storageKey)
        } catch (error) {
            console.error('Failed to clear all verified addresses:', error)
        }
    }

    private getAll(): Record<string, number> {
        try {
            const stored = sessionStorage.getItem(this.storageKey)
            return stored ? JSON.parse(stored) : {}
        } catch (error) {
            return {}
        }
    }
}

export const verifiedAddressStore = new VerifiedAddressStore()
