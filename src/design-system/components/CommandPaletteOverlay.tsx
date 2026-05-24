import React, { useState } from 'react';
import { Search, CornerUpLeft, X, Terminal, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CommandShortcut } from '../types';

interface CommandPaletteOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: CommandShortcut[];
}

export function CommandPaletteOverlay({ isOpen, onClose, shortcuts }: CommandPaletteOverlayProps) {
  const [query, setQuery] = useState('');

  const filtered = shortcuts.filter(s => 
    s.description.toLowerCase().includes(query.toLowerCase()) ||
    s.key.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Dialog Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-[28px] overflow-hidden shadow-2xl text-zinc-100"
          >
            {/* Header Input bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
              <Search className="size-5 text-zinc-400 shrink-0" />
              <input 
                type="text"
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Disparar ação operacional... (e.g. POP, Financeiro, Dashboard)"
                className="w-full bg-transparent border-none text-sm outline-hidden placeholder:text-zinc-500 text-white"
              />
              <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400">
                <X className="size-4" />
              </button>
            </div>

            {/* List */}
            <div className="p-3 max-h-[300px] overflow-y-auto space-y-1">
              <div className="text-[9px] font-black uppercase text-zinc-500 px-3 py-1.5 tracking-widest">
                Comandos Encontrados ({filtered.length})
              </div>

              {filtered.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className="w-full text-left px-3 py-3 rounded-xl hover:bg-zinc-800/60 flex items-center justify-between group cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-300 group-hover:bg-zinc-700">
                      <Terminal className="size-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-none">{item.description}</p>
                      <p className="text-[10px] text-zinc-500 mt-1 font-mono">Disparar ação de runtime imediata</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono font-bold group-hover:text-white uppercase transition-colors">
                      {item.key}
                    </span>
                    <ArrowRight className="size-3 text-zinc-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="p-8 text-center text-zinc-500">
                  <p className="text-xs">Nenhum comando operacional corresponde à pesquisa.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-zinc-950 px-5 py-3.5 border-t border-zinc-800/50 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span className="flex items-center gap-1.5 font-bold">
                <CornerUpLeft className="size-3" /> enter para disparar
              </span>
              <span>DDSULF COMMAND SYSTEM v2.0 • ESCAPE para fechar</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
