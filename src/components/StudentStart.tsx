import React, { useState } from 'react';
import { StudentInfo } from '../types';
import { ArrowRight, BookOpen, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface StudentStartProps {
  initialInfo?: StudentInfo;
  onStart: (info: StudentInfo) => void;
}

export const StudentStart: React.FC<StudentStartProps> = ({ initialInfo, onStart }) => {
  const [studentClass, setStudentClass] = useState(initialInfo?.studentClass || '3학년 1반');
  const [studentNumber, setStudentNumber] = useState(initialInfo?.studentNumber || '');
  const [studentName, setStudentName] = useState(initialInfo?.studentName || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentClass.trim()) {
      setErrorMsg('반을 입력해주세요. (예: 3학년 1반 또는 1반)');
      return;
    }
    if (!studentNumber.trim()) {
      setErrorMsg('번호를 입력해주세요. (예: 15번)');
      return;
    }
    if (!studentName.trim()) {
      setErrorMsg('이름을 입력해주세요.');
      return;
    }

    setErrorMsg('');
    onStart({
      studentClass: studentClass.trim(),
      studentNumber: studentNumber.trim(),
      studentName: studentName.trim(),
    });
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      {/* Welcome Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-amber-900/5 border-2 border-amber-200 relative overflow-hidden">
        {/* Background playful shapes */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-100 rounded-full blur-2xl pointer-events-none opacity-60" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-100 rounded-full blur-2xl pointer-events-none opacity-60" />

        {/* Header graphics */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-100 text-4xl mb-3 shadow-inner shadow-amber-200 animate-bounce">
            🌟
          </div>
          <div className="inline-block px-3 py-1 bg-amber-500/10 text-amber-700 font-extrabold text-xs rounded-full mb-2">
            초등학교 일상생활 영단어 평가
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            영단어 실력 퀴즈에<br className="sm:hidden" /> 오신 것을 환영해요!
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            주변에서 자주 만나는 일상 영단어 5문항 퀴즈입니다.<br />
            아래에 나의 정보를 적고 힘차게 시작해봐요!
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>🏫 반 (학급)</span>
              <span className="text-[11px] text-slate-400 font-normal">예: 3학년 2반, 1반</span>
            </label>
            <input
              type="text"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              placeholder="예: 3학년 1반"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:bg-amber-50/20 focus:outline-hidden transition-all text-base font-bold text-slate-800 placeholder:text-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                🔢 번호
              </label>
              <input
                type="text"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="예: 7번"
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:bg-amber-50/20 focus:outline-hidden transition-all text-base font-bold text-slate-800 placeholder:text-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                👦👧 이름
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="예: 김민준"
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:bg-amber-50/20 focus:outline-hidden transition-all text-base font-bold text-slate-800 placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Test highlights card */}
          <div className="mt-5 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-slate-600 space-y-2">
            <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>퀴즈 안내 사항</span>
            </div>
            <ul className="space-y-1 pl-1 text-[13px]">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>총 <strong>5문제</strong>의 객관식 퀴즈입니다.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>문제를 풀고 제출하면 바로 <strong>점수와 정답</strong>이 나와요.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>틀린 문제는 <strong>오답 노트</strong>에서 발음과 해설을 다시 공부할 수 있어요.</span>
              </li>
            </ul>
          </div>

          {/* Big Start Button */}
          <button
            type="submit"
            className="w-full mt-6 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-black text-lg sm:text-xl shadow-lg shadow-orange-300/40 hover:shadow-orange-400/60 transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>퀴즈 시작하기!</span>
            <ArrowRight className="w-6 h-6 stroke-[3]" />
          </button>
        </form>
      </div>
    </div>
  );
};
