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
    { id: 1, text: '', correct: null },
    { id: 2, text: '', correct: null },
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
    setOptions(opts => [...opts, { id: Date.now(), text: '', correct: null }])

  // 2️⃣ On “Ask Question”
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
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
      {/*  Invite code */}
      <div>
        <h2 className="text-xl font-medium text-textDark">Session ID</h2>
        <div className="mt-1 inline-block bg-bgLight px-4 py-2 rounded-lg font-mono">
          {sessionId}
        </div>
      </div>

      {/*  Poll Creation Form (your existing JSX) */}
      <div>
        {/* Badge */}
        <div className="mb-6 inline-flex items-center bg-gradient-to-r from-brandPurple to-brandDeep text-xs font-medium uppercase px-3 py-1 rounded-full text-white">
          Intervue Poll
        </div>

        {/* Heading */}
        <h1 className="text-3xl text-textDark mb-1">
          Let’s <span className="font-bold">Get Started</span>
        </h1>
        <p className="text-textGray mb-8">
          Create and manage your poll, then monitor live responses.
        </p>

        {/* Question + Duration */}
        <div className="flex flex-col md:flex-row md:items-start md:space-x-6 mb-8">
          <div className="flex-1">
            <label className="block mb-2 font-medium text-textDark">
              Enter your question
            </label>
            <textarea
              maxLength={100}
              rows={4}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              className="w-full bg-bgLight p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple"
              placeholder="Type your question here..."
            />
            <div className="text-right text-sm text-textGray mt-1">
              {question.length}/100
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <label className="block mb-2 font-medium text-textDark">
              Time Limit
            </label>
            <select
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brandPurple"
            >
              {TIME_OPTIONS.map(sec => (
                <option key={sec} value={sec}>
                  {sec} seconds
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-6 mb-8">
          {options.map((opt, idx) => (
            <div
              key={opt.id}
              className="flex flex-col md:flex-row md:items-center md:space-x-4"
            >
              <div className="flex items-center space-x-3 mb-2 md:mb-0">
                <div className="w-6 h-6 flex items-center justify-center bg-brandPurple text-white rounded-full">
                  {idx + 1}
                </div>
                <input
                  type="text"
                  value={opt.text}
                  onChange={e => handleOptionText(opt.id, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 bg-bgLight p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple"
                />
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-textDark">Is it Correct?</span>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`correct-${opt.id}`}
                    checked={opt.correct === true}
                    onChange={() => handleOptionCorrect(opt.id, true)}
                    className="form-radio h-4 w-4 text-brandPurple"
                  />
                  <span className="ml-1 text-textGray">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`correct-${opt.id}`}
                    checked={opt.correct === false}
                    onChange={() => handleOptionCorrect(opt.id, false)}
                    className="form-radio h-4 w-4 text-brandPurple"
                  />
                  <span className="ml-1 text-textGray">No</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Add more + Submit */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={addOption}
            className="mb-4 sm:mb-0 inline-block text-brandPurple font-medium px-4 py-2 border border-brandPurple rounded-lg hover:bg-brandPurple hover:text-white transition"
          >
            + Add More option
          </button>
          <button
            onClick={handleSubmit}
            className="inline-block bg-gradient-to-r from-brandPurple to-brandDeep text-white font-medium px-8 py-3 rounded-full hover:opacity-90 transition"
          >
            Ask Question
          </button>
        </div>
      </div>
    </div>
  )
}
