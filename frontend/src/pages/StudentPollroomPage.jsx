import React, { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useSocket } from '../sockets/SocketProvider'
import ChatBox from '../components/ChatBox'

export default function StudentPollRoomPage({ userName }) {
  const { sessionId } = useParams()
  const socket = useSocket()

  const [question, setQuestion] = useState('')
  const [options, setOptions]   = useState([])       // [ text strings ]
  const [answers, setAnswers]   = useState({})       // { [text]: count }
  const [hasAnswered, setAnswered] = useState(false)
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [remaining, setRemaining] = useState(null)
  const timerRef = useRef(null)

  // chat & participants
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tab, setTab] = useState('chat')
  const [chatLog, setChatLog] = useState([])
  const [participants, setParticipants] = useState([])

  useEffect(() => {
    socket.emit('student:join-session',
      { sessionId, name: userName },
      ({ success, poll }) => {
        if (success && poll) {
          setQuestion(poll.question)
          setOptions(poll.options)
          setAnswers(poll.answers || {})
          setAnswered(!!poll.answers?.[userName])
          setRemaining(poll.duration)
          // start timer if needed
          clearInterval(timerRef.current)
          timerRef.current = setInterval(() => {
            setRemaining(r => {
              if (r <= 1) {
                clearInterval(timerRef.current)
                return 0
              }
              return r - 1
            })
          }, 1000)
        }
      }
    )

    socket.on('poll:new', ({ question, options, duration }) => {
      setQuestion(question)
      setOptions(options)
      setAnswers({})
      setAnswered(false)
      setSelectedChoice(null)
      setRemaining(duration)
      clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(timerRef.current)
            return 0
          }
          return r - 1
        })
      }, 1000)
    })

    socket.on('poll:update-results', latestAnswers =>
      setAnswers(latestAnswers)
    )

    socket.on('poll:end', () => {
      setAnswered(true)
      clearInterval(timerRef.current)
    })

    socket.on('chat:message', msg =>
      setChatLog(log => [...log, msg])
    )
    socket.on('session:update-users', users =>
      setParticipants(users)
    )

    return () => {
      clearInterval(timerRef.current)
      socket.off('poll:new')
      socket.off('poll:update-results')
      socket.off('poll:end')
      socket.off('chat:message')
      socket.off('session:update-users')
    }
  }, [socket, sessionId, userName])

  const submitAnswer = () => {
    if (!selectedChoice) return
    socket.emit('student:submit-answer', { sessionId, answer: selectedChoice })
    setAnswered(true)
  }

  const sendChat = text => {
    const msg = { sender: userName, message: text, sessionId }
    socket.emit('chat:message', msg)
  }

  const total = Object.values(answers).reduce((a,b)=>a+b,0)

  return (
    <div className="min-h-screen flex items-center justify-center p-6 ">
      {/* Poll Card */}
      <div className="p-8 w-full max-w-2xl ">
        <div className="w-full max-w-lg border border-purple-500 rounded-lg bg-white overflow-hidden">
          {/* Header */}
          <div className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
            <h3 className="font-medium">Question</h3>
            <span className="font-mono">{remaining != null ? `0:${remaining.toString().padStart(2,'0')}` : "--:--"}</span>
          </div>

          {/* Body */}
          <div className="px-6 py-8">
            <p className="mb-6 text-lg">{question}</p>

            {!hasAnswered ? (
              <div className="space-y-4">
                {options.map((opt,i)=>(
                  <button
                    key={i}
                    onClick={()=>setSelectedChoice(opt)}
                    className={`w-full flex items-center space-x-3 border rounded-lg p-4 transition ${
                      selectedChoice===opt
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full border ${
                      selectedChoice===opt
                        ? 'bg-purple-500 text-white border-transparent'
                        : 'border-gray-400 text-gray-600'
                    }`}>{i+1}</span>
                    <span className="flex-1 text-left">{opt}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {options.map((opt,i)=>{
                  const count = answers[opt]||0
                  const pct = total ? Math.round((count/total)*100):0
                  return (
                    <div key={i} className="flex items-center space-x-3">
                      <span className="w-6 text-gray-700">{i+1}.</span>
                      <div className="flex-1 bg-gray-200 h-6 rounded-lg overflow-hidden">
                        <div className="h-full bg-purple-600" style={{width:`${pct}%`}}/>
                      </div>
                      <span className="w-12 text-right text-gray-700">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Submit */}
          {!hasAnswered && (
            <div className="px-6 pb-6 flex justify-end">
              <button
                onClick={submitAnswer}
                disabled={!selectedChoice}
                className="bg-purple-600 text-white font-medium px-6 py-2 rounded-full hover:opacity-90 transition disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Toggle */}
      <button
        onClick={()=>setSidebarOpen(v=>!v)}
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:opacity-90 transition z-20"
      >
        💬
      </button>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-30 flex flex-col">
          <div className="flex border-b">
            {['chat','participants'].map(t=>(
              <button
                key={t}
                onClick={()=>setTab(t)}
                className={`flex-1 py-3 text-center ${
                  tab===t
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-500'
                }`}
              >
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {tab==='chat'
              ? <ChatBox chatLog={chatLog} onSend={sendChat}/>
              : <ul className="p-4 space-y-2">
                  {participants.map((name,i)=>
                    <li key={i} className="text-gray-800">{name}</li>
                  )}
                </ul>
            }
          </div>
        </div>
      )}
    </div>
  )
}
