const Call = require("../models/call.model");
const { scheduleCallback } = require("../utils/callback.scheduler");
const memoryStore = require("../utils/memory.store");
const memory = require("../utils/chatbot.memory");
const OpenAI = require("openai");
const  {getProjectByGoal}  = require("./project.service");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ===============================
   🧠 Intent Detection calls Function
=================================*/
// async function detectIntent(userSpeech) {
//   try {
//   const completion = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     response_format: { type: "json_object" },
//     messages: [
//       {
//         role: "system",
//         content: `
// You are a strict intent classification system.
// Return ONLY valid JSON in this format:
// {
//   "intent": "one_of_the_intents",
//   "confidence": 0.0_to_1.0
// }

// Possible intents:
// - greeting
// - pricing
// - booking
// - objection
// - rejection
// - callback_request
// - general_question
// `
//       },
//       {
//         role: "user",
//         content: userSpeech
//       }
//     ],
//     temperature: 0,
//   });

  
//     return JSON.parse(completion.choices[0].message.content);
//   } catch {
//     return { intent: "general_question", confidence: 0.5 };
//   }
// }

  /* ===============================
   🧠 Intent Detection chatbot function
=================================*/
async function detectIntent(text) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
Return ONLY JSON:
{
  "intent": "greeting | pricing | objection | callback | general",
  "confidence": 0-1
}
`
        },
        { role: "user", content: text }
      ],
    });

    return JSON.parse(completion.choices[0].message.content);

  } catch {
    return { intent: "general", confidence: 0.5 };
  }
}

/* ===============================
   🎯 Main Handler chatbot
=================================*/
exports.handleUserMessage = async (sessionId, message) => {


    console.log("SESSION:", sessionId);
console.log("CURRENT STAGE:", memory.getStage(sessionId));
  try {

    if (!message?.trim()) {
      return "ممكن توضح كلامك؟";
    }

    // حفظ رسالة المستخدم
    memory.addMessage(sessionId, "user", message);

    let stage = memory.getStage(sessionId);
    let response = "";

    /* =========================
       🎭 STAGE: INTRO
    ==========================*/
    if (stage === "intro") {

      response = "مرحبًا 👋 هل تبحث عن سكن أم استثمار؟";

      memory.setStage(sessionId, "qualification");
    }

    /* =========================
       🎭 STAGE: QUALIFICATION
    ==========================*/
   else if (stage === "qualification") {

  console.log("MESSAGE RECEIVED:", message);
  console.log("TYPE:", typeof message);

  const text = String(message).trim().toLowerCase();

  console.log("TEXT AFTER CLEAN:", text);
  if (text.includes("استثمار")) {

    memory.setGoal(sessionId, "investment");

    const projects = await getProjectByGoal("investment");

    if (projects.length) {
      const project = projects[0];

      response = `
    🏗 المشروع: ${project.name}
    📍 الموقع: ${project.location}

    💰 يبدأ من ${project.startingPrice?.toLocaleString()} جنيه
    📆 تقسيط حتى ${project.installmentYears} سنوات
    
    تحب تفاصيل أكتر ولا نكمل؟

    `;
      memory.setStage(sessionId, "followup");
    }

  } 
  else if (text.includes("سكن")) {

    memory.setGoal(sessionId, "residential");

    const projects = await getProjectByGoal("residential");

    if (projects.length) {
      const project = projects[0];

      response = `
      🏗 المشروع: ${project.name}
      📍 الموقع: ${project.location}

    💰 يبدأ من ${project.startingPrice?.toLocaleString()} جنيه
    📆 تقسيط حتى ${project.installmentYears} سنوات
   تحب تفاصيل أكتر ولا نكمل؟

    `;
      memory.setStage(sessionId, "followup");
    }

  } 
  else {

    response = "ممكن تقولّي تحب سكن ولا استثمار؟";
  }
}

  /* =========================
   🎭 STAGE: FOLLOWUP
=========================*/
else if (stage === "followup") {

  const text = String(message).trim().toLowerCase();

  // 🔹 إنهاء
  if (text.includes("لا") || text.includes("شكرا") || text.includes("انهي")) {
    response = "تمام 👍 سعيد بالتواصل معاك. نتكلم قريبًا 👋";
    memory.setStage(sessionId, "end");
  }

  // 🔹 حجز مكالمة
  else if (text.includes("مكالمة") || text.includes("حجز")) {
    response = "تمام 👍 إمتى يكون الوقت المناسب نكلمك؟";
    memory.setStage(sessionId, "callback"); // 👈 Stage جديدة
  }

  // 🔹 تفاصيل أكتر
  else if (text.includes("تفاصيل") || text.includes("أكتر")) {
    response = "حاضر 👌 هكمل معاك بالتفاصيل...";
    memory.setStage(sessionId, "qualification"); 
    // أو تقدر تخليها stage جديدة لو عايز flow أعمق
  }

  // 🔹 أي رد تاني
  else {
    response = "تحب تفاصيل أكتر عن المشروع ولا نحجز مكالمة؟";
  }
}

/* =========================
       🎭 STAGE:CALLBACK
    ==========================*/

else if (stage === "callback") {

  const text = String(message).trim().toLowerCase();

  response = "تمام 👍 تم تسجيل طلب المكالمة. هنتواصل معاك قريبًا.";

  memory.setStage(sessionId, "end");
}


    /* =========================
       🎭 STAGE: END
    ==========================*/
    else {

      response = "هل أقدر أساعدك في شيء آخر؟";

      // نرجعها لبداية بسيطة بدل ما الشات يقفل
      memory.setStage(sessionId, "qualification");
    }

    // حفظ رد البوت
    memory.addMessage(sessionId, "assistant", response);

    return response;

  } catch (error) {
    console.error("Chatbot Error:", error);
    return "حدث خطأ مؤقت.";
  }
};
  /* ===============================
   🎯 Main Handler calls
=================================*/

// exports.handleUserMessage = async (callSid, from, to, userSpeech) => {

//   console.log("AI FUNCTION START");

//   try {
//     if (!userSpeech || !userSpeech.trim()) {
//       return "معلش، ما سمعتش كلامك كويس. ممكن تعيده؟";
//     }

//     let call = await Call.findOne({ callSid });
//     if (!callSid) {
//   callSid = `browser_${Date.now()}`;
// }

//     if (!call) {
//       call = await Call.create({
//         callSid,
//         from,
//         to,
//         stage: "intro",
//         messages: [],
//       });
//     }

//     if (!call.stage) {
//       call.stage = "intro";
//     }

//     call.messages.push({ role: "user", content: userSpeech });
//     memoryStore.addMessage(callSid, "user", userSpeech);

//     let aiResponse;

//     /* ===============================
//        🎭 STAGE FLOW
//     =================================*/

//     if (call.stage === "intro") {
//       aiResponse =
//         "مرحبًا، معك ممثل من شركة بالم هيلز، إحدى أكبر شركات التطوير العقاري في مصر منذ عام 1997. هل هذا وقت مناسب للحديث لثواني؟";

//       call.stage = "permission";
//     }

//     else if (call.stage === "permission") {

//       const intentData = await detectIntent(userSpeech);
//       const intent = intentData.intent;
//       const confidence = intentData.confidence || 0;

//       if (intent === "greeting" || intent === "booking" || confidence >= 0.7) {

//         aiResponse =
//           "رائع 👍 لدينا إطلاق جديد بمميزات خاصة وخطط سداد مرنة. هل تبحث عن سكن أم استثمار؟";

//         call.stage = "launch";
//       }

//       else if (intent === "rejection") {

//         aiResponse =
//           "تمام جدًا. متى يكون الوقت المناسب لأعاود الاتصال بك؟";

//         call.stage = "callback";
//       }
//     }

//     /* ===============================
//        🚀 LAUNCH STAGE
//     =================================*/
//  else if (call.stage === "launch") {

//   if (!call.goal) {
//   call.goal = "residential"; // أو "investment" لو عايز
// }

//   const project = await getProjectByGoal(call.goal);

//   if (project && project.startingPrice) {

//     aiResponse = `
// رائع 👍 عندنا إطلاق جديد اسمه ${project.name} في ${project.location}.

