import { PoolType, Token, TokenType } from "@/types";

export const TOKENS: Token[] = [
  {
    type: TokenType.SOL,
    pools: [
      { type: PoolType.ONE, available: true },
      { type: PoolType.TEN, available: false },
      { type: PoolType.HUNDRED, available: false },
      { type: PoolType.THOUSAND, available: false },
    ],
  },
  {
    type: TokenType.USDC,
    pools: [
      { type: PoolType.ONE, available: false },
      { type: PoolType.TEN, available: false },
      { type: PoolType.HUNDRED, available: false },
      { type: PoolType.THOUSAND, available: false },
    ],
  },
];
