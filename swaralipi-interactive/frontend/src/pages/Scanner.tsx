import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { Camera, Upload, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

const SCAN_IMAGE_KEY = "swaralipi_scan_image";

export default function Scanner() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
    }
  }, [webcamRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setImgSrc(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmImage = () => {
    if (imgSrc) {
      localStorage.setItem(SCAN_IMAGE_KEY, imgSrc);
      navigate("/result");
    }
  };

  const reset = () => {
    setImgSrc(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-neutral-900 mb-3">Initialize Scan</h1>
        <p className="text-neutral-500">
          Capture a photo of your notation or upload an existing image to start analysis.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left: Capture/Preview Area */}
        <div className="space-y-6">
          <div className="aspect-[4/3] bg-neutral-100 rounded-2xl border-2 border-dashed border-neutral-200 overflow-hidden relative flex items-center justify-center">
            {!imgSrc ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/png"
                className="w-full h-full object-cover"
                videoConstraints={{ facingMode: "environment" }}
                onUserMediaError={() => setError("Could not access camera. Please allow camera permissions.")}
              />
            ) : (
              <img src={imgSrc} alt="Captured" className="w-full h-full object-contain" />
            )}

            {error && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
                <p className="text-neutral-900 font-medium mb-2">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-sm font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            {!imgSrc ? (
              <button
                onClick={capture}
                className="flex-1 bg-neutral-900 text-white rounded-xl h-14 font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
              >
                <Camera className="w-5 h-5" /> Capture Photo
              </button>
            ) : (
              <>
                <button
                  onClick={reset}
                  className="flex-1 bg-neutral-100 text-neutral-600 rounded-xl h-14 font-bold flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" /> Retake
                </button>
                <button
                  onClick={confirmImage}
                  className="flex-1 bg-neutral-900 text-white rounded-xl h-14 font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5" /> Use Image
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right: Upload Options */}
        <div className="space-y-6">
          <div className="p-8 rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-neutral-400" /> Upload File
            </h3>

            <label className="block">
              <span className="sr-only">Choose notation image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="block w-full text-sm text-neutral-500
                  file:mr-4 file:py-3 file:px-6
                  file:rounded-xl file:border-0
                  file:text-sm file:font-bold file:uppercase file:tracking-widest
                  file:bg-neutral-100 file:text-neutral-700
                  hover:file:bg-neutral-200 transition-all cursor-pointer"
              />
            </label>

            <div className="mt-10 p-6 rounded-xl bg-neutral-50 border border-neutral-100">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Tips for best results</h4>
              <ul className="space-y-3">
                {[
                  "Ensure good lighting and high contrast",
                  "Keep the camera parallel to the sheet",
                  "Avoid shadows and motion blur",
                  "Capture a single system or line at a time"
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-neutral-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 mt-1.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
