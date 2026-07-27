import React, { useState } from 'react';
import { useQuoteAnalytics } from '../hooks/useQuoteAnalytics';
import { analyticsService } from '../services/analyticsService';
import { Cpu, Copy, Check, Eye, HelpCircle, Code } from 'lucide-react';
import { toast } from 'sonner';

export function AIReadyPreview() {
  const { snapshots } = useQuoteAnalytics();
  const [selectedSnapId, setSelectedSnapId] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const selectedSnap = snapshots.find(s => s.id === selectedSnapId) || snapshots[0];

  const aiPayload = selectedSnap 
    ? analyticsService.getAIReadyFormat(selectedSnap.inputs, selectedSnap.breakdown)
    : null;

  const handleCopy = () => {
    if (!aiPayload) return;
    navigator.clipboard.writeText(JSON.stringify(aiPayload.structuredPayload, null, 2));
    setCopied(true);
    toast.success('Estrutura JSON copiada com sucesso!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6">
      
      {/* Header and Select context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-5">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="size-4 text-violet-500" /> Estrutura de IA Preditiva (Neural Prompts Align)
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            Representações normalizadas de comportamento e finanças operacionais otimizadas para LLMs (Gemini Pro).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold shrink-0">Dados de Origem:</span>
          <select
            value={selectedSnapId}
            onChange={(e) => setSelectedSnapId(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
          >
            {snapshots.map(s => (
              <option key={`ai-select-${s.id}`} value={s.id}>
                {s.inputs.clientName} ({s.inputs.pestType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedSnap ? (
        <div className="text-center py-6">
          <p className="text-xs text-slate-400">Nenhum snapshot operacional disponível para estruturação de IA.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Simulated prompt compilation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-450 flex items-center gap-1">
                <Code className="size-3 text-slate-400" /> Prompt Contextual Compilado
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono font-bold">
                FORMAT: plain_text
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 font-mono text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap select-all">
              {aiPayload?.promptContextString}
            </div>

            <p className="text-[10px] text-slate-400 font-medium leading-relaxed bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
              <span className="font-bold text-amber-600">Nota técnica:</span> O prompt acima é estruturado dinamicamente combinando a cotação ativa com as referências estatísticas de aprovação, assegurando que o Gemini tenha viés de sensibilidade de margem localizado no ato das interações automáticas do chat.
            </p>
          </div>

          {/* Structured JSON Payload */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-450 flex items-center gap-1">
                  <HelpCircle className="size-3" /> Payload JSON Estruturado (Vector Ready)
                </span>
                
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-100 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold rounded-xl transition-colors cursor-pointer text-slate-600"
                >
                  {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  {copied ? 'Copiado!' : 'Copiar JSON'}
                </button>
              </div>

              <div className="bg-slate-950 rounded-2xl p-5 overflow-x-auto max-h-72">
                <pre className="text-[10px] text-slate-350 font-mono leading-tight whitespace-pre">
                  {JSON.stringify(aiPayload?.structuredPayload, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-violet-600/5 border border-violet-500/10 rounded-2xl text-xs flex items-center justify-between">
              <div>
                <span className="font-black text-violet-800 block">PestFlow AI Core</span>
                <span className="text-[11px] text-slate-400 font-medium">Perfeito para embeddings Vetoriais em Pinecone ou Redis.</span>
              </div>
              <Cpu className="size-8 text-violet-300" />
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
