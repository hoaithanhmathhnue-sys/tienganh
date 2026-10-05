# Rà soát + Trợ lý AI — Implementation Plan

> **REQUIRED:** Follow TDD for every task. No production code without failing test first.

**Goal:** Sửa toàn bộ lỗi để app build/deploy Vercel xanh, hoàn thiện công cụ trang trí lớp học và thêm Trợ lý AI Gemini đúng chuẩn api.md.
**Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 3 + `@google/genai` 2.27 + Vitest
**Đối tượng:** Giáo viên tiếng Anh tiểu học
**Passing score target:** N/A (app không có quiz) — tiêu chí là `lint` + `tsc` + `test` + `build` đều exit 0

> [!NOTE]
> Sau khi bạn duyệt, file này sẽ được lưu vào `docs/plans/2026-10-05-ra-soat-va-tro-ly-ai.md` trong project.

---

## Phase 1 — Sửa lỗi build / Vercel / GitHub

- [ ] **1.1** [tsconfig.json](file:///c:/Users/admin/Downloads/apptienganh-main/tsconfig.json): thêm `"skill"`, `"docs"` vào `exclude`.
- [ ] **1.2** [eslint.config.mjs](file:///c:/Users/admin/Downloads/apptienganh-main/eslint.config.mjs): thêm `skill/**` vào `globalIgnores`.
- [ ] **1.3** [.gitignore](file:///c:/Users/admin/Downloads/apptienganh-main/.gitignore): thêm `skill/` (giữ trên máy, không đẩy GitHub); thêm `.vercelignore` dự phòng.
- [ ] **1.4** [package.json](file:///c:/Users/admin/Downloads/apptienganh-main/package.json):
  - thêm script `dev`, `test`, `typecheck`;
  - thêm `tailwind-merge`, `tailwindcss-animate`, `@google/genai@^2.27.0`; dev: `vitest`, `jsdom`;
  - nâng `next` + `eslint-config-next` lên bản vá `16.3.8`;
  - bỏ `resolutions` (Yarn-only), bỏ dependency không dùng (`@radix-ui/*`, `class-variance-authority`);
  - tạo `package-lock.json` để Vercel cài đặt ổn định.
- [ ] **1.5** Xoá [use-toast.ts](file:///c:/Users/admin/Downloads/apptienganh-main/hooks/use-toast.ts) (import file không tồn tại, app dùng sonner).
- [ ] **1.6** [layout.tsx](file:///c:/Users/admin/Downloads/apptienganh-main/app/layout.tsx): đổi font sang `Be_Vietnam_Pro` (subset `vietnamese` + `latin-ext` để hiển thị đúng dấu và ký hiệu IPA); thêm `metadataBase`, `viewport`, `themeColor`.
- [ ] **1.7** [globals.css](file:///c:/Users/admin/Downloads/apptienganh-main/app/globals.css): sửa `--primary-foreground` → trắng (đạt WCAG AA); bổ sung biến dark mode; CSS in ấn `@media print`.
- [ ] **1.8** Sửa footer: bỏ "Quận Thanh Khê" cho thống nhất với header.
- [ ] **1.9** Thêm `README.md` (hướng dẫn chạy, push GitHub, deploy Vercel, lấy API key).

**Verify:** `npm install` → `npm run lint` → `npm run typecheck` → `npm run build` đều exit 0.

---

## Phase 2 — Hoàn thiện công cụ trang trí lớp học

Tách [slogan-app.tsx](file:///c:/Users/admin/Downloads/apptienganh-main/components/slogan-app.tsx) (328 dòng) thành các component nhỏ trong `components/slogan/`.

| Task | Tính năng | File | Test trước (Vitest) |
|---|---|---|---|
| 2.1 | 🔊 **Sửa nút Nghe**: bộ quản lý phát âm dùng chung → chỉ 1 nút "Đang phát" tại một thời điểm | `lib/speech.ts`, `components/slogan/speak-button.tsx` | phát nút B thì trạng thái nút A về idle |
| 2.2 | ⭐ **Yêu thích** (lưu localStorage, tab "Yêu thích") | `lib/favorites.ts`, `components/slogan/favorite-button.tsx` | thêm/bỏ/đọc lại sau reload, dữ liệu hỏng không làm crash |
| 2.3 | 🎲 **Slogan của ngày** (cố định theo ngày) | `lib/daily.ts`, `components/slogan/daily-slogan.tsx` | cùng ngày → cùng câu; khác ngày → đổi |
| 2.4 | 🖨️ **Xuất poster**: chọn 4 mẫu màu → tải **PNG** (vẽ canvas, A4 ngang) hoặc **In A4** | `lib/poster.ts`, `components/slogan/poster-dialog.tsx` | tự xuống dòng chữ dài vừa khung |
| 2.5 | 📺 **Trình chiếu** toàn màn hình, phím ← → / Space / Esc | `components/slogan/presentation-mode.tsx` | điều hướng vòng tròn đầu/cuối |
| 2.6 | 🌙 **Dark mode** toggle | `components/theme-toggle.tsx` | — |
| 2.7 | 📊 **Bộ đếm truy cập** theo visit.md (namespace `englishclassroom-bevandan-edugenvn`, đếm 1 lần/ngày/thiết bị, fallback khi mất mạng) | `lib/visit-counter.ts`, `components/visit-counter.tsx` | không gọi `/up` lần 2 trong cùng ngày |
| 2.8 | ♿ Accessibility: `aria-label` mọi nút, touch target ≥ 44px, `aria-live` cho kết quả tìm kiếm | toàn bộ component | — |

---

## Phase 3 — Trợ lý AI Gemini (tuân thủ nghiêm ngặt api.md)

### 3.1 Lớp AI dùng chung (`lib/ai/`) — viết test trước cho từng file

| File | Nội dung |
|---|---|
| `api-key.ts` | `GOOGLE_AI_API_KEY_PATTERN = /^(?:AIzaSy\|AQ)\S{8,}$/`, `isValidGoogleAiApiKey()`, `maskApiKey()` (chỉ hiện đầu + 4 ký tự cuối) |
| `models.ts` | Chuỗi Gemini: **`gemini-3.8-flash` → `gemini-3.6-flash` → `gemini-3.5-flash` → `gemini-3.5-flash-lite` → `gemini-3.1-flash-lite` → `gemini-2.5-flash`**; danh sách Agent Platform (mặc định `gemini-2.5-flash`); `getOrderedModels()` (model người dùng chọn đứng đầu, loại trùng) |
| `errors.ts` | `parseApiError()` → `INVALID_API_KEY` / `PERMISSION_DENIED` / `QUOTA_EXCEEDED` / `MODEL_OVERLOADED` / `NOT_FOUND` / `INVALID_ARGUMENT` / `UNKNOWN`; thông báo tiếng Việt đúng bảng api.md; **503 không bao giờ báo "key sai"** |
| `settings.ts` | localStorage: `gemini_api_key`, `agent_platform_api_key`, `google_ai_provider`, `google_ai_provider_selection_source=manual`; chuyển `vertex` cũ → Gemini + yêu cầu xác nhận lại |
| `client.ts` | `createGoogleAiClient(apiKey, provider)` — **nơi duy nhất** có `new GoogleGenAI(...)` |
| `generate.ts` | `generateContentWithFallback()` — fallback khi 500/503/504/NOT_FOUND (Agent Platform thêm 403); dừng ngay khi 401/429/400/không rõ; callback `onFallback(from, to, reason)` để UI thông báo |

Quy tắc request: không gửi `temperature/topP/topK`; `thinkingConfig.thinkingLevel` chỉ gửi cho model `gemini-3*` (tránh lỗi 400 khi fallback sang 2.5); JSON dùng `responseMimeType: "application/json"` + `responseSchema`.

### 3.2 Cửa sổ ⚙️ Cài đặt API Key — `components/ai/api-settings-dialog.tsx`
- 2 thẻ **Gemini API** / **Agent Platform API** (người dùng tự chọn, không đoán từ tiền tố key).
- Đổi thẻ → tải đúng key của dịch vụ đó; danh sách model lọc theo dịch vụ.
- Nút hiện/ẩn key, link lấy key, nút **Lưu cấu hình**; không có chữ "Vertex AI Express".

### 3.3 🤖 AI tạo slogan theo chủ đề — `lib/ai/slogan-generator.ts`, `components/ai/ai-generator-panel.tsx`
- Nhập chủ đề (gợi ý nhanh: Tết, An toàn giao thông, Ngày Nhà giáo 20/11, Unit 1–20 lớp 3–5…), chọn số câu (5/10), độ dài (ngắn/vừa).
- Trả về JSON `{ en, ipa, vi }[]` → validate (bỏ câu thiếu trường, trùng lặp) → hiển thị bằng chính `SloganCard` (nghe, chép, yêu thích, xuất poster).
- Lưu vào **"Bộ sưu tập của tôi"** (localStorage), có nút xoá.
- Trạng thái: skeleton khi tải, thông báo khi đổi model dự phòng, lỗi rõ ràng + nút thử lại.

### 3.4 🔊 Giọng đọc AI — `lib/ai/tts.ts`, `lib/audio/pcm.ts`
- Model `gemini-3.1-flash-tts-preview` (free tier có), giọng mặc định chọn được (ví dụ `Kore`, `Puck`).
- PCM 16-bit 24 kHz → phát bằng Web Audio; cache theo câu để không gọi lại.
- **Chỉ bật khi provider = Gemini**; mặc định vẫn dùng giọng trình duyệt (miễn phí, không cần key). Lỗi TTS → tự quay về giọng trình duyệt.

---

## Phase 4 — Verify & Review

```bash
npm run test        # Expected: tất cả test pass
npm run lint        # Expected: 0 error
npm run typecheck   # Expected: exit 0
npm run build       # Expected: exit 0, không lỗi
```
- Kiểm tra trình duyệt ở **375px / 768px / 1440px**: console không lỗi, dấu tiếng Việt + IPA hiển thị đúng, dark mode, xuất PNG, trình chiếu, cửa sổ cài đặt (lưu → reload giữ đúng provider với key `AIzaSy…` và `AQ…`).
- Rà soát: không còn `new GoogleGenAI` ngoài `client.ts`, không log key.

> [!IMPORTANT]
> Nếu không có API key thật, tôi chỉ kiểm thử được luồng giao diện và xử lý lỗi; chưa xác nhận request AI thực tế. Bạn có thể dán key tạm khi kiểm thử nếu muốn tôi xác nhận end-to-end.

---

## Ngoài phạm vi (có thể làm sau)
- Góc học sinh (flashcard/quiz, XP) — Hướng 3.
- Đồng bộ dữ liệu đám mây (hiện chỉ lưu trên trình duyệt).
