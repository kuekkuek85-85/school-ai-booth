/**
 * 교사/강사 대시보드 PIN 검증 (서버 전용).
 * TEACHER_PIN은 서버 환경변수 → 클라이언트 번들에 노출되지 않는다.
 * 데모 수준: 단순 문자열 비교(개인정보는 소속·성함·학번뿐, 세션 리셋으로 파기).
 */
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let pin = '';
  try {
    const body = (await req.json()) as { pin?: string };
    pin = String(body.pin ?? '');
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const expected = process.env.TEACHER_PIN ?? '';
  const ok = expected.length > 0 && pin === expected;
  return NextResponse.json({ ok });
}
