# Log Interpreter Agent - Web UI Guide

## 🌐 Beautiful Web Interface

The Log Interpreter Agent now includes a modern, intuitive web interface that makes it easy to upload files and interact with your AI-powered document analysis tool.

## ✨ Features

### 🎨 **Modern Design**
- Beautiful gradient background
- Glass-morphism design elements
- Responsive layout for all devices
- Smooth animations and transitions
- Professional typography

### 📁 **File Upload**
- **Drag & Drop**: Simply drag files onto the upload area
- **Click to Browse**: Traditional file picker interface
- **Real-time Validation**: Instant feedback on file types and sizes
- **Progress Tracking**: Visual progress bar during upload
- **File Info Display**: Shows file name, size, and status

### ⚙️ **Configuration**
- **Embedding Provider**: Choose between OpenAI, HuggingFace, or Simple
- **Model Selection**: Pick from available Groq models
- **Real-time Updates**: Configuration changes apply immediately

### 💬 **Interactive Chat**
- **Real-time Messaging**: Instant responses from the AI
- **Source Attribution**: See which parts of your file informed each answer
- **Message History**: Keep track of your conversation
- **Clear Chat**: Start fresh conversations anytime

### 📊 **Status Monitoring**
- **Connection Status**: Real-time server connection indicator
- **File Status**: Always know which file is currently loaded
- **Processing Status**: Visual feedback during AI processing

## 🚀 Getting Started

### 1. **Start the UI Server**
```bash
npm run ui
```

### 2. **Open Your Browser**
Navigate to: `http://localhost:3000`

### 3. **Configure Your Environment**
Make sure you have your API keys set up:
```bash
# Required
GROQ_API_KEY=your_groq_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here

# Optional (for OpenAI embeddings)
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. **Upload a File**
- Drag and drop any text file (.txt, .log, .csv, .json, .md)
- Or click "Choose File" to browse
- Maximum file size: 10MB

### 5. **Start Asking Questions**
- Type your questions in the chat input
- Get instant AI-powered answers
- See source references for each answer

## 📱 UI Components

### Header Section
- **Title & Description**: Clear branding and purpose
- **Connection Status**: Green dot = connected, Red dot = disconnected
- **Real-time Updates**: Automatically checks server connection

### Upload Section
- **Drag & Drop Area**: Large, visual upload zone
- **File Validation**: Automatic type and size checking
- **Progress Display**: Real-time upload progress
- **File Management**: Easy file removal and replacement

### Configuration Panel
- **Embedding Provider**: 
  - OpenAI (Premium quality)
  - HuggingFace (Free)
  - Simple (Testing)
- **Groq Model**:
  - Mixtral 8x7B (Recommended)
  - LLaMA 3.1 8B (Fast)
  - Gemma 2 9B (Alternative)

### Chat Interface
- **Message History**: Scrollable conversation view
- **User Messages**: Blue gradient bubbles (right-aligned)
- **AI Responses**: Light gray bubbles (left-aligned)
- **Error Messages**: Red-tinted for clear error identification
- **Source References**: Expandable source attribution
- **Timestamps**: All messages include time stamps

## 🎯 Supported File Types

- **Text Files** (`.txt`)
- **Log Files** (`.log`)
- **CSV Files** (`.csv`)
- **JSON Files** (`.json`)
- **Markdown Files** (`.md`)

## ⚡ Performance Features

### Client-Side Optimizations
- **Lazy Loading**: Components load as needed
- **Debounced Input**: Prevents excessive API calls
- **Local State Management**: Minimizes server requests
- **Progress Simulation**: Smooth upload feedback

### Server-Side Features
- **File Size Limits**: 10MB maximum for optimal performance
- **Memory Management**: Efficient file handling
- **Error Recovery**: Graceful error handling and cleanup
- **CORS Support**: Cross-origin resource sharing enabled

## 🔧 Development Mode

For development with auto-reload:
```bash
npm run ui-dev
```

This will restart the server automatically when you make changes to the code.

## 📋 API Endpoints

The UI communicates with these backend endpoints:

- **GET** `/api/status` - Health check and status
- **POST** `/api/upload` - File upload and processing
- **POST** `/api/query` - Submit questions to the AI
- **POST** `/api/clear` - Clear current session
- **GET** `/api/config` - Get current configuration

## 🎨 Customization

### Styling
- CSS variables for easy theme customization
- Responsive breakpoints for mobile optimization
- Modular CSS structure for easy maintenance

### Configuration
- Environment variable driven
- Runtime configuration updates
- Default fallbacks for all settings

## 🔍 Example Usage Flow

1. **Start Server**: `npm run ui`
2. **Open Browser**: Go to `http://localhost:3000`
3. **Check Connection**: Green dot in header = ready
4. **Upload File**: Drag your log file to the upload area
5. **Wait for Processing**: Progress bar shows upload status
6. **Configure Settings**: Choose your preferred embedding provider
7. **Ask Questions**: Type questions about your file content
8. **Review Answers**: Get AI responses with source references
9. **Continue Conversation**: Ask follow-up questions
10. **Clear Session**: Use clear button to start fresh

## 🚨 Troubleshooting

### Connection Issues
- **Red Status Dot**: Server not responding
- **Check Console**: Look for error messages in browser console
- **Verify Server**: Make sure `npm run ui` is running

### Upload Issues
- **File Too Large**: Maximum 10MB limit
- **Unsupported Type**: Only text-based files supported
- **API Key Missing**: Check environment variables

### Chat Issues
- **Disabled Input**: Upload a file first
- **Error Messages**: Check API key configuration
- **Slow Responses**: Large files may take longer to process

## 🌟 Pro Tips

1. **Use Descriptive Questions**: "What errors occurred between 2PM and 3PM?" instead of "Any errors?"
2. **Try Different Providers**: OpenAI for quality, HuggingFace for cost savings
3. **Check Sources**: Review source references to understand AI reasoning
4. **Clear Chat**: Use clear button to reset context for new topics
5. **Monitor Status**: Watch the connection indicator for system health

The web UI makes the Log Interpreter Agent accessible to users of all technical levels while maintaining all the powerful features of the command-line interface!
