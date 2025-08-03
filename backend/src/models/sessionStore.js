// models/sessionStore.js

const sessions = {} // sessionId: { teacherId, students, removed, polls, activePollIndex, pollHistory }

function createSession(teacherId) {
  const sessionId = `room-${Math.floor(1000 + Math.random() * 9000)}`
  sessions[sessionId] = {
    teacherId,
    students: {},
    removed: new Set(),
    polls: [],
    activePollIndex: null, // ✅ track which poll is active
    pollHistory: [] // ✅ completed polls with results
  }
  return sessionId
}

function get(sessionId) {
  return sessions[sessionId]
}

function deleteSession(sessionId) {
  delete sessions[sessionId]
}

// Add a poll to history when it ends
function addToHistory(sessionId, poll, results) {
  const session = sessions[sessionId]
  if (session) {
    session.pollHistory.push({
      ...poll,
      results,
      completedAt: new Date().toISOString()
    })
  }
}

export default {
  sessions,
  createSession,
  get,
  delete: deleteSession,
  addToHistory
}
