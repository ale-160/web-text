/**
 * Markdown 语法示例数据
 */

import { Language } from './i18n';

export interface MarkdownExample {
  id: string;
  title: string;
  description: string;
  markdown: string;
  tags: string[];
}

export const getMarkdownExamples = (lang: Language): MarkdownExample[] => [
  {
    id: 'headings',
    title: lang === 'zh' ? '标题 (Headings)' : 'Headings',
    description: lang === 'zh' ? '使用 # 符号创建不同层级的标题，共 6 级' : 'Create headings using # symbols, up to 6 levels',
    markdown: lang === 'zh' 
      ? '# 一级标题\n## 二级标题\n### 三级标题\n#### 四级标题\n##### 五级标题\n###### 六级标题'
      : '# Heading 1\n## Heading 2\n### Heading 3\n#### Heading 4\n##### Heading 5\n###### Heading 6',
    tags: [lang === 'zh' ? '基础' : 'Basic']
  },
  {
    id: 'emphasis',
    title: lang === 'zh' ? '强调 (Emphasis)' : 'Emphasis',
    description: lang === 'zh' ? '使用 * 或 _ 进行斜体，** 或 __ 进行粗体' : 'Use * or _ for italics, ** or __ for bold',
    markdown: lang === 'zh'
      ? '**粗体文字**\n*斜体文字*\n***粗斜体文字***\n~~删除线文字~~'
      : '**Bold text**\n*Italic text***\n***Bold-italic text***\n~~Strikethrough text~~',
    tags: [lang === 'zh' ? '基础' : 'Basic']
  },
  {
    id: 'paragraphs',
    title: lang === 'zh' ? '段落和换行 (Paragraphs and Line Breaks)' : 'Paragraphs and Line Breaks',
    description: lang === 'zh' ? '使用空行分隔段落，单个回车会被合并为空格，双空格+回车可强制换行' : 'Separate paragraphs with blank lines, single enter is merged as space, two spaces+enter for line break',
    markdown: lang === 'zh'
      ? '这是第一个段落。\n\n这是第二个段落。\n\n这是一个有换行的段落：\n这行没有换行。  \n这行换行了（双空格+回车）。'
      : 'This is the first paragraph.\n\nThis is the second paragraph.\n\nThis is a paragraph with line breaks:\nThis line doesn\'t break.  \nThis line breaks (two spaces+enter).',
    tags: [lang === 'zh' ? '基础' : 'Basic']
  },
  {
    id: 'blockquotes',
    title: lang === 'zh' ? '引用 (Blockquotes)' : 'Blockquotes',
    description: lang === 'zh' ? '使用 > 符号创建引用块，支持嵌套' : 'Use > symbols to create quote blocks, supports nesting',
    markdown: lang === 'zh'
      ? '> 这是一个引用块\n> \n> 可以包含多行\n> > 也可以嵌套引用'
      : '> This is a quote block\n> \n> Can span multiple lines\n> > Can also be nested',
    tags: [lang === 'zh' ? '基础' : 'Basic']
  },
  {
    id: 'lists',
    title: lang === 'zh' ? '列表 (Lists)' : 'Lists',
    description: lang === 'zh' ? '无序列表和有序列表，支持嵌套' : 'Unordered and ordered lists, supports nesting',
    markdown: lang === 'zh'
      ? '- 无序列表项 1\n- 无序列表项 2\n  - 嵌套项 1\n  - 嵌套项 2\n\n1. 有序列表项 1\n2. 有序列表项 2\n3. 有序列表项 3'
      : '- Unordered item 1\n- Unordered item 2\n  - Nested item 1\n  - Nested item 2\n\n1. Ordered item 1\n2. Ordered item 2\n3. Ordered item 3',
    tags: [lang === 'zh' ? '基础' : 'Basic']
  },
  {
    id: 'tasklists',
    title: lang === 'zh' ? '任务列表 (Task Lists)' : 'Task Lists',
    description: lang === 'zh' ? '创建待办任务列表' : 'Create todo task lists',
    markdown: lang === 'zh'
      ? '- [x] 已完成的任务\n- [ ] 待办任务\n- [ ] 另一个待办任务'
      : '- [x] Completed task\n- [ ] Todo task\n- [ ] Another todo task',
    tags: [lang === 'zh' ? '高级' : 'Advanced']
  },
  {
    id: 'code',
    title: lang === 'zh' ? '代码 (Code)' : 'Code',
    description: lang === 'zh' ? '行内代码和代码块，支持语法高亮' : 'Inline code and code blocks, supports syntax highlighting',
    markdown: lang === 'zh'
      ? '行内代码：`console.log("Hello")`\n\n```javascript\n// JavaScript 示例\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n```'
      : 'Inline code: `console.log("Hello")`\n\n```javascript\n// JavaScript example\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n```',
    tags: [lang === 'zh' ? '代码' : 'Code']
  },
  {
    id: 'links',
    title: lang === 'zh' ? '链接 (Links)' : 'Links',
    description: lang === 'zh' ? '创建链接，可选择添加标题，悬停时显示' : 'Create links, optional title shows on hover',
    markdown: lang === 'zh'
      ? '[普通链接](https://ale160.com)\n[带标题的链接](https://ale160.com "访问 ale160.com") - 悬停查看标题'
      : '[Regular link](https://ale160.com)\n[Link with title](https://ale160.com "Visit ale160.com") - hover to see title',
    tags: [lang === 'zh' ? '基础' : 'Basic']
  },
  {
    id: 'images',
    title: lang === 'zh' ? '图片 (Images)' : 'Images',
    description: lang === 'zh' ? '插入图片，与链接类似但加 ! 前缀，可添加替代文本和标题' : 'Insert images, like links with ! prefix, add alt text and optional title',
    markdown: lang === 'zh'
      ? '![ale160 Logo](https://ale160.com/favicon.png)\n![带标题的图片](https://ale160.com/favicon.png "ale160 logo") - 悬停查看标题'
      : '![ale160 Logo](https://ale160.com/favicon.png)\n![Image with title](https://ale160.com/favicon.png "ale160 logo") - hover to see title',
    tags: [lang === 'zh' ? '多媒体' : 'Media']
  },
  {
    id: 'tables',
    title: lang === 'zh' ? '表格 (Tables)' : 'Tables',
    description: lang === 'zh' ? '创建数据表格，支持对齐方式设置' : 'Create data tables, supports alignment settings',
    markdown: lang === 'zh'
      ? '| 左对齐 | 居中对齐 | 右对齐 |\n| :--- | :---: | ---: |\n| 单元格 | 单元格 | 单元格 |\n| 内容 | 内容 | 内容 |'
      : '| Left Align | Center Align | Right Align |\n| :--- | :---: | ---: |\n| Cell | Cell | Cell |\n| Content | Content | Content |',
    tags: [lang === 'zh' ? '高级' : 'Advanced']
  },
  {
    id: 'hr',
    title: lang === 'zh' ? '分隔线 (Horizontal Rules)' : 'Horizontal Rules',
    description: lang === 'zh' ? '使用三个或更多的 -、* 或 _ 创建分隔线' : 'Use three or more -, *, or _ to create horizontal rules',
    markdown: lang === 'zh'
      ? '内容 1\n\n---\n\n内容 2\n\n***\n\n内容 3\n\n___'
      : 'Content 1\n\n---\n\nContent 2\n\n***\n\nContent 3\n\n___',
    tags: [lang === 'zh' ? '基础' : 'Basic']
  },
  {
    id: 'escaping',
    title: lang === 'zh' ? '转义字符 (Escaping)' : 'Escaping Characters',
    description: lang === 'zh' ? '使用反斜杠转义特殊字符' : 'Use backslashes to escape special characters',
    markdown: lang === 'zh'
      ? '\\* 这不是斜体 \\*\n\\- 这不是列表项 \\-\n\\# 这不是标题 #\n\\` 这不是代码 \\`'
      : '\\* This is not italic \\*\n\\- This is not a list item \\-\n\\# This is not a heading #\n\\` This is not code \\`',
    tags: [lang === 'zh' ? '基础' : 'Basic']
  },
];
