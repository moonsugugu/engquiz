import React from 'react';
import { QuizQuestion, StudentInfo, StudentSubmission } from '../types';
import { speakWord } from '../utils/speech';
import { 
  Volume2, 
  ArrowLeft, 
  RotateCcw, 
  Lightbulb, 
  Sparkles, 
  CheckCircle,
  XCircle,
  BookOpenCheck
} from 'lucide-react';

interface WrongAnswerNotesProps {
  questions: QuizQuestion[];
  studentInfo: StudentInfo;
  submission: StudentSubmission;
  onBackToResult: () => void;
  onRetry: () => void;
}

export const WrongAnswerNotes: React.FC<WrongAnswerNotesProps> = ({
  questions,
  studentInfo,
  submission,
  onBackToResult,
  onRetry,
}) => {
  // Filter questions that student got wrong
  const wrongList = questions.filter((_, idx) => submission.wrongQuestions.includes(idx));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-rose-200 mb-6 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black backdrop-blur-xs">
            <BookOpenCheck className="w-3.5 h-3.5" />
            <span>맞춤형 복습 노트</span>
          </div>
          <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-lg">
            {studentInfo.studentClass} {studentInfo.studentName}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
          📖 오답 노트 (틀린 문제 모아보기)
        </h2>
        <p className="text-rose-100 text-sm mt-1.5 font-medium">
          틀린 단어를 꼼꼼히 확인하고 소리 내어 따라 읽으면 실력이 쑥쑥 늘어요!
        </p>
      </div>

      {/* Case 1: No wrong questions (Perfect score!) */}
      {wrongList.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-emerald-200 shadow-xl shadow-emerald-900/5 mb-6">
          <div className="w-24 h-24 rounded-3xl bg-emerald-100 text-5xl flex items-center justify-center mx-auto mb-4 animate-bounce">
            🎉
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
            틀린 문제가 하나도 없어요!
          </h3>
          <p className="text-slate-500 text-sm sm:text-base font-medium max-w-md mx-auto mb-6">
            모든 문제를 완벽하게 맞혔습니다! 오늘 배운 일상생활 영단어를 마스터했어요. 정말 대단해요! 👏
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={onBackToResult}
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm transition-all cursor-pointer"
            >
              결과 화면으로 가기
            </button>
            <button
              onClick={onRetry}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-md shadow-emerald-200 transition-all cursor-pointer"
            >
              다시 도전하기
            </button>
          </div>
        </div>
      ) : (
        /* Case 2: Wrong questions exist */
        <div className="space-y-5 mb-8">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-extrabold text-slate-600">
              틀린 문제 총 <strong className="text-rose-600">{wrongList.length}문항</strong>
            </span>
            <span className="text-xs text-slate-400">
              스피커 아이콘을 눌러 원어민 발음을 들어보세요
            </span>
          </div>

          {wrongList.map((q) => {
            const originalIndex = questions.findIndex((item) => item.id === q.id);
            const studentChoiceIdx = submission.answers[originalIndex];
            const studentChoiceWord = studentChoiceIdx >= 0 ? q.options[studentChoiceIdx] : '(미선택)';
            const correctWord = q.options[q.correctAnswerIndex];

            return (
              <div
                key={q.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-rose-200/90 shadow-md shadow-rose-900/5 hover:border-rose-300 transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-rose-500 text-white font-black text-sm flex items-center justify-center">
                      {q.id}
                    </span>
                    <span className="font-black text-slate-800 text-base sm:text-lg">
                      {q.koreanMeaning} ({q.word})
                    </span>
                    <span className="text-slate-400 font-bold text-xs sm:text-sm">
                      {q.phonetic}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => speakWord(correctWord)}
                    className="p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title={`"${correctWord}" 발음 듣기`}
                  >
                    <Volume2 className="w-4 h-4 text-amber-600" />
                    <span className="hidden sm:inline">발음 듣기</span>
                  </button>
                </div>

                {/* Original Question */}
                <div className="mb-4">
                  <p className="text-xs text-slate-400 font-bold mb-1">문제 내용</p>
                  <p className="text-sm sm:text-base font-extrabold text-slate-700 bg-slate-50 p-3 rounded-2xl">
                    {q.questionText}
                  </p>
                </div>

                {/* Comparison: My Choice vs Correct Choice */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {/* Student Answer */}
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 text-rose-700 font-extrabold mb-1">
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span>내가 선택한 답</span>
                    </div>
                    <div className="font-black text-base text-rose-900">
                      {studentChoiceWord}
                    </div>
                  </div>

                  {/* Correct Answer */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold mb-1">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>올바른 정답</span>
                    </div>
                    <div className="font-black text-base text-emerald-900 flex items-center justify-between">
                      <span>{correctWord}</span>
                      <button
                        type="button"
                        onClick={() => speakWord(correctWord)}
                        className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Friendly Teacher Explanation */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 mb-1">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>선생님의 쏙쏙 해설</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-amber-950 leading-relaxed">
                    {q.explanation}
                  </p>
                </div>

                {/* Example sentence with speaker */}
                <div className="p-3.5 rounded-2xl bg-slate-100/70 text-xs sm:text-sm flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 mb-0.5">
                      📖 일상생활 예문
                    </div>
                    <div className="font-extrabold text-slate-800">
                      "{q.exampleSentence}"
                    </div>
                    <div className="text-slate-500 text-xs mt-0.5">
                      ({q.exampleTranslation})
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakWord(q.exampleSentence)}
                    className="p-2 rounded-xl bg-white text-slate-600 hover:text-amber-600 hover:bg-amber-50 shadow-xs shrink-0 cursor-pointer transition-colors"
                    title="예문 전체 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToResult}
          className="px-5 sm:px-6 py-3.5 rounded-2xl border-2 border-slate-200 bg-white font-extrabold text-sm sm:text-base text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>결과 화면으로</span>
        </button>

        <button
          type="button"
          onClick={onRetry}
          className="px-6 sm:px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 font-black text-sm sm:text-base text-white shadow-lg shadow-amber-200 flex items-center gap-2 cursor-pointer transition-all active:scale-98"
        >
          <RotateCcw className="w-4 h-4" />
          <span>다시 시험 보기</span>
        </button>
      </div>
    </div>
  );
};
