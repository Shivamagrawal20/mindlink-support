# Setting Up Llama 3.1 Models for Chat

This guide explains how to configure Llama 3.1 (8B & 405B) models for chat answer generation in MindLink.

## Overview

MindLink supports three ways to use Llama 3.1 models:
1. **Ollama** (Recommended for local development) - Free, runs models locally
2. **Replicate** - Cloud-based, pay-per-use
3. **Hugging Face Inference API** - Cloud-based, pay-per-use

## Option 1: Meta Llama CLI (Official Method)

Use Meta's official Llama CLI to download models directly from Meta.

### Installation

1. **Install Meta Llama CLI (llama-stack):**
   ```bash
   # Install the correct package: llama-stack
   pip install --upgrade llama-stack
   ```

   **Note:** If you have a conflicting `llama` package installed, you may need to:
   ```bash
   # Check what's installed
   pip list | grep llama
   
   # If you see 'llama' or 'llama-index', you may need to uninstall it
   # But be careful - only uninstall if it's not needed for other projects
   pip uninstall llama  # Only if safe to do so
   
   # Then install llama-stack
   pip install --upgrade llama-stack
   ```
   
   **Important:** The package name is `llama-stack`, not `llama-cli`. After installation, the command is still `llama`.

2. **Verify installation:**
   ```bash
   llama --help
   # Should show 'model' as a subcommand option
   # If you only see 'stack', the installation didn't work correctly
   ```
   
   **If you still see only 'stack' command:**
   ```bash
   # Try reinstalling
   pip uninstall llama-stack
   pip install llama-stack
   
   # Or check if there's a different command
   llama-stack --help
   ```

3. **List available models:**
   ```bash
   # See latest models
   llama model list
   
   # See all models including older versions
   llama model list --show-all
   ```

4. **Download Llama 3.1 models:**
   ```bash
   # Download 8B model
   llama model download --source meta --model-id Llama-3.1-8B-Instruct
   
   # Download 405B model
   llama model download --source meta --model-id Llama-3.1-405B-Instruct
   ```
   
   When prompted for the custom URL, paste the URL you received from Meta.

5. **Alternative: Direct Download**
   If the CLI doesn't work, you can also download models directly from:
   - Meta's official model repository
   - Hugging Face (requires access request)
   - Then use with Ollama or other inference engines

### Environment Configuration

After downloading models, you can use them with Ollama or other inference engines. See Option 2 below for Ollama setup.

---

## Option 2: Ollama (Recommended for Local Development - EASIEST METHOD)

**If you're having issues with Meta CLI, we highly recommend using Ollama instead. It's simpler and works out of the box.**

Ollama is the easiest way to run Llama models locally on your machine.

### Installation

1. **Install Ollama:**
   - macOS: Download from https://ollama.ai/download
   - Linux: `curl -fsSL https://ollama.ai/install.sh | sh`
   - Windows: Download from https://ollama.ai/download

2. **Pull Llama 3.1 models:**
   ```bash
   # For 8B model (recommended for most systems)
   ollama pull llama3.1:8b
   
   # For 405B model (requires significant RAM/VRAM)
   ollama pull llama3.1:405b
   ```

3. **Start Ollama server:**
   ```bash
   ollama serve
   ```
   The server runs on `http://localhost:11434` by default.

### Environment Configuration

Add to your `.env` file:
```env
LLAMA_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
```

### Model Selection

The 8B model is recommended for most use cases:
- **8B**: Faster, uses ~8GB RAM, good for most conversations
- **405B**: Slower, requires significant resources, better quality for complex conversations

## Option 3: Replicate API

Replicate provides cloud-based access to Llama models.

### Setup

1. **Create account:** https://replicate.com
2. **Get API token:** Go to Account Settings → API Tokens
3. **Add to `.env`:**
   ```env
   LLAMA_PROVIDER=replicate
   REPLICATE_API_TOKEN=your-replicate-api-token-here
   ```

### Pricing

- Pay per API call
- 8B model: ~$0.0001 per request
- 405B model: ~$0.01 per request (varies)

## Option 4: Hugging Face Inference API

Hugging Face provides access to Llama models via their Inference API.

### Setup

1. **Create account:** https://huggingface.co
2. **Get API token:** Go to Settings → Access Tokens
3. **Request access to Llama models:**
   - Visit https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
   - Click "Request Access" and wait for approval
   - Repeat for 405B if needed
4. **Add to `.env`:**
   ```env
   LLAMA_PROVIDER=huggingface
   HUGGINGFACE_API_TOKEN=your-hf-token-here
   ```

### Pricing

- Free tier available (limited requests)
- Paid plans for higher usage

## Environment Variables Summary

Add these to your `backend/.env` file:

```env
# Llama Configuration
LLAMA_PROVIDER=ollama  # Options: ollama, replicate, huggingface

# Ollama (if using Ollama)
OLLAMA_URL=http://localhost:11434

# Replicate (if using Replicate)
REPLICATE_API_TOKEN=your-token-here

# Hugging Face (if using Hugging Face)
HUGGINGFACE_API_TOKEN=your-token-here
```

## Using Different Models in the API

### Default Behavior

By default, the API uses the **8B model**. You can specify the model size in your API calls:

```javascript
// Use 8B model (default)
await chatAPI.sendMessage("Hello", undefined, 'text', '8b');

// Use 405B model
await chatAPI.sendMessage("Hello", undefined, 'text', '405b');
```

### Backend API

The chat endpoint accepts a `modelSize` parameter:

```json
POST /api/chat/message
{
  "message": "How are you?",
  "modelSize": "8b"  // or "405b"
}
```

## Testing the Setup

1. **Start your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test with a simple request:**
   ```bash
   curl -X POST http://localhost:5001/api/chat/message \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"message": "Hello", "modelSize": "8b"}'
   ```

3. **Check the response:**
   - If successful, you'll see a response with `"model": "8b (ollama)"` (or your provider)
   - If Llama fails, it falls back to rule-based responses

## Troubleshooting

### Ollama Issues

**"Ollama server is not running"**
- Make sure Ollama is installed and running: `ollama serve`
- Check if the server is accessible: `curl http://localhost:11434/api/tags`

**"Model not found"**
- Pull the model: `ollama pull llama3.1:8b`
- Verify models: `ollama list`

**Slow responses**
- 8B model is faster than 405B
- Ensure you have enough RAM/VRAM
- Consider using cloud providers for better performance

### Replicate Issues

**"REPLICATE_API_TOKEN required"**
- Make sure you've added the token to `.env`
- Restart your server after adding environment variables

### Hugging Face Issues

**"Model access denied"**
- Request access to Llama models on Hugging Face
- Wait for approval (can take a few hours)

**"Rate limit exceeded"**
- Free tier has rate limits
- Consider upgrading or using Ollama for development

## Fallback Behavior

If Llama models fail for any reason, the system automatically falls back to the rule-based response generator. This ensures chat always works, even if the AI models are unavailable.

## Performance Tips

1. **For development:** Use Ollama with 8B model
2. **For production:** Consider Replicate or Hugging Face for better reliability
3. **For complex conversations:** Use 405B model when available
4. **For speed:** Use 8B model (sufficient for most use cases)

## Next Steps

1. Choose your provider (Ollama recommended for local dev)
2. Set up the environment variables
3. Test with a simple message
4. Adjust model size based on your needs

For questions or issues, check the logs in your backend console.

