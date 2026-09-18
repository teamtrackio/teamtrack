import { useState } from 'react'

export interface TourStep {
  title: string
  text: string
}

export default function GuidedTour({
  steps,
  onFinish,
  finalButtonLabel = 'Done'
}: {
  steps: TourStep[]
  onFinish: () => void
  finalButtonLabel?: string
}) {
  const [index, setIndex] = useState(0)
  const step = steps[index]
  const isLast = index === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
        <div className="flex gap-1 mb-4">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= index ? 'bg-brand-500' : 'bg-gray-200'}`} />
          ))}
        </div>
        <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
        <p className="text-gray-600 mb-6">{step.text}</p>
        <div className="flex items-center justify-between">
          <button onClick={onFinish} className="text-sm text-gray-400">
            Skip
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <button onClick={() => setIndex((i) => i - 1)} className="btn-secondary px-4 py-2 text-sm">
                Back
              </button>
            )}
            <button
              onClick={() => (isLast ? onFinish() : setIndex((i) => i + 1))}
              className="btn-primary px-4 py-2 text-sm"
            >
              {isLast ? finalButtonLabel : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
