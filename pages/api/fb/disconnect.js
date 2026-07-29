import { getUserFromReq } from '../../../lib/auth'
import { getSupabase } from '../../../lib/supabase'
import { getEffectiveContext, hasPermission } from '../../../lib/teamAccess'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const user = getUserFromReq(req)
  if (!user) return res.status(401).json({ error: 'Chưa đăng nhập' })

  const sb = getSupabase()
  const ctx = await getEffectiveContext(user.id, sb)

  if (!hasPermission(ctx, 'manage_fb')) {
    return res.status(403).json({ error: 'Bạn không có quyền ngắt kết nối Facebook' })
  }

  await sb.from('fb_connections').delete().eq('user_id', ctx.ownerId)
  await sb.from('fb_ad_accounts').delete().eq('user_id', ctx.ownerId)
  await sb.from('users').update({ facebook_id: null }).eq('id', ctx.ownerId)

  return res.json({ ok: true })
}
