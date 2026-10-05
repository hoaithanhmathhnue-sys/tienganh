'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, LoaderCircle, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { buttonClass } from '@/components/ui/button-class';
import { drawPoster, POSTER_HEIGHT, POSTER_THEMES, POSTER_WIDTH, posterFileName, type PosterOptions } from '@/lib/poster';
import type { Slogan } from '@/lib/slogans';
import { cn } from '@/lib/utils';

const FOOTER = 'Be Van Dan Primary School';

interface PosterDialogProps {
  slogan: Slogan | null;
  onClose: () => void;
}

/** Đọc font thật do next/font sinh ra (biến CSS) để canvas vẽ đúng dấu tiếng Việt và ký hiệu IPA. */
const resolveFonts = (): PosterOptions['fonts'] => {
  const style = getComputedStyle(document.body);
  const read = (name: string, fallback: string) => {
    const value = style.getPropertyValue(name).trim();
    return value ? `${value}, ${fallback}` : fallback;
  };
  return {
    display: read('--font-display', 'system-ui, sans-serif'),
    sans: read('--font-sans', 'system-ui, sans-serif'),
    mono: read('--font-mono', 'ui-monospace, monospace'),
  };
};

const ensureFontsLoaded = async (fonts: PosterOptions['fonts']) => {
  if (!document.fonts?.load) return;
  try {
    await Promise.all([
      document.fonts.load(`800 120px ${fonts.display}`, 'Aă'),
      document.fonts.load(`italic 500 54px ${fonts.sans}`, 'Học ơ ư'),
      document.fonts.load(`500 46px ${fonts.mono}`, 'ˈæ ð ʃ'),
    ]);
  } catch {
    // Không tải được font → canvas dùng font dự phòng.
  }
};

export function PosterDialog({ slogan, onClose }: PosterDialogProps) {
  return (
    <Modal
      open={slogan !== null}
      onClose={onClose}
      title="Tạo poster A4"
      description="Xem trước, chọn mẫu màu rồi tải ảnh PNG hoặc in trực tiếp khổ A4 ngang."
      icon={<Printer className="h-5 w-5" aria-hidden="true" />}
      className="w-[min(calc(100%-1.5rem),56rem)]"
    >
      {slogan && <PosterEditor slogan={slogan} />}
    </Modal>
  );
}

function PosterEditor({ slogan }: { slogan: Slogan }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [themeId, setThemeId] = useState(POSTER_THEMES[0].id);
  const [showIpa, setShowIpa] = useState(true);
  const [showVi, setShowVi] = useState(true);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const theme = POSTER_THEMES.find((t) => t.id === themeId) ?? POSTER_THEMES[0];
    const fonts = resolveFonts();
    void ensureFontsLoaded(fonts).then(() => {
      if (cancelled) return;
      drawPoster(canvas, slogan, { theme, showIpa, showVi, footer: FOOTER, fonts });
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [slogan, themeId, showIpa, showVi]);

  const toBlob = () =>
    new Promise<Blob | null>((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve(null);
      canvas.toBlob(resolve, 'image/png');
    });

  const handleDownload = async () => {
    setBusy(true);
    try {
      const blob = await toBlob();
      if (!blob) throw new Error('no-blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = posterFileName(slogan);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Đã tải poster PNG.');
    } catch {
      toast.error('Không tạo được ảnh poster. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    document.getElementById('poster-print-root')?.remove();
    const root = document.createElement('div');
    root.id = 'poster-print-root';
    const img = document.createElement('img');
    img.alt = slogan.en;
    img.src = canvas.toDataURL('image/png');
    root.appendChild(img);
    document.body.appendChild(root);

    const cleanup = () => {
      root.remove();
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    const print = () => window.print();
    if (img.complete) print();
    else img.onload = print;
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border border-border bg-muted shadow-inner">
        <canvas
          ref={canvasRef}
          width={POSTER_WIDTH}
          height={POSTER_HEIGHT}
          role="img"
          aria-label={`Xem trước poster: ${slogan.en}`}
          className="block h-auto w-full"
        />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-1.5 block text-sm font-semibold" id="poster-theme-label">
            Mẫu màu
          </span>
          <div role="radiogroup" aria-labelledby="poster-theme-label" className="flex flex-wrap gap-2">
            {POSTER_THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={themeId === t.id}
                aria-label={t.name}
                title={t.name}
                onClick={() => setThemeId(t.id)}
                className={cn(
                  'h-11 w-11 rounded-full border-2 shadow-sm transition-transform hover:scale-105',
                  themeId === t.id ? 'border-foreground ring-2 ring-ring ring-offset-2 ring-offset-card' : 'border-white/60',
                )}
                style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5">
          <Toggle label="Phiên âm IPA" checked={showIpa} onChange={setShowIpa} />
          <Toggle label="Nghĩa tiếng Việt" checked={showVi} onChange={setShowVi} />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <button type="button" onClick={handlePrint} disabled={!ready} className={buttonClass('secondary')}>
          <Printer className="h-4 w-4" aria-hidden="true" /> In A4
        </button>
        <button type="button" onClick={handleDownload} disabled={!ready || busy} className={buttonClass('primary')}>
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
          Tải PNG
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-[hsl(var(--primary))]"
      />
      {label}
    </label>
  );
}
