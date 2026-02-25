const Call = require("../models/call.model");
const memoryStore = require("../utils/memory.store");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handleUserMessage = async (callSid, from, to, userSpeech) => {
  // 1️⃣ Get or create call record
  let call = await Call.findOne({ callSid });

  if (!call) {
    call = await Call.create({
      callSid,
      from,
      to,
      messages: [],
    });
  }

  // 2️⃣ Save user message
  call.messages.push({ role: "user", content: userSpeech });
  await call.save();

  // 3️⃣ Add to memory
  memoryStore.addMessage(callSid, "user", userSpeech);
  const history = memoryStore.getConversation(callSid);

  // 4️⃣ OpenAI call
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a friendly human sales agent. Speak naturally and keep responses short.",
      },
      ...history,
    ],
  });

  const aiResponse = completion.choices[0].message.content;

  // 5️⃣ Save assistant response
  call.messages.push({ role: "assistant", content: aiResponse });
  await call.save();

  memoryStore.addMessage(callSid, "assistant", aiResponse);

  return aiResponse;
};