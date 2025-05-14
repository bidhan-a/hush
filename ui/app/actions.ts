"use server";

import prisma from "@/lib/prisma";
import { TransactionType } from "@/app/generated/prisma";

export async function getLastCommitment(poolKey: string) {
  const commitment = await prisma.commitment.findFirst({
    where: {
      poolKey,
    },
    orderBy: [{ id: "desc" }],
  });
  return commitment;
}

export async function getCommitments(poolKey: string) {
  const commitments = await prisma.commitment.findMany({
    where: {
      poolKey,
    },
    orderBy: [{ index: "asc" }],
  });
  return commitments;
}

export async function getTransactions(poolKey: string, limit: number = 10) {
  const transactions = await prisma.transaction.findMany({
    where: {
      poolKey,
    },
    take: limit,
    orderBy: [{ id: "desc" }],
  });
  return transactions;
}

export async function saveCommitment(
  poolKey: string,
  index: number,
  commitment: Uint8Array
) {
  const result = await prisma.commitment.create({
    data: {
      poolKey,
      index,
      commitment,
    },
  });
  return result;
}

export async function saveTransaction(
  poolKey: string,
  address: string,
  txHash: string,
  isDeposit: boolean
) {
  const result = await prisma.transaction.create({
    data: {
      poolKey,
      txType: isDeposit ? TransactionType.DEPOSIT : TransactionType.WITHDRAW,
      address,
      txHash,
    },
  });
  return result;
}
