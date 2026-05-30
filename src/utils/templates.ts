export interface Template {
  name: string
  icon: string
  description: string
  content: string
}

export const templates: Template[] = [
  {
    name: '日记',
    icon: '📔',
    description: '个人日记模板，记录每日心情',
    content: `# 📔 日记

**日期**：${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
**天气**：☀️ / ⛅ / 🌧️ / ❄️
**心情**：😊 / 😐 / 😢

---

## 今日总结

> 在这里写下今天发生的事情...

## 感悟与思考

> 今天的收获和想法...

## 明日计划

- [ ] 任务一
- [ ] 任务二
- [ ] 任务三
`,
  },
  {
    name: '周报',
    icon: '📊',
    description: '工作周报模板，汇报本周进展',
    content: `# 📊 周报

**姓名**：xxx
**日期**：${new Date().toLocaleDateString('zh-CN')} - ${new Date(Date.now() + 7 * 86400000).toLocaleDateString('zh-CN')}
**部门**：xxx

---

## 本周完成

1. **任务一**：完成了 xxx 功能的开发
2. **任务二**：修复了 xxx 问题
3. **任务三**：完成了 xxx 文档的编写

## 进行中

- **任务四**：正在进行中，预计下周完成

## 下周计划

- [ ] 计划一
- [ ] 计划二
- [ ] 计划三

## 需要协助

> 如有需要协调的事项，在此列出

## 备注

> 其他需要说明的事项
`,
  },
  {
    name: 'README',
    icon: '📖',
    description: '项目 README 模板，标准开源格式',
    content: `# 项目名称

> 一句话描述你的项目

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ 特性

- 特性一
- 特性二
- 特性三

## 🚀 快速开始

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
\`\`\`

## 📖 使用方法

\`\`\`javascript
import { something } from 'your-package'

const result = something()
\`\`\`

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
`,
  },
  {
    name: '会议记录',
    icon: '📝',
    description: '会议纪要模板，记录关键讨论',
    content: `# 📝 会议记录

**会议主题**：xxx
**日期**：${new Date().toLocaleDateString('zh-CN')}
**参会人**：A、B、C
**记录人**：xxx

---

## 议题一：xxx

**讨论内容**：
> 记录讨论要点...

**结论**：
> 记录达成的结论...

## 议题二：xxx

**讨论内容**：
> 记录讨论要点...

**结论**：
> 记录达成的结论...

## 待办事项

| 事项 | 负责人 | 截止日期 | 状态 |
|------|--------|---------|------|
| xxx | A | xx/xx | ⏳ 进行中 |
| xxx | B | xx/xx | ⏳ 进行中 |

## 下次会议

- **时间**：待定
- **议题**：待定
`,
  },
  {
    name: '技术文档',
    icon: '🔧',
    description: '技术方案文档模板',
    content: `# 技术方案：xxx

**作者**：xxx
**日期**：${new Date().toLocaleDateString('zh-CN')}
**版本**：v1.0

---

## 1. 背景与目标

> 为什么要做这个？要解决什么问题？

## 2. 方案概述

> 整体技术方案是什么？

## 3. 技术选型

| 技术 | 选择 | 原因 |
|------|------|------|
| 框架 | xxx | 原因 |
| 数据库 | xxx | 原因 |

## 4. 详细设计

### 4.1 架构图

> 描述系统架构

### 4.2 接口设计

\`\`\`typescript
interface Example {
  id: string
  name: string
}
\`\`\`

## 5. 风险与应对

| 风险 | 影响 | 应对方案 |
|------|------|---------|
| xxx | 高/中/低 | xxx |

## 6. 里程碑

- [ ] 阶段一：xx/xx
- [ ] 阶段二：xx/xx
- [ ] 阶段三：xx/xx
`,
  },
  {
    name: '空白文档',
    icon: '📄',
    description: '从空白开始，自由创作',
    content: `# 标题

从这里开始...
`,
  },
]
