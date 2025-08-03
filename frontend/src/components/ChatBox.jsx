import React, { useState } from 'react'

export default function ChatBox({ chatLog, onSend }) {
  const [message, setMessage] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    if (!message.trim()) return

    // Use the onSend prop function
    onSend(message.trim())
    setMessage('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages list */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
        {chatLog.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          chatLog.map((msg, idx) => (
            <div key={idx} className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-[#7565D9] text-sm">{msg.sender}</span>
                <span className="text-xs text-gray-400">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-gray-700">{msg.message}</p>
            </div>
          ))
        )}
      </div>

      {/* Input form */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#7565D9] transition-colors"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <button 
            type="submit"
            disabled={!message.trim()}
            className="bg-[#7565D9] text-white px-6 py-2 rounded-lg hover:bg-[#6554C8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
