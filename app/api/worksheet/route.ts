/**
 * 동적 활동지 생성 (서버 라우트). 바구니 성취기준·활동 → Gemini로 활동지 스펙 생성.
 * 키 없음·실패 시 AI 없이 입력만으로 구성(worksheetFromInput) → 그것도 비면 기본 차시.
 */
import { NextResponse } from 'next/server';
import {
  WORKSHEET_MODEL,
  buildWorksheetPrompt,
  parseWorksheet,
  worksheetFromInput,
  type WorksheetInput,
} from '@/lib/demo/worksheet';

export async function POST(req: Request) {
  let input: WorksheetInput = { standards: [], activities: [] };
  try {
    const body = (await req.json()) as Partial<WorksheetInput>;
    input = {
      standards: Array.isArray(body.standards) ? body.standards : [],
      activities: Array.isArray(body.activities) ? body.activities : [],
    };
  } catch {
    return NextResponse.json({ spec: worksheetFromInput({ standards: [], activities: [] }) });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ spec: worksheetFromInput(input) });

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${WORKSHEET_MODEL}:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildWorksheetPrompt(input) }] }],
        generationConfig: { temperature: 0.5, responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return NextResponse.json({ spec: worksheetFromInput(input) });
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const spec = parseWorksheet(text, input) ?? worksheetFromInput(input);
    return NextResponse.json({ spec });
  } catch {
    return NextResponse.json({ spec: worksheetFromInput(input) });
  }
}
