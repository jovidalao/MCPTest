# MCP Gemini AI Demo / MCP Gemini AI 演示

这是一个使用 Model Context Protocol (MCP) 和 Google Gemini AI 的演示项目，包含服务器和客户端实现。  
This is a demo project using Model Context Protocol (MCP) with Google Gemini AI, including both server and client implementations.

## 项目结构 / Project Structure

```
MCPTest/
├── package.json          # 项目依赖和脚本 / Project dependencies and scripts
├── server.js             # MCP服务器实现 / MCP server implementation
├── client.js             # MCP客户端实现 / MCP client implementation
├── test.js               # 测试文件 / Test file
└── README.md             # 项目说明 / Project documentation
```

## 功能特性 / Features

### MCP服务器 / MCP Server
- **文本生成** / **Text Generation**: 使用Gemini AI生成文本内容
- **文本翻译** / **Text Translation**: 将文本翻译成指定语言
- **文本总结** / **Text Summarization**: 对长文本进行智能总结

### MCP客户端 / MCP Client
- **工具发现** / **Tool Discovery**: 自动发现服务器提供的工具
- **工具调用** / **Tool Invocation**: 调用服务器工具并处理响应
- **错误处理** / **Error Handling**: 完善的错误处理机制

## 安装和运行 / Installation and Usage

### 1. 克隆仓库 / Clone Repository
```bash
git clone https://github.com/jovidalao/MCPTest.git
cd MCPTest
```

### 2. 安装依赖 / Install Dependencies
```bash
npm install
```

### 3. 配置API密钥 / Configure API Key
```bash
# 复制环境变量模板 / Copy environment template
cp .env.example .env

# 编辑.env文件，添加您的Gemini API密钥 / Edit .env file, add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here
```

### 4. 运行客户端演示 / Run Client Demo
```bash
npm run client
```

### 5. 运行测试 / Run Tests
```bash
npm test
```

### 6. 单独运行服务器 / Run Server Standalone
```bash
npm run server
```

## API密钥配置 / API Key Configuration

为了安全性，API密钥现在通过环境变量管理：  
For security, API keys are now managed through environment variables:

### 🔐 安全设置 / Security Setup

1. **获取API密钥** / **Get API Key**
   - 访问 / Visit: https://aistudio.google.com/app/apikey
   - 创建新的API密钥 / Create a new API key

2. **配置环境变量** / **Configure Environment Variables**
   ```bash
   # 方法1：使用.env文件（推荐） / Method 1: Use .env file (recommended)
   cp .env.example .env
   # 然后编辑.env文件 / Then edit .env file
   
   # 方法2：直接设置环境变量 / Method 2: Set environment variable directly
   export GEMINI_API_KEY=your_api_key_here
   ```

3. **验证配置** / **Verify Configuration**
   ```bash
   # 运行测试确保配置正确 / Run tests to ensure configuration is correct
   npm test
   ```

### ⚠️ 重要安全提示 / Important Security Notes

- **永远不要将API密钥提交到版本控制系统** / **Never commit API keys to version control**
- **.env文件已添加到.gitignore** / **.env file is added to .gitignore**
- **使用.env.example作为模板** / **Use .env.example as template**
- **在生产环境中使用环境变量或密钥管理服务** / **Use environment variables or key management services in production**

## 工具说明 / Tool Description

### generate_text (文本生成)
根据提示生成文本内容  
Generate text content based on prompts

**参数 / Parameters:**
- `prompt` (string): 文本生成提示 / Text generation prompt

### translate_text (文本翻译)
将文本翻译成目标语言  
Translate text to target language

**参数 / Parameters:**
- `text` (string): 要翻译的文本 / Text to translate
- `target_language` (string): 目标语言 / Target language

### summarize_text (文本总结)
对长文本进行智能总结  
Intelligently summarize long text

**参数 / Parameters:**
- `text` (string): 要总结的文本 / Text to summarize
- `max_length` (number, 可选 / optional): 最大总结长度 / Maximum summary length

## 学习要点 / Learning Points

### MCP架构理解 / Understanding MCP Architecture
1. **服务器端 / Server Side**: 
   - 定义和实现工具功能 / Define and implement tool functions
   - 处理客户端请求 / Handle client requests
   - 管理与外部API的通信 / Manage external API communication

2. **客户端 / Client Side**:
   - 发现服务器工具 / Discover server tools
   - 调用工具并处理响应 / Call tools and handle responses
   - 管理连接生命周期 / Manage connection lifecycle

### 关键概念 / Key Concepts
- **传输层 / Transport Layer**: 使用stdio进行进程间通信 / Use stdio for inter-process communication
- **工具注册 / Tool Registration**: 在服务器端注册可用工具 / Register available tools on server side
- **请求处理 / Request Handling**: 处理不同类型的MCP请求 / Handle different types of MCP requests
- **错误管理 / Error Management**: 适当的错误处理和报告 / Proper error handling and reporting

## 故障排除 / Troubleshooting

### 常见问题 / Common Issues

1. **连接失败 / Connection Failed**
   - 确保服务器脚本可执行 / Ensure server script is executable
   - 检查依赖是否正确安装 / Check if dependencies are properly installed

2. **API调用失败 / API Call Failed**
   - 验证Gemini API密钥 / Verify Gemini API key
   - 检查网络连接 / Check network connection

3. **工具调用错误 / Tool Call Error**
   - 验证参数格式 / Verify parameter format
   - 检查服务器日志 / Check server logs

## 扩展建议 / Extension Suggestions

1. **添加更多工具** / **Add More Tools**: 实现图像分析、代码生成等功能
2. **改进错误处理** / **Improve Error Handling**: 添加重试机制和更详细的错误信息
3. **配置管理** / **Configuration Management**: 使用环境变量管理API密钥
4. **日志系统** / **Logging System**: 添加结构化日志记录
5. **性能优化** / **Performance Optimization**: 添加请求缓存和限流机制

## 许可证 / License

MIT License