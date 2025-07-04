import { databaseService } from './database';

export interface MetricAggregation {
  metric: string;
  total: number;
  average: number;
  count: number;
  min: number;
  max: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  lastUpdated: Date;
  history: MetricHistoryPoint[];
}

export interface MetricHistoryPoint {
  date: Date;
  value: number;
  source: string;
}

export interface DomainMetrics {
  domain: string;
  metrics: Record<string, MetricAggregation>;
  totalEntries: number;
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface CrossDomainAnalysis {
  correlations: CorrelationMetric[];
  combinedInsights: string[];
  recommendations: string[];
}

export interface CorrelationMetric {
  metric1: string;
  metric2: string;
  correlation: number;
  strength: 'strong' | 'moderate' | 'weak';
  description: string;
}

export class DataPipeline {
  private static metricRegistry: Map<string, MetricAggregation> = new Map();
  private static domainMetrics: Map<string, DomainMetrics> = new Map();

  /**
   * Process all data and build aggregated metrics
   */
  static async buildMetrics(): Promise<{
    domainMetrics: DomainMetrics[];
    crossDomainAnalysis: CrossDomainAnalysis;
    summary: {
      totalMetrics: number;
      totalEntries: number;
      domains: string[];
      lastUpdated: Date;
    };
  }> {
    try {
      console.log('DataPipeline: Building metrics from all data...');
      
      // Get all data from database
      const allData = await this.getAllData();
      console.log(`DataPipeline: Retrieved ${allData.length} datasets`);
      
      // Process each dataset and extract metrics
      for (const dataset of allData) {
        await this.processDataset(dataset);
      }
      
      // Build domain-specific aggregations
      const domainMetrics = await this.buildDomainMetrics();
      
      // Perform cross-domain analysis
      const crossDomainAnalysis = await this.analyzeCrossDomain(domainMetrics);
      
      // Build summary
      const summary = this.buildSummary(domainMetrics);
      
      return {
        domainMetrics,
        crossDomainAnalysis,
        summary
      };
    } catch (error) {
      console.error('DataPipeline: Error building metrics:', error);
      return {
        domainMetrics: [],
        crossDomainAnalysis: {
          correlations: [],
          combinedInsights: [],
          recommendations: []
        },
        summary: {
          totalMetrics: 0,
          totalEntries: 0,
          domains: [],
          lastUpdated: new Date()
        }
      };
    }
  }

  /**
   * Get all data from database
   */
  private static async getAllData(): Promise<any[]> {
    const { databaseService } = await import('./database');
    const files = await databaseService.getAllFiles();
    const datasets = [];
    
    for (const file of files) {
      try {
        const data = await databaseService.getFileData(file.id);
        if (data && data.length > 0) {
          datasets.push({
            id: file.id,
            name: file.fileName,
            data: data,
            columns: file.columns,
            columnTypes: file.columnTypes,
            createdAt: file.uploadDate
          });
        }
      } catch (error) {
        console.error(`Error getting data for file ${file.id}:`, error);
      }
    }
    
    return datasets;
  }

  /**
   * Process a single dataset and extract metrics
   */
  private static async processDataset(dataset: any): Promise<void> {
    console.log(`DataPipeline: Processing dataset ${dataset.name}`);
    
    // Check if this is NLP-processed data
    if (this.isNLPProcessedData(dataset)) {
      await this.processNLPData(dataset);
    } else {
      await this.processStandardData(dataset);
    }
  }

  /**
   * Check if dataset is NLP-processed
   */
  private static isNLPProcessedData(dataset: any): boolean {
    return dataset.columns.includes('domain') && 
           dataset.columns.includes('metrics');
  }

  /**
   * Process NLP-processed data
   */
  private static async processNLPData(dataset: any): Promise<void> {
    for (const row of dataset.data) {
      const domain = row.domain || 'general';
      const timestamp = new Date(row.timestamp || dataset.createdAt);
      
      // Parse metrics from NLP data
      if (row.metrics) {
        try {
          const metrics = typeof row.metrics === 'string' 
            ? JSON.parse(row.metrics) 
            : row.metrics;
          
          Object.entries(metrics).forEach(([metric, value]) => {
            if (typeof value === 'number' && value > 0) {
              this.recordMetric(metric, value, domain, timestamp, dataset.name);
            }
          });
        } catch (error) {
          console.error('Error parsing NLP metrics:', error);
        }
      }
      
      // Extract numeric values from other columns
      dataset.columns.forEach((col: string) => {
        if (dataset.columnTypes[col] === 'number' && row[col]) {
          const value = parseFloat(row[col]);
          if (!isNaN(value) && value > 0) {
            this.recordMetric(col, value, domain, timestamp, dataset.name);
          }
        }
      });
    }
  }

