import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

// 1️⃣ Create the Context
const SocketContext = createContext(null)

// 2️⃣ Provider component
export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    // connect once on mount
    const s = io()  // thanks to Vite proxy, this hits your backend at ws://localhost:3001
    setSocket(s)

    // clean up on unmount
    return () => {
      s.disconnect()
    }
  }, [])

  // while socket is null you might show a loader, etc.
  if (!socket) return null

  // provide the socket instance to all descendants
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

// 3️⃣ Hook to consume it
export function useSocket() {
  const socket = useContext(SocketContext)
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return socket
}
