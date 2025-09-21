import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Eraser, Undo, Settings, X, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDrawingStore } from '@/stores/useDrawingStore';
import { useIsMobile } from '@/hooks/use-mobile';

export const MobileDrawingToolbar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const isMobile = useIsMobile();

  const {
    brushSize,
    brushColor,
    tool,
    setBrushSize,
    setBrushColor,
    setTool,
    undo,
    clearCanvas,
  } = useDrawingStore();

  // Predefined colors for easy selection
  const colors = [
    '#000000', '#333333', '#666666', '#999999',
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  ];

  if (!isMobile) return null;

  const handleBrushSizeChange = (increment: boolean) => {
    const newSize = increment 
      ? Math.min(brushSize + 1, 20) 
      : Math.max(brushSize - 1, 1);
    setBrushSize(newSize);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "fixed bottom-24 right-4 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg",
          "flex items-center justify-center touch-manipulation",
          "active:scale-95 transition-all"
        )}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded ? <X className="w-6 h-6" /> : <Palette className="w-6 h-6" />}
        </motion.div>
      </motion.button>

      {/* Expanded Toolbar */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={cn(
              "fixed bottom-40 right-4 z-40 bg-card rounded-xl shadow-xl border p-4",
              "w-64 max-w-[calc(100vw-2rem)]"
            )}
          >
            {/* Tool Selection */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Tools</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setTool('pen')}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all",
                    "min-h-[44px] flex items-center justify-center gap-2",
                    tool === 'pen'
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  )}
                >
                  <Palette className="w-4 h-4" />
                  Pen
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all",
                    "min-h-[44px] flex items-center justify-center gap-2",
                    tool === 'eraser'
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  )}
                >
                  <Eraser className="w-4 h-4" />
                  Eraser
                </button>
              </div>
            </div>

            {/* Brush Size */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Brush Size: {brushSize}px</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBrushSizeChange(false)}
                  className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center touch-manipulation"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 h-2 bg-muted rounded-full relative">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(brushSize / 20) * 100}%` }}
                  />
                </div>
                <button
                  onClick={() => handleBrushSizeChange(true)}
                  className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center touch-manipulation"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Color Picker */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Color</h3>
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-8 h-8 rounded-full border-2 border-border"
                  style={{ backgroundColor: brushColor }}
                />
              </div>
              
              <AnimatePresence>
                {showColorPicker && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-4 gap-2 overflow-hidden"
                  >
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setBrushColor(color);
                          setShowColorPicker(false);
                        }}
                        className={cn(
                          "w-full aspect-square rounded-lg border-2 touch-manipulation",
                          "active:scale-95 transition-transform",
                          brushColor === color ? "border-ring" : "border-border"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={undo}
                className="flex-1 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium text-sm min-h-[44px] flex items-center justify-center gap-2 touch-manipulation"
              >
                <Undo className="w-4 h-4" />
                Undo
              </button>
              <button
                onClick={() => {
                  clearCanvas();
                  setIsExpanded(false);
                }}
                className="flex-1 px-3 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium text-sm min-h-[44px] flex items-center justify-center touch-manipulation"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/20 z-30"
          />
        )}
      </AnimatePresence>
    </>
  );
};