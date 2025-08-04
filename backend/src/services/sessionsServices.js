// services/sessionsServices.js
import store from "../models/sessionStore.js";

/** Teacher creates a session */
function teacherInit(socket) {
  const sessionId = store.createSession(socket.id);
  socket.join(sessionId);
  return sessionId;
}

/** Student joins session (returns users + latest poll if active) */
function studentJoin({ name, sessionId }, socket) {
  const sess = store.get(sessionId);
  if (!sess || sess.removed.has(name)) {
    throw new Error("Invalid session or removed user");
  }

  sess.students[socket.id] = name;
  socket.join(sessionId);

  const latestPoll =
    sess.activePollIndex != null ? sess.polls[sess.activePollIndex] : null;

  return { users: Object.values(sess.students), latestPoll };
}

/** Teacher creates poll and sets activePollIndex */
function createPoll({ sessionId, question, options, duration }) {
  const sess = store.get(sessionId);
  if (!sess) throw new Error("Session not found");

  const poll = {
    question,
    options,
    duration,
    answers: {}, // studentName -> choice
    startedAt: Date.now(),
  };

  sess.polls.push(poll);
  sess.activePollIndex = sess.polls.length - 1; // ✅ track active poll

  return poll;
}

/** Student submits answer, updates active poll */
function submitAnswer({ sessionId, socketId, answer }) {
  const sess = store.get(sessionId);
  if (!sess) throw new Error("Session not found");

  const poll = sess.polls[sess.activePollIndex];
  if (!poll) throw new Error("No active poll");

  const studentName = sess.students[socketId];
  if (!studentName) throw new Error("Student not in session");

  poll.answers[studentName] = answer;
  return poll.answers;
}

/** Teacher removes student */
function removeStudent({ sessionId, name }) {
  const sess = store.get(sessionId);
  if (!sess) throw new Error("Session not found");

  sess.removed.add(name);

  // Find the socketId for that student
  const targetSocketId =
    Object.entries(sess.students).find(
      ([sockId, studentName]) => studentName === name
    )?.[0] || null;

  // Remove from the in-memory map
  if (targetSocketId) {
    delete sess.students[targetSocketId];
  }

  // Return both the socketId (if any) and updated user list
  return {
    targetSocketId,
    users: Object.values(sess.students),
  };
}

/** Cleanup on disconnect */
function cleanupOnDisconnect(socket) {
  for (const [sessionId, sess] of Object.entries(store.sessions)) {
    if (sess.teacherId === socket.id) {
      store.delete(sessionId);
      return { type: "sessionEnd", sessionId };
    }
    if (sess.students[socket.id]) {
      delete sess.students[socket.id];
      return {
        type: "studentLeave",
        sessionId,
        users: Object.values(sess.students),
      };
    }
  }
  return null;
}

export {
  teacherInit,
  studentJoin,
  createPoll,
  submitAnswer,
  removeStudent,
  cleanupOnDisconnect,
};
