/** Điều hướng vòng tròn cho chế độ trình chiếu. */
export const cycleIndex = (index: number, delta: number, total: number): number => {
  if (total <= 0) return 0;
  return (((index + delta) % total) + total) % total;
};

export const AUTOPLAY_INTERVAL_MS = 8000;
