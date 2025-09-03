import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { LogInterpreterAgent } from './agent.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LogInterpreterServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.agent = null;
        this.currentFile = null;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.initializeAgent();
    }

    setupMiddleware() {
        // Enable CORS
        this.app.use(cors());
        
        // Parse JSON bodies
        this.app.use(express.json());
        
        // Serve static files
        this.app.use(express.static(path.join(__dirname, '../public')));
        
        // Setup file upload middleware
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, 'uploads/');
            },
            filename: (req, file, cb) => {
                // Keep original filename with timestamp
                const timestamp = Date.now();
                const originalName = file.originalname;
                cb(null, `${timestamp}-${originalName}`);
            }
        });
        
        this.upload = multer({
            storage: storage,
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB limit
            },
            fileFilter: (req, file, cb) => {
                // Allow text-based files, PDFs, and Word documents
                const allowedMimes = [
                    'text/plain',
                    'text/csv',
                    'application/json',
                    'text/markdown',
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ];
                
                const allowedExts = ['.txt', '.log', '.csv', '.json', '.md', '.pdf', '.doc', '.docx'];
                const fileExt = path.extname(file.originalname).toLowerCase();
                
                if (allowedMimes.includes(file.mimetype) || allowedExts.includes(fileExt)) {
                    cb(null, true);
                } else {
                    cb(new Error('Unsupported file type. Supported formats: TXT, LOG, CSV, JSON, MD, PDF, DOC, DOCX'), false);
                }
            }
        });
    }

    setupRoutes() {
        // Health check endpoint
        this.app.get('/api/status', (req, res) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                agent: this.agent ? 'initialized' : 'not_initialized',
                currentFile: this.currentFile ? path.basename(this.currentFile) : null
            });
        });

        // File upload endpoint
        this.app.post('/api/upload', this.upload.single('file'), async (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({ error: 'No file uploaded' });
                }

                const { embeddingProvider, groqModel } = req.body;
                
                console.log(`📄 Processing file: ${req.file.originalname}`);
                console.log(`🔧 Provider: ${embeddingProvider}, Model: ${groqModel}`);

                // Update environment variables for this request
                if (embeddingProvider) {
                    process.env.EMBEDDING_PROVIDER = embeddingProvider;
                }
                if (groqModel) {
                    process.env.GROQ_MODEL = groqModel;
                }

                // Reinitialize agent with new configuration if needed
                await this.reinitializeAgent();

                // Recreate Pinecone index before uploading new file
                if (this.agent) {
                    try {
                        await this.agent.recreateIndex();
                        console.log('🔄 Pinecone index recreated for new upload');
                    } catch (error) {
                        console.warn('Could not recreate index before upload:', error.message);
                        // Don't fail the upload if index recreation fails, try to continue
                    }
                }

                // Load the file into the agent
                const filePath = req.file.path;
                
                // Start timing
                const startTime = Date.now();
                const chunks = await this.agent.loadFileToVectorStore(filePath);
                const endTime = Date.now();
                const processingTime = (endTime - startTime) / 1000;
                
                // Store current file info
                this.currentFile = filePath;

                console.log(`✅ File processed: ${chunks} chunks loaded in ${processingTime}s`);

                res.json({
                    success: true,
                    filename: req.file.originalname,
                    chunks: chunks,
                    size: req.file.size,
                    processingTime: processingTime,
                    embeddingProvider: embeddingProvider,
                    groqModel: groqModel
                });

            } catch (error) {
                console.error('❌ Upload error:', error.message);
                
                // Clean up uploaded file on error
                if (req.file) {
                    try {
                        await fs.unlink(req.file.path);
                    } catch (unlinkError) {
                        console.error('Error cleaning up file:', unlinkError.message);
                    }
                }

                res.status(500).json({
                    error: error.message,
                    details: this.getErrorDetails(error)
                });
            }
        });

        // Query endpoint
        this.app.post('/api/query', async (req, res) => {
            try {
                const { question, embeddingProvider, groqModel } = req.body;

                if (!question) {
                    return res.status(400).json({ error: 'Question is required' });
                }

                if (!this.agent) {
                    return res.status(500).json({ error: 'Agent not initialized' });
                }

                if (!this.currentFile) {
                    return res.status(400).json({ error: 'No file uploaded. Please upload a file first.' });
                }

                console.log(`❓ Processing question: ${question}`);

                // Update configuration if provided
                if (embeddingProvider) {
                    process.env.EMBEDDING_PROVIDER = embeddingProvider;
                }
                if (groqModel) {
                    process.env.GROQ_MODEL = groqModel;
                }

                // Reinitialize agent if configuration changed
                await this.reinitializeAgent();

                // Query the agent
                const result = await this.agent.queryFile(question);

                console.log(`✅ Query completed`);

                res.json({
                    answer: result.answer,
                    sources: result.sources,
                    question: question,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('❌ Query error:', error.message);
                res.status(500).json({
                    error: error.message,
                    details: this.getErrorDetails(error)
                });
            }
        });

        // Remove current file endpoint (just file - index gets recreated on next upload)
        this.app.post('/api/remove-file', async (req, res) => {
            try {
                if (this.currentFile) {
                    // Clean up uploaded file
                    try {
                        await fs.unlink(this.currentFile);
                        console.log(`🗑️ Removed uploaded file: ${this.currentFile}`);
                        this.currentFile = null;
                        res.json({ 
                            success: true, 
                            message: 'File removed from server successfully (index will be recreated on next upload)' 
                        });
                    } catch (error) {
                        console.warn('Could not delete file:', error.message);
                        res.status(500).json({ error: `Failed to delete file: ${error.message}` });
                    }
                } else {
                    res.json({ 
                        success: true, 
                        message: 'No file to remove' 
                    });
                }

            } catch (error) {
                console.error('❌ File removal error:', error.message);
                res.status(500).json({ error: error.message });
            }
        });

        // Clear current file endpoint (just file - index gets recreated on next upload)
        this.app.post('/api/clear', async (req, res) => {
            try {
                if (this.currentFile) {
                    // Clean up uploaded file
                    try {
                        await fs.unlink(this.currentFile);
                        console.log(`🗑️ Cleaned up file: ${this.currentFile}`);
                        this.currentFile = null;
                    } catch (error) {
                        console.warn('Could not delete file:', error.message);
                    }
                }

                res.json({ 
                    success: true, 
                    message: 'Session cleared (index will be recreated on next upload)' 
                });

            } catch (error) {
                console.error('❌ Clear error:', error.message);
                res.status(500).json({ error: error.message });
            }
        });

        // Configuration endpoint
        this.app.get('/api/config', (req, res) => {
            res.json({
                embeddingProvider: process.env.EMBEDDING_PROVIDER || 'openai',
                groqModel: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
                embeddingModel: process.env.EMBEDDING_MODEL,
                availableProviders: ['openai', 'huggingface', 'simple'],
                availableModels: [
                    'mixtral-8x7b-32768',
                    'llama-3.1-8b-instant',
                    'gemma2-9b-it'
                ]
            });
        });

        // Serve the main UI
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../public/index.html'));
        });

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({ error: 'Endpoint not found' });
        });

        // Error handler
        this.app.use((error, req, res, next) => {
            console.error('Server error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        });
    }

    async initializeAgent() {
        try {
            console.log('🤖 Initializing LogInterpreter Agent...');
            this.agent = new LogInterpreterAgent();
            await this.agent.initialize();
            console.log('✅ Agent initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize agent:', error.message);
            console.error('💡 Make sure you have set up your environment variables correctly');
            console.error('📋 Required variables: GROQ_API_KEY, PINECONE_API_KEY');
            
            const embeddingProvider = process.env.EMBEDDING_PROVIDER || 'openai';
            if (embeddingProvider === 'openai') {
                console.error('📋 For OpenAI embeddings: OPENAI_API_KEY');
            }
        }
    }

    async reinitializeAgent() {
        // Only reinitialize if configuration has changed significantly
        // For now, we'll keep the same agent instance to avoid performance issues
        // In a production environment, you might want to implement smarter reinitialization
        if (!this.agent) {
            await this.initializeAgent();
        }
    }

    getErrorDetails(error) {
        if (error.message.includes('GROQ_API_KEY')) {
            return {
                type: 'missing_api_key',
                provider: 'groq',
                message: 'Please set your GROQ_API_KEY environment variable'
            };
        }
        
        if (error.message.includes('OPENAI_API_KEY')) {
            return {
                type: 'missing_api_key',
                provider: 'openai',
                message: 'Please set your OPENAI_API_KEY environment variable or switch to HuggingFace embeddings'
            };
        }
        
        if (error.message.includes('PINECONE_API_KEY')) {
            return {
                type: 'missing_api_key',
                provider: 'pinecone',
                message: 'Please set your PINECONE_API_KEY environment variable'
            };
        }

        if (error.message.includes('decommissioned')) {
            return {
                type: 'model_decommissioned',
                message: 'The selected model has been decommissioned. Please update your GROQ_MODEL setting.'
            };
        }

        return {
            type: 'unknown',
            message: 'An unexpected error occurred'
        };
    }

    start() {
        this.app.listen(this.port, () => {
            console.log('🚀 Log Interpreter Agent UI Server Started!');
            console.log(`📍 Server running at: http://localhost:${this.port}`);
            console.log(`🌐 Open your browser and navigate to the URL above`);
            console.log('');
            console.log('📋 Required Environment Variables:');
            console.log('   • GROQ_API_KEY - Get from https://console.groq.com/');
            console.log('   • PINECONE_API_KEY - Get from https://app.pinecone.io/');
            console.log('   • OPENAI_API_KEY - Get from https://platform.openai.com/ (for OpenAI embeddings)');
            console.log('');
            console.log('🎯 Configuration Options:');
            console.log(`   • EMBEDDING_PROVIDER: ${process.env.EMBEDDING_PROVIDER || 'openai'}`);
            console.log(`   • GROQ_MODEL: ${process.env.GROQ_MODEL || 'mixtral-8x7b-32768'}`);
            console.log('');
        });
    }
}

// Start the server
const server = new LogInterpreterServer();
server.start();
