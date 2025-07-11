#!/usr/bin/env node

// MCP服务器 - 集成Gemini AI的演示服务器
// MCP Server - Demo server with Gemini AI integration

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// 加载环境变量 / Load environment variables
dotenv.config();

// Gemini API配置 / Gemini API Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// 检查API密钥是否存在 / Check if API key exists
if (!GEMINI_API_KEY) {
  console.error('❌ 错误：未找到GEMINI_API_KEY环境变量 / Error: GEMINI_API_KEY environment variable not found');
  console.error('请设置环境变量或创建.env文件 / Please set environment variable or create .env file');
  console.error('示例 / Example: export GEMINI_API_KEY=your_api_key_here');
  process.exit(1);
}

// 创建MCP服务器实例 / Create MCP server instance
const server = new Server(
  {
    name: 'gemini-ai-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {}, // 声明支持工具功能 / Declare tool capabilities
    },
  }
);

// 延迟函数 / Delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 简单的速率限制器 / Simple rate limiter
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) { // 默认每分钟10次 / Default 10 requests per minute
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async checkRateLimit() {
    const now = Date.now();
    
    // 清理过期的请求记录 / Clear expired request records
    this.requests = this.requests.filter(timestamp => now - timestamp < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest);
      console.warn(`速率限制：等待 ${waitTime}ms / Rate limit: waiting ${waitTime}ms`);
      await delay(waitTime);
      return this.checkRateLimit(); // 递归检查 / Recursive check
    }
    
    // 记录当前请求 / Record current request
    this.requests.push(now);
    return true;
  }
}

// 创建速率限制器实例 / Create rate limiter instance
const rateLimiter = new RateLimiter(15, 60000); // 每分钟15次请求 / 15 requests per minute

