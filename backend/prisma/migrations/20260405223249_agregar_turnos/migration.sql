TRUNCATE TABLE "ItemVenta" CASCADE;
TRUNCATE TABLE "Venta" CASCADE;
TRUNCATE TABLE "Egreso" CASCADE;

/*
  Warnings:

  - Added the required column `turnoId` to the `Egreso` table without a default value. This is not possible if the table is not empty.
  - Added the required column `turnoId` to the `Venta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Egreso" ADD COLUMN     "turnoId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Venta" ADD COLUMN     "turnoId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Turno" (
    "id" SERIAL NOT NULL,
    "fondoInicial" DOUBLE PRECISION NOT NULL,
    "fondoFinal" DOUBLE PRECISION,
    "totalVentas" DOUBLE PRECISION,
    "totalEgresos" DOUBLE PRECISION,
    "diferencia" DOUBLE PRECISION,
    "abierto" BOOLEAN NOT NULL DEFAULT true,
    "abiertaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cerradaEn" TIMESTAMP(3),

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Egreso" ADD CONSTRAINT "Egreso_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
