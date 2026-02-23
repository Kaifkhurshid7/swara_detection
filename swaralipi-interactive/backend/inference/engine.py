"""
YOLOv8 inference for a single cropped image (base64).
Returns top detection: class_id, confidence.
"""
import base64
import io
import torch
from pathlib import Path
from PIL import Image
from ultralytics import YOLO
from ultralytics.nn.tasks import DetectionModel  # <-- 1. Imported DetectionModel

# Fix for PyTorch 2.4+ weights_only restriction when loading older ultralytics checkpoints
# <-- 2. Added DetectionModel to the list below
torch.serialization.add_safe_globals([
    set, dict, list, tuple, torch.nn.Module, torch.nn.Parameter, torch.Tensor, DetectionModel
])

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "best.pt"
_model = None

def _get_model():
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model not found: {MODEL_PATH}. Train ml_pipeline or copy best.pt here.")
        _model = YOLO(str(MODEL_PATH))
    return _model

def run_inference(base64_image: str, conf_threshold: float = 0.25):
    """
    Decode base64 image, run YOLO, return best box: (class_id, confidence) or (None, 0.0).
    """
    try:
        # Strip data URL prefix if present
        if base64_image.startswith("data:image"):
            base64_image = base64_image.split(",", 1)[1].strip()
        raw = base64.b64decode(base64_image)
    except Exception as e:
        print(f"Base64 decoding error: {e}")
        return None, 0.0

    try:
        img_bytes = io.BytesIO(raw)
        image = Image.open(img_bytes)
    except Exception as e:
        print(f"Image parsing error: {e}")
        return None, 0.0

    model = _get_model()
    results = model.predict(source=image, conf=conf_threshold, verbose=False)

    best_id, best_conf = None, 0.0
    for r in results:
        if r.boxes is None:
            continue
        for box in r.boxes:
            conf = float(box.conf[0])
            if conf > best_conf:
                best_conf = conf
                best_id = int(box.cls[0])
                
    return best_id, best_conf