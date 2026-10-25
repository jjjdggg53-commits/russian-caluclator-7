/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, Sparkles, KeyRound, HelpCircle, Flame } from 'lucide-react';
import { AccessMode } from './types';

interface RussianCalculatorProps {
  onUnlock: (mode: AccessMode) => void;
}

export default function RussianCalculator({ onUnlock }: RussianCalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPasscodeForm, setShowPasscodeForm] = useState(false);
  const [error, setError] = useState('');
  const [flashScreen, setFlashScreen] = useState(false);

  // Key press listener for the physical keyboard calculator usage!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPasscodeForm) return; // ignore if typing passcode

      const key = e.key;
      if (/[0-9]/.test(key)) {
        handleNumber(key);
      } else if (['+', '-', '*', '/'].includes(key)) {
        handleOperator(key === '*' ? '×' : key === '/' ? '÷' : key);
      } else if (key === 'Enter' || key === '=') {
        handleCalculate();
      } else if (key === 'Backspace') {
        handleBackspace();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, equation, showPasscodeForm]);

  const handleNumber = (num: string) => {
    setDisplay((prev) => {
      if (prev === '0' || prev === 'ОШИБКА' || prev === 'ДОСТУП') {
        return num;
      }
      return prev + num;
    });
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleBackspace = () => {
    setDisplay((prev) => {
      if (prev.length <= 1 || prev === 'ОШИБКА' || prev === 'ДОСТУП') {
        return '0';
      }
      return prev.slice(0, -1);
    });
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setError('');
  };

  const checkSecretCode = (code: string): boolean => {
    if (code === '1987') {
      setFlashScreen(true);
      setDisplay('ИГРОК-87'); // "PLAYER-87" in Russian-like look
      setTimeout(() => {
        onUnlock('player');
      }, 1000);
      return true;
    } else if (code === '20186356') {
      setFlashScreen(true);
      setDisplay('ГЛАВНЫЙ'); // "MAIN/ROOT" in Russian
      setTimeout(() => {
        onUnlock('admin');
      }, 1000);
      return true;
    }
    return false;
  };

  const handleCalculate = () => {
    // Check code in current display before evaluating math
    const trimmed = display.trim();
    if (checkSecretCode(trimmed)) return;

    if (!equation) return;

    try {
      const parts = equation.split(' ');
      const num1 = parseFloat(parts[0]);
      const op = parts[1];
      const num2 = parseFloat(display);

      let result = 0;
      if (op === '+') result = num1 + num2;
      else if (op === '-') result = num1 - num2;
      else if (op === '×') result = num1 * num2;
      else if (op === '÷') {
        if (num2 === 0) throw new Error('div 0');
        result = num1 / num2;
      }

      // Check if resulting calculation matches a code!
      const resultStr = String(Math.round(result));
      if (checkSecretCode(resultStr)) return;

      // format result
      let formattedResult = String(Number(result.toFixed(6)));
      if (formattedResult.length > 10) {
        formattedResult = result.toExponential(4);
      }
      setDisplay(formattedResult);
      setEquation('');
    } catch (err) {
      setDisplay('ОШИБКА'); // Cyrillic for "ERROR"
      setEquation('');
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = passcode.trim();
    if (trimmed === '1987') {
      onUnlock('player');
    } else if (trimmed === '20186356') {
      onUnlock('admin');
    } else {
      setError('НЕВЕРНЫЙ КОД (Invalid passcode)');
      playErrorBeep();
    }
  };

  const playErrorBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 120;
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {}
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-lg w-full" id="calc-view-container">
      {/* Retro Soviet branding title */}
      <div className="text-center mb-6" id="calc-title-box">
        <h1 className="text-3xl font-display font-bold tracking-widest text-soviet-red flex items-center justify-center gap-2 drop-shadow-[0_0_10px_rgba(230,57,70,0.5)]">
          <span>ЭЛЕКТРОНИКА</span> <Flame className="h-6 w-6 text-soviet-gold animate-pulse" />
        </h1>
        <p className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-widest">
          МК-1987 • СДЕЛАНО В СССР
        </p>
      </div>

      {/* Main Container with 3D retro metal feel */}
      <div className="bg-zinc-900 border-4 border-zinc-800 p-6 rounded-2xl shadow-2xl relative overflow-hidden w-full max-w-sm" id="calc-body-frame">
        {/* Metal faceplate highlights */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />

        {/* Vintage glowing Vacuum Fluorescent Display (VFD) */}
        <div 
          className={`bg-slate-950 border-2 border-zinc-700 p-4 rounded-lg mb-6 relative shadow-inner overflow-hidden transition-all duration-300 ${
            flashScreen ? 'bg-emerald-950/40 border-emerald-500/50' : ''
          }`}
          id="vfd-display"
        >
          {/* Subtle grid lines background overlay for scanlines effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none" />
          
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mb-1" id="vfd-status">
            <span className="tracking-widest">РЕЖИМ: АНАЛОГ</span>
            <span className="text-soviet-red animate-pulse flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-soviet-red" /> СЕТЬ
            </span>
          </div>

          {/* Equation tracking line */}
          <div className="text-right h-4 text-xs font-mono text-emerald-600/70 select-none overflow-hidden" id="vfd-equation">
            {equation || <span className="opacity-0">0</span>}
          </div>

          {/* Main output numbers with green/cyan tube glow */}
          <div className="text-right text-3xl font-mono font-bold tracking-wider text-vfd-green drop-shadow-[0_0_8px_rgba(0,245,212,0.8)] h-10 select-all overflow-hidden" id="vfd-output">
            {display}
          </div>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6" id="calc-pad-grid">
          {/* Row 1 */}
          <button
            id="btn-clear"
            onClick={handleClear}
            className="h-12 rounded bg-zinc-800 hover:bg-zinc-700 text-soviet-gold font-mono font-bold text-sm border-b-2 border-zinc-950 active:translate-y-0.5 transition-all shadow cursor-pointer"
          >
            СБР (C)
          </button>
          <button
            id="btn-back"
            onClick={handleBackspace}
            className="h-12 rounded bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-mono font-bold text-sm border-b-2 border-zinc-950 active:translate-y-0.5 transition-all shadow cursor-pointer"
          >
            ←
          </button>
          <button
            id="btn-op-div"
            onClick={() => handleOperator('÷')}
            className="h-12 rounded bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-mono font-bold text-lg border-b-2 border-zinc-950 active:translate-y-0.5 transition-all shadow cursor-pointer"
          >
            ÷
          </button>
          <button
            id="btn-op-mul"
            onClick={() => handleOperator('×')}
            className="h-12 rounded bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-mono font-bold text-lg border-b-2 border-zinc-950 active:translate-y-0.5 transition-all shadow cursor-pointer"
          >
            ×
          </button>

          {/* Row 2 */}
          <button
            id="btn-num-7"
            onClick={() => handleNumber('7')}
            className="h-12 rounded bg-zinc-700 hover:bg-zinc-650 text-white font-sans font-bold text-lg border-b-2 border-zinc-950 active:translate-y-0.5 transition-all shadow cursor-pointer"
          >
            7
          </button>
          <button
            id="btn-num-8"
            onClick={() => handleNumber('8')}
            className="h-12 rounded bg-zinc-700 hover:bg-zinc-650 text-white font-sans font-bold text-lg border-b-2 border-zinc-950 active:translate-y-0.5 transition-all shadow cursor-pointer"
          >
            8
          </button>
          <button
            id="btn-num-9"
            onClick={() => handleNumber('9')}
            className="h-12 rounded bg-zinc-700 hover:bg-zinc-650 text-white font-sans font-bold text-lg border-b-2 border-zinc-950 active:translate-y-0.5 transition-all shadow cursor-pointer"
          >
            9
          </button>
          <button
            id="btn-op-sub"
            onClick={() => handleOperator('-')}
            className="h-12 rounded bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-mono font-bold text-lg border-b-2 border-zinc-950 active:translate-y-0.5 transition-all shadow cursor-pointer"
          >
            -
          </button>

          {/* Row 3 */}
          <button
            id="btn-num-4"
            onClick={() => handleNumber('4')}
            className="h-12 rounded bg-zinc-700 hover:bg-zinc-650 text-white font-sans font-bold text-lg border-b-2 border-zinc-950 active:translate-y-0.5 transition-all shadow cursor-pointer"
          >
            4
          </button>
          <button
            id="btn-num-5"
            onClick={() => handleNumber('5')}
            className="h-12 rounded bg-zinc-700 hover:bg-zinc-650 text-white font-sans font-bold text-lg border-b-2 border-zinc-950 active:translate-y-0.5 transition-all shadow cursor-pointer"
          >
            5
          </button>
          <button
            id="btn-num-6"
            onClick={() => handleNumber('6')}
            className="h-12 rounded bg-zinc-700 hover:bg-zinc-650 text-white font-sans font-bold text-lg border-b-2 border-zinc-950 active:translate-y-0.5 transition-all shadow cursor-pointer"
          >
            6
          </button>
          <button
            id="btn-op-add"
            onClick={() => handleOperator('+')}
            className="h-12 rounded bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-mono font-bold text-lg border-b-2 border-zinc-950 active:translate-y-0.5 transition-all shadow cursor-pointer"
          >
            +
          </button>

          {/* Row 4 */}
          <button
            id="btn-num-1"
            onClick={() => handleNumber('1')}
            className="h-12 rounded bg-zinc-700 hover:bg-zinc-650 text-white font-sans font-bold text-lg border-b-2 border-zinc-950 active:translate-y-0.5 transition-all shadow cursor-pointer"
          >
            1
          </button>
          <button
            id="btn-num-2"
            onClick={() => handleNumber('2')}
            className="h-12 rounded bg-zinc-700 hover:bg-zinc-650 text-white font-sans font-bold text-lg border-b-2 border-zinc-950 active:translate-y-0.5 transition-all shadow cursor-pointer"
          >
            2
          </button>
          <button
            id="btn-num-3"
            onClick={() => handleNumber('3')}
            className="h-12 rounded bg-zinc-700 hover:bg-zinc-650 text-white font-sans font-bold text-lg border-b-2 border-zinc-950 active:translate-y-0.5 transition-all shadow cursor-pointer"
          >
            3
          </button>
          <button
            id="btn-op-eq"
            onClick={handleCalculate}
            className="h-28 rounded bg-soviet-red hover:bg-red-500 text-white font-mono font-bold text-xl border-b-4 border-red-950 row-span-2 flex items-center justify-center active:translate-y-0.5 transition-all shadow cursor-pointer"
          >
            =
          </button>

          {/* Row 5 */}
          <button
            id="btn-num-0"
            onClick={() => handleNumber('0')}
            className="h-12 rounded bg-zinc-700 hover:bg-zinc-650 text-white font-sans font-bold text-lg border-b-2 border-zinc-950 active:translate-y-0.5 transition-all shadow col-span-2 cursor-pointer"
          >
            0
          </button>
          <button
            id="btn-dot"
            onClick={() => handleNumber('.')}
            className="h-12 rounded bg-zinc-700 hover:bg-zinc-650 text-white font-mono font-bold text-lg border-b-2 border-zinc-950 active:translate-y-0.5 transition-all shadow cursor-pointer"
          >
            .
          </button>
        </div>

        {/* Lock portal slider button */}
        <div className="border-t border-zinc-800 pt-4" id="portal-controls">
          <button
            id="btn-toggle-portal"
            onClick={() => {
              setShowPasscodeForm(!showPasscodeForm);
              setError('');
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded bg-gradient-to-r from-red-950 to-zinc-950 hover:from-red-900 hover:to-zinc-900 text-soviet-gold text-xs font-mono uppercase border border-soviet-red/30 tracking-widest cursor-pointer transition-all duration-200"
          >
            <KeyRound className="h-4 w-4 text-soviet-gold" />
            {showPasscodeForm ? 'Скрыть Замок' : 'Ввести Пароль Хаба'}
          </button>
        </div>

        {/* Sliding overlay form for manual passcode entry */}
        {showPasscodeForm && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-x-6 bottom-6 bg-zinc-950 border border-soviet-red/40 p-5 rounded-xl shadow-2xl flex flex-col justify-between"
            id="passcode-sliding-form"
          >
            <div className="flex justify-between items-center mb-3" id="passcode-header">
              <span className="text-xs font-mono font-bold text-soviet-red uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-3 w-3" /> Вход в Главную Раму
              </span>
              <span className="text-[10px] font-mono text-zinc-500">ПАССКОД</span>
            </div>

            <form onSubmit={handlePasscodeSubmit} className="space-y-3" id="passcode-form">
              <input
                id="passcode-input"
                type="password"
                placeholder="ВВЕДИТЕ ПАРОЛЬ"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full text-center bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-soviet-red text-soviet-gold py-2 rounded font-mono placeholder:text-zinc-700 tracking-widest focus:outline-none focus:ring-1 focus:ring-soviet-red/50"
              />
              
              {error && (
                <p className="text-[10px] text-center font-mono text-soviet-red" id="passcode-error">
                  {error}
                </p>
              )}

              <button
                id="btn-passcode-submit"
                type="submit"
                className="w-full py-2 bg-soviet-red hover:bg-red-500 text-white font-mono text-xs uppercase tracking-widest rounded shadow active:translate-y-0.5 cursor-pointer transition-all"
              >
                РАЗБЛОКИРОВАТЬ
              </button>
            </form>
          </motion.div>
        )}
      </div>


    </div>
  );
}
