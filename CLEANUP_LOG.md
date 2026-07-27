# Cleanup Log — Xóa chức năng Affiliate, Kiểm soát Lãi/Lỗ & Tracking Pixels

Ngày: 2026-07-27
Lý do: Tinh gọn sản phẩm để chuẩn bị báo cáo.

Trạng thái:
- Mục 1 (Profit) & Mục 2 (Affiliate) — **đã commit & push lên `origin`** (kèm 1 commit fix riêng lỗi 500 ở admin 2FA, không liên quan cleanup)
- Mục 3 (Tracking Pixels) — đã xóa ở code, **chưa commit/push** — chờ xác nhận

---

## 1. Kiểm soát Lãi/Lỗ (Profit)

### File đã xóa
- `pages/dashboard/profit.jsx`
- `pages/api/dashboard/stats.js` (dead code — không có nơi nào gọi, chỉ phục vụ tính năng này)

### File đã sửa (gỡ tham chiếu)
- `components/DashboardLayout.jsx` — bỏ nav item, icon `Coins`, và `'profit'` khỏi role-lock whitelist
- `lib/planLimits.js` — bỏ feature flag `profit` ở cả 4 gói
- `lib/teamAccess.js` — bỏ permission `view_profit`
- `lib/i18n.js` — bỏ `dashboard.nav.profit` (VI + EN)
- `pages/huong-dan.jsx` — xóa mục "Tab Tính Lãi Lỗ" (id `lai-lo`), đánh số lại các mục còn lại (4→3 ... 10→9)

### Dữ liệu DB liên quan
- **Không có** — tính năng này tính toán 100% ở client (`localStorage`, key `profit_settings_v1` trên trình duyệt người dùng), không có bảng Supabase riêng. **Không cần xóa gì trong DB.**

---

## 2. Affiliate

### File đã xóa
- `pages/dashboard/affiliate.jsx` (trang affiliate cho user)
- `pages/affiliate.jsx` (trang marketing công khai `/affiliate`)
- `pages/admin/affiliates.jsx` (trang admin duyệt/quản lý hoa hồng)
- `pages/api/user/affiliate.js` (API đăng ký/lấy thông tin affiliate)
- `pages/api/admin/affiliates.js` (API admin quản lý affiliate)
- `pages/api/affiliate-lookup.js`
- `lib/affiliateTrack.js` (tracking cookie `?ref=`, gọi backend cũ `go-meta-ads-backend.vercel.app/api/affiliate`)

### File đã sửa (gỡ tham chiếu)
- `components/DashboardLayout.jsx`, `AdminLayout.jsx`, `Navbar.jsx`, `Footer.jsx` — bỏ nav/link tới affiliate
- `lib/planLimits.js` — bỏ feature flag `affiliate` (4 gói) + xóa export `AFFILIATE_COMMISSION`
- `lib/i18n.js` — bỏ `nav.affiliate`, `dashboard.nav.affiliate`, `pages.affiliate` (toàn bộ block), `footer.businessLinks` affiliate entry, `auth.register.referral*` (VI + EN)
- `pages/api/payment/payos-webhook.js` — **bỏ hẳn logic tính & ghi hoa hồng** khi thanh toán thành công (block `if (dbUser.referred_by) {...}` — insert vào `affiliate_conversions`, update `affiliates.pending_earned`); bỏ `referred_by` khỏi SELECT user
- `pages/api/auth.js` — bỏ xử lý `referral_code` khi đăng ký (verify mã, set `referred_by` khi insert user)
- `lib/AuthContext.js` — bỏ tham số `referral_code` khỏi hàm `register()`
- `pages/register.jsx` — bỏ field nhập "Mã giới thiệu", bỏ đọc `?ref=` từ URL
- `pages/_app.jsx` — bỏ tracking `?ref=` (gọi `saveReferralCode`/`trackReferralClick`)
- `pages/api/admin/dashboard-stats.js` — bỏ query `affiliates`/`affiliate_conversions`, bỏ field `stats.affiliates` trong response
- `pages/admin/dashboard.jsx` — bỏ thẻ thống kê "Affiliates" trên dashboard admin
- `pages/admin/tickets.jsx` — bỏ mục menu `web_affiliates` (menu nội bộ không dùng, dọn cho sạch)
- `pages/huong-dan.jsx` — gộp mục "Tab Affiliate & Mua Gói" (id `affiliate`) thành "Tab Mua Gói" (id `mua-goi`), xóa phần nội dung hướng dẫn chương trình Affiliate, giữ lại phần hướng dẫn mua gói

### Dữ liệu DB liên quan — CẦN BẠN XỬ LÝ SAU
Các bảng/cột sau **không còn được code tham chiếu** (đã grep xác nhận), an toàn để xóa trong Supabase khi bạn sẵn sàng:

