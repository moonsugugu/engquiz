import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { QuizQuestion, StudentInfo, StudentSubmission } from '../types';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  RotateCcw, 
  GraduationCap, 
  Sparkles,
  CloudCheck
} from 'lucide-react';

interface QuizResultProps {
  questions: QuizQuestion[];
  studentInfo: StudentInfo;
  submission: StudentSubmission;
  onGoToWrongNotes: () => void;
  onRetry: () => void;
  onGoToTeacher: () => void;
}

export const QuizResult: React.FC<QuizResultProps> = ({
  questions,
  studentInfo,
  submission,
  onGoToWrongNotes,
  onRetry,
  onGoToTeacher,
}) => {
  const isHighScore = submission.score >= 80;
  const isPerfectScore = submission.score === 100;

  useEffect(() => {
    if (isHighScore) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore if canvas not supported
      }
    }
  }, [isHighScore]);

  const correctCount = submission.totalQuestions - submission.wrongQuestions.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
      {/* Top Celebration Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-amber-900/5 border-2 border-amber-200 text-center relative overflow-hidden mb-6">
        {/* Decorative background glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Big Avatar / Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-amber-100 text-5xl mb-3 shadow-inner shadow-amber-200 relative">
          {isPerfectScore ? '👑' : isHighScore ? '🎉' : '🌱'}
          {isPerfectScore && (
            <span className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full text-xs shadow-md">
              <Sparkles className="w-4 h-4" />
            </span>
          )}
        </div>

        {/* Student identification badge */}
        <div className="inline-block px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
          {studentInfo.studentClass} {studentInfo.studentNumber} {studentInfo.studentName} 학생의 시험 결과
        </div>

        {/* Score Display */}
        <div className="mb-3">
          <div className="text-slate-500 text-sm font-bold">최종 점수</div>
          <div className="text-5xl sm:text-6xl font-black text-amber-500 tracking-tight flex items-baseline justify-center gap-1">
            <span>{submission.score}</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-400">/ 100점</span>
          </div>
        </div>

        {/* Encouraging Message */}
        <p className="text-base sm:text-lg font-bold text-slate-700 mb-4 break-keep">
          {isPerfectScore
            ? '와우! 100점 만점이에요! 영어 단어 실력이 정말 최고예요! 🌟'
            : isHighScore
            ? '참 잘했어요! 훌륭한 실력이에요! 조금만 더 하면 만점이에요! 👏'
            : '수고 많았어요! 틀린 문제를 오답 노트에서 복습해봐요! 💪'}
        </p>

        {/* Firestore Saved Status */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Firebase Firestore에 결과가 안전하게 저장되었습니다!</span>
        </div>
      </div>

      {/* Question by Question Detailed Result List */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-lg shadow-amber-900/5 border border-amber-200/80 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
            <span>📝 문항별 정답 확인</span>
          </h3>
          <span className="text-xs sm:text-sm font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            총 {questions.length}문항 중 {correctCount}문항 정답
          </span>
        </div>

        <div className="space-y-3">
          {questions.map((q, idx) => {
            const studentChoiceIdx = submission.answers[idx];
            const isCorrect = studentChoiceIdx === q.correctAnswerIndex;
            const studentChoiceWord = studentChoiceIdx >= 0 ? q.options[studentChoiceIdx] : '(미응답)';
            const correctWord = q.options[q.correctAnswerIndex];

            return (
              <div
                key={q.id}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-rose-200 bg-rose-50/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                    isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-slate-800">
                        {q.koreanMeaning} ({q.word})
                      </span>
                      <span className="text-lg">{q.emoji}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {q.questionText}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:border-l sm:pl-4 sm:border-slate-200 shrink-0">
                  <div className="text-right text-xs">
                    {isCorrect ? (
                      <span className="font-extrabold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                        정답 ({correctWord})
                      </span>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="font-bold text-rose-600 block">
                          내 선택: {studentChoiceWord}
                        </span>
                        <span className="font-extrabold text-emerald-700 block">
                          정답: {correctWord}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    {isCorrect ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-lg">
                        ⭕
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-lg">
                        ❌
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Wrong answer note button */}
        {submission.wrongQuestions.length > 0 ? (
          <button
            type="button"
            onClick={onGoToWrongNotes}
            className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-base sm:text-lg shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <BookOpen className="w-5 h-5" />
            <span>오답 노트 보러가기 ({submission.wrongQuestions.length}문제)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onGoToWrongNotes}
            className="flex-1 py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base sm:text-lg shadow-lg shadow-amber-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <BookOpen className="w-5 h-5" />
            <span>오답 노트 & 단어 복습</span>
          </button>
        )}

        <button
          type="button"
          onClick={onRetry}
          className="py-4 px-6 rounded-2xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>다시 풀기</span>
        </button>

        <button
          type="button"
          onClick={onGoToTeacher}
          className="py-4 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <GraduationCap className="w-4 h-4" />
          <span>교사 대시보드</span>
        </button>
      </div>
    </div>
  );
};
