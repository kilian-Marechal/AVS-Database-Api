-- CreateTable
CREATE TABLE "StakerOperatorDelegations" (
    "id" SERIAL NOT NULL,
    "graphId" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockTimestamp" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "operatorId" INTEGER NOT NULL,
    "restakerId" INTEGER NOT NULL,

    CONSTRAINT "StakerOperatorDelegations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StakerOperatorUndelegations" (
    "id" SERIAL NOT NULL,
    "graphId" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockTimestamp" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "operatorId" INTEGER NOT NULL,
    "restakerId" INTEGER NOT NULL,

    CONSTRAINT "StakerOperatorUndelegations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StakerOperatorForceUndelegations" (
    "id" SERIAL NOT NULL,
    "graphId" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockTimestamp" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "operatorId" INTEGER NOT NULL,
    "restakerId" INTEGER NOT NULL,

    CONSTRAINT "StakerOperatorForceUndelegations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StakerOperatorDelegations_graphId_key" ON "StakerOperatorDelegations"("graphId");

-- CreateIndex
CREATE INDEX "StakerOperatorDelegations_blockNumber_operatorId_restakerId_idx" ON "StakerOperatorDelegations"("blockNumber", "operatorId", "restakerId");

-- CreateIndex
CREATE UNIQUE INDEX "StakerOperatorUndelegations_graphId_key" ON "StakerOperatorUndelegations"("graphId");

-- CreateIndex
CREATE INDEX "StakerOperatorUndelegations_blockNumber_operatorId_restaker_idx" ON "StakerOperatorUndelegations"("blockNumber", "operatorId", "restakerId");

-- CreateIndex
CREATE UNIQUE INDEX "StakerOperatorForceUndelegations_graphId_key" ON "StakerOperatorForceUndelegations"("graphId");

-- CreateIndex
CREATE INDEX "StakerOperatorForceUndelegations_blockNumber_operatorId_res_idx" ON "StakerOperatorForceUndelegations"("blockNumber", "operatorId", "restakerId");

-- AddForeignKey
ALTER TABLE "StakerOperatorDelegations" ADD CONSTRAINT "StakerOperatorDelegations_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StakerOperatorDelegations" ADD CONSTRAINT "StakerOperatorDelegations_restakerId_fkey" FOREIGN KEY ("restakerId") REFERENCES "Restaker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StakerOperatorUndelegations" ADD CONSTRAINT "StakerOperatorUndelegations_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StakerOperatorUndelegations" ADD CONSTRAINT "StakerOperatorUndelegations_restakerId_fkey" FOREIGN KEY ("restakerId") REFERENCES "Restaker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StakerOperatorForceUndelegations" ADD CONSTRAINT "StakerOperatorForceUndelegations_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StakerOperatorForceUndelegations" ADD CONSTRAINT "StakerOperatorForceUndelegations_restakerId_fkey" FOREIGN KEY ("restakerId") REFERENCES "Restaker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
