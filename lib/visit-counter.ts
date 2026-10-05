import { getStorage, readString, writeString } from '@/lib/storage';

// Cấu hình theo visit.md — namespace riêng cho app này.
export const VISIT_NAMESPACE = 'englishclassroom-bevandan-edugenvn';
export const BASE_VISIT_OFFSET = 1000;
const COUNTER_URL = `https://api.counterapi.dev/v1/${VISIT_NAMESPACE}/visits`;

const KEYS = {
  mine: `${VISIT_NAMESPACE}_my_visits`,
  lastDate: `${VISIT_NAMESPACE}_last_visit_date`,
  today: `${VISIT_NAMESPACE}_today_visits`,
  countedDate: `${VISIT_NAMESPACE}_counted_date`,
  total: `${VISIT_NAMESPACE}_total_cache`,
};

export interface VisitData {
  /** Tổng lượt (server) — null nếu chưa từng lấy được và đang mất mạng. */
  total: number | null;
  today: number;
  mine: number;
}

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const toInt = (value: string | null) => {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

/**
 * Ghi nhận một lượt truy cập.
 * - Server (counterapi.dev): chỉ gọi `/up` lần đầu mỗi ngày trên mỗi thiết bị; các lần sau chỉ đọc.
 * - Cá nhân (localStorage): lượt của bạn và lượt hôm nay.
 * - Mất mạng: dùng số đã lưu gần nhất — không bịa số.
 */
export async function recordVisit({
  fetchFn = (url: string) => fetch(url),
  now = new Date(),
  storage = getStorage(),
}: {
  fetchFn?: (url: string) => Promise<Response>;
  now?: Date;
  storage?: Storage | null;
} = {}): Promise<VisitData> {
  const today = dateKey(now);

  const mine = toInt(readString(KEYS.mine, storage)) + 1;
  writeString(KEYS.mine, String(mine), storage);

  const sameDay = readString(KEYS.lastDate, storage) === today;
  const todayVisits = (sameDay ? toInt(readString(KEYS.today, storage)) : 0) + 1;
  writeString(KEYS.today, String(todayVisits), storage);
  writeString(KEYS.lastDate, today, storage);

  const alreadyCounted = readString(KEYS.countedDate, storage) === today;
  const cached = readString(KEYS.total, storage);
  let total: number | null = cached ? toInt(cached) : null;

  try {
    const response = await fetchFn(alreadyCounted ? COUNTER_URL : `${COUNTER_URL}/up`);
    const data = (await response.json()) as { count?: unknown };
    if (typeof data?.count === 'number' && data.count >= 0) {
      total = BASE_VISIT_OFFSET + data.count;
      writeString(KEYS.total, String(total), storage);
      if (!alreadyCounted) writeString(KEYS.countedDate, today, storage);
    }
  } catch {
    // giữ giá trị đã lưu
  }

  return { total, today: todayVisits, mine };
}
