import { useEffect, useRef, useState } from 'react'

const KEYWORDS = [
  'select','from','where','and','or','insert','into','values','update','set','delete','create','table','view','function','procedure','join','left','right','inner','outer','on','group','by','order','limit','having','as','distinct','union','all','case','when','then','else','end'
]

function highlight(sql: string) {
  const esc = sql
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
  let html = esc.replace(/('[^']*')/g, '<span class="text-rose-600">$1</span>')
  html = html.replace(/--[^\n]*/g, (m)=>`<span class="text-gray-400">${m}</span>`)
  html = html.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="text-amber-700">$1</span>')
  const kw = new RegExp(`\\b(${KEYWORDS.join('|')})\\b`,'gi')
  html = html.replace(kw, (m)=>`<span class="text-blue-700 font-semibold">${m.toUpperCase()}</span>`)
  return html
}

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function SqlEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [internal, setInternal] = useState(value)

  useEffect(()=>setInternal(value),[value])

  useEffect(()=>{
    const el = ref.current
    if (!el) return
    el.innerHTML = highlight(internal)
  },[internal])

  return (
    <div
      ref={ref}
      className="min-h-[220px] h-full w-full font-mono text-sm outline-none border border-gray-200 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 whitespace-pre-wrap"
      contentEditable
      spellCheck={false}
      onInput={(e)=>{
        const text = (e.currentTarget.textContent||'')
        setInternal(text)
        onChange(text)
      }}
    />
  )
}

