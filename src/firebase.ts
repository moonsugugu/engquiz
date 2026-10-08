import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  setDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { StudentSubmission } from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const LOCAL_STORAGE_KEY = 'korean_vocab_quiz_results';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Local storage fallback helpers
export function getLocalResults(): StudentSubmission[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalResult(submission: StudentSubmission) {
  try {
    const current = getLocalResults();
    // Prepend new submission
    const updated = [submission, ...current.filter((item) => item.id !== submission.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('quiz_results_updated', { detail: updated }));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
}

let isAnonymousBlocked = false;

export function getAnonymousAuthState() {
  return {
    isBlocked: isAnonymousBlocked,
    projectId: firebaseConfig.projectId,
  };
}

// Anonymous authentication for students & teachers
export async function initAnonymousAuth(): Promise<User | null> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        unsubscribe();
        isAnonymousBlocked = false;
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          unsubscribe();
          isAnonymousBlocked = false;
          resolve(cred.user);
        } catch (err: unknown) {
          unsubscribe();
          const errCode = (err as { code?: string })?.code;
          if (errCode === 'auth/admin-restricted-operation') {
            console.warn(
              'Firebase Anonymous sign-in is not yet enabled in the Firebase Console. ' +
              'To enable it: Firebase Console > Authentication > Sign-in method > Anonymous. ' +
              'The application is running in graceful local-persistence mode.'
            );
            isAnonymousBlocked = true;
            resolve(null);
          } else {
            console.warn('Anonymous sign-in could not be completed at this time:', err);
            isAnonymousBlocked = true;
            resolve(null);
          }
        }
      }
    });
  });
}

// Test connection at boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline.");
      return false;
    }
    return true;
  }
}

// Submit Quiz Result
export async function saveQuizResult(submission: Omit<StudentSubmission, 'id'>): Promise<string> {
  const resultId = `result_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const fullSubmission: StudentSubmission = {
    id: resultId,
    ...submission,
  };

  // Always store locally as fallback / instant cache
  saveLocalResult(fullSubmission);

  // If user is authenticated in Firebase, persist to Firestore
  if (auth.currentUser) {
    const pathForWrite = `quiz_results/${resultId}`;
    try {
      const docRef = doc(db, 'quiz_results', resultId);
      await setDoc(docRef, {
        userId: submission.userId,
        studentClass: submission.studentClass,
        studentNumber: submission.studentNumber,
        studentName: submission.studentName,
        score: submission.score,
        totalQuestions: submission.totalQuestions,
        answers: submission.answers,
        wrongQuestions: submission.wrongQuestions,
        submittedAt: submission.submittedAt
      });
      return resultId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, pathForWrite);
    }
  }

  return resultId;
}

// Listen to all quiz results in real time (for Teacher Dashboard)
export function subscribeToQuizResults(
  onUpdate: (results: StudentSubmission[]) => void,
  onError: (err: Error) => void
) {
  // If authenticated in Firebase, listen via Firestore onSnapshot
  if (auth.currentUser) {
    const pathForQuery = 'quiz_results';
    try {
      const q = query(collection(db, pathForQuery), orderBy('submittedAt', 'desc'));
      const unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          const results: StudentSubmission[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            results.push({
              id: docSnap.id,
              userId: data.userId,
              studentClass: data.studentClass,
              studentNumber: data.studentNumber,
              studentName: data.studentName,
              score: data.score,
              totalQuestions: data.totalQuestions,
              answers: data.answers || [],
              wrongQuestions: data.wrongQuestions || [],
              submittedAt: data.submittedAt || new Date().toISOString()
            });
          });

          // Also merge with any local items that might not have synced
          const localItems = getLocalResults();
          const firestoreIds = new Set(results.map(r => r.id));
          const merged = [...results];
          localItems.forEach(localItem => {
            if (!firestoreIds.has(localItem.id)) {
              merged.push(localItem);
            }
          });

          onUpdate(merged);
        },
        (error) => {
          // If Firestore permission denied (e.g. auth expired), fallback to local storage
          console.warn('Firestore subscription fallback to local storage:', error.message);
          onUpdate(getLocalResults());
        }
      );

      return unsubscribeFirestore;
    } catch (error) {
      console.warn('Failed to start Firestore listener, using local storage:', error);
      onUpdate(getLocalResults());
    }
  } else {
    // If not authenticated in Firebase, deliver local storage results
    onUpdate(getLocalResults());
  }

  // Also listen for local custom events and storage events
  const handleLocalUpdate = (e: Event) => {
    const customEvent = e as CustomEvent<StudentSubmission[]>;
    if (customEvent.detail) {
      onUpdate(customEvent.detail);
    } else {
      onUpdate(getLocalResults());
    }
  };

  const handleStorageUpdate = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_KEY) {
      onUpdate(getLocalResults());
    }
  };

  window.addEventListener('quiz_results_updated', handleLocalUpdate);
  window.addEventListener('storage', handleStorageUpdate);

  return () => {
    window.removeEventListener('quiz_results_updated', handleLocalUpdate);
    window.removeEventListener('storage', handleStorageUpdate);
  };
}
