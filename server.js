#!/usr/bin/env node

/**
 * MCP Gemini AI 服务器 - 为Claude提供AI文本处理能力
 * MCP Gemini AI Server - Provides AI text processing capabilities for Claude
 * 
 * MCP协议核心组件 / MCP Protocol Core Components:
 * - Server: 处理Claude的连接和请求 / Handles Claude's connections and requests  
 * - Tools: 提供文本生成、翻译、总结功能 / Provides text generation, translation, summarization
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
  });

  // 检查响应状态 / Check response status
  if (!response.ok) {
    throw new Error(`Gemini API错误: ${response.status} ${response.statusText}`);
  }

  // 解析响应并提取文本 / Parse response and extract text
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '无法获取响应';
}

// 工具列表 - Claude通过此接口发现可用工具 / Tool List - Claude discovers available tools via this interface
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'generate_text',
      description: '使用Gemini AI生成文本',
      inputSchema: {
        type: 'object',
        properties: { prompt: { type: 'string', description: '文本生成提示' } },
        required: ['prompt']
      }
    },
    {
      name: 'translate_text', 
      description: '使用Gemini AI翻译文本',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: '要翻译的文本' },
          target_language: { type: 'string', description: '目标语言' }
        },
        required: ['text', 'target_language']
      }
    },
    {
      name: 'summarize_text',
      description: '使用Gemini AI总结文本', 
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: '要总结的文本' },
          max_length: { type: 'number', description: '最大字数', default: 100 }
        },
        required: ['text']
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
      case 'generate_text': {
        // 文本生成工具 / Text generation tool
        const { prompt } = args;
        // 验证参数类型 / Validate parameter types
        if (typeof prompt !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, '提示必须是字符串 / Prompt must be a string');
        }
        // 调用Gemini API生成文本 / Call Gemini API to generate text
        const result = await callGeminiAPI(prompt);
        return { content: [{ type: 'text', text: result }] };
      }

      case 'translate_text': {
        // 文本翻译工具 / Text translation tool
        const { text, target_language } = args;
        // 验证参数类型 / Validate parameter types
        if (typeof text !== 'string' || typeof target_language !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, '文本和目标语言必须是字符串 / Text and target language must be strings');
        }
        // 构建翻译提示 / Build translation prompt
        const prompt = `请将以下文本翻译成${target_language}：\n${text}`;
        // 使用专门的翻译指令调用API / Call API with specialized translation instruction
        const result = await callGeminiAPI(prompt, '你是翻译助手，只返回翻译结果。');
        return { content: [{ type: 'text', text: result }] };
      }

      case 'summarize_text': {
        // 文本总结工具 / Text summarization tool
        const { text, max_length = 100 } = args;
        // 验证参数类型 / Validate parameter types
        if (typeof text !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, '文本必须是字符串 / Text must be a string');
        }
        // 构建总结提示 / Build summarization prompt
        const prompt = `请总结以下文本，限制在${max_length}字以内：\n${text}`;
        // 使用专门的总结指令调用API / Call API with specialized summarization instruction
        const result = await callGeminiAPI(prompt, '你是总结助手，提供简洁准确的总结。');
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
  console.error('Gemini AI MCP服务器已启动 / Gemini AI MCP Server started');
}

// 错误处理 / Error Handling
process.on('uncaughtException', (error) => {
  console.error('未捕获异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 启动服务器 / Start Server
main().catch((error) => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});