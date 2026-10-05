import type { Slogan } from '@/lib/slogans';

/** Ngắt dòng theo từ sao cho mỗi dòng không vượt `maxWidth` (từ quá dài giữ nguyên một dòng). */
export const wrapText = (text: string, maxWidth: number, measure: (s: string) => number): string[] => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || measure(candidate) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
};

/** Tìm cỡ chữ lớn nhất (từ `maxSize` giảm dần đến `minSize`) để văn bản vừa `maxLines` dòng. */
export const fitText = (
  text: string,
  maxWidth: number,
  maxLines: number,
  maxSize: number,
  minSize: number,
  measureAt: (size: number, s: string) => number,
): { fontSize: number; lines: string[] } => {
  for (let size = maxSize; size >= minSize; size -= 4) {
    const lines = wrapText(text, maxWidth, (s) => measureAt(size, s));
    const fits = lines.length <= maxLines && lines.every((l) => measureAt(size, l) <= maxWidth);
    if (fits) return { fontSize: size, lines };
  }
  return { fontSize: minSize, lines: wrapText(text, maxWidth, (s) => measureAt(minSize, s)) };
};

export interface PosterTheme {
  id: string;
  name: string;
  from: string;
  to: string;
  text: string;
  accent: string;
}

export const POSTER_THEMES: PosterTheme[] = [
  { id: 'teal', name: 'Xanh ngọc', from: '#00BFA5', to: '#00796B', text: '#FFFFFF', accent: '#FFD54F' },
  { id: 'sunny', name: 'Nắng vàng', from: '#FFF8E1', to: '#FFD54F', text: '#4E342E', accent: '#F4511E' },
  { id: 'sky', name: 'Bầu trời', from: '#E3F2FD', to: '#64B5F6', text: '#0D3C78', accent: '#EC407A' },
  { id: 'berry', name: 'Tím mộng mơ', from: '#7C3AED', to: '#DB2777', text: '#FFFFFF', accent: '#FDE68A' },
  { id: 'chalk', name: 'Bảng phấn', from: '#1F3B2D', to: '#2E5A43', text: '#F5F5F0', accent: '#FFEB3B' },
];

/** A4 ngang ở 150 dpi. */
export const POSTER_WIDTH = 1754;
export const POSTER_HEIGHT = 1240;

export interface PosterOptions {
  theme: PosterTheme;
  showIpa: boolean;
  showVi: boolean;
  footer: string;
  fonts: { display: string; sans: string; mono: string };
}

const STARS: [number, number, number][] = [
  [140, 150, 34], [1610, 170, 28], [220, 1080, 24], [1540, 1060, 38], [880, 110, 18], [1660, 620, 20], [96, 640, 22],
];

const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
  }
  ctx.closePath();
  ctx.fill();
};

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

/** Vẽ poster slogan lên canvas (chỉ chạy trên trình duyệt). */
export function drawPoster(canvas: HTMLCanvasElement, slogan: Slogan, options: PosterOptions): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { theme, fonts } = options;
  const W = POSTER_WIDTH;
  const H = POSTER_HEIGHT;
  canvas.width = W;
  canvas.height = H;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, theme.from);
  bg.addColorStop(1, theme.to);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.globalAlpha = 0.12;
  ctx.fillStyle = theme.text;
  ctx.beginPath(); ctx.arc(0, 0, 320, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(W, H, 380, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = theme.accent;
  for (const [x, y, r] of STARS) drawStar(ctx, x, y, r);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = theme.text;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 8;
  roundRect(ctx, 60, 60, W - 120, H - 120, 48);
  ctx.stroke();
  ctx.globalAlpha = 1;

  const maxWidth = W - 320;
  const main = fitText(slogan.en, maxWidth, 3, 160, 64, (size, s) => {
    ctx.font = `800 ${size}px ${fonts.display}`;
    return ctx.measureText(s).width;
  });
  const mainLineHeight = main.fontSize * 1.18;

  const ipaSize = 46;
  const viSize = 54;
  ctx.font = `500 ${ipaSize}px ${fonts.mono}`;
  const ipaLines = options.showIpa && slogan.ipa ? wrapText(slogan.ipa, maxWidth, (s) => ctx.measureText(s).width) : [];
  ctx.font = `italic 500 ${viSize}px ${fonts.sans}`;
  const viLines = options.showVi && slogan.vi ? wrapText(slogan.vi, maxWidth, (s) => ctx.measureText(s).width) : [];

  const gap = 44;
  const blockHeight =
    main.lines.length * mainLineHeight +
    (ipaLines.length ? gap + ipaLines.length * ipaSize * 1.3 : 0) +
    (viLines.length ? gap + viLines.length * viSize * 1.3 : 0);

  let y = (H - blockHeight) / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = theme.text;

  ctx.font = `800 ${main.fontSize}px ${fonts.display}`;
  for (const line of main.lines) {
    ctx.fillText(line, W / 2, y);
    y += mainLineHeight;
  }

  if (ipaLines.length) {
    y += gap;
    ctx.globalAlpha = 0.85;
    ctx.font = `500 ${ipaSize}px ${fonts.mono}`;
    for (const line of ipaLines) {
      ctx.fillText(line, W / 2, y);
      y += ipaSize * 1.3;
    }
    ctx.globalAlpha = 1;
  }

  if (viLines.length) {
    y += gap;
    ctx.font = `italic 500 ${viSize}px ${fonts.sans}`;
    for (const line of viLines) {
      ctx.fillText(line, W / 2, y);
      y += viSize * 1.3;
    }
  }

  if (options.footer) {
    ctx.globalAlpha = 0.7;
    ctx.font = `600 28px ${fonts.sans}`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(options.footer, W / 2, H - 92);
    ctx.globalAlpha = 1;
  }
}

/** Tên file an toàn từ câu slogan. */
export const posterFileName = (slogan: Slogan): string =>
  `poster-${slogan.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'slogan'}.png`;
