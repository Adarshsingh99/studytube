import { LogOut, Menu, Moon, Sun, Youtube } from 'lucide-react'
import { useAuthStore } from '../store/authStore.js'

export default function Navbar({ dark, setDark, onMenu }) {
  const { user, logout } = useAuthStore()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="focus-ring rounded-md p-2 lg:hidden" onClick={onMenu} aria-label="Open menu"><Menu size={20} /></button>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-coral text-white"><Youtube size={22} /></div>
          <span className="text-xl font-black tracking-normal text-slate-950 dark:text-white">StudyTube</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">{user?.name}</span>
          <button className="focus-ring rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => setDark(!dark)} aria-label="Toggle dark mode">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user && (
            <button className="focus-ring rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" onClick={logout} aria-label="Log out">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
