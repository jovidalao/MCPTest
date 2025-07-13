# MCP Client Setup Guide

**English** | [中文](#中文配置指南)

Complete setup guide for integrating the Multi-AI Provider MCP Verification Service with various MCP clients.

## 🎯 Supported MCP Clients

This service works with any MCP-compatible client:
- **Claude Desktop** (macOS/Windows)
- **Continue** (VS Code extension)
- **Custom MCP applications**
- **Future MCP-compatible tools**

## 🔧 Claude Desktop Setup

### 1. Configuration File Location

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
%APPDATA%/Claude/claude_desktop_config.json
```

### 2. Basic Configuration Template

Create or edit the configuration file with your preferred AI provider:

#### Option A: Using Gemini (Default)
```json
{
  "mcpServers": {
    "multi-ai-verification": {
      "command": "node",
      "args": ["/absolute/path/to/your/project/server.js"],
      "cwd": "/absolute/path/to/your/project",
      "env": {
        "AI_PROVIDER": "gemini",
        "GEMINI_API_KEY": "your_gemini_api_key_here"
      }
    }
  }
}
```

#### Option B: Using OpenAI
```json
{
  "mcpServers": {
    "multi-ai-verification": {
      "command": "node",
      "args": ["/absolute/path/to/your/project/server.js"],
      "cwd": "/absolute/path/to/your/project",
      "env": {
        "AI_PROVIDER": "openai",
        "OPENAI_API_KEY": "your_openai_api_key_here",
        "OPENAI_MODEL": "gpt-4"
      }
    }
  }
}
```

#### Option C: Using Custom OpenAI-Compatible Service
```json
{
  "mcpServers": {
    "multi-ai-verification": {
      "command": "node",
      "args": ["/absolute/path/to/your/project/server.js"],
      "cwd": "/absolute/path/to/your/project",
      "env": {
        "AI_PROVIDER": "openai",
        "OPENAI_API_KEY": "your_api_key",
        "OPENAI_BASE_URL": "https://your-endpoint.com/v1",
        "OPENAI_MODEL": "your-model-name"
      }
    }
  }
}
```

**Important:** Replace `/absolute/path/to/your/project` with your actual project directory path.

### 3. Getting API Keys

#### For Gemini:
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key (starts with `AIzaSy`)

#### For OpenAI:
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)

### 4. Verify Configuration

Test the server before configuring Claude:
```bash
cd /your/project/directory
npm test
```

If you see "✅ All tests completed!", the configuration is working.

### 5. Restart Claude Desktop

After configuration, completely quit and restart Claude Desktop application.

## 🔌 Other MCP Clients

### Continue (VS Code Extension)

Add to your Continue configuration file:
```json
{
  "mcpServers": [
    {
      "name": "multi-ai-verification",
      "command": "node",
      "args": ["/absolute/path/to/your/project/server.js"],
      "env": {
        "AI_PROVIDER": "gemini",
        "GEMINI_API_KEY": "your_api_key"
      }
    }
  ]
}
```

### Custom MCP Applications

Use stdio transport to connect:
```javascript
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['/absolute/path/to/your/project/server.js'],
  env: {
    AI_PROVIDER: 'gemini',
    GEMINI_API_KEY: 'your_api_key'
  }
});
```

## 🧪 Testing Your Setup

### Available Tools

After setup, your MCP client will have access to:

1. **`verify_ai_result`** - Verify AI-generated content quality
2. **`generate_thought_chain`** - Generate reasoning frameworks  
3. **`optimize_prompt`** - Improve prompt clarity and effectiveness

### Example Usage in Claude Desktop

```
You: Explain how machine learning works

Claude: Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed...

You: Use the verification tool to check this explanation

Claude: I'll use the AI verification service to analyze my explanation...
[Claude uses verify_ai_result tool]

You: Generate a thought chain for understanding neural networks

Claude: I'll generate a structured thinking framework for neural networks...
[Claude uses generate_thought_chain tool]

You: Optimize this prompt: "explain AI"

Claude: I'll optimize that prompt for better results...
[Claude uses optimize_prompt tool]
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Cannot find module '/server.js'"**
   - Use absolute paths: `"/full/path/to/project/server.js"`
   - Check `cwd` parameter points to project directory
   - Verify file exists and has correct permissions

2. **"Server disconnected"**
   - Check API key validity (Gemini keys start with `AIzaSy`, OpenAI with `sk-`)
   - Ensure all project files are present
   - Test with `npm test`

3. **"AI服务暂时不可用"**
   - API call failed but MCP is working
   - Check internet connection and API quotas
   - Verify API endpoint accessibility

4. **Tools not appearing**
   - Restart your MCP client completely
   - Check MCP server logs for errors
   - Verify configuration syntax

### Debug Commands

```bash
# Test specific provider
AI_PROVIDER=gemini npm test

# Test with OpenAI
AI_PROVIDER=openai npm test

# Manual server start (for debugging)
npm run server
```

### Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `AI_PROVIDER` | Yes | AI service to use | `gemini`, `openai` |
| `GEMINI_API_KEY` | For Gemini | Google AI API key | `AIzaSy...` |
| `OPENAI_API_KEY` | For OpenAI | OpenAI API key | `sk-...` |
| `OPENAI_BASE_URL` | Optional | Custom endpoint | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | Optional | Model name | `gpt-4`, `gpt-3.5-turbo` |

## 📋 Feature Overview

This MCP service provides three powerful tools:

### 🔍 AI Result Verification
- Accuracy analysis of AI responses
- Completeness and relevance checking  
- Quality scoring with improvement suggestions
- Customizable verification criteria

