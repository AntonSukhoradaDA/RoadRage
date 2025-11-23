from __future__ import annotations

import io
from typing import List, Optional

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from pathlib import Path
from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "rdd.pt"
model = YOLO(str(MODEL_PATH))

class DetectionBox(BaseModel):
    x: float
    y: float
    width: float
    height: float
    score: float
    classId: int


class DetectionResponse(BaseModel):
    hasDamage: bool
    confidence: float
    detections: List[DetectionBox]
    warning: Optional[str] = None


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/detect", response_model=DetectionResponse)
async def detect(file: UploadFile = File(...)) -> DetectionResponse:
    """
    Accepts an image file upload and returns normalized detections.
    Coordinates are in YOLO-style [0,1] space relative to the original image:
    - x, y: top-left corner
    - width, height: box size
    """
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Run inference (conf threshold here is fairly low; the frontend can filter further if needed)
        results = model.predict(image, conf=0.15, verbose=False)
        result = results[0]

        detections: List[DetectionBox] = []

        if result.boxes is not None:
            # Use normalized xywhn so that frontend logic stays simple
            for box in result.boxes:
                cls_id = int(box.cls[0].item())
                score = float(box.conf[0].item())

                cx, cy, w, h = map(float, box.xywhn[0].tolist())
                x = cx - w / 2.0
                y = cy - h / 2.0

                detections.append(
                    DetectionBox(
                        x=x,
                        y=y,
                        width=w,
                        height=h,
                        score=score,
                        classId=cls_id,
                    )
                )

        has_damage = len(detections) > 0
        confidence = (
            sum(d.score for d in detections) / len(detections) if detections else 0.0
        )

        return DetectionResponse(
            hasDamage=has_damage,
            confidence=confidence,
            detections=detections,
        )
    except Exception as exc:  # pylint: disable=broad-except
        # In error case we still respond with a valid payload, plus a warning string
        return DetectionResponse(
            hasDamage=False,
            confidence=0.0,
            detections=[],
            warning=f"Python backend error: {exc}",
        )


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


