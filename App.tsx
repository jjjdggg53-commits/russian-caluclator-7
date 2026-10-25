/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Star, Sparkles, Terminal } from 'lucide-react';
import { AccessMode } from './types';
import RussianCalculator from './RussianCalculator';
import GamingHub from './GamingHub';

export default function App() {
  const [accessMode, setAccessMode] = useState<AccessMode>('calculator');

  const handleUnlock = (mode: AccessMode) => {
    setAccessMode(mode);
  };

  const handleLogout = () => {
    setAccessMode('calculator');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden font-sans select-none" id="app-viewport">
      {/* Background Cyberpunk Grid/Stars Matrix decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c101a_1px,transparent_1px),linear-gradient(to_bottom,#0c101a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-vfd-green/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="flex-grow flex flex-col relative z-10 w-full" id="app-content-wrapper">
        <AnimatePresence mode="wait">
          {accessMode === 'calculator' ? (
            <motion.div
              key="calculator-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex-grow flex flex-col items-center justify-center p-4 md:p-8"
              id="calc-screen-wrapper"
            >
              {/* Subtle top banner */}
              <div className="mb-4 flex items-center gap-2 px-3 py-1 bg-zinc-900/60 border border-zinc-800 rounded-full text-[10px] font-mono text-zinc-400 tracking-wider uppercase" id="top-banner">
                <Terminal className="h-3.5 w-3.5 text-soviet-red animate-pulse" />
                <span>Запуск Системы • Нажмите Кнопку Пароля или Введите на Клавиатуре</span>
              </div>

              <RussianCalculator onUnlock={handleUnlock} />

              {/* Classic aesthetic footer */}
              <footer className="mt-8 text-[11px] font-mono text-zinc-600 uppercase tracking-widest text-center" id="app-footer">
                Разработка Электроника © 1987-2026 • ВСЕ ПРАВА ЗАЩИЩЕНЫ
              </footer>
            </motion.div>
          ) : (
            <motion.div
              key="gaming-hub-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full flex-grow flex flex-col"
              id="hub-screen-wrapper"
            >
              <GamingHub accessMode={accessMode} onLogout={handleLogout} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
