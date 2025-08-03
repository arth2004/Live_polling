// models/sessionStore.js

const sessions = {} // sessionId: { teacherId, students, removed, polls, activePollIndex }

function createSession(teacherId) {
  const sessionId = `room-${Math.floor(1000 + Math.random() * 9000)}`
  sessions[sessionId] = {
    teacherId,
    students: {},
    removed: new Set(),
    polls: [],
    activePollIndex: null // ✅ track which poll is active
  }
  return sessionId
}

function get(sessionId) {
  return sessions[sessionId]
}

function deleteSession(sessionId) {
  delete sessions[sessionId]
}

export default {
  sessions,
  createSession,
  get,
  delete: deleteSession
}
