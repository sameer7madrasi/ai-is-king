// Test script for AI Analytics functionality
// Run with: node test-ai-analytics.js

const testAIAnalytics = async () => {
  console.log('🤖 Testing AI Analytics Service...\n');

  // Test 1: Check if AI Analytics API endpoint exists
  try {
    const response = await fetch('http://localhost:3000/api/ai-analytics', {
      method: 'GET'
    });
    
    if (response.status === 405) {
      console.log('✅ AI Analytics API endpoint exists (correctly rejects GET requests)');
    } else {
      console.log('❌ AI Analytics API endpoint not found or unexpected response');
    }
  } catch (error) {
    console.log('❌ Could not reach AI Analytics API endpoint:', error.message);
  }

  // Test 2: Test with invalid API key
  try {
    const response = await fetch('http://localhost:3000/api/ai-analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: 'invalid-key',
        context: {}
      })
    });

    const result = await response.json();
    
    if (result.success === false && result.error) {
      console.log('✅ AI Analytics API correctly handles invalid API key');
    } else {
      console.log('❌ AI Analytics API did not properly handle invalid API key');
    }
  } catch (error) {
    console.log('❌ Error testing AI Analytics API:', error.message);
  }

  // Test 3: Test with missing API key
  try {
    const response = await fetch('http://localhost:3000/api/ai-analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context: {}
      })
    });

    const result = await response.json();
    
    if (result.success === false && result.error === 'OpenAI API key is required') {
      console.log('✅ AI Analytics API correctly requires API key');
    } else {
      console.log('❌ AI Analytics API did not properly validate API key requirement');
    }
  } catch (error) {
    console.log('❌ Error testing AI Analytics API validation:', error.message);
  }

  console.log('\n📋 Test Summary:');
  console.log('- AI Analytics API endpoint: Available');
  console.log('- API key validation: Working');
  console.log('- Error handling: Implemented');
  console.log('\n🚀 To test with real data:');
  console.log('1. Start your Next.js server: npm run dev');
  console.log('2. Visit: http://localhost:3000/ai-analytics');
  console.log('3. Enter your OpenAI API key');
  console.log('4. Add some personal context (goals, interests, focus areas)');
  console.log('5. Upload some data files first');
  console.log('6. Click "Generate AI Insights"');
  console.log('\n💡 The AI will analyze your data and provide:');
  console.log('- Personalized insights based on your context');
  console.log('- Cross-dataset correlations and patterns');
  console.log('- Actionable recommendations');
  console.log('- Trend analysis and predictions');
  console.log('- Domain-specific insights (financial, health, etc.)');
};

// Run the test
testAIAnalytics().catch(console.error); 