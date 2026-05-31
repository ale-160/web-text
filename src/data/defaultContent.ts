/**
 * 默认 Markdown 内容
 */

import { Strings } from './i18n';

export const getDefaultContent = (S: Strings): string => `# [${S.welcomeTitle}](https://ale160.com)

## ${S.featuresTitle}

${S.features.map(f => `- **${f}**`).join('\n')}

## ${S.codeHighlightTitle}

### ${S.javascript}

\`\`\`javascript
// JavaScript 示例
function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet('World');
console.log(message);
\`\`\`

### ${S.typescript}

\`\`\`typescript
// TypeScript 示例
interface User {
  id: number;
  name: string;
}

function getUser(id: number): User {
  return { id, name: 'John' };
}
\`\`\`

### ${S.python}

\`\`\`python
# Python 示例
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
\`\`\`

## ${S.otherMarkdownFeatures}

> ${S.blockquote}

- ${S.listItem} 1
- ${S.listItem} 2
  - ${S.listItem}

1. ${S.orderedList}
2. ${S.orderedList}

**粗体** 和 *斜体* 以及 ~~删除线~~

\`${S.inlineCode}\`

---

${S.startEditing} 👇
`;
