/**
 * 타입드 Firestore 컬렉션/문서 ref 헬퍼.
 * 부스: booth/{sessionId}/{participants|progress}/{uid}
 * 차시앱: sessions/{sessionId}/{students|progress}/{uid}
 * 문서 ID = 익명 uid (규칙에서 소유권 검증).
 */
import {
  collection,
  doc,
  type CollectionReference,
  type DocumentReference,
  type FirestoreDataConverter,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/app';

function converter<T>(): FirestoreDataConverter<T> {
  return {
    toFirestore: (data) => data as Record<string, unknown>,
    fromFirestore: (snap) => snap.data() as T,
  };
}

/* ===================== 부스 ===================== */

export interface Participant {
  school: string;
  name: string;
  joinedAt: Timestamp | null;
  uid: string;
}

export interface BoothProgress {
  m1: boolean;
  m2: boolean;
  m3: boolean;
  updatedAt: Timestamp | null;
  uid: string;
}

export function participantsCol(
  sessionId: string,
): CollectionReference<Participant> {
  return collection(db, 'booth', sessionId, 'participants').withConverter(
    converter<Participant>(),
  );
}
export function participantDoc(
  sessionId: string,
  uid: string,
): DocumentReference<Participant> {
  return doc(db, 'booth', sessionId, 'participants', uid).withConverter(
    converter<Participant>(),
  );
}
export function boothProgressCol(
  sessionId: string,
): CollectionReference<BoothProgress> {
  return collection(db, 'booth', sessionId, 'progress').withConverter(
    converter<BoothProgress>(),
  );
}
export function boothProgressDoc(
  sessionId: string,
  uid: string,
): DocumentReference<BoothProgress> {
  return doc(db, 'booth', sessionId, 'progress', uid).withConverter(
    converter<BoothProgress>(),
  );
}

/* ---- 발표 동기화(교사→수강생 강제 슬라이드) ---- */
export interface PresentationControl {
  active: boolean;
  slide: number;
  updatedAt: Timestamp | null;
}
export function presentationDoc(
  sessionId: string,
): DocumentReference<PresentationControl> {
  return doc(db, 'booth', sessionId, 'control', 'presentation').withConverter(
    converter<PresentationControl>(),
  );
}

/* ===================== 차시앱 ===================== */

export interface Student {
  name: string;
  studentNo: string;
  joinedAt: Timestamp | null;
  uid: string;
}

export interface DemoQuizResult {
  q1: string;
  q2: number; // 선택 인덱스(-1=미응답)
  q3: string;
  score: number; // 객관식 자동 채점(0 또는 1)
}

export interface DemoFeedback {
  artifact?: string;
  q1?: string;
  q3?: string;
  level?: '상' | '중' | '하';
}

export interface DemoProgress {
  /** 가변 단계 — 활동지 스펙의 단계 key + 'quiz'. (예: intro/act1.. 또는 act0/act1../quiz) */
  steps: Record<string, boolean>;
  artifact: string;
  quiz: DemoQuizResult | null;
  feedback?: DemoFeedback;
  updatedAt: Timestamp | null;
  uid: string;
}

export function studentsCol(sessionId: string): CollectionReference<Student> {
  return collection(db, 'sessions', sessionId, 'students').withConverter(
    converter<Student>(),
  );
}
export function studentDoc(
  sessionId: string,
  uid: string,
): DocumentReference<Student> {
  return doc(db, 'sessions', sessionId, 'students', uid).withConverter(
    converter<Student>(),
  );
}
export function demoProgressCol(
  sessionId: string,
): CollectionReference<DemoProgress> {
  return collection(db, 'sessions', sessionId, 'progress').withConverter(
    converter<DemoProgress>(),
  );
}
export function demoProgressDoc(
  sessionId: string,
  uid: string,
): DocumentReference<DemoProgress> {
  return doc(db, 'sessions', sessionId, 'progress', uid).withConverter(
    converter<DemoProgress>(),
  );
}

/* ============ 발행된 활동지(부스 바구니 → 차시앱 공유) ============ */

export interface PublishedWorksheet {
  standards: string[];
  activities: { title: string; label: string; link: string }[];
  createdAt: Timestamp | null;
}

export function worksheetDoc(): DocumentReference<PublishedWorksheet> {
  return doc(db, 'worksheets', 'active').withConverter(
    converter<PublishedWorksheet>(),
  );
}