| Bảng / Cột | Ghi chú |
|---|---|
| `affiliates` (bảng) | Danh sách đối tác affiliate (referral_code, bank info, pending_earned, status...) |
| `affiliate_conversions` (bảng) | Lịch sử hoa hồng từng đơn hàng |
| `users.referred_by` (cột) | Lưu mã giới thiệu người dùng đã dùng khi đăng ký |

⚠️ Trước khi `DROP TABLE`/`DROP COLUMN`, nên kiểm tra lại trong Supabase xem có dữ liệu thật (affiliate đã đăng ký, hoa hồng đã phát sinh) hay chưa, và cân nhắc **export/backup** trước nếu cần lưu trữ cho mục đích kế toán/pháp lý (hoa hồng đã trả trước đây vẫn là giao dịch tài chính đã xảy ra).

---

## 3. Cấu hình Tracking Pixels

### File đã xóa
- `pages/admin/pixels.jsx` (trang UI nhập Facebook Pixel / GTM / GA4 / TikTok Pixel / Google Ads Conversion ID)

### File đã sửa (gỡ tham chiếu)
- `pages/_app.jsx` — bỏ component `PixelInjector` (script tự chèn các mã tracking vào mọi trang khi load), bỏ import `useRef` không còn dùng
- `components/AdminLayout.jsx` — bỏ mục nav "Tracking Pixels" + icon `MousePointerClick`

### Giữ nguyên — KHÔNG xóa
- `pages/api/admin/site-settings.js` — API key-value **dùng chung**, vẫn phục vụ Policy docs (`policy_doc_*`) và AI Knowledge (`ai_knowledge_prompts`). Xóa sẽ phá 2 tính năng đó.

### Dữ liệu DB liên quan
Bảng `site_settings` **không xóa** (dùng chung). Chỉ các **row** với key sau không còn được đọc, an toàn xóa nếu muốn dọn:
- `fb_pixel_id`, `gtm_id`, `ga4_id`, `tiktok_pixel_id`, `google_ads_id`

```sql
DELETE FROM site_settings
WHERE key IN ('fb_pixel_id', 'gtm_id', 'ga4_id', 'tiktok_pixel_id', 'google_ads_id');
```

---

## 4. Hỗ trợ kỹ thuật — bỏ tab "Chat AI" & đính kèm ảnh

### Lý do
- **Chat AI**: gọi backend ngoài `https://go-meta-ads-backend.vercel.app/api/ai-chat` — không thuộc repo này, không rõ còn hoạt động không, và trùng chức năng với AI chat thật (`ReportChatPanel`, `AIChatPanel`) đã tích hợp đúng infra dự án (`/api/ai/report-chat`, `/api/ai/campaign-chat`).
- **Đính kèm ảnh**: theo yêu cầu, bỏ khả năng đính kèm khi gửi ticket mới và khi phản hồi ticket.

### File đã sửa — `pages/dashboard/support.jsx`
- Xóa hẳn `ChatTab` (component, state, fetch tới `API_AI`), xóa tab "Chat AI" khỏi `TABS` và khỏi render
- Xóa `handleImageUpload` + input file + `ImageGrid` (chế độ upload) trong `SubmitTab` (gửi ticket mới) và `LookupTab` (phản hồi ticket)
- Xóa helper `uploadImageBase64()` (không còn nơi nào gọi)
- **Giữ lại** component `ImageGrid` ở chế độ chỉ xem — vẫn hiển thị ảnh đã đính kèm từ các ticket/reply cũ trong DB (`selected.image_urls`, `reply.image_urls`), không xóa dữ liệu lịch sử, chỉ bỏ khả năng đính kèm ảnh MỚI
- Bỏ import không dùng: `Bot`, `MessageCircle`, `useEffect`, `useRef`

### Không đổi
- `pages/api/upload-image.js`, `lib/uploadImage.js` — vẫn giữ nguyên, vì **admin vẫn đính kèm ảnh được khi reply ticket** (`pages/admin/tickets.jsx`), API này dùng chung
- `pages/api/user/tickets.js` — không sửa, vẫn nhận `image_urls` nếu có (giờ frontend đơn giản là không gửi nữa)

### Dữ liệu DB liên quan
Không cần xóa gì — cột `image_urls` trong bảng ticket vẫn giữ nguyên để hiển thị ảnh cũ (nếu có), chỉ đơn giản sẽ luôn rỗng cho ticket/reply mới từ giờ.

---

## Đã kiểm tra
- `npm run build` chạy thành công sau mỗi đợt xóa, không lỗi import gãy, không còn route liên quan trong output build
- Grep toàn repo (`*.js`, `*.jsx`) không còn match `affiliate`/`profit`/`referred_by` nào trong code
