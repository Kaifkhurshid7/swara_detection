import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import {
  Upload,
  Camera,
  Loader2,
  ArrowLeft,
  Cpu,
  Zap,
  AlertCircle
} from "lucide-react";
import { isMobile } from "../utils/device";

const SCAN_IMAGE_KEY = "swaralipi_scan_image";

export default function Scanner() {
  const navigate = useNavigate();
  const [fileError, setFileError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing">("idle");
  const webcamRef = useRef<Webcam>(null);
  const mobile = isMobile();

  const handleDataIngestion = useCallback(
    (dataUrl: string) => {
      setStatus("processing");
      try {
        localStorage.setItem(SCAN_IMAGE_KEY, dataUrl);
        setTimeout(() => navigate("/result"), 1200);
      } catch (e) {
        setStatus("idle");
        setFileError("IMAGE_TOO_LARGE: Please use a standard resolution photo.");
      }
    },
    [navigate]
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      setFileError("INVALID_TYPE: Please upload a JPG or PNG.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => handleDataIngestion(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center p-8">

      {/* Minimalist Top Navigation */}
      <div className="w-full max-w-2xl flex justify-start mb-12">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-neutral-400 hover:text-black transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Back to Terminal</span>
        </button>
      </div>

      <div className="w-full max-w-xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">
          Ingest Notation
        </h1>
        <p className="text-neutral-400 text-sm font-medium mb-10">
          Ensure high-quality, high-contrast imagery for optimal neural accuracy.
        </p>

        <div className="relative group">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            {mobile ? (
              <div className="p-4">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className="absolute inset-0 w-full h-full object-cover"
                    videoConstraints={{ facingMode: "environment" }}
                  />

                  {/* Subtle Optic Guides */}
                  <div className="absolute inset-0 border-[2px] border-white/20 m-6 rounded-lg pointer-events-none" />

                  {status === "processing" && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
                      <div className="relative">
                        <Loader2 className="w-10 h-10 text-neutral-900 animate-spin" />
                        <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-neutral-900" />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    const src = webcamRef.current?.getScreenshot();
                    if (src) handleDataIngestion(src);
                  }}
                  disabled={status === "processing"}
                  className="mt-4 w-full h-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold uppercase tracking-widest text-[11px]">Capture Manuscript</span>
                </button>
              </div>
            ) : (
              <div className="p-2">
                <label className="block cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={status === "processing"} />
                  <div className="flex flex-col items-center justify-center py-20 px-10 rounded-2xl border-2 border-dashed border-neutral-100 hover:border-neutral-900 bg-neutral-50/30 hover:bg-white transition-all duration-500">

                    {status === "processing" ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-neutral-900 animate-spin" />
                        <span className="text-neutral-900 font-bold text-[10px] uppercase tracking-widest">Optimizing Data...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 bg-white border border-neutral-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                          <Upload className="w-5 h-5 text-neutral-400" />
                        </div>
                        <h3 className="text-neutral-900 font-bold uppercase tracking-widest text-[10px] mb-2">Upload Source File</h3>
                        <p className="text-neutral-400 text-xs">Drop image or click to browse</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Minimal Error Box */}
        {fileError && (
          <div className="mt-8 flex items-center justify-center gap-2 text-red-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{fileError}</span>
          </div>
        )}
      </div>
    </div>
  );
}