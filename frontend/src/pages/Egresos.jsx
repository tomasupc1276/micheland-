import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Egresos() {
  const [egresos, setEgresos] = useState([])
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [categoria, setCategoria] = useState('insumos')
  const [enviando, setEnviando] = useState(false)
  const [vista, setVista] = useState('nuevo')
  const [turno, setTurno] = useState(null)
  const [cargandoTurno, setCargandoTurno] = useState(true)

  useEffect(() => {
    api.get('/turno/actual')
      .then(res => { setTurno(res.data); setCargandoTurno(false) })
      .catch(() => { setTurno(null); setCargandoTurno(false) })
  }, [])

  useEffect(() => {
    if (vista === 'historial') {
      api.get('/egresos').then(res => setEgresos(res.data))
    }
  }, [vista])

  const registrarEgreso = async () => {
    if (!concepto) return alert('Escribe un concepto')
    if (!monto || monto <= 0) return alert('Escribe un monto válido')
    setEnviando(true)
    try {
      await api.post('/egresos', {
        concepto,
        monto: parseFloat(monto),
        categoria
      })
      setConcepto('')
      setMonto('')
      setCategoria('insumos')
      alert('Egreso registrado')
    } catch (e) {
      alert('Error al registrar el egreso')
    }
    setEnviando(false)
  }

  const categorias = [
    { value: 'insumos', label: 'Insumos' },
    { value: 'renta', label: 'Renta' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'nomina', label: 'Nómina' },
    { value: 'general', label: 'General' },
  ]

  if (cargandoTurno) return <p style={{ padding: '1rem' }}>Cargando...</p>

  if (!turno) return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '50px', marginBottom: '1rem' }}>🔒</div>
      <p style={{ color: '#666', fontSize: '16px' }}>No hay turno abierto.</p>
      <p style={{ color: '#999', fontSize: '14px' }}>Ve a la pestaña Turno para abrir uno.</p>
    </div>
  )

  return (
    <div style={{ padding: '1rem', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
        <button onClick={() => setVista('nuevo')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: vista === 'nuevo' ? '#e63946' : '#eee', color: vista === 'nuevo' ? '#fff' : '#333', fontWeight: 'bold', cursor: 'pointer' }}>
          Nuevo egreso
        </button>
        <button onClick={() => setVista('historial')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: vista === 'historial' ? '#e63946' : '#eee', color: vista === 'historial' ? '#fff' : '#333', fontWeight: 'bold', cursor: 'pointer' }}>
          Historial
        </button>
      </div>

      {vista === 'nuevo' && (
        <div style={{ background: '#f9f9f9', borderRadius: '10px', padding: '16px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Concepto</label>
            <input type="text" value={concepto} onChange={e => setConcepto(e.target.value)} placeholder="Ej: Cervezas, limones, sal..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '4px', boxSizing: 'border-box', fontSize: '14px' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Monto</label>
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="$0.00" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '4px', boxSizing: 'border-box', fontSize: '14px' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Categoría</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
              {categorias.map(cat => (
                <button key={cat.value} onClick={() => setCategoria(cat.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', background: categoria === cat.value ? '#e63946' : '#fff', color: categoria === cat.value ? '#fff' : '#333', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={registrarEgreso} disabled={enviando} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: '#e63946', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            {enviando ? 'Registrando...' : 'Registrar egreso'}
          </button>
        </div>
      )}

      {vista === 'historial' && (
        <>
          <h2 style={{ marginBottom: '0.5rem', color: '#333' }}>Historial de egresos</h2>
          {egresos.length === 0 ? (
            <p style={{ color: '#666' }}>No hay egresos registrados aún.</p>
          ) : (
            egresos.map(e => (
              <div key={e.id} style={{ background: '#f9f9f9', borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', color: '#333' }}>{e.concepto}</span>
                  <span style={{ color: '#e63946', fontWeight: 'bold' }}>-${e.monto}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                  {e.categoria} — {new Date(e.creadoEn).toLocaleString('es-MX')}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}