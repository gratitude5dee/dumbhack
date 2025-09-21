import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDrawingStore } from '@/stores/useDrawingStore';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { SubmissionModal } from './SubmissionModal';
import { MobileDrawingToolbar } from './MobileDrawingToolbar';


interface DrawingCanvasProps {
  className?: string;
  onSubmit?: (imageData: string, drawingData: any, userData?: { name: string; phone: string }) => Promise<void>;
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
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [lastTouchTime, setLastTouchTime] = useState(0);
  const isMobile = useIsMobile();
  
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

  // Set up canvas with mobile-optimized sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const aspectRatio = isMobile ? 4 / 3 : 3 / 2; // Better aspect ratios for drawing
      
      // Increased canvas sizing for better drawing experience
      const maxWidth = isMobile ? Math.min(window.innerWidth - 24, 420) : 600;
      const width = Math.min(rect.width, maxWidth);
      const height = width / aspectRatio;
      
      setCanvasSize(width, height);

        // Enhanced high DPI support with improved rendering
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = Math.min(window.devicePixelRatio || 1, 3); // Support up to 3x for crisp rendering
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
          ctx.scale(dpr, dpr);
          
          // Enhanced rendering settings for smoother drawing
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Better antialiasing
          ctx.translate(0.5, 0.5);
          ctx.translate(-0.5, -0.5);
        }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('orientationchange', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('orientationchange', updateCanvasSize);
    };
  }, [setCanvasSize, isMobile]);

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

    // Draw all completed strokes with improved smoothing
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

      const points = stroke.points;
      
      if (points.length === 2) {
        // Simple line for two points
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
      } else if (points.length > 2) {
        // Smooth curves using quadratic curves for better drawing experience
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length - 1; i++) {
          const currentPoint = points[i];
          const nextPoint = points[i + 1];
          
          // Create control point between current and next point for smoothing
          const controlX = (currentPoint.x + nextPoint.x) / 2;
          const controlY = (currentPoint.y + nextPoint.y) / 2;
          
          ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlX, controlY);
        }
        
        // Draw to the last point
        const lastPoint = points[points.length - 1];
        ctx.lineTo(lastPoint.x, lastPoint.y);
      }

      ctx.stroke();
    });

    ctx.globalCompositeOperation = 'source-over';
  }, [strokes, currentStroke, aiScore]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    setIsDrawing(true);
    startDrawing();
    addPoint(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Throttle mouse movements for smoother performance
    requestAnimationFrame(() => {
      addPoint(x, y);
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    stopDrawing();
    finishStroke();
  };

  // Enhanced touch handling with palm rejection and pressure sensitivity
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const now = Date.now();
    
    // Simple palm rejection: ignore very large touch areas or rapid successive touches
    const touch = e.touches[0];
    const touchSize = (touch as any).radiusX || 0;
    if (touchSize > 20 || (now - lastTouchTime < 10)) return;
    
    setLastTouchTime(now);

    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    
    // Pressure sensitivity for supported devices
    const pressure = (touch as any).force || 1;

    setIsDrawing(true);
    startDrawing();
    addPoint(x, y, pressure);
    
    // Haptic feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(1);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDrawing || e.touches.length !== 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    
    const pressure = (touch as any).force || 1;
    addPoint(x, y, pressure);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDrawing) {
      setIsDrawing(false);
      stopDrawing();
      finishStroke();
    }
  };

  const handleSubmit = useCallback(() => {
    if (strokes.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);
    setShowSubmissionModal(true);
  }, [strokes]);

  const handleModalSubmit = useCallback(async (userData: { name: string; phone: string }) => {
    setIsSubmitting(true);
    try {
      const drawingData = getDrawingData();
      await onSubmit?.(capturedImage, drawingData, userData);
      setShowSubmissionModal(false);
      setCapturedImage('');
    } finally {
      setIsSubmitting(false);
    }
  }, [capturedImage, getDrawingData, onSubmit]);

  const handleModalClose = useCallback(() => {
    setShowSubmissionModal(false);
    setCapturedImage('');
  }, []);


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
          className={cn(
            'border-2 rounded-lg bg-white select-none',
            'shadow-sm hover:shadow-md transition-all duration-200',
            'touch-none', // Prevents default touch behaviors
            isMobile ? 'cursor-none' : 'cursor-crosshair',
            getAiFeedbackColor()
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onContextMenu={(e) => e.preventDefault()} // Prevent context menu
          style={{
            width: '100%',
            maxWidth: isMobile ? '420px' : '600px',
            height: 'auto',
            aspectRatio: isMobile ? '4/3' : '3/2',
            touchAction: 'none', // Critical for preventing scroll while drawing
          }}
        />
      </motion.div>

      {/* Mobile-optimized Controls */}
      <div className={cn(
        "flex justify-center gap-2 flex-wrap",
        isMobile && "gap-3"
      )}>
        <button
          onClick={clearCanvas}
          className={cn(
            "px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors",
            "active:scale-95", // Touch feedback
            isMobile && "min-h-[44px] px-6 text-base" // Larger touch targets for mobile
          )}
        >
          Clear
        </button>
        {onSubmit && (
          <button
            onClick={handleSubmit}
            disabled={strokes.length === 0 || isSubmitting}
            className={cn(
              "px-6 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all",
              "active:scale-95", // Touch feedback
              isMobile && "min-h-[44px] px-8 text-base font-medium" // Larger for mobile
            )}
          >
            {isMobile ? "Add!" : "Add to collection!"}
          </button>
        )}
      </div>

      <SubmissionModal
        isOpen={showSubmissionModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
        imagePreview={capturedImage}
      />
      
      <MobileDrawingToolbar />
    </div>
  );
};