-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAW');

-- CreateTable
CREATE TABLE "Commitment" (
    "id" SERIAL NOT NULL,
    "index" INTEGER NOT NULL,
    "commitment" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commitment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "tx_type" "TransactionType" NOT NULL,
    "address" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Commitment_index_key" ON "Commitment"("index");

-- CreateIndex
CREATE UNIQUE INDEX "Commitment_commitment_key" ON "Commitment"("commitment");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_tx_hash_key" ON "Transaction"("tx_hash");
