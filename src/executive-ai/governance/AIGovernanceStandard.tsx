/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldAlert, BookOpen, Scale, Landmark, HardHat, FileText } from 'lucide-react';

export function AIGovernanceStandard() {
  const complianceGuidelines = [
    {
      title: 'Políticas de Explicabilidade (Explainability)',
      desc: 'Todas as recomendações financeiras e operacionais estimadas sob o selo de IA do DDSulf devem ser correlacionadas com um vetor de evidências físicas identificáveis no banco de dados e expostas abertamente ao Diretor responsável.',
      icon: Scale,
      badge: 'Mandato Ativo'
    },
    {
      title: 'Segurança Estequiométrica (Anvisa)',
      desc: 'O motor de recomendação está estritamente proibido de sugerir misturas químicas cuja concentração residual de Piretróides exceda 1.2% v/v em proximidade a reservatórios de água e alimentos residenciais.',
      icon: HardHat,
      badge: 'Bloqueio Rígido'
    },
    {
      title: 'Isolamento de Tenant (Multi-Tenant Boundaries)',
      desc: 'A integridade entre filiais gaúchas concorrentes do setor de viticultura é resguardada por isolamento estrito de cache cognitivo. Um tenant não possui acesso a deparações estatísticas ou MRR agregados de concorrentes regionais.',
      icon: Landmark,
      badge: 'Criptografia Física'
    },
    {
      title: 'Human-In-The-Loop Framework',
      desc: 'Nenhuma decisão sugerida pelo motor de previsão toma ações diretas na infraestrutura. O teto regulatório impõe revisão ativa e rubrica digital obrigatória de um Diretor Sênior ou Engenheiro Agrônomo habilitado.',
      icon: ShieldAlert,
      badge: 'Supervisão Ativa'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Policy list */}
      <div className="lg:col-span-2 space-y-4">
        {complianceGuidelines.map((g, idx) => (
          <div key={idx} className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex gap-4">
            <div className="size-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 text-sky-400 shrink-0">
              <g.icon className="size-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-100">{g.title}</h4>
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider bg-sky-950 text-sky-400 px-2 py-0.5 rounded border border-sky-900/60">{g.badge}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{g.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Standby details doc */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sky-400">
            <BookOpen className="size-4.5" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Governança Corporativa</span>
          </div>
          <h4 className="text-sm font-bold text-slate-100">DDsulf Executive AI Manifest</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Este painel operacional rege a conformidade ética e a mitigação de alucinações cognitivas na DDSulf. Amparado por testes periódicos estruturados de recalibração mecânica de dosagem química de praguicidas.
          </p>
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
            <FileText className="size-5 text-slate-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-200">Relatório Anvisa v1.0.pdf</span>
              <span className="text-[8px] font-mono text-slate-500">Documento Ativo para Auditorias</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-4 mt-6">
          <p className="text-[9px] font-mono text-slate-500 uppercase leading-normal">
            DDSulf Strategic Observability & Safeguards Policy<br />
            Gabriel Max Corporation © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
export default AIGovernanceStandard;
