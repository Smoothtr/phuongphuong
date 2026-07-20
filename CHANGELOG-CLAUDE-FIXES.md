# CHANGELOG — Fixes theo feedback vòng 3 (10/07/2026)

> Toàn bộ thay đổi dưới đây xử lý các mục P0/P1/P2 trong `FEEDBACK-LIVE-PHUONGPHUONG-VONG3.md`.
> Không đổi kiến trúc, không thêm dependency runtime nào.

## 🔴 P0

### 1. CMS /admin không load được config (Failed to load config.yml — 404)
- **File:** `public/admin/index.html`
- **Nguyên nhân:** thiếu `<link rel="cms-config-url">`. Vercel rewrite `/admin` → `/admin/index.html` nhưng URL không có `/` cuối, Decap resolve `config.yml` tương đối → request `/config.yml` ở root → 404.
- **Fix:** thêm `<link href="/admin/config.yml" type="text/yaml" rel="cms-config-url" />`.
- **Lưu ý còn lại:** để login hoạt động cần set env trên Vercel: `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `CMS_STATE_SECRET` (+ callback URL đúng domain) — xem `.env.example`. Config đang trỏ repo `Smoothtr/phuongphuong`, branch `main`.

### 2. Mask reveal cắt chân chữ italic ("presence." → "bresence.")
- **File:** `src/styles.css`
- **Fix:** `.line-reveal__mask` thêm `padding: 0.14em 0.08em 0.24em` + margin âm tương ứng (giữ layout y nguyên); translate pending & keyframe `lineRise` tăng 110% → 135% để không lộ sliver qua vùng padding.
- **Ảnh hưởng:** mọi heading dùng `LinesReveal` (presence, poise, three acts, something felt…) + nội dung CMS sau này.

### 3. Counter số đo có thể hiển thị giá trị sai khi rAF bị nghẽn
- **File:** `src/App.jsx` (`AnimatedMeasurementValue`)
- **Fix:** thêm `setTimeout(duration + 180ms)` **bảo đảm** số luôn chốt đúng giá trị thật dù rAF bị starve (máy yếu, tab nền, tool đo). Threshold vào view giảm 0.65 → 0.4 để đếm sớm hơn.

## 🟡 P1

### 4. Ảnh grid hiện ô xám khi lướt
- **Files:** `src/App.jsx`, `src/styles.css`, `src/data/portfolio.js`, `scripts/generate-lqip.mjs` (mới), `src/data/lqip.json` (generated)
- **Fix:** (a) LQIP blur-up — placeholder là chính ảnh đó thu 20px, base64, đặt làm background của `<picture class="lqip-shell">`, ảnh thật fade-in khi load (kèm guard `img.complete` cho ảnh cache); (b) 2 work-card đầu `priority` (eager + fetchpriority high).
- **Script:** `npm run images:lqip` (chạy lại khi thêm ảnh mới; nhớ chạy `images:optimize` trước).

### 5. Điều hướng sai đích
- `Book an enquiry` (About): `mailto:` → `#contact` (form ngay dưới; email vẫn hiển thị ở khối contact).
- `View all selected work`: link `#editorial` (sai ngữ nghĩa) → button mở **lightbox** từ ảnh 01. CSS reset thêm cho `button.outline-link`.

### 6. Fonts self-host (fix tên hero trống 3–6s lần đầu vào)
- **Files:** `index.html`, `public/fonts/*` (15 woff2, ~320KB, đủ subset latin + vietnamese), `public/fonts/fonts.css`
- **Fix:** bỏ 2 request Google Fonts render-blocking; preload 3 file quan trọng (Playfair vietnamese + latin, DM Sans latin). Diacritics "PHƯƠNG" giữ nguyên vì có subset vietnamese.

### 7. Form booking — hỗ trợ Web3Forms
- **File:** `src/App.jsx` (`submitBooking`)
- **Fix:** payload thêm `access_key` từ `VITE_FORM_ACCESS_KEY` (nếu có) + field `subject`. Tương thích Web3Forms/Formspree/custom. Chưa set env thì vẫn fallback mailto như cũ.
- **Việc cần user/dev:** tạo key (Web3Forms → nhập email booking → nhận key) rồi set `VITE_FORM_ENDPOINT=https://api.web3forms.com/submit` + `VITE_FORM_ACCESS_KEY=...` trên Vercel.

### 8. Marquee "Featured in" — dừng khi ngoài viewport
- **Files:** `src/App.jsx` (`PressMarquee` + `useViewportActive`), `src/styles.css`
- **Fix:** thêm class `is-idle` khi marquee off-screen → `animation-play-state: paused`; thêm `will-change: transform`. Tránh burn paint/composite vô ích (nghi phạm khiến tool chụp màn hình treo ở vùng About/Contact).

## 🟢 P2

- **OG card riêng 1200×630**: `scripts/generate-og.mjs` → `public/images/og-card.jpg` (crop "attention" từ hero). `site.json → seo.shareImage` trỏ sang file này; vite plugin tự absolutize khi build.
- **Meta description** giàu hơn (tên + Vietnam + booking) trong `site.json` — build tự bơm vào HTML.
- **`public/sitemap.xml`** (mới) + dòng `Sitemap:` trong `robots.txt`.
- **Comp card**: thêm tên file tải về `PhuongPhuong-CompCard-<năm>.pdf` qua thuộc tính `download`.
- **`package.json`**: thêm scripts `images:lqip`, `images:og`.

## Không đụng tới
- Lightbox (đã chuẩn a11y sẵn: role=dialog, aria-modal, focus trap, phím mũi tên — ghi nhận sai trong feedback trước, do probe live bắt nhầm `.reel__overlay`).
- Hệ reveal/parallax hooks (viết tốt, rAF-throttled, IO-gated).
- Nội dung CMS, ảnh, cấu trúc section.

## Checklist regression sau deploy
- [ ] `/admin` hiện màn hình login (không còn lỗi config).
- [ ] "Studies in *presence.*" và "Natural *poise,*" đủ chân chữ.
- [ ] Đứng yên 10s tại About → số đo đúng 166 / 94 / 79·58·85.
- [ ] Cuộn nhanh tới Works → thấy blur mờ thay vì ô xám phẳng.
- [ ] Lần đầu vào (Incognito) → tên hero hiện ≤1.5s.
- [ ] "Book an enquiry" cuộn xuống form; "View all selected work" mở lightbox.
- [ ] Share link → preview OG card ngang 1200×630.
