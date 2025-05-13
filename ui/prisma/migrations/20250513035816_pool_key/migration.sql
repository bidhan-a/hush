/*
  Warnings:

  - A unique constraint covering the columns `[pool_key,index]` on the table `Commitment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pool_key` to the `Commitment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pool_key` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Commitment_index_key";

-- AlterTable
ALTER TABLE "Commitment" ADD COLUMN     "pool_key" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "pool_key" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Commitment_pool_key_idx" ON "Commitment"("pool_key");

-- CreateIndex
CREATE UNIQUE INDEX "Commitment_pool_key_index_key" ON "Commitment"("pool_key", "index");

-- CreateIndex
CREATE INDEX "Transaction_pool_key_idx" ON "Transaction"("pool_key");
