import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Cocina() {
  const [pedidos, setPedidos] = useState([])

  const cargarPedidos = () => {
    api.get('/ventas/cocina').then(res => setPedidos(res.data))
  }

  useEffect(() => {
    cargarPedidos()
    const intervalo = setInterval(cargarPedidos, 5000)
    return () => clearInterval(intervalo)
  }, [])

  const cambiarEstado = async (id, estado) => {
    await api.patch(`/ventas/${id}/estado`, { estado })
    cargarPedidos()
  }

  const colores = {
    'pendiente': { bg: '#fff3e0', border: '#e65100', texto: '#e65100', label: 'Pendiente' },
    'en-preparacion': { bg: '#e3f2fd', border: '#1565c0', texto: '#1565c0', label: 'En preparación' },
  }

  return (
    <div style={{ padding: '1rem', background: '#111', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', margin: 0 }}>Cocina</h1>
        <span style={{ color: '#888', fontSize: '13px' }}>Actualiza cada 5 seg</span>
      </div>

      {pedidos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '60px', marginBottom: '1rem' }}>✅</div>
          <p style={{ color: '#888', fontSize: '18px' }}>No hay pedidos pendientes</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {pedidos.map(pedido => {
            const color = colores[pedido.estado]
            return (
              <div key={pedido.id} style={{ background: color.bg, borderRadius: '12px', border: `2px solid ${color.border}`, padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#333' }}>#{pedido.id}</span>
                  <span style={{ background: color.border, color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                    {color.label}
                  </span>
                </div>

                {pedido.nota && (
                  <div style={{ background: '#fff9c4', borderRadius: '8px', padding: '8px', marginBottom: '12px', fontSize: '13px', color: '#333' }}>
                    📝 {pedido.nota}
                  </div>
                )}

                <div style={{ marginBottom: '12px' }}>
                  {pedido.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.08)', fontSize: '15px', color: '#333' }}>
                      <span>{item.nombre}</span>
                      <span style={{ fontWeight: 'bold' }}>x{item.cantidad}</span>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                  {new Date(pedido.creadoEn).toLocaleTimeString('es-MX')}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {pedido.estado === 'pendiente' && (
                    <button
                      onClick={() => cambiarEstado(pedido.id, 'en-preparacion')}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#1565c0', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                      Iniciar
                    </button>
                  )}
                  {pedido.estado === 'en-preparacion' && (
                    <button
                      onClick={() => cambiarEstado(pedido.id, 'listo')}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#2e7d32', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                      Listo
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}