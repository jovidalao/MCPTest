# Multi-AI Provider MCP Verification Service

**English** | [中文](#中文说明)

A Model Context Protocol (MCP) server that supports multiple AI providers (Gemini, OpenAI-compatible APIs) to verify and analyze AI-generated content quality. Features thought chain generation and prompt optimization to enhance AI reasoning capabilities. Compatible with any MCP client including Claude Desktop, Continue, and other MCP-enabled applications.

## 🚀 Features

### 🔍 AI Result Verification
- **Accuracy Analysis**: Verify if AI responses correctly answer the original question
- **Completeness Check**: Analyze if any important information is missing
- **Relevance Assessment**: Ensure responses stay on topic
- **Quality Scoring**: Provide structured evaluation with improvement suggestions
- **Multi-criteria Support**: Customizable verification standards

### 🧠 Thought Chain Generation
- **Structured Reasoning**: Generate step-by-step thinking frameworks
- **Domain-Specific Patterns**: Tailored reasoning for math, science, coding, etc.
- **Depth Control**: Basic, detailed, or comprehensive analysis levels
- **AI Enhancement**: Help models without built-in thinking capability gain reasoning skills

### ⚡ Prompt Optimization
- **Clarity Enhancement**: Improve prompt clarity and specificity
- **Model-Specific Optimization**: Tailored improvements for different AI models
- **Context Enhancement**: Add relevant context and structure
- **Goal-Oriented Engineering**: Optimize for specific objectives

### 🛠️ Multi-Provider Support
- **Gemini (Google)**: Default provider using Google's Generative AI
- **OpenAI**: Support for GPT models via OpenAI API
- **Custom Services**: Any OpenAI-compatible API endpoint
- **Unified Interface**: Same MCP tools work with any provider

## 📁 Project Structure

```
MCPTest/
├── package.json          # Project dependencies and scripts
├── server.js             # Multi-provider MCP server implementation
├── test-client.js        # Simple test client for functionality verification
├── .env.example          # Environment variables template
├── CLAUDE_SETUP.md       # Claude Desktop configuration guide
└── README.md             # Project documentation
```

## 🔧 Quick Start

### 1. Installation
```bash
git clone <repository-url>
cd MCPTest
npm install
```

### 2. Configure AI Provider
Copy `.env.example` to `.env` and configure your preferred AI provider:

#### Option A: Use Gemini (Default)
```bash
cp .env.example .env
# Edit .env:
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
```
Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

#### Option B: Use OpenAI
```bash
cp .env.example .env
# Edit .env:
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4  # optional, defaults to gpt-4
```
Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)

#### Option C: Use Custom OpenAI-Compatible Service
```bash
cp .env.example .env
# Edit .env:
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://your-custom-endpoint.com/v1
OPENAI_MODEL=your-model-name
```

Examples of compatible services:
- Azure OpenAI
- Anthropic API (via compatibility layer)
- Local models (Ollama, LM Studio, etc.)
- Other cloud providers with OpenAI-compatible endpoints

### 3. Test the Service
```bash
# Run functionality tests
npm test
# OR
node test-client.js
```

Expected output:
```
🤖 使用AI提供商: gemini / Using AI provider: gemini
📋 测试工具列表... / Testing tools list...
找到 3 个工具 / Found 3 tools:
1. verify_ai_result: 使用AI验证Claude生成结果的准确性和质量
2. generate_thought_chain: 使用AI为问题生成思维链，帮助AI模型进行深度推理
3. optimize_prompt: 使用AI优化用户提示，让AI能更好地理解和回答问题
✅ All tests completed!
```

## 🖥️ MCP Client Integration

### Claude Desktop Integration
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

#### For Gemini Provider:
```json
{
  "mcpServers": {
    "multi-ai-verification": {
      "command": "node",
      "args": ["/path/to/your/MCPTest/server.js"],
      "cwd": "/path/to/your/MCPTest",
      "env": {
        "AI_PROVIDER": "gemini",
        "GEMINI_API_KEY": "your_gemini_api_key_here"
      }
    }
  }
}
```