  /**
   * Process standard data (CSV, Excel, etc.)
   */
  private static async processStandardData(dataset: any): Promise<void> {
    // Detect domain based on column names and data
    const domain = this.detectDomain(dataset);
    
    for (const row of dataset.data) {
      const timestamp = new Date(dataset.createdAt);
      
      // Extract numeric metrics
      dataset.columns.forEach((col: string) => {
        if (dataset.columnTypes[col] === 'number' && row[col]) {
          const value = parseFloat(row[col]);
          if (!isNaN(value) && value > 0) {
            this.recordMetric(col, value, domain, timestamp, dataset.name);
          }
        }
      });
      
      // Extract sports-specific metrics
      if (domain === 'sports') {
        this.extractSportsMetrics(row, dataset, timestamp);
      }
      
      // Extract financial metrics
      if (domain === 'financial') {
        this.extractFinancialMetrics(row, dataset, timestamp);
      }
      
      // Extract health metrics
      if (domain === 'health') {
        this.extractHealthMetrics(row, dataset, timestamp);
      }
    }
  }

  /**
   * Detect domain from dataset
   */
  private static detectDomain(dataset: any): string {
    const columns = dataset.columns.map((col: string) => col.toLowerCase());
    
    // Sports indicators
    if (columns.some(col => col.includes('goal') || col.includes('score') || col.includes('match'))) {
      return 'sports';
    }
    
    // Financial indicators
    if (columns.some(col => col.includes('money') || col.includes('cost') || col.includes('price') || col.includes('amount'))) {
      return 'financial';
    }
    
    // Health indicators
    if (columns.some(col => col.includes('weight') || col.includes('calorie') || col.includes('exercise'))) {
      return 'health';
    }
    
    return 'general';
  }

  /**
   * Extract sports-specific metrics
   */
  private static extractSportsMetrics(row: any, dataset: any, timestamp: Date): void {
    const sportsMetrics = [
      'goals', 'assists', 'points', 'score', 'distance', 'time', 'speed',
      'shots', 'passes', 'tackles', 'saves', 'wins', 'losses'
    ];
    
    sportsMetrics.forEach(metric => {
      const value = this.extractNumericValue(row, dataset, metric);
      if (value > 0) {
        this.recordMetric(metric, value, 'sports', timestamp, dataset.name);
      }
    });
  }

  /**
   * Extract financial metrics
   */
  private static extractFinancialMetrics(row: any, dataset: any, timestamp: Date): void {
    const financialMetrics = [
      'amount', 'cost', 'price', 'expense', 'income', 'budget', 'savings',
      'spending', 'revenue', 'profit', 'loss'
    ];
    
    financialMetrics.forEach(metric => {
      const value = this.extractNumericValue(row, dataset, metric);
      if (value > 0) {
        this.recordMetric(metric, value, 'financial', timestamp, dataset.name);
      }
    });
  }

  /**
   * Extract health metrics
   */
  private static extractHealthMetrics(row: any, dataset: any, timestamp: Date): void {
    const healthMetrics = [
      'weight', 'calories', 'steps', 'heart_rate', 'blood_pressure',
      'exercise_time', 'sleep_hours', 'water_intake'
    ];
    
    healthMetrics.forEach(metric => {
      const value = this.extractNumericValue(row, dataset, metric);
      if (value > 0) {
        this.recordMetric(metric, value, 'health', timestamp, dataset.name);
      }
    });
  }

  /**
   * Extract numeric value from row
   */
  private static extractNumericValue(row: any, dataset: any, metricName: string): number {
    // Direct match
    if (row[metricName] !== undefined) {
      const value = parseFloat(row[metricName]);
      if (!isNaN(value)) return value;
    }
    
    // Partial match
    const matchingColumn = dataset.columns.find((col: string) => 
      col.toLowerCase().includes(metricName.toLowerCase())
    );
    
    if (matchingColumn && row[matchingColumn] !== undefined) {
      const value = parseFloat(row[matchingColumn]);
      if (!isNaN(value)) return value;
    }
    
    return 0;
  }

