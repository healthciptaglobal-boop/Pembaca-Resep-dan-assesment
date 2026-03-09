import React, { useRef, useState, useCallback } from 'react';
import { Camera as CameraIcon, RotateCcw, Check } from 'lucide-react';

interface CameraProps {
  onCapture: (imageB64: string) => void;
  onCancel: () => void;
}

export const Camera: React.FC<CameraProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Gagal mengakses kamera. Pastikan izin diberikan.");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const data = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setCapturedImage(data);
        stopCamera();
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirm = () => {
    if (capturedImage) {
      onCapture(capturedImage.split(',')[1]);
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      {!capturedImage ? (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-10 flex gap-10">
            <button 
              onClick={onCancel}
              className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full font-medium"
            >
              Batal
            </button>
            <button 
              onClick={capture}
              className="bg-white p-6 rounded-full shadow-lg"
            >
              <CameraIcon className="w-8 h-8 text-black" />
            </button>
          </div>
        </>
      ) : (
        <>
          <img src={capturedImage} className="w-full h-full object-contain" alt="Captured" />
          <div className="absolute bottom-10 flex gap-10">
            <button 
              onClick={retake}
              className="bg-white/20 backdrop-blur-md text-white p-4 rounded-full"
            >
              <RotateCcw className="w-8 h-8" />
            </button>
            <button 
              onClick={confirm}
              className="bg-emerald-500 text-white p-4 rounded-full shadow-lg"
            >
              <Check className="w-8 h-8" />
            </button>
          </div>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
