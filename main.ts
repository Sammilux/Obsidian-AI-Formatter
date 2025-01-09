import { 
  App, 
  Editor, 
  MarkdownView, 
  Modal, 
  Notice, 
  Plugin, 
  PluginSettingTab, 
  Setting,
  Element
} from 'obsidian';

declare module 'obsidian' {
  interface PluginSettingTab {
    containerEl: Element;
  }
}

type AISource = 'none' | 'chatgpt' | 'claude';

interface FormatCleanerSettings {
  removeMarkdown: boolean;
  unifyListMarker: boolean;
  autoFormatHeadings: boolean;
  customReplacements: Array<{from: string, to: string}>;
  defaultAISource: AISource;
  wechatReady: boolean;
  aiPatterns: {
    chatgpt: Array<{from: string, to: string}>;
    claude: Array<{from: string, to: string}>;
  };
}

const DEFAULT_SETTINGS: FormatCleanerSettings = {
  removeMarkdown: true,
  unifyListMarker: true,
  autoFormatHeadings: true,
  customReplacements: [
    { from: '**', to: '' },
    { from: '*', to: '' },
    { from: '_', to: '' }
  ],
  defaultAISource: 'none',
  wechatReady: false,
  aiPatterns: {
    chatgpt: [
      { from: 'Sure, here\'s an example:', to: '' },
      { from: 'Of course!', to: '' },
      { from: 'Here you go:', to: '' }
    ],
    claude: [
      { from: 'Here\'s', to: '' },
      { from: 'Certainly!', to: '' },
      { from: 'I\'d be happy to help.', to: '' }
    ]
  }
};

export default class FormatCleanerPlugin extends Plugin {
  settings: FormatCleanerSettings;

