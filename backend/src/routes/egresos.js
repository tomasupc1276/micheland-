const express = require('express')
const router = express.Router()
const prisma = require('../db')

router.get('/', async (req, res) => {
  const turno = await prisma.turno.findFirst({
    where: { estado: 'abierto' },
    orderBy: { abiertaEn: 'desc' }
  })

  if (!turno) return res.json([])

  const egresos = await prisma.egreso.findMany({
    where: { creadoEn: { gte: turno.abiertaEn } },
    orderBy: { creadoEn: 'desc' }
  })
  res.json(egresos)
})

router.post('/', async (req, res) => {
  const { concepto, monto, categoria, turnoId } = req.body
  const egreso = await prisma.egreso.create({
    data: { concepto, monto, categoria, turnoId }
  })
  res.json(egreso)
})

module.exports = router