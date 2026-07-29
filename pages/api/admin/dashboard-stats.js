import { getSupabase } from '../../../lib/supabase'
import { requireAdminAuth } from '../../../lib/auth'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false })

  const sb = getSupabase()

  try {
    // Fetch all stats concurrently
    const [
      { count: usersTotal },
      { count: usersActive },
      { count: usersAgency },
      { count: ticketsTotal },
      { count: ticketsOpen },
      { count: ticketsResolved },
      { count: policyChecks }
    ] = await Promise.all([
      sb.from('users').select('*', { count: 'exact', head: true }),
      sb.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      sb.from('users').select('*', { count: 'exact', head: true }).eq('plan', 'agency'),
      sb.from('support_threads').select('*', { count: 'exact', head: true }),
      sb.from('support_threads').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      sb.from('support_threads').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
      sb.from('policy_check_logs').select('*', { count: 'exact', head: true })
    ])

    // We use a fixed average cost estimate for policy checks for now
    // e.g. 200 tokens per check * $0.0015/1k = $0.0003 per check
    const policyCostEstimate = policyChecks * 0.0003

    // Also fetch recent users and tickets for the dashboard tables
    const { data: recentUsers } = await sb.from('users')
      .select('id, email, name, phone, plan, expire_at, created_at, updated_at, status')
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: recentTickets } = await sb.from('support_threads')
      .select('*, users(email)')
      .order('updated_at', { ascending: false })
      .limit(5)

    res.json({
      ok: true,
      stats: {
        users: {
          total: usersTotal || 0,
          active: usersActive || 0,
          agency: usersAgency || 0
        },
        tickets: {
          total: ticketsTotal || 0,
          open: ticketsOpen || 0,
          resolved: ticketsResolved || 0
        },
        policy: {
          checks: policyChecks || 0,
          estimatedCostUsd: policyCostEstimate
        }
      },
      recent: {
        users: recentUsers || [],
        tickets: recentTickets || []
      }
    })
  } catch (error) {
    console.error('Dashboard Stats Error:', error)
    res.status(500).json({ ok: false, error: error.message })
  }
}

export default requireAdminAuth(handler)
