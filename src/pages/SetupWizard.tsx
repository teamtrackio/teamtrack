import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { createBusiness, createInvite } from '@/services/business'
import { createTask } from '@/services/tasks'
import { ErrorBanner } from '@/components/StatusBits'
import { APP_CONFIG } from '@/config'

const CATEGORIES = ['Real Estate', 'Sales', 'Marketing Agency', 'Retail', 'Restaurant', 'Salon', 'Gym', 'Contractor', 'Service Business', 'Other']

export default function SetupWizard() {
  const { user, refresh } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [businessName, setBusinessName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [businessId, setBusinessId] = useState<string | null>(null)

  const [employeeName, setEmployeeName] = useState('')
  const [employeeMemberId, setEmployeeMemberId] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)

  const [taskTitle, setTaskTitle] = useState('')
  const [taskDueTime, setTaskDueTime] = useState('18:00')

  async function handleCreateBusiness() {
    if (!user || !businessName.trim()) return
    setLoading(true)
    setError(null)
    try {
      const biz = await createBusiness({ name: businessName.trim(), category, ownerId: user.id })
      setBusinessId(biz.id)
      setStep(3)
    } catch {
      setError('Couldn\u2019t create your business. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddEmployee() {
    if (!businessId || !employeeName.trim()) {
      setStep(4)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const invite = await createInvite(businessId, employeeName.trim())
      setEmployeeMemberId(invite.member_id)
      setInviteLink(`${window.location.origin}/join/${invite.invite_token}`)
      setStep(4)
    } catch {
      setError('Couldn\u2019t add employee. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateTask() {
    if (!businessId || !user) return
    if (!taskTitle.trim() || !employeeMemberId) {
      await finishSetup()
      return
    }
    setLoading(true)
    setError(null)
    try {
      const today = new Date()
      const [h, m] = taskDueTime.split(':').map(Number)
      today.setHours(h, m, 0, 0)
      await createTask({
        businessId,
        title: taskTitle.trim(),
        assignedTo: employeeMemberId,
        createdBy: user.id,
        dueAt: today.toISOString(),
        priority: 'normal'
      })
      await finishSetup()
    } catch {
      setError('Couldn\u2019t create the task. You can add it later from the Tasks page.')
      await finishSetup()
    } finally {
      setLoading(false)
    }
  }

  async function finishSetup() {
    await refresh()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="flex gap-1 mb-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-brand-500' : 'bg-gray-200'}`} />
          ))}
        </div>
        <ErrorBanner message={error} />

        {step === 0 && (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Welcome to {APP_CONFIG.productName} 👋</h1>
            <p className="text-gray-500 mb-8">Let\u2019s set up your business in a couple of minutes.</p>
            <button className="btn-primary w-full" onClick={() => setStep(1)}>
              Get started
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">What\u2019s your business called?</h2>
            <input className="input mb-4" placeholder="e.g. Sharma Real Estate" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            <button className="btn-primary w-full" disabled={!businessName.trim()} onClick={() => setStep(2)}>
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">What kind of business is it?</h2>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-2 rounded-xl text-sm border ${category === c ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <button className="btn-primary w-full" disabled={loading} onClick={handleCreateBusiness}>
              {loading ? 'Creating…' : 'Next'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Add your first employee</h2>
            <p className="text-gray-500 text-sm mb-4">You can add more later. Each employee gets a secure invite link.</p>
            <input className="input mb-4" placeholder="Employee name" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} />
            {inviteLink && (
              <div className="bg-brand-50 text-sm rounded-xl p-3 mb-4 break-all">
                Share this link with them: <span className="font-medium">{inviteLink}</span>
              </div>
            )}
            <div className="flex gap-2">
              <button className="btn-secondary flex-1" onClick={() => setStep(4)}>
                Skip for now
              </button>
              <button className="btn-primary flex-1" disabled={loading} onClick={handleAddEmployee}>
                {loading ? 'Adding…' : 'Add employee'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Create your first task</h2>
            <p className="text-gray-500 text-sm mb-4">Assign it to {employeeName || 'your employee'} and set a deadline for today.</p>
            <input className="input mb-3" placeholder="e.g. Call pending leads" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
            <label className="label">Due time today</label>
            <input className="input mb-4" type="time" value={taskDueTime} onChange={(e) => setTaskDueTime(e.target.value)} />
            <button className="btn-primary w-full" disabled={loading} onClick={handleCreateTask}>
              {loading ? 'Finishing…' : 'Go to dashboard'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
