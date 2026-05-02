/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {motion, AnimatePresence} from 'motion/react';
import {useState, useEffect} from 'react';
import {LOADING_IMAGES} from '../types';

export default function LoadingScreen({onFinished}: {onFinished: () => void}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < LOADING_IMAGES.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 300); // 300ms per frame
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onFinished();
      }, 1000); // Wait 1s after last frame
      return () => clearTimeout(timer);
    }
  }, [currentIndex, onFinished]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-sacred-blue overflow-hidden">
      <div className="relative w-full h-full max-w-2xl max-h-[600px] px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{opacity: 0, scale: 0.95}}
            animate={{opacity: 1, scale: 1}}
            exit={{opacity: 0, scale: 1.05}}
            transition={{duration: 0.3}}
            className="w-full h-full rounded-2xl overflow-hidden glass shadow- gold/20 border-gold/10"
          >
            <img
              src={LOADING_IMAGES[currentIndex]}
              alt={`Loading frame ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-sacred-blue via-transparent to-transparent opacity-60" />
            
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center w-full px-8">
              <motion.h1 
                initial={{y: 20, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                className="text-4xl font-bold text-white tracking-widest font-sans mb-2 drop-shadow-lg"
              >
                NEXA AI
              </motion.h1>
              <div className="flex justify-center gap-1.5">
                {LOADING_IMAGES.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === currentIndex ? 'w-8 bg-gold' : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <motion.div 
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{delay: 0.5}}
        className="mt-8 text-gold/60 font-medium tracking-[0.2em] text-sm animate-pulse"
      >
        INITIATING DIVINE INTELLIGENCE
      </motion.div>
    </div>
  );
}