### 🧠 Thought Chain Generation
- Structured reasoning frameworks
- Domain-specific thinking patterns
- Multiple depth levels (basic/detailed/comprehensive)
- Enhanced problem-solving capabilities

### ⚡ Prompt Optimization
- Clarity and specificity improvements
- Model-specific optimizations
- Context enhancement
- Goal-oriented prompt engineering

---

# 中文配置指南

多AI提供商MCP验证服务的完整配置指南，支持各种MCP客户端。

## 🎯 支持的MCP客户端

本服务兼容任何MCP客户端：
- **Claude Desktop** (macOS/Windows)
- **Continue** (VS Code扩展)
- **自定义MCP应用程序**
- **未来的MCP兼容工具**

## 🔧 Claude Desktop 配置

### 1. 配置文件位置

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
%APPDATA%/Claude/claude_desktop_config.json
```

### 2. 基础配置模板

根据您偏好的AI提供商创建或编辑配置文件：

#### 选项A: 使用Gemini（默认）
```json
{
  "mcpServers": {
    "multi-ai-verification": {
      "command": "node",
      "args": ["/您的项目绝对路径/server.js"],
      "cwd": "/您的项目绝对路径",
      "env": {
        "AI_PROVIDER": "gemini",
        "GEMINI_API_KEY": "您的gemini_api密钥"
      }
    }
  }
}
```

#### 选项B: 使用OpenAI
```json
{
  "mcpServers": {
    "multi-ai-verification": {
      "command": "node",
      "args": ["/您的项目绝对路径/server.js"],
      "cwd": "/您的项目绝对路径",
      "env": {
        "AI_PROVIDER": "openai",
        "OPENAI_API_KEY": "您的openai_api密钥",
        "OPENAI_MODEL": "gpt-4"
      }
    }
  }
}
```

#### 选项C: 使用自定义OpenAI兼容服务
```json
{
  "mcpServers": {
    "multi-ai-verification": {
      "command": "node",
      "args": ["/您的项目绝对路径/server.js"],
      "cwd": "/您的项目绝对路径",
      "env": {
        "AI_PROVIDER": "openai",
        "OPENAI_API_KEY": "您的api密钥",
        "OPENAI_BASE_URL": "https://您的端点.com/v1",
        "OPENAI_MODEL": "您的模型名称"
      }
    }
  }
}
```

**重要：** 将 `/您的项目绝对路径` 替换为您的实际项目目录路径。

### 3. 获取API密钥

#### Gemini密钥：
1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 创建新的API密钥
3. 复制密钥（以 `AIzaSy` 开头）

#### OpenAI密钥：
1. 访问 [OpenAI平台](https://platform.openai.com/api-keys)
2. 创建新的API密钥
3. 复制密钥（以 `sk-` 开头）

### 4. 验证配置

在配置Claude之前测试服务器：
```bash
cd /您的项目目录
npm test
```

如果看到 "✅ All tests completed!"，说明配置正常工作。

### 5. 重启Claude Desktop

配置完成后，完全退出并重新启动Claude Desktop应用程序。

## 🧪 测试您的配置

### 可用工具

配置后，您的MCP客户端将可以访问：

1. **`verify_ai_result`** - 验证AI生成内容的质量
2. **`generate_thought_chain`** - 生成推理框架
3. **`optimize_prompt`** - 改善提示的清晰度和有效性

### Claude Desktop中的使用示例

```
您: 解释机器学习是如何工作的

Claude: 机器学习是人工智能的一个子集，它使计算机能够从经验中学习和改进，而无需明确编程...

您: 使用验证工具检查这个解释

Claude: 我将使用AI验证服务来分析我的解释...
[Claude使用verify_ai_result工具]

您: 为理解神经网络生成一个思维链

Claude: 我将为神经网络生成一个结构化的思维框架...
[Claude使用generate_thought_chain工具]

您: 优化这个提示："解释AI"

Claude: 我将优化这个提示以获得更好的结果...
[Claude使用optimize_prompt工具]
```

## 🛠️ 故障排除

### 常见问题

1. **"Cannot find module '/server.js'"**
   - 使用绝对路径：`"/完整路径/项目/server.js"`
   - 检查 `cwd` 参数是否指向项目目录
   - 验证文件存在且有正确权限

2. **"Server disconnected"**
   - 检查API密钥有效性（Gemini密钥以 `AIzaSy` 开头，OpenAI以 `sk-` 开头）
   - 确保所有项目文件完整
   - 使用 `npm test` 测试

3. **"AI服务暂时不可用"**
   - API调用失败但MCP正常工作
   - 检查网络连接和API配额
   - 验证API端点可访问性

4. **工具未出现**
   - 完全重启您的MCP客户端
   - 检查MCP服务器日志错误
   - 验证配置语法

### 调试命令

```bash
# 测试特定提供商
AI_PROVIDER=gemini npm test

# 使用OpenAI测试
AI_PROVIDER=openai npm test

# 手动启动服务器（调试用）
npm run server
```

## 📋 功能概览

此MCP服务提供三个强大工具：

### 🔍 AI结果验证
- AI回应的准确性分析
- 完整性和相关性检查
- 带改进建议的质量评分
- 可自定义验证标准

### 🧠 思维链生成
- 结构化推理框架
- 领域特定思维模式
- 多深度级别（基础/详细/综合）
- 增强问题解决能力

### ⚡ 提示优化
- 清晰度和具体性改进
- 模型特定优化
- 上下文增强
- 目标导向提示工程