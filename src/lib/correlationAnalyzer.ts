export interface DatasetMetadata {
  id: string;
  name: string;
  domain: string;
  columns: string[];
  columnTypes: Record<string, string>;
  data: any[];
  createdAt: Date;
}

export interface CorrelationResult {
  dataset1: string;
  dataset2: string;
  correlation: number;
  sharedColumns: string[];
  insight: string;
  confidence: number;
}

export interface CrossDatasetInsight {
  datasets: string[];
  insight: string;
  correlation: number;
  recommendation: string;
  type: 'financial' | 'sports' | 'health' | 'productivity' | 'general';
}

export class CorrelationAnalyzer {
  /**
   * Find correlations between datasets
   */
  static findCorrelations(datasets: DatasetMetadata[]): CorrelationResult[] {
    const correlations: CorrelationResult[] = [];
    
    for (let i = 0; i < datasets.length; i++) {
      for (let j = i + 1; j < datasets.length; j++) {
        const dataset1 = datasets[i];
        const dataset2 = datasets[j];
        
        // Check if datasets are related by domain
        if (dataset1.domain === dataset2.domain) {
          const correlation = this.analyzeSameDomainCorrelation(dataset1, dataset2);
          if (correlation) {
            correlations.push(correlation);
          }
        }
        
        // Check for time-based correlations
        const timeCorrelation = this.analyzeTimeBasedCorrelation(dataset1, dataset2);
        if (timeCorrelation) {
          correlations.push(timeCorrelation);
        }
        
        // Check for shared column correlations
        const sharedCorrelation = this.analyzeSharedColumnCorrelation(dataset1, dataset2);
        if (sharedCorrelation) {
          correlations.push(sharedCorrelation);
        }
      }
    }
    
    return correlations.sort((a, b) => b.correlation - a.correlation);
  }

  /**
   * Generate cross-dataset insights
   */
  static generateCrossDatasetInsights(
    datasets: DatasetMetadata[], 
    correlations: CorrelationResult[]
  ): CrossDatasetInsight[] {
    const insights: CrossDatasetInsight[] = [];
    
    // Group datasets by domain
    const domainGroups = this.groupDatasetsByDomain(datasets);
    
    // Generate domain-specific cross-dataset insights
    Object.entries(domainGroups).forEach(([domain, domainDatasets]) => {
      if (domainDatasets.length > 1) {
        const domainInsights = this.generateDomainCrossInsights(domain, domainDatasets, correlations);
        insights.push(...domainInsights);
      }
    });
    
    // Generate time-based insights across domains
    const timeInsights = this.generateTimeBasedInsights(datasets, correlations);
    insights.push(...timeInsights);
    
    return insights.sort((a, b) => b.correlation - a.correlation);
  }

  /**
   * Analyze correlation between datasets of the same domain
   */
  private static analyzeSameDomainCorrelation(dataset1: DatasetMetadata, dataset2: DatasetMetadata): CorrelationResult | null {
    if (dataset1.domain !== dataset2.domain) return null;
    
    const sharedColumns = this.findSharedColumns(dataset1, dataset2);
    if (sharedColumns.length === 0) return null;
    
    let totalCorrelation = 0;
    let correlationCount = 0;
    
    sharedColumns.forEach(col => {
      if (dataset1.columnTypes[col] === 'number' && dataset2.columnTypes[col] === 'number') {
        const correlation = this.calculateColumnCorrelation(dataset1.data, dataset2.data, col);
        if (correlation !== null) {
          totalCorrelation += correlation;
          correlationCount++;
        }
      }
    });
    
    if (correlationCount === 0) return null;
    
    const avgCorrelation = totalCorrelation / correlationCount;
    const insight = this.generateSameDomainInsight(dataset1, dataset2, sharedColumns, avgCorrelation);
    
    return {
      dataset1: dataset1.name,
      dataset2: dataset2.name,
      correlation: avgCorrelation,
      sharedColumns,
      insight,
      confidence: Math.min(avgCorrelation * 1.2, 1.0)
    };
  }

