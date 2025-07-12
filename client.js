#!/usr/bin/env node

/**
 * MCP客户端 - 连接到Gemini AI服务器的演示客户端和测试工具
 * MCP Client - Demo client and testing tool that connects to Gemini AI server
 * 
 * 功能 / Features:
 * - 演示模式：展示所有MCP功能 / Demo Mode: Demonstrates all MCP features
 * - 测试模式：运行完整的功能测试套件 / Test Mode: Runs comprehensive functionality test suite
 * - 工具列表：查看所有可用工具 / Tool List: View all available tools
 * - 单独工具调用：调用特定工具 / Individual Tool Call: Call specific tools
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

// 解析命令行参数 / Parse command line arguments
const args = process.argv.slice(2);
const mode = args[0] || 'demo';

// 测试结果统计 / Test result statistics
let testsPassed = 0;
let testsFailed = 0;
let testsTotal = 0;

/**
 * 创建MCP客户端实例 / Create MCP client instance
 * 配置客户端基本信息和能力 / Configure client basic info and capabilities
 */
const client = new Client(
  {
    name: 'gemini-ai-client',
    version: '1.0.0',
  },
  {
    capabilities: {}, // 客户端能力声明 / Client capabilities declaration
  }
);

/**
 * 启动服务器进程并连接 / Start server process and connect
 * 建立与MCP服务器的通信通道 / Establish communication channel with MCP server
 */
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

/**
 * 获取可用工具列表 / Get available tools list
 * 从服务器获取所有可用工具的信息 / Get information about all available tools from server
 */
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

/**
 * 调用工具的通用函数 / Generic function to call tools
 * 提供统一的工具调用接口和错误处理 / Provides unified tool calling interface and error handling
 */
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

/**
 * 演示所有功能 / Demonstrate all features
 * 展示MCP客户端的所有核心功能 / Showcase all core MCP client features
 */
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

/**
 * 测试辅助函数 / Test helper functions
 * 提供统一的测试结果处理和报告 / Provides unified test result handling and reporting
 */
function test(name, testFunction) {
  testsTotal++;
  console.log(`\n🧪 测试 / Test: ${name}`);
  
  return testFunction()
    .then(() => {
      testsPassed++;
      console.log(`✅ 通过 / PASSED: ${name}`);
    })
    .catch((error) => {
      testsFailed++;
      console.log(`❌ 失败 / FAILED: ${name}`);
      console.error('错误详情 / Error details:', error.message);
    });
}

/**
 * 运行测试套件 / Run test suite
 * 执行完整的MCP功能测试，验证所有工具的正确性 / Execute comprehensive MCP functionality tests
 */
