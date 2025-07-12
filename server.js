#!/usr/bin/env node

/**
 * MCP服务器 - 集成Gemini AI的演示服务器
 * MCP Server - Demo server with Gemini AI integration
 * 
 * 本文件实现了完整的MCP (Model Context Protocol) 服务器
 * This file implements a complete MCP (Model Context Protocol) server
 * 
 * MCP协议核心组件说明 / MCP Protocol Core Components:
 * 1. Server: MCP服务器实例，处理客户端连接和请求路由 / MCP server instance that handles client connections and request routing
 * 2. Transport: 传输层，这里使用stdio进行进程间通信 / Transport layer, using stdio for inter-process communication
 * 3. Tools: 工具定义和执行，提供给客户端调用的功能 / Tool definitions and execution, providing functionality for client invocation
 * 4. Request Handlers: 请求处理器，响应MCP协议的标准请求类型 / Request handlers that respond to standard MCP protocol request types
 */

// MCP协议核心SDK导入 / MCP Protocol Core SDK Imports
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,     // 工具调用请求模式 / Tool call request schema
  ErrorCode,                // MCP标准错误码 / MCP standard error codes  
  ListToolsRequestSchema,   // 工具列表请求模式 / Tools list request schema
  McpError,                // MCP错误类型 / MCP error type
} from '@modelcontextprotocol/sdk/types.js';

// 外部依赖 / External Dependencies
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// 加载环境变量 / Load environment variables
dotenv.config();

// ========================================
// 配置和初始化 / Configuration and Initialization
// ========================================

// Gemini API配置 / Gemini API Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// 检查API密钥是否存在 / Check if API key exists
if (!GEMINI_API_KEY) {
  console.error('❌ 错误：未找到GEMINI_API_KEY环境变量 / Error: GEMINI_API_KEY environment variable not found');
  console.error('请设置环境变量或创建.env文件 / Please set environment variable or create .env file');
  console.error('示例 / Example: export GEMINI_API_KEY=your_api_key_here');
  process.exit(1);
}

// ========================================
// 工具函数 / Utility Functions  
// ========================================

/**
 * 延迟函数 / Delay function
 * @param {number} ms - 延迟毫秒数 / Delay in milliseconds
 * @returns {Promise} Promise that resolves after the delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 简单的速率限制器 / Simple rate limiter
 * 防止API调用过于频繁 / Prevents API calls from being too frequent
 */
const rateLimiter = {
  lastCallTime: 0,
  minInterval: 100, // 最小间隔100ms / Minimum interval 100ms
  
  async checkRateLimit() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastCall;
      await delay(waitTime);
    }
    
    this.lastCallTime = Date.now();
  }
};

// ========================================
// MCP服务器初始化 / MCP Server Initialization
// ========================================

/**
 * 创建MCP服务器实例 / Create MCP server instance
 * 
 * MCP服务器是整个协议的核心，负责：
 * The MCP server is the core of the protocol, responsible for:
 * 1. 处理客户端连接 / Handling client connections
 * 2. 路由请求到适当的处理器 / Routing requests to appropriate handlers  
 * 3. 管理服务器能力声明 / Managing server capability declarations
 * 4. 维护会话状态 / Maintaining session state
 */
const server = new Server(
  {
    name: 'gemini-ai-server',    // 服务器标识符 / Server identifier
    version: '1.0.0',           // 服务器版本 / Server version
  },
  {
    capabilities: {
      tools: {},                 // 声明支持工具功能 / Declare tool capabilities
                                // 这告诉MCP客户端此服务器可以执行工具 / This tells MCP clients this server can execute tools
    },
  }
);

// ========================================
// 外部API集成 / External API Integration
// ========================================

/**
 * 调用Gemini API的通用函数（带重试机制和速率限制）
 * Generic function to call Gemini API (with retry logic and rate limiting)
 * 
 * 这个函数封装了与外部AI服务的交互，虽然不是MCP协议的一部分，
 * 但它为MCP工具提供了底层能力支持
 * This function encapsulates interaction with external AI services. While not part of the MCP protocol,
 * it provides underlying capability support for MCP tools
 * 
 * @param {string} prompt - 用户提示 / User prompt
 * @param {string} systemInstruction - 系统指令 / System instruction  
 * @param {number} retries - 重试次数 / Number of retries
 * @returns {Promise<string>} AI生成的回复 / AI generated response
 */
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

// ========================================
// MCP协议请求处理器 / MCP Protocol Request Handlers
// ========================================

/**
 * 处理工具列表请求 / Handle list tools request
 * 
 * 这是MCP协议中的标准请求类型之一：tools/list
 * This is one of the standard request types in MCP protocol: tools/list
 * 
 * 当MCP客户端想要了解服务器提供哪些工具时，会发送此请求
 * When MCP clients want to discover what tools the server provides, they send this request
 * 
 * 响应必须包含tools数组，每个工具包含：
 * Response must contain a tools array, each tool includes:
 * - name: 工具名称 / Tool name
 * - description: 工具描述 / Tool description  
 * - inputSchema: JSON Schema定义输入参数 / JSON Schema defining input parameters
 */
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

