import { supabase } from '@/lib/supabaseClient'
import type { RecurrenceType, TaskPriority } from '@/types/database'

export async function listRecurringTasks(businessId: string) {
  const { data, error } = await supabase
    .from('recurring_tasks')
    .select('id, title, description, assigned_to, priority, recurrence_type, due_time, start_date, end_date, active, business_members!recurring_tasks_assigned_to_fkey(full_name)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createRecurringTask(input: {
  businessId: string
  title: string
  description?: string
  assignedTo: string
  createdBy: string
  priority: TaskPriority
  recurrenceType: RecurrenceType
  dueTime: string
  startDate: string
  endDate?: string
}) {
  const { error } = await supabase.from('recurring_tasks').insert({
    business_id: input.businessId,
    title: input.title,
    description: input.description || null,
    assigned_to: input.assignedTo,
    created_by: input.createdBy,
    priority: input.priority,
    recurrence_type: input.recurrenceType,
    due_time: input.dueTime,
    start_date: input.startDate,
    end_date: input.endDate || null
  })
  if (error) throw error
}

export async function toggleRecurringTask(id: string, active: boolean) {
  const { error } = await supabase.from('recurring_tasks').update({ active }).eq('id', id)
  if (error) throw error
}

export async function deleteRecurringTask(id: string) {
  const { error } = await supabase.from('recurring_tasks').delete().eq('id', id)
  if (error) throw error
}