  /**
   * Analyze time-based correlations
   */
  private static analyzeTimeBasedCorrelation(dataset1: DatasetMetadata, dataset2: DatasetMetadata): CorrelationResult | null {
    const dateColumns1 = dataset1.columns.filter(col => this.isDateColumn(dataset1.data, col));
    const dateColumns2 = dataset2.columns.filter(col => this.isDateColumn(dataset2.data, col));
    
    if (dateColumns1.length === 0 || dateColumns2.length === 0) return null;
    
    // Find numeric columns that could be correlated over time
    const numericColumns1 = dataset1.columns.filter(col => dataset1.columnTypes[col] === 'number');
    const numericColumns2 = dataset2.columns.filter(col => dataset2.columnTypes[col] === 'number');
    
    if (numericColumns1.length === 0 || numericColumns2.length === 0) return null;
    
    // Calculate time-based correlation
    const correlation = this.calculateTimeBasedCorrelation(
      dataset1.data, dataset2.data, 
      dateColumns1[0], dateColumns2[0],
      numericColumns1[0], numericColumns2[0]
    );
    
    if (correlation === null || Math.abs(correlation) < 0.3) return null;
    
    const insight = this.generateTimeBasedInsight(dataset1, dataset2, correlation);
    
    return {
      dataset1: dataset1.name,
      dataset2: dataset2.name,
      correlation: Math.abs(correlation),
      sharedColumns: ['time'],
      insight,
      confidence: Math.min(Math.abs(correlation) * 1.1, 1.0)
    };
  }

  /**
   * Analyze correlations based on shared columns
   */
  private static analyzeSharedColumnCorrelation(dataset1: DatasetMetadata, dataset2: DatasetMetadata): CorrelationResult | null {
    const sharedColumns = this.findSharedColumns(dataset1, dataset2);
    if (sharedColumns.length === 0) return null;
    
    let totalCorrelation = 0;
    let correlationCount = 0;
    
    sharedColumns.forEach(col => {
      if (dataset1.columnTypes[col] === 'number' && dataset2.columnTypes[col] === 'number') {
        const correlation = this.calculateColumnCorrelation(dataset1.data, dataset2.data, col);
        if (correlation !== null) {
          totalCorrelation += correlation;
          correlationCount++;
        }
      }
    });
    
    if (correlationCount === 0) return null;
    
    const avgCorrelation = totalCorrelation / correlationCount;
    if (Math.abs(avgCorrelation) < 0.2) return null;
    
    const insight = this.generateSharedColumnInsight(dataset1, dataset2, sharedColumns, avgCorrelation);
    
    return {
      dataset1: dataset1.name,
      dataset2: dataset2.name,
      correlation: Math.abs(avgCorrelation),
      sharedColumns,
      insight,
      confidence: Math.min(Math.abs(avgCorrelation) * 1.1, 1.0)
    };
  }

  /**
   * Group datasets by domain
   */
  private static groupDatasetsByDomain(datasets: DatasetMetadata[]): Record<string, DatasetMetadata[]> {
    const groups: Record<string, DatasetMetadata[]> = {};
    
    datasets.forEach(dataset => {
      if (!groups[dataset.domain]) {
        groups[dataset.domain] = [];
      }
      groups[dataset.domain].push(dataset);
    });
    
    return groups;
  }

  /**
   * Generate domain-specific cross-dataset insights
   */
  private static generateDomainCrossInsights(
    domain: string, 
    datasets: DatasetMetadata[], 
    correlations: CorrelationResult[]
  ): CrossDatasetInsight[] {
    const insights: CrossDatasetInsight[] = [];
    
    if (domain === 'financial') {
      insights.push(...this.generateFinancialCrossInsights(datasets, correlations));
    } else if (domain === 'sports') {
      insights.push(...this.generateSportsCrossInsights(datasets, correlations));
    } else if (domain === 'health') {
      insights.push(...this.generateHealthCrossInsights(datasets, correlations));
    }
    
    return insights;
  }

