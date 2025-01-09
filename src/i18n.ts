export type MessageFormatter = (params: { [key: string]: string | number }) => string;

export interface LocalizedStrings {
  // Command names
  cleanFormat: string;
  cleanSelection: string;
  formatAsH1: string;
  formatAsH2: string;
  formatAsH3: string;
  none: string;

  // Settings
  basicSettings: string;
  removeMarkdown: string;
  removeMarkdownDesc: string;
  unifyListMarker: string;
  unifyListMarkerDesc: string;
  autoFormatHeadings: string;
  autoFormatHeadingsDesc: string;

  // AI Settings
  aiSettings: string;
  defaultAISource: string;
  defaultAISourceDesc: string;
  wechatFormat: string;
  wechatFormatDesc: string;
  aiPatterns: string;
  chatgptRules: string;
  claudeRules: string;

  // Custom Rules
  customRules: string;
  addRule: string;
  deleteRule: string;
  fromText: string;
  toText: string;

  // Static Notices
  processingLargeDoc: string;

  // Error Messages
  errorSaveSettings: string;
  errorSaveAISource: string;
  errorSaveWeChat: string;
  errorSaveChatGPT: string;
  errorSaveClaude: string;

  // Dynamic Messages
  formatCleaned: MessageFormatter;
  selectionCleaned: MessageFormatter;
  invalidPattern: MessageFormatter;
  failedToApplyPattern: MessageFormatter;
}

export const EnglishStrings: LocalizedStrings = {
  // Command names
  cleanFormat: 'Clean Format',
  cleanSelection: 'Clean Selection',
  formatAsH1: 'Format as H1',
  formatAsH2: 'Format as H2',
  formatAsH3: 'Format as H3',
  none: 'None',

  // Settings
  basicSettings: 'Basic Settings',
  removeMarkdown: 'Remove Markdown',
  removeMarkdownDesc: 'Clear markdown emphasis markers (bold, italic, etc.)',
  unifyListMarker: 'Unify List Markers',
  unifyListMarkerDesc: 'Convert different list markers to bullet points',
  autoFormatHeadings: 'Auto Format Headings',
  autoFormatHeadingsDesc: 'Ensure space after # in headings',

  // AI Settings
  aiSettings: 'AI & Third-Party Settings',
  defaultAISource: 'Default AI Source',
  defaultAISourceDesc: 'Select default AI source for cleaning rules',
  wechatFormat: 'WeChat Format',
  wechatFormatDesc: 'Apply WeChat-specific formatting rules',
  aiPatterns: 'AI-Specific Patterns',
  chatgptRules: 'ChatGPT Rules',
  claudeRules: 'Claude Rules',

  // Custom Rules
  customRules: 'Custom Rules',
  addRule: 'Add Rule',
  deleteRule: 'Delete',
  fromText: 'Text to replace',
  toText: 'Replace with',

  // Static Notices
  processingLargeDoc: 'Processing large document, please wait...',

  // Dynamic Messages
  formatCleaned: ({count}) => `Format cleaned with ${count} replacements`,
  selectionCleaned: ({count}) => `Selection cleaned with ${count} replacements`,
  invalidPattern: ({pattern}) => `Invalid or unsafe pattern: ${pattern}`,
  failedToApplyPattern: ({pattern}) => `Failed to apply pattern: ${pattern}`,

  // Error Messages
  errorSaveSettings: 'Failed to save settings. Please try again.',
  errorSaveAISource: 'Failed to save AI source setting. Please try again.',
  errorSaveWeChat: 'Failed to save WeChat format setting. Please try again.',
  errorSaveChatGPT: 'Failed to save ChatGPT rule. Please try again.',
  errorSaveClaude: 'Failed to save Claude rule. Please try again.'
};

export const ChineseStrings: LocalizedStrings = {
  // Command names
  cleanFormat: '清理格式',
  cleanSelection: '清理选中文本格式',
  formatAsH1: '格式化为一级标题',
  formatAsH2: '格式化为二级标题',
  formatAsH3: '格式化为三级标题',
  none: '无',

  // Settings
  basicSettings: '基础设置',
  removeMarkdown: '移除 Markdown 标记',
  removeMarkdownDesc: '清除文本中的加粗、斜体等 Markdown 标记',
  unifyListMarker: '统一列表标记',
  unifyListMarkerDesc: '将不同的列表标记统一转换为中文圆点',
  autoFormatHeadings: '自动格式化标题',
  autoFormatHeadingsDesc: '自动规范化标题格式（确保#后有空格）',

  // AI Settings
  aiSettings: 'AI 与第三方平台设置',
  defaultAISource: '默认 AI 来源',
  defaultAISourceDesc: '选择默认的 AI 来源以应用相应的清理规则',
  wechatFormat: '微信公众号格式',
  wechatFormatDesc: '应用微信公众号特定的格式规则',
  aiPatterns: 'AI 特定替换规则',
  chatgptRules: 'ChatGPT 规则',
  claudeRules: 'Claude 规则',

  // Custom Rules
  customRules: '自定义替换规则',
  addRule: '添加替换规则',
  deleteRule: '删除',
  fromText: '要替换的文本',
  toText: '替换为',

  // Static Notices
  processingLargeDoc: '正在处理大型文档，请稍候...',

  // Dynamic Messages
  formatCleaned: ({count}) => `格式已清理，共进行了 ${count} 处替换`,
  selectionCleaned: ({count}) => `已清理选中文本格式，共进行了 ${count} 处替换`,
  invalidPattern: ({pattern}) => `无效或不安全的模式：${pattern}`,
  failedToApplyPattern: ({pattern}) => `应用模式失败：${pattern}`,

  // Error Messages
  errorSaveSettings: '保存设置失败。请重试。',
  errorSaveAISource: '保存 AI 来源设置失败。请重试。',
  errorSaveWeChat: '保存微信格式设置失败。请重试。',
  errorSaveChatGPT: '保存 ChatGPT 规则失败。请重试。',
  errorSaveClaude: '保存 Claude 规则失败。请重试。'
};
