import { LogInterpreterAgent } from './agent.js';
import fs from 'fs/promises';

async function groqDemo() {
  console.log('🚀 Groq-Powered Log Interpreter Agent Demo\n');
  
  const agent = new LogInterpreterAgent();
  
  try {
    console.log('⚡ Initializing with Groq for ultra-fast inference...');
    const startTime = Date.now();
    
    await agent.initialize();
    
    const initTime = Date.now() - startTime;
    console.log(`✅ Initialized in ${initTime}ms\n`);
    
    // Create a demo log file with various scenarios
    const demoLogContent = `
[2024-12-17 09:00:00] INFO: System startup initiated
[2024-12-17 09:00:05] INFO: Database connection pool initialized (max: 20)
[2024-12-17 09:00:10] INFO: Web server started on port 8080
[2024-12-17 09:00:15] INFO: Authentication service ready
[2024-12-17 09:01:30] INFO: First user login: admin@company.com
[2024-12-17 09:15:45] WARN: High memory usage detected: 85% (threshold: 80%)
[2024-12-17 09:30:22] ERROR: Database timeout for query "SELECT * FROM large_table"
[2024-12-17 09:30:23] INFO: Retry attempt 1/3 for failed query
[2024-12-17 09:30:28] INFO: Query retry successful
[2024-12-17 10:45:33] INFO: API request spike detected: 150 req/min
[2024-12-17 11:20:17] CRITICAL: Payment processing service unavailable
[2024-12-17 11:20:18] INFO: Failover to backup payment processor initiated
[2024-12-17 11:22:45] INFO: Backup payment processor online
[2024-12-17 12:00:00] INFO: Scheduled backup completed successfully
[2024-12-17 14:30:15] WARN: SSL certificate expires in 30 days
[2024-12-17 16:45:22] INFO: User registration spike: 45 new users in last hour
[2024-12-17 18:00:00] INFO: Daily statistics: 1,250 requests, 99.2% uptime
[2024-12-17 18:00:01] INFO: System shutdown initiated for maintenance
`;

    const demoPath = './data/groq-demo.log';
    await fs.writeFile(demoPath, demoLogContent);
    console.log('📝 Created demo log file with system events\n');
    
    // Load the file
    console.log('📚 Loading log file into vector store...');
    const loadStart = Date.now();
    const chunks = await agent.loadFileToVectorStore(demoPath);
    const loadTime = Date.now() - loadStart;
    console.log(`✅ Loaded ${chunks} chunks in ${loadTime}ms\n`);
    
    // Test questions to demonstrate Groq's speed
    const testQuestions = [
      "What time did the system start up?",
      "Were there any critical errors and how were they handled?",
      "What was the daily uptime percentage?",
      "How many new users registered?",
      "What warnings were logged during the day?"
    ];
    
    console.log('🤖 Testing Groq inference speed with questions...\n');
    
    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      console.log(`${'─'.repeat(60)}`);
      console.log(`❓ Question ${i + 1}: ${question}`);
      
      const queryStart = Date.now();
      const result = await agent.queryFile(question);
      const queryTime = Date.now() - queryStart;
      
      console.log(`⚡ Groq Response Time: ${queryTime}ms`);
      console.log(`🤖 Answer: ${result.answer}`);
      console.log(`📖 Sources: ${result.sources.length} chunks referenced\n`);
    }
    
    // Performance summary
    console.log('📊 Performance Summary:');
    console.log(`   • Initialization: ${initTime}ms`);
    console.log(`   • File Loading: ${loadTime}ms`);
    console.log('   • Average query response: Typically <500ms with Groq!');
    console.log('\n🎉 Demo completed! Groq provides blazing fast responses.');
    
    // Cleanup
    await fs.unlink(demoPath);
    console.log('🧹 Cleaned up demo file');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    
    if (error.message.includes('GROQ_API_KEY')) {
      console.log('\n💡 To get a Groq API key:');
      console.log('   1. Visit: https://console.groq.com/');
      console.log('   2. Sign up for a free account');
      console.log('   3. Generate an API key');
      console.log('   4. Add it to your .env file as GROQ_API_KEY');
    }
  }
}

// Run the demo
groqDemo().catch(console.error);
