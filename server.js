#!/usr/bin/env node

/**
 * 多AI提供商MCP验证服务器 - 支持多个AI提供商验证AI生成结果的准确性
 * Multi-AI Provider MCP Verification Server - Supports multiple AI providers to verify accuracy of AI-generated results
 * 
 * MCP协议核心组件 / MCP Protocol Core Components:
 * - Server: 处理MCP客户端的连接和请求 / Handles MCP client connections and requests  
 * - Tools: 提供AI结果验证、思维链生成和提示优化功能 / Provides AI result verification, thought chain generation, and prompt optimization functionality
 * - Transport: 通过stdio与MCP客户端通信 / Communicates with MCP clients via stdio
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// AI Provider配置 / AI Provider Configuration
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'; // 默认使用Gemini / Default to Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4';

// Gemini AI API端点URL / Gemini AI API endpoint URL
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// 验证必要的API密钥 / Validate required API keys
if (AI_PROVIDER === 'gemini' && !GEMINI_API_KEY) {
  console.error('❌ 请设置GEMINI_API_KEY环境变量 / Please set GEMINI_API_KEY environment variable');
  process.exit(1);
}

if (AI_PROVIDER === 'openai' && !OPENAI_API_KEY) {
  console.error('❌ 请设置OPENAI_API_KEY环境变量 / Please set OPENAI_API_KEY environment variable');
  process.exit(1);
}

console.error(`🤖 使用AI提供商: ${AI_PROVIDER} / Using AI provider: ${AI_PROVIDER}`);

// MCP服务器实例 / MCP Server Instance
const server = new Server(
  { name: 'multi-ai-server', version: '1.0.0' },
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
    throw error;
  }
}

/**
 * 调用OpenAI格式API / Call OpenAI format API
 * 发送请求到OpenAI兼容的AI服务并返回生成的文本 / Send request to OpenAI-compatible AI service and return generated text
 * @param {string} prompt - 用户提示 / User prompt
 * @param {string} systemInstruction - 系统指令（可选）/ System instruction (optional)
 * @returns {Promise<string>} 生成的文本响应 / Generated text response
 */
async function callOpenAIAPI(prompt, systemInstruction = '') {
  try {
    // 构建消息数组 / Build messages array
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    // 构建API请求体 / Build API request body
    const requestBody = {
      model: OPENAI_MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 4000
    };

    // 发送HTTP请求到OpenAI API / Send HTTP request to OpenAI API
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
      timeout: 30000, // 30秒超时
    });

    // 检查响应状态 / Check response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API错误: ${response.status} ${response.statusText}`);
      throw new Error(`OpenAI API错误: ${response.status} ${response.statusText}`);
    }

    // 解析响应并提取文本 / Parse response and extract text
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '无法获取响应';
  } catch (error) {
    console.error('OpenAI API调用失败:', error.message);
    throw error;
  }
}

/**
 * 调用AI Provider / Call AI Provider
 * 根据配置的提供商调用相应的API / Call appropriate API based on configured provider
 * @param {string} prompt - 用户提示 / User prompt
 * @param {string} systemInstruction - 系统指令（可选）/ System instruction (optional)
 * @returns {Promise<string>} 生成的文本响应 / Generated text response
 */
async function callAIProvider(prompt, systemInstruction = '') {
  try {
    switch (AI_PROVIDER) {
      case 'gemini':
        return await callGeminiAPI(prompt, systemInstruction);
      case 'openai':
        return await callOpenAIAPI(prompt, systemInstruction);
      default:
        throw new Error(`不支持的AI提供商: ${AI_PROVIDER} / Unsupported AI provider: ${AI_PROVIDER}`);
    }
  } catch (error) {
    console.error(`${AI_PROVIDER} API调用失败:`, error.message);
    // 不要重新抛出错误，而是返回错误信息
    return `AI服务暂时不可用: ${error.message}`;
  }
}

