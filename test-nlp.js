// Test script for NLP processor
const { NLPProcessor } = require('./src/lib/nlpProcessor.ts');

async function testNLP() {
  console.log('Testing NLP Processor...\n');
  
  const testText = "July 2nd - 2 goals, 2 assists. 7 miles. Left foot needs to be better.";
  
  try {
    console.log('Input text:', testText);
    console.log('Processing with advanced NLP...\n');
    
    const result = await NLPProcessor.processText(testText);
    
    console.log('=== NLP Processing Results ===');
    console.log('Original Text:', result.originalText);
    console.log('Domain:', result.domain);
    console.log('Sentiment:', result.extractedData.sentiment);
    console.log('Confidence:', result.extractedData.confidence);
    
    console.log('\n=== Extracted Metrics ===');
    console.log(JSON.stringify(result.extractedData.metrics, null, 2));
    
    console.log('\n=== Categories ===');
    console.log(JSON.stringify(result.extractedData.categories, null, 2));
    
    console.log('\n=== Entities ===');
    console.log(JSON.stringify(result.extractedData.entities, null, 2));
    
    console.log('\n=== Insights ===');
    result.insights.forEach((insight, i) => {
      console.log(`${i + 1}. ${insight}`);
    });
    
    console.log('\n=== Recommendations ===');
    result.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
    
    console.log('\n=== Structured Data ===');
    console.log(JSON.stringify(result.extractedData.structuredData, null, 2));
    
  } catch (error) {
    console.error('Error testing NLP:', error);
  }
}

// Run the test
testNLP(); 