import { 
  App, 
  Editor, 
  MarkdownView, 
  Modal, 
  Notice, 
  Plugin, 
  PluginSettingTab, 
  Setting
} from 'obsidian';
import { LocalizedStrings, EnglishStrings, ChineseStrings } from './src/i18n';

type AISource = 'none' | 'chatgpt' | 'claude';

interface FormatCleanerSettings {
  removeMarkdown: boolean;
  unifyListMarker: boolean;
  autoFormatHeadings: boolean;
  customReplacements: Array<{from: string, to: string}>;
  defaultAISource: AISource;
  wechatReady: boolean;
  language: 'en' | 'zh';
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
  language: 'zh',
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
  // Removed incorrect type declaration as it's already defined in Plugin class
  declare saveData: (data: any) => Promise<void>;
  declare loadData: () => Promise<any>;
  settings: FormatCleanerSettings;
  strings: LocalizedStrings;
  private compiledPatterns: {
    chatgpt: Array<{regex: RegExp, to: string}>;
    claude: Array<{regex: RegExp, to: string}>;
    custom: Array<{regex: RegExp, to: string}>;
  };
  
  // Ensure proper type inheritance
  constructor(app: App, manifest: any) {
    super(app, manifest);
    this.settings = DEFAULT_SETTINGS;
    this.strings = this.settings.language === 'en' ? EnglishStrings : ChineseStrings;
  }