#### For OpenAI Provider:
```json
{
  "mcpServers": {
    "multi-ai-verification": {
      "command": "node", 
      "args": ["/path/to/your/MCPTest/server.js"],
      "cwd": "/path/to/your/MCPTest",
      "env": {
        "AI_PROVIDER": "openai",
        "OPENAI_API_KEY": "your_openai_api_key_here",
        "OPENAI_MODEL": "gpt-4",
        "OPENAI_BASE_URL": "https://api.openai.com/v1"
      }
    }
  }
}
```

**Note**: Replace `/path/to/your/MCPTest` with your actual project path.

### Other MCP Clients
This server works with any MCP-compatible client. Configuration varies by client:

- **Continue**: Add to your Continue configuration
- **Custom MCP clients**: Use stdio transport with the server.js file
- **VSCode with MCP extension**: Configure in extension settings

### Usage Examples
After configuring your MCP client, you can use these tools:

```
User: Explain how JavaScript arrow functions work

AI Assistant: Arrow functions are a concise way to write functions in JavaScript...

User: Use the verification tool to check this explanation
[AI will use verify_ai_result tool]

User: Generate a thought chain for solving this coding problem: "How to implement a binary search?"
[AI will use generate_thought_chain tool]

User: Optimize this prompt: "write code"
[AI will use optimize_prompt tool]
```

## 📚 API Reference

### verify_ai_result
Verify and analyze AI-generated content quality.

**Parameters:**
- `original_prompt` (string, required): The original question or prompt
- `ai_result` (string, required): The AI-generated response to verify
- `verification_criteria` (string, optional): Verification standards (default: "accuracy,completeness,relevance")

**Example:**
```javascript
{
  "original_prompt": "What is photosynthesis?",
  "ai_result": "Photosynthesis is the process by which plants convert sunlight into energy...",
  "verification_criteria": "accuracy,completeness,clarity"
}
```

### generate_thought_chain
Generate structured thinking frameworks for complex reasoning.

**Parameters:**
- `question` (string, required): The question or task to generate thinking for
- `domain` (string, optional): Problem domain (math, science, coding, analysis, creative, general)
- `depth` (string, optional): Thinking depth (basic, detailed, comprehensive)

**Example:**
```javascript
{
  "question": "How do I optimize database queries for better performance?",
  "domain": "coding",
  "depth": "detailed"
}
```

### optimize_prompt
Optimize user prompts for better AI understanding and responses.

**Parameters:**
- `original_prompt` (string, required): The prompt to optimize
- `goal` (string, optional): Optimization goals (clarity, specificity, context, structure)
- `target_model` (string, optional): Target AI model (claude, gpt, gemini, general)

**Example:**
```javascript
{
  "original_prompt": "write code",
  "goal": "clarity,specificity,context",
  "target_model": "claude"
}
```

## 🌐 Supported AI Providers

| Provider | Model | API Format | Configuration |
|----------|-------|------------|---------------|
| **Gemini** | gemini-2.5-flash | Google AI | `GEMINI_API_KEY` |
| **OpenAI** | gpt-4, gpt-3.5-turbo | OpenAI Chat | `OPENAI_API_KEY`, `OPENAI_MODEL` |
| **Azure OpenAI** | Various | OpenAI Chat | Custom `OPENAI_BASE_URL` |
| **Local Models** | Any compatible | OpenAI Chat | Local endpoint URL |

## 🔧 Development

### Scripts
```bash
npm run server    # Start MCP server manually
npm test         # Run functionality tests
```

### Environment Variables
- `AI_PROVIDER`: Provider to use (gemini, openai)
- `GEMINI_API_KEY`: Google AI API key
- `OPENAI_API_KEY`: OpenAI API key
- `OPENAI_BASE_URL`: Custom API endpoint (optional)
- `OPENAI_MODEL`: Model name (optional)

