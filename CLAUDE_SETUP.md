# Claude macOS 配置指南

## 🔧 配置 Claude Desktop 使用 MCP 验证服务

### 1. 配置文件位置
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

### 2. 配置内容
```json
{
  "mcpServers": {
    "gemini-verification": {
      "command": "node",
      "args": ["server.js"],
      "cwd": "/Users/jovi/Code/test1/MCPTest",
      "env": {
        "GEMINI_API_KEY": "你的Gemini_API_密钥"
      }
    }
  }
}
```

### 3. 获取 Gemini API 密钥
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建新的 API 密钥
3. 复制密钥并替换配置中的 `你的Gemini_API_密钥`

### 4. 重启 Claude
配置完成后，完全退出并重新启动 Claude macOS 应用。

## 🧪 测试配置

### 命令行测试
```bash
# 测试 MCP 连接
node client.js connect

# 运行完整测试
node client.js test

# 查看演示
node client.js demo
```

### 在 Claude 中使用
重启后，你可以在 Claude 中使用验证功能：

```
你：帮我解释一下这段代码的作用：const arr = [1, 2, 3]; const doubled = arr.map(x => x * 2);

Claude：这段代码创建了一个包含 [1, 2, 3] 的数组，然后使用 map 方法将每个元素乘以 2，生成一个新数组 [2, 4, 6]。

你：请使用 MCP 验证服务检查这个回答的质量

Claude：我来使用 Gemini AI 验证服务检查我刚才的回答质量...
```

## 🛠️ 故障排除

### 常见问题

1. **"Server disconnected"**
   - 检查 `cwd` 路径是否正确
   - 确保 `GEMINI_API_KEY` 有效
   - 检查 Node.js 版本兼容性

2. **"找不到工具"**
   - 运行 `node client.js connect` 测试连接
   - 检查服务器是否正常启动

3. **权限错误**
   - 确保 Claude 有访问项目目录的权限
   - 检查文件路径是否正确

### 调试信息
服务器运行时会输出调试信息到 stderr，可以在终端中查看：
```bash
# 手动启动服务器查看日志
GEMINI_API_KEY=你的密钥 node server.js
```

## 📝 功能说明

这个 MCP 服务提供了一个 `verify_ai_result` 工具，用于：
- 验证 AI 生成内容的准确性
- 分析回答的完整性和相关性
- 提供改进建议和评分
- 支持多种验证标准配置

现在你可以在 Claude 中享受 AI 结果验证功能了！