import { useState, useEffect } from 'react'
import api from '../api/axios'
import productos from '../data/productos'

const adicionales = [
  { id: 'ginger', nombre: 'Ginger', precio: 0 },
  { id: 'soda', nombre: 'Soda', precio: 0 },
  { id: 'coronita', nombre: 'Coronita', precio: 1000 },
]

export default function Mesas() {
  const [mesas, setMesas] = useState([])
  const [turno, setTurno] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [mesaActiva, setMesaActiva] = useState(null)
  const [modalProducto, setModalProducto] = useState(null)
  const [notaModal, setNotaModal] = useState('')
  const [carrito, setCarrito] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [procesando, setProcesando] = useState(false)

  const cargarMesas = () => {
    api.get('/mesas').then(res => setMesas(res.data))
  }

  useEffect(() => {
    api.get('/turno/actual')
      .then(res => { setTurno(res.data); setCargando(false) })
      .catch(() => { setTurno(null); setCargando(false) })
    cargarMesas()
  }, [])

  const abrirMesa = async () => {
    const numero = prompt('¿Qué número de mesa?')
    if (!numero) return
    try {
      const res = await api.post('/mesas', { numero })
      cargarMesas()
      setMesaActiva(res.data)
      setCarrito([])
    } catch (e) {
      alert(e.response?.data?.error || 'Error al abrir mesa')
    }
  }

  const seleccionarProducto = (producto) => {
    if (producto.sinAdicional || producto.categoria === 'adicional') {
      agregarAlCarrito(producto, null, '')
    } else {
      setModalProducto(producto)
    }
  }

  const agregarAlCarrito = (producto, adicional, notaItem = '') => {
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
      const existe = prev.find(p => p.id === id && p.nota === notaItem)
      if (existe) {
        return prev.map(p => p.id === id && p.nota === notaItem
          ? { ...p, cantidad: p.cantidad + 1 } : p)
      }
      return [...prev, { id, nombre, precio, cantidad: 1, nota: notaItem }]
    })
    setNotaModal('')
    setModalProducto(null)
  }

  const quitarProducto = (id, nota = '') => {
    setCarrito(prev => {
      const existe = prev.find(p => p.id === id && p.nota === nota)
      if (existe.cantidad === 1) return prev.filter(p => !(p.id === id && p.nota === nota))
      return prev.map(p => p.id === id && p.nota === nota
        ? { ...p, cantidad: p.cantidad - 1 } : p)
    })
  }

  const agregarPedido = async () => {
    if (carrito.length === 0) return alert('Agrega al menos un producto')
    setProcesando(true)
    try {
      await api.post(`/mesas/${mesaActiva.id}/agregar`, {
        items: carrito.map(p => ({ nombre: p.nombre, precio: p.precio, cantidad: p.cantidad, nota: p.nota || '' }))
      })
      setCarrito([])
      cargarMesas()
      const mesaActualizada = await api.get('/mesas')
      const mesa = mesaActualizada.data.find(m => m.id === mesaActiva.id)
      if (mesa) setMesaActiva(mesa)
      alert('Pedido agregado')
    } catch (e) {
      alert('Error al agregar pedido')
    }
    setProcesando(false)
  }

  const cobrarMesa = async () => {
    const metodoPago = prompt('Método de pago: efectivo, transferencia o tarjeta') || 'efectivo'
    if (!confirm(`¿Cobrar mesa ${mesaActiva.numero}?`)) return
    setProcesando(true)
    try {
      const res = await api.post(`/mesas/${mesaActiva.id}/cobrar`, { metodoPago })
      alert(`Mesa ${mesaActiva.numero} cobrada\nTotal: $${res.data.total.toLocaleString('es-CO')}`)
      setMesaActiva(null)
      setCarrito([])
      cargarMesas()
    } catch (e) {
      alert('Error al cobrar mesa')
    }
    setProcesando(false)
  }

  const totalCarrito = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0)
  const totalMesa = mesaActiva?.ventas?.reduce((sum, v) => sum + v.total, 0) || 0

  if (cargando) return <p style={{ padding: '1rem' }}>Cargando...</p>

  if (!turno) return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '50px', marginBottom: '1rem' }}>🔒</div>
      <p style={{ color: '#666', fontSize: '16px' }}>No hay turno abierto.</p>
    </div>
  )

  if (mesaActiva) return (
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
                  <button key={adicional.id} onClick={() => agregarAlCarrito(modalProducto, adicional, notaModal)}
                    style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>{adicional.nombre}</span>
                    <span style={{ color: '#e63946', fontSize: '13px' }}>
                      {diferencia > 0 ? `+$${diferencia.toLocaleString('es-CO')} → $${precioFinal.toLocaleString('es-CO')}` : `$${precioFinal.toLocaleString('es-CO')}`}
                    </span>
                  </button>
                )
              })}
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Nota (opcional)</label>
              <input type="text" value={notaModal} onChange={e => setNotaModal(e.target.value)} placeholder="Ej: sin chile..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '6px', boxSizing: 'border-box', fontSize: '14px' }} />
            </div>
            <button onClick={() => { setModalProducto(null); setNotaModal('') }} style={{ width: '100%', marginTop: '12px', padding: '10px', borderRadius: '8px', border: 'none', background: '#eee', color: '#333', fontWeight: 'bold', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ color: '#333', margin: 0 }}>Mesa {mesaActiva.numero}</h2>
        <button onClick={() => { setMesaActiva(null); setCarrito([]) }} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', color: '#333', cursor: 'pointer', fontSize: '13px' }}>
          Volver
        </button>
      </div>

      {mesaActiva.ventas?.length > 0 && (
        <div style={{ background: '#f9f9f9', borderRadius: '10px', padding: '12px', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '8px', fontSize: '14px' }}>Pedidos anteriores</div>
          {mesaActiva.ventas.map(v => (
            <div key={v.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px' }}>
              {v.items.map(item => (
                <div key={item.id} style={{ fontSize: '13px', color: '#444', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.cantidad}x {item.nombre}{item.nota ? ` (${item.nota})` : ''}</span>
                  <span>${(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
                </div>
              ))}
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#2e7d32' }}>
            <span>Total acumulado</span>
            <span>${totalMesa.toLocaleString('es-CO')}</span>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar producto..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' }} />
      </div>

      {[
        { key: 'premium', label: 'Micheladas premium' },
        { key: 'basica', label: 'Micheladas básicas' },
        { key: 'adicional', label: 'Adicionales' },
      ].map(cat => {
        const filtrados = productos.filter(p => p.categoria === cat.key && p.nombre.toLowerCase().startsWith(busqueda.toLowerCase()))
        if (filtrados.length === 0) return null
        return (
          <div key={cat.key} style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ marginBottom: '0.5rem', color: '#333', fontSize: '15px', borderBottom: '2px solid #e63946', paddingBottom: '4px' }}>{cat.label}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {filtrados.map(p => (
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
          <h2 style={{ marginBottom: '0.5rem', color: '#333' }}>Nuevo pedido</h2>
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
              <span style={{ color: '#333' }}>Subtotal</span>
              <span style={{ color: '#e63946' }}>${totalCarrito.toLocaleString('es-CO')}</span>
            </div>
          </div>
          <button onClick={agregarPedido} disabled={procesando} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: '#1565c0', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' }}>
            {procesando ? 'Agregando...' : `Agregar pedido — $${totalCarrito.toLocaleString('es-CO')}`}
          </button>
        </>
      )}

      {totalMesa > 0 && (
        <button onClick={cobrarMesa} disabled={procesando} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: '#2e7d32', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          Cobrar mesa — ${(totalMesa + totalCarrito).toLocaleString('es-CO')}
        </button>
      )}
    </div>
  )

  return (
    <div style={{ padding: '1rem', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ color: '#333', margin: 0 }}>Mesas</h2>
        <button onClick={abrirMesa} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#e63946', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          + Nueva mesa
        </button>
      </div>

      {mesas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '50px', marginBottom: '1rem' }}>🪑</div>
          <p style={{ color: '#666' }}>No hay mesas abiertas</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {mesas.map(mesa => {
            const total = mesa.ventas.reduce((sum, v) => sum + v.total, 0)
            return (
              <button key={mesa.id} onClick={() => { setMesaActiva(mesa); setCarrito([]) }}
                style={{ padding: '20px', borderRadius: '12px', border: '2px solid #e63946', background: '#fff', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>Mesa {mesa.numero}</div>
                <div style={{ fontSize: '14px', color: '#2e7d32', fontWeight: 'bold', marginTop: '4px' }}>${total.toLocaleString('es-CO')}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{mesa.ventas.length} pedido{mesa.ventas.length !== 1 ? 's' : ''}</div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}