import { useState, useEffect } from 'react'
import api from '../api/axios'
import productos from '../data/productos'

const adicionales = [
  { id: 'ginger', nombre: 'Ginger', precio: 0 },
  { id: 'soda', nombre: 'Soda', precio: 0 },
  { id: 'coronita', nombre: 'Coronita', precio: 1000 },
]

export default function Ventas() {
  const [ventas, setVentas] = useState([])
  const [carrito, setCarrito] = useState([])
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [nota, setNota] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [vista, setVista] = useState('nueva')
  const [turno, setTurno] = useState(null)
  const [cargandoTurno, setCargandoTurno] = useState(true)
  const [modalProducto, setModalProducto] = useState(null)
  const [notaModal, setNotaModal] = useState('')
  const [busqueda, setBusqueda] = useState('')

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

  const seleccionarProducto = (producto) => {
    if (producto.sinAdicional || producto.categoria === 'adicional') {
      agregarAlCarrito(producto, null)
    } else {
      setModalProducto(producto)
    }
  }

  const agregarAlCarrito = (producto, adicional, nota = '') => {
    const nombre = adicional
      ? `${producto.nombre} + ${adicional.nombre}`
      : producto.nombre

    const precio = adicional?.id === 'coronita'
      ? (producto.precioCoronita || producto.precio + 1000)
      : producto.precio

    const id = adicional
      ? `${producto.id}-${adicional.id}`
      : `${producto.id}`

    setCarrito(prev => {
      const existe = prev.find(p => p.id === id && p.nota === nota)
      if (existe) {
        return prev.map(p => p.id === id && p.nota === nota
          ? { ...p, cantidad: p.cantidad + 1 }
          : p)
      }
      return [...prev, { id, nombre, precio, cantidad: 1, nota }]
    })
    setNotaModal('')
    setModalProducto(null)
  }

  const quitarProducto = (id, nota = '') => {
    setCarrito(prev => {
      const existe = prev.find(p => p.id === id && p.nota === nota)
      if (existe.cantidad === 1) return prev.filter(p => !(p.id === id && p.nota === nota))
      return prev.map(p => p.id === id && p.nota === nota
        ? { ...p, cantidad: p.cantidad - 1 }
        : p)
    })
  }
  const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0)

  const registrarVenta = async () => {
    if (carrito.length === 0) return alert('Agrega al menos un producto')
    setEnviando(true)
    try {
      await api.post('/ventas', {
        total, metodoPago, nota,
        items: carrito.map(p => ({ nombre: p.nombre, precio: p.precio, cantidad: p.cantidad, nota: p.nota || '' }))
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
      {modalProducto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '360px' }}>
            <h3 style={{ margin: '0 0 8px', color: '#333' }}>{modalProducto.nombre}</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>¿Con qué la acompañas?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {adicionales.map(adicional => {
                const precioFinal = adicional.id === 'coronita'
                  ? (modalProducto.precioCoronita || modalProducto.precio + 1000)
                  : modalProducto.precio
                const diferencia = precioFinal - modalProducto.precio

                return (
                  <button
                    key={adicional.id}
                    onClick={() => agregarAlCarrito(modalProducto, adicional, notaModal)}
                    style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>{adicional.nombre}</span>
                    <span style={{ color: '#e63946', fontSize: '13px' }}>
                      {diferencia > 0
                        ? `+$${diferencia.toLocaleString('es-CO')} → $${precioFinal.toLocaleString('es-CO')}`
                        : `$${precioFinal.toLocaleString('es-CO')}`}
                    </span>
                  </button>
                )
              })}
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Nota (opcional)</label>
              <input
                type="text"
                value={notaModal}
                onChange={e => setNotaModal(e.target.value)}
                placeholder="Ej: sin chile, extra limón..."
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '6px', boxSizing: 'border-box', fontSize: '14px' }}
              />
            </div>

            <button
              onClick={() => { setModalProducto(null); setNotaModal('') }}
              style={{ width: '100%', marginTop: '12px', padding: '10px', borderRadius: '8px', border: 'none', background: '#eee', color: '#333', fontWeight: 'bold', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
        <button onClick={() => setVista('nueva')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: vista === 'nueva' ? '#e63946' : '#eee', color: vista === 'nueva' ? '#fff' : '#333', fontWeight: 'bold', cursor: 'pointer' }}>Nueva venta</button>
        <button onClick={() => setVista('historial')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: vista === 'historial' ? '#e63946' : '#eee', color: vista === 'historial' ? '#fff' : '#333', fontWeight: 'bold', cursor: 'pointer' }}>Historial</button>
      </div>

      {vista === 'nueva' && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar producto..."
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' }}
            />
          </div>

          {[
            { key: 'gaseosa', label: 'Micheladas con gaseosa' },
            { key: 'cerveza', label: 'Micheladas con cerveza' },
            { key: 'adicional', label: 'Adicionales' },
          ].map(cat => {
            const productosFiltrados = productos.filter(p =>
              p.categoria === cat.key &&
              p.nombre.toLowerCase().includes(busqueda.toLowerCase())
            )
            if (productosFiltrados.length === 0) return null
            return (
              <div key={cat.key} style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ marginBottom: '0.5rem', color: '#333', fontSize: '15px', borderBottom: '2px solid #e63946', paddingBottom: '4px' }}>
                  {cat.label}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {productosFiltrados.map(p => (
                    <button key={p.id} onClick={() => seleccionarProducto(p)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', textAlign: 'left', color: '#333' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{p.nombre}</div>
                      <div style={{ color: '#e63946', fontSize: '13px' }}>${p.precio.toLocaleString('es-CO')}</div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

          {carrito.length > 0 && (
            <>
              <h2 style={{ marginBottom: '0.5rem', color: '#333' }}>Pedido</h2>
              <div style={{ background: '#f9f9f9', borderRadius: '10px', padding: '12px', marginBottom: '1rem' }}>
                {carrito.map(p => (
                  <div key={p.id + p.nota} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '13px', color: '#333' }}>{p.nombre}</span>
                      {p.nota && <div style={{ fontSize: '11px', color: '#e63946', marginTop: '2px' }}>📝 {p.nota}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button onClick={() => quitarProducto(p.id, p.nota)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#e63946', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>-</button>
                      <span style={{ fontWeight: 'bold', color: '#333' }}>{p.cantidad}</span>
                      <button onClick={() => agregarAlCarrito(p, null, p.nota)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#e63946', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
                      <span style={{ minWidth: '65px', textAlign: 'right', fontSize: '13px', color: '#333' }}>${(p.precio * p.cantidad).toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span style={{ color: '#333' }}>Total</span>
                  <span style={{ color: '#e63946' }}>${total.toLocaleString('es-CO')}</span>
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
                {enviando ? 'Registrando...' : `Registrar venta — $${total.toLocaleString('es-CO')}`}
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
                  <span style={{ color: '#e63946', fontWeight: 'bold' }}>${v.total.toLocaleString('es-CO')}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>{v.metodoPago} — {new Date(v.creadoEn).toLocaleString('es-MX')}</div>
                {v.items.map(item => (
                  <div key={item.id} style={{ fontSize: '13px', color: '#444', marginTop: '4px' }}>
                    {item.cantidad}x {item.nombre} — ${(item.precio * item.cantidad).toLocaleString('es-CO')}
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