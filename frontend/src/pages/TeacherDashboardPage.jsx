// src/pages/TeacherDashboardPage.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSocket } from '../sockets/SocketProvider'

const TIME_OPTIONS = [30, 60, 90]

export default function TeacherDashboardPage() {
  const { sessionId: paramId } = useParams()
  const [sessionId, setSessionId] = useState(paramId || '')
  const socket = useSocket()
  const navigate = useNavigate()

  // Poll form state
  const [question, setQuestion] = useState('')
  const [duration, setDuration] = useState(60)
  const [options, setOptions] = useState([
    { id: 1, text: '', correct: false },
    { id: 2, text: '', correct: false }
  ])

  // 1️⃣ Create session on mount if none in URL
  useEffect(() => {
    if (!paramId) {
      socket.emit('teacher:create-session', ({ sessionId: newId }) => {
        setSessionId(newId)
        navigate(`/teacher/${newId}`, { replace: true })
      })
    }
  }, [paramId, navigate, socket])

  // Form handlers
  const handleOptionText = (id, txt) =>
    setOptions(opts => opts.map(o => (o.id === id ? { ...o, text: txt } : o)))

  const handleOptionCorrect = (id, val) =>
    setOptions(opts => opts.map(o => (o.id === id ? { ...o, correct: val } : o)))

  const addOption = () =>
    setOptions(opts => [...opts, { id: Date.now(), text: '', correct: false }])

  // 2️⃣ Submit poll
  const handleSubmit = () => {
    if (!question.trim() || options.some(o => !o.text.trim())) return

    socket.emit(
      'teacher:create-poll',
      {
        sessionId,
        question,
        options: options.map(o => o.text),
        duration
      },
      ({ success, poll, message }) => {
        if (!success) {
          console.error('Poll creation failed:', message)
          return
        }
        // Navigate with poll state so the PollRoomPage shows it immediately
        navigate(`/teacher/${sessionId}/poll`, { state: { poll } })
      }
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-xs font-medium uppercase px-3 py-1 rounded-full text-white shadow-lg">
          <span className="mr-2">✨</span> Intervue Poll
        </div>

        {/* Heading */}
        <h1 className="text-3xl text-gray-900 mb-1">
          Let’s <span className="font-bold">Get Started</span>
        </h1>
        <p className="text-gray-600 mb-8">
          Create and manage polls, ask questions, and monitor in real time.
        </p>

        {/* Question Input */}
        <div className="mb-8 relative">
          <textarea
            maxLength={100}
            rows={4}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="w-full bg-white border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
            placeholder="Enter your question here..."
          />
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <span className="text-sm text-gray-500">{duration}s</span>
            <select
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="bg-white border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-purple-500"
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

        {/* Options */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Options</h3>
          <div className="space-y-4">
            {options.map((opt, idx) => (
              <div key={opt.id} className="flex items-center space-x-4">
                <div className="w-8 h-8 flex items-center justify-center bg-[#7565D9] text-white rounded-full">
                  {idx + 1}
                </div>
                <input
                  type="text"
                  value={opt.text}
                  onChange={e => handleOptionText(opt.id, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 bg-white border-2 border-gray-200 p-3 rounded-lg focus:outline-none focus:border-purple-500"
                />
                <div className="flex items-center space-x-6">
                  <span className="text-gray-700 font-medium">Correct?</span>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`correct-${opt.id}`}
                      checked={opt.correct === true}
                      onChange={() => handleOptionCorrect(opt.id, true)}
                      className="form-radio h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    />
                    <span className="ml-1 text-gray-700">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`correct-${opt.id}`}
                      checked={opt.correct === false}
                      onChange={() => handleOptionCorrect(opt.id, false)}
                      className="form-radio h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    />
                    <span className="ml-1 text-gray-700">No</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Option */}
        <div className="mb-8">
          <button
            onClick={addOption}
            className="inline-block text-purple-600 font-medium px-4 py-2 border border-purple-600 rounded-lg hover:bg-purple-50 transition"
          >
            + Add option
          </button>
        </div>

        {/* Ask Question */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={
              !question.trim() || options.some(o => !o.text.trim())
            }
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-8 py-3 rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Ask Question
          </button>
        </div>
      </div>
    </div>
  )
}
