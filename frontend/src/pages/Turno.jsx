import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Turno() {
  const [turno, setTurno] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [fondoInicial, setFondoInicial] = useState('')

  const cargarTurno = () => {
    api.get('/turno/actual')
      .then(res => { setTurno(res.data); setCargando(false) })
      .catch(() => { setTurno(null); setCargando(false) })
  }

  useEffect(() => { cargarTurno() }, [])

  const abrirTurno = async () => {
    if (!fondoInicial || parseFloat(fondoInicial) < 0) {
      return alert('Ingresa el fondo inicial del día')
    }
    setProcesando(true)
    try {
      await api.post('/turno/abrir', { fondoInicial: parseFloat(fondoInicial) })
      cargarTurno()
    } catch (e) {
      alert(e.response?.data?.error || 'Error al abrir turno')
    }
    setProcesando(false)
  }

  const cerrarTurno = async () => {
    if (!confirm('¿Seguro que quieres cerrar el turno?')) return
    setProcesando(true)
    try {
      const res = await api.post('/turno/cerrar')
      alert(
        `Turno cerrado\n` +
        `Fondo inicial: $${res.data.fondoInicial}\n` +
        `Ventas: $${res.data.totalVentas}\n` +
        `Egresos: $${res.data.totalEgresos}\n` +
        `Ganancia: $${res.data.ganancia}\n` +
        `Efectivo esperado en caja: $${res.data.efectivoEsperado}`
      )
      setTurno(null)
      cargarTurno()
    } catch (e) {
      alert(e.response?.data?.error || 'Error al cerrar turno')
    }
    setProcesando(false)
  }

  if (cargando) return <p style={{ padding: '1rem' }}>Cargando...</p>

  return (
    <div style={{ padding: '1rem', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ color: '#333', marginBottom: '1rem' }}>Turno</h2>

      {!turno ? (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '60px', marginBottom: '1rem' }}>🔒</div>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>No hay turno abierto</p>

          <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
              Fondo inicial del día
            </label>
            <input
              type="number"
              value={fondoInicial}
              onChange={e => setFondoInicial(e.target.value)}
              placeholder="Ej: 500"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '8px', boxSizing: 'border-box', fontSize: '16px' }}
            />
            <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              Es el dinero con el que inicias la caja hoy
            </p>
          </div>

          <button
            onClick={abrirTurno}
            disabled={procesando}
            style={{ width: '100%', padding: '16px', borderRadius: '10px', border: 'none', background: '#2e7d32', color: '#fff', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
            {procesando ? 'Abriendo...' : 'Abrir turno'}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ background: '#e8f5e9', borderRadius: '10px', padding: '16px', marginBottom: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🟢</div>
            <div style={{ fontWeight: 'bold', color: '#2e7d32', fontSize: '16px' }}>Turno abierto</div>
            <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>
              Desde: {new Date(turno.abiertaEn).toLocaleString('es-MX')}
            </div>
            <div style={{ fontSize: '15px', color: '#2e7d32', fontWeight: 'bold', marginTop: '8px' }}>
              Fondo inicial: ${turno.fondoInicial}
            </div>
          </div>

          <button
            onClick={cerrarTurno}
            disabled={procesando}
            style={{ width: '100%', padding: '16px', borderRadius: '10px', border: 'none', background: '#e63946', color: '#fff', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
            {procesando ? 'Cerrando...' : 'Cerrar turno'}
          </button>
        </div>
      )}
    </div>
  )
}