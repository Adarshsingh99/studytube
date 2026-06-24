import { useEffect, useState } from 'react'

export function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem('studytube-theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('studytube-theme', dark ? 'dark' : 'light')
  }, [dark])

  return [dark, setDark]
}
