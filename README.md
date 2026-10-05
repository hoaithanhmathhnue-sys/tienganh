# English Classroom Decoration — Trường TH Bế Văn Đàn

Ứng dụng web hỗ trợ giáo viên tiếng Anh tiểu học trang trí lớp học:

- 📚 **Thư viện slogan** theo danh mục, có phiên âm IPA và nghĩa tiếng Việt, tìm kiếm theo cả 3 trường.
- 🔊 **Nghe phát âm** bằng giọng trình duyệt hoặc **giọng Gemini AI** (tuỳ chọn, tự chuyển về giọng trình duyệt khi lỗi).
- 🖨️ **Poster A4**: 5 mẫu màu, bật/tắt IPA & nghĩa Việt, tải ảnh PNG hoặc in trực tiếp khổ A4 ngang.
- 🖥️ **Trình chiếu** toàn màn hình lên bảng/tivi: phím ← → Space, tự chạy 8 giây, đổi màu nền.
- 💛 **Yêu thích** và ✨ **Bộ sưu tập AI**: lưu ngay trên trình duyệt (localStorage).
- 🤖 **Trợ lý AI tạo slogan theo chủ đề** (Gemini API hoặc Agent Platform API), tự động chuyển model dự phòng khi quá tải.
- 📅 Slogan của ngày, 🌗 giao diện sáng/tối, bộ đếm lượt truy cập.

## Công nghệ

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · Framer Motion · `@google/genai` · Vitest.

## Chạy trên máy

Yêu cầu Node.js ≥ 20.9 (khuyến nghị 22 LTS).

```bash
npm install
npm run dev        # http://localhost:3000
```

Các lệnh kiểm tra:

```bash
npm run test       # kiểm thử đơn vị (Vitest)
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run build      # build production như trên Vercel
```

## Cấu hình AI (không cần biến môi trường)

Mỗi giáo viên tự nhập API key trong **Cài đặt AI** (nút góc trên bên phải):

1. Chọn dịch vụ: **Gemini API** (khuyến nghị, có bậc miễn phí) hoặc **Agent Platform API**.
2. Dán API key:
   - Gemini API: lấy tại <https://aistudio.google.com/apikey>
   - Agent Platform API: xem <https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start/api-keys>
3. Chọn model (mặc định Gemini 3.8 Flash; Agent Platform mặc định Gemini 2.5 Flash) rồi bấm **Lưu cấu hình**.

> 🔐 API key **chỉ lưu trong trình duyệt** (localStorage) của người dùng, không gửi về máy chủ của ứng dụng
> và không ghi vào log. Không lưu key trên máy tính dùng chung; có thể bấm **Xoá key** bất cứ lúc nào.

Chuỗi model dự phòng của Gemini API: `gemini-3.8-flash → gemini-3.6-flash → gemini-3.5-flash → gemini-3.5-flash-lite → gemini-3.1-flash-lite → gemini-2.5-flash`.
App chỉ chuyển model khi gặp lỗi quá tải/không khả dụng (500/503/504, model không tồn tại); lỗi key (401), hết quota (429)
hoặc tham số (400) sẽ dừng ngay và hiển thị hướng dẫn bằng tiếng Việt.

## Đưa lên GitHub

```bash
git init
git add .
git commit -m "English Classroom Decoration"
git branch -M main
git remote add origin https://github.com/<tai-khoan>/<ten-repo>.git
git push -u origin main
```

Thư mục `skill/` (tài liệu cho AI agent) đã nằm trong `.gitignore` nên không bị đẩy lên.

## Deploy lên Vercel

1. Đăng nhập <https://vercel.com> → **Add New… → Project** → chọn repo vừa đẩy.
2. Vercel tự nhận Next.js — giữ nguyên Build Command `npm run build`, Output mặc định.
3. (Tuỳ chọn) Thêm biến `NEXT_PUBLIC_SITE_URL` = tên miền chính thức để ảnh chia sẻ (Open Graph) dùng đúng URL.
4. Bấm **Deploy**.

Không cần khai báo API key trên Vercel vì AI chạy trực tiếp từ trình duyệt bằng key của từng người dùng.

## Cấu trúc thư mục

```
app/                 layout, trang chính, CSS toàn cục
components/
  ai/                hộp thoại Cài đặt AI, bảng Trợ lý AI
  slogan/            thẻ slogan, nút nghe/sao chép/yêu thích, poster, trình chiếu, slogan của ngày
  ui/                modal, lớp nút dùng chung
lib/
  ai/                client duy nhất, hàm fallback duy nhất, model, lỗi, cấu hình, tạo slogan, TTS
  slogans.ts         dữ liệu slogan
  poster.ts          vẽ poster canvas
  visit-counter.ts   bộ đếm lượt truy cập (counterapi.dev)
tests/               kiểm thử Vitest
```
