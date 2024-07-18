-- CreateTable
CREATE TABLE "OperatorStrategy" (
    "id" SERIAL NOT NULL,
    "operatorId" INTEGER NOT NULL,
    "strategyId" INTEGER NOT NULL,
    "tokenAmount" DOUBLE PRECISION NOT NULL,
    "usdValue" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperatorStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OperatorStrategy_operatorId_strategyId_key" ON "OperatorStrategy"("operatorId", "strategyId");

-- AddForeignKey
ALTER TABLE "OperatorStrategy" ADD CONSTRAINT "OperatorStrategy_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorStrategy" ADD CONSTRAINT "OperatorStrategy_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
