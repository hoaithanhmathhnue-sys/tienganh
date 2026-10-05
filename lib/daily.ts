const DAY_MS = 86_400_000;
/** Số nguyên tố lớn để hai ngày liên tiếp luôn cho chỉ số khác nhau. */
const STEP = 7919;

/** Chỉ số "slogan của ngày": cố định trong một ngày (theo giờ máy), đổi khi sang ngày mới. */
export const getDailyIndex = (date: Date, total: number): number => {
  if (total <= 0) return 0;
  const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
  return (((dayNumber * STEP) % total) + total) % total;
};
