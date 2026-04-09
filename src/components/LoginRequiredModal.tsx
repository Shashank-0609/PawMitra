import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginRequiredModal({ isOpen, onClose }: LoginRequiredModalProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400"
            >
              <X size={20} />
            </button>

            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-beige rounded-3xl flex items-center justify-center mx-auto mb-8 text-navy shadow-inner">
                <Lock size={36} />
              </div>
              
              <h2 className="text-2xl font-bold mb-4 text-navy">Login Required</h2>
              <p className="text-stone-500 mb-10 leading-relaxed">
                Please login the website to watch the details in it.
              </p>

              <div className="space-y-3">
                <button 
                  onClick={() => {
                    onClose();
                    navigate('/auth');
                  }}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-2"
                >
                  <LogIn size={18} /> Login Now
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-4 text-stone-400 font-bold hover:text-navy transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
