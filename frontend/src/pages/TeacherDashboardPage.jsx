import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSocket } from '../sockets/SocketProvider'

const TIME_OPTIONS = [30, 60, 90]

export default function TeacherDashboardPage() {
  const { sessionId: paramId } = useParams()
  const [sessionId, setSessionId] = useState(paramId || '')
  const socket   = useSocket()
  const navigate = useNavigate()

  // Poll form state
  const [question, setQuestion] = useState('')
  const [duration, setDuration] = useState(60)
  const [options, setOptions] = useState([
    { id: 1, text: 'Rahul Bajaj', correct: true },
    { id: 2, text: 'Rahul Bajaj', correct: false },
  ])

  // 1️⃣ On mount, create session if none in URL
  useEffect(() => {
    if (!paramId) {
      socket.emit('teacher:create-session', ({ sessionId: newId }) => {
        setSessionId(newId)
        navigate(`/teacher/${newId}`, { replace: true })
      })
    }
  }, [paramId, navigate, socket])

  // Form handlers (your existing code)
  const handleOptionText = (id, txt) =>
    setOptions(opts =>
      opts.map(o => (o.id === id ? { ...o, text: txt } : o))
    )
  const handleOptionCorrect = (id, val) =>
    setOptions(opts =>
      opts.map(o => (o.id === id ? { ...o, correct: val } : o))
    )
  const addOption = () =>
    setOptions(opts => [...opts, { id: Date.now(), text: '', correct: false }])

  // 2️⃣ On "Ask Question"
  const handleSubmit = () => {
  if (!question.trim() || options.some(o => !o.text.trim())) return

  socket.emit(
    'teacher:create-poll',
    { sessionId, question, options: options.map(o => o.text), duration },
    ({ success, poll, message }) => {
      if (!success) {
        console.error('Poll creation failed:', message)
        return
      }
      // Navigate to live poll view, carrying the poll data
      navigate(`/teacher/${sessionId}/poll`, { state: { poll } })
    }
  )
}

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-xs font-medium uppercase px-4 py-2 rounded-full text-white shadow-lg">
          <span className="mr-2">✨</span> Intervue Poll
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Let's <span className="text-gray-900">Get Started</span>
        </h1>
        <p className="text-gray-600 mb-8">
          you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
        </p>

        {/* Question Input */}
        <div className="mb-8">
          <div className="relative">
            <textarea
              maxLength={100}
              rows={4}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              className="w-full bg-white border-2 border-[#3B82F6] rounded-lg p-4 pr-20 focus:outline-none focus:border-[#2563EB] resize-none"
              placeholder="Enter your question"
            />
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <span className="text-sm text-gray-500">{duration} seconds</span>
              <select
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="bg-white border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#3B82F6]"
              >
                {TIME_OPTIONS.map(sec => (
                  <option key={sec} value={sec}>
                    {sec}s
                  </option>
                ))}
              </select>
            </div>
            <div className="absolute bottom-4 right-4 text-sm text-gray-400">
              {question.length}/100
            </div>
          </div>
        </div>

        {/* Edit Options Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Options</h3>
          <div className="space-y-4">
            {options.map((opt, idx) => (
              <div key={opt.id} className="flex items-center space-x-4">
                <div className="w-8 h-8 flex items-center justify-center bg-[#7565D9] text-white rounded-full font-semibold">
                  {idx + 1}
                </div>
                <input
                  type="text"
                  value={opt.text}
                  onChange={e => handleOptionText(opt.id, e.target.value)}
                  placeholder={`Rahul Bajaj`}
                  className="flex-1 bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#7565D9] focus:bg-white"
                />
                <div className="flex items-center space-x-6">
                  <span className="text-gray-700 font-medium">Is it Correct?</span>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`correct-${opt.id}`}
                      checked={opt.correct === true}
                      onChange={() => handleOptionCorrect(opt.id, true)}
                      className="w-4 h-4 text-[#7565D9] border-gray-300 focus:ring-[#7565D9]"
                    />
                    <span className="ml-2 text-gray-700">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`correct-${opt.id}`}
                      checked={opt.correct === false}
                      onChange={() => handleOptionCorrect(opt.id, false)}
                      className="w-4 h-4 text-[#7565D9] border-gray-300 focus:ring-[#7565D9]"
                    />
                    <span className="ml-2 text-gray-700">No</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add more option button */}
        <div className="mb-8">
          <button
            onClick={addOption}
            className="text-[#7565D9] font-medium px-4 py-2 border-2 border-[#7565D9] rounded-lg hover:bg-[#7565D9] hover:text-white transition-all duration-200"
          >
            + Add More option
          </button>
        </div>

        {/* Ask Question Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!question.trim() || options.some(o => !o.text.trim())}
            className="bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white font-semibold px-8 py-3 rounded-full hover:from-[#6554C8] hover:to-[#3C0ABC] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            Ask Question
          </button>
        </div>
      </div>
    </div>
  )
}