// ${project.description}

// السعر يبدأ من ${
//   project.startingPrice
//     ? project.startingPrice.toLocaleString()
//     : "غير محدد"
// } جنيه 

// ويصل إلى ${
//   project.maxPrice
//     ? project.maxPrice.toLocaleString()
//     : "غير محدد"
// } جنيه


// المقدم يبدأ من ${project.downPayment || "حسب النظام"}.

// التقسيط حتى ${project.installmentYears || "مرن"} سنوات.


// مناسب أكتر لو هدفك ${project.type === "residential" ? "سكن" : "استثمار"}.

// هل تحب أعرفك على التفاصيل الكاملة أو أشرح لك خطة السداد؟
// `;

//   } else {

//     aiResponse =
//       "عندنا أكثر من مشروع مميز حاليًا. تحب أعرف هدفك سكن ولا استثمار؟";
//   }

//   call.stage = "qualification";
// }

//     /* ===============================
//        🔄 CALLBACK STAGE
//     =================================*/
//     else if (call.stage === "callback") {

//       aiResponse =
//         "تمام 👍 تم تسجيل طلب المعاودة، وسأتواصل معك في الوقت المحدد.";

//       call.stage = "end";

//       scheduleCallback(call);
//     }

//     /* ===============================
//        🎯 Intent-Based Responses
//     =================================*/
//     if (!aiResponse) {