// 调用Gemini API的通用函数（带重试机制和速率限制） / Generic function to call Gemini API (with retry logic and rate limiting)
async function callGeminiAPI(prompt, systemInstruction = '', retries = 3) {
  // 检查速率限制 / Check rate limit
  await rateLimiter.checkRateLimit();
  
  const maxRetries = retries;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 构建请求体 / Build request body
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt
              }
            ]
          }
        ]
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

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`Gemini API error: ${response.status} ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
        
        // 如果是503服务不可用或429限流，可以重试 / If 503 Service Unavailable or 429 Rate Limited, can retry
        if (response.status === 503 || response.status === 429) {
          lastError = error;
          console.warn(`尝试 ${attempt}/${maxRetries} 失败，${response.status} 错误，${attempt < maxRetries ? '重试中...' : '已达到最大重试次数'} / Attempt ${attempt}/${maxRetries} failed with ${response.status} error, ${attempt < maxRetries ? 'retrying...' : 'max retries reached'}`);
          
          if (attempt < maxRetries) {
            // 指数退避：1秒、2秒、4秒 / Exponential backoff: 1s, 2s, 4s
            const waitTime = Math.pow(2, attempt - 1) * 1000;
            await delay(waitTime);
            continue;
          }
        }
        
        throw error;
      }

      const data = await response.json();
      
      // 提取生成的文本 / Extract generated text
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Unexpected response format from Gemini API: ' + JSON.stringify(data));
      }
    } catch (error) {
      lastError = error;
      
      // 如果不是网络相关错误，不重试 / If not network-related error, don't retry
      if (!error.message.includes('503') && !error.message.includes('429') && !error.message.includes('ECONNRESET') && !error.message.includes('ETIMEDOUT')) {
        console.error('Gemini API调用失败（非重试错误） / Gemini API call failed (non-retryable error):', error);
        throw error;
      }
      
      console.warn(`尝试 ${attempt}/${maxRetries} 失败：${error.message} / Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt - 1) * 1000;
        console.log(`等待 ${waitTime}ms 后重试... / Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
      }
    }
  }

  console.error('Gemini API调用失败，已达到最大重试次数 / Gemini API call failed after max retries:', lastError);
  throw lastError;
}

// 处理工具列表请求 / Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_text',
        description: '使用Gemini AI生成文本 / Generate text using Gemini AI',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: '要生成文本的提示 / Prompt for text generation',
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'translate_text',
        description: '使用Gemini AI翻译文本 / Translate text using Gemini AI',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: '要翻译的文本 / Text to translate',
            },
            target_language: {
              type: 'string',
              description: '目标语言 / Target language',
            },
          },
          required: ['text', 'target_language'],
        },
      },
      {
        name: 'summarize_text',
        description: '使用Gemini AI总结文本 / Summarize text using Gemini AI',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: '要总结的文本 / Text to summarize',
            },
            max_length: {
              type: 'number',
              description: '最大总结长度（字数） / Maximum summary length in words',
              default: 100,
            },
          },
          required: ['text'],
        },
      },
    ],
  };
});

// 处理工具调用请求 / Handle tool call requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'generate_text': {
        // 文本生成工具 / Text generation tool
        const { prompt } = args;
        if (typeof prompt !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, '提示必须是字符串 / Prompt must be a string');
        }

        try {
          const result = await callGeminiAPI(prompt);
          
          return {
            content: [
              {
                type: 'text',
                text: `生成的文本 / Generated text:\n${result}`,
              },
            ],
          };
        } catch (error) {
          // 如果API调用失败，提供有用的错误信息 / If API call fails, provide helpful error message
          const errorMessage = error.message.includes('503') 
            ? '⚠️ Gemini AI服务暂时不可用，请稍后重试 / Gemini AI service temporarily unavailable, please try again later'
            : error.message.includes('429')
            ? '⚠️ API调用频率过高，请稍后重试 / API rate limit exceeded, please try again later'
            : `❌ API调用失败 / API call failed: ${error.message}`;
            
          return {
            content: [
              {
                type: 'text',
                text: errorMessage,
              },
            ],
          };
        }
      }

      case 'translate_text': {
        // 文本翻译工具 / Text translation tool
        const { text, target_language } = args;
        if (typeof text !== 'string' || typeof target_language !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, '文本和目标语言必须是字符串 / Text and target language must be strings');
        }

        try {
          const prompt = `请将以下文本翻译成${target_language}：\n${text}`;
          const systemInstruction = '你是一个专业的翻译助手，请提供准确的翻译。只返回翻译结果，不要添加额外说明。';
          
          const result = await callGeminiAPI(prompt, systemInstruction);
          
          return {
            content: [
              {
                type: 'text',
                text: `翻译结果 / Translation result:\n${result}`,
            },
            ],
          };
        } catch (error) {
          const errorMessage = error.message.includes('503') 
            ? '⚠️ 翻译服务暂时不可用，请稍后重试 / Translation service temporarily unavailable, please try again later'
            : error.message.includes('429')
            ? '⚠️ API调用频率过高，请稍后重试 / API rate limit exceeded, please try again later'
            : `❌ 翻译失败 / Translation failed: ${error.message}`;
            
          return {
            content: [
              {
                type: 'text',
                text: errorMessage,
              },
            ],
          };
        }
      }

      case 'summarize_text': {
        // 文本总结工具 / Text summarization tool
        const { text, max_length = 100 } = args;
        if (typeof text !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, '文本必须是字符串 / Text must be a string');
        }

        try {
          const prompt = `请总结以下文本，限制在${max_length}字以内：\n${text}`;
          const systemInstruction = '你是一个专业的文本总结助手，请提供简洁准确的总结。';
          
          const result = await callGeminiAPI(prompt, systemInstruction);
          
          return {
            content: [
              {
                type: 'text',
                text: `总结结果 / Summary result:\n${result}`,
              },
            ],
          };
        } catch (error) {
          const errorMessage = error.message.includes('503') 
            ? '⚠️ 总结服务暂时不可用，请稍后重试 / Summary service temporarily unavailable, please try again later'
            : error.message.includes('429')
            ? '⚠️ API调用频率过高，请稍后重试 / API rate limit exceeded, please try again later'
            : `❌ 总结失败 / Summary failed: ${error.message}`;
            
          return {
            content: [
              {
                type: 'text',
                text: errorMessage,
              },
            ],
          };
        }
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `未知工具 / Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`工具执行错误 / Tool execution error [${name}]:`, error);
    throw new McpError(ErrorCode.InternalError, `工具执行失败 / Tool execution failed: ${error.message}`);
  }
});

// 启动服务器 / Start the server
async function main() {
  // 创建标准输入输出传输 / Create stdio transport
  const transport = new StdioServerTransport();
  
  // 连接服务器和传输 / Connect server and transport
  await server.connect(transport);
  
  console.error('Gemini AI MCP服务器已启动 / Gemini AI MCP server started');
}

// 处理未捕获的错误 / Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常 / Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝 / Unhandled promise rejection:', reason);
  process.exit(1);
});

// 启动主函数 / Start main function
main().catch((error) => {
  console.error('服务器启动失败 / Server startup failed:', error);
  process.exit(1);
});