  async onload() {
    try {
      await this.loadSettings();
      this.compilePatterns();
    } catch (error) {
      console.error('Failed to initialize plugin:', error);
      new Notice('Failed to initialize plugin. Some features may be unavailable.');
    }

    // 添加命令到命令面板
    this.addCommand({
      id: 'clean-format',
      name: this.strings.cleanFormat,
      editorCallback: (editor: Editor) => {
        try {
          const text = editor.getValue();
          const { result: cleaned, stats } = this.cleanFormat(text);
          editor.setValue(cleaned);
          new Notice(this.strings.formatCleaned({count: stats.replacements}));
        } catch (error) {
          console.error('Failed to clean format:', error);
          new Notice(this.strings.errorSaveSettings);
        }
      }
    });

    // 添加清理选中文本的命令
    this.addCommand({
      id: 'clean-selection',
      name: this.strings.cleanSelection,
      editorCallback: (editor: Editor) => {
        try {
          const selection = editor.getSelection();
          if (selection) {
            const { result: cleaned, stats } = this.cleanFormat(selection);
            editor.replaceSelection(cleaned);
            new Notice(this.strings.selectionCleaned({count: stats.replacements}));
          }
        } catch (error) {
          console.error('Failed to clean selection format:', error);
          new Notice(this.strings.errorSaveSettings);
        }
      }
    });

    // 添加快捷键命令来处理标题
    this.addCommand({
      id: 'format-as-h1',
      name: this.strings.formatAsH1,
      editorCallback: (editor: Editor) => this.formatAsHeading(editor, 1)
    });

    this.addCommand({
      id: 'format-as-h2',
      name: this.strings.formatAsH2,
      editorCallback: (editor: Editor) => this.formatAsHeading(editor, 2)
    });

    this.addCommand({
      id: 'format-as-h3',
      name: this.strings.formatAsH3,
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
    this.compilePatterns();
  }

  private compilePatterns() {
    // Compile AI patterns
    this.compiledPatterns = {
      chatgpt: this.settings.aiPatterns.chatgpt.map(({from, to}) => ({
        regex: new RegExp(this.escapeRegExp(from), 'g'),
        to
      })),
      claude: this.settings.aiPatterns.claude.map(({from, to}) => ({
        regex: new RegExp(this.escapeRegExp(from), 'g'),
        to
      })),
      custom: this.settings.customReplacements.map(({from, to}) => ({
        regex: new RegExp(this.escapeRegExp(from), 'g'),
        to
      }))
    };
  }

  cleanFormat(text: string): { result: string; stats: { replacements: number } } {
    const paragraphs = text.split('\n');
    const stats = { replacements: 0 };
    
    // Show progress notice for large documents
    if (paragraphs.length > 500) {
      new Notice(this.strings.processingLargeDoc);
    }
    
    const cleanedParagraphs = paragraphs.map(para => {
      let cleaned = para.trim();
      
      // Apply AI-specific patterns first
      if (this.settings.defaultAISource !== 'none') {
        this.compiledPatterns[this.settings.defaultAISource].forEach(({regex, to}) => {
          const matches = cleaned.match(regex);
          if (matches) {
            stats.replacements += matches.length;
            cleaned = cleaned.replace(regex, to);
          }
        });
      }

      if (this.settings.removeMarkdown) {
        // Apply custom replacement rules
        this.compiledPatterns.custom.forEach(({regex, to}) => {
          const matches = cleaned.match(regex);
          if (matches) {
            stats.replacements += matches.length;
            cleaned = cleaned.replace(regex, to);
          }
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
      
    const finalResult = this.settings.wechatReady 
      ? result.trim().replace(/\n{3,}/g, '\n\n') // Final cleanup for WeChat
      : result;
      
    return { result: finalResult, stats };
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

  private isValidRegex(pattern: string): boolean {
    try {
      // Test pattern compilation
      new RegExp(pattern);
      
      // Check for common problematic patterns
      if (pattern.length > 1000) {
        return false; // Pattern too long
      }
      if ((pattern.match(/\(/g) || []).length > 50) {
        return false; // Too many groups
      }
      if (pattern.includes('(.*)') || pattern.includes('(.+)')) {
        return false; // Unrestricted wildcards
      }
      
      return true;
    } catch (e) {
      return false;
    }
  }

  private validateAndApplyRegex(text: string, pattern: string, replacement: string, stats: { replacements: number }): string {
    try {
      if (!this.isValidRegex(this.escapeRegExp(pattern))) {
        new Notice(this.strings.invalidPattern({pattern}));
        return text;
      }
      const regex = new RegExp(this.escapeRegExp(pattern), 'g');
      const matches = text.match(regex);
      if (matches) {
        stats.replacements += matches.length;
      }
      return text.replace(regex, replacement);
    } catch (e) {
      console.error('Error applying regex:', e);
      new Notice(this.strings.failedToApplyPattern({pattern}));
      return text;
    }
  }
}

class FormatCleanerSettingTab extends PluginSettingTab {
  plugin: FormatCleanerPlugin;
  private chatgptContainer: HTMLDivElement;
  private claudeContainer: HTMLDivElement;
  private customContainer: HTMLDivElement;
  private settingRows: Map<string, HTMLElement>;

  constructor(app: App, plugin: FormatCleanerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.settingRows = new Map();
  }

  private createSettingRow(container: HTMLElement, pattern: {from: string, to: string}, index: number, type: 'chatgpt' | 'claude' | 'custom'): HTMLElement {
    const row = container.createDiv();
    const setting = new Setting(row);
    
    setting
      .addText(text => text
        .setPlaceholder(this.plugin.strings.fromText)
        .setValue(pattern.from)
        .onChange(async (value) => {
          try {
            if (type === 'custom') {
              this.plugin.settings.customReplacements[index].from = value;
            } else {
              this.plugin.settings.aiPatterns[type][index].from = value;
            }
            await this.plugin.saveSettings();
          } catch (error) {
            console.error(`Failed to save ${type} pattern:`, error);
            new Notice(this.plugin.strings.errorSaveSettings);
          }
        }))
      .addText(text => text
        .setPlaceholder(this.plugin.strings.toText)
        .setValue(pattern.to)
        .onChange(async (value) => {
          try {
            if (type === 'custom') {
              this.plugin.settings.customReplacements[index].to = value;
            } else {
              this.plugin.settings.aiPatterns[type][index].to = value;
            }
            await this.plugin.saveSettings();
          } catch (error) {
            console.error(`Failed to save ${type} pattern:`, error);
            new Notice(this.plugin.strings.errorSaveSettings);
          }
        }))
      .addButton(button => button
        .setButtonText(this.plugin.strings.deleteRule)
        .onClick(async () => {
          try {
            if (type === 'custom') {
              this.plugin.settings.customReplacements.splice(index, 1);
            } else {
              this.plugin.settings.aiPatterns[type].splice(index, 1);
            }
            await this.plugin.saveSettings();
            row.remove();
            this.settingRows.delete(`${type}-${index}`);
            this.updatePatternIndices(container, type);
          } catch (error) {
            console.error(`Failed to delete ${type} pattern:`, error);
            new Notice(this.plugin.strings.errorSaveSettings);
          }
        }));
    
    this.settingRows.set(`${type}-${index}`, row);
    return row;
  }

  private updatePatternIndices(container: HTMLElement, type: 'chatgpt' | 'claude' | 'custom'): void {
    const patterns = type === 'custom' 
      ? this.plugin.settings.customReplacements 
      : this.plugin.settings.aiPatterns[type];
    
    container.empty();
    patterns.forEach((pattern, index) => {
      this.createSettingRow(container, pattern, index, type);
    });
  }

  display(): void {
    const {containerEl} = this;
    containerEl.empty();

    // Language Settings
    new Setting(containerEl)
      .setName('Language / 语言')
      .setDesc('Select interface language / 选择界面语言')
      .addDropdown(drop => {
        drop.addOption('en', 'English');
        drop.addOption('zh', '中文');
        drop.setValue(this.plugin.settings.language);
        drop.onChange(async (value: 'en' | 'zh') => {
          try {
            this.plugin.settings.language = value;
            this.plugin.strings = value === 'en' ? EnglishStrings : ChineseStrings;
            await this.plugin.saveSettings();
            this.display(); // Refresh UI with new language
          } catch (error) {
            console.error('Failed to save language setting:', error);
            new Notice(this.plugin.strings.errorSaveSettings);
          }
        });
      });

    // Basic Settings Section
    containerEl.createEl('h2', {text: this.plugin.strings.basicSettings});

    new Setting(containerEl)
      .setName(this.plugin.strings.removeMarkdown)
      .setDesc(this.plugin.strings.removeMarkdownDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.removeMarkdown)
        .onChange(async (value) => {
          try {
            this.plugin.settings.removeMarkdown = value;
            await this.plugin.saveSettings();
          } catch (error) {
            console.error('Failed to save removeMarkdown setting:', error);
            new Notice(this.plugin.strings.errorSaveSettings);
          }
        }));

    new Setting(containerEl)
      .setName(this.plugin.strings.unifyListMarker)
      .setDesc(this.plugin.strings.unifyListMarkerDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.unifyListMarker)
        .onChange(async (value) => {
          try {
            this.plugin.settings.unifyListMarker = value;
            await this.plugin.saveSettings();
          } catch (error) {
            console.error('Failed to save unifyListMarker setting:', error);
            new Notice(this.plugin.strings.errorSaveSettings);
          }
        }));

    new Setting(containerEl)
      .setName(this.plugin.strings.autoFormatHeadings)
      .setDesc(this.plugin.strings.autoFormatHeadingsDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoFormatHeadings)
        .onChange(async (value) => {
          try {
            this.plugin.settings.autoFormatHeadings = value;
            await this.plugin.saveSettings();
          } catch (error) {
            console.error('Failed to save autoFormatHeadings setting:', error);
            new Notice(this.plugin.strings.errorSaveSettings);
          }
        }));

    // Third-Party/AI Settings Section
    containerEl.createEl('h2', {text: this.plugin.strings.aiSettings});

    new Setting(containerEl)
      .setName(this.plugin.strings.defaultAISource)
      .setDesc(this.plugin.strings.defaultAISourceDesc)
      .addDropdown(drop => {
        drop.addOption('none', this.plugin.strings.none);
        drop.addOption('chatgpt', 'ChatGPT');
        drop.addOption('claude', 'Claude');
        drop.setValue(this.plugin.settings.defaultAISource);
        drop.onChange(async (value: AISource) => {
          try {
            this.plugin.settings.defaultAISource = value;
            await this.plugin.saveSettings();
          } catch (error) {
            console.error('Failed to save AI source setting:', error);
            new Notice('保存 AI 来源设置失败。请重试。');
          }
        });
      });

    new Setting(containerEl)
      .setName('微信公众号格式')
      .setDesc('应用微信公众号特定的格式规则')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.wechatReady)
        .onChange(async (value) => {
          try {
            this.plugin.settings.wechatReady = value;
            await this.plugin.saveSettings();
          } catch (error) {
            console.error('Failed to save WeChat format setting:', error);
            new Notice('保存微信格式设置失败。请重试。');
          }
        }));

    // AI-Specific Patterns Section
    containerEl.createEl('h2', {text: 'AI 特定替换规则'});
    
    // ChatGPT Patterns
    containerEl.createEl('h3', {text: this.plugin.strings.chatgptRules});
    this.chatgptContainer = containerEl.createDiv();
    this.plugin.settings.aiPatterns.chatgpt.forEach((pattern, index) => {
      this.createSettingRow(this.chatgptContainer, pattern, index, 'chatgpt');
    });

    new Setting(containerEl)
      .addButton(button => button
        .setButtonText(this.plugin.strings.addRule)
        .onClick(async () => {
          try {
            this.plugin.settings.aiPatterns.chatgpt.push({from: '', to: ''});
            await this.plugin.saveSettings();
            const index = this.plugin.settings.aiPatterns.chatgpt.length - 1;
            this.createSettingRow(this.chatgptContainer, {from: '', to: ''}, index, 'chatgpt');
          } catch (error) {
            console.error('Failed to add ChatGPT rule:', error);
            new Notice(this.plugin.strings.errorSaveSettings);
          }
        }));

    // Claude Patterns
    containerEl.createEl('h3', {text: this.plugin.strings.claudeRules});
    this.claudeContainer = containerEl.createDiv();
    this.plugin.settings.aiPatterns.claude.forEach((pattern, index) => {
      this.createSettingRow(this.claudeContainer, pattern, index, 'claude');
    });

    new Setting(containerEl)
      .addButton(button => button
        .setButtonText(this.plugin.strings.addRule)
        .onClick(async () => {
          try {
            this.plugin.settings.aiPatterns.claude.push({from: '', to: ''});
            await this.plugin.saveSettings();
            const index = this.plugin.settings.aiPatterns.claude.length - 1;
            this.createSettingRow(this.claudeContainer, {from: '', to: ''}, index, 'claude');
          } catch (error) {
            console.error('Failed to add Claude rule:', error);
            new Notice(this.plugin.strings.errorSaveSettings);
          }
        }));

    // Custom Replacements Section
    containerEl.createEl('h2', {text: this.plugin.strings.customRules});
    this.customContainer = containerEl.createDiv();
    this.plugin.settings.customReplacements.forEach((pattern, index) => {
      this.createSettingRow(this.customContainer, pattern, index, 'custom');
    });

    new Setting(containerEl)
      .addButton(button => button
        .setButtonText(this.plugin.strings.addRule)
        .onClick(async () => {
          try {
            this.plugin.settings.customReplacements.push({from: '', to: ''});
            await this.plugin.saveSettings();
            const index = this.plugin.settings.customReplacements.length - 1;
            this.createSettingRow(this.customContainer, {from: '', to: ''}, index, 'custom');
          } catch (error) {
            console.error('Failed to add custom rule:', error);
            new Notice(this.plugin.strings.errorSaveSettings);
          }
        }));
  }
}
