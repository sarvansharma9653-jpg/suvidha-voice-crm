# AWS Self-Hosted Human Voice Server (FastAPI + ChatTTS + Edge-TTS)
# Compatible with Python 3.12+ and Ubuntu 24.04
# Command: uvicorn server.aws_tts_server:app --host 0.0.0.0 --port 8000

import os
import torch
import base64
import uvicorn
import numpy as np
import wave
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

app = FastAPI(title="Suvidha Real Human Voice Engine (ChatTTS & Edge Neural)")

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"🤖 Initializing Human Voice Engine on device: {device}...")

chat_model = None

# Initialize ChatTTS
try:
    import ChatTTS
    chat_model = ChatTTS.Chat()
    chat_model.load(compile=False)
    print("✅ ChatTTS Conversational Human Voice model loaded successfully!")
except Exception as e:
    print(f"⚠️ ChatTTS initialization note: {e}")

class TTSRequest(BaseModel):
    text: str
    engine: str = "chat_tts"      # "chat_tts" or "neural"
    gender: str = "female"        # "male" or "female"
    language: str = "hi"          # "hi" or "en"
    format: str = "mp3"           # "mp3" or "mulaw"

def wav_to_mulaw_8k(wav_path):
    try:
        import audioop
    except ImportError:
        import audioop_compat as audioop
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
        # Engine 1: ChatTTS (Conversational Human Dialogue with Breaths & Laughs)
        if req.engine == "chat_tts" and chat_model is not None:
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

        # Engine 2: High-Fidelity Neural Stream (edge-tts)
        else:
            import edge_tts
            voice_name = "hi-IN-MadhurNeural" if req.gender.lower() == "male" else "hi-IN-SwaraNeural"
            communicate = edge_tts.Communicate(req.text, voice_name)
            out_mp3 = "neural_out.mp3"
            await communicate.save(out_mp3)

            with open(out_mp3, "rb") as f:
                data = f.read()
            if os.path.exists(out_mp3): os.remove(out_mp3)
            return Response(content=data, media_type="audio/mpeg")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {
        "status": "online",
        "device": device,
        "chat_tts_ready": chat_model is not None,
        "python_version": "3.12_compatible"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
