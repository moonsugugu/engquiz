import React from 'react';
import { Sparkles, User, GraduationCap, Wifi, WifiOff } from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  firebaseConnected: boolean;
  studentName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  firebaseConnected,
  studentName,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div 
          onClick={() => onNavigate('start')} 
          className="flex items-center gap-2.5 cursor-pointer group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-white shadow-md shadow-amber-200 group-hover:rotate-6 transition-transform">
            <span className="text-xl">🎒</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-slate-800 text-lg sm:text-xl tracking-tight">
                초등 <span className="text-amber-500">영단어</span> 퀴즈
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                5문항
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              초등학생 일상생활 영단어 실력 쑥쑥!
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Connection status indicator */}
          <div 
            title={firebaseConnected ? "Firebase Firestore 실시간 연결됨" : "Firebase 연결 확인 중 / 오프라인"}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              firebaseConnected 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
            }`}
          >
            {firebaseConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <Wifi className="w-3.5 h-3.5 hidden xs:inline" />
                <span className="hidden sm:inline">실시간 연결됨</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                <WifiOff className="w-3.5 h-3.5" />
                <span className="text-[11px]">오프라인 모드</span>
              </>
            )}
          </div>

          {/* Student Badge if taking test */}
          {studentName && currentView !== 'teacher' && (
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>{studentName} 학생</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => onNavigate(studentName ? 'quiz' : 'start')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                currentView !== 'teacher'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>✏️</span>
              <span className="hidden xs:inline">학생</span> 퀴즈
            </button>
            <button
              onClick={() => onNavigate('teacher')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                currentView === 'teacher'
                  ? 'bg-amber-500 text-white shadow-xs shadow-amber-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">교사</span> 대시보드
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