  async onload() {
    await this.loadSettings();

    // 添加命令到命令面板
    this.addCommand({
      id: 'clean-format',
      name: '清理格式',
      editorCallback: (editor: Editor) => {
        const text = editor.getValue();
        const cleaned = this.cleanFormat(text);
        editor.setValue(cleaned);
        new Notice('格式已清理');
      }
    });

    // 添加清理选中文本的命令
    this.addCommand({
      id: 'clean-selection',
      name: '清理选中文本格式',
      editorCallback: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection) {
          const cleaned = this.cleanFormat(selection);
          editor.replaceSelection(cleaned);
          new Notice('已清理选中文本格式');
        }
      }
    });

    // 添加快捷键命令来处理标题
    this.addCommand({
      id: 'format-as-h1',
      name: '格式化为一级标题',
      editorCallback: (editor: Editor) => this.formatAsHeading(editor, 1)
    });

    this.addCommand({
      id: 'format-as-h2',
      name: '格式化为二级标题',
      editorCallback: (editor: Editor) => this.formatAsHeading(editor, 2)
    });

    this.addCommand({
      id: 'format-as-h3',
      name: '格式化为三级标题',
      editorCallback: (editor: Editor) => this.formatAsHeading(editor, 3)
    });

    // 添加插件设置标签页
    this.addSettingTab(new FormatCleanerSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  cleanFormat(text: string): string {
    const paragraphs = text.split('\n');
    
    const cleanedParagraphs = paragraphs.map(para => {
      let cleaned = para.trim();
      
      // Apply AI-specific patterns first
      if (this.settings.defaultAISource !== 'none') {
        const patterns = this.settings.aiPatterns[this.settings.defaultAISource];
        patterns.forEach(({from, to}) => {
          const regex = new RegExp(this.escapeRegExp(from), 'g');
          cleaned = cleaned.replace(regex, to);
        });
      }

      if (this.settings.removeMarkdown) {
        // Apply custom replacement rules
        this.settings.customReplacements.forEach(({from, to}) => {
          const regex = new RegExp(this.escapeRegExp(from), 'g');
          cleaned = cleaned.replace(regex, to);
        });
      }
      
      if (this.settings.unifyListMarker) {
        // Unify list markers
        cleaned = cleaned.replace(/^[-*]\s+/, '• ');
      }
      
      if (this.settings.autoFormatHeadings && cleaned.startsWith('#')) {
        // Normalize heading format
        cleaned = cleaned.replace(/^(#{1,6})\s*/, '$1 ');
      }

      // Apply WeChat-specific formatting if enabled
      if (this.settings.wechatReady) {
        // Remove extra spaces around Chinese punctuation
        cleaned = cleaned.replace(/\s*([，。！？；：、])\s*/g, '$1');
        // Ensure proper spacing between Chinese and English/numbers
        cleaned = cleaned.replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, '$1 $2');
        cleaned = cleaned.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, '$1 $2');
        // Remove multiple consecutive empty lines
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
      }
      
      return cleaned;
    });
    
    const result = cleanedParagraphs
      .filter(para => para.length > 0)
      .join('\n\n');
      
    return this.settings.wechatReady 
      ? result.trim().replace(/\n{3,}/g, '\n\n') // Final cleanup for WeChat
      : result;
  }

  formatAsHeading(editor: Editor, level: number) {
    const selection = editor.getSelection();
    const line = editor.getLine(editor.getCursor().line);
    
    // 如果有选中文本，只处理选中的部分
    if (selection) {
      const headingMark = '#'.repeat(level) + ' ';
      const newText = selection.replace(/^#+\s*/, ''); // 移除已有的标题标记
      editor.replaceSelection(headingMark + newText);
    } 
    // 否则处理当前行
    else {
      const headingMark = '#'.repeat(level) + ' ';
      const newLine = line.replace(/^#+\s*/, ''); // 移除已有的标题标记
      editor.setLine(editor.getCursor().line, headingMark + newLine);
    }
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

class FormatCleanerSettingTab extends PluginSettingTab {
  plugin: FormatCleanerPlugin;

  constructor(app: App, plugin: FormatCleanerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const {containerEl} = this;
    containerEl.empty();

    // Basic Settings Section
    containerEl.createEl('h2', {text: '基础设置'});

    new Setting(containerEl)
      .setName('移除 Markdown 标记')
      .setDesc('清除文本中的加粗、斜体等 Markdown 标记')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.removeMarkdown)
        .onChange(async (value) => {
          this.plugin.settings.removeMarkdown = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('统一列表标记')
      .setDesc('将不同的列表标记统一转换为中文圆点')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.unifyListMarker)
        .onChange(async (value) => {
          this.plugin.settings.unifyListMarker = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('自动格式化标题')
      .setDesc('自动规范化标题格式（确保#后有空格）')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoFormatHeadings)
        .onChange(async (value) => {
          this.plugin.settings.autoFormatHeadings = value;
          await this.plugin.saveSettings();
        }));

    // Third-Party/AI Settings Section
    containerEl.createEl('h2', {text: 'AI 与第三方平台设置'});

    new Setting(containerEl)
      .setName('默认 AI 来源')
      .setDesc('选择默认的 AI 来源以应用相应的清理规则')
      .addDropdown(drop => {
        drop.addOption('none', '无');
        drop.addOption('chatgpt', 'ChatGPT');
        drop.addOption('claude', 'Claude');
        drop.setValue(this.plugin.settings.defaultAISource);
        drop.onChange(async (value: AISource) => {
          this.plugin.settings.defaultAISource = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName('微信公众号格式')
      .setDesc('应用微信公众号特定的格式规则')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.wechatReady)
        .onChange(async (value) => {
          this.plugin.settings.wechatReady = value;
          await this.plugin.saveSettings();
        }));

    // AI-Specific Patterns Section
    containerEl.createEl('h2', {text: 'AI 特定替换规则'});
    
    // ChatGPT Patterns
    containerEl.createEl('h3', {text: 'ChatGPT 规则'});
    this.plugin.settings.aiPatterns.chatgpt.forEach((pattern, index) => {
      new Setting(containerEl)
        .addText(text => text
          .setPlaceholder('要替换的文本')
          .setValue(pattern.from)
          .onChange(async (value) => {
            this.plugin.settings.aiPatterns.chatgpt[index].from = value;
            await this.plugin.saveSettings();
          }))
        .addText(text => text
          .setPlaceholder('替换为')
          .setValue(pattern.to)
          .onChange(async (value) => {
            this.plugin.settings.aiPatterns.chatgpt[index].to = value;
            await this.plugin.saveSettings();
          }))
        .addButton(button => button
          .setButtonText('删除')
          .onClick(async () => {
            this.plugin.settings.aiPatterns.chatgpt.splice(index, 1);
            await this.plugin.saveSettings();
            this.display();
          }));
    });

    new Setting(containerEl)
      .addButton(button => button
        .setButtonText('添加 ChatGPT 规则')
        .onClick(async () => {
          this.plugin.settings.aiPatterns.chatgpt.push({from: '', to: ''});
          await this.plugin.saveSettings();
          this.display();
        }));

    // Claude Patterns
    containerEl.createEl('h3', {text: 'Claude 规则'});
    this.plugin.settings.aiPatterns.claude.forEach((pattern, index) => {
      new Setting(containerEl)
        .addText(text => text
          .setPlaceholder('要替换的文本')
          .setValue(pattern.from)
          .onChange(async (value) => {
            this.plugin.settings.aiPatterns.claude[index].from = value;
            await this.plugin.saveSettings();
          }))
        .addText(text => text
          .setPlaceholder('替换为')
          .setValue(pattern.to)
          .onChange(async (value) => {
            this.plugin.settings.aiPatterns.claude[index].to = value;
            await this.plugin.saveSettings();
          }))
        .addButton(button => button
          .setButtonText('删除')
          .onClick(async () => {
            this.plugin.settings.aiPatterns.claude.splice(index, 1);
            await this.plugin.saveSettings();
            this.display();
          }));
    });

    new Setting(containerEl)
      .addButton(button => button
        .setButtonText('添加 Claude 规则')
        .onClick(async () => {
          this.plugin.settings.aiPatterns.claude.push({from: '', to: ''});
          await this.plugin.saveSettings();
          this.display();
        }));

    // Custom Replacements Section
    containerEl.createEl('h2', {text: '自定义替换规则'});

    this.plugin.settings.customReplacements.forEach((replacement, index) => {
      const setting = new Setting(containerEl)
        .addText(text => text
          .setPlaceholder('要替换的文本')
          .setValue(replacement.from)
          .onChange(async (value) => {
            this.plugin.settings.customReplacements[index].from = value;
            await this.plugin.saveSettings();
          }))
        .addText(text => text
          .setPlaceholder('替换为')
          .setValue(replacement.to)
          .onChange(async (value) => {
            this.plugin.settings.customReplacements[index].to = value;
            await this.plugin.saveSettings();
          }))
        .addButton(button => button
          .setButtonText('删除')
          .onClick(async () => {
            this.plugin.settings.customReplacements.splice(index, 1);
            await this.plugin.saveSettings();
            this.display();
          }));
    });

    new Setting(containerEl)
      .addButton(button => button
        .setButtonText('添加替换规则')
        .onClick(async () => {
          this.plugin.settings.customReplacements.push({from: '', to: ''});
          await this.plugin.saveSettings();
          this.display();
        }));
  }
}
