/*
  Warnings:

  - Changed the type of `shares` on the `OperatorSharesDecreased` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "OperatorSharesDecreased" DROP COLUMN "shares",
ADD COLUMN     "shares" INTEGER NOT NULL;
