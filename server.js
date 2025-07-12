#!/usr/bin/env node

/**
 * MCP Gemini AI 验证服务器 - 使用Gemini验证Claude生成结果的准确性
 * MCP Gemini AI Verification Server - Uses Gemini to verify accuracy of Claude-generated results
 * 
 * MCP协议核心组件 / MCP Protocol Core Components:
 * - Server: 处理Claude的连接和请求 / Handles Claude's connections and requests  
 * - Tools: 提供AI结果验证功能 / Provides AI result verification functionality
 * - Transport: 通过stdio与Claude通信 / Communicates with Claude via stdio
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// API配置 / API Configuration
// 从环境变量获取Gemini API密钥 / Get Gemini API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Gemini AI API端点URL / Gemini AI API endpoint URL
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

if (!GEMINI_API_KEY) {
  console.error('❌ 请设置GEMINI_API_KEY环境变量 / Please set GEMINI_API_KEY environment variable');
  process.exit(1);
}

// MCP服务器实例 / MCP Server Instance
const server = new Server(
  { name: 'gemini-ai-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

/**
 * 调用Gemini API / Call Gemini API
 * 发送请求到Gemini AI服务并返回生成的文本 / Send request to Gemini AI service and return generated text
 * @param {string} prompt - 用户提示 / User prompt
 * @param {string} systemInstruction - 系统指令（可选）/ System instruction (optional)
 * @returns {Promise<string>} 生成的文本响应 / Generated text response
 */
async function callGeminiAPI(prompt, systemInstruction = '') {
  try {
    // 构建API请求体 / Build API request body
    const requestBody = {
      contents: [{
        parts: [{ text: systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt }]
      }]
    };


    // 发送HTTP请求到Gemini API / Send HTTP request to Gemini API
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify(requestBody),
      timeout: 30000, // 30秒超时
    });

    // 检查响应状态 / Check response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API错误: ${response.status} ${response.statusText}`);
      throw new Error(`Gemini API错误: ${response.status} ${response.statusText}`);
    }

    // 解析响应并提取文本 / Parse response and extract text
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '无法获取响应';
  } catch (error) {
    console.error('Gemini API调用失败:', error.message);
    // 不要重新抛出错误，而是返回错误信息
    return `验证服务暂时不可用: ${error.message}`;
  }
}

// 工具列表 - Claude通过此接口发现可用工具 / Tool List - Claude discovers available tools via this interface
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'verify_ai_result',
      description: '使用Gemini AI验证Claude生成结果的准确性和质量',
      inputSchema: {
        type: 'object',
        properties: {
          original_prompt: { type: 'string', description: '原始提示或问题' },
          claude_result: { type: 'string', description: 'Claude生成的结果' },
          verification_criteria: { 
            type: 'string', 
            description: '验证标准（可选）：accuracy, completeness, relevance, clarity等',
            default: 'accuracy,completeness,relevance'
          }
        },
        required: ['original_prompt', 'claude_result']
      }
    }
  ]
}));

// 工具执行 - Claude调用具体工具时的处理逻辑 / Tool Execution - Logic when Claude calls specific tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // 根据工具名称执行相应的处理逻辑 / Execute corresponding logic based on tool name
    switch (name) {
      case 'verify_ai_result': {
        // AI结果验证工具 / AI result verification tool
        const { original_prompt, claude_result, verification_criteria = 'accuracy,completeness,relevance' } = args;
        
        // 验证参数类型 / Validate parameter types
        if (typeof original_prompt !== 'string' || typeof claude_result !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, '原始提示和Claude结果必须是字符串 / Original prompt and Claude result must be strings');
        }
        
        // 构建验证提示 / Build verification prompt
        const verificationPrompt = `
请作为一个专业的AI输出质量评估专家，分析以下Claude生成的结果：

原始问题/提示：
${original_prompt}

Claude的回答：
${claude_result}

请根据以下标准进行评估：${verification_criteria}

请提供详细的验证报告，包括：
1. 准确性分析（是否回答了问题，信息是否正确）
2. 完整性分析（是否遗漏重要信息）
3. 相关性分析（回答是否切题）
4. 建议改进（如有问题，请提出具体改进建议）
5. 总体评分（1-10分）

请以结构化的方式回复。`;
        
        // 使用专门的验证指令调用API / Call API with specialized verification instruction
        const systemInstruction = '你是一个专业的AI输出质量评估专家，负责客观、全面地评估AI生成内容的质量。请提供详细、准确、有建设性的反馈。';
        const result = await callGeminiAPI(verificationPrompt, systemInstruction);
        
        return { content: [{ type: 'text', text: result }] };
      }

      default:
        // 处理未知工具请求 / Handle unknown tool requests
        throw new McpError(ErrorCode.MethodNotFound, `未知工具: ${name} / Unknown tool: ${name}`);
    }
  } catch (error) {
    // 错误处理：区分MCP错误和其他错误 / Error handling: distinguish MCP errors from other errors
    if (error instanceof McpError) throw error;
    throw new McpError(ErrorCode.InternalError, `工具执行失败: ${error.message} / Tool execution failed: ${error.message}`);
  }
});

/**
 * 启动服务器 - 通过stdio与Claude通信 / Start Server - Communicate with Claude via stdio
 * 初始化传输层并启动MCP服务器 / Initialize transport layer and start MCP server
 */
async function main() {
  // 创建stdio传输实例 / Create stdio transport instance
  const transport = new StdioServerTransport();
  // 连接服务器到传输层 / Connect server to transport layer
  await server.connect(transport);
  // 输出启动信息到stderr（避免干扰MCP通信）/ Output startup info to stderr (avoid interfering with MCP communication)
  console.error('Gemini AI 验证服务器已启动 / Gemini AI Verification Server started');
}

// 错误处理 / Error Handling
process.on('uncaughtException', (error) => {
  console.error('未捕获异常:', error);
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason) => {
  console.error('未处理的Promise拒绝:', reason);
  setTimeout(() => process.exit(1), 1000);
});

// 优雅关闭处理 / Graceful shutdown handling
process.on('SIGINT', async () => {
  console.error('正在关闭服务器...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('正在关闭服务器...');
  process.exit(0);
});

// 启动服务器 / Start Server
main().catch((error) => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});