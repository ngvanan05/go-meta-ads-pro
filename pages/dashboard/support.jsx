import { useState } from 'react'
import useSWR from 'swr'
import DashboardLayout from '../../components/DashboardLayout'
import { fetcher } from '../../lib/fetcher'
import { Ticket, Send, ShieldCheck, CheckCircle, Image, ClipboardList, Search, X } from 'lucide-react'

const STATUS_MAP = {
  open:        { label: 'Chờ xử lý',     bg: 'rgba(59,130,246,.15)',  color: 'var(--blue)' },
  in_progress: { label: 'Đang xử lý',    bg: 'rgba(251,191,36,.15)',  color: 'var(--ylw)' },
  resolved:    { label: 'Đã giải quyết', bg: 'rgba(16,185,129,.15)',  color: 'var(--grn)' },
  closed:      { label: 'Đã đóng',       bg: 'rgba(100,116,139,.15)', color: 'var(--mut)' },
}
const PRIORITY_MAP = {
  low:    { label: 'Thấp',       color: 'var(--mut)' },
  normal: { label: 'Bình thường', color: 'var(--txt)' },
  high:   { label: 'Cao',        color: 'var(--ylw)' },
  urgent: { label: 'Khẩn cấp',  color: 'var(--red)' },
}
const ISSUE_TYPES = ['Lỗi phần mềm', 'Hỏi về tính năng', 'Thanh toán / Gói dịch vụ', 'Yêu cầu tính năng mới', 'Khác']

const inpStyle = (extra = {}) => ({
  width: '100%', background: 'var(--s2)', border: '1.5px solid var(--bd)', borderRadius: 9,
  padding: '10px 13px', fontSize: 14, color: 'var(--txt)', outline: 'none', fontFamily: 'inherit',
  ...extra,
})

/* ─── ImageGrid — hiển thị ảnh đã đính kèm từ trước (ticket cũ) ─────────────── */
function ImageGrid({ urls, onRemove }) {
  const [fullImg, setFullImg] = useState(null)
  if (!urls?.length) return null
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        {urls.map((u, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <img
              src={u.thumbnail || u.url || u}
              alt=""
              onClick={() => setFullImg(u.url || u)}
              style={{ width: 76, height: 76, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--bd)', cursor: 'pointer' }}
            />
            {onRemove && (
              <button
                onClick={() => onRemove(i)}
                aria-label="Xóa ảnh"
                style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, background: 'var(--red)', border: 'none', borderRadius: '50%', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1 }}
              ><X size={10} /></button>
            )}
          </div>
        ))}
      </div>
      {fullImg && (
        <div onClick={() => setFullImg(null)} role="dialog" aria-modal="true" aria-label="Xem ảnh phóng to" style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          <img src={fullImg} alt="Ảnh phóng to" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8 }} />
        </div>
      )}
    </>
  )
}

/* ─── FieldLabel ───────────────────────────────────────────────────────────── */
const FieldLabel = ({ children }) => (
  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--mut)', marginBottom: 6 }}>
    {children}
  </label>
)

