import client from 'prom-client';

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'ai-file-reader'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Custom metrics for AI File Reader
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const fileUploadsTotal = new client.Counter({
  name: 'file_uploads_total',
  help: 'Total number of file uploads',
  labelNames: ['file_type', 'status']
});

const fileProcessingDuration = new client.Histogram({
  name: 'file_processing_duration_seconds',
  help: 'Duration of file processing in seconds',
  labelNames: ['file_type'],
  buckets: [0.5, 1, 2, 5, 10, 30, 60]
});

const vectorStoreOperations = new client.Counter({
  name: 'vector_store_operations_total',
  help: 'Total number of vector store operations',
  labelNames: ['operation', 'status']
});

const queryResponseTime = new client.Histogram({
  name: 'query_response_time_seconds',
  help: 'Time taken to respond to queries',
  labelNames: ['query_type'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30]
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

const documentsInVectorStore = new client.Gauge({
  name: 'documents_in_vector_store',
  help: 'Number of documents currently in vector store'
});

const embeddingOperations = new client.Counter({
  name: 'embedding_operations_total',
  help: 'Total number of embedding operations',
  labelNames: ['provider', 'status']
});

const llmRequests = new client.Counter({
  name: 'llm_requests_total',
  help: 'Total number of LLM requests',
  labelNames: ['model', 'status']
});

const pineconeOperations = new client.Counter({
  name: 'pinecone_operations_total',
  help: 'Total number of Pinecone operations',
  labelNames: ['operation', 'status']
});

// Register all custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(fileUploadsTotal);
register.registerMetric(fileProcessingDuration);
register.registerMetric(vectorStoreOperations);
register.registerMetric(queryResponseTime);
register.registerMetric(activeConnections);
register.registerMetric(documentsInVectorStore);
register.registerMetric(embeddingOperations);
register.registerMetric(llmRequests);
register.registerMetric(pineconeOperations);

// Middleware to collect HTTP metrics
const collectHttpMetrics = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
};

export {
  register,
  collectHttpMetrics
};

export const metrics = {
  httpRequestDuration,
  httpRequestsTotal,
  fileUploadsTotal,
  fileProcessingDuration,
  vectorStoreOperations,
  queryResponseTime,
  activeConnections,
  documentsInVectorStore,
  embeddingOperations,
  llmRequests,
  pineconeOperations
};
