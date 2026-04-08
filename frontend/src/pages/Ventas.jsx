import { useState, useEffect } from 'react'
import api from '../api/axios'
import productos from '../data/productos'

export default function Ventas() {
  const [ventas, setVentas] = useState([])
  const [carrito, setCarrito] = useState([])
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [nota, setNota] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [vista, setVista] = useState('nueva')
  const [turno, setTurno] = useState(null)
  const [cargandoTurno, setCargandoTurno] = useState(true)

  useEffect(() => {
    api.get('/turno/actual')
      .then(res => { setTurno(res.data); setCargandoTurno(false) })
      .catch(() => { setTurno(null); setCargandoTurno(false) })
  }, [])

  useEffect(() => {
    if (vista === 'historial') {
      api.get('/ventas').then(res => setVentas(res.data))
    }
  }, [vista])

  const agregarProducto = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.id === producto.id)
      if (existe) {
        return prev.map(p => p.id === producto.id
          ? { ...p, cantidad: p.cantidad + 1 } : p)
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }

  const quitarProducto = (id) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.id === id)
      if (existe.cantidad === 1) return prev.filter(p => p.id !== id)
      return prev.map(p => p.id === id ? { ...p, cantidad: p.cantidad - 1 } : p)
    })
  }

  const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0)

  const registrarVenta = async () => {
    if (carrito.length === 0) return alert('Agrega al menos un producto')
    setEnviando(true)
    try {
      await api.post('/ventas', {
        total, metodoPago, nota,
        items: carrito.map(p => ({ nombre: p.nombre, precio: p.precio, cantidad: p.cantidad }))
      })
      setCarrito([])
      setNota('')
      setMetodoPago('efectivo')
      alert('Venta registrada')
    } catch (e) {
      alert('Error al registrar la venta')
    }
    setEnviando(false)
  }

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
        <button onClick={() => setVista('nueva')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: vista === 'nueva' ? '#e63946' : '#eee', color: vista === 'nueva' ? '#fff' : '#333', fontWeight: 'bold', cursor: 'pointer' }}>Nueva venta</button>
        <button onClick={() => setVista('historial')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: vista === 'historial' ? '#e63946' : '#eee', color: vista === 'historial' ? '#fff' : '#333', fontWeight: 'bold', cursor: 'pointer' }}>Historial</button>
      </div>

      {vista === 'nueva' && (
        <>
          <h2 style={{ marginBottom: '0.5rem', color: '#333' }}>Productos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
            {productos.map(p => (
              <button key={p.id} onClick={() => agregarProducto(p)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', textAlign: 'left', color: '#333' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{p.nombre}</div>
                <div style={{ color: '#e63946', fontSize: '13px' }}>${p.precio}</div>
              </button>
            ))}
          </div>

          {carrito.length > 0 && (
            <>
              <h2 style={{ marginBottom: '0.5rem', color: '#333' }}>Pedido</h2>
              <div style={{ background: '#f9f9f9', borderRadius: '10px', padding: '12px', marginBottom: '1rem' }}>
                {carrito.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#333' }}>{p.nombre}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => quitarProducto(p.id)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#e63946', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>-</button>
                      <span style={{ fontWeight: 'bold', color: '#333' }}>{p.cantidad}</span>
                      <button onClick={() => agregarProducto(p)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#e63946', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
                      <span style={{ minWidth: '60px', textAlign: 'right', fontSize: '14px', color: '#333' }}>${p.precio * p.cantidad}</span>
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span style={{ color: '#333' }}>Total</span>
                  <span style={{ color: '#e63946' }}>${total}</span>
                </div>
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Método de pago</label>
                <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '4px' }}>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Nota (opcional)</label>
                <input type="text" value={nota} onChange={e => setNota(e.target.value)} placeholder="Ej: sin chile, extra limón..." style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '4px', boxSizing: 'border-box' }} />
              </div>

              <button onClick={registrarVenta} disabled={enviando} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: '#e63946', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                {enviando ? 'Registrando...' : `Registrar venta — $${total}`}
              </button>
            </>
          )}
        </>
      )}

      {vista === 'historial' && (
        <>
          <h2 style={{ marginBottom: '0.5rem', color: '#333' }}>Historial de ventas</h2>
          {ventas.length === 0 ? (
            <p style={{ color: '#666' }}>No hay ventas registradas aún.</p>
          ) : (
            ventas.map(v => (
              <div key={v.id} style={{ background: '#f9f9f9', borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', color: '#333' }}>#{v.id}</span>
                  <span style={{ color: '#e63946', fontWeight: 'bold' }}>${v.total}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>{v.metodoPago} — {new Date(v.creadoEn).toLocaleString('es-MX')}</div>
                {v.items.map(item => (
                  <div key={item.id} style={{ fontSize: '13px', color: '#444', marginTop: '4px' }}>
                    {item.cantidad}x {item.nombre} — ${item.precio * item.cantidad}
                  </div>
                ))}
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}