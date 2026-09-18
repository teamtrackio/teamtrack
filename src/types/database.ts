export type UserRole = 'owner' | 'employee'
export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'normal' | 'high'
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  tour_owner_completed: boolean
  tour_employee_completed: boolean
  created_at: string
}

export interface Business {
  id: string
  name: string
  category: string | null
  owner_id: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface BusinessMember {
  id: string
  business_id: string
  user_id: string | null
  role: UserRole
  active: boolean
  full_name: string
  invite_token: string | null
  invite_expires_at: string | null
  invite_used: boolean
  created_at: string
}

export interface RecurringTask {
  id: string
  business_id: string
  title: string
  description: string | null
  assigned_to: string
  created_by: string
  priority: TaskPriority
  recurrence_type: RecurrenceType
  due_time: string // HH:MM in business timezone
  start_date: string
  end_date: string | null
  last_generated_date: string | null
  active: boolean
  created_at: string
}

export interface Task {
  id: string
  business_id: string
  title: string
  description: string | null
  assigned_to: string
  created_by: string
  status: TaskStatus
  priority: TaskPriority
  due_at: string
  created_at: string
  started_at: string | null
  completed_at: string | null
  recurring_task_id: string | null
  updated_at: string
}

export interface TaskActivity {
  id: string
  task_id: string
  business_id: string
  user_id: string | null
  action: string
  note: string | null
  created_at: string
}

// Minimal typed subset (hand-written, not auto-generated) covering the
// tables and functions this app touches. supabase-js's generic client type
// expects Tables/Views/Functions/Enums keys to be present (even if empty)
// under each schema in order to correctly infer row types instead of
// falling back to `never` — hence the empty Views/Enums and the Functions
// map below for the Postgres functions called via .rpc().
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; email: string }; Update: Partial<Profile> }
      businesses: { Row: Business; Insert: Partial<Business> & { name: string; owner_id: string }; Update: Partial<Business> }
      business_members: { Row: BusinessMember; Insert: Partial<BusinessMember> & { business_id: string; role: UserRole; full_name: string }; Update: Partial<BusinessMember> }
      tasks: { Row: Task; Insert: Partial<Task> & { business_id: string; title: string; assigned_to: string; created_by: string; due_at: string }; Update: Partial<Task> }
      task_activity: { Row: TaskActivity; Insert: Partial<TaskActivity> & { task_id: string; business_id: string; action: string }; Update: Partial<TaskActivity> }
      recurring_tasks: { Row: RecurringTask; Insert: Partial<RecurringTask> & { business_id: string; title: string; assigned_to: string; created_by: string; recurrence_type: RecurrenceType; due_time: string; start_date: string }; Update: Partial<RecurringTask> }
    }
    Views: Record<string, never>
    Functions: {
      create_employee_invite: {
        Args: { p_business_id: string; p_full_name: string }
        Returns: { member_id: string; invite_token: string }[]
      }
      accept_invite: {
        Args: { p_token: string }
        Returns: string
      }
      generate_due_recurring_tasks: {
        Args: { p_business_id: string }
        Returns: number
      }
      get_today_summary: {
        Args: { p_business_id: string }
        Returns: { total: number; completed: number; pending: number; in_progress: number; overdue: number }[]
      }
      get_employee_completion: {
        Args: { p_business_id: string }
        Returns: { member_id: string; full_name: string; total: number; completed: number; overdue: number }[]
      }
    }
    Enums: Record<string, never>
  }
}
