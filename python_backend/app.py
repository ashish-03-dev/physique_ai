from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import os
from analyze import analyze_body_proportions  # Import from separate analyse.py

app = FastAPI()

class GenRequest(BaseModel):
    img_folder: str
    out_folder: str

class AnalyzeRequest(BaseModel):
    npz_path: str

from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request

# Middleware to print all requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"➡️ {request.method} {request.url}")
    response = await call_next(request)
    return response

@app.post("/generate")
def generate_mesh(req: GenRequest):
    print("📥 Received mesh generation request")
    print(f"📂 Image folder: {req.img_folder}")
    print(f"📂 Output folder: {req.out_folder}")

    img_path = os.path.abspath(req.img_folder)
    out_path = os.path.abspath(req.out_folder)
    script_dir = os.path.abspath(os.path.dirname(__file__))
    demo_script = os.path.join(script_dir, "physique_engine", "4D-Humans", "demo.py")

    if not os.path.exists(demo_script):
        raise HTTPException(status_code=500, detail=f"❌ Script not found: {demo_script}")

    if not os.path.exists(img_path):
        raise HTTPException(status_code=400, detail=f"Input folder does not exist: {img_path}")
    
    command = [
        "python", demo_script,
        "--img_folder", img_path,
        "--out_folder", out_path,
        "--batch_size", "48",
        "--side_view",
        "--save_mesh",
        "--full_frame"
    ]

    print("🚀 Running command:", " ".join(command))

    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        print("✅ Mesh generation succeeded")
        print("📄 Output:", result.stdout)
        return {"status": "success", "message": "Mesh generation complete", "output": result.stdout}
    except subprocess.CalledProcessError as e:
        print("❌ Python script failed")
        print("📄 stdout:", e.stdout)
        print("🧾 stderr:", e.stderr)
        raise HTTPException(status_code=500, detail=e.stderr or str(e))

@app.post("/analyze")
def analyze_proportions(req: AnalyzeRequest):
    print("📥 Received analysis request")
    print(f"📂 NPZ path: {req.npz_path}")

    if not os.path.exists(req.npz_path):
        raise HTTPException(status_code=400, detail=f"NPZ file does not exist: {req.npz_path}")

    proportions = analyze_body_proportions(req.npz_path)
    if proportions is None:
        raise HTTPException(status_code=500, detail="Analysis failed")

    return {"status": "success", "message": "Analysis complete", "proportions": proportions}