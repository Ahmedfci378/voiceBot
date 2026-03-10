// helpers لو عايز تعمل conversions أو normalizations للصوت
const fs = require("fs");

function saveAudio(buffer, filename = "output.wav") {
  fs.writeFileSync(filename, buffer);
}

module.exports = { saveAudio };