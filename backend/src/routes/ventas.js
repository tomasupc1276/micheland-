const express = require('express')
const router = express.Router()
const prisma = require('../db')

router.get('/', async (req, res) => {
  const ventas = await prisma.venta.findMany({
    include: { items: true },
    orderBy: { creadoEn: 'desc' }
  })
  res.json(ventas)
})

router.post('/', async (req, res) => {
  const { total, metodoPago, nota, items, turnoId } = req.body
  const venta = await prisma.venta.create({
    data: {
      total,
      metodoPago,
      nota,
      turnoId,
      items: {
        create: items
      }
    },
    include: { items: true }
  })
  res.json(venta)
})

module.exports = router