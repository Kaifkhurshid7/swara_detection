import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import {
  Upload,
  Camera,
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { isMobile } from "../utils/device";

const SCAN_IMAGE_KEY = "swaralipi_scan_image";

export default function Scanner() {
  const navigate = useNavigate();
  const [fileError, setFileError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const mobile = isMobile();

  const handleDataIngestion = useCallback(
    (dataUrl: string) => {
      setIsProcessing(true);
      try {
        // Professional storage handling: check string size
        const sizeInMb = (dataUrl.length * (3 / 4)) / (1024 * 1024);
        if (sizeInMb > 4.5) {
          throw new Error("Payload exceeds 5MB buffer limit.");
        }

        localStorage.setItem(SCAN_IMAGE_KEY, dataUrl);
        // Simulate a small delay for "Neural Warmup" feel
        setTimeout(() => navigate("/result"), 800);
      } catch (e) {
        setIsProcessing(false);
        setFileError("Memory limit exceeded. Please upload a compressed JPG.");
      }
    },
    [navigate]
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFileError("Invalid file type. Please provide an image (JPG, PNG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => handleDataIngestion(reader.result as string);
    reader.onerror = () => setFileError("Hardware read error occurred.");
    reader.readAsDataURL(file);
  };

  const handleCapture = useCallback(() => {
    if (!webcamRef.current) return;
    const src = webcamRef.current.getScreenshot();
    if (src) handleDataIngestion(src);
  }, [handleDataIngestion]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6">

      {/* Utility Header */}
      <div className="absolute top-8 left-8 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-400 group-hover:text-black" />
        </button>
        <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">
          Ingestion Node: {mobile ? "Mobile_Cam" : "Disk_Upload"}
        </span>
      </div>

      <div className="w-full max-w-2xl">
        {/* Title Block */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-neutral-900 mb-2">
            Supply Notation Data
          </h1>
          <p className="text-neutral-500 text-sm">
            High-contrast images yield the highest classification accuracy.
          </p>
        </div>

        {/* Main Interface Card */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
          {mobile ? (
            /* Mobile View Camera UI */
            <div className="p-4">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="absolute inset-0 w-full h-full object-cover grayscale-[0.2]"
                  videoConstraints={{ facingMode: "environment" }}
                />

                {/* Viewfinder Overlay */}
                <div className="absolute inset-0 border-[20px] border-black/20 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/30 rounded-lg pointer-events-none" />

                {isProcessing && (
                  <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
                    <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
                    <span className="text-white text-[10px] font-bold tracking-widest uppercase">Processing Buffer</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleCapture}
                disabled={isProcessing}
                className="mt-4 w-full h-16 rounded-2xl bg-neutral-900 text-white flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-[0.98]"
              >
                <Camera className="w-5 h-5" />
                <span className="font-bold uppercase tracking-widest text-xs">Capture Snapshot</span>
              </button>
            </div>
          ) : (
            /* Desktop View Upload UI */
            <div className="p-2">
              <label className="group relative block cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={isProcessing} />
                <div className="flex flex-col items-center justify-center py-24 px-8 rounded-[1.25rem] border-2 border-dashed border-neutral-200 bg-neutral-50 group-hover:bg-white group-hover:border-neutral-900 transition-all duration-500">

                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                      <span className="text-neutral-900 font-bold text-xs uppercase tracking-widest">Optimizing Data...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white border border-neutral-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-xl transition-all">
                        <Upload className="w-6 h-6 text-neutral-400 group-hover:text-black" />
                      </div>
                      <h3 className="text-neutral-900 font-bold uppercase tracking-widest text-xs mb-2">Select Manuscript</h3>
                      <p className="text-neutral-400 text-sm">Drag and drop or click to browse local files</p>
                    </>
                  )}
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Footer Guidance */}
        {/* <div className="mt-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Secure Encryption
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase">
            <ImageIcon className="w-3.5 h-3.5" /> Max Payload: 5MB
          </div>
        </div> */}

        {/* Error Notification */}
        {fileError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-xs font-bold text-red-600 uppercase tracking-tight">{fileError}</p>
          </div>
        )}
      </div>
    </div>
  );
}