const express = require('express')
const router = express.Router()
const prisma = require('../db')

router.get('/actual', async (req, res) => {
  const turno = await prisma.turno.findFirst({
    where: { estado: 'abierto' },
    orderBy: { abiertaEn: 'desc' }
  })
  res.json(turno)
})

router.post('/abrir', async (req, res) => {
  const turnoExistente = await prisma.turno.findFirst({
    where: { estado: 'abierto' }
  })
  if (turnoExistente) {
    return res.status(400).json({ error: 'Ya hay un turno abierto' })
  }
  const { fondoInicial } = req.body
  const turno = await prisma.turno.create({
    data: { fondoInicial: parseFloat(fondoInicial) || 0 }
  })
  res.json(turno)
})

router.post('/cerrar', async (req, res) => {
  const turno = await prisma.turno.findFirst({
    where: { estado: 'abierto' },
    orderBy: { abiertaEn: 'desc' }
  })
  if (!turno) {
    return res.status(400).json({ error: 'No hay turno abierto' })
  }

  const hoy = new Date(turno.abiertaEn)
  const ahora = new Date()

  const ventas = await prisma.venta.findMany({
    where: { creadoEn: { gte: hoy, lte: ahora } }
  })
  const egresos = await prisma.egreso.findMany({
    where: { creadoEn: { gte: hoy, lte: ahora } }
  })

  const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0)
  const totalEgresos = egresos.reduce((sum, e) => sum + e.monto, 0)
  const ganancia = totalVentas - totalEgresos
  const efectivoEsperado = turno.fondoInicial + totalVentas - totalEgresos

  const turnoCerrado = await prisma.turno.update({
    where: { id: turno.id },
    data: { cerradaEn: ahora, totalVentas, totalEgresos, ganancia, estado: 'cerrado' }
  })

  res.json({ ...turnoCerrado, efectivoEsperado })
})

module.exports = router