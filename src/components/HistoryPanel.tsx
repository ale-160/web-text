

interface HistoryEntry {
  timestamp: number
  content: string
}

interface HistoryPanelProps {
  open: boolean
  history: HistoryEntry[]
  onSelect: (content: string) => void
  onClose: () => void
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ open, history, onSelect, onClose }) => {
  const formatTime = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    const time = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    if (isToday) return `今天 ${time}`
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) + ` ${time}`
  }

  return (
    <div className={`history-panel${open ? ' open' : ''}`}>
      <div className="history-header">
        <h2>🕐 历史版本</h2>
        <button className="btn btn-icon" onClick={onClose}>✕</button>
      </div>
      <div className="history-list">
        {history.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            暂无历史记录
          </div>
        ) : (
          history.map((entry, index) => (
            <div
              key={index}
              className="history-item"
              onClick={() => onSelect(entry.content)}
            >
              <div className="history-item-time">{formatTime(entry.timestamp)}</div>
              <div className="history-item-preview">
                {entry.content.slice(0, 100).replace(/[#*`>\-]/g, '') || '空内容'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default HistoryPanel
