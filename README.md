# MCP Gemini AI 验证服务

**English** | [中文](#中文说明)

A Model Context Protocol (MCP) server that uses Google Gemini AI to verify and analyze AI-generated content quality. Perfect for Claude Desktop integration to provide real-time result verification.

## Project Structure

```
MCPTest/
├── package.json          # Project dependencies and scripts
├── server.js             # MCP server implementation
├── client.js             # MCP client implementation (includes testing capabilities)
├── CLAUDE_SETUP.md       # Claude Desktop configuration guide
└── README.md             # Project documentation
```

## Features

### 🔍 AI Result Verification
- **Accuracy Analysis**: Verify if AI responses correctly answer the original question
- **Completeness Check**: Analyze if any important information is missing
- **Relevance Assessment**: Ensure responses stay on topic
- **Quality Scoring**: Provide structured evaluation with improvement suggestions
- **Multi-criteria Support**: Customizable verification standards

### 🛠️ MCP Integration
- **Claude Desktop Ready**: Direct integration with Claude macOS app
- **Real-time Verification**: Instant quality assessment of AI outputs
- **Structured Reports**: Detailed analysis with actionable feedback
- **Error Resilience**: Graceful handling of API failures

## Quick Start

### 1. Installation
```bash
git clone <repository-url>
cd MCPTest
npm install
```

### 2. Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key for configuration

### 3. Test the Service
```bash
# Test MCP connection
GEMINI_API_KEY=your_api_key node client.js connect

# Run full demonstration
GEMINI_API_KEY=your_api_key node client.js demo

# Run test suite
GEMINI_API_KEY=your_api_key node client.js test
```

## Claude Desktop Integration

### Configuration
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gemini-verification": {
      "command": "node",
      "args": ["/Users/jovi/Code/test1/MCPTest/server.js"],
      "cwd": "/Users/jovi/Code/test1/MCPTest",
      "env": {
        "GEMINI_API_KEY": "your_gemini_api_key_here"
      }
    }
  }
}
```

**Note**: Replace `/Users/jovi/Code/test1/MCPTest` with your actual project path.

### Usage in Claude
After restarting Claude Desktop:

```
You: Explain how JavaScript arrow functions work

Claude: Arrow functions are a concise way to write functions in JavaScript. They use the => syntax and have lexical this binding...

You: Please use the MCP verification service to check this explanation

Claude: I'll use the Gemini AI verification service to analyze my explanation...
```

For detailed setup instructions, see [CLAUDE_SETUP.md](CLAUDE_SETUP.md).

## API Reference

### verify_ai_result

Verify and analyze AI-generated content quality.

**Parameters:**
- `original_prompt` (string): The original question or prompt
- `claude_result` (string): The AI-generated response to verify
- `verification_criteria` (string, optional): Verification standards (default: "accuracy,completeness,relevance")

**Example:**
```javascript
{
  "original_prompt": "What is photosynthesis?",
  "claude_result": "Photosynthesis is the process by which plants convert sunlight into energy...",
  "verification_criteria": "accuracy,completeness,clarity"
}
```

## Client Modes

```bash
# Demo mode - showcase verification functionality
node client.js demo

# Test mode - run comprehensive test suite  
node client.js test

# Tools mode - list available verification tools
node client.js tools

# Connect mode - test MCP connection only
node client.js connect

