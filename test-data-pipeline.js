const { DataPipeline } = require('./src/lib/dataPipeline');

async function testDataPipeline() {
  try {
    console.log('Testing data pipeline...');
    
    // Clear any existing metrics
    DataPipeline.clearMetrics();
    
    // Build metrics from all data
    const result = await DataPipeline.buildMetrics();
    
    console.log('Data Pipeline Results:');
    console.log('======================');
    console.log('Summary:', {
      totalMetrics: result.summary.totalMetrics,
      totalEntries: result.summary.totalEntries,
      domains: result.summary.domains
    });
    
    console.log('\nDomain Metrics:');
    console.log('===============');
    result.domainMetrics.forEach(domain => {
      console.log(`\n${domain.domain.toUpperCase()}:`);
      console.log(`  Total Entries: ${domain.totalEntries}`);
      console.log(`  Time Range: ${domain.timeRange.start.toLocaleDateString()} - ${domain.timeRange.end.toLocaleDateString()}`);
      
      Object.entries(domain.metrics).forEach(([metricName, aggregation]) => {
        console.log(`  ${metricName}:`);
        console.log(`    Total: ${aggregation.total}`);
        console.log(`    Average: ${aggregation.average.toFixed(2)}`);
        console.log(`    Count: ${aggregation.count}`);
        console.log(`    Trend: ${aggregation.trend}`);
        console.log(`    Min: ${aggregation.min}`);
        console.log(`    Max: ${aggregation.max}`);
      });
    });
    
    console.log('\nCross-Domain Analysis:');
    console.log('=====================');
    console.log('Correlations:', result.crossDomainAnalysis.correlations.length);
    result.crossDomainAnalysis.correlations.forEach(corr => {
      console.log(`  ${corr.metric1} ↔ ${corr.metric2}: ${(corr.correlation * 100).toFixed(1)}% (${corr.strength})`);
    });
    
    console.log('\nCombined Insights:');
    console.log('==================');
    result.crossDomainAnalysis.combinedInsights.forEach(insight => {
      console.log(`  • ${insight}`);
    });
    
    console.log('\nRecommendations:');
    console.log('================');
    result.crossDomainAnalysis.recommendations.forEach(rec => {
      console.log(`  • ${rec}`);
    });
    
  } catch (error) {
    console.error('Error testing data pipeline:', error);
  }
}

testDataPipeline(); 