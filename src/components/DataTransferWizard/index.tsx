import { useState } from 'react'
import { Connection } from '../../types'
import Step1SelectSource from './Step1SelectSource'
import WizardFooter from './WizardFooter'
import Step2SelectObjects, { ObjectTree } from './Step2SelectObjects'

interface Props {
  open: boolean
  onClose: () => void
  connections: Connection[]
}

export default function DataTransferWizard({ open, onClose, connections }: Props) {
  const [step, setStep] = useState(1)
  const [sourceConnId, setSourceConnId] = useState<string>('')
  const [sourceDb, setSourceDb] = useState<string>('')
  const [targetMode, setTargetMode] = useState<'connection' | 'file'>('connection')
  const [targetConnId, setTargetConnId] = useState<string>('')
  const [targetDb, setTargetDb] = useState<string>('')
  const [objects, setObjects] = useState<ObjectTree>({
    tables: {
      BOND_BASIC_INFO: false,
      BOND_COUPON: false,
      BOND_INTEREST_PAYMENT: false,
      CONBOND_BASIC_INFO: false,
      CONBOND_CONVERT_PRICE_ADJUST: false,
      CONBOND_DAILY_CONVERT: false,
      CONBOND_DAILY_CONVERT_OLD: false,
      CONBOND_DAILY_PRICE: false,
      REPO_DAILY_PRICE: false,
    },
    views: {},
    functions: {},
    events: {},
  })

  if (!open) return null

  const canNext = step === 1
    ? (!!sourceConnId && !!sourceDb && (targetMode === 'file' || (!!targetConnId && !!targetDb)))
    : step === 2
      ? (Object.values(objects.tables).some(Boolean) || Object.values(objects.views).some(Boolean) || Object.values(objects.functions).some(Boolean) || Object.values(objects.events).some(Boolean))
      : true

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/30">
      <div className="w-[960px] my-6 bg-white dark:bg-neutral-900 rounded shadow-lg border border-gray-200 dark:border-neutral-700 flex flex-col">
        {/* Header */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100">
          数据传输
        </div>

        {/* Step indicator */}
        <div className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">
          步骤 {step} / 3
        </div>

        {/* Content */}
        <div className="px-6 pb-4 flex-1 min-h-[420px]">
          {step === 1 && (
            <Step1SelectSource
              connections={connections}
              sourceConnId={sourceConnId}
              sourceDb={sourceDb}
              targetMode={targetMode}
              targetConnId={targetConnId}
              targetDb={targetDb}
              onSourceConnChange={setSourceConnId}
              onSourceDbChange={setSourceDb}
              onTargetModeChange={setTargetMode}
              onTargetConnChange={setTargetConnId}
              onTargetDbChange={setTargetDb}
            />
          )}
          {step === 2 && (
            <Step2SelectObjects value={objects} onChange={setObjects} />
          )}
          {step === 3 && (
            <div className="text-gray-600 dark:text-gray-400">
              步骤 3: 配置传输选项
            </div>
          )}
        </div>

        {/* Footer */}
        <WizardFooter
          step={step}
          canNext={canNext}
          onClose={onClose}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>
    </div>
  )
}
