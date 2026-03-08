
const sessions = new Map();

/*
  شكل الـ session:

  {
    messages: [],
    stage: "intro",
    goal: null
  }
*/

function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      messages: [],
      stage: "intro",
      goal: null
    });
  }

  return sessions.get(sessionId);
}

function addMessage(sessionId, role, content) {
  const session = getSession(sessionId);

  session.messages.push({
    role,
    content,
    timestamp: new Date()
  });

  // نحافظ على آخر 10 رسائل فقط
  if (session.messages.length > 10) {
    session.messages.splice(0, session.messages.length - 10);
  }
}

function getConversation(sessionId) {
  return getSession(sessionId).messages;
}

function getStage(sessionId) {
  return getSession(sessionId).stage;
}

function setStage(sessionId, stage) {
  getSession(sessionId).stage = stage;
}

function getGoal(sessionId) {
  return getSession(sessionId).goal;
}

function setGoal(sessionId, goal) {
  getSession(sessionId).goal = goal;
}

function clearSession(sessionId) {
  sessions.delete(sessionId);
}

module.exports = {
  getSession,
  addMessage,
  getConversation,
  getStage,
  setStage,
  getGoal,
  setGoal,
  clearSession
};