  /**
   * Generate financial cross-dataset insights
   */
  private static generateFinancialCrossInsights(datasets: DatasetMetadata[], correlations: CorrelationResult[]): CrossDatasetInsight[] {
    const insights: CrossDatasetInsight[] = [];
    
    // Find savings vs spending correlation
    const savingsDatasets = datasets.filter(d => d.columns.some(col => col.toLowerCase().includes('savings')));
    const spendingDatasets = datasets.filter(d => d.columns.some(col => col.toLowerCase().includes('spending')));
    
    if (savingsDatasets.length > 0 && spendingDatasets.length > 0) {
      const correlation = correlations.find(c => 
        (savingsDatasets.some(d => d.name === c.dataset1) && spendingDatasets.some(d => d.name === c.dataset2)) ||
        (savingsDatasets.some(d => d.name === c.dataset2) && spendingDatasets.some(d => d.name === c.dataset1))
      );
      
      if (correlation) {
        insights.push({
          datasets: [correlation.dataset1, correlation.dataset2],
          insight: `There's a ${correlation.correlation > 0.5 ? 'strong' : 'moderate'} relationship between your savings and spending patterns`,
          correlation: correlation.correlation,
          recommendation: correlation.correlation > 0.7 ? 
            "Consider tracking your spending more closely to optimize savings" :
            "Your savings and spending seem well balanced",
          type: 'financial'
        });
      }
    }
    
    return insights;
  }

  /**
   * Generate sports cross-dataset insights
   */
  private static generateSportsCrossInsights(datasets: DatasetMetadata[], correlations: CorrelationResult[]): CrossDatasetInsight[] {
    const insights: CrossDatasetInsight[] = [];
    
    // Find goals vs assists correlation
    const goalsDatasets = datasets.filter(d => d.columns.some(col => col.toLowerCase().includes('goal')));
    const assistsDatasets = datasets.filter(d => d.columns.some(col => col.toLowerCase().includes('assist')));
    
    if (goalsDatasets.length > 0 && assistsDatasets.length > 0) {
      const correlation = correlations.find(c => 
        (goalsDatasets.some(d => d.name === c.dataset1) && assistsDatasets.some(d => d.name === c.dataset2)) ||
        (goalsDatasets.some(d => d.name === c.dataset2) && assistsDatasets.some(d => d.name === c.dataset1))
      );
      
      if (correlation) {
        insights.push({
          datasets: [correlation.dataset1, correlation.dataset2],
          insight: `Your goals and assists show a ${correlation.correlation > 0.5 ? 'strong' : 'moderate'} correlation`,
          correlation: correlation.correlation,
          recommendation: correlation.correlation > 0.7 ? 
            "You're performing well in both scoring and playmaking" :
            "Consider focusing on improving either goals or assists",
          type: 'sports'
        });
      }
    }
    
    return insights;
  }

  /**
   * Generate health cross-dataset insights
   */
  private static generateHealthCrossInsights(datasets: DatasetMetadata[], correlations: CorrelationResult[]): CrossDatasetInsight[] {
    const insights: CrossDatasetInsight[] = [];
    
    // Find exercise vs weight correlation
    const exerciseDatasets = datasets.filter(d => d.columns.some(col => col.toLowerCase().includes('exercise') || col.toLowerCase().includes('workout')));
    const weightDatasets = datasets.filter(d => d.columns.some(col => col.toLowerCase().includes('weight')));
    
    if (exerciseDatasets.length > 0 && weightDatasets.length > 0) {
      const correlation = correlations.find(c => 
        (exerciseDatasets.some(d => d.name === c.dataset1) && weightDatasets.some(d => d.name === c.dataset2)) ||
        (exerciseDatasets.some(d => d.name === c.dataset2) && weightDatasets.some(d => d.name === c.dataset1))
      );
      
      if (correlation) {
        insights.push({
          datasets: [correlation.dataset1, correlation.dataset2],
          insight: `Your exercise routine and weight show a ${correlation.correlation > 0.5 ? 'strong' : 'moderate'} relationship`,
          correlation: correlation.correlation,
          recommendation: correlation.correlation > 0.7 ? 
            "Your exercise routine is effectively impacting your weight" :
            "Consider adjusting your exercise routine or diet",
          type: 'health'
        });
      }
    }
    
    return insights;
  }

  /**
   * Generate time-based insights
   */
  private static generateTimeBasedInsights(datasets: DatasetMetadata[], correlations: CorrelationResult[]): CrossDatasetInsight[] {
    const insights: CrossDatasetInsight[] = [];
    
    // Find time-based correlations
    const timeCorrelations = correlations.filter(c => c.sharedColumns.includes('time'));
    
    timeCorrelations.forEach(correlation => {
      if (correlation.correlation > 0.5) {
        insights.push({
          datasets: [correlation.dataset1, correlation.dataset2],
          insight: `${correlation.dataset1} and ${correlation.dataset2} show strong temporal correlation`,
          correlation: correlation.correlation,
          recommendation: "These datasets may be related. Consider analyzing them together for deeper insights.",
          type: 'general'
        });
      }
    });
    
    return insights;
  }