### Verification Criteria
- **accuracy**: Factual correctness and proper response to the question
- **completeness**: Coverage of all important aspects
- **relevance**: Staying on topic and addressing the prompt
- **clarity**: Clear and understandable explanations

## 🐛 Troubleshooting

### Common Issues

1. **"请设置GEMINI_API_KEY环境变量"**
   - Ensure your `.env` file contains the correct API key
   - Verify the key is valid in Google AI Studio

2. **"请设置OPENAI_API_KEY环境变量"**
   - Check your OpenAI API key is correctly set
   - Verify the key has sufficient credits/permissions

3. **"AI服务暂时不可用"**
   - API call failed, but MCP functionality is working
   - Check your internet connection and API quotas
   - Verify the API endpoint is accessible

4. **Claude Desktop Integration Issues**
   - Ensure the absolute path in config is correct
   - Restart Claude Desktop after configuration changes
   - Check the MCP server logs for error messages

### Debug Commands
```bash
# Test with specific provider
AI_PROVIDER=gemini npm test

# Test OpenAI provider
AI_PROVIDER=openai npm test

# Manual server start (for debugging)
npm run server
```

### Logs
The server outputs provider information on startup:
```
🤖 使用AI提供商: gemini / Using AI provider: gemini
多AI提供商验证服务器已启动 (gemini) / Multi-AI Provider Verification Server started (gemini)
```

## 📄 License

MIT License

---

# 中文说明

一个支持多个AI提供商（Gemini、OpenAI兼容API）的Model Context Protocol (MCP)服务器，用于验证和分析AI生成内容的质量。具备思维链生成和提示优化功能，增强AI推理能力。兼容任何MCP客户端，包括Claude Desktop、Continue等MCP支持的应用程序。

## 🚀 功能特性

### 🔍 AI结果验证
- **准确性分析**: 验证AI回答是否正确回应了原始问题
- **完整性检查**: 分析是否遗漏了重要信息
- **相关性评估**: 确保回答切合主题
- **质量评分**: 提供结构化评估和改进建议
- **多标准支持**: 可自定义验证标准

### 🧠 思维链生成
- **结构化推理**: 生成逐步思考框架
- **领域特定模式**: 针对数学、科学、编程等的定制推理
- **深度控制**: 基础、详细或综合分析级别
- **AI增强**: 帮助没有内置思考能力的模型获得推理技能

### ⚡ 提示优化
- **清晰度增强**: 提高提示的清晰度和具体性
- **模型特定优化**: 针对不同AI模型的定制改进
- **上下文增强**: 添加相关上下文和结构
- **目标导向工程**: 针对特定目标进行优化

### 🛠️ 多提供商支持
- **Gemini (Google)**: 使用Google生成式AI的默认提供商
- **OpenAI**: 通过OpenAI API支持GPT模型
- **自定义服务**: 任何OpenAI兼容的API端点
- **统一接口**: 相同的MCP工具适用于任何提供商

## 🔧 快速开始

### 1. 安装
```bash
git clone <repository-url>
cd MCPTest
npm install
```

### 2. 配置AI提供商
复制`.env.example`到`.env`并配置您首选的AI提供商：

