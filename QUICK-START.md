# 🚀 Quick Start Guide

## Option 1: Web UI (Recommended) 🌐

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Set Environment Variables**
Create a `.env` file:
```bash
# Required
GROQ_API_KEY=your_groq_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here

# For best quality (recommended)
OPENAI_API_KEY=your_openai_api_key_here
EMBEDDING_PROVIDER=openai

# OR for free mode
EMBEDDING_PROVIDER=huggingface
```

### 3. **Start the UI**
```bash
npm run ui
```

### 4. **Open Browser**
Navigate to: `http://localhost:3000`

### 5. **Use the Interface**
- 📁 Drag & drop your file
- 💬 Ask questions in the chat
- 🎯 Get AI-powered answers instantly!

---

## Option 2: Command Line 📟

### Quick Demo
```bash
# Free mode (no OpenAI key needed)
EMBEDDING_PROVIDER=huggingface npm run free-demo

# With your own file
npm run example path/to/your/file.txt --demo
```

### Programmatic Usage
```javascript
import { LogInterpreterAgent } from './src/agent.js';

const agent = new LogInterpreterAgent();
await agent.initialize();
await agent.loadFileToVectorStore('./my-file.txt');
const result = await agent.queryFile("What's in this file?");
```

---

## 🔑 Getting API Keys

1. **Groq** (Required): [console.groq.com](https://console.groq.com/) - Free tier available
2. **Pinecone** (Required): [app.pinecone.io](https://app.pinecone.io/) - Free tier available  
3. **OpenAI** (Optional): [platform.openai.com](https://platform.openai.com/) - For best quality

---

## 📁 Supported Files

- Text files (`.txt`)
- Log files (`.log`) 
- CSV files (`.csv`)
- JSON files (`.json`)
- Markdown files (`.md`)

---

## 💡 Example Questions

- "What are the main topics in this file?"
- "Are there any errors mentioned?"
- "Summarize the key events"
- "What happened between 2PM and 3PM?"
- "How many users were active?"

---

## 🆓 Cost-Free Option

Use HuggingFace embeddings to run without OpenAI:
```bash
EMBEDDING_PROVIDER=huggingface npm run ui
```

Only requires Groq + Pinecone API keys!

---

## 🔧 Available Commands

```bash
npm run ui          # Start web interface
npm run ui-dev      # Start with auto-reload  
npm run free-demo   # Free demo (no OpenAI)
npm run groq-demo   # Performance demo
npm start           # Basic CLI demo
```

---

**Need help?** Check out:
- [UI-GUIDE.md](./UI-GUIDE.md) - Complete UI documentation
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues & solutions
- [README.md](./README.md) - Full documentation
