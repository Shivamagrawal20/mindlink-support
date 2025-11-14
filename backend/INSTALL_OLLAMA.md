# Installing Ollama on macOS

## Quick Installation

### Method 1: Using Homebrew (Recommended)

```bash
# Install via Homebrew
brew install ollama

# Verify installation
ollama --version

# Start Ollama server
ollama serve
```

### Method 2: Direct Download

1. **Download Ollama:**
   - Visit: https://ollama.ai/download
   - Download the macOS installer (.dmg file)
   - Open the .dmg and drag Ollama to Applications

2. **Launch Ollama:**
   - Open Applications folder
   - Double-click Ollama
   - Or run from terminal: `open -a Ollama`

3. **Verify installation:**
   ```bash
   ollama --version
   ```

## After Installation

Once Ollama is installed, you can pull the Llama models:

```bash
# Pull 8B model (recommended for most systems)
ollama pull llama3.1:8b

# Pull 405B model (requires significant RAM/VRAM)
ollama pull llama3.1:405b

# List installed models
ollama list

# Start the server (if not already running)
ollama serve
```

## Configure Your Backend

Add to your `backend/.env` file:

```env
LLAMA_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
```

## Troubleshooting

### "command not found: ollama"

**If using Homebrew:**
```bash
# Make sure Homebrew is installed
brew --version

# If Homebrew is not installed, install it first:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install Ollama
brew install ollama
```

**If using direct download:**
- Make sure Ollama.app is in your Applications folder
- The first time you run it, macOS may ask for permission
- You may need to add Ollama to your PATH manually

### Add Ollama to PATH (if needed)

If Ollama is installed but not in PATH:

```bash
# Check if Ollama is in Applications
ls /Applications/ | grep -i ollama

# Add to PATH (add this to your ~/.zshrc)
echo 'export PATH="/Applications/Ollama.app/Contents/Resources:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Verify Ollama is Running

```bash
# Check if Ollama server is running
curl http://localhost:11434/api/tags

# If you get a response, Ollama is running!
# If you get "connection refused", start it:
ollama serve
```

## Next Steps

1. ✅ Install Ollama (using one of the methods above)
2. ✅ Pull models: `ollama pull llama3.1:8b`
3. ✅ Start server: `ollama serve` (or it may auto-start)
4. ✅ Configure `.env` file
5. ✅ Test your chat interface!


