import { useEffect, useRef, useState } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import { useTheme } from '../contexts/ThemeContext'
import * as monaco from 'monaco-editor'

interface MonacoSqlEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function MonacoSqlEditor({ value, onChange }: MonacoSqlEditorProps) {
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(300)

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = entry.contentRect.height
        if (newHeight > 0) {
          setHeight(newHeight)
        }
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // 注册 SQL 关键字和常用函数的自动补全
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions: monaco.languages.CompletionItem[] = [
          // SQL 关键字
          ...['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER',
              'TABLE', 'DATABASE', 'INDEX', 'VIEW', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER',
              'ON', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'LIKE', 'BETWEEN', 'AS', 'DISTINCT',
              'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET', 'COUNT', 'SUM', 'AVG', 'MAX',
              'MIN', 'UNION', 'ALL', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC',
              'PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'DEFAULT', 'AUTO_INCREMENT', 'NOT NULL',
              'VARCHAR', 'INT', 'INTEGER', 'BIGINT', 'DECIMAL', 'FLOAT', 'DOUBLE', 'DATE', 'DATETIME',
              'TIMESTAMP', 'TEXT', 'BLOB', 'BOOLEAN', 'CHAR', 'ENUM', 'SET'].map(keyword => ({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            range: range,
          })),

          // SQL 函数
          ...['COUNT(*)', 'SUM()', 'AVG()', 'MAX()', 'MIN()', 'NOW()', 'CURDATE()', 'CURTIME()',
              'DATE_FORMAT()', 'CONCAT()', 'SUBSTRING()', 'LENGTH()', 'UPPER()', 'LOWER()',
              'TRIM()', 'COALESCE()', 'IFNULL()', 'NULLIF()', 'CAST()', 'CONVERT()'].map(func => ({
            label: func,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: func,
            range: range,
            detail: 'SQL Function',
          })),

          // 常用 SQL 语句模板
          {
            label: 'SELECT Template',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'SELECT ${1:columns}\nFROM ${2:table}\nWHERE ${3:condition};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'SELECT statement template',
            range: range,
          },
          {
            label: 'INSERT Template',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'INSERT INTO ${1:table} (${2:columns})\nVALUES (${3:values});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'INSERT statement template',
            range: range,
          },
          {
            label: 'UPDATE Template',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'UPDATE ${1:table}\nSET ${2:column} = ${3:value}\nWHERE ${4:condition};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'UPDATE statement template',
            range: range,
          },
          {
            label: 'DELETE Template',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'DELETE FROM ${1:table}\nWHERE ${2:condition};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'DELETE statement template',
            range: range,
          },
        ]

        return { suggestions }
      },
    })

    // 配置编辑器快捷键
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      // Ctrl/Cmd + Enter 执行查询（这里可以触发运行按钮）
      console.log('Execute query shortcut triggered')
    })
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <Editor
        height={height}
        defaultLanguage="sql"
        value={value}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorDidMount}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
          // 自动补全相关配置
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showFunctions: true,
          },
          snippetSuggestions: 'top',
          // 其他配置
          padding: { top: 10, bottom: 10 },
          folding: true,
          foldingStrategy: 'indentation',
          showFoldingControls: 'always',
          bracketPairColorization: {
            enabled: true,
          },
        }}
      />
    </div>
  )
}