  /**
   * Helper methods
   */
  private static findSharedColumns(dataset1: DatasetMetadata, dataset2: DatasetMetadata): string[] {
    return dataset1.columns.filter(col => dataset2.columns.includes(col));
  }

  private static calculateColumnCorrelation(data1: any[], data2: any[], column: string): number | null {
    const values1 = data1.map(row => row[column]).filter(v => v !== null && !isNaN(v));
    const values2 = data2.map(row => row[column]).filter(v => v !== null && !isNaN(v));
    
    if (values1.length === 0 || values2.length === 0) return null;
    
    // Use the shorter array length
    const minLength = Math.min(values1.length, values2.length);
    const v1 = values1.slice(0, minLength);
    const v2 = values2.slice(0, minLength);
    
    return this.calculatePearsonCorrelation(v1, v2);
  }

  private static calculateTimeBasedCorrelation(
    data1: any[], data2: any[], 
    dateCol1: string, dateCol2: string,
    valueCol1: string, valueCol2: string
  ): number | null {
    const timeSeries1 = data1
      .map(row => ({ date: new Date(row[dateCol1]), value: row[valueCol1] }))
      .filter(item => !isNaN(item.date.getTime()) && item.value !== null && !isNaN(item.value))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const timeSeries2 = data2
      .map(row => ({ date: new Date(row[dateCol2]), value: row[valueCol2] }))
      .filter(item => !isNaN(item.date.getTime()) && item.value !== null && !isNaN(item.value))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    if (timeSeries1.length === 0 || timeSeries2.length === 0) return null;
    
    // Align time series by date
    const alignedData = this.alignTimeSeries(timeSeries1, timeSeries2);
    if (alignedData.length < 3) return null;
    
    const values1 = alignedData.map(item => item.value1);
    const values2 = alignedData.map(item => item.value2);
    
    return this.calculatePearsonCorrelation(values1, values2);
  }

  private static alignTimeSeries(series1: any[], series2: any[]): any[] {
    const aligned: any[] = [];
    const tolerance = 24 * 60 * 60 * 1000; // 1 day tolerance
    
    series1.forEach(item1 => {
      const matchingItem = series2.find(item2 => 
        Math.abs(item1.date.getTime() - item2.date.getTime()) <= tolerance
      );
      
      if (matchingItem) {
        aligned.push({
          date: item1.date,
          value1: item1.value,
          value2: matchingItem.value
        });
      }
    });
    
    return aligned;
  }

  private static calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n !== y.length || n === 0) return 0;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private static isDateColumn(data: any[], col: string): boolean {
    const sampleValues = data.slice(0, 10).map(row => row[col]).filter(v => v !== null && v !== undefined);
    return sampleValues.some(value => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    });
  }

  private static generateSameDomainInsight(dataset1: DatasetMetadata, dataset2: DatasetMetadata, sharedColumns: string[], correlation: number): string {
    return `${dataset1.name} and ${dataset2.name} show ${correlation > 0.7 ? 'strong' : correlation > 0.4 ? 'moderate' : 'weak'} correlation in ${sharedColumns.join(', ')}`;
  }

  private static generateTimeBasedInsight(dataset1: DatasetMetadata, dataset2: DatasetMetadata, correlation: number): string {
    return `${dataset1.name} and ${dataset2.name} show ${correlation > 0.7 ? 'strong' : correlation > 0.4 ? 'moderate' : 'weak'} temporal correlation`;
  }

  private static generateSharedColumnInsight(dataset1: DatasetMetadata, dataset2: DatasetMetadata, sharedColumns: string[], correlation: number): string {
    return `${dataset1.name} and ${dataset2.name} correlate in ${sharedColumns.join(', ')} with ${correlation > 0.7 ? 'strong' : correlation > 0.4 ? 'moderate' : 'weak'} relationship`;
  }
} 