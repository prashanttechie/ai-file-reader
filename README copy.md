# Log Interpreter Agent

A simple LangChain agent that can read and answer questions from files provided by users using Groq for fast inference and Pinecone vector store for semantic search.

## Features

- 🚀 **Groq Integration**: Ultra-fast inference using Groq's optimized LLaMA models
- 🤖 **LangChain Framework**: Built using LangChain for robust AI agent functionality
- 📊 **Pinecone Vector Store**: Uses Pinecone for efficient semantic search and document retrieval
- 📁 **File Processing**: Automatically reads and processes text files into searchable chunks
- 🔍 **Smart Chunking**: Intelligently splits documents for optimal retrieval performance
- 💬 **Natural Language Queries**: Ask questions in plain English about your file contents
- 🔗 **Source Attribution**: Provides references to specific chunks that informed the answer
- ⚡ **High Performance**: Groq provides significantly faster response times than traditional APIs
- 🔧 **Smart Index Management**: Automatically handles dimension mismatches between embedding providers

## Why Groq?

This agent uses **Groq** for chat completions because:

- 🚀 **Speed**: Up to 10x faster inference than traditional cloud APIs
- 💰 **Cost-Effective**: Competitive pricing with high performance
- 🎯 **Optimized**: Specialized hardware for LLaMA model inference
- 📈 **Scalable**: Handles high throughput with low latency
- 🔧 **Easy Integration**: Drop-in replacement for OpenAI API calls

We still use OpenAI for embeddings as they provide industry-leading semantic understanding for document retrieval.

## Prerequisites

- Node.js (v18 or higher)
- Groq API key (for chat completions)
- OpenAI API key (for embeddings - recommended)
- Pinecone API key (for vector storage)

### 🆓 FREE Option Available!
You can also run the agent **without an OpenAI API key** by using free HuggingFace embeddings (see alternative configuration below).

## Installation

### 🐳 Option 1: Docker (Recommended)

The easiest way to run the Log Interpreter Agent is using Docker:

```bash
# 1. Clone the repository
git clone <repository-url>
cd log-interpreter-agent

# 2. Copy environment template
cp docker.env.example .env

# 3. Edit .env with your API keys
nano .env

# 4. Run with Docker Compose
npm run docker:up

# 5. Access the UI at http://localhost:3000
```

📋 **For detailed Docker instructions, see [DOCKER.md](DOCKER.md).**

### 💻 Option 2: Local Installation

1. **Clone and navigate to the project:**
   ```bash
   cd log-interpreter-agent
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the root directory:
   ```bash
   cp config.example.js .env
   ```
   
   **Default Configuration (OpenAI embeddings - recommended)**
   ```
   GROQ_API_KEY=your_groq_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_INDEX_NAME=log-interpreter-index
   GROQ_MODEL=mixtral-8x7b-32768
   EMBEDDING_PROVIDER=openai
   EMBEDDING_MODEL=text-embedding-ada-002
   ```
   
   **Alternative: FREE Mode (No OpenAI key needed)**
   ```
   GROQ_API_KEY=your_groq_api_key_here
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_INDEX_NAME=log-interpreter-index
   GROQ_MODEL=mixtral-8x7b-32768
   EMBEDDING_PROVIDER=huggingface
   EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
   ```

## Usage

### 🌐 Web UI (Recommended)

Launch the beautiful web interface:
```bash
npm run ui
```

Then open your browser to `http://localhost:3000` for an intuitive, modern interface with:
- 📁 Drag & drop file uploads
- 💬 Interactive chat interface  
- ⚙️ Real-time configuration
- 📊 Visual progress tracking
- 🎨 Beautiful, responsive design

See [UI-GUIDE.md](./UI-GUIDE.md) for complete UI documentation.

### 📟 Command Line Interface

Run the built-in example:
```bash
npm start
```

This will create a sample log file and demonstrate the agent's capabilities.

### 🆓 FREE Demo (No OpenAI Key Required)

Experience the agent with free HuggingFace embeddings:
```bash
npm run free-demo
```

This demo runs entirely on Groq + HuggingFace + Pinecone (no OpenAI needed!).

### Groq Performance Demo

Experience Groq's lightning-fast inference:
```bash
npm run groq-demo
```

This demo showcases the speed advantage of using Groq for chat completions.

### Using Your Own Files

1. **Basic usage with your file:**
   ```bash
   node src/example.js path/to/your/file.txt
   ```

