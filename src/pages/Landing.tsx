import { Link } from 'react-router-dom'
import { APP_CONFIG } from '@/config'

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="font-bold text-lg">{APP_CONFIG.productName}</span>
        <div className="flex gap-3">
          <Link to="/login" className="text-sm font-medium text-gray-600 py-2">
            Log in
          </Link>
          <Link to="/signup" className="btn-primary text-sm py-2">
            Start Free
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto text-center px-6 pt-16 pb-12">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">{APP_CONFIG.tagline}</h1>
        <p className="text-lg text-gray-600 mb-8">{APP_CONFIG.subheadline}</p>
        <Link to="/signup" className="btn-primary inline-block px-8 py-3 text-base">
          Start Free
        </Link>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-10 grid sm:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-2">The problem</h3>
          <p className="text-sm text-gray-600">
            You already give instructions on WhatsApp and calls. The hard part is knowing what actually got done — without asking five times a day.
          </p>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2">How it works</h3>
          <p className="text-sm text-gray-600">
            Assign a task with a deadline. Your employee starts it, completes it, and adds a note. You see it update in real time.
          </p>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2">What you get</h3>
          <p className="text-sm text-gray-600">
            One dashboard: what's done, what's pending, and exactly who needs your attention right now.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-10 grid sm:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-2">Owner view</h3>
          <p className="text-sm text-gray-600">
            See today's totals, overdue tasks, and how each employee is doing — without opening a single chat thread.
          </p>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2">Employee view</h3>
          <p className="text-sm text-gray-600">
            A simple list of today's tasks. Start, complete, add a note. Nothing to learn.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-10">
        <h3 className="font-semibold mb-4 text-center">FAQ</h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium">Does this guarantee my team gets more done?</p>
            <p className="text-gray-600">No tool can guarantee that. What it does is make delegated work visible, so gaps show up immediately instead of days later.</p>
          </div>
          <div>
            <p className="font-medium">Do my employees need to install anything?</p>
            <p className="text-gray-600">No — it works in any mobile browser, and can optionally be added to their home screen like an app.</p>
          </div>
          <div>
            <p className="font-medium">Is it free?</p>
            <p className="text-gray-600">Yes, to start.</p>
          </div>
        </div>
      </section>

      <footer className="text-center text-xs text-gray-400 py-8">
        {APP_CONFIG.productName} · {APP_CONFIG.supportEmail}
      </footer>
    </div>
  )
}
