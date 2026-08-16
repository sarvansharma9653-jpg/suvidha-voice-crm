const WebSocket = require('ws');
const crypto = require('crypto');

function generateEdgeNeuralTTS(text, voice = 'hi-IN-MadhurNeural') {
  return new Promise((resolve, reject) => {
    const connId = crypto.randomUUID().replace(/-/g, '');
    const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=${connId}`;

    const ws = new WebSocket(wsUrl, {
      headers: {
        'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'
      }
    });

    const audioChunks = [];
    const reqId = crypto.randomUUID().replace(/-/g, '');
    const date = new Date().toISOString();

    ws.on('open', () => {
      const configMsg = `Path: speech.config\r\nX-RequestId: ${reqId}\r\nX-Timestamp: ${date}\r\nContent-Type: application/json\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
      ws.send(configMsg);

      const ssmlMsg = `Path: ssml\r\nX-RequestId: ${reqId}\r\nX-Timestamp: ${date}\r\nContent-Type: application/ssml+xml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='hi-IN'><voice name='${voice}'>${text}</voice></speak>`;
      ws.send(ssmlMsg);
    });

    ws.on('message', (data, isBinary) => {
      if (isBinary) {
        const headerLen = data.readUInt16BE(0);
        if (data.length > headerLen + 2) {
          const audio = data.slice(headerLen + 2);
          audioChunks.push(audio);
        }
      } else {
        const msg = data.toString();
        if (msg.includes('Path:turn.end')) {
          ws.close();
          const finalBuffer = Buffer.concat(audioChunks);
          resolve(finalBuffer);
        }
      }
    });

    ws.on('error', reject);
  });
}

async function run() {
  console.log('Testing Microsoft Edge Native Neural Voice Engine...');
  try {
    const maleAudio = await generateEdgeNeuralTTS('नमस्ते! मैं मधुर बोल रहा हूँ। यह असली भारतीय पुरुष की आवाज़ है।', 'hi-IN-MadhurNeural');
    console.log('🎉 REAL MICROSOFT MALE AUDIO GENERATED! Bytes:', maleAudio.length);

    const femaleAudio = await generateEdgeNeuralTTS('नमस्ते! मैं स्वरा बोल रही हूँ। यह असली भारतीय महिला की आवाज़ है।', 'hi-IN-SwaraNeural');
    console.log('🎉 REAL MICROSOFT FEMALE AUDIO GENERATED! Bytes:', femaleAudio.length);
  } catch (e) {
    console.error('Error:', e);
  }
}

run();
