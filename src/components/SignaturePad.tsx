import React, { useRef, useState, useEffect } from 'react';
import { Eraser, RotateCcw, PenTool, CheckCircle2 } from 'lucide-react';

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string | null) => void;
  requiredError?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSignatureChange,
  requiredError = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);

  // Initialize canvas with high-DPI scaling
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || 400;
    const height = 180;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = '#0F2B5C'; // Official Navy Blue ink
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  useEffect(() => {
    setupCanvas();
    const handleResize = () => {
      // Re-setup if necessary without breaking state if no strokes yet
      if (strokeCount === 0) {
        setupCanvas();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [strokeCount]);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (!hasSignature) {
      setHasSignature(true);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already released
    }

    setStrokeCount((prev) => prev + 1);
    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange(dataUrl);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasSignature(false);
    setStrokeCount(0);
    onSignatureChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <PenTool className="w-4 h-4 text-[#0F2B5C]" />
          <span>Tanda Tangan Digital Orang Tua / Wali</span>
          <span className="text-red-500 font-bold">*</span>
        </label>
        {hasSignature && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Terisi
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 leading-normal">
        Gunakan sentuhan jari (layar sentuh HP/Tablet) atau kursor mouse (komputer) untuk membubuhkan tanda tangan.
      </p>

      {/* Signature Canvas Area */}
      <div
        ref={containerRef}
        className={`relative w-full rounded-2xl bg-white border-2 transition-all overflow-hidden ${
          requiredError && !hasSignature
            ? 'border-red-500 ring-4 ring-red-100 bg-red-50/10'
            : hasSignature
            ? 'border-blue-400 shadow-sm'
            : 'border-slate-300 hover:border-blue-300'
        }`}
        style={{ minHeight: '180px' }}
      >
        {/* Helper baseline */}
        <div className="absolute inset-x-6 bottom-8 border-b border-dashed border-slate-300 pointer-events-none flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-medium select-none tracking-wider uppercase">
            Garis Batas Tanda Tangan
          </span>
          <span className="text-[10px] text-slate-400 select-none">
            Ttd. Orang Tua / Wali
          </span>
        </div>

        {/* Empty state prompt */}
        {!hasSignature && !isDrawing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 gap-1.5">
            <PenTool className="w-6 h-6 text-slate-300 animate-bounce" />
            <span className="text-xs font-medium">Goreskan tanda tangan di sini</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-[180px] cursor-crosshair touch-none block"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Action Buttons: Hapus Tanda Tangan & Ulangi */}
      <div className="flex items-center justify-between pt-1 gap-2">
        <div className="text-xs text-slate-400">
          {hasSignature ? `${strokeCount} goresan tersimpan` : 'Belum ada goresan'}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasSignature}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              hasSignature
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Ulangi
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasSignature}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              hasSignature
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            Hapus Tanda Tangan
          </button>
        </div>
      </div>

      {requiredError && !hasSignature && (
        <div className="text-xs font-semibold text-red-600 flex items-center gap-1 mt-1">
          <span>* Tanda tangan digital wajib dibubuhkan sebelum mengirim persetujuan.</span>
        </div>
      )}
    </div>
  );
};
