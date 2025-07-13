# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) Multi-AI Provider Verification Service that works with any MCP client to provide real-time AI result verification. The server supports multiple AI providers including Google Gemini and OpenAI-compatible APIs to analyze AI-generated content for accuracy, completeness, relevance, and quality.

## Technology Stack

- Node.js with ES modules (`"type": "module"`)
- MCP SDK (`@modelcontextprotocol/sdk`)
- Multi-provider AI support: Gemini API & OpenAI-compatible APIs via `node-fetch`
- JavaScript (no TypeScript)

## Essential Commands

### Development
```bash
# Install dependencies
npm install

# Start MCP server (uses AI_PROVIDER from .env)
npm run server

# Run functionality tests
npm test
# OR
node test-client.js
```

### AI Provider Configuration
Set environment variables in `.env` file:

**For Gemini (default):**
```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your_actual_gemini_key
```

**For OpenAI:**
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=your_actual_openai_key
OPENAI_MODEL=gpt-4  # optional, defaults to gpt-4
```

**For custom OpenAI-compatible services:**
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://your-custom-endpoint.com/v1
OPENAI_MODEL=your-model-name
```

## Architecture

### Core Files
- `server.js` - MCP server implementation with multi-provider AI support and stdio transport
- `test-client.js` - Simple test client for functionality verification
- `.env` - Contains AI provider configuration and API keys (required)

### MCP Integration
- Uses stdio transport for MCP client integration  
- Provides three main tools:

#### 1. `verify_ai_result` - AI Result Verification
  - `original_prompt` (required)
  - `ai_result` (required) 
  - `verification_criteria` (optional)

#### 2. `generate_thought_chain` - Thought Chain Generation
  - `question` (required) - The question or task to generate thinking for
  - `domain` (optional) - Problem domain (math, science, coding, analysis, creative, general)
  - `depth` (optional) - Thinking depth (basic, detailed, comprehensive)

#### 3. `optimize_prompt` - Prompt Optimization
  - `original_prompt` (required) - The prompt to optimize
  - `goal` (optional) - Optimization goals (clarity, specificity, context, structure)
  - `target_model` (optional) - Target AI model (claude, gpt, gemini, general)

### Test Framework
Simple test client (`test-client.js`) with 4 test categories:
1. Tools list validation (expects 3 tools)
2. AI verification functionality
3. Thought chain generation testing  
4. Prompt optimization testing

## Setup Requirements

### For Gemini Provider:
1. Obtain Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Configure `.env` file with `AI_PROVIDER=gemini` and `GEMINI_API_KEY`

### For OpenAI Provider:
1. Obtain OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Configure `.env` file with `AI_PROVIDER=openai` and `OPENAI_API_KEY`

### For MCP Client Integration:
- **Claude Desktop**: Configure `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Other MCP clients**: Use stdio transport with server.js

## Code Patterns

- Multi-provider AI abstraction with unified interface
- Comprehensive error handling with graceful API failure recovery
- Bilingual support (English/Chinese) in documentation and messages
- Modular function design with detailed logging
- Environment variable management via dotenv
- MCP protocol compliance with proper tool definitions

## Supported AI Providers

### Gemini (Google)
- Uses Google Generative AI API
- Model: `gemini-2.5-flash`
- Requires: `GEMINI_API_KEY`

### OpenAI-Compatible Services
- Compatible with OpenAI Chat Completions API
- Supports: OpenAI, Azure OpenAI, Anthropic, local models, etc.
- Configurable model and endpoint
- Requires: `OPENAI_API_KEY`, optional `OPENAI_BASE_URL` and `OPENAI_MODEL`

## Tool Capabilities

### AI Result Verification (`verify_ai_result`)
- Accuracy analysis (factual correctness)
- Completeness checking (missing information detection)
- Relevance assessment (topic adherence)
- Quality scoring (1-10 scale with improvement suggestions)

### Thought Chain Generation (`generate_thought_chain`)
- Structured thinking frameworks for complex problem solving
- Domain-specific reasoning patterns (math, science, coding, etc.)
- Multi-depth analysis (basic, detailed, comprehensive)
- Step-by-step logical progression guidance

### Prompt Optimization (`optimize_prompt`)
- Clarity and specificity improvements
- Model-specific optimization strategies
- Context enhancement and structure optimization
- Goal-oriented prompt engineering