2. **Run demo questions:**
   ```bash
   node src/example.js path/to/your/file.txt --demo
   ```

### Programmatic Usage

```javascript
import { LogInterpreterAgent } from './src/agent.js';

async function example() {
  const agent = new LogInterpreterAgent();
  
  // Initialize the agent
  await agent.initialize();
  
  // Load a file into the vector store
  await agent.loadFileToVectorStore('./my-file.txt');
  
  // Ask questions about the file
  const result = await agent.queryFile("What are the main topics in this file?");
  
  console.log('Answer:', result.answer);
  console.log('Sources:', result.sources);
}
```

## API Reference

### LogInterpreterAgent

#### Methods

- **`initialize()`**: Initialize the agent with OpenAI and Pinecone connections
- **`loadFileToVectorStore(filePath)`**: Load a file into the vector store for querying
- **`queryFile(question)`**: Ask a question about the loaded files
- **`clearVectorStore()`**: Clear all documents from the vector store

#### Example Response

```javascript
{
  answer: "The file contains application logs with startup, authentication, and shutdown events...",
  sources: [
    {
      source: "sample.txt",
      chunkIndex: 0,
      content: "This is a sample log file for the LogInterpreterAgent..."
    }
  ]
}
```

## Configuration

The agent can be configured through environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `GROQ_API_KEY` | Your Groq API key | Required |
| `PINECONE_API_KEY` | Your Pinecone API key | Required |
| `EMBEDDING_PROVIDER` | Embedding provider (`openai` or `huggingface`) | `openai` |
| `EMBEDDING_MODEL` | Embedding model name | Depends on provider |
| `OPENAI_API_KEY` | Your OpenAI API key | Required for default OpenAI embeddings |
| `PINECONE_INDEX_NAME` | Pinecone index name | `log-interpreter-index` |
| `GROQ_MODEL` | Groq model to use | `mixtral-8x7b-32768` |

### Embedding Providers

**HuggingFace (Free):**
- No API key required
- Default model: `Xenova/all-MiniLM-L6-v2`
- Good quality for most use cases
- Runs locally (first run downloads model)

**OpenAI (Default - Recommended):**
- Requires OpenAI API key
- Default model: `text-embedding-ada-002`
- Industry-leading quality
- Pay per API call (~$0.0001/1K tokens)

## File Types Supported

The agent works with any text-based files:
- `.txt` - Plain text files
- `.log` - Log files
- `.csv` - CSV files (will be processed as text)
- `.json` - JSON files (will be processed as text)
- `.md` - Markdown files
- Any other text-based format

## Example Questions

Once you've loaded a file, you can ask questions like:

- "What are the main topics covered in this file?"
- "Are there any errors or warnings mentioned?"
- "What happened between 2PM and 3PM?"
- "Summarize the key events"
- "How many users were active?"
- "What was the most common error?"

## Troubleshooting

### Common Issues

1. **"Missing required environment variables"**
   - Make sure your `.env` file exists and contains valid API keys

2. **"Failed to initialize Groq"**
   - Verify your Groq API key is correct
   - Check that your Groq account is active and has credits

3. **"Failed to initialize Pinecone"**
   - Verify your Pinecone API key is correct
   - Check that your Pinecone account is active

4. **"Index not found"**
   - The agent will automatically create the index if it doesn't exist
   - Make sure your Pinecone account has available index capacity

5. **"File not found"**
   - Verify the file path is correct
   - Ensure the file exists and is readable

### Getting API Keys

- **Groq**: Visit [Groq Console](https://console.groq.com/) for ultra-fast inference
- **OpenAI**: Visit [OpenAI API](https://platform.openai.com/api-keys) for embeddings (optional)
- **Pinecone**: Visit [Pinecone Console](https://app.pinecone.io/) for vector storage

### Dependency Issues

If you encounter `Cannot find package '@xenova/transformers'`:

```bash
# Fix: Install the missing dependency
npm install @xenova/transformers

# Alternative: Use simple embeddings for testing
EMBEDDING_PROVIDER=simple npm run free-demo
```

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more solutions.

## Performance Tips

- **Chunk Size**: The default chunk size is 1000 characters. Adjust in the agent for your use case
- **Retrieval Count**: The agent retrieves top 5 chunks by default. Increase for more context
- **File Size**: Large files are automatically chunked. Very large files (>50MB) may take longer to process

## License

ISC

## Contributing

Feel free to submit issues and enhancement requests!
# ai-file-reader