// 工具列表 - Claude通过此接口发现可用工具 / Tool List - Claude discovers available tools via this interface
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'verify_ai_result',
      description: '使用AI验证AI生成结果的准确性和质量 / Use AI to verify accuracy and quality of AI-generated results',
      inputSchema: {
        type: 'object',
        properties: {
          original_prompt: { type: 'string', description: '原始提示或问题 / Original prompt or question' },
          ai_result: { type: 'string', description: 'AI生成的结果 / AI-generated result' },
          verification_criteria: {
            type: 'string',
            description: '验证标准（可选）：accuracy, completeness, relevance, clarity等 / Verification criteria (optional): accuracy, completeness, relevance, clarity, etc.',
            default: 'accuracy,completeness,relevance'
          }
        },
        required: ['original_prompt', 'ai_result']
      }
    },
    {
      name: 'generate_thought_chain',
      description: '使用AI为问题生成思维链，帮助AI模型进行深度推理 / Use AI to generate thought chains for deep reasoning',
      inputSchema: {
        type: 'object',
        properties: {
          question: { type: 'string', description: '需要生成思维链的问题或任务 / Question or task to generate thinking for' },
          domain: {
            type: 'string',
            description: '问题领域（可选）：math, science, coding, analysis, creative等 / Problem domain (optional): math, science, coding, analysis, creative, etc.',
            default: 'general'
          },
          depth: {
            type: 'string',
            description: '思维链深度（可选）：basic, detailed, comprehensive / Thinking depth (optional): basic, detailed, comprehensive',
            default: 'detailed'
          }
        },
        required: ['question']
      }
    },
    {
      name: 'optimize_prompt',
      description: '使用AI优化用户提示，让AI能更好地理解和回答问题 / Use AI to optimize user prompts for better understanding',
      inputSchema: {
        type: 'object',
        properties: {
          original_prompt: { type: 'string', description: '需要优化的原始提示 / Original prompt to optimize' },
          goal: {
            type: 'string',
            description: '优化目标（可选）：clarity, specificity, context, structure等 / Optimization goals (optional): clarity, specificity, context, structure, etc.',
            default: 'clarity,specificity'
          },
          target_model: {
            type: 'string',
            description: '目标AI模型（可选）：claude, gpt, gemini, general / Target AI model (optional): claude, gpt, gemini, general',
            default: 'general'
          }
        },
        required: ['original_prompt']
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
        const { original_prompt, ai_result, verification_criteria = 'accuracy,completeness,relevance' } = args;

        // 验证参数类型 / Validate parameter types
        if (typeof original_prompt !== 'string' || typeof ai_result !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, '原始提示和AI结果必须是字符串 / Original prompt and AI result must be strings');
        }

        // 构建验证提示 / Build verification prompt
        const verificationPrompt = `
请作为一个专业的AI输出质量评估专家，分析以下AI生成的结果：

原始问题/提示：
${original_prompt}

AI的回答：
${ai_result}

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
        const result = await callAIProvider(verificationPrompt, systemInstruction);

        return { content: [{ type: 'text', text: result }] };
      }

      case 'generate_thought_chain': {
        // 生成思维链工具 / Generate thought chain tool
        const { question, domain = 'general', depth = 'detailed' } = args;

        // 验证参数类型 / Validate parameter types
        if (typeof question !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, '问题必须是字符串 / Question must be a string');
        }

        // 根据深度级别构建不同的思维链提示 / Build different thought chain prompts based on depth level
        let depthInstruction = '';
        switch (depth) {
          case 'basic':
            depthInstruction = '请提供简洁的3-5步思维过程';
            break;
          case 'comprehensive':
            depthInstruction = '请提供详尽的多层次思维分析，包括假设、推理、验证等步骤';
            break;
          default: // detailed
            depthInstruction = '请提供详细的逐步思维过程';
        }

        // 构建思维链生成提示 / Build thought chain generation prompt
        const thoughtChainPrompt = `
请为以下问题生成一个结构化的思维链，帮助AI模型进行深度推理：

问题：${question}
领域：${domain}
深度要求：${depthInstruction}

请按以下格式生成思维链：

1. 问题分析：
   - 理解问题的核心要求
   - 识别关键概念和约束条件
   - 确定解决问题需要的知识领域

2. 思维步骤：
   - 步骤1: [具体的思考过程]
   - 步骤2: [具体的思考过程]
   - 步骤3: [具体的思考过程]
   - ... (根据问题复杂度继续)

3. 推理验证：
   - 检查逻辑的连贯性
   - 验证每个步骤的合理性
   - 识别可能的盲点或错误

4. 结论准备：
   - 总结关键发现
   - 准备最终答案的框架

请确保思维链能够引导AI模型系统性地思考问题，而不是直接给出答案。`;

        // 使用专门的思维链生成指令调用API / Call API with specialized thought chain generation instruction
        const systemInstruction = '你是一个专业的认知科学专家，擅长设计思维链来帮助AI模型进行深度推理。请生成结构化、逻辑清晰的思维过程，重点是引导思考而非直接给答案。';
        const result = await callAIProvider(thoughtChainPrompt, systemInstruction);

        return { content: [{ type: 'text', text: result }] };
      }

      case 'optimize_prompt': {
        // 提示优化工具 / Prompt optimization tool
        const { original_prompt, goal = 'clarity,specificity', target_model = 'general' } = args;

        // 验证参数类型 / Validate parameter types
        if (typeof original_prompt !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, '原始提示必须是字符串 / Original prompt must be a string');
        }

        // 根据目标模型调整优化策略 / Adjust optimization strategy based on target model
        let modelSpecificGuidance = '';
        switch (target_model) {
          case 'claude':
            modelSpecificGuidance = '针对Claude的特点，强调清晰的结构和具体的上下文信息';
            break;
          case 'gpt':
            modelSpecificGuidance = '针对GPT的特点，强调明确的指令和期望的输出格式';
            break;
          case 'gemini':
            modelSpecificGuidance = '针对Gemini的特点，强调详细的说明和多步骤的任务分解';
            break;
          default:
            modelSpecificGuidance = '通用优化，适用于大多数AI模型';
        }

        // 构建提示优化提示 / Build prompt optimization prompt
        const optimizationPrompt = `
请优化以下用户提示，使其更加清晰、具体和有效：

原始提示：
${original_prompt}

优化目标：${goal}
目标AI模型：${target_model}
模型特定指导：${modelSpecificGuidance}

请提供优化后的提示，并按以下格式输出：

## 优化后的提示：
[在这里提供重写后的、更优化的提示]

## 优化说明：
1. 清晰度改进：[说明如何提高了提示的清晰度]
2. 具体性增强：[说明如何增加了具体性和可操作性]
3. 结构优化：[说明如何改善了提示的结构]
4. 上下文补充：[说明添加了哪些有用的上下文信息]

## 使用建议：
[提供如何更好地使用优化后提示的建议]

请确保优化后的提示能够帮助AI模型更准确地理解用户意图并提供更好的回答。`;

        // 使用专门的提示优化指令调用API / Call API with specialized prompt optimization instruction
        const systemInstruction = '你是一个专业的提示工程专家，擅长优化AI提示以获得更好的结果。请分析原始提示的不足之处，并提供结构化、具体、有效的改进版本。';
        const result = await callAIProvider(optimizationPrompt, systemInstruction);

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
  console.error(`多AI提供商验证服务器已启动 (${AI_PROVIDER}) / Multi-AI Provider Verification Server started (${AI_PROVIDER})`);
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