const conversations = new Map();

exports.getConversation = (callSid) => {
  if (!conversations.has(callSid)) {
    conversations.set(callSid, []);
  }
  return conversations.get(callSid);
};

exports.addMessage = (callSid, role, content) => {
  const history = exports.getConversation(callSid);

  history.push({ role, content });

  // Keep last 5 exchanges only
  if (history.length > 10) {
    history.splice(0, history.length - 10);
  }
};

exports.clearConversation = (callSid) => {
  conversations.delete(callSid);
};