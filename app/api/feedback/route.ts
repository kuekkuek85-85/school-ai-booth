/**
 * Gemini 자동 피드백 (서버 라우트). GEMINI_API_KEY는 서버 전용.
 * 실패·키 없음 시 { feedback: null }로 조용히 폴백 — 제출 자체는 항상 성공(F5-2).
 */
import { NextResponse } from 'next/server';
import { GEMINI_MODEL, buildPrompt, parseFeedback, type FeedbackInput } from '@/lib/demo/feedback';

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  let input: FeedbackInput = {};
  try {
    input = (await req.json()) as FeedbackInput;
  } catch {
    return NextResponse.json({ feedback: null });
  }
  if (!key) return NextResponse.json({ feedback: null });

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(input) }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      }),
      // 응답 지연 대비 타임아웃
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return NextResponse.json({ feedback: null });
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return NextResponse.json({ feedback: parseFeedback(text) });
  } catch {
    return NextResponse.json({ feedback: null });
  }
}
