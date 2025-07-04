const { AnalyticsService } = require('./src/lib/analyticsService');

async function testAnalytics() {
  try {
    console.log('Testing analytics service...');
    const result = await AnalyticsService.analyzeAllData();
    console.log('Analytics result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testAnalytics(); 