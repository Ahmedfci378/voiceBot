const OpenAI = require("openai");
const Project = require("../models/project.model");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function detectIntent(userText) {

const lowerText = userText.toLowerCase();
const bookingKeywords = [
  "احجز",
  "حجز",
  "احجز المشروع",
  "عايز احجز",
  "اريد الحجز",
  "ممكن احجز"
];

const callbackKeywords = [
  "اتصل بيا",
  "كلموني",
  "عايز حد يكلمني",
  "عايز تليفون",
  "ممكن حد يتواصل"
];

if (bookingKeywords.some(k => lowerText.includes(k))) {
  return "booking_request";
}

if (callbackKeywords.some(k => lowerText.includes(k))) {
  return "callback_request";
}
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
    حدد نوع السؤال فقط من الاختيارات التالية:
    real_estate_query
    general_chat
    booking_request
    callback_request

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

  if (intent === "booking_request") {

  // هنا ممكن تسجل الطلب في DB
  // مثال بسيط
  // await Booking.create({ userMessage: userText });

  return "تمام 👍 سجلت طلب الحجز. ممكن تسيب رقم تليفونك علشان فريق المبيعات يتواصل معك؟";
}

if (intent === "callback_request") {

  return "أكيد 👍 ممكن تكتب رقم تليفونك وسيتواصل معك أحد ممثلي المبيعات قريبًا.";
}

  // لو السؤال عن المشاريع
  if (intent === "real_estate_query") {

let cachedProjects = null;

async function getProjects() {
  if (!cachedProjects) {
    cachedProjects = await Project.find({});
  }
  return cachedProjects;
}
const projects = await getProjects();
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
        أنت مساعد عقاري مصري.

        اتكلم باللهجة المصرية الدارجة بشكل طبيعي وبسيط.
        خلي ردودك قصيرة وواضحة وكأنك بتكلم عميل في التليفون.

        مهمتك تساعد المستخدم يعرف تفاصيل المشاريع العقارية مثل:
        - السعر
        - الموقع
        - مدة التقسيط
        - وصف المشروع

        لو المعلومة موجودة في البيانات استخدمها في الرد.
        لو مش موجودة قول للمستخدم بشكل طبيعي إن المعلومة دي مش متوفرة دلوقتي.

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
      max_tokens: 120,
    });

    return completion.choices[0].message.content;
  }

  // لو كلام عادي
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
        أنت مساعد ذكي مصري.
        اتكلم باللهجة المصرية الدارجة وبأسلوب ودي وبسيط.
        خلي ردودك قصيرة وطبيعية زي كلام الناس في مصر.
        `      },
      {
        role: "user",
        content: userText,
      },
    ],
  });

  return completion.choices[0].message.content;


}

module.exports = { getResponse };