  /**
   * Record a metric value
   */
  private static recordMetric(
    metric: string, 
    value: number, 
    domain: string, 
    timestamp: Date, 
    source: string
  ): void {
    const key = `${domain}:${metric}`;
    
    if (!this.metricRegistry.has(key)) {
      this.metricRegistry.set(key, {
        metric,
        total: 0,
        average: 0,
        count: 0,
        min: Infinity,
        max: -Infinity,
        trend: 'stable',
        lastUpdated: timestamp,
        history: []
      });
    }
    
    const aggregation = this.metricRegistry.get(key)!;
    
    // Update aggregation
    aggregation.total += value;
    aggregation.count += 1;
    aggregation.average = aggregation.total / aggregation.count;
    aggregation.min = Math.min(aggregation.min, value);
    aggregation.max = Math.max(aggregation.max, value);
    aggregation.lastUpdated = timestamp;
    
    // Add to history
    aggregation.history.push({
      date: timestamp,
      value,
      source
    });
    
    // Analyze trend
    if (aggregation.history.length >= 3) {
      const recent = aggregation.history.slice(-3);
      const firstAvg = (recent[0].value + recent[1].value) / 2;
      const secondAvg = (recent[1].value + recent[2].value) / 2;
      
      if (secondAvg > firstAvg * 1.1) {
        aggregation.trend = 'increasing';
      } else if (secondAvg < firstAvg * 0.9) {
        aggregation.trend = 'decreasing';
      } else {
        aggregation.trend = 'stable';
      }
    }
  }

  /**
   * Build domain-specific metrics
   */
  private static async buildDomainMetrics(): Promise<DomainMetrics[]> {
    const domainGroups = new Map<string, MetricAggregation[]>();
    
    // Group metrics by domain
    for (const [key, aggregation] of this.metricRegistry) {
      const [domain] = key.split(':');
      if (!domainGroups.has(domain)) {
        domainGroups.set(domain, []);
      }
      domainGroups.get(domain)!.push(aggregation);
    }
    
    // Build domain metrics
    const domainMetrics: DomainMetrics[] = [];
    
    for (const [domain, metrics] of domainGroups) {
      const metricMap: Record<string, MetricAggregation> = {};
      metrics.forEach(metric => {
        metricMap[metric.metric] = metric;
      });
      
      const allDates = metrics.flatMap(m => m.history.map(h => h.date));
      const timeRange = {
        start: new Date(Math.min(...allDates.map(d => d.getTime()))),
        end: new Date(Math.max(...allDates.map(d => d.getTime())))
      };
      
      domainMetrics.push({
        domain,
        metrics: metricMap,
        totalEntries: metrics.reduce((sum, m) => sum + m.count, 0),
        timeRange
      });
    }
    
    return domainMetrics;
  }

  /**
   * Analyze correlations across domains
   */
  private static async analyzeCrossDomain(domainMetrics: DomainMetrics[]): Promise<CrossDomainAnalysis> {
    const correlations: CorrelationMetric[] = [];
    const allMetrics = domainMetrics.flatMap(dm => 
      Object.values(dm.metrics)
    );
    
    // Find correlations between metrics
    for (let i = 0; i < allMetrics.length; i++) {
      for (let j = i + 1; j < allMetrics.length; j++) {
        const metric1 = allMetrics[i];
        const metric2 = allMetrics[j];
        
        const correlation = this.calculateCorrelation(metric1, metric2);
        if (correlation > 0.3) { // Only show meaningful correlations
          correlations.push({
            metric1: metric1.metric,
            metric2: metric2.metric,
            correlation,
            strength: correlation > 0.7 ? 'strong' : correlation > 0.5 ? 'moderate' : 'weak',
            description: `${metric1.metric} and ${metric2.metric} show a ${correlation > 0.7 ? 'strong' : correlation > 0.5 ? 'moderate' : 'weak'} correlation`
          });
        }
      }
    }
    
    // Generate combined insights
    const combinedInsights = this.generateCombinedInsights(domainMetrics);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(domainMetrics, correlations);
    
    return {
      correlations: correlations.sort((a, b) => b.correlation - a.correlation),
      combinedInsights,
      recommendations
    };
  }

  /**
   * Calculate correlation between two metrics
   */
  private static calculateCorrelation(metric1: MetricAggregation, metric2: MetricAggregation): number {
    // Simple correlation based on trends and values
    const trendCorrelation = metric1.trend === metric2.trend ? 0.3 : -0.1;
    const valueCorrelation = Math.abs(metric1.average - metric2.average) < 10 ? 0.2 : 0;
    
    return Math.min(1, Math.max(-1, trendCorrelation + valueCorrelation));
  }

