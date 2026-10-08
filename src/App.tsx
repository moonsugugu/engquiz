/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StudentStart } from './components/StudentStart';
import { QuizRunner } from './components/QuizRunner';
import { QuizResult } from './components/QuizResult';
import { WrongAnswerNotes } from './components/WrongAnswerNotes';
import { TeacherDashboard } from './components/TeacherDashboard';
import { QUIZ_QUESTIONS } from './data/quizData';
import { StudentInfo, StudentSubmission, ViewMode } from './types';
import { 
  initAnonymousAuth, 
  testFirestoreConnection, 
  saveQuizResult, 
  auth,
  getAnonymousAuthState 
} from './firebase';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('start');
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [lastSubmission, setLastSubmission] = useState<StudentSubmission | null>(null);

  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize Firebase anonymous auth & test connection at boot
  useEffect(() => {
    let isMounted = true;

    async function checkConnection() {
      try {
        const user = await initAnonymousAuth();
        const firestoreReachable = await testFirestoreConnection();
        if (isMounted) {
          // If anonymous auth is enabled in console and user logged in, or firestore is reachable
          const isFullyConnected = Boolean(user && firestoreReachable);
          setFirebaseConnected(isFullyConnected);
        }
      } catch (err) {
        console.warn('Firebase status check:', err);
        if (isMounted) {
          setFirebaseConnected(false);
        }
      }
    }

    checkConnection();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefreshConnection = async () => {
    try {
      const user = await initAnonymousAuth();
      const firestoreReachable = await testFirestoreConnection();
      const isFullyConnected = Boolean(user && firestoreReachable);
      setFirebaseConnected(isFullyConnected);
      if (isFullyConnected) {
        showToast('Firebase 익명 로그인 및 Firestore 연결 성공! 🟢');
      } else {
        const authState = getAnonymousAuthState();
        if (authState.isBlocked) {
          showToast('Firebase 콘솔에서 익명 로그인이 아직 비활성화 상태입니다. (오프라인 모드 유지)');
        } else {
          showToast('Firebase 연결을 확인하는 중입니다.');
        }
      }
    } catch {
      setFirebaseConnected(false);
      showToast('Firebase 연결 확인 중 오류가 발생했습니다.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Student starts the quiz
  const handleStartQuiz = (info: StudentInfo) => {
    setStudentInfo(info);
    setCurrentView('quiz');
  };

  // Student submits the answers
  const handleSubmitQuiz = async (answers: number[]) => {
    if (!studentInfo) return;
    setIsSubmitting(true);

    try {
      // Ensure user is signed in anonymously if enabled
      const currentUser = await initAnonymousAuth();
      const effectiveUserId = currentUser?.uid || `anon_local_${Date.now()}`;

      // Compute score and wrong questions
      const wrongQuestions: number[] = [];
      let correctCount = 0;

      QUIZ_QUESTIONS.forEach((q, idx) => {
        if (answers[idx] === q.correctAnswerIndex) {
          correctCount += 1;
        } else {
          wrongQuestions.push(idx);
        }
      });

      const score = correctCount * 20; // 5 questions -> 20 points each = 100 max

      const submissionData: Omit<StudentSubmission, 'id'> = {
        userId: effectiveUserId,
        studentClass: studentInfo.studentClass,
        studentNumber: studentInfo.studentNumber,
        studentName: studentInfo.studentName,
        score,
        totalQuestions: QUIZ_QUESTIONS.length,
        answers,
        wrongQuestions,
        submittedAt: new Date().toISOString(),
      };

      // Save to Firebase (and local storage fallback)
      let docId = '';
      try {
        docId = await saveQuizResult(submissionData);
        if (currentUser) {
          setFirebaseConnected(true);
        }
      } catch (err) {
        console.warn('Failed to save to Firestore directly, saved to local cache:', err);
      }

      const fullSubmission: StudentSubmission = {
        id: docId || `local_${Date.now()}`,
        ...submissionData,
      };

      setLastSubmission(fullSubmission);
      setCurrentView('result');
    } catch (error) {
      console.warn('Error during quiz submission handling:', error);
      showToast('제출 처리 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Retry the quiz
  const handleRetryQuiz = () => {
    setCurrentView('quiz');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-amber-50/70 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 text-white text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl shadow-xl backdrop-blur-xs animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        firebaseConnected={firebaseConnected}
        studentName={studentInfo?.studentName}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {currentView === 'start' && (
          <StudentStart
            initialInfo={studentInfo || undefined}
            onStart={handleStartQuiz}
          />
        )}

        {currentView === 'quiz' && studentInfo && (
          <QuizRunner
            questions={QUIZ_QUESTIONS}
            studentInfo={studentInfo}
            onSubmit={handleSubmitQuiz}
            isSubmitting={isSubmitting}
          />
        )}

        {currentView === 'result' && studentInfo && lastSubmission && (
          <QuizResult
            questions={QUIZ_QUESTIONS}
            studentInfo={studentInfo}
            submission={lastSubmission}
            onGoToWrongNotes={() => setCurrentView('wrong_notes')}
            onRetry={handleRetryQuiz}
            onGoToTeacher={() => setCurrentView('teacher')}
          />
        )}

        {currentView === 'wrong_notes' && studentInfo && lastSubmission && (
          <WrongAnswerNotes
            questions={QUIZ_QUESTIONS}
            studentInfo={studentInfo}
            submission={lastSubmission}
            onBackToResult={() => setCurrentView('result')}
            onRetry={handleRetryQuiz}
          />
        )}

        {currentView === 'teacher' && (
          <TeacherDashboard
            questions={QUIZ_QUESTIONS}
            firebaseConnected={firebaseConnected}
            onRefreshConnection={handleRefreshConnection}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200/60 py-6 text-center text-xs text-slate-400 bg-white/40">
        <p className="font-medium">
          초등학교 일상생활 영단어 퀴즈 앱 • Firebase Firestore & Anonymous Auth 연동
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          신나고 재미있는 초등 영단어 학습을 응원합니다! ✨
        </p>
      </footer>
    </div>
  );
}
