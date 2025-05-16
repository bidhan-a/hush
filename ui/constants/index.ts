import { PoolType, Token, TokenType } from "@/types";

export const TOKENS: Token[] = [
  {
    type: TokenType.SOL,
    pools: [
      { type: PoolType.ONE, available: true },
      { type: PoolType.TWO, available: true },
      { type: PoolType.FIVE, available: true },
      { type: PoolType.TEN, available: true },
    ],
  },
  {
    type: TokenType.USDC,
    pools: [
      { type: PoolType.ONE, available: false },
      { type: PoolType.TWO, available: false },
      { type: PoolType.FIVE, available: false },
      { type: PoolType.TEN, available: false },
    ],
  },
];
