import React from 'react';
import {
  GraduationCap,
  X,
  BookOpen,
  ArrowRight,
  Award,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TrainingCourse } from '../types';

interface POPsTrainingDialogProps {
  course: TrainingCourse | null;
  onClose: () => void;
  courseMode: 'slides' | 'quiz' | 'completed';
  currentSlideIndex: number;
  setCurrentSlideIndex: (fn: (prev: number) => number) => void;
  setCourseMode: (mode: 'slides' | 'quiz' | 'completed') => void;
  currentQuizIndex: number;
  setCurrentQuizIndex: (fn: (prev: number) => number) => void;
  selectedOptionIndex: number | null;
  setSelectedOptionIndex: (val: number | null) => void;
  isAnswerSubmitted: boolean;
  setIsAnswerSubmitted: (val: boolean) => void;
  quizScore: number;
  setQuizScore: (fn: (prev: number) => number) => void;
}

export function POPsTrainingDialog({
  course,
  onClose,
  courseMode,
  currentSlideIndex,
  setCurrentSlideIndex,
  setCourseMode,
  currentQuizIndex,
  setCurrentQuizIndex,
  selectedOptionIndex,
  setSelectedOptionIndex,
  isAnswerSubmitted,
  setIsAnswerSubmitted,
  quizScore,
  setQuizScore,
}: POPsTrainingDialogProps) {
  if (!course) return null;

  return (
    <Dialog open={!!course} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        size="lg"
        showCloseButton={false}
        className="p-0 overflow-hidden max-w-2xl flex flex-col gap-0 rounded-2xl border border-slate-250 shadow-2xl"
        id="course-modal-container"
      >
        <DialogTitle className="sr-only">{course.title}</DialogTitle>
        <DialogDescription className="sr-only">
          Módulo de capacitação e avaliação técnica sanitária.
        </DialogDescription>

        <div className="bg-[#1B3A2D] text-white px-6 py-4 flex items-center justify-between" id="course-modal-header">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-700/80 rounded-lg">
              <GraduationCap className="size-5 text-emerald-200" />
            </div>
            <div className="text-left">
              <h3 className="font-extrabold text-sm font-sans tracking-tight">{course.title}</h3>
              <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                Módulo de Capacitação · Carga: {course.duration}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg text-white/80 transition cursor-pointer"
            id="btn-close-course-modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* CONTENT OF COURSE */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {courseMode === 'slides' && (
            <div className="space-y-6 text-left" id="training-slides-view">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-100 pb-3" id="slide-progression-bar">
                <span>
                  Etapa de Conteúdo {currentSlideIndex + 1} de {course.slides.length}
                </span>
                <span className="text-emerald-700 font-mono">
                  {Math.round(((currentSlideIndex + 1) / course.slides.length) * 100)}% concluído
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 min-h-[160px] flex items-center shadow-xs">
                <p className="text-sm font-sans text-slate-800 leading-relaxed font-semibold">
                  {course.slides[currentSlideIndex]}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentSlideIndex === 0}
                  className="px-4 py-2 border rounded-lg text-xs font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
                >
                  Anterior
                </button>
                {currentSlideIndex < course.slides.length - 1 ? (
                  <button
                    onClick={() => setCurrentSlideIndex((prev) => prev + 1)}
                    className="px-5 py-2 bg-[#1B3A2D] text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition flex items-center gap-1.5"
                  >
                    Próxima Aula <ArrowRight className="size-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setCourseMode('quiz');
                      setCurrentQuizIndex(() => 0);
                      setSelectedOptionIndex(null);
                      setIsAnswerSubmitted(false);
                      setQuizScore(() => 0);
                    }}
                    className="px-5 py-2 bg-emerald-600 text-white text-xs font-black rounded-lg hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
                  >
                    Ir para o Quiz Avaliativo <Award className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {courseMode === 'quiz' && (
            <div className="space-y-6 text-left" id="training-quiz-view">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-100 pb-3" id="quiz-progression-bar">
                <span>
                  Questão {currentQuizIndex + 1} de {course.quiz.length}
                </span>
                <span className="text-emerald-700 font-mono">
                  Pontuação: {quizScore} acerto(s)
                </span>
              </div>

              <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                {course.quiz[currentQuizIndex].question}
              </h4>

              <div className="space-y-2.5">
                {course.quiz[currentQuizIndex].options.map((opt, optIdx) => {
                  const isSelected = selectedOptionIndex === optIdx;
                  const isCorrect = optIdx === course.quiz[currentQuizIndex].correctIndex;

                  let optClass = 'border-slate-200 hover:border-slate-300 bg-white text-slate-700';
                  if (isSelected && !isAnswerSubmitted) {
                    optClass = 'border-[#1B3A2D] bg-emerald-50/70 text-[#1B3A2D] font-bold';
                  } else if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optClass = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optClass = 'border-red-500 bg-red-50 text-red-800 font-medium';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswerSubmitted}
                      onClick={() => setSelectedOptionIndex(optIdx)}
                      className={`w-full p-3.5 border rounded-xl text-left text-xs font-sans transition-all flex items-center justify-between ${optClass}`}
                    >
                      <span>{opt}</span>
                      {isAnswerSubmitted && isCorrect && <CheckCircle className="size-4 text-emerald-600 shrink-0" />}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <AlertCircle className="size-4 text-red-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isAnswerSubmitted && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 block">Explicação Técnica:</span>
                  <p>{course.quiz[currentQuizIndex].explanation}</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                {!isAnswerSubmitted ? (
                  <button
                    disabled={selectedOptionIndex === null}
                    onClick={() => {
                      if (selectedOptionIndex === course.quiz[currentQuizIndex].correctIndex) {
                        setQuizScore((prev) => prev + 1);
                      }
                      setIsAnswerSubmitted(true);
                    }}
                    className="px-5 py-2 bg-[#1B3A2D] text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition"
                  >
                    Confirmar Resposta
                  </button>
                ) : currentQuizIndex < course.quiz.length - 1 ? (
                  <button
                    onClick={() => {
                      setCurrentQuizIndex((prev) => prev + 1);
                      setSelectedOptionIndex(null);
                      setIsAnswerSubmitted(false);
                    }}
                    className="px-5 py-2 bg-[#1B3A2D] text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition"
                  >
                    Próxima Pergunta
                  </button>
                ) : (
                  <button
                    onClick={() => setCourseMode('completed')}
                    className="px-5 py-2 bg-emerald-600 text-white text-xs font-black rounded-lg hover:bg-emerald-700 transition"
                  >
                    Ver Resultado Final
                  </button>
                )}
              </div>
            </div>
          )}

          {courseMode === 'completed' && (
            <div className="text-center py-6 space-y-4 font-sans" id="training-completed-view">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full w-fit mx-auto border border-emerald-200">
                <Award className="size-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-slate-900">Treinamento Concluído com Sucesso!</h4>
                <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                  Você concluiu todas as etapas e obteve {quizScore} de {course.quiz.length} acertos no teste de fixação técnica.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-xs mx-auto text-xs font-semibold text-slate-700 flex justify-around">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Aproveitamento</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    {Math.round((quizScore / course.quiz.length) * 100)}%
                  </span>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="text-slate-400 block text-[10px] uppercase">Certificação</span>
                  <span className="text-base font-extrabold text-slate-800">Aprovado</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#1B3A2D] text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition"
              >
                Finalizar Treinamento
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