# Help - show usage information
node client.js help
```

## Verification Criteria

- **accuracy**: Factual correctness and proper response to the question
- **completeness**: Coverage of all important aspects
- **relevance**: Staying on topic and addressing the prompt
- **clarity**: Clear and understandable explanations

## Troubleshooting

### Common Issues

1. **"Cannot find module '/server.js'"**
   - Ensure the absolute path in Claude config is correct
   - Verify the `cwd` parameter points to the project directory

2. **"Server disconnected"**
   - Check if `GEMINI_API_KEY` is valid
   - Ensure all project files are present
   - Test with `node client.js connect`

3. **API Key Issues**
   - Verify the key starts with "AIzaSy"
   - Check API key permissions in Google AI Studio
   - Ensure no rate limits are exceeded

### Debug Information
Run the client in test mode to verify everything works:
```bash
GEMINI_API_KEY=your_key node client.js test
```

## License

MIT License

---

# 中文说明

一个使用 Google Gemini AI 验证和分析 AI 生成内容质量的 Model Context Protocol (MCP) 服务器。完美集成 Claude Desktop，提供实时结果验证功能。

## 项目结构

```
MCPTest/
├── package.json          # 项目依赖和脚本
├── server.js             # MCP服务器实现
├── client.js             # MCP客户端实现（包含测试功能）
├── CLAUDE_SETUP.md       # Claude Desktop配置指南
└── README.md             # 项目说明
```

## 功能特性

### 🔍 AI结果验证
- **准确性分析**: 验证AI回答是否正确回应了原始问题
- **完整性检查**: 分析是否遗漏了重要信息
- **相关性评估**: 确保回答切合主题
- **质量评分**: 提供结构化评估和改进建议
- **多标准支持**: 可自定义验证标准

### 🛠️ MCP集成
- **Claude Desktop就绪**: 直接集成Claude macOS应用
- **实时验证**: 即时评估AI输出质量
- **结构化报告**: 提供详细分析和可行建议
- **错误容错**: 优雅处理API故障

## 快速开始

### 1. 安装
```bash
git clone <repository-url>
cd MCPTest
npm install
```

### 2. 获取Gemini API密钥
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建新的API密钥
3. 复制密钥用于配置

### 3. 测试服务
```bash
# 测试MCP连接
GEMINI_API_KEY=你的密钥 node client.js connect

# 运行完整演示
GEMINI_API_KEY=你的密钥 node client.js demo

# 运行测试套件
GEMINI_API_KEY=你的密钥 node client.js test
```

## Claude Desktop集成

### 配置
添加到 `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gemini-verification": {
      "command": "node",
      "args": ["/Users/jovi/Code/test1/MCPTest/server.js"],
      "cwd": "/Users/jovi/Code/test1/MCPTest",
      "env": {
        "GEMINI_API_KEY": "你的gemini_api_密钥"
      }
    }
  }
}
```

**注意**: 将 `/Users/jovi/Code/test1/MCPTest` 替换为你的实际项目路径。

### 在Claude中使用
重启Claude Desktop后：

```
你: 解释JavaScript箭头函数是如何工作的

Claude: 箭头函数是JavaScript中编写函数的简洁方式。它们使用=>语法并具有词法this绑定...

你: 请使用MCP验证服务检查这个解释

Claude: 我将使用Gemini AI验证服务来分析我的解释...
```

详细设置说明请参阅 [CLAUDE_SETUP.md](CLAUDE_SETUP.md)。

## API参考

### verify_ai_result

验证和分析AI生成内容的质量。

**参数:**
- `original_prompt` (string): 原始问题或提示
- `claude_result` (string): 要验证的AI生成回答
- `verification_criteria` (string, 可选): 验证标准 (默认: "accuracy,completeness,relevance")

**示例:**
```javascript
{
  "original_prompt": "什么是光合作用？",
  "claude_result": "光合作用是植物将阳光转化为能量的过程...",
  "verification_criteria": "accuracy,completeness,clarity"
}
```

## 客户端模式

```bash
# 演示模式 - 展示验证功能
node client.js demo

# 测试模式 - 运行综合测试套件
node client.js test

# 工具模式 - 列出可用验证工具
node client.js tools

# 连接模式 - 仅测试MCP连接
node client.js connect

# 帮助 - 显示使用信息
node client.js help
```

## 验证标准

- **accuracy**: 事实正确性和对问题的正确回应
- **completeness**: 涵盖所有重要方面
- **relevance**: 切合主题并回应提示
- **clarity**: 清晰易懂的解释

## 故障排除

### 常见问题

1. **"Cannot find module '/server.js'"**
   - 确保Claude配置中的绝对路径正确
   - 验证`cwd`参数指向项目目录

2. **"Server disconnected"**
   - 检查`GEMINI_API_KEY`是否有效
   - 确保所有项目文件完整
   - 使用`node client.js connect`测试

3. **API密钥问题**
   - 验证密钥以"AIzaSy"开头
   - 检查Google AI Studio中的API密钥权限
   - 确保未超出速率限制

### 调试信息
运行客户端测试模式验证一切正常：
```bash
GEMINI_API_KEY=你的密钥 node client.js test
```

## 许可证

MIT License