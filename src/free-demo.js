import { LogInterpreterAgent } from './agent.js';
import fs from 'fs/promises';

async function freeDemo() {
  console.log('🆓 Free Agent Demo - No OpenAI API Key Required!\n');
  console.log('🚀 Using Groq for chat + HuggingFace for embeddings');
  console.log('   Only requires: Groq API key + Pinecone API key\n');
  
  // Set environment variables for free mode
  process.env.EMBEDDING_PROVIDER = 'huggingface';
  process.env.EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
  
  const agent = new LogInterpreterAgent();
  
  try {
    console.log('⚡ Initializing with FREE embeddings...');
    const startTime = Date.now();
    
    await agent.initialize();
    
    const initTime = Date.now() - startTime;
    console.log(`✅ Initialized in ${initTime}ms\n`);
    
    // Create a demo document
    const demoContent = `
# Product Analysis Report

## Executive Summary
Our Q4 2024 product analysis shows strong growth in user engagement and revenue.
Key metrics include 25% increase in daily active users and 18% revenue growth.

## Key Findings

### User Engagement
- Daily active users: 150,000 (+25% YoY)
- Session duration: 12.5 minutes (+15% YoY)
- Feature adoption rate: 68% (+10% YoY)

### Revenue Performance
- Total revenue: $2.8M (+18% YoY)
- Subscription revenue: $2.1M (+22% YoY)
- One-time purchases: $700K (+8% YoY)

### Customer Satisfaction
- Net Promoter Score: 72 (+5 points)
- Customer retention: 89% (+3% YoY)
- Support ticket resolution: 4.2 hours (-15% improvement)

## Challenges Identified
1. Mobile app performance issues in emerging markets
2. Onboarding flow has 23% drop-off rate
3. Advanced features have low discovery rate (31%)

## Recommendations
1. Optimize mobile app for low-bandwidth networks
2. Redesign onboarding flow with progressive disclosure
3. Implement in-app feature discovery tooltips
4. Expand customer success team for enterprise clients

## Conclusion
Overall positive trajectory with clear areas for improvement.
Focus should be on mobile optimization and user experience enhancement.
`;

    const demoPath = './data/free-demo.md';
    await fs.writeFile(demoPath, demoContent);
    console.log('📝 Created demo analysis report\n');
    
    // Load the file using free embeddings
    console.log('📚 Loading document with HuggingFace embeddings...');
    const loadStart = Date.now();
    const chunks = await agent.loadFileToVectorStore(demoPath);
    const loadTime = Date.now() - loadStart;
    console.log(`✅ Loaded ${chunks} chunks in ${loadTime}ms\n`);
    
    // Test questions
    const testQuestions = [
      "What was the revenue growth percentage?",
      "What are the main challenges identified?",
      "How many daily active users are there?",
      "What is recommended for mobile optimization?",
      "What was the Net Promoter Score?"
    ];
    
    console.log('🤖 Testing FREE embedding performance...\n');
    
    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      console.log(`${'─'.repeat(60)}`);
      console.log(`❓ Question ${i + 1}: ${question}`);
      
      const queryStart = Date.now();
      const result = await agent.queryFile(question);
      const queryTime = Date.now() - queryStart;
      
      console.log(`⚡ Response Time: ${queryTime}ms`);
      console.log(`🤖 Answer: ${result.answer}`);
      console.log(`📖 Sources: ${result.sources.length} chunks\n`);
    }
    
    // Performance summary
    console.log('📊 FREE Mode Performance Summary:');
    console.log(`   • Initialization: ${initTime}ms`);
    console.log(`   • File Loading: ${loadTime}ms`);
    console.log('   • API costs: Only Groq + Pinecone (no OpenAI!)');
    console.log('   • Embedding quality: Good for most use cases');
    console.log('\n🎉 Demo completed! You can run this with just Groq + Pinecone API keys.');
    
    // Cleanup
    await fs.unlink(demoPath);
    console.log('🧹 Cleaned up demo file');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    
    if (error.message.includes('GROQ_API_KEY')) {
      console.log('\n💡 To get started with FREE embeddings:');
      console.log('   1. Get Groq API key: https://console.groq.com/');
      console.log('   2. Get Pinecone API key: https://app.pinecone.io/');
      console.log('   3. Set in .env:');
      console.log('      GROQ_API_KEY=your_groq_key');
      console.log('      PINECONE_API_KEY=your_pinecone_key');
      console.log('      EMBEDDING_PROVIDER=huggingface');
      console.log('\n   No OpenAI API key needed! 🎉');
    }
  }
}

// Run the demo
freeDemo().catch(console.error);
