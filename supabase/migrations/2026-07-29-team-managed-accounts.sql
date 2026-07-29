-- Chủ tài khoản tạo trực tiếp tài khoản nhân viên (thay vì link tài khoản độc lập có sẵn qua email).
-- created_by ghi lại tài khoản nào đã tạo ra tài khoản này — dùng để quyết định có được xoá cứng
-- users row khi gỡ khỏi team hay không (chỉ xoá cứng nếu đúng người tạo ra nó đang xoá).
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id);
