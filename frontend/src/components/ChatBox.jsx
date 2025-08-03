import React, { useState } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { useParams } from 'react-router-dom'
import { useSocket } from '../sockets/SocketProvider'

export default function ChatBox({ chatLog, userName }) {
  const [message, setMessage] = useState('')
  const { sessionId } = useParams()
  const socket = useSocket()

  const handleSubmit = e => {
    e.preventDefault()
    if (!message.trim()) return

    // Send chat message to server
    socket.emit('chat:message', {
      sender: userName,
      message: message.trim(),
      sessionId
    })

    setMessage('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages list */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {chatLog.map((msg, idx) => (
          <div key={idx} className="bg-muted p-2 rounded">
            <span className="font-semibold text-poll-text">{msg.sender}: </span>
            <span className="text-poll-text">{msg.message}</span>
          </div>
        ))}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  )
}
