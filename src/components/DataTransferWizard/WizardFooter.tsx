interface Props {
  step: number
  canNext: boolean
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}

export default function WizardFooter({ step, canNext, onClose, onPrevious, onNext }: Props) {
  return (
    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-neutral-800">
      <div className="space-x-2">
        <button
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
          onClick={onClose}
        >
          关闭
        </button>
      </div>
      <div className="space-x-2">
        <button
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-200"
          onClick={onPrevious}
          disabled={step === 1}
        >
          上一步
        </button>
        <button
          className="px-3 py-1.5 text-sm border rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onNext}
          disabled={!canNext}
        >
          下一步
        </button>
      </div>
    </div>
  )
}
