const Call = require("../models/call.model");
const memoryStore = require("../utils/memory.store");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ===============================
   🧠 Intent Detection Function
=================================*/
async function detectIntent(userSpeech) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are an intent classifier.
Return ONLY valid JSON in this format:
{
  "intent": "one_of_the_intents",
  "confidence": 0.0_to_1.0
}

Possible intents:
- greeting
- pricing
- booking
- objection
- rejection
- callback_request
- general_question
`
      },
      {
        role: "user",
        content: userSpeech
      }
    ],
    temperature: 0,
  });

  try {
    return JSON.parse(completion.choices[0].message.content);
  } catch {
    return { intent: "general_question", confidence: 0.5 };
  }
}

/* ===============================
   🎯 Main Handler
=================================*/
exports.handleUserMessage = async (callSid, from, to, userSpeech) => {
  try {
    if (!userSpeech || !userSpeech.trim()) {
      return "Sorry, I didn't catch that. Could you repeat?";
    }

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

    memoryStore.addMessage(callSid, "user", userSpeech);

    /* ===============================
       🔎 Detect Intent
    =================================*/
    const intentData = await detectIntent(userSpeech);
    const intent = intentData.intent;
    const confidence = intentData.confidence || 0;

    console.log("Detected Intent:", intent, "Confidence:", confidence);

    // Optional: save intent in DB
    call.messages[call.messages.length - 1].intent = intent;

    let aiResponse;

    /* ===============================
       🎯 Intent-Based Responses
    =================================*/
    if (confidence >= 0.7) {

      switch (intent) {

        case "greeting":
          aiResponse = "Hi there! How can I help you today?";
          break;

        case "pricing":
          aiResponse =
            "Our pricing starts from $100 per month depending on your needs. Would you like me to explain the plans?";
          break;

        case "booking":
          aiResponse =
            "Great! I'd love to schedule that for you. What time works best?";
          break;

        case "objection":
          aiResponse =
            "I totally understand. May I ask what concerns you the most so I can clarify?";
          break;

        case "rejection":
          aiResponse =
            "No worries at all. If you ever change your mind, we’d be happy to help.";
          break;

        case "callback_request":
          aiResponse =
            "Sure, I can arrange a callback. When would be a good time to reach you?";
          break;

        default:
          break;
      }
    }

    /* ===============================
       🤖 AI Fallback (Smart Reply)
    =================================*/
    if (!aiResponse) {

      const history = memoryStore.getConversation(callSid).slice(-10);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a friendly human sales agent. Speak naturally, keep responses short (maximum 2 sentences), and sound human."
          },
          ...history,
        ],
        temperature: 0.7,
        max_tokens: 120,
      });

      aiResponse =
        completion.choices?.[0]?.message?.content?.trim() ||
        "Sorry, something went wrong.";
    }

    // 5️⃣ Save assistant response
    call.messages.push({ role: "assistant", content: aiResponse });

    await call.save();

    memoryStore.addMessage(callSid, "assistant", aiResponse);

    return aiResponse;

  } catch (error) {
    console.error("AI ERROR:", error.message);
    return "I'm having a small technical issue. Could you try again?";
  }
};