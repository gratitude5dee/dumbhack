import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Eraser, Undo, Settings, X, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDrawingStore } from '@/stores/useDrawingStore';
import { useIsMobile } from '@/hooks/use-mobile';

export const MobileDrawingToolbar: React.FC = () => {
  // Component removed to enhance mobile drawing canvas accessibility
  return null;
};