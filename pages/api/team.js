import { getUserFromReq, hashPassword } from '../../lib/auth'
import { getSupabase } from '../../lib/supabase'
import { isPlanAllowed, getMaxTeamMembers } from '../../lib/planLimits'
import { logAudit } from '../../lib/auditLog'

export default async function handler(req, res) {
  const user = getUserFromReq(req)
  if (!user) return res.status(401).json({ error: 'Chưa đăng nhập' })

  const sb = getSupabase()

  const { data: dbUser } = await sb.from('users').select('plan').eq('id', user.id).single()
  if (!dbUser) return res.status(401).json({ error: 'Không tìm thấy tài khoản' })
  if (!isPlanAllowed(dbUser.plan, 'team')) {
    return res.status(403).json({ error: 'Tính năng này không hỗ trợ cho gói của bạn' })
  }

  if (req.method === 'GET') {
    const { data: members } = await sb.from('team_members')
      .select('id, role, created_at, member:user_id(id, name, email, created_by)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    const list = (members || []).map(m => ({
      id: m.id,
      role: m.role,
      name: m.member?.name,
      email: m.member?.email,
      joined: m.created_at,
      managed: m.member?.created_by === user.id
    }))
    return res.json({ ok: true, members: list })
  }

  if (req.method === 'POST') {
    const { action, email, role, member_id } = req.body || {}

    if (action === 'add') {
      const { name, password } = req.body
      if (!email || !password) return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' })
      if (password.length < 6) return res.status(400).json({ error: 'Mật khẩu tối thiểu 6 ký tự' })
      const emailLower = email.toLowerCase().trim()

      const { count } = await sb.from('team_members').select('*', { count: 'exact', head: true }).eq('owner_id', user.id)
      const maxMembers = getMaxTeamMembers(dbUser.plan)
      if (count >= maxMembers) {
        return res.status(403).json({ error: `Gói của bạn chỉ cho phép tối đa ${maxMembers} nhân viên` })
      }

      const { data: existingUser } = await sb.from('users').select('id').eq('email', emailLower).single()
      if (existingUser) return res.status(409).json({ error: 'Email này đã tồn tại trong hệ thống' })

      const password_hash = await hashPassword(password)
      const { data: newUser, error: createErr } = await sb.from('users').insert({
        email: emailLower, password_hash, name: name || '', plan: dbUser.plan, status: 'active', created_by: user.id
      }).select('id, email, name').single()
      if (createErr) return res.status(500).json({ error: createErr.message })

      const { error: insErr } = await sb.from('team_members').insert({
        owner_id: user.id, user_id: newUser.id, email: newUser.email, name: newUser.name, role: role || 'viewer'
      })
      if (insErr) return res.status(500).json({ error: insErr.message })

      await logAudit({ req, actorType: 'user', actorId: user.id, actorEmail: user.email, action: 'team_member_add', target: emailLower, meta: { role: role || 'viewer' } })
      return res.json({ ok: true, message: `Đã tạo tài khoản cho ${emailLower}`, credentials: { email: emailLower, password } })
    }

    if (action === 'remove') {
      if (!member_id) return res.status(400).json({ error: 'Thiếu member_id' })
      const { data: member } = await sb.from('team_members').select('user_id').eq('id', member_id).eq('owner_id', user.id).single()
      await sb.from('team_members').delete().eq('id', member_id).eq('owner_id', user.id)

      // Chỉ xoá cứng tài khoản nếu đúng chủ tài khoản đang xoá là người đã tạo ra nó
      // (không đụng tới tài khoản độc lập của người khác được thêm theo kiểu link cũ)
      if (member?.user_id) {
        const { data: memberUser } = await sb.from('users').select('created_by').eq('id', member.user_id).single()
        if (memberUser?.created_by === user.id) {
          try { await sb.from('users').delete().eq('id', member.user_id) } catch {}
        }
      }

      await logAudit({ req, actorType: 'user', actorId: user.id, actorEmail: user.email, action: 'team_member_remove', target: member_id })
      return res.json({ ok: true })
    }

    if (action === 'reset_password') {
      const { new_password } = req.body
      if (!member_id || !new_password) return res.status(400).json({ error: 'Thiếu thông tin' })
      if (new_password.length < 6) return res.status(400).json({ error: 'Mật khẩu tối thiểu 6 ký tự' })

      const { data: member } = await sb.from('team_members').select('user_id, email').eq('id', member_id).eq('owner_id', user.id).single()
      if (!member) return res.status(404).json({ error: 'Không tìm thấy thành viên' })

      // Chỉ cho đặt lại mật khẩu nếu đúng là tài khoản do chủ tài khoản này tạo ra
      const { data: memberUser } = await sb.from('users').select('created_by').eq('id', member.user_id).single()
      if (memberUser?.created_by !== user.id) {
        return res.status(403).json({ error: 'Chỉ có thể đặt lại mật khẩu cho tài khoản do bạn tạo' })
      }

      const password_hash = await hashPassword(new_password)
      const { error: updErr } = await sb.from('users').update({ password_hash }).eq('id', member.user_id)
      if (updErr) return res.status(500).json({ error: updErr.message })

      await logAudit({ req, actorType: 'user', actorId: user.id, actorEmail: user.email, action: 'team_member_reset_password', target: member.email })
      return res.json({ ok: true, credentials: { email: member.email, password: new_password } })
    }

    if (action === 'update_role') {
      const { new_role } = req.body
      if (!member_id || !new_role) return res.status(400).json({ error: 'Thiếu member_id hoặc new_role' })
      await sb.from('team_members').update({ role: new_role }).eq('id', member_id).eq('owner_id', user.id)
      await logAudit({ req, actorType: 'user', actorId: user.id, actorEmail: user.email, action: 'team_role_change', target: member_id, meta: { new_role } })
      return res.json({ ok: true })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
