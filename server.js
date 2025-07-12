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
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
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

// 调用Gemini API / Call Gemini API
async function callGeminiAPI(prompt, systemInstruction = '') {
  const requestBody = {
    contents: [{
      parts: [{ text: systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt }]
    }]
  };

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Gemini API错误: ${response.status} ${response.statusText}`);
  }

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
    switch (name) {
      case 'generate_text': {
        const { prompt } = args;
        if (typeof prompt !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, '提示必须是字符串');
        }
        const result = await callGeminiAPI(prompt);
        return { content: [{ type: 'text', text: result }] };
      }

      case 'translate_text': {
        const { text, target_language } = args;
        if (typeof text !== 'string' || typeof target_language !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, '文本和目标语言必须是字符串');
        }
        const prompt = `请将以下文本翻译成${target_language}：\n${text}`;
        const result = await callGeminiAPI(prompt, '你是翻译助手，只返回翻译结果。');
        return { content: [{ type: 'text', text: result }] };
      }

      case 'summarize_text': {
        const { text, max_length = 100 } = args;
        if (typeof text !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, '文本必须是字符串');
        }
        const prompt = `请总结以下文本，限制在${max_length}字以内：\n${text}`;
        const result = await callGeminiAPI(prompt, '你是总结助手，提供简洁准确的总结。');
        return { content: [{ type: 'text', text: result }] };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `未知工具: ${name}`);
    }
  } catch (error) {
    if (error instanceof McpError) throw error;
    throw new McpError(ErrorCode.InternalError, `工具执行失败: ${error.message}`);
  }
});

// 启动服务器 - 通过stdio与Claude通信 / Start Server - Communicate with Claude via stdio
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Gemini AI MCP服务器已启动');
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