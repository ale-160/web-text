import React, { useState, useCallback, useRef, useEffect } from 'react'
import MDEditor from '@uiw/react-md-editor'
import Header from './components/Header'
import TemplateModal from './components/TemplateModal'
import HistoryPanel from './components/HistoryPanel'
import Toast from './components/Toast'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useAutoSave } from './hooks/useAutoSave'
import { useTheme } from './hooks/useTheme'
import { useHistory } from './hooks/useHistory'
import { countStats } from './utils/stats'

const DEFAULT_CONTENT = `# 欢迎使用 WebText ✏️

这是一个纯前端的 Markdown 实时预览编辑器，所有数据保存在浏览器本地。

## 功能特性

- **实时预览** — 左侧编辑，右侧即时预览
- **自动保存** — 内容自动保存到浏览器本地存储
- **暗色模式** — 点击右上角切换明暗主题
- **模板库** — 内置常用模板，一键套用
- **历史版本** — 自动记录编辑历史，可随时回退
- **导出文件** — 支持导出为 .md 文件或复制到剪贴板

## 快捷操作

> 试试点击右上角的各个按钮吧！

开始编辑吧，你的内容会自动保存 👇
`

function App() {
  const [content, setContent] = useLocalStorage('webtext-content', DEFAULT_CONTENT)
  const { theme, toggleTheme } = useTheme()
  const { history, saveVersion, restoreVersion } = useHistory(content)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto save with debounce
  useAutoSave(content, () => {
    saveVersion()
  })

  const stats = countStats(content)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }, [])

  const handleExport = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `webtext-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
    showToast('文件已导出')
  }, [content, showToast])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content)
      showToast('已复制到剪贴板')
    } catch {
      showToast('复制失败')
    }
  }, [content, showToast])

  const handleApplyTemplate = useCallback((template: string) => {
    setContent(template)
    setShowTemplates(false)
    showToast('模板已应用')
  }, [setContent, showToast])

  const handleRestoreVersion = useCallback((versionContent: string) => {
    restoreVersion(versionContent)
    setShowHistory(false)
    showToast('已恢复到历史版本')
  }, [restoreVersion, showToast])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  return (
    <div data-theme={theme}>
      <Header
        stats={stats}
        theme={theme}
        onToggleTheme={toggleTheme}
        onExport={handleExport}
        onCopy={handleCopy}
        onShowTemplates={() => setShowTemplates(true)}
        onShowHistory={() => setShowHistory(true)}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />

      <div className={`editor-container${isFullscreen ? ' fullscreen' : ''}`}>
        <div className="editor-wrapper">
          <MDEditor
            value={content}
            onChange={(val) => setContent(val || '')}
            preview="live"
            height="100%"
            data-color-mode={theme}
          />
        </div>
      </div>

      {showTemplates && (
        <TemplateModal
          onSelect={handleApplyTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}

      <HistoryPanel
        open={showHistory}
        history={history}
        onSelect={handleRestoreVersion}
        onClose={() => setShowHistory(false)}
      />

      {toast && <Toast message={toast} />}
    </div>
  )
}

export default App
