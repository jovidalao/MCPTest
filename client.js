#!/usr/bin/env node

// MCP客户端 - 连接到Gemini AI服务器的演示客户端
// MCP Client - Demo client that connects to Gemini AI server

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

// 创建MCP客户端实例 / Create MCP client instance
const client = new Client(
  {
    name: 'gemini-ai-client',
    version: '1.0.0',
  },
  {
    capabilities: {}, // 客户端能力声明 / Client capabilities declaration
  }
);

// 启动服务器进程并连接 / Start server process and connect
async function connectToServer() {
  try {
    console.log('正在启动MCP服务器... / Starting MCP server...');
    
    // 创建客户端传输 / Create client transport
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['server.js'],
    });

    // 连接客户端和传输 / Connect client and transport
    await client.connect(transport);
    
    console.log('✅ 成功连接到MCP服务器 / Successfully connected to MCP server');
    
    // 优雅关闭处理 / Graceful shutdown handling
    process.on('SIGINT', async () => {
      console.log('\n正在关闭连接... / Closing connection...');
      await client.close();
      process.exit(0);
    });

    return transport;
  } catch (error) {
    console.error('连接服务器失败 / Failed to connect to server:', error);
    throw error;
  }
}

// 获取可用工具列表 / Get available tools list
async function listTools() {
  try {
    console.log('\n📋 获取可用工具列表... / Getting available tools list...');
    
    const response = await client.listTools();

    console.log('可用工具 / Available tools:');
    response.tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}`);
      console.log(`   描述 / Description: ${tool.description}`);
      console.log(`   参数 / Parameters:`, JSON.stringify(tool.inputSchema.properties, null, 2));
      console.log('');
    });

    return response.tools;
  } catch (error) {
    console.error('获取工具列表失败 / Failed to get tools list:', error);
    throw error;
  }
}

// 调用工具的通用函数 / Generic function to call tools
async function callTool(toolName, args) {
  try {
    console.log(`\n🔧 调用工具 / Calling tool: ${toolName}`);
    console.log('参数 / Arguments:', JSON.stringify(args, null, 2));
    
    const response = await client.callTool({
      name: toolName,
      arguments: args,
    });

    console.log('✅ 工具调用成功 / Tool call successful');
    console.log('结果 / Result:');
    response.content.forEach((content) => {
      if (content.type === 'text') {
        console.log(content.text);
      }
    });

    return response;
  } catch (error) {
    console.error(`❌ 工具调用失败 / Tool call failed [${toolName}]:`, error);
    throw error;
  }
}

// 演示所有功能 / Demonstrate all features
async function demonstrateFeatures() {
  try {
    console.log('\n🚀 开始演示MCP功能... / Starting MCP feature demonstration...');

    // 1. 文本生成演示 / Text generation demo
    console.log('\n=== 文本生成演示 / Text Generation Demo ===');
    await callTool('generate_text', {
      prompt: 'Explain what MCP (Model Context Protocol) is in simple terms.'
    });

    // 2. 文本翻译演示 / Text translation demo
    console.log('\n=== 文本翻译演示 / Text Translation Demo ===');
    await callTool('translate_text', {
      text: 'Hello, how are you today? I hope you are having a great day!',
      target_language: '中文'
    });

    // 3. 文本总结演示 / Text summarization demo
    console.log('\n=== 文本总结演示 / Text Summarization Demo ===');
    const longText = `
    人工智能（Artificial Intelligence，AI）是计算机科学的一个分支，它企图了解智能的实质，
    并生产出一种新的能以人类智能相似的方式做出反应的智能机器。该领域的研究包括机器人、
    语言识别、图像识别、自然语言处理和专家系统等。人工智能从诞生以来，理论和技术日益成熟，
    应用领域也不断扩大。可以设想，未来人工智能带来的科技产品，将会是人类智慧的"容器"。
    人工智能可以对人的意识、思维的信息过程的模拟。人工智能不是人的智能，但能像人那样思考、
    也可能超过人的智能。目前，人工智能已经在医疗、教育、交通、金融等多个领域得到广泛应用。
    `;
    
    await callTool('summarize_text', {
      text: longText,
      max_length: 50
    });

    console.log('\n🎉 所有功能演示完成！/ All feature demonstrations completed!');
  } catch (error) {
    console.error('演示过程中发生错误 / Error during demonstration:', error);
  }
}

// 主函数 / Main function
async function main() {
  let transport;
  
  try {
    // 连接到服务器 / Connect to server
    transport = await connectToServer();
    
    // 获取并显示工具列表 / Get and display tools list
    await listTools();
    
    // 演示所有功能 / Demonstrate all features
    await demonstrateFeatures();
    
  } catch (error) {
    console.error('客户端运行失败 / Client execution failed:', error);
  } finally {
    // 清理资源 / Cleanup resources
    if (client) {
      await client.close();
    }
  }
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
  console.error('客户端启动失败 / Client startup failed:', error);
  process.exit(1);
});