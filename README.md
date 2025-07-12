# MCP Gemini AI Demo

**English** | [中文](#中文说明)

This is a demo project using Model Context Protocol (MCP) with Google Gemini AI, including both server and client implementations.

## Project Structure

```
MCPTest/
├── package.json          # Project dependencies and scripts
├── server.js             # MCP server implementation
├── client.js             # MCP client implementation (includes testing capabilities)
└── README.md             # Project documentation
```

## Features

### MCP Server
- **Text Generation**: Generate text content using Gemini AI
- **Text Translation**: Translate text to specified languages
- **Text Summarization**: Intelligently summarize long text

### MCP Client
- **Tool Discovery**: Automatically discover tools provided by the server
- **Tool Invocation**: Call server tools and handle responses
- **Error Handling**: Comprehensive error handling mechanism
- **Testing Mode**: Built-in test suite for validating server functionality
- **Demo Mode**: Interactive demonstration of all features

## Installation and Usage

### 1. Clone Repository
```bash
git clone https://github.com/jovidalao/MCPTest.git
cd MCPTest
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Key
```bash
# Copy environment template
cp .env.example .env

# Edit .env file, add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Run Client Demo
```bash
npm run client
# or
node client.js demo
```

### 5. Run Tests
```bash
npm test
# or
node client.js test
```

### 6. Show Available Tools
```bash
node client.js tools
```

### 7. Run Server Standalone
```bash
npm run server
```

## API Key Configuration

For security, API keys are now managed through environment variables.

### 🔐 Security Setup

1. **Get API Key**
   - Visit: https://aistudio.google.com/app/apikey
   - Create a new API key

2. **Configure Environment Variables**
   ```bash
   # Method 1: Use .env file (recommended)
   cp .env.example .env
   # Then edit .env file
   
   # Method 2: Set environment variable directly
   export GEMINI_API_KEY=your_api_key_here
   ```

3. **Verify Configuration**
   ```bash
   # Run tests to ensure configuration is correct
   npm test
   ```

### ⚠️ Important Security Notes

- **Never commit API keys to version control**
- **.env file is added to .gitignore**
- **Use .env.example as template**
- **Use environment variables or key management services in production**

## Client Usage Modes

The client now supports multiple operation modes:

```bash
# Demo mode (default) - showcase all features
node client.js
node client.js demo

# Test mode - run comprehensive test suite
node client.js test

# Tools mode - list available tools
node client.js tools

# Help - show usage information
node client.js help
```

## Tool Description

### generate_text
Generate text content based on prompts

**Parameters:**
- `prompt` (string): Text generation prompt

### translate_text
Translate text to target language

**Parameters:**
- `text` (string): Text to translate
- `target_language` (string): Target language

### summarize_text
Intelligently summarize long text

**Parameters:**
- `text` (string): Text to summarize
- `max_length` (number, optional): Maximum summary length

## Learning Points

### Understanding MCP Architecture
1. **Server Side**: 
   - Define and implement tool functions
   - Handle client requests
   - Manage external API communication

2. **Client Side**:
   - Discover server tools
   - Call tools and handle responses
   - Manage connection lifecycle

### Key Concepts
- **Transport Layer**: Use stdio for inter-process communication
- **Tool Registration**: Register available tools on server side
- **Request Handling**: Handle different types of MCP requests
- **Error Management**: Proper error handling and reporting

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Ensure server script is executable
   - Check if dependencies are properly installed

2. **API Call Failed**
   - Verify Gemini API key
   - Check network connection

3. **Tool Call Error**
   - Verify parameter format
   - Check server logs

## Extension Suggestions

1. **Add More Tools**: Implement image analysis, code generation, etc.
2. **Improve Error Handling**: Add retry mechanisms and more detailed error messages
3. **Configuration Management**: Use environment variables for API key management
4. **Logging System**: Add structured logging
5. **Performance Optimization**: Add request caching and rate limiting

## License

MIT License

---

# 中文说明

这是一个使用 Model Context Protocol (MCP) 和 Google Gemini AI 的演示项目，包含服务器和客户端实现。

## 项目结构

```
MCPTest/
├── package.json          # 项目依赖和脚本
├── server.js             # MCP服务器实现
├── client.js             # MCP客户端实现（包含测试功能）
└── README.md             # 项目说明
```

## 功能特性

### MCP服务器
- **文本生成**: 使用Gemini AI生成文本内容
- **文本翻译**: 将文本翻译成指定语言
- **文本总结**: 对长文本进行智能总结

### MCP客户端
- **工具发现**: 自动发现服务器提供的工具
- **工具调用**: 调用服务器工具并处理响应
- **错误处理**: 完善的错误处理机制
- **测试模式**: 内置测试套件验证服务器功能
- **演示模式**: 交互式展示所有功能

## 安装和运行

### 1. 克隆仓库
```bash
git clone https://github.com/jovidalao/MCPTest.git
cd MCPTest
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置API密钥
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑.env文件，添加您的Gemini API密钥
# GEMINI_API_KEY=your_actual_api_key_here
```

### 4. 运行客户端演示
```bash
npm run client
# 或者
node client.js demo
```

### 5. 运行测试
```bash
npm test
# 或者
node client.js test
```

### 6. 显示可用工具
```bash
node client.js tools
```

### 7. 单独运行服务器
```bash
npm run server
```

## API密钥配置

为了安全性，API密钥现在通过环境变量管理。

### 🔐 安全设置

1. **获取API密钥**
   - 访问: https://aistudio.google.com/app/apikey
   - 创建新的API密钥

2. **配置环境变量**
   ```bash
   # 方法1：使用.env文件（推荐）
   cp .env.example .env
   # 然后编辑.env文件
   
   # 方法2：直接设置环境变量
   export GEMINI_API_KEY=your_api_key_here
   ```

3. **验证配置**
   ```bash
   # 运行测试确保配置正确
   npm test
   ```

### ⚠️ 重要安全提示

- **永远不要将API密钥提交到版本控制系统**
- **.env文件已添加到.gitignore**
- **使用.env.example作为模板**
- **在生产环境中使用环境变量或密钥管理服务**

## 客户端使用模式

客户端现在支持多种操作模式：

```bash
# 演示模式（默认）- 展示所有功能
node client.js
node client.js demo

# 测试模式 - 运行综合测试套件
node client.js test

# 工具模式 - 列出可用工具
node client.js tools

# 帮助 - 显示使用信息
node client.js help
```

## 工具说明

### generate_text (文本生成)
根据提示生成文本内容

**参数:**
- `prompt` (string): 文本生成提示

### translate_text (文本翻译)
将文本翻译成目标语言

**参数:**
- `text` (string): 要翻译的文本
- `target_language` (string): 目标语言

### summarize_text (文本总结)
对长文本进行智能总结

**参数:**
- `text` (string): 要总结的文本
- `max_length` (number, 可选): 最大总结长度

## 学习要点

### MCP架构理解
1. **服务器端**: 
   - 定义和实现工具功能
   - 处理客户端请求
   - 管理与外部API的通信

2. **客户端**:
   - 发现服务器工具
   - 调用工具并处理响应
   - 管理连接生命周期

### 关键概念
- **传输层**: 使用stdio进行进程间通信
- **工具注册**: 在服务器端注册可用工具
- **请求处理**: 处理不同类型的MCP请求
- **错误管理**: 适当的错误处理和报告

## 故障排除

### 常见问题

1. **连接失败**
   - 确保服务器脚本可执行
   - 检查依赖是否正确安装

2. **API调用失败**
   - 验证Gemini API密钥
   - 检查网络连接

3. **工具调用错误**
   - 验证参数格式
   - 检查服务器日志

## 扩展建议

1. **添加更多工具**: 实现图像分析、代码生成等功能
2. **改进错误处理**: 添加重试机制和更详细的错误信息
3. **配置管理**: 使用环境变量管理API密钥
4. **日志系统**: 添加结构化日志记录
5. **性能优化**: 添加请求缓存和限流机制

## 许可证

MIT License