//       const intentData = await detectIntent(userSpeech);
//       const intent = intentData.intent;
//       const confidence = intentData.confidence || 0;

//       if (confidence >= 0.7) {

//         switch (intent) {

//           case "pricing":
//             aiResponse =
//               "الأسعار تختلف حسب المشروع ونظام السداد. هل تحب أشرح لك التفاصيل؟";
//             break;

//           case "objection":
//             aiResponse =
//               "أتفهم قلقك تمامًا. ممكن أعرف السبب عشان أوضح لك الصورة؟";
//             break;

//           case "callback_request":
//             aiResponse =
//               "بالتأكيد 👍 إمتى يكون الوقت المناسب نعاود الاتصال؟";
//             call.stage = "callback";
//             break;

//           default:
//             break;
//         }
//       }
//     }

//     /* ===============================
//        🤖 AI Fallback
//     =================================*/
//     if (!aiResponse) {

//       const history = memoryStore.getConversation(callSid).slice(-10);

//       const completion = await openai.chat.completions.create({
//         model: "gpt-4o-mini",
//         messages: [
//           {
//             role: "system",
//                 content: `
//     أنت ممثل مبيعات محترف تعمل لصالح شركة بالم هيلز للتطوير العقاري.
//     تحدث باللغة العربية المصرية الطبيعية فقط.
//     كن ودودًا ومختصرًا.
//     `
//           },
//           ...history,
//         ],
//         temperature: 0.6,
//         max_tokens: 80,
//       });

//       aiResponse =
//         completion.choices?.[0]?.message?.content?.trim() ||
//         "حصل خطأ بسيط. ممكن تعيد كلامك؟";
//     }

//     call.messages.push({ role: "assistant", content: aiResponse });

//     await call.save();

//     memoryStore.addMessage(callSid, "assistant", aiResponse);

//     return aiResponse;

//   } catch (error) {
//     console.error("AI ERROR:", error.message);
//     return "حصلت مشكلة تقنية بسيطة. حاول مرة أخرى من فضلك.";
//   }
// };