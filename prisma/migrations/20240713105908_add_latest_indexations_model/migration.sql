-- CreateTable
CREATE TABLE "Indexations" (
    "id" SERIAL NOT NULL,
    "entity" TEXT NOT NULL,
    "latestBlockNumber" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Indexations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Indexations_entity_key" ON "Indexations"("entity");
