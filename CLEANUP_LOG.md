# Cleanup Log — Xóa chức năng Affiliate & Kiểm soát Lãi/Lỗ

Ngày: 2026-07-27
Lý do: Tinh gọn sản phẩm để chuẩn bị báo cáo. Xác nhận trước khi xóa: không có affiliate/hoa hồng nào đang chờ duyệt trong hệ thống.
Trạng thái: Đã xóa ở code, **chưa commit/push** — chờ xác nhận.

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

## Đã kiểm tra
- `npm run build` chạy thành công, không lỗi import gãy, không còn route `/affiliate`, `/dashboard/profit`, `/dashboard/affiliate`, `/admin/affiliates` trong output build
- Grep toàn repo (`*.js`, `*.jsx`) không còn match `affiliate`/`profit`/`referred_by` nào trong code
