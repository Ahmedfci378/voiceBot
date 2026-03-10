const OpenAI = require("openai");
const Project = require("../models/project.model");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function detectIntent(userText) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
حدد نوع السؤال فقط من الاختيارات التالية:
real_estate_query
general_chat

أرجع الكلمة فقط.
`,
      },
      {
        role: "user",
        content: userText,
      },
    ],
    temperature: 0,
    max_tokens: 10,
  });

  return completion.choices[0].message.content.trim().toLowerCase();
}

async function getResponse(userText) {

  const intent = await detectIntent(userText);

  // لو السؤال عن المشاريع
  if (intent === "real_estate_query") {

    const projects = await Project.find({});

    // لو مفيش مشاريع
    if (!projects || projects.length === 0) {
      return "لا توجد مشاريع متاحة حالياً في قاعدة البيانات.";
    }

    const context = projects
      .map(
        (p) =>
          `المشروع: ${p.name},
الموقع: ${p.location},
السعر يبدأ من: ${p.startingPrice} جنيه,
مدة التقسيط: ${p.installmentYears} سنوات,
الوصف: ${p.description}`
      )
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
أنت مساعد عقاري ذكي.

مهمتك مساعدة المستخدم في معرفة تفاصيل المشاريع العقارية.

يمكنك الإجابة عن:
- السعر
- الموقع
- مدة التقسيط
- وصف المشروع

استخدم البيانات التالية فقط للإجابة على أسئلة المستخدم.

لو كانت الإجابة موجودة في البيانات قم بعرضها بوضوح.
لو لم تكن موجودة أخبر المستخدم أن هذه المعلومة غير متوفرة.

البيانات:
${context}
`,
        },
        {
          role: "user",
          content: userText,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0].message.content;
  }

  // لو كلام عادي
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "أنت مساعد ذكي تتحدث العربية بشكل طبيعي.",
      },
      {
        role: "user",
        content: userText,
      },
    ],
  });

  return completion.choices[0].message.content;
}

module.exports = { getResponse };