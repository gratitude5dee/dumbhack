import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDrawingStore } from '@/stores/useDrawingStore';
import { cn } from '@/lib/utils';
import { SubmissionModal } from './SubmissionModal';

interface DrawingCanvasProps {
  className?: string;
  onSubmit?: (imageData: string, drawingData: any, userData?: { name: string; phone: string }) => void;
  aiEnabled?: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  className,
  onSubmit,
  aiEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedImageData, setCapturedImageData] = useState<string>('');
  
  const {
    strokes,
    currentStroke,
    brushSize,
    brushColor,
    tool,
    canvasSize,
    aiScore,
    isAiProcessing,
    startDrawing,
    stopDrawing,
    addPoint,
    finishStroke,
    clearCanvas,
    getDrawingData,
    setCanvasSize,
  } = useDrawingStore();

  // Set up canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setCanvasSize(rect.width, rect.height);

    // Set up high DPI support
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }
  }, [setCanvasSize]);

  // Render strokes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas background based on AI feedback
    if (aiScore !== null) {
      const opacity = Math.min(aiScore * 0.3, 0.3);
      ctx.fillStyle = `rgba(34, 197, 94, ${opacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw all completed strokes
    [...strokes, currentStroke].filter(Boolean).forEach(stroke => {
      if (!stroke || stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.lineWidth = stroke.width;
      ctx.strokeStyle = stroke.tool === 'eraser' ? '#FFFFFF' : stroke.color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      const firstPoint = stroke.points[0];
      ctx.moveTo(firstPoint.x, firstPoint.y);

      for (let i = 1; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
    });

    ctx.globalCompositeOperation = 'source-over';
  }, [strokes, currentStroke, aiScore]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    startDrawing();
    addPoint(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    addPoint(x, y);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    stopDrawing();
    finishStroke();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setIsDrawing(true);
    startDrawing();
    addPoint(x, y);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    addPoint(x, y);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseUp();
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL('image/png');
    setCapturedImageData(imageData);
    setShowSubmissionModal(true);
  };

  const handleModalSubmit = async (userData: { name: string; phone: string }) => {
    if (!onSubmit || !capturedImageData) return;

    setIsSubmitting(true);
    try {
      const drawingData = getDrawingData();
      await onSubmit(capturedImageData, drawingData, userData);
      setShowSubmissionModal(false);
      setCapturedImageData('');
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (!isSubmitting) {
      setShowSubmissionModal(false);
      setCapturedImageData('');
    }
  };

  const getAiFeedbackColor = () => {
    if (aiScore === null) return 'border-border';
    if (aiScore > 0.7) return 'border-green-500';
    if (aiScore > 0.4) return 'border-yellow-500';
    return 'border-red-500';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* AI Feedback */}
      {aiEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {isAiProcessing ? (
            <p className="text-sm text-muted-foreground">AI analyzing your drawing...</p>
          ) : aiScore !== null ? (
            <p className="text-sm font-medium">
              Labubu confidence: {Math.round(aiScore * 100)}%
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Draw a cute labubu character!</p>
          )}
        </motion.div>
      )}

      {/* Canvas */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={240}
          className={cn(
            'border-2 rounded-lg bg-white cursor-crosshair select-none',
            'shadow-sm hover:shadow-md transition-shadow',
            getAiFeedbackColor()
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            width: '100%',
            maxWidth: '400px',
            height: 'auto',
            aspectRatio: '400/240',
          }}
        />
      </motion.div>

      {/* Controls */}
      <div className="flex justify-center gap-2">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors"
        >
          Clear
        </button>
        {onSubmit && (
          <button
            onClick={handleSubmit}
            disabled={strokes.length === 0}
            className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add to collection!
          </button>
        )}
      </div>

      <SubmissionModal
        isOpen={showSubmissionModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
        imagePreview={capturedImageData}
      />
    </div>
  );
};