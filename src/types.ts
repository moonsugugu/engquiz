export interface QuizQuestion {
  id: number;
  word: string; // e.g. "Breakfast"
  phonetic: string; // e.g. "[브렉퍼스트]"
  koreanMeaning: string; // e.g. "아침 식사"
  questionText: string; // e.g. "아침에 일어나서 먹는 밥을 영어로 무엇이라고 할까요?"
  emoji: string; // e.g. "🍳"
  category: string; // e.g. "음식 & 생활"
  options: string[]; // 4 English choices
  correctAnswerIndex: number; // 0-3
  explanation: string; // 친절한 초등 눈높이 해설
  exampleSentence: string; // e.g. "I eat breakfast at 8 AM."
  exampleTranslation: string; // e.g. "나는 아침 8시에 아침밥을 먹어요."
}

export interface StudentInfo {
  studentClass: string; // e.g. "3-1" or "3학년 2반"
  studentNumber: string; // e.g. "14"
  studentName: string; // e.g. "김민준"
}

export interface StudentSubmission {
  id?: string;
  userId: string;
  studentClass: string;
  studentNumber: string;
  studentName: string;
  score: number; // e.g. 80 (or 100)
  totalQuestions: number; // 5
  answers: number[]; // student's chosen option index for each question
  wrongQuestions: number[]; // question IDs (1-based) that were wrong
  submittedAt: string; // ISO string
}

export type ViewMode = 'start' | 'quiz' | 'result' | 'wrong_notes' | 'teacher';
