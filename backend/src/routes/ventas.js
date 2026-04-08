const express = require('express')
const router = express.Router()
const prisma = require('../db')

router.get('/', async (req, res) => {
  const turno = await prisma.turno.findFirst({
    where: { estado: 'abierto' },
    orderBy: { abiertaEn: 'desc' }
  })

  if (!turno) return res.json([])

  const ventas = await prisma.venta.findMany({
    where: { creadoEn: { gte: turno.abiertaEn } },
    include: { items: true },
    orderBy: { creadoEn: 'desc' }
  })
  res.json(ventas)
})

router.get('/cocina', async (req, res) => {
  const turno = await prisma.turno.findFirst({
    where: { estado: 'abierto' },
    orderBy: { abiertaEn: 'desc' }
  })

  if (!turno) return res.json([])

  const ventas = await prisma.venta.findMany({
    where: {
      estado: { in: ['pendiente', 'en-preparacion'] },
      creadoEn: { gte: turno.abiertaEn }
    },
    include: { items: true },
    orderBy: { creadoEn: 'asc' }
  })
  res.json(ventas)
})

router.post('/', async (req, res) => {
  const { total, metodoPago, nota, items } = req.body
  const venta = await prisma.venta.create({
    data: {
      total,
      metodoPago,
      nota,
      estado: 'pendiente',
      items: { create: items }
    },
    include: { items: true }
  })
  res.json(venta)
})

router.patch('/:id/estado', async (req, res) => {
  const { estado } = req.body
  const venta = await prisma.venta.update({
    where: { id: parseInt(req.params.id) },
    data: { estado },
    include: { items: true }
  })
  res.json(venta)
})

module.exports = router