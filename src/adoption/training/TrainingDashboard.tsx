/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BookOpen, GraduationCap, CheckCircle2, AlertCircle, Award } from 'lucide-react';
import { useTrainingGuidance } from '../hooks/useTrainingGuidance';
import { useOrganizationalReadiness } from '../hooks/useOrganizationalReadiness';

export function TrainingDashboard() {
  const { courses, finishCourse } = useTrainingGuidance();
  const { readiness, setTrainedRatio } = useOrganizationalReadiness();
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<number | null>(null);

  const mockQuestions = [
    {
      text: "Qual é o limite normativo seguro estabelecido pela Anvisa para concentração residual de Piretróides?",
      options: [
        "1.2% v/v próximo a silos de alimentação",
        "5.0% v/v em qualquer aspersor",
        "Sem limite para uso rural",
        "0.1% em aspersor e 4.0% em silos"
      ],
      correctIdx: 0
    }
  ];

  const handleExamSubmit = (courseId: string) => {
    if (selectedResponse === null) return;
    
    // Calculate passing
    const correct = selectedResponse === 0;
    const score = correct ? 100 : 40;
    
    finishCourse(courseId, score);
    
    // adjust trained ratio index dynamically
    const completedCount = courses.filter(c => c.isCompleted).length + (correct ? 1 : 0);
    const calculatedRatio = Math.round((completedCount / courses.length) * 100);
    setTrainedRatio(calculatedRatio);
    
    setActiveExamId(null);
    setSelectedResponse(null);
  };

  return (
    <div className="space-y-6">
      {/* Training Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <GraduationCap className="size-5" />
            <h4 className="text-sm font-bold text-slate-100">Capacitação Organizacional DDSulf</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
            A capacitação certificada reduz a taxa de erro de campo na dosagem química de defensivos, elevando a segurança regulatória geral e a eficiência técnica de campo.
          </p>
        </div>

        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Trained Staff Index</span>
            <span className="text-2xl font-bold text-emerald-400">{readiness.staffTrainedRatio}%</span>
          </div>
          <Award className="size-8 text-emerald-400 opacity-80" />
        </div>
      </div>

      {/* Course List Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {courses.map((course) => {
            return (
              <div 
                key={course.id} 
                className={`p-5 bg-slate-900 border rounded-3xl flex items-start gap-4 transition-all ${
                  course.isCompleted 
                    ? 'border-emerald-500/20' 
                    : 'border-slate-800/80 hover:border-slate-800'
                }`}
              >
                <div className="pt-0.5 shrink-0">
                  {course.isCompleted ? (
                    <CheckCircle2 className="size-5 text-emerald-400" />
                  ) : (
                    <BookOpen className="size-5 text-slate-500" />
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                        Trilha de Adoção: {course.category.replace('_', ' ')}
                      </span>
                      <h5 className="text-xs font-bold text-slate-100 mt-1">{course.title}</h5>
                    </div>

                    {course.isCompleted && (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        Aprovado {course.scorePercent}%
                      </span>
                    )}
                  </div>

                  {!course.isCompleted && activeExamId !== course.id && (
                    <button
                      onClick={() => setActiveExamId(course.id)}
                      className="px-3 py-1.5 bg-slate-950 text-slate-300 hover:text-slate-100 text-[10px] font-bold rounded-lg uppercase tracking-wide border border-slate-800 transition-all"
                    >
                      Realizar Teste de Habilitação
                    </button>
                  )}

                  {activeExamId === course.id && (
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-4 mt-3 animate-in fade-in duration-200">
                      <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block">Exame Operacional</span>
                      <p className="text-[11px] text-slate-200 font-bold leading-normal">{mockQuestions[0].text}</p>
                      
                      <div className="space-y-2">
                        {mockQuestions[0].options.map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800/50 hover:bg-slate-850 cursor-pointer text-[10px] text-slate-300">
                            <input
                              type="radio"
                              name={`exam_${course.id}`}
                              checked={selectedResponse === oIdx}
                              onChange={() => setSelectedResponse(oIdx)}
                              className="accent-emerald-500"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setActiveExamId(null)}
                          className="px-3.5 py-1.5 text-slate-400 hover:text-slate-200 text-[10px] font-bold"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleExamSubmit(course.id)}
                          disabled={selectedResponse === null}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 text-[10px] font-black uppercase rounded-lg transition-colors"
                        >
                          Enviar Respostas
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Change Management Guidance Box */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sky-400">
              <AlertCircle className="size-4.5 text-sky-400" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Resistência Operacional</span>
            </div>
            <h4 className="text-sm font-bold text-slate-100">Práticas de Mudança</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              O DDSulf adota guias de micro-treinamento diretamente vinculados à rotina de calibração eletrônica. A aprovação nos testes autoriza temporariamente os laudos POPs com certificação retroativa.
            </p>
          </div>

          <div className="border-t border-slate-800/80 pt-4 mt-6">
            <span className="text-[9px] font-mono text-slate-500 uppercase">Certificado pela Gabriel Max Corp</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default TrainingDashboard;
