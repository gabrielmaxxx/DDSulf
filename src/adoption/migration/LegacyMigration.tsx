/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Database, Upload, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useTransformationTracking } from '../hooks/useTransformationTracking';

export function LegacyMigration() {
  const { batches, startMigration } = useTransformationTracking();
  const [sourceName, setSourceName] = useState('');
  const [recordCount, setRecordCount] = useState(100);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName) return;

    startMigration(sourceName, recordCount);
    setSuccessMsg(`Migração iniciada para "${sourceName}". O processador stocástico está calibrando caches.`);
    setSourceName('');
    
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      {/* Parameters Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form panel */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <Database className="size-4.5" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Motor de Transição Operacional</span>
          </div>
          <h4 className="text-sm font-bold text-slate-100">Importar Sistema Legado</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Comprima o tempo de transição carregando registros em lote (SaaS, ERPs gaúchos locais ou planilhas Pelotas).
          </p>

          {successMsg && (
            <div className="p-3 bg-emerald-950/20 text-emerald-400 text-[10px] rounded-xl border border-emerald-900/60 leading-normal animate-in fade-in duration-200">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleImportSubmit} className="space-y-3 pt-2">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Nome da Fonte Legada</label>
              <input
                type="text"
                placeholder="Ex CRM Antigo, Planilha Pragas de Pelotas"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-slate-100 outline-none focus:border-emerald-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Volume de Registros ({recordCount})</label>
              <input
                type="range"
                min="50"
                max="1200"
                step="50"
                value={recordCount}
                onChange={(e) => setRecordCount(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-850 h-1 rounded cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Upload className="size-3.5 stroke-[3px]" /> Confirmar Importação
            </button>
          </form>
        </div>

        {/* Batches visualization list view */}
        <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">Lotes de Migração Registrados</h4>
              <p className="text-[10px] text-slate-400">Status de deparações e saneamento de dados críticos de controle de pragas.</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto scrollbar-thin">
            {batches.map((batch) => {
              const isProcessing = batch.status === 'processing';
              const isDone = batch.status === 'done';
              const isPending = batch.status === 'pending';

              return (
                <div key={batch.id} className="p-4 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <h5 className="text-[11px] font-bold text-slate-200">{batch.sourceSystemName}</h5>
                    <div className="flex gap-4 font-mono text-[9px] text-slate-500">
                      <span>Registros: {batch.recordsCount}</span>
                      <span className="truncate max-w-[140px]">{batch.integrityHash}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {isProcessing ? (
                      <span className="flex items-center gap-1 text-[9px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-950 px-2 py-0.5 rounded animate-pulse">
                        <Loader2 className="size-3 animate-spin shrink-0" /> Saneando dados
                      </span>
                    ) : isDone ? (
                      <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-950 px-2 py-0.5 rounded">
                        <CheckCircle2 className="size-3 text-emerald-400" /> Saneado
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                        Na fila
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
export default LegacyMigration;
