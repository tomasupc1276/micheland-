/*
  Warnings:

  - You are about to drop the column `turnoId` on the `Egreso` table. All the data in the column will be lost.
  - You are about to drop the column `abierto` on the `Turno` table. All the data in the column will be lost.
  - You are about to drop the column `diferencia` on the `Turno` table. All the data in the column will be lost.
  - You are about to drop the column `fondoFinal` on the `Turno` table. All the data in the column will be lost.
  - You are about to drop the column `fondoInicial` on the `Turno` table. All the data in the column will be lost.
  - You are about to drop the column `turnoId` on the `Venta` table. All the data in the column will be lost.
  - Made the column `totalVentas` on table `Turno` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalEgresos` on table `Turno` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Egreso" DROP CONSTRAINT "Egreso_turnoId_fkey";

-- DropForeignKey
ALTER TABLE "Venta" DROP CONSTRAINT "Venta_turnoId_fkey";

-- AlterTable
ALTER TABLE "Egreso" DROP COLUMN "turnoId";

-- AlterTable
ALTER TABLE "Turno" DROP COLUMN "abierto",
DROP COLUMN "diferencia",
DROP COLUMN "fondoFinal",
DROP COLUMN "fondoInicial",
ADD COLUMN     "estado" TEXT NOT NULL DEFAULT 'abierto',
ADD COLUMN     "ganancia" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "totalVentas" SET NOT NULL,
ALTER COLUMN "totalVentas" SET DEFAULT 0,
ALTER COLUMN "totalEgresos" SET NOT NULL,
ALTER COLUMN "totalEgresos" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Venta" DROP COLUMN "turnoId";
