"use server";

import prisma from "@/lib/prisma";
import { TransactionType } from "@/app/generated/prisma";

export async function getCommitments() {
  const commitments = await prisma.commitment.findMany({
    orderBy: [{ index: "asc" }],
  });
  return commitments;
}

export async function getTransactions(limit: number = 10) {
  const transactions = await prisma.transaction.findMany({
    take: limit,
    orderBy: [{ id: "desc" }],
  });
  return transactions;
}

export async function saveCommitment(index: number, commitment: Uint8Array) {
  const result = await prisma.commitment.create({
    data: {
      index,
      commitment,
    },
  });
  return result;
}

export async function saveTransaction(
  address: string,
  txHash: string,
  isDeposit: boolean
) {
  const result = await prisma.transaction.create({
    data: {
      txType: isDeposit ? TransactionType.DEPOSIT : TransactionType.WITHDRAW,
      address,
      txHash,
    },
  });
  return result;
}
