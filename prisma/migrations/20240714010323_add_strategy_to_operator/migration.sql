-- CreateTable
CREATE TABLE "_OperatorStrategies" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_OperatorStrategies_AB_unique" ON "_OperatorStrategies"("A", "B");

-- CreateIndex
CREATE INDEX "_OperatorStrategies_B_index" ON "_OperatorStrategies"("B");

-- AddForeignKey
ALTER TABLE "_OperatorStrategies" ADD CONSTRAINT "_OperatorStrategies_A_fkey" FOREIGN KEY ("A") REFERENCES "Operator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OperatorStrategies" ADD CONSTRAINT "_OperatorStrategies_B_fkey" FOREIGN KEY ("B") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
