interface Token {
  symbol: string;
  address: string;
}
export interface TokenListResponse {
  message: string;
  tokens: Token[];
}

export interface TokenPriceResponse {
  message: string;
  price: number;
}

export interface QuotationResponse {
  message: string;
  outputAmount: string;
  outputAmountMin: string;
}

export interface ExecuteSwapResponse {
  message: string;
  txHash: string | string[];
}

// Define the types for the return value
interface RewardToken {
  rewardToken: string;
  weeklyRewards: string;
}

interface Mint {
  address: string;
  symbol: string;
}

interface Pool {
  type: string;
  poolId: string;
  mintA: Mint;
  mintB: Mint;
  tvl: number;
  feeRate: number;
  weeklyRewards: RewardToken[];
  apr: number; // Single APR value to handle the conditional logic
}

export interface PoolsResponse {
  success: boolean;
  data: Pool[];
  count: number;
  hasNextPage: boolean;
}


export interface LiquidityResponse {
  message: string;
  txHash: string;
}
export interface ClaimLiquidityResponse {
  message: string;
  txHashes: string[];
}