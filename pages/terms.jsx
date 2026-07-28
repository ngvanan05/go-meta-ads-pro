import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useLang } from '../lib/LangContext'

const CONTENT = {
  vi: {
    title: 'Điều khoản sử dụng',
    subtitle: 'Terms of Service',
    updated: 'Ngày cập nhật: 28/07/2026',
    toggleLabel: 'EN',
    sections: [
      {
        icon: '📋',
        heading: '1. Giới thiệu dịch vụ',
        body: 'Go Meta Ads Pro là nền tảng web (SaaS) hỗ trợ quản lý và tối ưu quảng cáo Facebook/Meta, truy cập trực tiếp qua trình duyệt mà không cần cài đặt phần mềm. Dịch vụ được cung cấp bởi GoNetwork và hoạt động theo mô hình đăng ký theo gói (subscription). Bằng cách sử dụng dịch vụ, bạn đồng ý tuân thủ các điều khoản được nêu trong tài liệu này.',
      },
      {
        icon: '🔑',
        heading: '2. Quy định tài khoản và gói dịch vụ',
        body: 'Mỗi tài khoản gắn với một email đăng ký duy nhất. Số lượng thành viên team và tài khoản quảng cáo được phép sử dụng phụ thuộc vào gói bạn đang đăng ký (Personal/Business/Agency). Nghiêm cấm chia sẻ thông tin đăng nhập hoặc bán lại quyền truy cập tài khoản cho bên thứ ba. GoNetwork có quyền tạm khoá hoặc thu hồi tài khoản bất kỳ lúc nào nếu phát hiện vi phạm, mà không hoàn tiền.',
      },
      {
        icon: '💳',
        heading: '3. Thanh toán và chính sách hoàn tiền',
        body: 'Thanh toán được thực hiện qua cổng thanh toán PayOS (hỗ trợ chuyển khoản ngân hàng, QR). Gói dịch vụ được kích hoạt tự động ngay sau khi hệ thống xác nhận thanh toán thành công. Sau khi gói đã được kích hoạt, chúng tôi không hỗ trợ hoàn tiền với bất kỳ lý do nào. Chúng tôi cung cấp gói dùng thử 3 ngày miễn phí để bạn trải nghiệm đầy đủ tính năng trước khi quyết định mua. Vui lòng kiểm tra kỹ trước khi thanh toán.',
      },
      {
        icon: '⚠️',
        heading: '4. Giới hạn trách nhiệm',
        body: 'GoNetwork không chịu trách nhiệm về bất kỳ tổn thất nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ, bao gồm nhưng không giới hạn: mất doanh thu, mất dữ liệu, hoặc các thiệt hại gián tiếp khác. Dịch vụ phụ thuộc vào Meta Graph API do Facebook/Meta cung cấp — chúng tôi không chịu trách nhiệm về gián đoạn hoặc thay đổi chính sách từ phía Meta nằm ngoài tầm kiểm soát của chúng tôi. Dịch vụ được cung cấp "nguyên trạng" (as-is). Chúng tôi có quyền cập nhật, thay đổi hoặc ngừng dịch vụ bất kỳ lúc nào với thông báo trước.',
      },
      {
        icon: '✉️',
        heading: '5. Liên hệ',
        body: 'Nếu bạn có câu hỏi về điều khoản sử dụng, vui lòng liên hệ chúng tôi qua email: admin@gonetwork.vn. Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.',
      },
    ],
  },
  en: {
    title: 'Terms of Service',
    subtitle: 'Điều khoản sử dụng',
    updated: 'Last updated: 28/07/2026',
    toggleLabel: 'VI',
    sections: [
      {
        icon: '📋',
        heading: '1. About the Service',
        body: 'Go Meta Ads Pro is a web-based (SaaS) platform that helps manage and optimize Facebook/Meta advertising campaigns, accessible directly from your browser with no software to install. The service is provided by GoNetwork and operates on a subscription basis. By using the service, you agree to comply with the terms outlined in this document.',
      },
      {
        icon: '🔑',
        heading: '2. Account & Plan Policy',
        body: 'Each account is tied to a unique registered email. The number of team members and ad accounts you may use depends on your subscription plan (Personal/Business/Agency). Sharing login credentials or reselling account access to a third party is strictly prohibited. GoNetwork reserves the right to suspend or revoke an account at any time if a violation is detected, without a refund.',
      },
      {
        icon: '💳',
        heading: '3. Payment & Refund Policy',
        body: 'Payment is processed through the PayOS payment gateway (supporting bank transfer and QR code). Your plan is activated automatically once the system confirms successful payment. Once a plan has been activated, we do not support refunds for any reason. We offer a free 3-day trial so you can fully experience all features before making a purchase decision. Please review carefully before completing payment.',
      },
      {
        icon: '⚠️',
        heading: '4. Limitation of Liability',
        body: 'GoNetwork is not liable for any losses arising from the use or inability to use the service, including but not limited to: loss of revenue, data loss, or other indirect damages. The service depends on the Meta Graph API provided by Facebook/Meta — we are not responsible for outages or policy changes on Meta\'s side that are beyond our control. The service is provided "as-is." We reserve the right to update, modify, or discontinue the service at any time with prior notice.',
      },
      {
        icon: '✉️',
        heading: '5. Contact',
        body: 'If you have questions about these Terms of Service, please contact us at: admin@gonetwork.vn. We will respond within 24 business hours.',
      },
    ],
  },
}

export default function Terms() {
  const { lang } = useLang()
  const isEN = lang === 'en'
  const c = isEN ? CONTENT.en : CONTENT.vi

  return (
    <>
      <Head>
        <title>Go Meta Ads Pro</title>
        <meta name="description" content={isEN
          ? 'Terms of Service for the Go Meta Ads Pro web platform.'
          : 'Điều khoản sử dụng của nền tảng web Go Meta Ads Pro.'
        } />
      </Head>
      <Navbar />

      <main style={{ background: '#000d1a', minHeight: '100vh', paddingTop: 'calc(var(--header-h) + 40px)', paddingBottom: 80 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 16px' }}>

          {/* Page header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h1 style={{ color: '#fff', fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, margin: '0 0 8px' }}>
              {c.title}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, margin: '0 0 16px' }}>
              {c.subtitle}
            </p>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{c.updated}</span>
          </div>

          {/* Sections */}
          {c.sections.map((sec, i) => (
            <div
              key={i}
              style={{
                background: '#fff', borderRadius: 16,
                padding: 'clamp(22px,4vw,36px)',
                marginBottom: 20,
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{ fontSize: 26, flexShrink: 0, marginTop: 2 }}>{sec.icon}</span>
                <div>
                  <h2 style={{ color: '#0c2a72', fontWeight: 800, fontSize: 17, margin: '0 0 10px' }}>
                    {sec.heading}
                  </h2>
                  <p style={{ color: '#334155', fontSize: 15, lineHeight: 1.8, margin: 0 }}>
                    {sec.body}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Back link */}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <a
              href="/"
              style={{
                color: 'rgba(255,255,255,0.5)', fontSize: 14, textDecoration: 'none',
                fontFamily: 'inherit',
              }}
            >
              ← {isEN ? 'Back to homepage' : 'Về trang chủ'}
            </a>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @media (max-width: 480px) {
          main { padding-top: calc(var(--header-h) + 24px) !important; }
        }
      `}</style>
    </>
  )
}
