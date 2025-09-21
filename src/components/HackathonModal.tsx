import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HackathonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HackathonModal: React.FC<HackathonModalProps> = ({ isOpen, onClose }) => {
  const handlePlayNow = () => {
    alert('Welcome to The Dumb Hackathon! 🎉\n\nGet ready to build the most brilliantly dumb AI projects!');
    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/20 p-10 text-center overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 hover:rotate-90"
            >
              <X size={24} />
            </button>

            {/* Logo Section */}
            <div className="mb-8">
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, times: [0, 0.4, 1] }}
                className="text-6xl mb-4"
              >
                🤖
              </motion.div>
              <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                THE DUMB HACKATHON
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                AI Valley presents the most brilliantly dumb event
              </p>
            </div>

            {/* Event Details */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-5 mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-slate-600">📅 Date</span>
                <span className="text-sm font-bold text-slate-900">SEPT 20, 2024</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-slate-600">📍 Location</span>
                <span className="text-sm font-bold text-slate-900">Pebblebed</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-600">🎯 Theme</span>
                <span className="text-sm font-bold text-slate-900">Brilliantly Dumb AI</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 mb-6">
              <motion.a
                href="https://buy.stripe.com/28E14o2KL0yAgdP8pC8og03"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                💳 Buy Dumb Pass
                <span className="bg-gray-900 text-white px-2 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide">
                  Black Market
                </span>
                <motion.span
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-extrabold"
                >
                  $9.99
                </motion.span>
              </motion.a>
              
              <motion.button
                onClick={handlePlayNow}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                🚀 Play Now
              </motion.button>
            </div>

            {/* Sponsors */}
            <div className="pt-5 border-t border-slate-200">
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
                Powered by
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Toolhouse • Vapi • Pebblebed • Google • 11ElevenLabs
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};