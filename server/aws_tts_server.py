# AWS GPU Self-Hosted Voice Cloning Server (FastAPI + XTTS-v2)
# Run this script on your AWS EC2 GPU instance (e.g., g4dn.xlarge with Deep Learning AMI)
# Command to run: uvicorn aws_tts_server:app --host 0.0.0.0 --port 8000

import os
import torch
import base64
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from TTS.api import TTS

app = FastAPI(title="Suvidha AWS GPU Voice Cloning Server")

# Initialize Coqui XTTS-v2 model on GPU
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"🤖 Loading XTTS-v2 model on device: {device}...")

try:
    # Model will auto-download on first launch
    tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)
    print("✅ XTTS-v2 model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    tts = None

class TTSRequest(BaseModel):
    text: str
    speaker_wav_base64: str = ""  # Base64 encoded 3-second sample audio to clone
    language: str = "hi"          # Supports 'hi' (Hindi), 'en' (English), etc.

import numpy as np
import wave

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
async def text_to_speech(req: TTSRequest):
    if tts is None:
        raise HTTPException(status_code=500, detail="Model not loaded on server.")
    
    try:
        # Define speaker reference audio path
        speaker_wav_path = "temp_speaker.wav"
        
        if req.speaker_wav_base64:
            with open(speaker_wav_path, "wb") as f:
                f.write(base64.b64decode(req.speaker_wav_base64))
        else:
            default_voice = "default_voice.wav"
            if not os.path.exists(default_voice):
                # If no reference voice exists, write a dummy 3s tone to clone
                import numpy as np
                import wave
                t = np.linspace(0, 3, 3 * 22050, False)
                tone = (np.sin(t * 440) * 32767).astype(np.int16)
                with wave.open(default_voice, "wb") as w:
                    w.setnchannels(1)
                    w.setsampwidth(2)
                    w.setframerate(22050)
                    w.writeframes(tone.tobytes())
            speaker_wav_path = default_voice

        output_wav_path = "output.wav"

        # Generate synthesized cloned speech
        tts.tts_to_file(
            text=req.text,
            speaker_wav=speaker_wav_path,
            language=req.language,
            file_path=output_wav_path
        )

        # Resample and convert to 8kHz telephony mulaw
        mulaw_bytes = wav_to_mulaw_8k(output_wav_path)
        base64_audio = base64.b64encode(mulaw_bytes).decode("utf-8")

        # Cleanup temporary files
        if os.path.exists(output_wav_path):
            os.remove(output_wav_path)
        if os.path.exists(speaker_wav_path) and req.speaker_wav_base64:
            os.remove(speaker_wav_path)
            
        return {
            "status": "success",
            "audio_format": "mulaw",
            "audio_data": base64_audio
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "active", "device": device}

if __name__ == "__main__":
    import asyncio
    config = uvicorn.Config(app, host="0.0.0.0", port=8000, log_level="info")
    server = uvicorn.Server(config)
    
    try:
        loop = asyncio.get_running_loop()
        print("🔗 Active Jupyter event loop detected! Starting Uvicorn in background...")
        loop.create_task(server.serve())
        print("🚀 Uvicorn running in background on http://0.0.0.0:8000 (Cell execution finished successfully!)")
    except RuntimeError:
        print("🔄 Starting Uvicorn synchronously...")
        uvicorn.run(app, host="0.0.0.0", port=8000)
