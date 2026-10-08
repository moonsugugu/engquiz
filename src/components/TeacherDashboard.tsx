import React, { useState, useEffect, useMemo } from 'react';
import { 
  QuizQuestion, 
  StudentSubmission 
} from '../types';
import { 
  subscribeToQuizResults, 
  saveQuizResult, 
  auth, 
  testFirestoreConnection 
} from '../firebase';
import { 
  Lock, 
  KeyRound, 
  Unlock, 
  Users, 
  BarChart3, 
  GraduationCap, 
  Search, 
  Download, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Clock, 
  SlidersHorizontal,
  Wifi,
  WifiOff,
  Eye,
  X
} from 'lucide-react';

interface TeacherDashboardProps {
  questions: QuizQuestion[];
  firebaseConnected: boolean;
  onRefreshConnection: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  questions,
  firebaseConnected,
  onRefreshConnection,
}) => {
  // Password authentication state (default: 1234)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Firestore submissions state
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [sortBy, setSortBy] = useState<'latest' | 'highest' | 'lowest' | 'name'>('latest');

  // Selected student for detail modal
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);

  // Sample data seeding state
  const [isSeeding, setIsSeeding] = useState(false);

  // Handle password submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === '1234') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('비밀번호가 일치하지 않습니다. (초기 비밀번호: 1234)');
    }
  };

  // Subscribe to real-time updates when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    const unsubscribe = subscribeToQuizResults(
      (results) => {
        setSubmissions(results);
        setIsLoading(false);
        setSubscribeError(null);
      },
      (err) => {
        console.error('Teacher dashboard error:', err);
        setSubscribeError('결과를 불러오는 중 오류가 발생했습니다. Firebase 연결 상태를 확인해주세요.');
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated]);

  // Unique classes for filter dropdown
  const classOptions = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => {
      if (s.studentClass) set.add(s.studentClass);
    });
    return Array.from(set).sort();
  }, [submissions]);

  // Filtered & sorted submissions
  const filteredSubmissions = useMemo(() => {
    return submissions
      .filter((s) => {
        const matchesClass = selectedClass === 'ALL' || s.studentClass === selectedClass;
        const matchesSearch =
          s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.studentClass.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesClass && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'latest') {
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        }
        if (sortBy === 'highest') {
          return b.score - a.score;
        }
        if (sortBy === 'lowest') {
          return a.score - b.score;
        }
        if (sortBy === 'name') {
          return a.studentName.localeCompare(b.studentName);
        }
        return 0;
      });
  }, [submissions, selectedClass, searchQuery, sortBy]);

  // Overall Statistics
  const totalSubmissions = submissions.length;
  const averageScore = totalSubmissions > 0
    ? Math.round((submissions.reduce((acc, curr) => acc + curr.score, 0) / totalSubmissions) * 10) / 10
    : 0;
  const perfectCount = submissions.filter((s) => s.score === 100).length;

  // Question-by-Question Accuracy Rates
  const questionStats = useMemo(() => {
    return questions.map((q, qIdx) => {
      if (totalSubmissions === 0) {
        return {
          question: q,
          correctCount: 0,
          accuracyRate: 0,
          wrongCount: 0,
          optionCounts: [0, 0, 0, 0],
        };
      }

      let correctCount = 0;
      const optionCounts = [0, 0, 0, 0];

      submissions.forEach((sub) => {
        const chosen = sub.answers[qIdx];
        if (chosen >= 0 && chosen < 4) {
          optionCounts[chosen] += 1;
        }
        if (chosen === q.correctAnswerIndex) {
          correctCount += 1;
        }
      });

      const accuracyRate = Math.round((correctCount / totalSubmissions) * 100);

      return {
        question: q,
        correctCount,
        accuracyRate,
        wrongCount: totalSubmissions - correctCount,
        optionCounts,
      };
    });
  }, [questions, submissions, totalSubmissions]);

  // Add realistic sample student data to Firestore
  const handleAddSampleData = async () => {
    if (!auth.currentUser) return;
    setIsSeeding(true);
    const mockStudents = [
      { studentClass: '3학년 1반', studentNumber: '2번', studentName: '김하은', answers: [0, 2, 3, 1, 1], score: 100, wrong: [] },
      { studentClass: '3학년 1반', studentNumber: '5번', studentName: '박준우', answers: [0, 2, 0, 1, 1], score: 80, wrong: [2] },
      { studentClass: '3학년 1반', studentNumber: '8번', studentName: '이서윤', answers: [0, 1, 3, 1, 1], score: 80, wrong: [1] },
      { studentClass: '3학년 2반', studentNumber: '11번', studentName: '정우진', answers: [0, 2, 3, 1, 1], score: 100, wrong: [] },
      { studentClass: '3학년 2반', studentNumber: '14번', studentName: '최수아', answers: [2, 2, 3, 0, 1], score: 60, wrong: [0, 3] },
    ];

    try {
      const currentUid = auth.currentUser?.uid || `sample_uid_${Date.now()}`;
      for (const mock of mockStudents) {
        await saveQuizResult({
          userId: currentUid,
          studentClass: mock.studentClass,
          studentNumber: mock.studentNumber,
          studentName: mock.studentName,
          score: mock.score,
          totalQuestions: 5,
          answers: mock.answers,
          wrongQuestions: mock.wrong,
          submittedAt: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString()
        });
      }
    } catch (e) {
      console.warn('Error seeding data:', e);
    } finally {
      setIsSeeding(false);
    }
  };

  // Export submissions to CSV (Excel compatible)
  const handleExportCSV = () => {
    if (filteredSubmissions.length === 0) return;

    const headers = ['반', '번호', '이름', '점수', '1번정답', '2번정답', '3번정답', '4번정답', '5번정답', '제출일시'];
    const rows = filteredSubmissions.map((s) => [
      `"${s.studentClass}"`,
      `"${s.studentNumber}"`,
      `"${s.studentName}"`,
      s.score,
      s.answers[0] === questions[0].correctAnswerIndex ? 'O' : 'X',
      s.answers[1] === questions[1].correctAnswerIndex ? 'O' : 'X',
      s.answers[2] === questions[2].correctAnswerIndex ? 'O' : 'X',
      s.answers[3] === questions[3].correctAnswerIndex ? 'O' : 'X',
      s.answers[4] === questions[4].correctAnswerIndex ? 'O' : 'X',
      `"${new Date(s.submittedAt).toLocaleString('ko-KR')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `초등영단어퀴즈_제출결과_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // If not authenticated, show password gate
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 border-2 border-amber-200 shadow-xl shadow-amber-900/5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-1">
            교사 대시보드 로그인
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            선생님 전용 관리 화면입니다. 비밀번호를 입력해주세요.<br />
            <span className="text-amber-600 font-bold">(기본 비밀번호: 1234)</span>
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {authError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                placeholder="비밀번호 입력 (1234)"
                autoFocus
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-hidden text-center text-lg font-black tracking-widest text-slate-800 placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-normal"
              />
              <KeyRound className="w-5 h-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base shadow-lg shadow-amber-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Unlock className="w-4 h-4" />
              <span>대시보드 열기</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Dashboard Top Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-amber-200/80 shadow-md shadow-amber-900/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
              교사 모드
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>실시간 동기화 활성</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            📊 교사 실시간 대시보드
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            학생들의 퀴즈 제출 현황과 문항별 정답률을 실시간으로 확인합니다.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sample Seeding Button */}
          <button
            type="button"
            onClick={handleAddSampleData}
            disabled={isSeeding}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="테스트용 학생 5명의 성적 데이터를 Firestore에 추가합니다"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>{isSeeding ? '추가 중...' : '샘플 데이터 추가'}</span>
          </button>

          {/* Export to CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredSubmissions.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel/CSV 다운로드</span>
          </button>

          {/* Lock/Exit Button */}
          <button
            type="button"
            onClick={() => setIsAuthenticated(false)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 text-xs font-bold cursor-pointer transition-colors"
          >
            잠금
          </button>
        </div>
      </div>

      {/* Firebase connection banner */}
      {!firebaseConnected && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-slate-800 text-xs sm:text-sm font-medium shadow-xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <WifiOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-amber-950 text-sm">
                  Firebase 익명 로그인 미활성화 상태 (로컬 오프라인 모드로 안전하게 작동 중)
                </p>
                <p className="text-xs text-amber-800 mt-0.5">
                  현재 데이터는 브라우저 로컬 저장소에 실시간으로 정상 저장 및 채점되고 있습니다.
                  클라우드 멀티 디바이스 실시간 동기화를 사용하려면 Firebase 콘솔에서 <strong>익명(Anonymous)</strong> 공급자를 켜주세요.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://console.firebase.google.com/project/gen-lang-client-0756140023/authentication/providers"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-xs"
              >
                Firebase 콘솔 열기 ↗
              </a>
              <button
                type="button"
                onClick={onRefreshConnection}
                className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 font-bold text-xs transition-colors cursor-pointer"
              >
                다시 연결 확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-3xl p-5 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">총 제출 학생</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-800">
            {totalSubmissions}
            <span className="text-sm font-bold text-slate-400 ml-1">명</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">실시간 자동 누적</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">전체 평균 점수</span>
            <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-blue-600">
            {averageScore}
            <span className="text-sm font-bold text-slate-400 ml-1">/ 100점</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalSubmissions > 0 ? `${totalSubmissions}명 응시 기준` : '제출 대기 중'}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">100점 만점자</span>
            <span className="text-base">👑</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-600">
            {perfectCount}
            <span className="text-sm font-bold text-slate-400 ml-1">명</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalSubmissions > 0 ? `전체의 ${Math.round((perfectCount / totalSubmissions) * 100)}%` : '0%'}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">취약 문항 (최저 정답률)</span>
            <span className="text-base">⚠️</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 truncate">
            {totalSubmissions > 0
              ? (() => {
                  const lowest = [...questionStats].sort((a, b) => a.accuracyRate - b.accuracyRate)[0];
                  return `${lowest.question.id}번 (${lowest.accuracyRate}%)`;
                })()
              : '-'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            {totalSubmissions > 0
              ? (() => {
                  const lowest = [...questionStats].sort((a, b) => a.accuracyRate - b.accuracyRate)[0];
                  return `${lowest.question.koreanMeaning} (${lowest.question.word})`;
                })()
              : '데이터 집계 대기'}
          </div>
        </div>
      </div>

      {/* Section 1: 문항별 정답률 분석 (Question Accuracy Rates) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-200/80 shadow-md shadow-amber-900/5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
              <span>📈 문항별 정답률 분석</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              각 문제별 학생들의 이해도와 정답률을 한눈에 파악할 수 있습니다.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">총 5개 문항</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {questionStats.map((stat) => {
            const isHigh = stat.accuracyRate >= 80;
            const isMedium = stat.accuracyRate >= 60 && stat.accuracyRate < 80;

            return (
              <div
                key={stat.question.id}
                className="p-4 rounded-2xl border-2 border-slate-100 hover:border-amber-200 bg-slate-50/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-white font-black text-xs">
                      {stat.question.id}번
                    </span>
                    <span className="text-lg">{stat.question.emoji}</span>
                  </div>

                  <div className="font-black text-slate-800 text-sm truncate" title={stat.question.word}>
                    {stat.question.word}
                  </div>
                  <div className="text-xs text-slate-500 font-bold mb-3 truncate">
                    {stat.question.koreanMeaning}
                  </div>

                  {/* Percentage Bar */}
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold">정답률</span>
                      <span className={`font-black text-sm ${
                        isHigh ? 'text-emerald-600' : isMedium ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {stat.accuracyRate}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHigh
                            ? 'bg-emerald-500'
                            : isMedium
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${stat.accuracyRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span>정답 {stat.correctCount}명</span>
                  <span className="text-rose-500">오답 {stat.wrongCount}명</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: 실시간 제출 결과 표 (Live Submissions Table) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-200/80 shadow-md shadow-amber-900/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
              <span>📋 실시간 제출 결과 목록</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {filteredSubmissions.length}건
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              학생이 제출하는 즉시 실시간으로 표에 추가됩니다.
            </p>
          </div>

          {/* Search & Class Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="이름 / 번호 검색..."
                className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-amber-400 w-36 sm:w-44"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-amber-400 bg-white"
            >
              <option value="ALL">전체 학급</option>
              {classOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Sort order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-amber-400 bg-white"
            >
              <option value="latest">최신 제출순</option>
              <option value="highest">점수 높은순</option>
              <option value="lowest">점수 낮은순</option>
              <option value="name">이름순</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>실시간 데이터를 불러오는 중...</span>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <span className="text-3xl block mb-2">📭</span>
            <p className="font-bold text-slate-600">제출된 결과가 없습니다.</p>
            <p className="text-xs text-slate-400 mt-1">
              학생들이 퀴즈를 풀거나 상단의 '샘플 데이터 추가' 버튼을 눌러 테스트해보세요.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[11px] bg-slate-50/60">
                  <th className="py-3 px-4">반</th>
                  <th className="py-3 px-3">번호</th>
                  <th className="py-3 px-4">이름</th>
                  <th className="py-3 px-4 text-center">점수</th>
                  <th className="py-3 px-4 text-center hidden md:table-cell">문항별 결과 (1~5번)</th>
                  <th className="py-3 px-4 text-right">제출 시간</th>
                  <th className="py-3 px-3 text-center">상세</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map((sub) => {
                  const isFull = sub.score === 100;
                  const isPass = sub.score >= 80;

                  return (
                    <tr 
                      key={sub.id || `${sub.userId}-${sub.submittedAt}`}
                      className="hover:bg-amber-50/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap">
                        {sub.studentClass}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-500 whitespace-nowrap">
                        {sub.studentNumber}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 whitespace-nowrap">
                        {sub.studentName}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-full font-black text-xs ${
                          isFull
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isPass
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {sub.score}점
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center hidden md:table-cell whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {questions.map((q, idx) => {
                            const isCorrect = sub.answers[idx] === q.correctAnswerIndex;
                            return (
                              <span
                                key={idx}
                                title={`${idx + 1}번: ${isCorrect ? '정답' : '오답'}`}
                                className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] ${
                                  isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                }`}
                              >
                                {isCorrect ? 'O' : 'X'}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400 text-xs font-medium whitespace-nowrap">
                        {formatDate(sub.submittedAt)}
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedSubmission(sub)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 cursor-pointer transition-colors"
                          title="학생 답안지 상세 보기"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-amber-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h4 className="text-lg font-black text-slate-800">
                  {selectedSubmission.studentClass} {selectedSubmission.studentNumber} {selectedSubmission.studentName} 학생 답안지
                </h4>
                <div className="text-xs text-slate-400 font-medium">
                  제출 일시: {formatDate(selectedSubmission.submittedAt)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2 mb-4 bg-amber-50/70 rounded-2xl border border-amber-200">
              <span className="text-xs text-amber-800 font-bold">최종 획득 점수: </span>
              <span className="text-2xl font-black text-amber-600">{selectedSubmission.score}점</span>
              <span className="text-xs text-slate-400 ml-1">/ 100점</span>
            </div>

            <div className="space-y-3">
              {questions.map((q, idx) => {
                const chosenIdx = selectedSubmission.answers[idx];
                const isCorrect = chosenIdx === q.correctAnswerIndex;
                const chosenWord = chosenIdx >= 0 ? q.options[chosenIdx] : '(미선택)';
                const correctWord = q.options[q.correctAnswerIndex];

                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-2xl border ${
                      isCorrect ? 'border-emerald-200 bg-emerald-50/40' : 'border-rose-200 bg-rose-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-black mb-1">
                      <span className="text-slate-800">
                        {idx + 1}번. {q.koreanMeaning} ({q.word})
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-bold ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isCorrect ? '정답 ⭕' : '오답 ❌'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 mb-1 font-medium">
                      {q.questionText}
                    </div>

                    <div className="text-xs flex items-center justify-between pt-1 border-t border-slate-200/50">
                      <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                        학생 선택: {chosenWord}
                      </span>
                      {!isCorrect && (
                        <span className="text-emerald-700 font-extrabold">
                          정답: {correctWord}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
