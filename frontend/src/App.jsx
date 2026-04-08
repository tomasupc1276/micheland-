import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Ventas from './pages/Ventas'
import Egresos from './pages/Egresos'
import Corte from './pages/Corte'
import Turno from './pages/Turno'
import Cocina from './pages/Cocina'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ paddingBottom: '70px' }}>
        <Routes>
          <Route path="/" element={<Turno />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/egresos" element={<Egresos />} />
          <Route path="/corte" element={<Corte />} />
          <Route path="/cocina" element={<Cocina />} />
        </Routes>
      </div>
      <NavBar />
    </BrowserRouter>
  )
}