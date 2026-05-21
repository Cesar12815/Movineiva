import { createContext, useContext, useState } from 'react'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [apiKey,        setApiKey]        = useState('')
  const [authenticated, setAuthenticated] = useState(false)

  const login  = (key) => { setApiKey(key); setAuthenticated(true) }
  const logout = ()    => { setApiKey('');  setAuthenticated(false) }

  return (
    <AdminContext.Provider value={{ apiKey, authenticated, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => useContext(AdminContext)
