import React from 'react'
import { templates } from '../utils/templates'

interface TemplateModalProps {
  onSelect: (content: string) => void
  onClose: () => void
}

const TemplateModal: React.FC<TemplateModalProps> = ({ onSelect, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 选择模板</h2>
          <button className="btn btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="template-grid">
            {templates.map((tpl, index) => (
              <div
                key={index}
                className="template-card"
                onClick={() => onSelect(tpl.content)}
              >
                <h3>{tpl.icon} {tpl.name}</h3>
                <p>{tpl.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplateModal
