/**
 * 회차 활성 스케줄 — 이 시각(로컬) 이전 = 도트밸리, 이후 = 세계수.
 * 시간 조정이 필요하면 ROUND_SWITCH만 바꾸면 됩니다.
 */
import type { ContentId } from '@/lib/theme/tokens';

export const ROUND_SWITCH = { hour: 12, minute: 30, label: '12:30' };

/** 주어진 시각의 활성 회차 */
export function activeRoundAt(d: Date): ContentId {
  const mins = d.getHours() * 60 + d.getMinutes();
  const cut = ROUND_SWITCH.hour * 60 + ROUND_SWITCH.minute;
  return mins < cut ? 'dotvalley' : 'sos';
}
