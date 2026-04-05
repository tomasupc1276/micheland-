import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Corte() {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    api.get('/corte').then(res => {
      setDatos(res.data)
      setCargando(false)
    })
  }, [])

  if (cargando) return <p style={{ padding: '1rem' }}>Cargando corte...</p>

  return (
    <div style={{ padding: '1rem', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ color: '#333', marginBottom: '1rem' }}>Corte del día</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
        <div style={{ background: '#e8f5e9', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '13px', color: '#2e7d32', fontWeight: 'bold' }}>Ventas</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>${datos.totalVentas}</div>
          <div style={{ fontSize: '12px', color: '#555' }}>{datos.numVentas} pedidos</div>
        </div>
        <div style={{ background: '#ffebee', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '13px', color: '#c62828', fontWeight: 'bold' }}>Egresos</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c62828' }}>${datos.totalEgresos}</div>
          <div style={{ fontSize: '12px', color: '#555' }}>{datos.numEgresos} gastos</div>
        </div>
      </div>

      <div style={{
        background: datos.ganancia >= 0 ? '#e8f5e9' : '#ffebee',
        borderRadius: '10px', padding: '20px', marginBottom: '1.5rem', textAlign: 'center'
      }}>
        <div style={{ fontSize: '14px', color: '#555', fontWeight: 'bold' }}>Ganancia del día</div>
        <div style={{
          fontSize: '36px', fontWeight: 'bold',
          color: datos.ganancia >= 0 ? '#2e7d32' : '#c62828'
        }}>
          ${datos.ganancia}
        </div>
      </div>

      <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Ventas de hoy</h3>
      {datos.ventas.length === 0 ? (
        <p style={{ color: '#666', fontSize: '14px' }}>No hay ventas hoy.</p>
      ) : (
        datos.ventas.map(v => (
          <div key={v.id} style={{ background: '#f9f9f9', borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold', color: '#333' }}>#{v.id}</span>
              <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>${v.total}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              {v.metodoPago} — {new Date(v.creadoEn).toLocaleString('es-MX')}
            </div>
          </div>
        ))
      )}

      <h3 style={{ color: '#333', margin: '1rem 0 0.5rem' }}>Egresos de hoy</h3>
      {datos.egresos.length === 0 ? (
        <p style={{ color: '#666', fontSize: '14px' }}>No hay egresos hoy.</p>
      ) : (
        datos.egresos.map(e => (
          <div key={e.id} style={{ background: '#f9f9f9', borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold', color: '#333' }}>{e.concepto}</span>
              <span style={{ color: '#c62828', fontWeight: 'bold' }}>-${e.monto}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>{e.categoria}</div>
          </div>
        ))
      )}
    </div>
  )
}