async function runTests() {
  console.log('🚀 开始MCP功能测试... / Starting MCP functionality tests...');
  
  try {
    // 测试1: 获取工具列表 / Test 1: Get tools list
    await test('获取工具列表 / Get tools list', async () => {
      const response = await client.listTools();
      
      if (!response.tools || !Array.isArray(response.tools)) {
        throw new Error('工具列表格式错误 / Invalid tools list format');
      }
      
      if (response.tools.length !== 3) {
        throw new Error(`期望3个工具，实际得到${response.tools.length}个 / Expected 3 tools, got ${response.tools.length}`);
      }
      
      const toolNames = response.tools.map(tool => tool.name);
      const expectedTools = ['generate_text', 'translate_text', 'summarize_text'];
      
      for (const expectedTool of expectedTools) {
        if (!toolNames.includes(expectedTool)) {
          throw new Error(`缺少工具: ${expectedTool} / Missing tool: ${expectedTool}`);
        }
      }
      
      console.log(`  找到${response.tools.length}个工具 / Found ${response.tools.length} tools:`, toolNames.join(', '));
    });

    // 测试2: 文本生成功能 / Test 2: Text generation functionality
    await test('文本生成功能 / Text generation functionality', async () => {
      const response = await client.callTool({
        name: 'generate_text',
        arguments: {
          prompt: 'Say hello in a friendly way.'
        }
      });
      
      if (!response.content || !Array.isArray(response.content)) {
        throw new Error('响应格式错误 / Invalid response format');
      }
      
      if (response.content.length === 0) {
        throw new Error('响应内容为空 / Empty response content');
      }
      
      const textContent = response.content.find(c => c.type === 'text');
      if (!textContent || !textContent.text) {
        throw new Error('未找到文本内容 / No text content found');
      }
      
      console.log(`  生成文本长度 / Generated text length: ${textContent.text.length} 字符`);
    });

    // 测试3: 翻译功能 / Test 3: Translation functionality  
    await test('翻译功能 / Translation functionality', async () => {
      const response = await client.callTool({
        name: 'translate_text',
        arguments: {
          text: 'Good morning!',
          target_language: 'Chinese'
        }
      });
      
      if (!response.content || response.content.length === 0) {
        throw new Error('翻译响应为空 / Translation response is empty');
      }
      
      const textContent = response.content.find(c => c.type === 'text');
      if (!textContent || !textContent.text) {
        throw new Error('翻译结果无效 / Invalid translation result');
      }
      
      console.log(`  翻译结果包含中文字符 / Translation contains Chinese characters: ${/[\u4e00-\u9fff]/.test(textContent.text)}`);
    });

    // 测试4: 总结功能 / Test 4: Summarization functionality
    await test('总结功能 / Summarization functionality', async () => {
      const longText = 'This is a very long text that needs to be summarized. ' +
                      'It contains multiple sentences and ideas. ' +
                      'The summarization tool should be able to condense this into a shorter format. ' +
                      'This is important for understanding how the MCP server handles text processing tasks.';
      
      const response = await client.callTool({
        name: 'summarize_text',
        arguments: {
          text: longText,
          max_length: 30
        }
      });
      
      if (!response.content || response.content.length === 0) {
        throw new Error('总结响应为空 / Summary response is empty');
      }
      
      const textContent = response.content.find(c => c.type === 'text');
      if (!textContent || !textContent.text) {
        throw new Error('总结结果无效 / Invalid summary result');
      }
      
      console.log(`  总结文本长度 / Summary text length: ${textContent.text.length} 字符`);
    });

    // 测试5: 错误处理 / Test 5: Error handling
    await test('错误处理 / Error handling', async () => {
      try {
        await client.callTool({
          name: 'nonexistent_tool',
          arguments: {}
        });
        throw new Error('应该抛出错误但没有 / Should have thrown an error but did not');
      } catch (error) {
        if (error.message.includes('Unknown tool') || error.message.includes('未知工具')) {
          console.log('  正确处理了未知工具错误 / Correctly handled unknown tool error');
        } else {
          throw error;
        }
      }
    });

  } catch (error) {
    console.error('测试设置失败 / Test setup failed:', error);
    testsFailed++;
  }

  // 输出测试结果 / Output test results
  console.log('\n📊 测试结果汇总 / Test Results Summary');
  console.log('==========================================');
  console.log(`总测试数 / Total Tests: ${testsTotal}`);
  console.log(`通过 / Passed: ${testsPassed} ✅`);
  console.log(`失败 / Failed: ${testsFailed} ❌`);
  console.log(`成功率 / Success Rate: ${((testsPassed / testsTotal) * 100).toFixed(1)}%`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 所有测试通过！/ All tests passed!');
  } else {
    console.log('\n⚠️  有测试失败，请检查代码 / Some tests failed, please check the code');
  }

  process.exit(testsFailed > 0 ? 1 : 0);
}

/**
 * 显示使用帮助 / Show usage help
 * 提供命令行参数和使用方法的说明 / Provides description of command line arguments and usage
 */
function showHelp() {
  console.log(`
MCP Gemini AI 客户端 / MCP Gemini AI Client
========================================

使用方法 / Usage:
  node client.js [mode] [options]

模式 / Modes:
  demo     - 演示模式，展示所有功能 (默认) / Demo mode, showcase all features (default)
  test     - 测试模式，运行测试套件 / Test mode, run test suite  
  tools    - 显示可用工具列表 / Show available tools list
  help     - 显示此帮助信息 / Show this help message

示例 / Examples:
  node client.js                # 运行演示模式 / Run demo mode
  node client.js demo           # 运行演示模式 / Run demo mode
  node client.js test           # 运行测试模式 / Run test mode
  node client.js tools          # 显示工具列表 / Show tools list
  node client.js help           # 显示帮助 / Show help

功能 / Features:
  - 文本生成：使用Gemini AI生成文本内容 / Text Generation: Generate text using Gemini AI
  - 文本翻译：将文本翻译成指定语言 / Text Translation: Translate text to specified language
  - 文本总结：对长文本进行智能总结 / Text Summarization: Intelligently summarize long text
`);
}

/**
 * 主函数 / Main function
 * 根据命令行参数执行相应的功能模式 / Execute corresponding functionality mode based on command line arguments
 */
async function main() {
  // 处理帮助请求 / Handle help request
  if (mode === 'help' || mode === '--help' || mode === '-h') {
    showHelp();
    return;
  }

  let transport;
  
  try {
    // 连接到服务器 / Connect to server
    transport = await connectToServer();
    
    // 根据模式执行相应功能 / Execute corresponding functionality based on mode
    switch (mode) {
      case 'demo':
        // 获取并显示工具列表 / Get and display tools list
        await listTools();
        // 演示所有功能 / Demonstrate all features
        await demonstrateFeatures();
        break;
        
      case 'test':
        console.log('🧪 运行测试模式... / Running test mode...');
        await runTests();
        break;
        
      case 'tools':
        await listTools();
        break;
        
      default:
        console.log(`未知模式: ${mode} / Unknown mode: ${mode}`);
        console.log('使用 "node client.js help" 查看帮助 / Use "node client.js help" for help');
        process.exit(1);
    }
    
  } catch (error) {
    console.error('客户端运行失败 / Client execution failed:', error);
    process.exit(1);
  } finally {
    // 清理资源 / Cleanup resources
    if (client && mode !== 'test') {
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