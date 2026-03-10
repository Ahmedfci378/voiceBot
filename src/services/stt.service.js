// مثال باستخدام OpenAI Whisper أو أي STT provider
const fs = require("fs");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(audioBuffer) {
  // لو provider بيقبل file
  // fs.writeFileSync("temp.wav", audioBuffer);

  fs.writeFileSync("temp.wav", audioBuffer);
const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("temp.wav"),
  model: "whisper-1",
});

  return transcription.text;
}

module.exports = { transcribeAudio };