/* ─── TAB 1: GỬI TICKET ───────────────────────────────────────────────────── */
function SubmitTab({ onCreated }) {
  const [form, setForm] = useState({ subject: '', message: '', priority: 'normal', issue_type: 'Lỗi phần mềm' })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  async function handleSubmit() {
    if (!form.subject.trim()) return setResult({ ok: false, error: 'Vui lòng nhập tiêu đề' })
    if (!form.message.trim()) return setResult({ ok: false, error: 'Vui lòng nhập nội dung mô tả' })
    setSubmitting(true)
    setResult(null)
    try {
      const r = await fetch('/api/user/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...form }),
      })
      const d = await r.json()
      if (d.ok) {
        setResult({ ok: true, ticket: d.ticket })
        setForm({ subject: '', message: '', priority: 'normal', issue_type: 'Lỗi phần mềm' })
        onCreated?.()
      } else {
        setResult({ ok: false, error: d.error || 'Gửi thất bại' })
      }
    } catch { setResult({ ok: false, error: 'Lỗi kết nối' }) }
    finally { setSubmitting(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <FieldLabel>Tiêu đề *</FieldLabel>
        <input style={inpStyle()} placeholder="Mô tả ngắn vấn đề bạn gặp phải..." value={form.subject} onChange={set('subject')} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <FieldLabel>Loại vấn đề</FieldLabel>
        <select style={inpStyle({ appearance: 'auto', cursor: 'pointer' })} value={form.issue_type} onChange={set('issue_type')}>
          {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <FieldLabel>Mức độ ưu tiên</FieldLabel>
        <select style={inpStyle({ appearance: 'auto', cursor: 'pointer' })} value={form.priority} onChange={set('priority')}>
          <option value="low">Thấp — không cần gấp</option>
          <option value="normal">Bình thường</option>
          <option value="high">Cao — cần xử lý sớm</option>
          <option value="urgent">Khẩn cấp — ảnh hưởng nghiêm trọng</option>
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <FieldLabel>Mô tả chi tiết *</FieldLabel>
        <textarea
          style={inpStyle({ minHeight: 120, resize: 'vertical' })}
          placeholder="Mô tả chi tiết vấn đề: điều gì đã xảy ra, các bước tái hiện lỗi, kết quả mong đợi..."
          value={form.message}
          onChange={set('message')}
        />
      </div>
      {result && !result.ok && (
        <div style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 9, padding: '12px 16px', color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>
          {result.error}
        </div>
      )}
      {result?.ok && (
        <div style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)', borderRadius: 9, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: 'var(--grn)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={16} /> Ticket đã gửi thành công!</div>
          <div style={{ fontSize: 13, color: 'var(--txt)' }}>
            Mã ticket: <span style={{ fontFamily: 'monospace', fontWeight: 800, letterSpacing: 1 }}>{(result.ticket?.id || '').slice(0, 8).toUpperCase()}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--mut)', marginTop: 4 }}>Chúng tôi sẽ phản hồi qua email và trong tab "Phiếu hỗ trợ" trong 2-4 giờ.</div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{ width: '100%', padding: 14, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? .6 : 1, fontFamily: 'inherit' }}
      >
        {submitting ? 'Đang gửi...' : <><Send size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Gửi yêu cầu hỗ trợ</>}
      </button>
    </div>
  )
}

/* ─── TAB 2: PHIẾU HỖ TRỢ ────────────────────────────────────────────────── */
function LookupTab({ refresh }) {
  const [tickets, setTickets] = useState([])
  const [selected, setSelected] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const ticketsKey = `/api/user/tickets?r=${refresh}`
  const { isValidating, mutate: refreshTickets } = useSWR(ticketsKey, () => fetcher('/api/user/tickets'), {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
    onSuccess: (d) => {
      if (d.ok) setTickets(d.tickets)
    },
  })
  const loading = isValidating && tickets.length === 0

  async function handleReply() {
    if (!replyText.trim()) return
    setSending(true)
    try {
      const r = await fetch('/api/user/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          ticket_id: selected.id,
          message: replyText,
        }),
      })
      const d = await r.json()
      if (!d.ok) return showToast(d.error || 'Lỗi', 'error')
      setReplyText('')
      showToast('Đã gửi phản hồi')
      const updated = await refreshTickets()
      if (updated?.ok) {
        const t = (updated.tickets || []).find(x => x.id === selected.id)
        if (t) setSelected(t)
      }
    } catch { showToast('Lỗi kết nối', 'error') }
    finally { setSending(false) }
  }

  // ── Detail view ──
  if (selected) {
    const canReply = selected.status !== 'closed' && selected.status !== 'resolved'
    return (
      <div>
        {toast && (
          <div role="status" aria-live="polite" style={{ marginBottom: 12, padding: '10px 14px', background: toast.type === 'error' ? 'rgba(239,68,68,.15)' : 'rgba(16,185,129,.15)', border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,.3)' : 'rgba(16,185,129,.3)'}`, borderRadius: 8, color: toast.type === 'error' ? 'var(--red)' : 'var(--grn)', fontSize: 13 }}>
            {toast.msg}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={() => setSelected(null)} style={{ background: 'none', border: '1px solid var(--bd)', color: 'var(--mut)', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            ← Quay lại
          </button>
          <span style={{ background: STATUS_MAP[selected.status]?.bg, color: STATUS_MAP[selected.status]?.color, borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
            {STATUS_MAP[selected.status]?.label || selected.status}
          </span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--txt)', marginBottom: 4 }}>{selected.subject}</div>
        <div style={{ fontSize: 12, color: 'var(--mut)', marginBottom: 20 }}>
          Gửi lúc {new Date(selected.created_at).toLocaleString('vi-VN')}
          {' · '}Ưu tiên: <span style={{ color: PRIORITY_MAP[selected.priority]?.color, fontWeight: 600 }}>{PRIORITY_MAP[selected.priority]?.label}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {/* Tin nhắn gốc */}
          <div style={{ background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 12, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>Bạn</div>
            <div style={{ fontSize: 14, color: 'var(--txt)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{selected.message}</div>
            {selected.image_urls?.length > 0 && (
              <ImageGrid urls={selected.image_urls} />
            )}
            <div style={{ fontSize: 11, color: 'var(--mut)', marginTop: 6 }}>{new Date(selected.created_at).toLocaleString('vi-VN')}</div>
          </div>

          {/* Replies */}
          {(selected.replies || []).map((reply, i) => (
            <div key={i} style={{
              background: reply.from === 'admin' ? 'rgba(99,102,241,.07)' : 'var(--s2)',
              border: `1px solid ${reply.from === 'admin' ? 'rgba(99,102,241,.2)' : 'var(--bd)'}`,
              borderRadius: 12, padding: '12px 16px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6, color: reply.from === 'admin' ? 'var(--blue)' : 'var(--mut)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {reply.from === 'admin' ? <><ShieldCheck size={13} /> Hỗ trợ Go Meta Ads</> : 'Bạn'}
              </div>
              {reply.message && <div style={{ fontSize: 14, color: 'var(--txt)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{reply.message}</div>}
              {reply.image_urls?.length > 0 && (
                <ImageGrid urls={reply.image_urls} />
              )}
              <div style={{ fontSize: 11, color: 'var(--mut)', marginTop: 6 }}>{new Date(reply.created_at).toLocaleString('vi-VN')}</div>
            </div>
          ))}
        </div>

        {!canReply && (
          <div style={{ padding: '12px 16px', borderRadius: 9, background: 'var(--s2)', border: '1px solid var(--bd)', color: 'var(--mut)', fontSize: 13, textAlign: 'center' }}>
            Ticket {selected.status === 'closed' ? 'đã đóng' : 'đã giải quyết'} — không thể gửi thêm phản hồi
          </div>
        )}

        {canReply && (
          <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 16 }}>
            <FieldLabel>Phản hồi thêm</FieldLabel>
            <textarea
              style={inpStyle({ minHeight: 80, resize: 'vertical' })}
              placeholder="Nhập phản hồi thêm..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
            />
            <button
              onClick={handleReply}
              disabled={sending || !replyText.trim()}
              style={{ marginTop: 10, padding: '9px 20px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: sending ? .5 : 1, fontFamily: 'inherit' }}
            >
              {sending ? 'Đang gửi...' : <><Send size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Gửi phản hồi</>}
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── List view ──
  if (loading) return <div style={{ textAlign: 'center', padding: 48, color: 'var(--mut)', fontSize: 14 }}>Đang tải...</div>

  if (tickets.length === 0) return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--mut)', background: 'var(--s2)', borderRadius: 12, border: '1px dashed var(--bd)' }}>
      <div style={{ marginBottom: 12, color: 'var(--mut)' }}><Ticket size={40} /></div>
      <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--txt)' }}>Chưa có ticket nào</div>
      <div style={{ fontSize: 13 }}>Gửi ticket ở tab "Gửi ticket" khi bạn cần hỗ trợ kỹ thuật</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {tickets.map(t => (
        <div
          key={t.id}
          onClick={() => setSelected(t)}
          style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer', transition: 'border-color .15s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bd)'}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</div>
            <div style={{ fontSize: 12, color: 'var(--mut)' }}>
              {new Date(t.created_at).toLocaleDateString('vi-VN')}
              {t.image_urls?.length > 0 && <> · <Image size={11} style={{ verticalAlign: 'middle' }} /> {t.image_urls.length} ảnh</>}
              {t.replies?.length > 0 && ` · ${t.replies.length} phản hồi`}
              {t.replies?.some(r => r.from === 'admin') && <span style={{ color: 'var(--grn)', display: 'inline-flex', alignItems: 'center', gap: 3 }}> · <CheckCircle size={11} /> Có phản hồi</span>}
            </div>
          </div>
          <span style={{ background: STATUS_MAP[t.status]?.bg, color: STATUS_MAP[t.status]?.color, borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {STATUS_MAP[t.status]?.label || t.status}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── MAIN PAGE ───────────────────────────────────────────────────────────── */
export default function Support() {
  const [tab, setTab] = useState('submit')
  const [refreshSignal, setRefreshSignal] = useState(0)

  const TABS = [
    { id: 'submit', icon: ClipboardList, label: 'Gửi ticket' },
    { id: 'lookup', icon: Search, label: 'Phiếu hỗ trợ' },
  ]

  function handleCreated() {
    setRefreshSignal(s => s + 1)
    setTimeout(() => setTab('lookup'), 1600)
  }

  return (
    <DashboardLayout title="Hỗ trợ kỹ thuật">
      <div className="support-page" style={{ padding: 24, maxWidth: 760, margin: '0 auto' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--txt)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><Ticket size={20} /> Hỗ trợ kỹ thuật</h1>
        <p style={{ fontSize: 13, color: 'var(--mut)', marginBottom: 24 }}>Gửi yêu cầu hỗ trợ — chúng tôi phản hồi trong vòng 2-4 giờ</p>

        <div style={{ display: 'flex', borderBottom: '1.5px solid var(--bd)', marginBottom: 24 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="support-tab"
              style={{
                padding: '10px 20px', border: 'none', fontFamily: 'inherit', background: 'transparent',
                borderBottom: tab === t.id ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                fontWeight: tab === t.id ? 700 : 500, fontSize: 13,
                color: tab === t.id ? 'var(--primary)' : 'var(--mut)',
                cursor: 'pointer', transition: 'all .15s',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>

        {tab === 'submit' && <SubmitTab onCreated={handleCreated} />}
        {tab === 'lookup' && <LookupTab refresh={refreshSignal} />}
      </div>
      <style jsx>{`
        /* Focus indicators */
        .support-tab:focus-visible,
        :global(.support-page input:focus-visible),
        :global(.support-page textarea:focus-visible),
        :global(.support-page select:focus-visible),
        :global(.support-page button:focus-visible) {
          outline: 2px solid var(--blue);
          outline-offset: 2px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .support-page { padding: 16px !important; }
          .support-page h1 { font-size: 16px !important; }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          :global(.support-page *) {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </DashboardLayout>
  )
}
