#!/usr/bin/env node

/**
 * 简单测试客户端 - 测试多AI提供商MCP服务器
 * Simple Test Client - Test Multi-AI Provider MCP Server
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

/**
 * 创建MCP客户端实例 / Create MCP client instance
 */
const client = new Client(
  {
    name: 'multi-ai-test-client',
    version: '1.0.0',
  },
  {
    capabilities: {},
  }
);

/**
 * 启动服务器进程并连接 / Start server process and connect
 */
async function connectToServer() {
  try {
    console.log('正在启动MCP服务器... / Starting MCP server...');
    
    // 创建客户端传输 / Create client transport
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['server.js'],
    });
    
    // 连接到服务器 / Connect to server
    await client.connect(transport);
    console.log('✅ 成功连接到MCP服务器 / Successfully connected to MCP server');
    
    return transport;
  } catch (error) {
    console.error('❌ 连接失败 / Connection failed:', error);
    throw error;
  }
}

/**
 * 测试工具列表 / Test tools list
 */
async function testToolsList() {
  console.log('\n📋 测试工具列表... / Testing tools list...');
  try {
    const response = await client.listTools();
    console.log(`找到 ${response.tools.length} 个工具 / Found ${response.tools.length} tools:`);
    response.tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}: ${tool.description}`);
    });
    return response.tools;
  } catch (error) {
    console.error('获取工具列表失败 / Failed to get tools list:', error);
    throw error;
  }
}

/**
 * 测试AI验证功能 / Test AI verification functionality
 */
async function testVerification() {
  console.log('\n🔍 测试AI验证功能... / Testing AI verification functionality...');
  try {
    const response = await client.callTool({
      name: 'verify_ai_result',
      arguments: {
        original_prompt: '什么是JavaScript？',
        ai_result: 'JavaScript是一种编程语言，主要用于Web开发。',
        verification_criteria: 'accuracy,completeness'
      }
    });
    
    const result = response.content?.[0]?.text;
    if (result) {
      console.log('✅ AI验证功能工作正常 / AI verification functionality working');
      console.log(`结果长度 / Result length: ${result.length} 字符`);
      if (result.includes('AI服务暂时不可用')) {
        console.log('⚠️  API调用失败，但MCP功能正常 / API call failed, but MCP functionality is normal');
      }
    } else {
      throw new Error('未收到有效响应 / No valid response received');
    }
  } catch (error) {
    console.error('验证功能测试失败 / Verification functionality test failed:', error);
    throw error;
  }
}

/**
 * 测试思维链生成 / Test thought chain generation
 */
async function testThoughtChain() {
  console.log('\n🧠 测试思维链生成... / Testing thought chain generation...');
  try {
    const response = await client.callTool({
      name: 'generate_thought_chain',
      arguments: {
        question: '如何解决一个编程问题？',
        domain: 'coding',
        depth: 'basic'
      }
    });
    
    const result = response.content?.[0]?.text;
    if (result) {
      console.log('✅ 思维链生成功能工作正常 / Thought chain generation working');
      console.log(`结果长度 / Result length: ${result.length} 字符`);
      if (result.includes('AI服务暂时不可用')) {
        console.log('⚠️  API调用失败，但MCP功能正常 / API call failed, but MCP functionality is normal');
      }
    } else {
      throw new Error('未收到有效响应 / No valid response received');
    }
  } catch (error) {
    console.error('思维链生成测试失败 / Thought chain generation test failed:', error);
    throw error;
  }
}

/**
 * 测试提示优化 / Test prompt optimization
 */
async function testPromptOptimization() {
  console.log('\n⚡ 测试提示优化... / Testing prompt optimization...');
  try {
    const response = await client.callTool({
      name: 'optimize_prompt',
      arguments: {
        original_prompt: '写代码',
        goal: 'clarity,specificity',
        target_model: 'general'
      }
    });
    
    const result = response.content?.[0]?.text;
    if (result) {
      console.log('✅ 提示优化功能工作正常 / Prompt optimization working');
      console.log(`结果长度 / Result length: ${result.length} 字符`);
      if (result.includes('AI服务暂时不可用')) {
        console.log('⚠️  API调用失败，但MCP功能正常 / API call failed, but MCP functionality is normal');
      }
    } else {
      throw new Error('未收到有效响应 / No valid response received');
    }
  } catch (error) {
    console.error('提示优化测试失败 / Prompt optimization test failed:', error);
    throw error;
  }
}

/**
 * 运行所有测试 / Run all tests
 */
async function runTests() {
  let transport;
  try {
    transport = await connectToServer();
    
    await testToolsList();
    await testVerification();
    await testThoughtChain();
    await testPromptOptimization();
    
    console.log('\n🎉 所有测试完成！/ All tests completed!');
  } catch (error) {
    console.error('\n❌ 测试失败 / Tests failed:', error);
    process.exit(1);
  } finally {
    if (transport) {
      try {
        await transport.close();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

// 运行测试 / Run tests
runTests();