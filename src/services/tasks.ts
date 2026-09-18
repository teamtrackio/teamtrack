import { supabase } from '@/lib/supabaseClient'
import type { TaskPriority } from '@/types/database'

// All queries here are deliberately narrow: they select only the columns a
// screen actually renders, filter by date/status server-side, and paginate
// history instead of ever pulling a business's full task table into the
// browser. This is the core of staying inside the Supabase free-tier egress
// budget under normal use.

const DASHBOARD_COLUMNS =
  'id, title, status, priority, due_at, started_at, completed_at, assigned_to, business_members!tasks_assigned_to_fkey(full_name)'

export async function getTodayTasksForBusiness(businessId: string) {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('tasks')
    .select(DASHBOARD_COLUMNS)
    .eq('business_id', businessId)
    .gte('created_at', startOfDay.toISOString())
    .order('due_at', { ascending: true })
    .limit(200) // hard ceiling even for a busy day; well above realistic team sizes

  if (error) throw error
  return data
}

export async function getOverdueTasksForBusiness(businessId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select(DASHBOARD_COLUMNS)
    .eq('business_id', businessId)
    .neq('status', 'completed')
    .lt('due_at', new Date().toISOString())
    .order('due_at', { ascending: true })
    .limit(100)

  if (error) throw error
  return data
}

export async function getMyTasksToday(memberId: string) {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, description, status, priority, due_at, started_at, completed_at')
    .eq('assigned_to', memberId)
    .gte('created_at', startOfDay.toISOString())
    .order('due_at', { ascending: true })
    .limit(100)

  if (error) throw error
  return data
}

export async function getTaskHistory(params: {
  businessId: string
  memberId?: string
  status?: string
  priority?: string
  page: number
  pageSize?: number
}) {
  const pageSize = params.pageSize ?? 25
  const from = params.page * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('tasks')
    .select('id, title, status, priority, due_at, completed_at, assigned_to, business_members!tasks_assigned_to_fkey(full_name)', {
      count: 'exact'
    })
    .eq('business_id', params.businessId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (params.memberId) query = query.eq('assigned_to', params.memberId)
  if (params.status) query = query.eq('status', params.status)
  if (params.priority) query = query.eq('priority', params.priority)

  const { data, error, count } = await query
  if (error) throw error
  return { data, count: count ?? 0 }
}

export async function createTask(input: {
  businessId: string
  title: string
  description?: string
  assignedTo: string
  createdBy: string
  dueAt: string
  priority: TaskPriority
}) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      business_id: input.businessId,
      title: input.title,
      description: input.description || null,
      assigned_to: input.assignedTo,
      created_by: input.createdBy,
      due_at: input.dueAt,
      priority: input.priority
    })
    .select('id')
    .single()

  if (error) throw error

  await supabase.from('task_activity').insert({
    task_id: data.id,
    business_id: input.businessId,
    user_id: input.createdBy,
    action: 'task_created'
  })

  return data
}

export async function startTask(taskId: string, businessId: string, userId: string) {
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'in_progress', started_at: new Date().toISOString() })
    .eq('id', taskId)
  if (error) throw error

  await supabase.from('task_activity').insert({
    task_id: taskId,
    business_id: businessId,
    user_id: userId,
    action: 'task_started'
  })
}

export async function completeTask(taskId: string, businessId: string, userId: string, note?: string) {
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', taskId)
  if (error) throw error

  await supabase.from('task_activity').insert({
    task_id: taskId,
    business_id: businessId,
    user_id: userId,
    action: 'task_completed',
    note: note || null
  })
}

export async function getTaskActivity(taskId: string, limit = 20) {
  const { data, error } = await supabase
    .from('task_activity')
    .select('id, action, note, created_at, user_id')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

// Client-side "is this overdue" check mirrors the DB rule (current time >
// due time AND status != completed) so the UI updates instantly between
// polls without waiting on a round trip.
export function isOverdue(task: { status: string; due_at: string }) {
  return task.status !== 'completed' && new Date(task.due_at).getTime() < Date.now()
}

export function completedLate(task: { due_at: string; completed_at: string | null }) {
  if (!task.completed_at) return false
  return new Date(task.completed_at).getTime() > new Date(task.due_at).getTime()
}
