import { create } from 'zustand';
import { DrawingData, Stroke } from '@/types/fish';

interface DrawingState {
  isDrawing: boolean;
  currentStroke: Stroke | null;
  strokes: Stroke[];
  canvasSize: { width: number; height: number };
  brushSize: number;
  brushColor: string;
  tool: 'pen' | 'eraser';
  aiScore: number | null;
  aiConfidence: number | null;
  isAiProcessing: boolean;
  drawingStartTime: number | null;
  
  // Actions
  startDrawing: () => void;
  stopDrawing: () => void;
  addPoint: (x: number, y: number, pressure?: number) => void;
  finishStroke: () => void;
  clearCanvas: () => void;
  setBrushSize: (size: number) => void;
  setBrushColor: (color: string) => void;
  setTool: (tool: 'pen' | 'eraser') => void;
  setCanvasSize: (width: number, height: number) => void;
  setAiResults: (score: number, confidence: number) => void;
  setAiProcessing: (processing: boolean) => void;
  getDrawingData: () => DrawingData;
  loadDrawingData: (data: DrawingData) => void;
  undo: () => void;
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
  isDrawing: false,
  currentStroke: null,
  strokes: [],
  canvasSize: { width: 400, height: 240 },
  brushSize: 3,
  brushColor: '#000000',
  tool: 'pen',
  aiScore: null,
  aiConfidence: null,
  isAiProcessing: false,
  drawingStartTime: null,

  startDrawing: () => {
    const startTime = get().drawingStartTime;
    set({ 
      isDrawing: true,
      drawingStartTime: startTime || Date.now()
    });
  },

  stopDrawing: () => {
    set({ isDrawing: false });
  },

  addPoint: (x: number, y: number, pressure = 1) => {
    const state = get();
    if (!state.isDrawing) return;

    if (!state.currentStroke) {
      const newStroke: Stroke = {
        points: [{ x, y, pressure }],
        color: state.brushColor,
        width: state.brushSize,
        tool: state.tool,
        timestamp: Date.now(),
      };
      set({ currentStroke: newStroke });
    } else {
      const updatedStroke = {
        ...state.currentStroke,
        points: [...state.currentStroke.points, { x, y, pressure }],
      };
      set({ currentStroke: updatedStroke });
    }
  },

  finishStroke: () => {
    const state = get();
    if (state.currentStroke) {
      set({
        strokes: [...state.strokes, state.currentStroke],
        currentStroke: null,
      });
    }
  },

  clearCanvas: () => {
    set({
      strokes: [],
      currentStroke: null,
      aiScore: null,
      aiConfidence: null,
      drawingStartTime: null,
    });
  },

  setBrushSize: (size: number) => set({ brushSize: size }),
  setBrushColor: (color: string) => set({ brushColor: color }),
  setTool: (tool: 'pen' | 'eraser') => set({ tool }),
  setCanvasSize: (width: number, height: number) => set({ canvasSize: { width, height } }),
  setAiResults: (score: number, confidence: number) => set({ aiScore: score, aiConfidence: confidence }),
  setAiProcessing: (processing: boolean) => set({ isAiProcessing: processing }),

  getDrawingData: (): DrawingData => {
    const state = get();
    const allStrokes = state.currentStroke 
      ? [...state.strokes, state.currentStroke]
      : state.strokes;
    
    return {
      strokes: allStrokes,
      dimensions: state.canvasSize,
      duration: state.drawingStartTime ? Math.floor((Date.now() - state.drawingStartTime) / 1000) : 0,
    };
  },

  loadDrawingData: (data: DrawingData) => {
    set({
      strokes: data.strokes,
      canvasSize: data.dimensions,
      drawingStartTime: Date.now() - (data.duration * 1000),
    });
  },

  undo: () => {
    const state = get();
    if (state.strokes.length > 0) {
      set({ strokes: state.strokes.slice(0, -1) });
    }
  },
}));