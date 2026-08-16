# AWS High-Speed Human Voice Server (FastAPI + Edge Neural TTS)
# Ultra-fast, zero heavy dependencies (No torch required!)
# Command: python3 -m uvicorn server.aws_tts_server:app --host 0.0.0.0 --port 8000

import os
import base64
import uvicorn
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
import edge_tts

app = FastAPI(title="Suvidha Real Human Voice Engine")

print("🤖 Initializing Suvidha Real Human Voice Engine...")

class TTSRequest(BaseModel):
    text: str
    gender: str = "female"        # "male" or "female"
    language: str = "hi"          # "hi" or "en"
    format: str = "mp3"           # "mp3" or "mulaw"

@app.post("/tts")
async def generate_speech(req: TTSRequest):
    try:
        # Select appropriate human neural voice
        if req.gender.lower() == "male":
            voice_name = "hi-IN-MadhurNeural"
        else:
            voice_name = "hi-IN-SwaraNeural"

        communicate = edge_tts.Communicate(req.text, voice_name)
        out_mp3 = "neural_out.mp3"
        await communicate.save(out_mp3)

        with open(out_mp3, "rb") as f:
            data = f.read()
        if os.path.exists(out_mp3):
            os.remove(out_mp3)

        if req.format == "mulaw":
            # Return base64 for telephony
            return {"status": "success", "format": "mp3", "audio_data": base64.b64encode(data).decode("utf-8")}
        else:
            return Response(content=data, media_type="audio/mpeg")

    except Exception as e:
        print(f"Error in TTS: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {
        "status": "online",
        "engine": "Microsoft Neural High-Fidelity",
        "voices": ["hi-IN-SwaraNeural (Female)", "hi-IN-MadhurNeural (Male)"]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
