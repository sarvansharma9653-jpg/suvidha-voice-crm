// Suvidha Multi-Tenant WebSocket Voice Orchestrator
// Coordinates real-time media streaming between:
// Twilio Media Streams <--> Deepgram (STT) <--> LLM (Brain) <--> Cartesia/ElevenLabs (TTS)

const WebSocket = require('ws');
const http = require('http');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config();

const PORT = process.env.PORT || process.env.WEBSOCKET_PORT || 3001;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Suvidha Voice WebSocket Server Active\n');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log('📞 Twilio call connected via WebSocket media stream!');
  
  let streamSid = '';
  let callSid = '';
  let deepgramWs = null;
  let conversationHistory = [];
  let systemPrompt = 'You are a friendly Hinglish AI voice calling agent for Suvidha. Be conversational and concise (1-2 sentences). Speak Hindi-English mix naturally.';

  // Setup Deepgram Live Transcription connection
  const setupDeepgram = () => {
    const deepgramUrl = 'wss://api.deepgram.com/v1/listen?encoding=mulaw&sample_rate=8000&channels=1&endpointing=300';
    const apiKey = process.env.DEEPGRAM_API_KEY;

    if (!apiKey) {
      console.warn('⚠️ DEEPGRAM_API_KEY is missing. Real-time transcription is disabled.');
      return;
    }

    deepgramWs = new WebSocket(deepgramUrl, {
      headers: {
        Authorization: `Token ${apiKey}`
      }
    });

    deepgramWs.on('open', () => {
      console.log('🎙️ Connected to Deepgram Live Transcription!');
    });

    deepgramWs.on('message', async (data) => {
      try {
        const response = JSON.parse(data);
        const transcript = response.channel?.alternatives[0]?.transcript;

        if (transcript && response.is_final) {
          console.log(`👤 User: ${transcript}`);
          conversationHistory.push({ role: 'user', content: transcript });

          // Trigger LLM to generate reply
          await generateLLMResponse(transcript);
        }
      } catch (err) {
        console.error('Error parsing Deepgram transcription:', err);
      }
    });

    deepgramWs.on('error', (err) => {
      console.error('Deepgram WebSocket Error:', err);
    });

    deepgramWs.on('close', () => {
      console.log('📴 Deepgram Live Transcription connection closed.');
    });
  };

  // Generate reply from LLM and pipe to TTS
  const generateLLMResponse = async (userInput) => {
    try {
      // 1. Prioritize Gemini API (Free Tier) if configured
      if (process.env.GEMINI_API_KEY) {
        console.log('🧠 Generating brain response via Gemini API (Free Tier)...');
        const geminiContents = conversationHistory.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: geminiContents,
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            }
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gemini API responded with status ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiReply) {
          console.log(`🤖 AI (Gemini): ${aiReply}`);
          conversationHistory.push({ role: 'assistant', content: aiReply.trim() });
          await generateTTSResponse(aiReply.trim());
        }
        return;
      }

      // 2. Fallback to OpenAI
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.warn('⚠️ Both GEMINI_API_KEY and OPENAI_API_KEY are missing. Using mock AI response.');
        await generateTTSResponse("Hello! Please configure your Gemini API Key in the settings page to start calling.");
        return;
      }

      // Call OpenAI Chat Completions API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            ...conversationHistory
          ]
        })
      });

      const data = await response.json();
      const aiReply = data.choices[0]?.message?.content;

      if (aiReply) {
        console.log(`🤖 AI: ${aiReply}`);
        conversationHistory.push({ role: 'assistant', content: aiReply });
        
        // Convert reply text to voice audio
        await generateTTSResponse(aiReply);
      }
    } catch (err) {
      console.error('Error generating LLM response:', err);
    }
  };

  // Clean text for TTS: remove markdown asterisks, emojis, hashes, and extra spaces to prevent tokenizer crashes
  const cleanTextForTTS = (text) => {
    if (!text) return "";
    let cleaned = text.replace(/\*+/g, "");
    cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2702}-\u{27B0}\u{24C2}-\u{1F251}]/gu, "");
    cleaned = cleaned.replace(/[#_\-`]/g, " ");
    cleaned = cleaned.replace(/\s+/g, " ").trim();
    return cleaned;
  };

  // Convert Text to Speech (TTS) and stream back to Twilio
  const generateTTSResponse = async (text) => {
    try {
      const cleanedText = cleanTextForTTS(text);
      if (!cleanedText) {
        console.warn('⚠️ Cleaned text is empty, skipping TTS synthesis.');
        return;
      }

      // 0. Prioritize Self-Hosted AWS GPU Voice Cloning Server if configured
      if (process.env.AWS_GPU_TTS_URL) {
        console.log(`🗣️ Generating voice via Self-Hosted AWS GPU Server for cleaned text: "${cleanedText}"...`);
        const response = await fetch(`${process.env.AWS_GPU_TTS_URL}/tts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: cleanedText,
            language: 'en',
            speaker_wav_base64: '' // Can be optionally populated with base64 reference to clone
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(`AWS GPU Server responded with status ${response.status}: ${JSON.stringify(errData)}`);
        }

        const data = await response.json();
        const base64Audio = data.audio_data;

        if (base64Audio) {
          console.log(`🔊 Sending audio payload of size ${base64Audio.length} characters to client...`);
          ws.send(JSON.stringify({
            event: 'media',
            streamSid: streamSid,
            media: {
              payload: base64Audio
            }
          }));
        }
        return;
      }

      // 1. Prioritize Sarvam AI if API Key is configured
      if (process.env.SARVAM_API_KEY) {
        console.log('🗣️ Generating voice via Sarvam AI (Bulbul:v3)...');
        const response = await fetch('https://api.sarvam.ai/text-to-speech', {
          method: 'POST',
          headers: {
            'api-subscription-key': process.env.SARVAM_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: [text],
            target_language_code: 'hi-IN',
            speaker: 'meera', // Natural female voice
            pitch: 0,
            pace: 1.05,
            loudness: 1.5,
            speech_sample_rate: 8000,
            enable_preprocessing: true,
            model: 'bulbul:v3'
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(`Sarvam API responded with status ${response.status}: ${JSON.stringify(errData)}`);
        }

        const data = await response.json();
        const base64Audio = data.audios?.[0];

        if (base64Audio) {
          // Send base64 audio frames back to Twilio Media Stream
          ws.send(JSON.stringify({
            event: 'media',
            streamSid: streamSid,
            media: {
              payload: base64Audio
            }
          }));
        }
        return;
      }

      // 2. Fallback to Cartesia / Elevenlabs
      const apiKey = process.env.CARTESIA_API_KEY || process.env.ELEVENLABS_API_KEY;
      
      if (!apiKey) {
        console.warn('⚠️ TTS API Key is missing. Cannot generate voice audio.');
        return;
      }

      // Example Cartesia API streaming call (Hinglish/Indian accents)
      const response = await fetch('https://api.cartesia.ai/tts/bytes', {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Cartesia-Version': '2024-06-10',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model_id: 'sonic-english',
          voice: {
            mode: 'id',
            id: 'e583f658-2802-4eaf-ac7d-a4c3220c3d34' // Sarah Voice ID
          },
          output_format: {
            container: 'raw',
            encoding: 'mulaw',
            sample_rate: 8000
          },
          transcript: text
        })
      });

      if (!response.ok) {
        throw new Error(`TTS API responded with status ${response.status}`);
      }

      // Convert audio array buffer to base64
      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');

      // Send raw mulaw audio frames back to Twilio Media Stream
      ws.send(JSON.stringify({
        event: 'media',
        streamSid: streamSid,
        media: {
          payload: base64Audio
        }
      }));

    } catch (err) {
      console.error('Error synthesizing voice:', err);
    }
  };

  setupDeepgram();

  // Listen to incoming messages from Twilio Media Streams
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.event) {
        case 'start':
          streamSid = data.start.streamSid;
          callSid = data.start.callSid;
          if (data.start.customParameters?.systemPrompt) {
            systemPrompt = data.start.customParameters.systemPrompt;
          }
          console.log(`🚀 Call started. StreamSid: ${streamSid}, CallSid: ${callSid}. Prompt: ${systemPrompt}`);
          break;

        case 'media':
          // Stream raw payload (base64 mulaw audio) directly to Deepgram
          if (deepgramWs && deepgramWs.readyState === WebSocket.OPEN) {
            const rawAudio = Buffer.from(data.media.payload, 'base64');
            deepgramWs.send(rawAudio);
          }
          break;

        case 'stop':
          console.log(`📴 Stream stopped. Call ended for StreamSid: ${streamSid}`);
          break;

        case 'text':
          console.log(`👤 User (Text): ${data.text}`);
          conversationHistory.push({ role: 'user', content: data.text });
          await generateLLMResponse(data.text);
          break;
      }
    } catch (err) {
      console.error('Error handling Twilio WebSocket event:', err);
    }
  });

  ws.on('close', () => {
    console.log('🔇 Call session closed.');
    if (deepgramWs) {
      deepgramWs.close();
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Suvidha Voice WebSocket server is running on port ${PORT}`);
});
