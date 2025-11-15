// Contract ABIs and addresses
// These will be updated after deployment

export const PREDICTION_MARKET_ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'question', type: 'string' },
      { internalType: 'string', name: 'asset', type: 'string' },
      { internalType: 'uint256', name: 'targetPrice', type: 'uint256' },
      { internalType: 'uint256', name: 'resolutionTime', type: 'uint256' },
    ],
    name: 'createMarket',
    outputs: [{ internalType: 'uint256', name: 'marketId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'marketId', type: 'uint256' },
      { internalType: 'bool', name: 'side', type: 'bool' },
    ],
    name: 'buyPosition',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'marketId', type: 'uint256' }],
    name: 'resolveMarket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'marketId', type: 'uint256' }],
    name: 'claimPayout',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'marketId', type: 'uint256' }],
    name: 'getMarket',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'string', name: 'question', type: 'string' },
          { internalType: 'string', name: 'asset', type: 'string' },
          { internalType: 'uint256', name: 'targetPrice', type: 'uint256' },
          { internalType: 'uint256', name: 'resolutionTime', type: 'uint256' },
          { internalType: 'address', name: 'creator', type: 'address' },
          { internalType: 'uint8', name: 'status', type: 'uint8' },
          { internalType: 'uint256', name: 'totalVolume', type: 'uint256' },
          { internalType: 'uint256', name: 'yesVolume', type: 'uint256' },
          { internalType: 'uint256', name: 'noVolume', type: 'uint256' },
          { internalType: 'uint256', name: 'resolutionPrice', type: 'uint256' },
          { internalType: 'bool', name: 'outcome', type: 'bool' },
        ],
        internalType: 'struct PredictionMarket.Market',
        name: 'market',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'marketId', type: 'uint256' },
      { internalType: 'address', name: 'user', type: 'address' },
    ],
    name: 'getPosition',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'user', type: 'address' },
          { internalType: 'uint256', name: 'marketId', type: 'uint256' },
          { internalType: 'bool', name: 'side', type: 'bool' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint256', name: 'price', type: 'uint256' },
        ],
        internalType: 'struct PredictionMarket.Position',
        name: 'position',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMarketCount',
    outputs: [{ internalType: 'uint256', name: 'count', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Contract addresses (will be updated after deployment)
export const PREDICTION_MARKET_ADDRESS = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || ''

