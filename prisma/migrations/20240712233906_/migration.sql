-- CreateTable
CREATE TABLE "Avs" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "name" TEXT,
    "operatorCount" INTEGER,
    "restakerCount" INTEGER,
    "totalRestaked" DOUBLE PRECISION,

    CONSTRAINT "Avs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operator" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "name" TEXT,
    "restakerCount" INTEGER,
    "totalRestaked" DOUBLE PRECISION,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Restaker" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "name" TEXT,
    "ethValue" DOUBLE PRECISION,

    CONSTRAINT "Restaker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatorAvsRegistration" (
    "id" SERIAL NOT NULL,
    "graphId" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockTimestamp" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "operatorId" INTEGER NOT NULL,
    "avsId" INTEGER NOT NULL,

    CONSTRAINT "OperatorAvsRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AvsOperators" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AvsRestakers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_OperatorRestakers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Avs_address_key" ON "Avs"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Operator_address_key" ON "Operator"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Restaker_address_key" ON "Restaker"("address");

-- CreateIndex
CREATE UNIQUE INDEX "OperatorAvsRegistration_graphId_key" ON "OperatorAvsRegistration"("graphId");

-- CreateIndex
CREATE UNIQUE INDEX "_AvsOperators_AB_unique" ON "_AvsOperators"("A", "B");

-- CreateIndex
CREATE INDEX "_AvsOperators_B_index" ON "_AvsOperators"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AvsRestakers_AB_unique" ON "_AvsRestakers"("A", "B");

-- CreateIndex
CREATE INDEX "_AvsRestakers_B_index" ON "_AvsRestakers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OperatorRestakers_AB_unique" ON "_OperatorRestakers"("A", "B");

-- CreateIndex
CREATE INDEX "_OperatorRestakers_B_index" ON "_OperatorRestakers"("B");

-- AddForeignKey
ALTER TABLE "OperatorAvsRegistration" ADD CONSTRAINT "OperatorAvsRegistration_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorAvsRegistration" ADD CONSTRAINT "OperatorAvsRegistration_avsId_fkey" FOREIGN KEY ("avsId") REFERENCES "Avs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AvsOperators" ADD CONSTRAINT "_AvsOperators_A_fkey" FOREIGN KEY ("A") REFERENCES "Avs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AvsOperators" ADD CONSTRAINT "_AvsOperators_B_fkey" FOREIGN KEY ("B") REFERENCES "Operator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AvsRestakers" ADD CONSTRAINT "_AvsRestakers_A_fkey" FOREIGN KEY ("A") REFERENCES "Avs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AvsRestakers" ADD CONSTRAINT "_AvsRestakers_B_fkey" FOREIGN KEY ("B") REFERENCES "Restaker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OperatorRestakers" ADD CONSTRAINT "_OperatorRestakers_A_fkey" FOREIGN KEY ("A") REFERENCES "Operator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OperatorRestakers" ADD CONSTRAINT "_OperatorRestakers_B_fkey" FOREIGN KEY ("B") REFERENCES "Restaker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
