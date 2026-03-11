const Conversation = require("../models/conversation.model");

async function saveMessage(sessionId, role, content) {

  let convo = await Conversation.findOne({ sessionId });

  if (!convo) {
    convo = new Conversation({
      sessionId,
      messages: []
    });
  }

  convo.messages.push({
    role,
    content
  });

  await convo.save();

  return convo;
}

async function getConversation(sessionId) {
  return Conversation.findOne({ sessionId });
}

module.exports = {
  saveMessage,
  getConversation
};