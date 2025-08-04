// src/pages/PollRoomPage.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useParams,useLocation } from 'react-router-dom'
import { useSocket } from '../sockets/SocketProvider'
import ChatBox from '../components/ChatBox.jsx'

export default function PollRoomPage({ userName = 'Teacher' }) {
  const { sessionId } = useParams()
  const socket = useSocket()
  const {state} = useLocation() 
  // Poll state
  const [question, setQuestion]       = useState('')
  const [options, setOptions]         = useState([]) // [{ text, count }]
  const [totalAnswers, setTotalAnswers] = useState(0)
  const [remaining, setRemaining]     = useState(null)

  // Sidebar/chat
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tab, setTab]                 = useState('chat')
  const [chatLog, setChatLog]         = useState([])
  const [participants, setParticipants] = useState([])

  // New-question form
  const [showForm, setShowForm] = useState(false)
  const [draftQ, setDraftQ]     = useState('')
  const [draftOpts, setDraftOpts] = useState(['', ''])
  const [draftDur, setDraftDur]   = useState(60)

  const timerRef = useRef(null)

  // Listeners (teacher already joined in teacherInit on backend)
  useEffect(() => {

    socket.emit('student:join-session', { sessionId, name: userName }, () => {})
    if (state?.poll) {
    const p = state.poll
    setQuestion(p.question)
    setOptions(p.options.map(text => ({ text, count: 0 })))
    setTotalAnswers(Object.values(p.answers || {}).reduce((a, b) => a + b, 0))
    setRemaining(p.duration)
    // start your timer just as you do in poll:new
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setRemaining(r => (r > 1 ? r - 1 : (clearInterval(timerRef.current), 0)))
    }, 1000)
  }

    // New poll
    socket.on('poll:new', ({ question, options, duration }) => {
      setQuestion(question)
      setOptions(options.map(text => ({ text, count: 0 })))
      setTotalAnswers(0)
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

    // Live results
    socket.on('poll:update-results', answers => {
      const newTotal = Object.values(answers).reduce((a, b) => a + b, 0)
      setTotalAnswers(newTotal)
      setOptions(opts =>
        opts.map(o => ({ ...o, count: answers[o.text] || 0 }))
      )
    })

    // Poll ended
    socket.on('poll:end', () => {
      clearInterval(timerRef.current)
      setRemaining(0)
    })

    // Chat
    socket.on('chat:message', msg =>
      setChatLog(log => [...log, msg])
    )

    // Participants
    socket.on('session:update-users', users =>
      setParticipants(users.filter(u => u !== userName))
    )

    return () => {
      clearInterval(timerRef.current)
      socket.off('poll:new')
      socket.off('poll:update-results')
      socket.off('poll:end')
      socket.off('chat:message')
      socket.off('session:update-users')
    }
  }, [socket])

  // Publish new poll
  const handlePublish = () => {
    const opts = draftOpts.filter(o => o.trim() !== '')
    if (!draftQ.trim() || opts.length < 2) return

    socket.emit(
      'teacher:create-poll',
      { sessionId, question: draftQ, options: opts, duration: draftDur },
      () => {
        setShowForm(false)
        setDraftQ('')
        setDraftOpts(['', ''])
        setDraftDur(60)
      }
    )
  }

  // Draft options helpers
  const updateOpt = (i, v) =>
    setDraftOpts(os => os.map((o, j) => (j === i ? v : o)))
  const addOpt = () =>
    setDraftOpts(os => [...os, ''])
  const removeOpt = i =>
    setDraftOpts(os => os.filter((_, j) => j !== i))

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Live Poll</h1>
          <div className="flex items-center space-x-4">
            <span className="text-red-500 font-mono text-lg">
              {remaining != null ? formatTime(remaining) : '00:00'}
            </span>
            <button
              onClick={() => setShowForm(true)}
              className="bg-brandPurple text-white px-4 py-2 rounded-lg hover:bg-brandDeep transition-colors"
            >
              + Ask a new question
            </button>
          </div>
        </div>

        {/* Question & Results */}
        <div className="bg-white rounded-lg border-2 border-[#3882F6] overflow-hidden shadow-lg mb-6">
          <div className="bg-gray-700 text-white px-6 py-4">
            <h3 className="font-semibold">{question || 'No active question'}</h3>
          </div>
          <div className="p-6 space-y-4">
            {options.map((opt, i) => {
              const pct = totalAnswers
                ? Math.round((opt.count / totalAnswers) * 100)
                : 0
              return (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#7565D9] text-white rounded-full font-semibold">
                    {i + 1}
                  </div>
                  <div className="w-16 font-medium text-gray-700">{opt.text}</div>
                  <div className="flex-1 bg-gray-200 h-8 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-brandPurple transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${pct}%` }}
                    >
                      {pct > 0 && (
                        <span className="text-white text-sm font-semibold">
                          {pct}%
                        </span>
                      )}
                    </div>
                  </div>
                  {pct === 0 && (
                    <span className="w-12 text-right text-gray-600 font-semibold">
                      0%
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 right-6 bg-brandPurple text-white p-4 rounded-full shadow-lg hover:bg-brandDeep transition-colors z-20"
        >
          💬
        </button>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="fixed top-0 right-0 h-full w-96 bg-white shadow-xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex border-b">
              {['chat', 'participants'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-4 text-center font-medium ${
                    tab === t
                      ? 'border-b-2 border-[#7565D9] text-[#7565D9]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
              <button
                onClick={() => setSidebarOpen(false)}
                className="px-4 py-4 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {tab === 'chat' ? (
                <ChatBox
                  chatLog={chatLog}
                  onSend={text => {
                    socket.emit('chat:message', {
                      sender: userName,
                      message: text,
                      sessionId
                    })
                  }}
                />
              ) : (
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Participants
                  </h3>
                  <div className="space-y-3">
                    {participants.map((participant, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <span className="font-medium text-gray-900">
                            {participant.name || participant}
                          </span>
                          <div className="text-sm text-gray-500">Online</div>
                        </div>
                        <button
                          onClick={() =>
                            socket.emit('teacher:remove-student', {
                              sessionId,
                              name: participant.name || participant
                            })
                          }
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          Kick out
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Poll Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8 space-y-6 relative mx-4">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold text-gray-900">
              Create New Poll
            </h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Question
              </label>
              <textarea
                placeholder="Enter your question here..."
                value={draftQ}
                onChange={e => setDraftQ(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-brandPurple resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Options
              </label>
              <div className="space-y-3">
                {draftOpts.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-[#7565D9] text-white rounded-full text-sm font-semibold">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={e => updateOpt(i, e.target.value)}
                      className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-brandPurple"
                    />
                    {draftOpts.length > 2 && (
                      <button
                        onClick={() => removeOpt(i)}
                        className="text-red-500 hover:text-red-700 text-xl font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addOpt}
                  className="text-brandPurple font-medium hover:text-brandDeep transition-colors"
                >
                  + Add another option
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={draftDur}
                  onChange={e => setDraftDur(Number(e.target.value))}
                  className="w-24 border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brandPurple"
                />
                <span className="text-gray-600">seconds</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={
                  !draftQ.trim() || draftOpts.filter(o => o.trim()).length < 2
                }
                className="bg-gradient-to-r from-brandPurple to-brandDeep font-semibold px-6 py-2 rounded-lg hover:from-brandBlue hover:to-brandDeep disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Create Poll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
