#!/usr/bin/env node

// MCP测试文件 - 独立测试MCP服务器功能
// MCP Test File - Standalone test for MCP server functionality

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

// 测试结果统计 / Test result statistics
let testsPassed = 0;
let testsFailed = 0;
let testsTotal = 0;

// 测试辅助函数 / Test helper functions
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

// 连接到服务器的测试函数 / Test function to connect to server
async function setupTestClient() {
  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  // 创建传输并连接 / Create transport and connect
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['server.js'],
  });

  await client.connect(transport);
  
  return { client, transport };
}

// 清理测试环境 / Cleanup test environment
async function cleanup(client, transport) {
  if (client) {
    await client.close();
  }
}

// 主测试函数 / Main test function
async function runTests() {
  console.log('🚀 开始MCP功能测试... / Starting MCP functionality tests...');
  
  let client, transport;

  try {
    // 设置测试环境 / Setup test environment
    ({ client, transport } = await setupTestClient());
    console.log('✅ 测试环境设置完成 / Test environment setup complete');

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
  } finally {
    // 清理资源 / Cleanup resources
    await cleanup(client, transport);
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

// 处理未捕获的错误 / Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常 / Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝 / Unhandled promise rejection:', reason);
  process.exit(1);
});

// 启动测试 / Start tests
runTests().catch((error) => {
  console.error('测试运行失败 / Test execution failed:', error);
  process.exit(1);
});