/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogOut,
  Play,
  Plus,
  Trash2,
  Edit2,
  FileCode,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Check,
  Code,
  Eye,
  X,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { Game, AccessMode } from './types';
import { defaultGames } from './defaultGames';

interface GamingHubProps {
  accessMode: AccessMode;
  onLogout: () => void;
}

// Preset gallery of beautiful retro-tech/cyberpunk covers
const PRESET_COVERS = [
  { name: 'Soviet Retro Tech', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { name: 'Red Star Synthwave', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { name: 'Cyber Space Laser', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { name: 'Arcade Neon Grid', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { name: 'Vintage Electronics', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { name: 'Matrix Cyber Grid', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' }
];

export default function GamingHub({ accessMode, onLogout }: GamingHubProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [activePlayGame, setActivePlayGame] = useState<Game | null>(null);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState('');

  // Fields for new / editing game
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCover, setEditCover] = useState('');
  const [editHtml, setEditHtml] = useState('');

  // Live editing code inside play screen
  const [liveHtmlEditor, setLiveHtmlEditor] = useState('');
  const [showLiveCodePanel, setShowLiveCodePanel] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load games from localStorage or default
  useEffect(() => {
    const saved = localStorage.getItem('russian_calculator_games');
    if (saved) {
      try {
        setGames(JSON.parse(saved));
      } catch (e) {
        setGames(defaultGames);
      }
    } else {
      setGames(defaultGames);
    }
  }, []);

  // Save games helper
  const saveGamesList = (updated: Game[]) => {
    setGames(updated);
    localStorage.setItem('russian_calculator_games', JSON.stringify(updated));
  };

  const showToast = (message: string) => {
    setShowSuccessToast(message);
    setTimeout(() => setShowSuccessToast(''), 3000);
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (window.confirm('Вы действительно хотите сбросить все игры к заводским настройкам? (Reset to defaults?)')) {
      saveGamesList(defaultGames);
      showToast('Игры сброшены к исходным!');
    }
  };

  // Export config as JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(games, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "russian_calculator_gaming_hub.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Конфигурация экспортирована!');
  };

  // Import config from JSON
  const handleImportJSONSubmit = () => {
    try {
      const parsed = JSON.parse(importText);
      if (Array.isArray(parsed) && parsed.every(g => g.id && g.title && g.htmlCode)) {
        saveGamesList(parsed);
        setShowImportModal(false);
        setImportText('');
        showToast('Конфигурация успешно загружена!');
      } else {
        alert('Некорректный формат данных. Список должен содержать объекты с id, title и htmlCode.');
      }
    } catch (e) {
      alert('Ошибка парсинга JSON. Проверьте правильность кода.');
    }
  };

  // File import helper
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.every(g => g.id && g.title && g.htmlCode)) {
          saveGamesList(parsed);
          showToast('Импорт из файла успешно выполнен!');
        } else {
          alert('Файл имеет некорректную структуру.');
        }
      } catch (err) {
        alert('Не удалось прочитать файл. Убедитесь, что это валидный JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Delete game
  const handleDeleteGame = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Удалить эту игру из каталога? (Delete game?)')) {
      const updated = games.filter(g => g.id !== id);
      saveGamesList(updated);
      showToast('Игра успешно удалена!');
    }
  };

  // Open edit modal
  const openEditModal = (game: Game, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGame(game);
    setIsAddingNew(false);
    setEditTitle(game.title);
    setEditDesc(game.description);
    setEditCover(game.coverImage);
    setEditHtml(game.htmlCode);
  };

  // Open add new game modal
  const openAddModal = () => {
    setEditingGame(null);
    setIsAddingNew(true);
    setEditTitle('');
    setEditDesc('');
    setEditCover(PRESET_COVERS[0].url);
    setEditHtml(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #000; color: #0f0; font-family: monospace; text-align: center; padding: 40px; }
    h1 { color: #ff0; }
  </style>
</head>
<body>
  <h1>МОЯ НОВАЯ ИГРА</h1>
  <p>Отредактируйте этот HTML код в панели!</p>
</body>
</html>`);
  };

  // Save game edits
  const handleSaveGameForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return alert('Пожалуйста, укажите название игры');

    if (isAddingNew) {
      const newGame: Game = {
        id: 'game_' + Date.now(),
        title: editTitle,
        description: editDesc,
        coverImage: editCover || PRESET_COVERS[0].url,
        htmlCode: editHtml
      };
      const updated = [...games, newGame];
      saveGamesList(updated);
      setIsAddingNew(false);
      showToast('Новая игра добавлена!');
    } else if (editingGame) {
      const updated = games.map(g => g.id === editingGame.id ? {
        ...g,
        title: editTitle,
        description: editDesc,
        coverImage: editCover,
        htmlCode: editHtml
      } : g);
      saveGamesList(updated);
      setEditingGame(null);
      showToast('Изменения сохранены!');
    }
  };

  // Apply live code edit from the gameplay screen
  const handleApplyLiveCode = () => {
    if (!activePlayGame) return;
    const updated = games.map(g => g.id === activePlayGame.id ? {
      ...g,
      htmlCode: liveHtmlEditor
    } : g);
    saveGamesList(updated);
    setActivePlayGame({
      ...activePlayGame,
      htmlCode: liveHtmlEditor
    });
    showToast('Код обновлен в реальном времени!');
  };

  const isAdmin = accessMode === 'admin';

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col min-h-screen text-slate-100 p-4 md:p-6" id="hub-container">
      {/* Dynamic Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 bg-zinc-900 border border-vfd-green/80 text-vfd-green px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 text-sm font-mono"
            id="success-toast"
          >
            <Check className="h-4 w-4 text-vfd-green animate-bounce" />
            <span>{showSuccessToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control panel & Header */}
      <header className="flex flex-col md:flex-row justify-between items-center bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 mb-8 gap-4 shadow-xl backdrop-blur-md" id="hub-header">
        <div className="flex flex-col md:items-start items-center text-center md:text-left" id="hub-logo-box">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-soviet-red/10 text-soviet-red border border-soviet-red/20 text-xs font-mono font-bold rounded uppercase tracking-wider">
              РУССКИЙ КАЛЬКУЛЯТОР
            </span>
            <div className={`px-2.5 py-0.5 rounded text-[10px] font-mono border ${
              isAdmin ? 'bg-soviet-gold/10 text-soviet-gold border-soviet-gold/20 animate-pulse' : 'bg-emerald-950/10 text-vfd-green border-vfd-green/20'
            }`}>
              {isAdmin ? '🔴 ГЛАВНЫЙ АДМИН' : '🟢 ГОСТЬ (ИГРОК)'}
            </div>
          </div>
          <h2 className="text-2xl font-display font-bold text-white mt-1.5 tracking-tight flex items-center gap-2">
            Игровой Портал <span className="text-soviet-gold font-mono text-xl">СССР</span>
          </h2>
        </div>

        {/* Action Controls for Admin and logout */}
        <div className="flex flex-wrap items-center justify-center gap-3" id="hub-actions">
          {isAdmin && (
            <>
              {/* Creator Operations */}
              <button
                id="btn-add-game"
                onClick={openAddModal}
                className="flex items-center gap-1.5 bg-soviet-gold hover:bg-amber-400 text-zinc-950 px-3.5 py-2 rounded-lg font-mono text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                <Plus className="h-4 w-4" /> Добавить Игру
              </button>

              <button
                id="btn-import-modal"
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-300 px-3.5 py-2 rounded-lg font-mono text-xs border border-zinc-700 cursor-pointer transition-all"
                title="Paste site configuration JSON"
              >
                <Upload className="h-4 w-4" /> Импорт JSON
              </button>

              <button
                id="btn-export-json"
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-300 px-3.5 py-2 rounded-lg font-mono text-xs border border-zinc-700 cursor-pointer transition-all"
                title="Download site layout as JSON"
              >
                <Download className="h-4 w-4" /> Экспорт
              </button>

              <button
                id="btn-reset-games"
                onClick={handleResetDefaults}
                className="flex items-center gap-1.5 bg-zinc-800/40 hover:bg-red-950/40 text-red-400 px-3.5 py-2 rounded-lg font-mono text-xs border border-red-900/30 cursor-pointer transition-all"
                title="Reset to pre-loaded games"
              >
                <RotateCcw className="h-4 w-4" /> Сброс
              </button>

              {/* Secret file loader input */}
              <input
                id="file-import-hidden"
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".json"
                className="hidden"
              />
            </>
          )}

          <button
            id="btn-logout"
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3.5 py-2 rounded-lg font-mono text-xs font-bold cursor-pointer transition-all shadow-md ml-2"
          >
            <LogOut className="h-4 w-4" /> Выход
          </button>
        </div>
      </header>

      {/* Main catalog layout */}
      <main className="flex-1" id="hub-main-grid">
        <div className="mb-6 flex justify-between items-center" id="catalog-title-strip">
          <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Layers className="h-4 w-4 text-soviet-red" /> КАТАЛОГ СИГНАЛОВ ({games.length} ИГР)
          </h3>
          {isAdmin && (
            <p className="text-xs text-soviet-gold/80 italic hidden md:block">
              ✨ Конструктор: Вы можете изменять любые названия, обложки и исходные коды игр!
            </p>
          )}
        </div>

        {/* Responsive Grid with gorgeous cards */}
        {games.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl" id="no-games-box">
            <Layers className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-zinc-400">Нет доступных сигналов</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              Нажмите кнопку "Добавить Игру" или "Сброс" для воссоздания каталога.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="games-grid">
            {games.map((game, idx) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
                onClick={() => {
                  setActivePlayGame(game);
                  setLiveHtmlEditor(game.htmlCode);
                }}
                className="group relative bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 hover:border-vfd-green/30 rounded-2xl overflow-hidden cursor-pointer shadow-lg transition-all duration-200 flex flex-col h-full"
                id={`game-card-${game.id}`}
              >
                {/* Cover Image container */}
                <div className="relative h-44 w-full overflow-hidden bg-zinc-950 border-b border-zinc-850" id={`game-img-box-${game.id}`}>
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Glowing overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />
                  
                  {/* Cyber hover play symbol */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-[2px] transition-all duration-200">
                    <span className="flex items-center gap-2 bg-soviet-red text-white text-xs font-mono font-bold px-4 py-2 rounded-lg shadow-xl uppercase tracking-widest">
                      <Play className="h-4 w-4 fill-white text-white" /> Играть
                    </span>
                  </div>
                </div>

                {/* Card description details */}
                <div className="p-5 flex-1 flex flex-col justify-between" id={`game-info-box-${game.id}`}>
                  <div>
                    <h4 className="text-base font-display font-bold text-white group-hover:text-vfd-green transition-colors line-clamp-1">
                      {game.title}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 h-8 leading-relaxed font-sans">
                      {game.description || 'Нет описания...'}
                    </p>
                  </div>

                  {/* Footer buttons on card */}
                  <div className="flex items-center justify-between mt-4 border-t border-zinc-800/60 pt-3" id={`game-card-foot-${game.id}`}>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      СИГНАЛ: READY
                    </span>

                    {/* Admin editing suite controls */}
                    {isAdmin && (
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          id={`btn-edit-${game.id}`}
                          onClick={(e) => openEditModal(game, e)}
                          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-soviet-gold rounded border border-zinc-750 cursor-pointer"
                          title="Редактировать название/код"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          id={`btn-delete-${game.id}`}
                          onClick={(e) => handleDeleteGame(game.id, e)}
                          className="p-1.5 bg-zinc-800 hover:bg-red-950/40 text-red-400 rounded border border-zinc-750 cursor-pointer"
                          title="Удалить"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Embedded Iframe Game Player Panel View */}
      <AnimatePresence>
        {activePlayGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/98 backdrop-blur-sm z-40 flex flex-col md:flex-row h-screen overflow-hidden"
            id="game-runner-overlay"
          >
            {/* Play section container */}
            <div className="flex-1 flex flex-col h-full relative" id="runner-left-pane">
              {/* Toolbar */}
              <div className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 z-10" id="runner-toolbar">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-soviet-red animate-pulse" />
                  <span className="font-display font-bold text-white tracking-tight">{activePlayGame.title}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      id="btn-toggle-live-code"
                      onClick={() => {
                        setShowLiveCodePanel(!showLiveCodePanel);
                        setLiveHtmlEditor(activePlayGame.htmlCode);
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                        showLiveCodePanel 
                          ? 'bg-soviet-gold/10 text-soviet-gold border-soviet-gold/40'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-gray-300 border-zinc-750'
                      }`}
                    >
                      <Code className="h-3.5 w-3.5" /> Live Редактор Кода
                    </button>
                  )}
                  <button
                    id="btn-close-play"
                    onClick={() => {
                      setActivePlayGame(null);
                      setShowLiveCodePanel(false);
                    }}
                    className="p-1.5 bg-zinc-800 hover:bg-red-650 hover:text-white text-zinc-400 rounded-lg cursor-pointer transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Game sandbox frame */}
              <div className="flex-1 bg-zinc-950 flex items-center justify-center p-2 relative overflow-auto" id="runner-frame-box">
                <iframe
                  id="sandbox-game-iframe"
                  srcDoc={activePlayGame.htmlCode}
                  title={activePlayGame.title}
                  sandbox="allow-scripts allow-same-origin"
                  className="w-full h-full max-w-4xl max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl"
                />
              </div>
            </div>

            {/* Live side code editor panel (Only for Admins) */}
            {isAdmin && showLiveCodePanel && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '420px', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="w-full md:w-[420px] bg-zinc-900 border-t md:border-t-0 md:border-l border-zinc-800 flex flex-col h-full z-10 shadow-2xl relative"
                id="runner-right-pane"
              >
                <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between" id="live-code-header">
                  <span className="text-xs font-mono text-soviet-gold uppercase tracking-wider flex items-center gap-1.5">
                    <FileCode className="h-4 w-4" /> Исходный Код (HTML Sandbox)
                  </span>
                  <div className="flex gap-2">
                    <button
                      id="btn-apply-live-code"
                      onClick={handleApplyLiveCode}
                      className="px-3 py-1 bg-vfd-green hover:bg-emerald-400 text-zinc-950 font-mono text-xs font-bold rounded shadow-md cursor-pointer transition-all"
                    >
                      Применить
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-3 flex flex-col" id="live-code-textarea-box">
                  <textarea
                    id="live-code-textarea"
                    value={liveHtmlEditor}
                    onChange={(e) => setLiveHtmlEditor(e.target.value)}
                    className="w-full flex-1 bg-zinc-950 text-emerald-400 p-3 font-mono text-xs border border-zinc-800 rounded-lg focus:outline-none focus:border-vfd-green resize-none overflow-y-auto leading-relaxed"
                    spellCheck="false"
                  />
                  <p className="text-[10px] text-zinc-500 font-mono mt-2" id="live-code-footer-tip">
                    💡 Отредактируйте HTML, CSS или JavaScript и нажмите "Применить" для немедленного обновления игры на экране.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen Customizer Modal (For Adding / Editing games) */}
      <AnimatePresence>
        {(editingGame || isAddingNew) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" id="creator-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border-2 border-zinc-800 p-6 rounded-2xl max-w-2xl w-full shadow-2xl my-8 relative"
              id="creator-modal-container"
            >
              <button
                id="btn-close-creator"
                onClick={() => { setEditingGame(null); setIsAddingNew(false); }}
                className="absolute top-4 right-4 p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 mb-6" id="creator-modal-title">
                <Layers className="h-5 w-5 text-soviet-gold" />
                <h3 className="text-lg font-display font-bold text-white uppercase tracking-tight">
                  {isAddingNew ? 'Добавить Новую Игру' : 'Редактировать Сигнал Игры'}
                </h3>
              </div>

              <form onSubmit={handleSaveGameForm} className="space-y-4" id="creator-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="creator-grid">
                  <div className="space-y-4" id="creator-meta-fields">
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Название Игры</label>
                      <input
                        id="creator-input-title"
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Например: Супер Марио"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-soviet-gold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Описание</label>
                      <textarea
                        id="creator-input-desc"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Краткое описание игры..."
                        rows={2}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-soviet-gold resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-zinc-400 uppercase mb-1.5 flex justify-between items-center">
                        <span>Ссылка на Изображение</span>
                        <span className="text-[10px] text-soviet-gold flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" /> Preset Covers
                        </span>
                      </label>
                      
                      {/* Presets Grid */}
                      <div className="grid grid-cols-3 gap-2 mb-2" id="preset-gallery-grid">
                        {PRESET_COVERS.map(cover => (
                          <button
                            id={`btn-preset-cover-${cover.name.replace(/\s+/g, '-').toLowerCase()}`}
                            type="button"
                            key={cover.name}
                            onClick={() => setEditCover(cover.url)}
                            className={`relative h-12 rounded overflow-hidden border ${
                              editCover === cover.url ? 'border-soviet-gold' : 'border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            <img src={cover.url} alt={cover.name} className="w-full h-full object-cover" />
                            {editCover === cover.url && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Check className="h-4 w-4 text-soviet-gold" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      <input
                        id="creator-input-cover"
                        type="url"
                        value={editCover}
                        onChange={(e) => setEditCover(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-soviet-gold"
                      />
                    </div>
                  </div>

                  {/* HTML Sandbox code panel */}
                  <div className="flex flex-col h-full" id="creator-code-panel">
                    <label className="block text-xs font-mono text-zinc-400 uppercase mb-1 flex items-center gap-1">
                      <Code className="h-3.5 w-3.5 text-soviet-gold" /> Исходный Код (HTML / JS)
                    </label>
                    <textarea
                      id="creator-input-html"
                      value={editHtml}
                      onChange={(e) => setEditHtml(e.target.value)}
                      className="w-full flex-1 min-h-[220px] bg-zinc-950 text-emerald-400 p-3 font-mono text-xs border border-zinc-800 rounded-lg focus:outline-none focus:border-soviet-gold resize-none"
                      spellCheck="false"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4" id="creator-footer">
                  <button
                    id="btn-creator-cancel"
                    type="button"
                    onClick={() => { setEditingGame(null); setIsAddingNew(false); }}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-gray-300 font-mono text-xs rounded-lg cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    id="btn-creator-save"
                    type="submit"
                    className="px-5 py-2 bg-soviet-gold hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold rounded-lg shadow-md cursor-pointer transition-all"
                  >
                    Сохранить
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Configuration Modal (Admin) */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" id="import-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border-2 border-zinc-800 p-6 rounded-2xl max-w-lg w-full shadow-2xl relative"
              id="import-modal-container"
            >
              <button
                id="btn-close-import"
                onClick={() => setShowImportModal(false)}
                className="absolute top-4 right-4 p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 mb-4" id="import-modal-title">
                <Upload className="h-5 w-5 text-soviet-gold" />
                <h3 className="text-lg font-display font-bold text-white uppercase tracking-tight">Импорт Сайта (JSON)</h3>
              </div>

              <p className="text-xs text-zinc-400 mb-4" id="import-modal-desc">
                Вставьте скопированный JSON-код конфигурации сайта ниже для полного развертывания или выберите JSON-файл на диске:
              </p>

              <div className="space-y-4" id="import-modal-fields">
                <button
                  id="btn-select-file-trigger"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-750 text-gray-200 font-mono text-xs border border-zinc-700 border-dashed rounded-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  📁 Выбрать Файл Конфигурации (.json)
                </button>

                <div className="relative" id="import-textarea-box">
                  <div className="text-[9px] font-mono text-zinc-500 absolute top-2 right-3">JSON STRING</div>
                  <textarea
                    id="import-json-textarea"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="[ { 'id': 'tetris', 'title': '...', ... } ]"
                    rows={6}
                    className="w-full bg-zinc-950 text-emerald-400 p-3 font-mono text-xs border border-zinc-800 rounded-lg focus:outline-none focus:border-soviet-gold resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3" id="import-modal-footer">
                  <button
                    id="btn-import-cancel"
                    onClick={() => { setShowImportModal(false); setImportText(''); }}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-gray-300 font-mono text-xs rounded-lg cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    id="btn-import-submit"
                    onClick={handleImportJSONSubmit}
                    className="px-5 py-2 bg-soviet-gold hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold rounded-lg cursor-pointer shadow"
                  >
                    Загрузить
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
