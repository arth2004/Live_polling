import React, { useState } from "react";
// import { Button } from './Button'
// import { Input } from './Input'
// import { useParams } from 'react-router-dom'
// import { useSocket } from '../sockets/SocketProvider'

export default function ChatBox({ chatLog, onSend }) {
  const [message, setMessage] = useState("");
  // const { sessionId } = useParams()
  // const socket = useSocket()

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Send chat message to server
    // socket.emit('chat:message', {
    //   sender: userName,
    //   message: message.trim(),
    //   sessionId
    // })

    onSend(message.trim());
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages list */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
        {chatLog.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          chatLog.map((msg, index) => (
            <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-sm text-brandPurple">
                  {msg.sender}
                </span>
                <span>
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-xs text-gray-400">{msg.message}</p>
            </div>
          ))
        )}
      </div>

      {/* Input form */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a Message..."
            className="flex-1 border-2 border-gray-200 rounded-1g px-4 py-2 focus: outline-none focus:border-[#7565D9] transition-colors"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-[#7565D9] text-white px-6 py-2 rounded-1g hover:bg-[#6554C8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
