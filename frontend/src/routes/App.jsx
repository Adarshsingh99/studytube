import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import LearningDetails from '../pages/LearningDetails.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import { useDarkMode } from '../hooks/useDarkMode.js'
import { useAuthStore } from '../store/authStore.js'

function Protected({ children }) {
  const token = useAuthStore((state) => state.token)
  return token ? children : <Navigate to="/login" replace />
}

function AppShell({ children }) {
  const [dark, setDark] = useDarkMode()
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="min-h-screen bg-skysoft text-slate-950 dark:bg-slate-950 dark:text-white">
      <Navbar dark={dark} setDark={setDark} onMenu={() => setMenuOpen(true)} />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Protected><AppShell><Dashboard /></AppShell></Protected>} />
        <Route path="/learning/:id" element={<Protected><AppShell><LearningDetails /></AppShell></Protected>} />
      </Routes>
    </BrowserRouter>
  )
}
