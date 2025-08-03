// sockets/pollHandlers.js
import store from '../models/sessionStore.js'
import {
  teacherInit,
  studentJoin,
  createPoll,
  submitAnswer,
  removeStudent,
  cleanupOnDisconnect
} from '../services/sessionsServices.js'

function tally(rawAnswers) {
  return Object.values(rawAnswers).reduce((acc, choice) => {
    acc[choice] = (acc[choice] || 0) + 1
    return acc
  }, {})
}

export default function bindPollHandlers(io, socket) {
  // Teacher creates a new session
  socket.on('teacher:create-session', (ack) => {
    try {
      const sessionId = teacherInit(socket)
      ack({ sessionId })
    } catch (err) {
      ack({ error: err.message })
    }
  })

  // Student joins
  socket.on('student:join-session', (data, cb) => {
    try {
      const { users, latestPoll } = studentJoin(data, socket)

      // broadcast updated user list
      io.to(data.sessionId).emit('session:update-users', users)

      // If there's an active poll, send its question/options/counts back to just this client
      if (latestPoll) {
        const { question, options, duration, answers: raw } = latestPoll
        cb({
          success: true,
          poll: {
            question,
            options,
            duration,
            answers: tally(raw)
          }
        })
      } else {
        cb({ success: true })
      }
    } catch (err) {
      cb({ success: false, message: err.message })
    }
  })

  // Teacher creates a poll
  socket.on('teacher:create-poll', (data, ack) => {
    try {
      const poll = createPoll(data)
      // broadcast new poll with duration (client will start countdown)
      io.to(data.sessionId).emit('poll:new', poll)
      
      // auto‐end after duration
      setTimeout(() => {
        const sess = store.get(data.sessionId)
        if (sess) sess.activePollIndex = null
        io.to(data.sessionId).emit('poll:end')
      }, data.duration * 1000)

      ack?.({ success: true, poll })
    } catch (err) {
      ack?.({ success: false, message: err.message })
    }
  })

  // Student submits answer
  socket.on('student:submit-answer', (data) => {
    try {
      // rawAnswers: { studentName: choice, … }
      const rawAnswers = submitAnswer({
        sessionId: data.sessionId,
        socketId: socket.id,
        answer: data.answer
      })

      // convert to counts: { choice: count, … }
      const counts = tally(rawAnswers)
      io.to(data.sessionId).emit('poll:update-results', counts)
    } catch (err) {
      socket.emit('error', { message: err.message })
    }
  })

  // Teacher removes a student
  socket.on('teacher:remove-student', (data) => {
    try {
      const targetSocketId = removeStudent(data)
      if (targetSocketId) {
        io.to(targetSocketId).emit('session:kicked')
      }
      const sess = store.get(data.sessionId)
      io.to(data.sessionId)
        .emit('session:update-users', Object.values(sess.students))
    } catch (err) {
      socket.emit('error', { message: err.message })
    }
  })

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    const result = cleanupOnDisconnect(socket)
    if (!result) return

    if (result.type === 'sessionEnd') {
      io.to(result.sessionId).emit('session:end')
    }
    if (result.type === 'studentLeave') {
      io.to(result.sessionId)
        .emit('session:update-users', result.users)
    }
  })
}
