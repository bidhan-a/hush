export enum TokenType {
  SOL = "SOL",
  USDC = "USDC",
}

export enum PoolType {
  ONE = 1,
  TEN = 10,
  HUNDRED = 100,
  THOUSAND = 1000,
}

export interface Pool {
  type: PoolType;
  available: boolean;
}

export interface PoolStats {
  totalValue: number;
  deposits: number;
  withdrawals: number;
}

export interface Token {
  type: TokenType;
  pools: Pool[];
}
