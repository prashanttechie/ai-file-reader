import { LogInterpreterAgent } from './agent.js';
import fs from 'fs/promises';

async function runExample() {
  console.log('🚀 Starting LogInterpreterAgent Example\n');
  
  const agent = new LogInterpreterAgent();
  
  try {
    // Initialize the agent
    console.log('🔧 Initializing agent...');
    await agent.initialize();
    
    // You can specify your own file path here
    const filePath = process.argv[2] || './data/sample.txt';
    
    console.log(`📂 Loading file: ${filePath}`);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      console.error(`❌ File not found: ${filePath}`);
      console.log('💡 Usage: node src/example.js <path-to-your-file>');
      process.exit(1);
    }
    
    // Load the file into vector store
    const chunksLoaded = await agent.loadFileToVectorStore(filePath);
    console.log(`✅ Successfully loaded ${chunksLoaded} chunks\n`);
    
    // Interactive questioning
    console.log('🎯 You can now ask questions about the file content!');
    console.log('   Example questions:');
    console.log('   - "What are the main topics covered?"');
    console.log('   - "Are there any errors mentioned?"');
    console.log('   - "Summarize the key points"');
    console.log('   - "What happened at a specific time?"');
    console.log();
    
    // If running with predefined questions
    if (process.argv.includes('--demo')) {
      const demoQuestions = [
        "What is this file about?",
        "Are there any errors or warnings?",
        "What are the key events mentioned?",
        "Summarize the main content"
      ];
      
      for (const question of demoQuestions) {
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`❓ Question: ${question}`);
        
        const result = await agent.queryFile(question);
        console.log(`🤖 Answer: ${result.answer}`);
        console.log(`📚 Referenced ${result.sources.length} source chunks`);
        
        if (result.sources.length > 0) {
          console.log(`🔍 Sources preview:`);
          result.sources.forEach((source, index) => {
            console.log(`   ${index + 1}. ${source.source} (chunk ${source.chunkIndex}): ${source.content}`);
          });
        }
      }
    } else {
      console.log('💡 Run with --demo flag to see example questions, or modify this script to add your own questions.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📋 Make sure you have:');
    console.error('   1. Created a .env file with your API keys');
    console.error('   2. Installed dependencies: npm install');
    console.error('   3. Valid OpenAI and Pinecone API keys');
  }
}

// Run the example
runExample().catch(console.error);
