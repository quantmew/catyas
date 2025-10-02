import { Connection } from '../../types'
import ConnectionSelector from './ConnectionSelector'

interface Props {
  connections: Connection[]
  sourceConnId: string
  sourceDb: string
  targetMode: 'connection' | 'file'
  targetConnId: string
  targetDb: string
  onSourceConnChange: (connId: string) => void
  onSourceDbChange: (db: string) => void
  onTargetModeChange: (mode: 'connection' | 'file') => void
  onTargetConnChange: (connId: string) => void
  onTargetDbChange: (db: string) => void
}

export default function Step1SelectSource({
  connections,
  sourceConnId,
  sourceDb,
  targetMode,
  targetConnId,
  targetDb,
  onSourceConnChange,
  onSourceDbChange,
  onTargetModeChange,
  onTargetConnChange,
  onTargetDbChange
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-8">
      {/* 左侧：源 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-blue-600 font-semibold">源</div>
          {/* 占位保持与右侧单选高度一致，确保上下对齐 */}
          <div className="h-6" />
        </div>
        <ConnectionSelector
          label=""
          connections={connections}
          selectedConnId={sourceConnId}
          selectedDb={sourceDb}
          onConnChange={onSourceConnChange}
          onDbChange={onSourceDbChange}
        />
      </div>

      {/* 右侧：目标 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-blue-600 font-semibold">目标</div>
          <div className="flex items-center gap-6 text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={targetMode === 'connection'}
                onChange={() => onTargetModeChange('connection')}
              />
              <span className="dark:text-gray-200">连接</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={targetMode === 'file'}
                onChange={() => onTargetModeChange('file')}
              />
              <span className="dark:text-gray-200">文件</span>
            </label>
          </div>
        </div>

        {targetMode === 'connection' ? (
          <ConnectionSelector
            label=""
            connections={connections}
            selectedConnId={targetConnId}
            selectedDb={targetDb}
            onConnChange={onTargetConnChange}
            onDbChange={onTargetDbChange}
            showConnectionInfo={true}
          />
        ) : (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            导出到文件将在下一步配置。
          </div>
        )}
      </div>
    </div>
  )
}
