const express = require('express')
const router = express.Router()
const prisma = require('../db')

router.get('/', async (req, res) => {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)

  const ventas = await prisma.venta.findMany({
    where: { creadoEn: { gte: hoy, lt: manana } },
    include: { items: true }
  })

  const egresos = await prisma.egreso.findMany({
    where: { creadoEn: { gte: hoy, lt: manana } }
  })

  const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0)
  const totalEgresos = egresos.reduce((sum, e) => sum + e.monto, 0)
  const ganancia = totalVentas - totalEgresos

  res.json({
    totalVentas,
    totalEgresos,
    ganancia,
    numVentas: ventas.length,
    numEgresos: egresos.length,
    ventas,
    egresos
  })
})

module.exports = router