  /**
   * Generate combined insights
   */
  private static generateCombinedInsights(domainMetrics: DomainMetrics[]): string[] {
    const insights: string[] = [];
    
    // Sports insights
    const sportsMetrics = domainMetrics.find(dm => dm.domain === 'sports');
    if (sportsMetrics) {
      const totalGoals = sportsMetrics.metrics['goals']?.total || 0;
      const totalAssists = sportsMetrics.metrics['assists']?.total || 0;
      if (totalGoals > 0) {
        insights.push(`Total goals scored: ${totalGoals}`);
      }
      if (totalAssists > 0) {
        insights.push(`Total assists: ${totalAssists}`);
      }
    }
    
    // Financial insights
    const financialMetrics = domainMetrics.find(dm => dm.domain === 'financial');
    if (financialMetrics) {
      const totalSpending = financialMetrics.metrics['amount']?.total || 0;
      const totalSavings = financialMetrics.metrics['savings']?.total || 0;
      if (totalSpending > 0) {
        insights.push(`Total spending: $${totalSpending.toFixed(2)}`);
      }
      if (totalSavings > 0) {
        insights.push(`Total savings: $${totalSavings.toFixed(2)}`);
      }
    }
    
    // Health insights
    const healthMetrics = domainMetrics.find(dm => dm.domain === 'health');
    if (healthMetrics) {
      const totalSteps = healthMetrics.metrics['steps']?.total || 0;
      const totalCalories = healthMetrics.metrics['calories']?.total || 0;
      if (totalSteps > 0) {
        insights.push(`Total steps: ${totalSteps.toLocaleString()}`);
      }
      if (totalCalories > 0) {
        insights.push(`Total calories burned: ${totalCalories.toLocaleString()}`);
      }
    }
    
    return insights;
  }

  /**
   * Generate recommendations
   */
  private static generateRecommendations(domainMetrics: DomainMetrics[], correlations: CorrelationMetric[]): string[] {
    const recommendations: string[] = [];
    
    // Domain-specific recommendations
    domainMetrics.forEach(dm => {
      if (dm.domain === 'sports') {
        const goalsMetric = dm.metrics['goals'];
        if (goalsMetric && goalsMetric.trend === 'decreasing') {
          recommendations.push('Focus on improving goal-scoring performance');
        }
      }
      
      if (dm.domain === 'financial') {
        const spendingMetric = dm.metrics['amount'];
        if (spendingMetric && spendingMetric.trend === 'increasing') {
          recommendations.push('Consider reviewing spending patterns to identify savings opportunities');
        }
      }
      
      if (dm.domain === 'health') {
        const stepsMetric = dm.metrics['steps'];
        if (stepsMetric && stepsMetric.trend === 'decreasing') {
          recommendations.push('Try to increase daily step count for better health');
        }
      }
    });
    
    // Cross-domain recommendations
    if (correlations.length > 0) {
      const strongCorrelations = correlations.filter(c => c.strength === 'strong');
      if (strongCorrelations.length > 0) {
        recommendations.push('Some metrics show strong correlations - consider analyzing these relationships further');
      }
    }
    
    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }

  /**
   * Build summary
   */
  private static buildSummary(domainMetrics: DomainMetrics[]): {
    totalMetrics: number;
    totalEntries: number;
    domains: string[];
    lastUpdated: Date;
  } {
    const totalMetrics = domainMetrics.reduce((sum, dm) => sum + Object.keys(dm.metrics).length, 0);
    const totalEntries = domainMetrics.reduce((sum, dm) => sum + dm.totalEntries, 0);
    const domains = domainMetrics.map(dm => dm.domain);
    const lastUpdated = new Date();
    
    return {
      totalMetrics,
      totalEntries,
      domains,
      lastUpdated
    };
  }

  /**
   * Get metrics for a specific domain
   */
  static getDomainMetrics(domain: string): DomainMetrics | null {
    const domainMetrics = Array.from(this.domainMetrics.values());
    return domainMetrics.find(dm => dm.domain === domain) || null;
  }

  /**
   * Get all aggregated metrics
   */
  static getAllMetrics(): MetricAggregation[] {
    return Array.from(this.metricRegistry.values());
  }

  /**
   * Clear all metrics (for testing)
   */
  static clearMetrics(): void {
    this.metricRegistry.clear();
    this.domainMetrics.clear();
  }
} 