-- CreateTable
CREATE TABLE "Strategy" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "tokenEthValue" DOUBLE PRECISION,

    CONSTRAINT "Strategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatorSharesIncreased" (
    "id" SERIAL NOT NULL,
    "graphId" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockTimestamp" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "shares" INTEGER NOT NULL,
    "operatorId" INTEGER NOT NULL,
    "restakerId" INTEGER NOT NULL,
    "strategyId" INTEGER NOT NULL,

    CONSTRAINT "OperatorSharesIncreased_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatorSharesDecreased" (
    "id" SERIAL NOT NULL,
    "graphId" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockTimestamp" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "shares" INTEGER NOT NULL,
    "operatorId" INTEGER NOT NULL,
    "restakerId" INTEGER NOT NULL,
    "strategyId" INTEGER NOT NULL,

    CONSTRAINT "OperatorSharesDecreased_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Strategy_address_key" ON "Strategy"("address");

-- CreateIndex
CREATE UNIQUE INDEX "OperatorSharesIncreased_graphId_key" ON "OperatorSharesIncreased"("graphId");

-- CreateIndex
CREATE UNIQUE INDEX "OperatorSharesDecreased_graphId_key" ON "OperatorSharesDecreased"("graphId");

-- AddForeignKey
ALTER TABLE "OperatorSharesIncreased" ADD CONSTRAINT "OperatorSharesIncreased_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorSharesIncreased" ADD CONSTRAINT "OperatorSharesIncreased_restakerId_fkey" FOREIGN KEY ("restakerId") REFERENCES "Restaker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorSharesIncreased" ADD CONSTRAINT "OperatorSharesIncreased_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorSharesDecreased" ADD CONSTRAINT "OperatorSharesDecreased_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorSharesDecreased" ADD CONSTRAINT "OperatorSharesDecreased_restakerId_fkey" FOREIGN KEY ("restakerId") REFERENCES "Restaker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorSharesDecreased" ADD CONSTRAINT "OperatorSharesDecreased_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
