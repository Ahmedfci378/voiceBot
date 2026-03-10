const OpenAI = require("openai");
const Project = require("../models/project.model"); // أو أي DB عندك

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getResponse(userText) {
  // 1️⃣ نجيب المشاريع أو البيانات حسب الحاجة
  const projects = await Project.find({});

  let contextText = projects.length
    ? projects.map(p => `المشروع: ${p.name}, الموقع: ${p.location}, السعر يبدأ من ${p.startingPrice} جنيه`).join("\n")
    : "";

  // 2️⃣ نحدد system prompt
  let systemPrompt = contextText
    ? `أنت مساعد ذكي بالعربية. استخدم المعلومات التالية للرد فقط:\n${contextText}`
    : `أنت مساعد ذكي بالعربية. لا يوجد سياق محدد من قاعدة البيانات. حاول الرد بطريقة ودية ومفهومة للمستخدم.`

  // 3️⃣ نعمل طلب للـ OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userText }
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  return completion.choices[0].message.content.trim();
}

module.exports = { getResponse };