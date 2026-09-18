import { supabase } from '@/lib/supabaseClient'

export async function createBusiness(input: { name: string; category: string; ownerId: string; timezone?: string }) {
  const { data, error } = await supabase
    .from('businesses')
    .insert({ name: input.name, category: input.category, owner_id: input.ownerId, timezone: input.timezone ?? 'Asia/Kolkata' })
    .select('*')
    .single()
  if (error) throw error

  // The owner is also a business_members row so the same task-assignment
  // and RLS model can, later, let an owner assign tasks to themselves.
  await supabase.from('business_members').insert({
    business_id: data.id,
    user_id: input.ownerId,
    role: 'owner',
    full_name: 'Owner',
    active: true,
    invite_used: true
  })

  return data
}

export async function getEmployees(businessId: string) {
  const { data, error } = await supabase
    .from('business_members')
    .select('id, full_name, role, active, invite_used, invite_expires_at, created_at, user_id')
    .eq('business_id', businessId)
    .eq('role', 'employee')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createInvite(businessId: string, fullName: string) {
  const { data, error } = await supabase.rpc('create_employee_invite', {
    p_business_id: businessId,
    p_full_name: fullName
  })
  if (error) throw error
  // rpc returns an array of rows for table-returning functions
  const row = Array.isArray(data) ? data[0] : data
  return row as { member_id: string; invite_token: string }
}

export async function acceptInvite(token: string) {
  const { data, error } = await supabase.rpc('accept_invite', { p_token: token })
  if (error) throw error
  return data as string // business_id
}

export async function getTodaySummary(businessId: string) {
  const { data, error } = await supabase.rpc('get_today_summary', { p_business_id: businessId })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  return row as { total: number; completed: number; pending: number; in_progress: number; overdue: number }
}

export async function getEmployeeCompletion(businessId: string) {
  const { data, error } = await supabase.rpc('get_employee_completion', { p_business_id: businessId })
  if (error) throw error
  return data as { member_id: string; full_name: string; total: number; completed: number; overdue: number }[]
}

export async function generateDueRecurringTasks(businessId: string) {
  const { data, error } = await supabase.rpc('generate_due_recurring_tasks', { p_business_id: businessId })
  if (error) throw error
  return data as number
}

export async function updateTourCompleted(userId: string, field: 'tour_owner_completed' | 'tour_employee_completed') {
  const { error } = await supabase.from('profiles').update({ [field]: true }).eq('id', userId)
  if (error) throw error
}

export async function searchTasksAndEmployees(businessId: string, query: string) {
  const like = `%${query}%`
  const [tasksRes, employeesRes] = await Promise.all([
    supabase.from('tasks').select('id, title, status, due_at').eq('business_id', businessId).ilike('title', like).limit(20),
    supabase.from('business_members').select('id, full_name').eq('business_id', businessId).ilike('full_name', like).limit(20)
  ])
  if (tasksRes.error) throw tasksRes.error
  if (employeesRes.error) throw employeesRes.error
  return { tasks: tasksRes.data, employees: employeesRes.data }
}
