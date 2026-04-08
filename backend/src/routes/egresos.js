const express = require('express')
const router = express.Router()
const prisma = require('../db')

router.get('/', async (req, res) => {
  const egresos = await prisma.egreso.findMany({
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