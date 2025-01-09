# Obsidian AI Content Formatter

A powerful Obsidian plugin that cleans and formats AI-generated content, optimizing it for various platforms including WeChat Official Accounts.

一个强大的 Obsidian 插件，用于清理和格式化 AI 生成的内容，针对微信公众号等平台进行优化。

## Features | 功能特点

- **AI Source-Specific Formatting** | **AI 来源特定格式化**
  - Optimized for ChatGPT and Claude outputs
  - Custom patterns for each AI source
  - 针对 ChatGPT 和 Claude 输出进行优化
  - 为每个 AI 来源提供自定义模式

- **Platform-Ready Formatting** | **平台专用格式化**
  - WeChat Official Account optimization
  - Proper spacing between Chinese and English text
  - Chinese punctuation handling
  - 微信公众号优化
  - 中英文之间正确间距
  - 中文标点符号处理

- **Markdown Cleanup** | **Markdown 清理**
  - Remove unwanted emphasis markers
  - Unify list markers
  - Normalize heading formats
  - 移除不需要的强调标记
  - 统一列表标记
  - 规范化标题格式

- **Customizable Settings** | **自定义设置**
  - Default AI source selection
  - Custom replacement rules
  - Platform-specific preferences
  - AI 来源默认选择
  - 自定义替换规则
  - 平台特定偏好设置

## How It Works | 工作原理

This plugin is built using TypeScript and integrates with Obsidian's API to provide:
- Real-time format cleaning
- Configurable settings management
- Platform-specific optimizations
- Unicode-compliant text processing

本插件使用 TypeScript 构建，与 Obsidian API 集成，提供：
- 实时格式清理
- 可配置的设置管理
- 平台特定优化
- Unicode 兼容的文本处理

## Installation | 安装方法

1. Open Obsidian Settings | 打开 Obsidian 设置
2. Go to Community Plugins | 转到社区插件
3. Search for "AI Content Formatter" | 搜索 "AI Content Formatter"
4. Install and Enable the plugin | 安装并启用插件

## Usage | 使用方法

### Quick Commands | 快捷命令

- `Clean Format`: Clean the entire document
- `Clean Selection`: Clean selected text only
- `Format as H1/H2/H3`: Quick heading formatting

- `清理格式`：清理整个文档
- `清理选中文本`：仅清理选中的文本
- `格式化为 H1/H2/H3`：快速标题格式化

### Settings Configuration | 设置配置

1. **AI Source Settings** | **AI 来源设置**
   - Select default AI source (ChatGPT/Claude)
   - Customize AI-specific patterns
   - 选择默认 AI 来源（ChatGPT/Claude）
   - 自定义 AI 特定模式

2. **Platform Settings** | **平台设置**
   - Enable WeChat optimization
   - Configure spacing rules
   - 启用微信优化
   - 配置间距规则

3. **Custom Rules** | **自定义规则**
   - Add/remove replacement patterns
   - Modify existing rules
   - 添加/删除替换模式
   - 修改现有规则

## Examples | 示例

### Before | 处理前
```markdown
**Here's what I found:**
- Point 1
- Point 2
*Important note*
```

### After | 处理后
```markdown
Here's what I found:
• Point 1
• Point 2
Important note
```

## Support | 支持

- Report issues on GitHub | 在 GitHub 上报告问题
- Join discussions in Obsidian Community | 加入 Obsidian 社区讨论
- Contribute to development | 参与开发

## License | 许可证

MIT License | MIT 许可证

## Technical Terms | 技术术语

- Markdown
- ChatGPT
- Claude
- WeChat Official Account | 微信公众号
- Obsidian
- TypeScript
- Unicode
