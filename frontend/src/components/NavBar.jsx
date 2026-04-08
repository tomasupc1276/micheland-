import { Link, useLocation } from 'react-router-dom'

export default function NavBar() {
  const location = useLocation()

  const links = [
    { to: '/', label: 'Turno', icon: '🔑' },
    { to: '/ventas', label: 'Ventas', icon: '🧾' },
    { to: '/egresos', label: 'Egresos', icon: '💸' },
    { to: '/corte', label: 'Corte', icon: '📊' },
    { to: '/cocina', label: 'Cocina', icon: '👨‍🍳' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#fff',
      borderTop: '1px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '10px 0',
      zIndex: 1000
    }}>
      {links.map(link => (
        <Link
          key={link.to}
          to={link.to}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: location.pathname === link.to ? '#e63946' : '#888',
            fontSize: '12px',
            gap: '4px'
          }}
        >
          <span style={{ fontSize: '22px' }}>{link.icon}</span>
          {link.label}
        </Link>
      ))}
    </nav>
  )
}