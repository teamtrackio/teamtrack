import { useState } from 'react'

// NOTE ON THE WHATSAPP FLOW:
// There is no free, frontend-only way to verify that a given phone number
// actually has a WhatsApp account — that check requires WhatsApp's paid
// Business API, which this project deliberately does not use (see the
// product's free-tier / no-paid-API constraints). What this component does
// instead is open a pre-filled WhatsApp chat for the number via the public
// https://wa.me link format. If that number turns out not to have
// WhatsApp, WhatsApp itself will show an error in the tab that opens — this
// component can't detect that from here, so it offers a one-tap "try a
// different number" reset instead of a real validation check.
export default function InviteShareBox({ link, employeeName }: { link: string; employeeName?: string }) {
  const [copied, setCopied] = useState(false)
  const [phone, setPhone] = useState('')
  const [showPhoneInput, setShowPhoneInput] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API can fail on non-HTTPS/localhost in some browsers.
      // Fall back to selecting the text so the person can copy manually.
      const el = document.getElementById(`invite-link-${link.length}`) as HTMLInputElement | null
      el?.select()
    }
  }

  function cleanPhone(raw: string) {
    // Strip everything except digits — wa.me expects a bare country code +
    // number with no +, spaces, or dashes.
    return raw.replace(/[^\d]/g, '')
  }

  const digits = cleanPhone(phone)
  const validLength = digits.length >= 10 && digits.length <= 15

  function handleWhatsAppShare() {
    if (!validLength) return
    const message = `Hi${employeeName ? ` ${employeeName}` : ''}, here's your invite link to join our team: ${link}`
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Invite link</label>
        <button
          type="button"
          onClick={handleCopy}
          className="w-full text-left border border-gray-200 rounded-xl px-3 py-3 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between gap-2"
        >
          <input
            id={`invite-link-${link.length}`}
            readOnly
            value={link}
            onClick={(e) => e.stopPropagation()}
            className="bg-transparent flex-1 min-w-0 truncate text-sm outline-none cursor-pointer"
          />
          <span className={`text-xs font-medium shrink-0 ${copied ? 'text-ok' : 'text-brand-600'}`}>{copied ? 'Copied!' : 'Tap to copy'}</span>
        </button>
        <p className="text-xs text-gray-400 mt-1">Expires in 7 days. Works once.</p>
      </div>

      {!showPhoneInput ? (
        <button type="button" className="text-sm text-brand-600 font-medium" onClick={() => setShowPhoneInput(true)}>
          Share via WhatsApp instead
        </button>
      ) : (
        <div className="space-y-2">
          <label className="label">Phone number (with country code)</label>
          <input
            className="input"
            type="tel"
            inputMode="numeric"
            placeholder="e.g. 91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            type="button"
            disabled={!validLength}
            onClick={handleWhatsAppShare}
            className="w-full bg-[#25D366] text-white px-4 py-3 rounded-xl font-medium disabled:opacity-40 flex items-center justify-center gap-2"
          >
            Open WhatsApp chat
          </button>
          <p className="text-xs text-gray-400">
            This opens a WhatsApp chat with the link pre-filled. There's no way for the app to confirm the number actually has WhatsApp —
            if the chat doesn't open properly, tap below and try a different number.
          </p>
          <button
            type="button"
            className="text-xs text-gray-500 underline"
            onClick={() => {
              setPhone('')
            }}
          >
            Try a different number
          </button>
        </div>
      )}
    </div>
  )
}
