# AWS Self-Hosted Human Voice Server (FastAPI + ChatTTS + XTTS-v2)
# Run on AWS EC2 (GPU or Multi-Core CPU)
# Command: uvicorn server.aws_tts_server:app --host 0.0.0.0 --port 8000

import os
import torch
import base64
import uvicorn
import numpy as np
import wave
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

app = FastAPI(title="Suvidha Real Human Voice Engine (ChatTTS & XTTS-v2)")

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"🤖 Initializing Human Voice Engine on device: {device}...")

# Model Instances
xtts_model = None
chat_model = None

# Initialize XTTS-v2
try:
    from TTS.api import TTS
    xtts_model = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)
    print("✅ XTTS-v2 Human Voice Cloning model loaded!")
except Exception as e:
    print(f"⚠️ XTTS-v2 Note: {e}")

# Initialize ChatTTS
try:
    import ChatTTS
    chat_model = ChatTTS.Chat()
    chat_model.load(compile=False)
    print("✅ ChatTTS Conversational Human Voice model loaded!")
except Exception as e:
    print(f"⚠️ ChatTTS Note: {e}")

class TTSRequest(BaseModel):
    text: str
    engine: str = "chat_tts"      # "chat_tts" or "xtts_v2"
    gender: str = "female"        # "male" or "female"
    speaker_wav_base64: str = ""  # For voice cloning in XTTS
    language: str = "hi"          # "hi" or "en"
    format: str = "mp3"           # "mp3" or "mulaw"

def wav_to_mulaw_8k(wav_path):
    import audioop
    with wave.open(wav_path, "rb") as w:
        params = w.getparams()
        frames = w.readframes(params.nframes)
        samples = np.frombuffer(frames, dtype=np.int16)
        
    src_rate = params.framerate
    if src_rate != 8000:
        duration = len(samples) / src_rate
        num_samples = int(duration * 8000)
        samples = np.interp(np.linspace(0, len(samples), num_samples), np.arange(len(samples)), samples).astype(np.int16)
    
    return audioop.lin2ulaw(samples.tobytes(), 2)

@app.post("/tts")
async def generate_speech(req: TTSRequest):
    try:
        # Engine 1: ChatTTS (Conversational Real Human with Breaths & Natural Pauses)
        if req.engine == "chat_tts" and chat_model is not None:
            # Add conversational human breathing and pauses
            formatted_text = req.text
            if not "[laugh]" in formatted_text and not "[pause]" in formatted_text:
                formatted_text = formatted_text.replace("?", "? [pause] ").replace(".", ". [breath] ")

            wavs = chat_model.infer([formatted_text], use_decoder=True)
            audio_arr = np.array(wavs[0], dtype=np.float32)
            audio_arr = (audio_arr * 32767).astype(np.int16)

            out_wav = "chat_output.wav"
            with wave.open(out_wav, "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(24000)
                wf.writeframes(audio_arr.tobytes())

            if req.format == "mulaw":
                mulaw_bytes = wav_to_mulaw_8k(out_wav)
                if os.path.exists(out_wav): os.remove(out_wav)
                return {"status": "success", "format": "mulaw", "audio_data": base64.b64encode(mulaw_bytes).decode("utf-8")}
            else:
                with open(out_wav, "rb") as f:
                    data = f.read()
                if os.path.exists(out_wav): os.remove(out_wav)
                return Response(content=data, media_type="audio/wav")

        # Engine 2: XTTS-v2 (Voice Cloning)
        elif xtts_model is not None:
            speaker_wav_path = "speaker_ref.wav"
            if req.speaker_wav_base64:
                with open(speaker_wav_path, "wb") as f:
                    f.write(base64.b64decode(req.speaker_wav_base64))
            else:
                # Default high-fidelity reference voice
                speaker_wav_path = "default_voice.wav"
                if not os.path.exists(speaker_wav_path):
                    t = np.linspace(0, 3, 3 * 22050, False)
                    tone = (np.sin(t * 440) * 32767).astype(np.int16)
                    with wave.open(speaker_wav_path, "wb") as w:
                        w.setnchannels(1)
                        w.setsampwidth(2)
                        w.setframerate(22050)
                        w.writeframes(tone.tobytes())

            out_path = "xtts_output.wav"
            xtts_model.tts_to_file(
                text=req.text,
                speaker_wav=speaker_wav_path,
                language=req.language,
                file_path=out_path
            )

            if req.format == "mulaw":
                mulaw_bytes = wav_to_mulaw_8k(out_path)
                if os.path.exists(out_path): os.remove(out_path)
                return {"status": "success", "format": "mulaw", "audio_data": base64.b64encode(mulaw_bytes).decode("utf-8")}
            else:
                with open(out_path, "rb") as f:
                    data = f.read()
                if os.path.exists(out_path): os.remove(out_path)
                return Response(content=data, media_type="audio/wav")

        else:
            raise HTTPException(status_code=500, detail="No TTS model loaded on AWS server.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {
        "status": "online",
        "device": device,
        "chat_tts_ready": chat_model is not None,
        "xtts_ready": xtts_model is not None
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
