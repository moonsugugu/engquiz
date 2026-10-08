import React, { useState } from 'react';
import { QuizQuestion, StudentInfo } from '../types';
import { speakWord } from '../utils/speech';
import { 
  Volume2, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Check, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface QuizRunnerProps {
  questions: QuizQuestion[];
  studentInfo: StudentInfo;
  onSubmit: (answers: number[]) => void;
  isSubmitting: boolean;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  questions,
  studentInfo,
  onSubmit,
  isSubmitting,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // answers stores the chosen option index (0..3) for each of the 5 questions, or -1 if not yet chosen
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  const currentQ = questions[currentIndex];
  const selectedAnswer = answers[currentIndex];

  const handleSelectOption = (optionIndex: number) => {
    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = optionIndex;
    setAnswers(nextAnswers);

    // Speak option word when student clicks it
    const selectedWord = currentQ.options[optionIndex];
    speakWord(selectedWord);
  };

  const answeredCount = answers.filter((a) => a !== -1).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  const handleCheckAndSubmit = () => {
    const unAnsweredIndices = answers
      .map((val, idx) => (val === -1 ? idx + 1 : null))
      .filter((v): v is number => v !== null);

    if (unAnsweredIndices.length > 0) {
      setShowIncompleteModal(true);
    } else {
      onSubmit(answers);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      {/* Top Status & Student Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-amber-200/80 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-lg">
            🎒
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">응시 학생</div>
            <div className="text-sm sm:text-base font-extrabold text-slate-800">
              {studentInfo.studentClass} {studentInfo.studentNumber} {studentInfo.studentName}
            </div>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">진행 상황</span>
            <span className="text-sm font-extrabold text-amber-600">
              {answeredCount} / {questions.length} 문제 완료
            </span>
          </div>
          <div className="w-16 sm:w-24 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-amber-900/5 border-2 border-amber-200 mb-6">
        {/* Question Header & Category */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-amber-400 text-white font-black text-sm tracking-wide">
              {currentIndex + 1}번 문제
            </span>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              {currentQ.category}
            </span>
          </div>

          <span className="text-2xl" role="img" aria-label="question-emoji">
            {currentQ.emoji}
          </span>
        </div>

        {/* Question Prompt */}
        <div className="mb-6">
          <h3 className="text-lg sm:text-2xl font-black text-slate-800 leading-snug break-keep">
            {currentQ.questionText}
          </h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            알맞은 영어 단어 보기를 하나 선택하세요. (소리를 들으며 풀어보세요!)
          </p>
        </div>

        {/* 4 Large Choice Buttons */}
        <div className="space-y-3 sm:space-y-3.5">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const choiceNum = ['①', '②', '③', '④'][idx];

            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-4 sm:p-5 rounded-2xl border-2 font-bold text-left transition-all flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99] ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 shadow-md shadow-amber-200/50 ring-2 ring-amber-400/30'
                    : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-slate-50/80 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-base sm:text-lg transition-colors ${
                    isSelected
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-700'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-lg sm:text-xl font-black tracking-wide block">
                      {option}
                    </span>
                  </div>
                </div>

                {/* Pronounce audio button on each choice */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title={`"${option}" 영어 발음 듣기`}
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(option);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-100/70 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>

                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Question Navigation & Submit */}
      <div className="space-y-4">
        {/* Number quick-jump buttons */}
        <div className="flex items-center justify-center gap-2">
          {questions.map((_, idx) => {
            const isAnswered = answers[idx] !== -1;
            const isCurrent = currentIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-10 h-10 rounded-xl font-black text-sm transition-all flex items-center justify-center cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-500 text-white ring-2 ring-amber-300 scale-105'
                    : isAnswered
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Prev / Next & Final Submit Button */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="px-4 sm:px-6 py-3 rounded-2xl border-2 border-slate-200 bg-white font-extrabold text-sm sm:text-base text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>이전</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-5 sm:px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 font-extrabold text-sm sm:text-base text-white shadow-md shadow-amber-200 flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <span>다음 문제</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCheckAndSubmit}
              className="px-6 sm:px-10 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-black text-base sm:text-lg text-white shadow-lg shadow-emerald-200 flex items-center gap-2 cursor-pointer active:scale-98 animate-pulse"
            >
              <Send className="w-5 h-5" />
              <span>{isSubmitting ? '제출하는 중...' : '답안 제출하기!'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal if unanswered questions remain */}
      {showIncompleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-2 border-amber-200">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 text-2xl">
              ⚠️
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-2">
              아직 풀지 않은 문제가 있어요!
            </h4>
            <p className="text-sm text-slate-500 font-medium mb-5">
              총 {questions.length}문제 중 {answeredCount}문제만 풀었습니다.<br />
              풀지 않은 문제는 오답 처리됩니다. 그래도 지금 제출할까요?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowIncompleteModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-slate-100 font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                돌아가서 풀기
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowIncompleteModal(false);
                  onSubmit(answers);
                }}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 font-black text-white cursor-pointer shadow-md shadow-rose-200"
              >
                그냥 제출하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
