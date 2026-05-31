'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

interface Example {
  id: string;
  title: string;
  description: string;
  markdown: string;
  tags: string[];
}

export default function HelpPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 复制功能
  const handleCopy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, []);

  // Markdown 语法示例数据（包含完整语法）
  const getExamples = (lang: 'zh' | 'en'): Example[] => [
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
        : '**Bold text**\n*Italic text*\n***Bold-italic text***\n~~Strikethrough text~~',
      tags: [lang === 'zh' ? '基础' : 'Basic']
    },
    {
      id: 'paragraphs',
      title: lang === 'zh' ? '段落 (Paragraphs)' : 'Paragraphs',
      description: lang === 'zh' ? '使用空行分隔段落，使用两个空格+回车换行' : 'Separate paragraphs with blank lines, use two spaces+enter for line breaks',
      markdown: lang === 'zh'
        ? '这是第一个段落。\n\n这是第二个段落。\n\n这是一个有换行的段落，  \n第二行。'
        : 'This is the first paragraph.\n\nThis is the second paragraph.\n\nThis is a paragraph with line breaks,  \nsecond line.',
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
        ? '行内代码: `console.log("Hello")`\n\n```javascript\n// JavaScript 示例\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n```'
        : 'Inline code: `console.log("Hello")`\n\n```javascript\n// JavaScript example\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n```',
      tags: [lang === 'zh' ? '代码' : 'Code']
    },
    {
      id: 'links',
      title: lang === 'zh' ? '链接 (Links)' : 'Links',
      description: lang === 'zh' ? '创建普通链接和带标题的链接' : 'Create regular links and links with titles',
      markdown: lang === 'zh'
        ? '[普通链接](https://ale160.com)\n[带标题的链接](https://ale160.com "访问 ale160.com")'
        : '[Regular link](https://ale160.com)\n[Link with title](https://ale160.com "Visit ale160.com")',
      tags: [lang === 'zh' ? '基础' : 'Basic']
    },
    {
      id: 'images',
      title: lang === 'zh' ? '图片 (Images)' : 'Images',
      description: lang === 'zh' ? '插入图片，与链接类似但加 ! 前缀' : 'Insert images, similar to links but with ! prefix',
      markdown: lang === 'zh'
        ? '![ale160 Logo](https://ale160.com/favicon.ico)\n![带标题的图片](https://ale160.com/favicon.ico "ale160 logo")'
        : '![ale160 Logo](https://ale160.com/favicon.ico)\n![Image with title](https://ale160.com/favicon.ico "ale160 logo")',
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

  const examples = getExamples(language);
  
  // 根据主题设置样式类
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* 顶部导航 */}
      <header className={`border-b ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} px-6 py-4`}>
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t.back}</span>
            </button>
            <h1 className="text-2xl font-bold">{t.helpTitle}</h1>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：示例列表 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'zh' ? '语法示例' : 'Syntax Examples'}
            </h2>
            {examples.map((example) => (
              <div
                key={example.id}
                onClick={() => setSelectedExample(example)}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedExample?.id === example.id
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                    : isDark 
                      ? 'border-gray-800 hover:border-gray-700 hover:bg-gray-850 bg-gray-900' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100 bg-white'
                }`}
              >
                {/* 标题和标签 */}
                <div className="mb-2">
                  <h3 className="text-lg font-semibold">{example.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {example.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 text-xs rounded ${
                          isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 描述 */}
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {example.description}
                </p>
              </div>
            ))}
          </div>

          {/* 右侧：预览区 */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className={`border rounded-lg p-4 ${
              isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-lg font-semibold mb-4">
                {language === 'zh' ? '实时预览' : 'Live Preview'}
              </h3>
              
              {selectedExample ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`text-sm font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {language === 'zh' ? '示例' : 'Example'}
                      </h4>
                      <button
                        onClick={() => handleCopy(selectedExample.markdown, selectedExample.id)}
                        className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
                          isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                        }`}
                        title={language === 'zh' ? '复制示例' : 'Copy example'}
                      >
                        {copiedId === selectedExample.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className={`border rounded p-3 font-mono text-sm overflow-x-auto ${
                      isDark ? 'bg-gray-950 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}>
                      <pre className="whitespace-pre-wrap">{selectedExample.markdown}</pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={`text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {language === 'zh' ? '预览' : 'Preview'}
                    </h4>
                    <div className={`border rounded p-4 min-h-[200px] ${
                      isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'
                    }`}>
                      <div className={`prose max-w-none ${isDark ? 'prose-invert' : ''}`}>
                        <MDEditor.Markdown 
                          source={selectedExample.markdown}
                          data-color-mode={theme}
                          style={{ backgroundColor: 'transparent' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`text-center py-12 border rounded-lg ${
                  isDark ? 'text-gray-500 border-gray-800' : 'text-gray-400 border-gray-200'
                }`}>
                  <div>
                    <svg
                      className="w-16 h-16 mx-auto mb-4 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p>{language === 'zh' ? '点击左侧示例查看详情' : 'Click an example on the left to see details'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
