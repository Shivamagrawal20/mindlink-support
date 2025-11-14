# Llama CLI Troubleshooting

## Error: "invalid choice: 'model' (choose from 'stack')"

This error means you have the wrong `llama` package installed, or `llama-stack` isn't properly installed.

### Solution 1: Install/Upgrade llama-stack

```bash
# Install or upgrade llama-stack
pip install --upgrade llama-stack

# Verify installation
llama --help
# Should show 'model' as an option
```

### Solution 2: Check for Conflicting Packages

```bash
# List all llama-related packages
pip list | grep llama

# If you see conflicting packages, you may need to uninstall them
# But be careful - only if safe to do so
pip uninstall llama llama-index  # Only if you don't need them
pip install --upgrade llama-stack
```

### Solution 3: Use Ollama Instead (Recommended)

If the Meta CLI continues to cause issues, **we highly recommend using Ollama** - it's much simpler and works out of the box:

```bash
# Install Ollama
# macOS: Download from https://ollama.ai/download
# Or: brew install ollama

# Pull models directly
ollama pull llama3.1:8b
ollama pull llama3.1:405b

# Start server
ollama serve
```

Then in your `.env`:
```env
LLAMA_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
```

This is the easiest method and doesn't require Meta's CLI at all.

### Solution 4: Use Hugging Face CLI

Alternatively, download models via Hugging Face:

```bash
# Install Hugging Face CLI
pip install huggingface-hub

# Login (requires Hugging Face account and access token)
huggingface-cli login

# Download models (requires access approval from Meta)
huggingface-cli download meta-llama/Meta-Llama-3.1-8B-Instruct
huggingface-cli download meta-llama/Meta-Llama-3.1-405B-Instruct
```

Then use with Ollama or another inference engine.

## Recommended Approach

**For most users, we recommend using Ollama directly** - it's the simplest method:

1. Install Ollama: https://ollama.ai/download
2. Pull models: `ollama pull llama3.1:8b`
3. Start server: `ollama serve`
4. Configure `.env`: `LLAMA_PROVIDER=ollama`

No need for Meta CLI, custom URLs, or complex setup!


