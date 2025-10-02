import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'

interface Props {
  open: boolean
  onClose: () => void
}

export default function OptionsDialog({ open, onClose }: Props) {
  const { i18n, t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [language, setLanguage] = useState(i18n.language)
  const [active, setActive] = useState<'general' | 'tabs' | 'autocomplete' | 'editor' | 'logs' | 'autorecover' | 'fileLocations' | 'connectivity' | 'environment' | 'advanced'>('general')
  const defaultGeneral = useMemo(
    () => ({
      allowDuplicateWindow: false,
      showObjectsUnderSchemas: true,
      showToolbarText: true,
      showFunctionWizard: true,
      confirmSaveBeforeClose: true,
      useSecureInput: true,
      autoCheckUpdatesOnStart: true,
    }),
    []
  )
  const [general, setGeneral] = useState(() => {
    try {
      const saved = localStorage.getItem('options.general')
      return saved ? { ...defaultGeneral, ...JSON.parse(saved) } : defaultGeneral
    } catch {
      return defaultGeneral
    }
  })

  // Tabs settings
  const defaultTabs = useMemo(
    () => ({
      openNewTabAt: 'mainWindow' as 'mainWindow' | 'lastTabWindow' | 'lastNonMainWindow' | 'newWindow',
      startupScreen: 'objectsOnly' as 'objectsOnly' | 'resumeLast' | 'openSpecific',
    }),
    []
  )
  const [tabs, setTabs] = useState(() => {
    try {
      const saved = localStorage.getItem('options.tabs')
      return saved ? { ...defaultTabs, ...JSON.parse(saved) } : defaultTabs
    } catch {
      return defaultTabs
    }
  })

  // Autocomplete settings
  const defaultAutocomplete = { enabled: true, updateInfo: true, selectFirst: true }
  const [autocomplete, setAutocomplete] = useState(() => {
    try {
      const saved = localStorage.getItem('options.autocomplete')
      return saved ? { ...defaultAutocomplete, ...JSON.parse(saved) } : defaultAutocomplete
    } catch {
      return defaultAutocomplete
    }
  })

  // Editor settings
  const defaultEditor = {
    showLineNumbers: true,
    codeFolding: true,
    highlightCurrentLine: true,
    syntaxHighlight: true,
    largeFileMB: 10,
    autoRun: false,
    indentWidth: 2,
    fontFamily: 'Consolas',
    fontSize: 12,
  }
  const [editor, setEditor] = useState(() => {
    try {
      const saved = localStorage.getItem('options.editor')
      return saved ? { ...defaultEditor, ...JSON.parse(saved) } : defaultEditor
    } catch {
      return defaultEditor
    }
  })

  // Logs settings
  const defaultLogs = { limitRecords: true, pageSize: 1000, thousandsSeparator: false }
  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('options.logs')
      return saved ? { ...defaultLogs, ...JSON.parse(saved) } : defaultLogs
    } catch {
      return defaultLogs
    }
  })

  // Autorecover settings
  const defaultAutorecover = { queryEnabled: true, queryInterval: 30, modelEnabled: true, modelInterval: 180, chartEnabled: true, chartInterval: 180 }
  const [autorecover, setAutorecover] = useState(() => {
    try {
      const saved = localStorage.getItem('options.autorecover')
      return saved ? { ...defaultAutorecover, ...JSON.parse(saved) } : defaultAutorecover
    } catch {
      return defaultAutorecover
    }
  })

  // File locations
  const defaultFileLocations = {
    paths: {
      logs: '',
      mysql: '',
      postgresql: '',
      oracle: '',
      sqlite: '',
      sqlserver: '',
      mariadb: '',
      mongodb: '',
      redis: '',
      premium: '',
      export: ''
    }
  }
  const [fileLocations, setFileLocations] = useState(() => {
    try {
      const saved = localStorage.getItem('options.fileLocations')
      return saved ? { ...defaultFileLocations, ...JSON.parse(saved) } : defaultFileLocations
    } catch {
      return defaultFileLocations
    }
  })

  // Connectivity
  const defaultConnectivity = { verifyCA: true, useProxy: false, proxyType: 'HTTP' as 'HTTP'|'SOCKS5', host: '127.0.0.1', port: 1080, username: '', password: '' }
  const [connectivity, setConnectivity] = useState(() => {
    try {
      const saved = localStorage.getItem('options.connectivity')
      return saved ? { ...defaultConnectivity, ...JSON.parse(saved) } : defaultConnectivity
    } catch {
      return defaultConnectivity
    }
  })

  // Environment
  const defaultEnvironment = {
    execPaths: {
      sqlplus: '',
      mongoShell: '',
      mongoDump: '',
      mongoRestore: '',
      mongoImport: '',
      mongoExport: '',
      externalEditor: ''
    },
    ociLib: ''
  }
  const [environment, setEnvironment] = useState(() => {
    try {
      const saved = localStorage.getItem('options.environment')
      return saved ? { ...defaultEnvironment, ...JSON.parse(saved) } : defaultEnvironment
    } catch {
      return defaultEnvironment
    }
  })

  // Advanced
  const defaultAdvanced = { enableDiagnostic: false, showLabs: false, allowMultiInstance: false }
  const [advanced, setAdvanced] = useState(() => {
    try {
      const saved = localStorage.getItem('options.advanced')
      return saved ? { ...defaultAdvanced, ...JSON.parse(saved) } : defaultAdvanced
    } catch {
      return defaultAdvanced
    }
  })

  useEffect(() => {
    if (open) setLanguage(i18n.language)
  }, [open, i18n.language])

  if (!open) return null

  const apply = async () => {
    if (language !== i18n.language) await i18n.changeLanguage(language)
    try {
      localStorage.setItem('options.general', JSON.stringify(general))
      localStorage.setItem('options.tabs', JSON.stringify(tabs))
      localStorage.setItem('options.autocomplete', JSON.stringify(autocomplete))
      localStorage.setItem('options.editor', JSON.stringify(editor))
      localStorage.setItem('options.logs', JSON.stringify(logs))
      localStorage.setItem('options.autorecover', JSON.stringify(autorecover))
      localStorage.setItem('options.fileLocations', JSON.stringify(fileLocations))
      localStorage.setItem('options.connectivity', JSON.stringify(connectivity))
      localStorage.setItem('options.environment', JSON.stringify(environment))
      localStorage.setItem('options.advanced', JSON.stringify(advanced))
    } catch {}
    onClose()
  }

  const restoreDefaults = () => {
    setGeneral(defaultGeneral)
    setTabs(defaultTabs)
    setAutocomplete(defaultAutocomplete)
    setEditor(defaultEditor)
    setLogs(defaultLogs)
    setAutorecover(defaultAutorecover)
    setFileLocations(defaultFileLocations)
    setConnectivity(defaultConnectivity)
    setEnvironment(defaultEnvironment)
    setAdvanced(defaultAdvanced)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/30">
      <div className="w-[860px] my-8 bg-white dark:bg-neutral-900 rounded shadow-lg border border-gray-200 dark:border-neutral-700 flex">
        {/* Left categories */}
        <div className="w-44 border-r border-gray-200 dark:border-neutral-700 p-2 text-sm select-none">
          {([
            { id: 'general', label: t('optionsDialog.general') },
            { id: 'tabs', label: t('optionsDialog.tabs.title') },
            { id: 'autocomplete', label: t('optionsDialog.autocomplete.title') },
            { id: 'editor', label: t('optionsDialog.editor.title') },
            { id: 'logs', label: t('optionsDialog.logs.title') },
            { id: 'autorecover', label: t('optionsDialog.autorecover.title') },
            { id: 'fileLocations', label: t('optionsDialog.fileLocations.title') },
            { id: 'connectivity', label: t('optionsDialog.connectivity.title') },
            { id: 'environment', label: t('optionsDialog.environment.title') },
            { id: 'advanced', label: t('optionsDialog.advanced.title') },
          ] as { id: typeof active; label: string }[]).map((item) => (
            <div
              key={item.id}
              className={`px-2 py-1 rounded cursor-pointer ${active === item.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
              onClick={() => setActive(item.id)}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Right content */}
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-2 border-b text-sm font-semibold bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100">{t('optionsDialog.title')}</div>
          <div className="flex-1 p-5 text-sm space-y-6 overflow-auto">
            {/* Switch by tab */}
            {active === 'general' && (
            <>
            {/* Theme */}
            <div>
              <div className="mb-2 font-medium">{t('optionsDialog.appearance')}</div>
              <div className="flex items-center gap-6 text-sm text-gray-700 dark:text-gray-300">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    checked={theme === 'light'}
                    onChange={() => setTheme('light')}
                  /> {t('optionsDialog.theme.light')}
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    checked={theme === 'dark'}
                    onChange={() => setTheme('dark')}
                  /> {t('optionsDialog.theme.dark')}
                </label>
              </div>
            </div>

            {/* Language */}
            <div>
              <div className="mb-1 font-medium">{t('optionsDialog.language')}</div>
              <select className="border rounded px-2 py-1 text-sm" value={language} onChange={(e)=>setLanguage(e.target.value)}>
                <option value="zh-CN">简体中文</option>
                <option value="en">English</option>
              </select>
              <div className="text-xs text-gray-500 mt-1">{t('optionsDialog.applyNote')}</div>
            </div>

            {/* General options */}
            <div className="space-y-2">
              <div className="font-medium">{t('optionsDialog.generalSection')}</div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={general.allowDuplicateWindow} onChange={(e)=>setGeneral(v=>({...v, allowDuplicateWindow: e.target.checked}))} />{t('optionsDialog.allowDuplicateWindow')}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={general.showObjectsUnderSchemas} onChange={(e)=>setGeneral(v=>({...v, showObjectsUnderSchemas: e.target.checked}))} />{t('optionsDialog.showObjectsUnderSchemas')}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={general.showToolbarText} onChange={(e)=>setGeneral(v=>({...v, showToolbarText: e.target.checked}))} />{t('optionsDialog.showToolbarText')}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={general.showFunctionWizard} onChange={(e)=>setGeneral(v=>({...v, showFunctionWizard: e.target.checked}))} />{t('optionsDialog.showFunctionWizard')}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={general.confirmSaveBeforeClose} onChange={(e)=>setGeneral(v=>({...v, confirmSaveBeforeClose: e.target.checked}))} />{t('optionsDialog.confirmSaveBeforeClose')}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={general.useSecureInput} onChange={(e)=>setGeneral(v=>({...v, useSecureInput: e.target.checked}))} />{t('optionsDialog.useSecureInput')}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={general.autoCheckUpdatesOnStart} onChange={(e)=>setGeneral(v=>({...v, autoCheckUpdatesOnStart: e.target.checked}))} />{t('optionsDialog.autoCheckUpdatesOnStart')}</label>

              <div className="mt-3">
                <div className="mb-2 font-medium">{t('optionsDialog.usageData.title')}</div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-gray-700"><input type="checkbox" disabled />{t('optionsDialog.usageData.share')}</label>
                  <button className="px-3 py-1.5 text-xs border rounded" onClick={()=>alert(t('optionsDialog.usageData.buttonHint'))}>{t('optionsDialog.usageData.button')}</button>
                </div>
                <div className="text-xs text-gray-500 mt-1">{t('optionsDialog.usageData.help')}</div>
              </div>
            </div>
            </>)}

            {active === 'tabs' && (
              <div className="space-y-5">
                <div>
                  <div className="font-medium mb-2">{t('optionsDialog.tabs.openNewTabAt')}</div>
                  <div className="space-y-2 text-gray-700">
                    {([
                      ['mainWindow', t('optionsDialog.tabs.mainWindow')],
                      ['lastTabWindow', t('optionsDialog.tabs.lastTabWindow')],
                      ['lastNonMainWindow', t('optionsDialog.tabs.lastNonMainWindow')],
                      ['newWindow', t('optionsDialog.tabs.newWindow')],
                    ] as [typeof tabs.openNewTabAt, string][]).map(([k, label]) => (
                      <label key={k} className="flex items-center gap-2">
                        <input type="radio" name="openNewTabAt" checked={tabs.openNewTabAt===k} onChange={()=>setTabs(v=>({...v, openNewTabAt:k}))} />{label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-medium mb-2">{t('optionsDialog.tabs.startupScreen')}</div>
                  <div className="space-y-2 text-gray-700">
                    <label className="flex items-center gap-2"><input type="radio" name="startupScreen" checked={tabs.startupScreen==='objectsOnly'} onChange={()=>setTabs(v=>({...v, startupScreen:'objectsOnly'}))} />{t('optionsDialog.tabs.objectsOnly')}</label>
                    <label className="flex items-center gap-2"><input type="radio" name="startupScreen" checked={tabs.startupScreen==='resumeLast'} onChange={()=>setTabs(v=>({...v, startupScreen:'resumeLast'}))} />{t('optionsDialog.tabs.resumeLast')}</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2"><input type="radio" name="startupScreen" checked={tabs.startupScreen==='openSpecific'} onChange={()=>setTabs(v=>({...v, startupScreen:'openSpecific'}))} />{t('optionsDialog.tabs.openSpecific')}</label>
                      <button className="px-3 py-1 text-xs border rounded" onClick={()=>alert(t('optionsDialog.tabs.setTabsHint'))}>{t('optionsDialog.tabs.setTabs')}</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {active === 'autocomplete' && (
              <div className="space-y-3">
                <div className="font-medium">{t('optionsDialog.autocomplete.title')}</div>
                <label className="flex items-center gap-2"><input type="checkbox" checked={autocomplete.enabled} onChange={(e)=>setAutocomplete(v=>({...v, enabled:e.target.checked}))} />{t('optionsDialog.autocomplete.enabled')}</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={autocomplete.updateInfo} onChange={(e)=>setAutocomplete(v=>({...v, updateInfo:e.target.checked}))} />{t('optionsDialog.autocomplete.updateInfo')}</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={autocomplete.selectFirst} onChange={(e)=>setAutocomplete(v=>({...v, selectFirst:e.target.checked}))} />{t('optionsDialog.autocomplete.selectFirst')}</label>
                <div>
                  <button className="px-3 py-1 text-xs border rounded" onClick={()=>{localStorage.removeItem('autocomplete.cache'); alert(t('optionsDialog.autocomplete.cleared'))}}>{t('optionsDialog.autocomplete.clearInfo')}</button>
                </div>
              </div>
            )}

            {active === 'editor' && (
              <div className="space-y-3">
                <div className="font-medium">{t('optionsDialog.editor.common')}</div>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editor.showLineNumbers} onChange={(e)=>setEditor(v=>({...v, showLineNumbers:e.target.checked}))} />{t('optionsDialog.editor.showLineNumbers')}</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editor.codeFolding} onChange={(e)=>setEditor(v=>({...v, codeFolding:e.target.checked}))} />{t('optionsDialog.editor.codeFolding')}</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editor.highlightCurrentLine} onChange={(e)=>setEditor(v=>({...v, highlightCurrentLine:e.target.checked}))} />{t('optionsDialog.editor.highlightCurrentLine')}</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editor.syntaxHighlight} onChange={(e)=>setEditor(v=>({...v, syntaxHighlight:e.target.checked}))} />{t('optionsDialog.editor.syntaxHighlight')}</label>
                <div className="flex items-center gap-2 text-sm"><span>{t('optionsDialog.editor.disableIfLarger')}</span><input className="w-16 border rounded px-2 py-0.5" type="number" min={1} value={editor.largeFileMB} onChange={(e)=>setEditor(v=>({...v, largeFileMB:Number(e.target.value)||1}))} /><span>MB</span></div>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editor.autoRun} onChange={(e)=>setEditor(v=>({...v, autoRun:e.target.checked}))} />{t('optionsDialog.editor.autoRun')}</label>
                <div className="flex items-center gap-2"><span>{t('optionsDialog.editor.indentWidth')}</span><input className="w-16 border rounded px-2 py-0.5" type="number" min={1} value={editor.indentWidth} onChange={(e)=>setEditor(v=>({...v, indentWidth:Number(e.target.value)||2}))} /></div>
                <div className="flex items-center gap-2"><span>{t('optionsDialog.editor.font')}</span>
                  <select className="border rounded px-2 py-1" value={editor.fontFamily} onChange={(e)=>setEditor(v=>({...v, fontFamily:e.target.value}))}>
                    {['Consolas','JetBrains Mono','Fira Code','Menlo','Monaco'].map(f=>(<option key={f} value={f}>{f}</option>))}
                  </select>
                  <select className="border rounded px-2 py-1" value={editor.fontSize} onChange={(e)=>setEditor(v=>({...v, fontSize:Number(e.target.value)}))}>
                    {[10,11,12,13,14,16].map(s=>(<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
              </div>
            )}

            {active === 'logs' && (
              <div className="space-y-3">
                <div className="font-medium">{t('optionsDialog.logs.title')}</div>
                <label className="flex items-center gap-2"><input type="checkbox" checked={logs.limitRecords} onChange={(e)=>setLogs(v=>({...v, limitRecords:e.target.checked}))} />{t('optionsDialog.logs.limitRecords')}</label>
                <div className="flex items-center gap-2"><input className="w-20 border rounded px-2 py-0.5" type="number" min={1} value={logs.pageSize} onChange={(e)=>setLogs(v=>({...v, pageSize:Number(e.target.value)||1000}))} /><span>{t('optionsDialog.logs.pagePer')}</span></div>
                <label className="flex items-center gap-2"><input type="checkbox" checked={logs.thousandsSeparator} onChange={(e)=>setLogs(v=>({...v, thousandsSeparator:e.target.checked}))} />{t('optionsDialog.logs.thousandsSeparator')}</label>
              </div>
            )}

            {active === 'autorecover' && (
              <div className="space-y-5">
                <div className="font-medium">{t('optionsDialog.autorecover.title')}</div>
                {([
                  ['query','queryEnabled','queryInterval'] as const,
                  ['model','modelEnabled','modelInterval'] as const,
                  ['chart','chartEnabled','chartInterval'] as const,
                ]).map(([key, enabledKey, intervalKey]) => (
                  <div key={key} className="flex items-center gap-3">
                    <label className="flex items-center gap-2 min-w-24"><input type="checkbox" checked={(autorecover as any)[enabledKey]} onChange={(e)=>setAutorecover(v=>({...v, [enabledKey]: e.target.checked}))} />{t(`optionsDialog.autorecover.${key}`)}</label>
                    <span className="text-gray-600">{t('optionsDialog.autorecover.interval')}</span>
                    <input className="w-24 border rounded px-2 py-0.5" type="number" min={5} value={(autorecover as any)[intervalKey]} onChange={(e)=>setAutorecover(v=>({...v, [intervalKey]: Number(e.target.value)||0}))} />
                  </div>
                ))}
              </div>
            )}

            {active === 'fileLocations' && (
              <div className="space-y-3">
                <div className="font-medium">{t('optionsDialog.fileLocations.title')}*</div>
                {Object.entries(fileLocations.paths).map(([k, v]) => (
                  <div className="flex items-center gap-3" key={k}>
                    <div className="w-56 text-right pr-2 text-gray-700">{t(`optionsDialog.fileLocations.${k}`)}</div>
                    <input className="flex-1 border rounded px-2 py-1" value={v} onChange={(e)=>setFileLocations(fl=>({ ...fl, paths: { ...fl.paths, [k]: e.target.value } }))} />
                    <button className="px-2 py-1 text-xs border rounded" onClick={()=>alert(t('optionsDialog.fileLocations.browseHint'))}>...</button>
                  </div>
                ))}
                <div className="text-xs text-gray-500">{t('optionsDialog.applyNote')}</div>
              </div>
            )}

            {active === 'connectivity' && (
              <div className="space-y-4">
                <div className="text-xs text-gray-600">{t('optionsDialog.connectivity.scopeNote')}</div>
                <label className="flex items-center gap-2"><input type="checkbox" checked={connectivity.verifyCA} onChange={(e)=>setConnectivity(v=>({...v, verifyCA:e.target.checked}))} />{t('optionsDialog.connectivity.verifyCA')}</label>
                <div>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={connectivity.useProxy} onChange={(e)=>setConnectivity(v=>({...v, useProxy:e.target.checked}))} />{t('optionsDialog.connectivity.useProxy')}</label>
                  {connectivity.useProxy && (
                    <div className="mt-2 space-y-2 ml-6">
                      <div className="flex items-center gap-2"><div className="w-28">{t('optionsDialog.connectivity.proxyType')}</div>
                        <select className="border rounded px-2 py-1" value={connectivity.proxyType} onChange={(e)=>setConnectivity(v=>({...v, proxyType: e.target.value as any}))}>
                          <option value="HTTP">HTTP</option>
                          <option value="SOCKS5">SOCKS5</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2"><div className="w-28">{t('optionsDialog.connectivity.host')}</div><input className="border rounded px-2 py-1 w-64" value={connectivity.host} onChange={(e)=>setConnectivity(v=>({...v, host:e.target.value}))} /></div>
                      <div className="flex items-center gap-2"><div className="w-28">{t('optionsDialog.connectivity.port')}</div><input className="border rounded px-2 py-1 w-24" type="number" value={connectivity.port} onChange={(e)=>setConnectivity(v=>({...v, port:Number(e.target.value)||0}))} /></div>
                      <div className="flex items-center gap-2"><div className="w-28">{t('optionsDialog.connectivity.username')}</div><input className="border rounded px-2 py-1 w-64" value={connectivity.username} onChange={(e)=>setConnectivity(v=>({...v, username:e.target.value}))} /></div>
                      <div className="flex items-center gap-2"><div className="w-28">{t('optionsDialog.connectivity.password')}</div><input className="border rounded px-2 py-1 w-64" type="password" value={connectivity.password} onChange={(e)=>setConnectivity(v=>({...v, password:e.target.value}))} /></div>
                      <div>
                        <button className="px-3 py-1 text-sm border rounded" onClick={()=>alert(t('optionsDialog.connectivity.testHint'))}>{t('optionsDialog.connectivity.test')}</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {active === 'environment' && (
              <div className="space-y-3">
                <div className="font-medium">{t('optionsDialog.environment.executables')}</div>
                {Object.entries(environment.execPaths).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-3">
                    <div className="w-56 text-right pr-2 text-gray-700">{t(`optionsDialog.environment.${k}`)}</div>
                    <input className="flex-1 border rounded px-2 py-1" value={v} onChange={(e)=>setEnvironment(env=>({ ...env, execPaths: { ...env.execPaths, [k]: e.target.value } }))} />
                    <button className="px-2 py-1 text-xs border rounded" onClick={()=>alert(t('optionsDialog.environment.browseHint'))}>...</button>
                  </div>
                ))}
                <div className="font-medium mt-2">OCI</div>
                <div className="flex items-center gap-3">
                  <div className="w-56 text-right pr-2 text-gray-700">{t('optionsDialog.environment.ociLib')}</div>
                  <input className="flex-1 border rounded px-2 py-1" value={environment.ociLib} onChange={(e)=>setEnvironment(env=>({ ...env, ociLib: e.target.value }))} />
                  <button className="px-2 py-1 text-xs border rounded" onClick={()=>alert(t('optionsDialog.environment.browseHint'))}>...</button>
                </div>
                <div className="text-xs text-gray-500">{t('optionsDialog.applyNote')}</div>
              </div>
            )}

            {active === 'advanced' && (
              <div className="space-y-3">
                <div className="font-medium">{t('optionsDialog.advanced.title')}</div>
                <label className="flex items-center gap-2"><input type="checkbox" checked={advanced.enableDiagnostic} onChange={(e)=>setAdvanced(v=>({...v, enableDiagnostic:e.target.checked}))} />{t('optionsDialog.advanced.enableDiagnostic')}</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={advanced.showLabs} onChange={(e)=>setAdvanced(v=>({...v, showLabs:e.target.checked}))} />{t('optionsDialog.advanced.showLabs')}</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={advanced.allowMultiInstance} onChange={(e)=>setAdvanced(v=>({...v, allowMultiInstance:e.target.checked}))} />{t('optionsDialog.advanced.allowMultiInstance')}</label>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-xs border rounded" onClick={()=>alert(t('optionsDialog.advanced.registerOpenWithHint'))}>{t('optionsDialog.advanced.registerOpenWith')}</button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-xs border rounded" onClick={()=>alert(t('optionsDialog.advanced.registerUriHint'))}>{t('optionsDialog.advanced.registerUri')}</button>
                </div>
                <div className="text-xs text-gray-500">{t('optionsDialog.applyNote')}</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t flex items-center justify-between bg-gray-50 dark:bg-neutral-800 gap-2">
            <button className="px-3 py-1.5 text-sm border rounded" onClick={restoreDefaults}>{t('optionsDialog.restoreDefaults')}</button>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm border rounded" onClick={onClose}>{t('common.cancel')}</button>
            <button className="px-3 py-1.5 text-sm border rounded bg-blue-600 text-white" onClick={apply}>{t('common.ok')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
