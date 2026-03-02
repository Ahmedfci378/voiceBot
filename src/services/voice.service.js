const Call = require("../models/call.model");
const { scheduleCallback } = require("../utils/callback.scheduler");
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
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
You are a strict intent classification system.
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
      return "معلش، ما سمعتش كلامك كويس. ممكن تعيده؟";
    }

    // 1️⃣ Get or create call record
    let call = await Call.findOne({ callSid });

    if (!call) {
      call = await Call.create({
        callSid,
        from,
        to,
        stage: "intro",
        messages: [],
      });
    }

     if (!call.stage) {
      call.stage = "intro";
    }

    // 2️⃣ Save user message
    call.messages.push({ role: "user", content: userSpeech });

    memoryStore.addMessage(callSid, "user", userSpeech);

  
    let aiResponse;

     /* ===============================
       🎭 STAGE FLOW (First Priority)
    =================================*/

    // 🔹 Intro Stage
    if (call.stage === "intro") {
      aiResponse =
        "مرحبًا، معك ممثل من شركة بالم هيلز، إحدى أكبر شركات التطوير العقاري في مصر منذ عام 1997. هل هذا وقت مناسب للحديث لثواني؟";

      call.stage = "permission";
    }

    // 🔹 Permission Stage
    else if (call.stage === "permission") {

      const intentData = await detectIntent(userSpeech);
      const intent = intentData.intent;
      const confidence = intentData.confidence || 0;

      // لو وافق
      if (intent === "greeting" || intent === "booking" || confidence >= 0.7) {

        aiResponse =
          "رائع 👍 لدينا إطلاق جديد بمميزات خاصة وخطط سداد مرنة. هل تبحث عن سكن أم استثمار؟";

        call.stage = "qualification";
      }

      // لو رفض
      else if (intent === "rejection") {

        aiResponse =
          "تمام جدًا. متى يكون الوقت المناسب لأعاود الاتصال بك؟";

        call.stage = "callback";
      }
    }

    // 🔹 Callback Stage
    else if (call.stage === "callback") {

    aiResponse = "تمام 👍 تم تسجيل طلب المعاودة، وسأتواصل معك في الوقت المحدد.";

    call.stage = "end";

    await call.save();

    scheduleCallback(call);
    }

    /* ===============================
       🎯 Intent-Based Responses
    =================================*/
    if (!aiResponse) {

      const intentData = await detectIntent(userSpeech);
      const intent = intentData.intent;
      const confidence = intentData.confidence || 0;

      if (confidence >= 0.7) {

        switch (intent) {

          case "pricing":
            aiResponse =
              "الأسعار تختلف حسب المشروع ونظام السداد. هل تحب أشرح لك التفاصيل؟";
            break;

          case "objection":
            aiResponse =
              "أتفهم قلقك تمامًا. ممكن أعرف السبب عشان أوضح لك الصورة؟";
            break;

          case "callback_request":
            aiResponse =
              "بالتأكيد 👍 إمتى يكون الوقت المناسب نعاود الاتصال؟";
            call.stage = "callback";
            break;

          default:
            break;
        }
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
            content: `
              أنت ممثل مبيعات محترف تعمل لصالح شركة بالم هيلز للتطوير العقاري.
              تحدث باللغة العربية المصرية الطبيعية فقط.
              كن ودودًا، مختصرًا، وجملة أو جملتين بحد أقصى.
              لا تتكلم بأسلوب روبوتي.
              اسأل دائمًا إذا كان هذا وقت مناسب للحديث.
              إذا لم يكن الوقت مناسب، اطلب تحديد وقت للاتصال مرة أخرى.
              إذا أبدى العميل اهتمامًا، اسأله عن الموقع والميزانية والهدف (سكن أم استثمار).
              `
          },
          ...history,
        ],
        temperature: 0.6,
        max_tokens: 80,
      });

      aiResponse =
        completion.choices?.[0]?.message?.content?.trim() ||
        "حصل خطأ بسيط. ممكن تعيد كلامك؟";
    }

    // 5️⃣ Save assistant response
    call.messages.push({ role: "assistant", content: aiResponse });

    await call.save();

    memoryStore.addMessage(callSid, "assistant", aiResponse);

    return aiResponse;

  } catch (error) {
    console.error("AI ERROR:", error.message);
    return "حصلت مشكلة تقنية بسيطة. حاول مرة أخرى من فضلك.";
  }
};