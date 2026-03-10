const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function synthesizeSpeech(text) {
  const audioResponse = await openai.audio.speech.create({
     model: "gpt-4o-mini-tts",
    voice: "verse",
    input: text,
    format: "mp3"
    });

  // يرجع Buffer
  const buffer = Buffer.from(await audioResponse.arrayBuffer());
  return buffer;
}

module.exports = { synthesizeSpeech };