#### 选项A: 使用Gemini（默认）
```bash
cp .env.example .env
# 编辑.env:
AI_PROVIDER=gemini
GEMINI_API_KEY=您的gemini_api密钥
```
从[Google AI Studio](https://aistudio.google.com/app/apikey)获取您的Gemini API密钥

#### 选项B: 使用OpenAI
```bash
cp .env.example .env
# 编辑.env:
AI_PROVIDER=openai
OPENAI_API_KEY=您的openai_api密钥
OPENAI_MODEL=gpt-4  # 可选，默认为gpt-4
```
从[OpenAI平台](https://platform.openai.com/api-keys)获取您的OpenAI API密钥

#### 选项C: 使用自定义OpenAI兼容服务
```bash
cp .env.example .env
# 编辑.env:
AI_PROVIDER=openai
OPENAI_API_KEY=您的api密钥
OPENAI_BASE_URL=https://您的自定义端点.com/v1
OPENAI_MODEL=您的模型名称
```

### 3. 测试服务
```bash
# 运行功能测试
npm test
# 或
node test-client.js
```

## 🖥️ Claude Desktop集成

### 配置
添加到`~/Library/Application Support/Claude/claude_desktop_config.json`:

#### Gemini提供商:
```json
{
  "mcpServers": {
    "multi-ai-verification": {
      "command": "node",
      "args": ["/您的项目路径/MCPTest/server.js"],
      "cwd": "/您的项目路径/MCPTest",
      "env": {
        "AI_PROVIDER": "gemini",
        "GEMINI_API_KEY": "您的gemini_api密钥"
      }
    }
  }
}
```

#### OpenAI提供商:
```json
{
  "mcpServers": {
    "multi-ai-verification": {
      "command": "node",
      "args": ["/您的项目路径/MCPTest/server.js"],
      "cwd": "/您的项目路径/MCPTest",
      "env": {
        "AI_PROVIDER": "openai",
        "OPENAI_API_KEY": "您的openai_api密钥",
        "OPENAI_MODEL": "gpt-4"
      }
    }
  }
}
```

### 在MCP客户端中使用
配置MCP客户端后，您可以使用这些工具：

```
您: 解释JavaScript箭头函数是如何工作的

AI助手: 箭头函数是JavaScript中编写函数的简洁方式...

您: 使用验证工具检查这个解释
[AI将使用verify_ai_result工具]

您: 为这个编程问题生成思维链："如何实现二分搜索？"
[AI将使用generate_thought_chain工具]

您: 优化这个提示："写代码"
[AI将使用optimize_prompt工具]
```

## 📚 API参考

### verify_ai_result
验证和分析AI生成内容的质量。

**参数:**
- `original_prompt` (string, 必需): 原始问题或提示
- `ai_result` (string, 必需): 要验证的AI生成回答
- `verification_criteria` (string, 可选): 验证标准（默认："accuracy,completeness,relevance"）

### generate_thought_chain
为复杂推理生成结构化思维框架。

**参数:**
- `question` (string, 必需): 要生成思维的问题或任务
- `domain` (string, 可选): 问题领域（math, science, coding, analysis, creative, general）
- `depth` (string, 可选): 思维深度（basic, detailed, comprehensive）

### optimize_prompt
优化用户提示以获得更好的AI理解和回应。

**参数:**
- `original_prompt` (string, 必需): 要优化的提示
- `goal` (string, 可选): 优化目标（clarity, specificity, context, structure）
- `target_model` (string, 可选): 目标AI模型（claude, gpt, gemini, general）

## 🐛 故障排除

### 常见问题

1. **"请设置GEMINI_API_KEY环境变量"**
   - 确保您的`.env`文件包含正确的API密钥
   - 在Google AI Studio中验证密钥有效性

2. **"请设置OPENAI_API_KEY环境变量"**
   - 检查您的OpenAI API密钥设置正确
   - 验证密钥有足够的额度/权限

3. **"AI服务暂时不可用"**
   - API调用失败，但MCP功能正常工作
   - 检查您的网络连接和API配额
   - 验证API端点可访问

4. **Claude Desktop集成问题**
   - 确保配置中的绝对路径正确
   - 配置更改后重启Claude Desktop
   - 检查MCP服务器日志查看错误消息

### 调试命令
```bash
# 使用特定提供商测试
AI_PROVIDER=gemini npm test

# 测试OpenAI提供商
AI_PROVIDER=openai npm test

# 手动启动服务器（用于调试）
npm run server
```

## 📄 许可证

MIT License