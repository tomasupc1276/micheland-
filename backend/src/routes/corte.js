const express = require('express')
const router = express.Router()
const prisma = require('../db')

router.get('/', async (req, res) => {
  const turno = await prisma.turno.findFirst({
    where: { estado: 'abierto' },
    orderBy: { abiertaEn: 'desc' }
  })

  if (!turno) return res.json({
    totalVentas: 0,
    totalEgresos: 0,
    ganancia: 0,
    numVentas: 0,
    numEgresos: 0,
    ventas: [],
    egresos: []
  })

  const ahora = new Date()

  const ventas = await prisma.venta.findMany({
    where: { creadoEn: { gte: turno.abiertaEn, lte: ahora } },
    include: { items: true },
    orderBy: { creadoEn: 'desc' }
  })

  const egresos = await prisma.egreso.findMany({
    where: { creadoEn: { gte: turno.abiertaEn, lte: ahora } },
    orderBy: { creadoEn: 'desc' }
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