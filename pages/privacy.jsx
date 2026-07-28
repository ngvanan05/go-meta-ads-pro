import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useLang } from '../lib/LangContext'

const CONTENT = {
  vi: {
    title: 'Chính sách bảo mật',
    subtitle: 'Privacy Policy',
    updated: 'Ngày cập nhật: 28/07/2026',
    sections: [
      {
        icon: '📂',
        heading: '1. Dữ liệu chúng tôi thu thập',
        body: 'Chúng tôi thu thập các thông tin cần thiết để cung cấp dịch vụ, bao gồm: họ và tên, địa chỉ email, số điện thoại (khi bạn đăng ký tài khoản). Khi bạn kết nối tài khoản Facebook, chúng tôi lưu access token (đã mã hoá) và dữ liệu tài khoản quảng cáo (campaign, ngân sách, chỉ số hiệu suất) lấy qua Meta Graph API để hiển thị trên Dashboard. Chúng tôi cũng lưu thông tin đơn hàng, lịch sử thanh toán và nội dung ticket hỗ trợ.',
      },
      {
        icon: '🎯',
        heading: '2. Cách chúng tôi sử dụng dữ liệu',
        body: 'Thông tin bạn cung cấp được sử dụng để: (1) xác thực đăng nhập và duy trì phiên làm việc, (2) đồng bộ và hiển thị dữ liệu quảng cáo Facebook của bạn trên Dashboard, (3) xử lý thanh toán và kích hoạt gói dịch vụ, (4) gửi thông báo/cảnh báo chiến dịch qua email, Telegram hoặc Lark theo cấu hình của bạn, và (5) hỗ trợ kỹ thuật qua hệ thống ticket. Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn với bất kỳ bên thứ ba nào vì mục đích thương mại.',
      },
      {
        icon: '🛡️',
        heading: '3. Lưu trữ và bảo mật dữ liệu',
        body: 'Go Meta Ads Pro là nền tảng web — toàn bộ dữ liệu tài khoản, chiến dịch và cấu hình của bạn được lưu trữ trên máy chủ (Supabase/PostgreSQL) qua kết nối HTTPS mã hoá. Access token Facebook được mã hoá trước khi lưu và chỉ được giải mã khi cần gọi Meta Graph API để lấy dữ liệu cho bạn. Phiên đăng nhập dùng JWT lưu trong cookie bảo mật. Bạn có thể ngắt kết nối tài khoản Facebook bất kỳ lúc nào trong phần Cài đặt.',
      },
      {
        icon: '👤',
        heading: '4. Quyền của người dùng',
        body: 'Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân của mình bất kỳ lúc nào. Để thực hiện, hãy gửi email đến admin@gonetwork.vn với tiêu đề "Yêu cầu dữ liệu cá nhân". Chúng tôi sẽ xử lý yêu cầu trong vòng 5 ngày làm việc.',
      },
      {
        icon: '🍪',
        heading: '5. Cookie và phân tích',
        body: 'Website của chúng tôi sử dụng cookie kỹ thuật cần thiết để duy trì phiên đăng nhập (JWT) và trạng thái ngôn ngữ. Chúng tôi không sử dụng cookie theo dõi quảng cáo của bên thứ ba. Không có công cụ phân tích hành vi người dùng nào được tích hợp mà không có sự đồng ý của bạn.',
      },
      {
        icon: '✉️',
        heading: '6. Liên hệ',
        body: 'Nếu bạn có câu hỏi về chính sách bảo mật hoặc muốn thực hiện quyền của mình, vui lòng liên hệ: admin@gonetwork.vn. Chúng tôi cam kết phản hồi trong vòng 24 giờ làm việc.',
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    subtitle: 'Chính sách bảo mật',
    updated: 'Last updated: 28/07/2026',
    sections: [
      {
        icon: '📂',
        heading: '1. Data We Collect',
        body: 'We collect necessary information to provide our service, including: full name, email address, and phone number (when you register an account). When you connect your Facebook account, we store an encrypted access token and your ad account data (campaigns, budgets, performance metrics) fetched via the Meta Graph API to power your Dashboard. We also store order information, payment history, and support ticket content.',
      },
      {
        icon: '🎯',
        heading: '2. How We Use Your Data',
        body: 'The information you provide is used to: (1) authenticate your login and maintain your session, (2) sync and display your Facebook advertising data on the Dashboard, (3) process payments and activate your plan, (4) send campaign notifications via email, Telegram, or Lark based on your settings, and (5) provide technical support through our ticketing system. We do not sell, rent, or share your personal information with any third party for commercial purposes.',
      },
      {
        icon: '🛡️',
        heading: '3. Data Storage & Security',
        body: 'Go Meta Ads Pro is a web-based platform — all your account, campaign, and configuration data is stored on our servers (Supabase/PostgreSQL) over encrypted HTTPS connections. Your Facebook access token is encrypted at rest and only decrypted when needed to call the Meta Graph API on your behalf. Your login session uses a JWT stored in a secure cookie. You can disconnect your Facebook account at any time from Settings.',
      },
      {
        icon: '👤',
        heading: '4. Your Rights',
        body: 'You have the right to request access, correction, or deletion of your personal information at any time. To do so, send an email to admin@gonetwork.vn with the subject "Personal Data Request." We will process your request within 5 business days.',
      },
      {
        icon: '🍪',
        heading: '5. Cookies & Analytics',
        body: 'Our website uses essential technical cookies to maintain your login session (JWT) and language preference. We do not use third-party advertising tracking cookies. No behavioral analytics tools are integrated without your consent.',
      },
      {
        icon: '✉️',
        heading: '6. Contact',
        body: 'If you have questions about this Privacy Policy or wish to exercise your rights, please contact: admin@gonetwork.vn. We are committed to responding within 24 business hours.',
      },
    ],
  },
}

export default function Privacy() {
  const { lang } = useLang()
  const isEN = lang === 'en'
  const c = isEN ? CONTENT.en : CONTENT.vi

  return (
    <>
      <Head>
        <title>Go Meta Ads Pro</title>
        <meta name="description" content={isEN
          ? 'Privacy Policy for the Go Meta Ads Pro web platform.'
          : 'Chính sách bảo mật của nền tảng web Go Meta Ads Pro.'
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
