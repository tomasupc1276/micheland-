const express = require('express')
const cors = require('cors')
require('dotenv').config()

const ventasRouter = require('./routes/ventas')
const egresosRouter = require('./routes/egresos')
const corteRouter = require('./routes/corte')
const turnoRouter = require('./routes/turno')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Micheland funcionando' })
})

app.use('/api/ventas', ventasRouter)
app.use('/api/egresos', egresosRouter)
app.use('/api/corte', corteRouter)
app.use('/api/turno', turnoRouter)

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})