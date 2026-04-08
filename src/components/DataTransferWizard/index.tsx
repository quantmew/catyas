import { useState, useEffect } from 'react'
import { Connection } from '../../types'
import Step1SelectSource from './Step1SelectSource'
import WizardFooter from './WizardFooter'
import Step2SelectObjects, { ObjectTree } from './Step2SelectObjects'
import { useTranslation } from 'react-i18next'

interface Props {
  open: boolean
  onClose: () => void
  connections: Connection[]
}

export default function DataTransferWizard({ open, onClose, connections }: Props) {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [sourceConnId, setSourceConnId] = useState<string>('')
  const [sourceDb, setSourceDb] = useState<string>('')
  const [targetMode, setTargetMode] = useState<'connection' | 'file'>('connection')
  const [targetConnId, setTargetConnId] = useState<string>('')
  const [targetDb, setTargetDb] = useState<string>('')
  const [objects, setObjects] = useState<ObjectTree>({
    tables: {},
    views: {},
    functions: {},
    events: {},
  })

  // Load tables from source connection when moving to step 2
  useEffect(() => {
    if (step === 2 && sourceConnId && sourceDb) {
      const conn = connections.find(c => c.id === sourceConnId)
      if (conn) {
        window.electronAPI?.getTables(conn, sourceDb).then(result => {
          if (result?.success && result.tables) {
            const tableMap: Record<string, boolean> = {}
            result.tables.forEach((t: any) => { tableMap[Object.values(t)[0] as string] = false })
            setObjects(prev => ({ ...prev, tables: tableMap }))
          }
        })
        window.electronAPI?.getViews(conn, sourceDb).then(result => {
          if (result?.success && result.views) {
            const viewMap: Record<string, boolean> = {}
            result.views.forEach((v: any) => { viewMap[v.TABLE_NAME || Object.values(v)[0]] = false })
            setObjects(prev => ({ ...prev, views: viewMap }))
          }
        })
      }
    }
  }, [step, sourceConnId, sourceDb, connections])

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
          {t('dataTransfer.title')}
        </div>

        {/* Step indicator */}
        <div className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">
          {t('dataTransfer.step', { current: step, total: 3 })}
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