/**
 * 处理工具调用请求 / Handle tool call requests
 * 
 * 这是MCP协议中的另一个标准请求类型：tools/call
 * This is another standard request type in MCP protocol: tools/call
 * 
 * 当MCP客户端想要执行特定工具时，会发送此请求
 * When MCP clients want to execute a specific tool, they send this request
 * 
 * 请求包含：
 * Request includes:
 * - name: 要调用的工具名称 / Name of tool to call
 * - arguments: 工具参数对象 / Tool arguments object
 * 
 * 响应必须包含：
 * Response must include:
 * - content: 内容数组，包含工具执行结果 / Content array containing tool execution results
 * - isError: (可选) 指示是否发生错误 / (Optional) indicates if an error occurred
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'generate_text': {
        /**
         * 文本生成工具实现 / Text generation tool implementation
         * 
         * MCP工具的标准实现模式：
         * Standard implementation pattern for MCP tools:
         * 1. 参数验证 / Parameter validation
         * 2. 业务逻辑执行 / Business logic execution  
         * 3. 结果格式化 / Result formatting
         * 4. 错误处理 / Error handling
         */
        const { prompt } = args;
        if (typeof prompt !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, '提示必须是字符串 / Prompt must be a string');
        }

        try {
          const result = await callGeminiAPI(prompt);
          
          // MCP标准响应格式 / MCP standard response format
          return {
            content: [              // content数组是MCP协议要求的 / content array is required by MCP protocol
              {
                type: 'text',       // 内容类型：text | image | resource / Content type: text | image | resource
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
            
          // 错误情况下的MCP响应格式 / MCP response format for error cases
          return {
            content: [
              {
                type: 'text',
                text: errorMessage,
              },
            ],
            // 注意：可以添加 isError: true 来明确标识错误状态
            // Note: could add isError: true to explicitly mark error state
          };
        }
      }

      case 'translate_text': {
        // 文本翻译工具实现 / Text translation tool implementation
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
        // 文本总结工具实现 / Text summarization tool implementation
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
        // MCP协议错误处理：工具不存在 / MCP protocol error handling: tool not found
        throw new McpError(ErrorCode.MethodNotFound, `未知工具 / Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`工具执行错误 / Tool execution error [${name}]:`, error);
    // MCP协议错误处理：内部错误 / MCP protocol error handling: internal error
    throw new McpError(ErrorCode.InternalError, `工具执行失败 / Tool execution failed: ${error.message}`);
  }
});

// ========================================
// MCP服务器启动和传输层 / MCP Server Startup and Transport Layer
// ========================================

/**
 * 启动服务器主函数 / Main server startup function
 * 
 * MCP传输层说明 / MCP Transport Layer Explanation:
 * MCP协议支持多种传输方式，这里使用stdio（标准输入输出）
 * MCP protocol supports multiple transport methods, here we use stdio (standard input/output)
 * 
 * stdio传输的工作原理：
 * How stdio transport works:
 * 1. 服务器通过stdin接收来自客户端的JSON-RPC消息 / Server receives JSON-RPC messages from client via stdin
 * 2. 服务器通过stdout发送响应给客户端 / Server sends responses to client via stdout  
 * 3. stderr用于日志输出，不影响协议通信 / stderr is used for logging, doesn't affect protocol communication
 */
async function main() {
  // 创建标准输入输出传输层实例 / Create stdio transport layer instance
  const transport = new StdioServerTransport();
  
  // 连接MCP服务器和传输层 / Connect MCP server and transport layer
  // 这建立了服务器与客户端之间的通信通道 / This establishes communication channel between server and client
  await server.connect(transport);
  
  console.error('Gemini AI MCP服务器已启动 / Gemini AI MCP server started');
}

// ========================================
// 错误处理和进程管理 / Error Handling and Process Management
// ========================================

/**
 * 全局错误处理 / Global error handling
 * 
 * 对于MCP服务器，正确的错误处理非常重要：
 * For MCP servers, proper error handling is crucial:
 * 1. 防止服务器意外崩溃中断客户端连接 / Prevent server crashes that interrupt client connections
 * 2. 确保错误信息被正确记录 / Ensure error information is properly logged
 * 3. 在必要时优雅地关闭服务器 / Gracefully shut down server when necessary
 */

// 处理未捕获的同步异常 / Handle uncaught synchronous exceptions
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常 / Uncaught exception:', error);
  process.exit(1);
});

// 处理未处理的Promise拒绝 / Handle unhandled Promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝 / Unhandled promise rejection:', reason);
  process.exit(1);
});

// 启动主函数 / Start main function
main().catch((error) => {
  console.error('服务器启动失败 / Server startup failed:', error);
  process.exit(1);
});