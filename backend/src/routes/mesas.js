const express = require('express')
const router = express.Router()
const prisma = require('../db')

router.get('/', async (req, res) => {
  const mesas = await prisma.mesa.findMany({
    where: { estado: 'abierta' },
    include: {
      ventas: {
        include: { items: true }
      }
    },
    orderBy: { numero: 'asc' }
  })
  res.json(mesas)
})

router.post('/', async (req, res) => {
  const { numero } = req.body
  const existente = await prisma.mesa.findFirst({
    where: { numero: parseInt(numero), estado: 'abierta' }
  })
  if (existente) {
    return res.status(400).json({ error: `La mesa ${numero} ya está abierta` })
  }
  const mesa = await prisma.mesa.create({
    data: { numero: parseInt(numero) }
  })
  res.json(mesa)
})

router.post('/:id/agregar', async (req, res) => {
  const { items, nota } = req.body
  const mesa = await prisma.mesa.findUnique({
    where: { id: parseInt(req.params.id) }
  })
  if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' })

  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)

  const venta = await prisma.venta.create({
    data: {
      total,
      nota,
      mesaId: mesa.id,
      items: { create: items }
    },
    include: { items: true }
  })
  res.json(venta)
})

router.post('/:id/cobrar', async (req, res) => {
  const { metodoPago } = req.body
  const mesa = await prisma.mesa.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { ventas: { include: { items: true } } }
  })
  if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' })

  const total = mesa.ventas.reduce((sum, v) => sum + v.total, 0)

  await prisma.venta.updateMany({
    where: { mesaId: mesa.id },
    data: { metodoPago, estado: 'listo' }
  })

  await prisma.mesa.update({
    where: { id: mesa.id },
    data: { estado: 'cerrada' }
  })

  res.json({ total, metodoPago })
})

router.delete('/:id', async (req, res) => {
  await prisma.mesa.update({
    where: { id: parseInt(req.params.id) },
    data: { estado: 'cerrada' }
  })
  res.json({ ok: true })
})

router.delete('/:mesaId/items/:itemId', async (req, res) => {
  const item = await prisma.itemVenta.findUnique({
    where: { id: parseInt(req.params.itemId) },
    include: { venta: true }
  })

  if (!item) return res.status(404).json({ error: 'Item no encontrado' })

  await prisma.itemVenta.delete({
    where: { id: parseInt(req.params.itemId) }
  })

  await prisma.venta.update({
    where: { id: item.ventaId },
    data: { total: { decrement: item.precio * item.cantidad } }
  })

  res.json({ ok: true })
})

module.exports = router