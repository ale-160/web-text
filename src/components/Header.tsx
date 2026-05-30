import React from 'react'

interface HeaderProps {
  stats: { chars: number; words: number; lines: number }
  theme: string
  onToggleTheme: () => void
  onExport: () => void
  onCopy: () => void
  onShowTemplates: () => void
  onShowHistory: () => void
  onToggleFullscreen: () => void
  isFullscreen: boolean
}

const Header: React.FC<HeaderProps> = ({
  stats,
  theme,
  onToggleTheme,
  onExport,
  onCopy,
  onShowTemplates,
  onShowHistory,
  onToggleFullscreen,
  isFullscreen,
}) => {
  return (
    <header className="header">
      <div className="header-left">
        <a className="logo" href="/">WebText<span>.dev</span></a>
      </div>

      <div className="header-center">
        <div className="stat-item">
          字符 <span className="stat-value">{stats.chars}</span>
        </div>
        <div className="stat-item">
          词数 <span className="stat-value">{stats.words}</span>
        </div>
        <div className="stat-item">
          行数 <span className="stat-value">{stats.lines}</span>
        </div>
      </div>

      <div className="header-right">
        <button className="btn" onClick={onShowTemplates} title="模板库">
          📋 <span className="label-text">模板</span>
        </button>
        <button className="btn" onClick={onShowHistory} title="历史版本">
          🕐 <span className="label-text">历史</span>
        </button>
        <button className="btn" onClick={onCopy} title="复制到剪贴板">
          📎 <span className="label-text">复制</span>
        </button>
        <button className="btn btn-primary" onClick={onExport} title="导出文件">
          💾 <span className="label-text">导出</span>
        </button>
        <button className="btn btn-icon" onClick={onToggleTheme} title="切换主题">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="btn btn-icon" onClick={onToggleFullscreen} title="全屏">
          {isFullscreen ? '⬜' : '⬛'}
        </button>
      </div>
    </header>
  )
}

export default Header
