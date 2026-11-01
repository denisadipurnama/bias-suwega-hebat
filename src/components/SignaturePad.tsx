import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, RotateCcw, PenTool, CheckCircle2, Eye } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

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
  
  // Keep stroke points in memory so strokes can be redrawn and NEVER lost on re-renders
  const strokesRef = useRef<Point[][]>([]);
  const currentStrokeRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(false);

  const [hasSignature, setHasSignature] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Redraw all strokes from memory onto canvas
  const redrawAllStrokes = useCallback((ctx: CanvasRenderingContext2D, dpr: number) => {
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#0F2B5C'; // Official Navy Blue ink
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokesRef.current.forEach((stroke) => {
      if (stroke.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    });
    ctx.restore();
  }, []);

  // Initialize or re-dimension canvas
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width) || 360;
    const height = 180;
    const dpr = window.devicePixelRatio || 1;

    // Set internal resolution
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Re-render any existing strokes if any
      redrawAllStrokes(ctx, dpr);
    }
  }, [redrawAllStrokes]);

  // Setup canvas ONCE on mount and on window resize (NOT on stroke changes!)
  useEffect(() => {
    setupCanvas();

    const handleResize = () => {
      setupCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas]);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
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

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }

    const pt = getCoordinates(e);
    isDrawingRef.current = true;
    currentStrokeRef.current = [pt];

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#0F2B5C';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    // Draw a dot in case of single tap
    ctx.lineTo(pt.x + 0.1, pt.y + 0.1);
    ctx.stroke();
    ctx.restore();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pt = getCoordinates(e);
    const stroke = currentStrokeRef.current;
    const prevPt = stroke[stroke.length - 1] || pt;
    stroke.push(pt);

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#0F2B5C';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(prevPt.x, prevPt.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    ctx.restore();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    isDrawingRef.current = false;

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }

    if (currentStrokeRef.current.length > 0) {
      strokesRef.current.push([...currentStrokeRef.current]);
      currentStrokeRef.current = [];
    }

    const total = strokesRef.current.length;
    if (total > 0) {
      setHasSignature(true);
      setStrokeCount(total);
      const dataUrl = canvas.toDataURL('image/png');
      setPreviewUrl(dataUrl);
      onSignatureChange(dataUrl);
    }
  };

  const handleClear = () => {
    strokesRef.current = [];
    currentStrokeRef.current = [];
    isDrawingRef.current = false;
    setHasSignature(false);
    setStrokeCount(0);
    setPreviewUrl(null);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
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
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Tanda Tangan Tersimpan
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 leading-normal">
        Goreskan tanda tangan Anda menggunakan sentuhan jari (layar HP/Tablet) atau kursor mouse (komputer).
      </p>

      {/* Signature Canvas Area */}
      <div
        ref={containerRef}
        className={`relative w-full rounded-2xl bg-white border-2 transition-all overflow-hidden ${
          requiredError && !hasSignature
            ? 'border-red-500 ring-4 ring-red-100 bg-red-50/10'
            : hasSignature
            ? 'border-blue-500 shadow-sm'
            : 'border-slate-300 hover:border-blue-400'
        }`}
        style={{ minHeight: '180px', touchAction: 'none' }}
      >
        {/* Helper baseline */}
        <div className="absolute inset-x-6 bottom-7 border-b border-dashed border-slate-300 pointer-events-none flex items-center justify-between select-none">
          <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
            Area Goresan Tanda Tangan
          </span>
          <span className="text-[10px] text-slate-400">
            Ttd. Orang Tua / Wali
          </span>
        </div>

        {/* Empty state prompt */}
        {!hasSignature && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 gap-1.5 select-none">
            <PenTool className="w-6 h-6 text-slate-300 animate-bounce" />
            <span className="text-xs font-medium">Sentuh dan goreskan tanda tangan Anda di sini</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-[180px] cursor-crosshair block"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Action Buttons: Hapus Tanda Tangan & Ulangi + Status */}
      <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
        <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
          {hasSignature ? (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              {strokeCount} goresan terdata
            </span>
          ) : (
            <span className="text-slate-400">Belum ada goresan tanda tangan</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasSignature}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              hasSignature
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer shadow-2xs'
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
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              hasSignature
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 cursor-pointer shadow-2xs'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            Hapus Tanda Tangan
          </button>
        </div>
      </div>

      {/* Visual confirmation preview when signature is present */}
      {previewUrl && hasSignature && (
        <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-blue-700" />
            <span>Pratinjau tanda tangan yang akan dikirim:</span>
          </div>
          <div className="bg-white px-2 py-1 rounded border border-blue-200">
            <img src={previewUrl} alt="Pratinjau Ttd" className="h-6 max-w-[90px] object-contain" />
          </div>
        </div>
      )}

      {requiredError && !hasSignature && (
        <div className="text-xs font-semibold text-red-600 flex items-center gap-1 mt-1">
          <span>* Tanda tangan digital wajib dibubuhkan sebelum mengirim persetujuan.</span>
        </div>
      )}
    </div>
  );
};
