# Contributing to web-text

感谢你愿意为 web-text 贡献力量！🎉

## 开发环境

```bash
npm install
npm run dev      # http://localhost:3000
```

## 提交 PR 前

1. **Fork 并创建分支**：`git checkout -b feat/your-feature`
2. **代码规范**：
   - TypeScript 严格模式，保持现有组件风格
   - 新 UI 文案必须**同时添加中英文**（`src/data/i18n.ts` 的 `STRINGS_ZH` 和 `STRINGS_EN`）
   - 纯逻辑（存储、工具函数）保持无副作用，便于测试
3. **本地验证必须通过**：
   ```bash
   npm run lint
   npm run build
   ```
4. **写清楚 PR 描述**：改了什么、为什么改、如何验证

## 提 Issue

- 使用仓库内置的 Bug Report / Feature Request 模板
- Bug 请附上：浏览器与版本、复现步骤、期望行为、实际行为

## 设计原则

- **纯本地**：所有数据留在用户浏览器，不引入后端或第三方存储
- **隐私优先**：任何涉及数据的功能变更都要考虑隐私影响
- **简洁**：功能宁缺毋滥，保持编辑器轻量
