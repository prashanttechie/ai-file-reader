import { ChatGroq } from '@langchain/groq';
import { OpenAIEmbeddings } from '@langchain/openai';
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/hf_transformers';
import { FakeEmbeddings } from '@langchain/core/utils/testing';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Document } from '@langchain/core/documents';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Load environment variables
dotenv.config();

class LogInterpreterAgent {
  constructor() {
    this.llm = null;
    this.embeddings = null;
    this.pineconeClient = null;
    this.vectorStore = null;
    this.retrievalChain = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Validate environment variables
      this.validateEnvironment();

      // Initialize Groq for chat
      this.llm = new ChatGroq({
        model: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
        temperature: 0.1,
        apiKey: process.env.GROQ_API_KEY,
      });

      // Initialize embeddings based on configuration
      this.embeddings = await this.initializeEmbeddings();

      // Initialize Pinecone
      this.pineconeClient = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });

      // Get the appropriate index name based on embedding provider
      const baseIndexName = process.env.PINECONE_INDEX_NAME || 'log-interpreter-index';
      const indexName = this.getProviderSpecificIndexName(baseIndexName);
      
      // Check if index exists, create if it doesn't (with correct dimensions)
      await this.ensureIndexExists(indexName);

      const index = this.pineconeClient.Index(indexName);

      // Initialize vector store
      this.vectorStore = await PineconeStore.fromExistingIndex(this.embeddings, {
        pineconeIndex: index,
        textKey: 'text',
      });

      // Create retrieval chain
      await this.createRetrievalChain();

      this.initialized = true;
      console.log('✅ LogInterpreterAgent initialized successfully with Groq!');
      console.log(`🚀 Using Groq model: ${process.env.GROQ_MODEL || 'mixtral-8x7b-32768'}`);
      
      const embeddingProvider = process.env.EMBEDDING_PROVIDER || 'openai';
      const embeddingModel = process.env.EMBEDDING_MODEL || 
        (embeddingProvider.toLowerCase() === 'openai' ? 'text-embedding-ada-002' : 'Xenova/all-MiniLM-L6-v2');
      const dimension = this.getEmbeddingDimension();
      console.log(`🔍 Using ${embeddingProvider} embeddings: ${embeddingModel} (${dimension}D)`);
      console.log(`📊 Pinecone index: ${indexName}`);
    } catch (error) {
      console.error('❌ Failed to initialize LogInterpreterAgent:', error.message);
      throw error;
    }
  }

  async initializeEmbeddings() {
    const embeddingProvider = process.env.EMBEDDING_PROVIDER || 'openai';
    
    console.log(`🔍 Initializing ${embeddingProvider} embeddings...`);
    
    try {
      switch (embeddingProvider.toLowerCase()) {
        case 'openai':
          if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is required when using OpenAI embeddings');
          }
          return new OpenAIEmbeddings({
            modelName: process.env.EMBEDDING_MODEL || 'text-embedding-ada-002',
            openAIApiKey: process.env.OPENAI_API_KEY,
          });
          
        case 'huggingface':
        case 'hf':
          console.log('📦 Using HuggingFace embeddings (no API key required)');
          try {
            return new HuggingFaceTransformersEmbeddings({
              modelName: process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2',
            });
          } catch (hfError) {
            console.warn('⚠️  HuggingFace embeddings failed, falling back to simple embeddings');
            console.warn('💡 To fix: npm install @xenova/transformers');
            return this.createSimpleEmbeddings();
          }
          
        case 'fake':
        case 'simple':
          console.log('🔧 Using simple embeddings (for testing/development)');
          return this.createSimpleEmbeddings();
          
        default:
          throw new Error(`Unsupported embedding provider: ${embeddingProvider}. Supported: openai, huggingface, simple`);
      }
    } catch (error) {
      console.error('❌ Failed to initialize embeddings:', error.message);
      console.log('🔄 Falling back to simple embeddings for testing...');
      return this.createSimpleEmbeddings();
    }
  }

  createSimpleEmbeddings() {
    console.log('📝 Using simple deterministic embeddings (suitable for testing)');
    const dimension = this.getEmbeddingDimension();
    return new FakeEmbeddings({
      size: dimension,
    });
  }

  getProviderSpecificIndexName(baseIndexName) {
    const embeddingProvider = process.env.EMBEDDING_PROVIDER || 'openai';
    
    // If user explicitly set a custom index name, respect it
    if (process.env.PINECONE_INDEX_NAME && process.env.PINECONE_INDEX_NAME !== 'log-interpreter-index') {
      return process.env.PINECONE_INDEX_NAME;
    }
    
    // Otherwise, use provider-specific naming to avoid dimension conflicts
    switch (embeddingProvider.toLowerCase()) {
      case 'openai':
        return `${baseIndexName}-openai`;
      case 'huggingface':
      case 'hf':
        return `${baseIndexName}-hf`;
      case 'fake':
      case 'simple':
        return `${baseIndexName}-simple`;
      default:
        return baseIndexName;
    }
  }

  getEmbeddingDimension() {
    const embeddingProvider = process.env.EMBEDDING_PROVIDER || 'openai';
    
    switch (embeddingProvider.toLowerCase()) {
      case 'openai':
        return 1536; // OpenAI text-embedding-ada-002 dimension
      case 'huggingface':
      case 'hf':
        return 384; // HuggingFace all-MiniLM-L6-v2 dimension
      case 'fake':
      case 'simple':
        return 384; // Simple/fake embeddings dimension
      default:
        return 1536; // Default to OpenAI dimension
    }
  }

  validateEnvironment() {
    const required = ['GROQ_API_KEY', 'PINECONE_API_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    // Check for embedding-specific requirements
    const embeddingProvider = process.env.EMBEDDING_PROVIDER || 'openai';
    if (embeddingProvider.toLowerCase() === 'openai' && !process.env.OPENAI_API_KEY) {
      missing.push('OPENAI_API_KEY (required for OpenAI embeddings)');
    }
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  async ensureIndexExists(indexName) {
    try {
      const indexList = await this.pineconeClient.listIndexes();
      const indexExists = indexList.indexes?.some(index => index.name === indexName);

      if (!indexExists) {
        const dimension = this.getEmbeddingDimension();
        const embeddingProvider = process.env.EMBEDDING_PROVIDER || 'openai';
        
        console.log(`📦 Creating Pinecone index: ${indexName}`);
        console.log(`🔧 Using ${dimension} dimensions for ${embeddingProvider} embeddings`);
        
        await this.pineconeClient.createIndex({
          name: indexName,
          dimension: dimension,
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });
        
        // Wait for index to be ready
        console.log('⏳ Waiting for index to be ready...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      } else {
        console.log(`✅ Using existing index: ${indexName}`);
      }
    } catch (error) {
      console.error('Error ensuring index exists:', error.message);
      throw error;
    }
  }

  async createRetrievalChain() {
    const prompt = ChatPromptTemplate.fromTemplate(`
You are a helpful AI assistant powered by Groq that answers questions based on the provided context from files.

Context: {context}

Question: {input}

Based on the context above, provide a clear and accurate answer. If the context doesn't contain enough information to answer the question, say so clearly. Be concise but thorough in your response.
`);

    const documentChain = await createStuffDocumentsChain({
      llm: this.llm,
      prompt,
    });

    this.retrievalChain = await createRetrievalChain({
      retriever: this.vectorStore.asRetriever({
        k: 20 // Much higher number of documents to retrieve
      }),
      combineDocsChain: documentChain,
    });
  }

  async extractTextContent(filePath) {
    const fileExtension = path.extname(filePath).toLowerCase();
    
    switch (fileExtension) {
      case '.pdf':
        return await this.extractPdfText(filePath);
      case '.doc':
      case '.docx':
        return await this.extractWordText(filePath);
      case '.txt':
      case '.log':
      case '.csv':
      case '.json':
      case '.md':
      default:
        // Read as plain text for standard text files
        return await fs.readFile(filePath, 'utf-8');
    }
  }

  async extractPdfText(filePath) {
    try {
      console.log(`📄 Extracting text from PDF: ${path.basename(filePath)}`);
      const dataBuffer = await fs.readFile(filePath);
      
      // Use pdf-parse to extract text
      const data = await pdfParse(dataBuffer);
      
      if (!data.text || !data.text.trim()) {
        throw new Error('PDF appears to be empty or contains no extractable text');
      }
      
      console.log(`✅ Extracted ${data.text.length} characters from PDF (${data.numpages} pages)`);
      return data.text;
    } catch (error) {
      console.error(`❌ Error extracting PDF text: ${error.message}`);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  async extractWordText(filePath) {
    try {
      console.log(`📝 Extracting text from Word document: ${path.basename(filePath)}`);
      const dataBuffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      
      if (!result.value || !result.value.trim()) {
        throw new Error('Word document appears to be empty or contains no extractable text');
      }
      
      // Log any warnings from mammoth
      if (result.messages && result.messages.length > 0) {
        console.log(`⚠️ Word extraction warnings:`, result.messages.map(m => m.message));
      }
      
      console.log(`✅ Extracted ${result.value.length} characters from Word document`);
      return result.value;
    } catch (error) {
      console.error(`❌ Error extracting Word text: ${error.message}`);
      throw new Error(`Failed to extract text from Word document: ${error.message}`);
    }
  }

  async loadFileToVectorStore(filePath) {
    try {
      console.log(`📖 Reading file: ${filePath}`);
      
      // Extract text content based on file type
      const content = await this.extractTextContent(filePath);
      
      if (!content.trim()) {
        throw new Error('File is empty or contains only whitespace');
      }

      // Split text into chunks (optimized for faster processing)
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 2000, // Larger chunks = fewer chunks to process
        chunkOverlap: 100, // Reduced overlap for speed
      });

      const chunks = await textSplitter.splitText(content);
      
      // Create documents with metadata
      const documents = chunks.map((chunk, index) => new Document({
        pageContent: chunk,
        metadata: {
          source: path.basename(filePath),
          fullPath: filePath,
          chunkIndex: index,
          timestamp: new Date().toISOString(),
        },
      }));

      console.log(`📚 Adding ${documents.length} chunks to vector store...`);
      
      // Add documents to vector store in batches for better performance
      const batchSize = 50; // Process 50 chunks at a time
      const totalBatches = Math.ceil(documents.length / batchSize);
      
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        
        console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} chunks)...`);
        await this.vectorStore.addDocuments(batch);
      }
      
      console.log(`✅ Successfully loaded file: ${filePath}`);
      
      // Wait for Pinecone index to be ready for queries (eventual consistency)
      console.log('⏳ Waiting for vector index to be ready...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
      console.log('✅ Vector index should be ready for queries');
      
      return documents.length;
    } catch (error) {
      console.error(`❌ Error loading file ${filePath}:`, error.message);
      throw error;
    }
  }

  async queryFile(question) {
    if (!this.initialized) {
      throw new Error('Agent not initialized. Call initialize() first.');
    }

    try {
      console.log(`🤔 Processing question: ${question}`);
      
      // Debug: Check if we have documents in the vector store
      console.log('🔍 Testing different retrieval methods...');
      
      // Try basic retrieval first
      const basicRetriever = this.vectorStore.asRetriever({ k: 20 });
      const basicDocs = await basicRetriever.getRelevantDocuments(question);
      console.log(`🔍 Basic retrieval found ${basicDocs.length} relevant documents`);
      
      // Try similarity search directly on the vector store
      try {
        const similarityDocs = await this.vectorStore.similaritySearch(question, 10);
        console.log(`🔍 Direct similarity search found ${similarityDocs.length} documents`);
        
        if (similarityDocs.length > 0) {
          console.log(`📝 First similarity doc preview: ${similarityDocs[0].pageContent.substring(0, 100)}...`);
        }
      } catch (error) {
        console.error('❌ Similarity search error:', error.message);
      }
      
      // Use the docs from whichever method found results
      const relevantDocs = basicDocs.length > 0 ? basicDocs : [];
      console.log(`🔍 Using ${relevantDocs.length} documents for final retrieval`);
      
      if (relevantDocs.length === 0) {
        console.warn('⚠️ No relevant documents found in vector store');
      } else {
        console.log(`📝 First doc preview: ${relevantDocs[0].pageContent.substring(0, 100)}...`);
      }
      
      const result = await this.retrievalChain.invoke({
        input: question,
      });

      console.log(`💬 LLM Response length: ${result.answer?.length || 0} characters`);

      return {
        answer: result.answer,
        sources: result.context?.map(doc => ({
          source: doc.metadata.source,
          chunkIndex: doc.metadata.chunkIndex,
          content: doc.pageContent.substring(0, 200) + '...',
        })) || [],
      };
    } catch (error) {
      console.error('❌ Error querying file:', error.message);
      throw error;
    }
  }

  async clearVectorStore() {
    try {
      const indexName = process.env.PINECONE_INDEX_NAME || 'log-interpreter-index';
      const index = this.pineconeClient.Index(indexName);
      
      // Delete all vectors in the index
      await index.deleteAll();
      console.log('🗑️ Vector store cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing vector store:', error.message);
      throw error;
    }
  }

  async recreateIndex() {
    try {
      const baseIndexName = process.env.PINECONE_INDEX_NAME || 'log-interpreter-index';
      const indexName = this.getProviderSpecificIndexName(baseIndexName);
      
      console.log(`🗑️ Deleting existing Pinecone index: ${indexName}`);
      
      // Check if index exists and delete it
      const indexList = await this.pineconeClient.listIndexes();
      const indexExists = indexList.indexes?.some(index => index.name === indexName);
      
      if (indexExists) {
        await this.pineconeClient.deleteIndex(indexName);
        console.log(`✅ Index ${indexName} deleted successfully`);
        
        // Wait for deletion to complete
        let deleted = false;
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds max wait
        
        while (!deleted && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          const currentIndexList = await this.pineconeClient.listIndexes();
          deleted = !currentIndexList.indexes?.some(index => index.name === indexName);
          attempts++;
        }
        
        if (!deleted) {
          throw new Error(`Index deletion timed out after ${maxAttempts} seconds`);
        }
      }
      
      // Create new index
      const dimension = this.getEmbeddingDimension();
      const embeddingProvider = process.env.EMBEDDING_PROVIDER || 'openai';
      
      console.log(`📦 Creating new Pinecone index: ${indexName}`);
      console.log(`🔧 Using ${dimension} dimensions for ${embeddingProvider} embeddings`);
      
      await this.pineconeClient.createIndex({
        name: indexName,
        dimension: dimension,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      
      // Wait for index to be ready
      let ready = false;
      let readyAttempts = 0;
      const maxReadyAttempts = 60; // 60 seconds max wait
      
      while (!ready && readyAttempts < maxReadyAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        const indexList = await this.pineconeClient.listIndexes();
        const indexInfo = indexList.indexes?.find(index => index.name === indexName);
        ready = indexInfo?.status?.ready === true;
        readyAttempts++;
      }
      
      if (!ready) {
        throw new Error(`Index creation timed out after ${maxReadyAttempts} seconds`);
      }
      
      console.log(`✅ Index ${indexName} created and ready`);
      
      // Reinitialize vector store with new index
      const index = this.pineconeClient.Index(indexName);
      this.vectorStore = await PineconeStore.fromExistingIndex(this.embeddings, {
        pineconeIndex: index,
        textKey: 'text',
      });
      
      console.log('✅ Vector store reinitialized with new index');
      
    } catch (error) {
      console.error('❌ Error recreating index:', error.message);
      throw error;
    }
  }
}

// Example usage
async function main() {
  const agent = new LogInterpreterAgent();
  
  try {
    // Initialize the agent
    await agent.initialize();
    
    // Example: Load a file (you can change this path)
    const exampleFilePath = './data/sample.txt';
    
    // Check if example file exists, create one if not
    try {
      await fs.access(exampleFilePath);
    } catch {
      console.log('📝 Creating sample file...');
      await fs.writeFile(exampleFilePath, `
This is a sample log file for the LogInterpreterAgent.

Log Entry 1: Application started successfully at 2024-01-01 10:00:00
Log Entry 2: User authentication successful for user@example.com
Log Entry 3: Database connection established
Log Entry 4: Processing request GET /api/users
Log Entry 5: Response sent with status 200
Log Entry 6: Application shutdown initiated at 2024-01-01 18:00:00

Error Log: Connection timeout occurred at 2024-01-01 15:30:00
Warning: High memory usage detected at 2024-01-01 16:45:00

The application handled 1000 requests today with 99.9% uptime.
      `.trim());
    }
    
    // Load the file into vector store
    const chunksLoaded = await agent.loadFileToVectorStore(exampleFilePath);
    console.log(`📊 Loaded ${chunksLoaded} chunks from the file`);
    
    // Ask some questions
    const questions = [
      "What time did the application start?",
      "Were there any errors in the logs?",
      "How many requests were handled?",
      "What was the uptime percentage?"
    ];
    
    for (const question of questions) {
      console.log(`\n${'='.repeat(50)}`);
      const result = await agent.queryFile(question);
      console.log(`💬 Q: ${question}`);
      console.log(`🤖 A: ${result.answer}`);
      console.log(`📖 Sources: ${result.sources.length} chunks referenced`);
    }
    
  } catch (error) {
    console.error('❌ Error in main:', error.message);
  }
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { LogInterpreterAgent };
