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
      <Routes>
        <Route path="/cocina" element={<Cocina />} />
        <Route path="/" element={<div style={{ paddingBottom: '70px' }}><Turno /><NavBar /></div>} />
        <Route path="/ventas" element={<div style={{ paddingBottom: '70px' }}><Ventas /><NavBar /></div>} />
        <Route path="/egresos" element={<div style={{ paddingBottom: '70px' }}><Egresos /><NavBar /></div>} />
        <Route path="/corte" element={<div style={{ paddingBottom: '70px' }}><Corte /><NavBar /></div>} />
      </Routes>
    </BrowserRouter>
  )
}