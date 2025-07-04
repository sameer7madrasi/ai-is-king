import { DomainAnalyzer, DomainInsight, DataDomain } from './domainAnalyzer';
import { CorrelationAnalyzer, DatasetMetadata, CrossDatasetInsight } from './correlationAnalyzer';
import { AIAnalyticsService, AIInsight, AIDataAnalysis } from './aiAnalyticsService';

export interface AnalyticsResult {
  summary: {
    totalDatasets: number;
    totalRecords: number;
    domains: Record<string, number>;
    lastUpdated: Date;
  };
  insights: DomainInsight[];
  crossDatasetInsights: CrossDatasetInsight[];
  recommendations: string[];
  charts: ChartSuggestion[];
  // AI-powered insights
  aiInsights: AIInsight[];
  aiAnalysis: AIDataAnalysis | null;
  aiSummary: string;
}

export interface ChartSuggestion {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area';
  title: string;
  description: string;
  data: any;
  priority: 'high' | 'medium' | 'low';
}

export class AnalyticsService {
  /**
   * Analyze all datasets and generate comprehensive insights
   */
  static async analyzeAllData(): Promise<AnalyticsResult> {
    try {
      console.log('Analytics: Starting analysis...');
      // Get all datasets from database
      const datasets = await this.getAllDatasets();
      console.log('Analytics: Retrieved datasets:', datasets.length, datasets.map(d => d.name));
      if (datasets.length === 0) {
        console.log('Analytics: No datasets found, returning empty result');
        return this.getEmptyResult();
      }
      // Detect domains and generate insights for each dataset
      const allInsights: DomainInsight[] = [];
      const datasetMetadata: DatasetMetadata[] = [];
      for (const dataset of datasets) {
        console.log('Analytics: Processing dataset:', dataset.name, 'Rows:', dataset.data.length);
        
        // Check if this is NLP-processed data
        const isNLPData = this.isNLPProcessedData(dataset);
        let domain: any;
        let insights: DomainInsight[] = [];
        
        if (isNLPData) {
          console.log('Analytics: Detected NLP-processed data, using stored domain information');
          domain = this.extractDomainFromNLPData(dataset);
          insights = this.generateNLPInsights(dataset);
        } else {
          console.log('Analytics: Using standard domain detection');
          domain = DomainAnalyzer.detectDomain(
            dataset.data, 
            dataset.columns, 
            dataset.columnTypes
          );
          insights = DomainAnalyzer.generateDomainInsights(
            dataset.data,
            dataset.columns,
            dataset.columnTypes,
            domain
          );
        }
        
        allInsights.push(...insights);
        datasetMetadata.push({
          id: dataset.id,
          name: dataset.name,
          domain: domain.type,
          columns: dataset.columns,
          columnTypes: dataset.columnTypes,
          data: dataset.data,
          createdAt: new Date(dataset.createdAt)
        });
      }
      // Find correlations between datasets
      const correlations = CorrelationAnalyzer.findCorrelations(datasetMetadata);
      // Generate cross-dataset insights
      const crossDatasetInsights = CorrelationAnalyzer.generateCrossDatasetInsights(
        datasetMetadata,
        correlations
      );
      // Generate recommendations
      const recommendations = this.generateRecommendations(allInsights, crossDatasetInsights);
      // Generate chart suggestions
      const charts = this.generateChartSuggestions(allInsights, datasetMetadata);
      // Generate AI-powered insights
      const aiAnalysis = await this.generateAIAnalysis(datasetMetadata);
      // Defensive: ensure aiAnalysis is an object with arrays, or fallback to []
      const aiInsights = aiAnalysis && Array.isArray(aiAnalysis.keyInsights)
        ? [
            ...(aiAnalysis.keyInsights || []),
            ...(aiAnalysis.recommendations || []),
            ...(aiAnalysis.crossDatasetInsights || [])
          ]
        : [];
      return {
        summary: {
          totalDatasets: datasets.length,
          totalRecords: datasets.reduce((sum, d) => sum + d.data.length, 0),
          domains: this.countDomains(datasetMetadata),
          lastUpdated: new Date()
        },
        insights: allInsights.sort((a, b) => {
          // Sort by priority first, then by confidence
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const aScore = priorityOrder[a.priority] * a.confidence;
          const bScore = priorityOrder[b.priority] * b.confidence;
          return bScore - aScore;
        }),
        crossDatasetInsights,
        recommendations,
        charts,
        aiInsights,
        aiAnalysis: aiAnalysis || null,
        aiSummary: aiAnalysis?.summary || "No AI analysis available"
      };
    } catch (error) {
      console.error('Error analyzing data:', error);
      return this.getEmptyResult();
    }
  }

  /**
   * Get all datasets from database
   */
  private static async getAllDatasets(): Promise<any[]> {
    try {
      console.log('Analytics: Importing database service...');
      const { databaseService } = await import('./database');
      console.log('Analytics: Database service imported successfully');
      
      // Get all files from the database
      console.log('Analytics: Calling getAllFiles...');
      const files = await databaseService.getAllFiles();
      console.log('Analytics: getAllFiles returned:', files.length, 'files', files.map(f => f.fileName));
      const datasets = [];
      
      // For each file, get its data and create a dataset object
      for (const file of files) {
        try {
          console.log(`Analytics: Processing file ${file.id} - ${file.fileName}`);
          const data = await databaseService.getFileData(file.id);
          console.log(`Analytics: Got ${data.length} rows for file ${file.id}`);
          
          if (data && data.length > 0) {
            datasets.push({
              id: file.id,
              name: file.fileName,
              data: data,
              columns: file.columns,
              columnTypes: file.columnTypes,
              createdAt: file.uploadDate
            });
            console.log(`Analytics: Added dataset for ${file.fileName}`);
          } else {
            console.log(`Analytics: Skipped file ${file.fileName} (no data)`);
          }
        } catch (error) {
          console.error(`Error getting data for file ${file.id}:`, error);
        }
      }
      
      console.log(`Analytics: Total datasets processed: ${datasets.length}`);
      
      return datasets;
    } catch (error) {
      console.error('Error fetching datasets:', error);
      return [];
    }
  }

  /**
   * Check if dataset is NLP-processed data
   */
  private static isNLPProcessedData(dataset: any): boolean {
    return dataset.columns.includes('domain') && 
           dataset.columns.includes('insights') && 
           dataset.columns.includes('recommendations');
  }

  /**
   * Extract domain information from NLP-processed data
   */
  private static extractDomainFromNLPData(dataset: any): any {
    if (dataset.data.length === 0) {
      return { type: 'general', confidence: 0.5, indicators: [], columns: dataset.columns };
    }
    
    const firstRow = dataset.data[0];
    const domain = firstRow.domain || 'general';
    const confidence = firstRow.confidence || 0.8;
    
    return {
      type: domain,
      confidence: confidence,
      indicators: ['nlp_processed'],
      columns: dataset.columns
    };
  }

  /**
   * Generate insights from NLP-processed data
   */
  private static generateNLPInsights(dataset: any): DomainInsight[] {
    const insights: DomainInsight[] = [];
    
    if (dataset.data.length === 0) return insights;
    
    const firstRow = dataset.data[0];
    const domain = firstRow.domain || 'general';
    const timestamp = Date.now();
    
    // Parse metrics if available
    if (firstRow.metrics) {
      try {
        const metrics = JSON.parse(firstRow.metrics);
        Object.entries(metrics).forEach(([key, value]) => {
          if (typeof value === 'number' && value > 0) {
            insights.push({
              type: domain as any,
              category: 'metrics',
              title: `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`,
              description: `Recorded ${value} ${key}`,
              value: { [key]: value },
              confidence: firstRow.confidence || 0.8,
              priority: 'medium'
            });
          }
        });
      } catch (error) {
        console.error('Error parsing metrics:', error);
      }
    }
    
    // Parse insights if available
    if (firstRow.insights) {
      const insightList = firstRow.insights.split('; ').filter((i: string) => i.trim());
      insightList.forEach((insight: string, index: number) => {
        insights.push({
          type: domain as any,
          category: 'nlp_insight',
          title: `Insight ${index + 1}`,
          description: insight,
          value: { insight },
          confidence: firstRow.confidence || 0.8,
          priority: 'medium'
        });
      });
    }
    
    // Parse recommendations if available
    if (firstRow.recommendations) {
      const recList = firstRow.recommendations.split('; ').filter((r: string) => r.trim());
      recList.forEach((rec: string, index: number) => {
        insights.push({
          type: domain as any,
          category: 'recommendation',
          title: `Recommendation ${index + 1}`,
          description: rec,
          value: { recommendation: rec },
          confidence: firstRow.confidence || 0.8,
          priority: 'high',
          recommendation: rec
        });
      });
    }
    
    return insights;
  }

  /**
   * Count datasets by domain
   */
  private static countDomains(datasets: DatasetMetadata[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    datasets.forEach(dataset => {
      counts[dataset.domain] = (counts[dataset.domain] || 0) + 1;
    });
    
    return counts;
  }

  /**
   * Generate recommendations based on insights
   */
  private static generateRecommendations(
    insights: DomainInsight[], 
    crossDatasetInsights: CrossDatasetInsight[]
  ): string[] {
    const recommendations: string[] = [];
    
    // High priority insights get recommendations
    insights
      .filter(insight => insight.priority === 'high' && insight.recommendation)
      .forEach(insight => {
        recommendations.push(insight.recommendation!);
      });
    
    // Cross-dataset insights get recommendations
    crossDatasetInsights
      .filter(insight => insight.correlation > 0.5)
      .forEach(insight => {
        recommendations.push(insight.recommendation);
      });
    
    // Add general recommendations based on data patterns
    const financialInsights = insights.filter(i => i.type === 'financial');
    const sportsInsights = insights.filter(i => i.type === 'sports');
    const healthInsights = insights.filter(i => i.type === 'health');
    
    if (financialInsights.length > 0) {
      recommendations.push("Consider setting up automated tracking for your financial data to get more consistent insights.");
    }
    
    if (sportsInsights.length > 0) {
      recommendations.push("Track your performance metrics regularly to identify improvement patterns.");
    }
    
    if (healthInsights.length > 0) {
      recommendations.push("Monitor your health trends over time to maintain optimal wellness.");
    }
    
    return [...new Set(recommendations)].slice(0, 5); // Remove duplicates and limit to 5
  }

  /**
   * Generate chart suggestions based on insights
   */
  private static generateChartSuggestions(
    insights: DomainInsight[], 
    datasets: DatasetMetadata[]
  ): ChartSuggestion[] {
    const charts: ChartSuggestion[] = [];
    
    // Generate charts for each dataset
    datasets.forEach(dataset => {
      const datasetInsights = insights.filter(insight => 
        insight.value && insight.value.timeSeriesData
      );
      
      datasetInsights.forEach(insight => {
        if (insight.value.timeSeriesData && insight.value.timeSeriesData.length > 0) {
          charts.push({
            type: 'line',
            title: `${insight.title} Over Time`,
            description: `Track ${insight.title.toLowerCase()} trends`,
            data: {
              labels: insight.value.timeSeriesData.map((item: any) => 
                item.date.toLocaleDateString()
              ),
              datasets: [{
                label: insight.title,
                data: insight.value.timeSeriesData.map((item: any) => item.value),
                borderColor: this.getChartColor(insight.type),
                backgroundColor: this.getChartColor(insight.type, 0.1)
              }]
            },
            priority: insight.priority
          });
        }
      });
      
      // Generate summary charts for financial data
      if (dataset.domain === 'financial') {
        const moneyColumns = dataset.columns.filter(col => 
          DomainAnalyzer['isMoneyColumn'](col, dataset.data)
        );
        
        if (moneyColumns.length > 0) {
          const totalValues = moneyColumns.map(col => {
            const values = dataset.data.map(row => row[col]).filter(v => v !== null && !isNaN(v));
            return values.reduce((sum, val) => sum + val, 0);
          });
          
          charts.push({
            type: 'pie',
            title: 'Financial Breakdown',
            description: 'Distribution of your financial data',
            data: {
              labels: moneyColumns,
              datasets: [{
                data: totalValues,
                backgroundColor: moneyColumns.map((_, i) => this.getChartColor('financial', 0.8, i))
              }]
            },
            priority: 'medium'
          });
        }
      }
      
      // Generate performance charts for sports data
      if (dataset.domain === 'sports') {
        const performanceColumns = dataset.columns.filter(col => 
          DomainAnalyzer['isSportsPerformanceColumn'](col)
        );
        
        if (performanceColumns.length > 0) {
          const totalValues = performanceColumns.map(col => {
            const values = dataset.data.map(row => row[col]).filter(v => v !== null && !isNaN(v));
            return values.reduce((sum, val) => sum + val, 0);
          });
          
          charts.push({
            type: 'bar',
            title: 'Sports Performance Summary',
            description: 'Total performance metrics',
            data: {
              labels: performanceColumns,
              datasets: [{
                label: 'Total',
                data: totalValues,
                backgroundColor: performanceColumns.map((_, i) => this.getChartColor('sports', 0.8, i))
              }]
            },
            priority: 'medium'
          });
        }
      }
    });
    
    return charts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }).slice(0, 10); // Limit to 10 charts
  }

  /**
   * Get chart colors based on insight type
   */
  private static getChartColor(type: string, alpha: number = 1, index: number = 0): string {
    const colors = {
      financial: ['#10B981', '#059669', '#047857', '#065F46'],
      sports: ['#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF'],
      health: ['#F59E0B', '#D97706', '#B45309', '#92400E'],
      productivity: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'],
      general: ['#6B7280', '#4B5563', '#374151', '#1F2937']
    };
    
    const colorSet = colors[type as keyof typeof colors] || colors.general;
    const color = colorSet[index % colorSet.length];
    
    if (alpha < 1) {
      return color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    }
    
    return color;
  }

  /**
   * Get empty result when no data is available
   */
  /**
   * Generate AI-powered analysis for datasets
   */
  private static async generateAIAnalysis(datasets: DatasetMetadata[]): Promise<any> {
    try {
      if (datasets.length === 0) return null;
      
      // Use AI analytics service to analyze all datasets
      const aiAnalysis = await AIAnalyticsService.analyzeMultipleDatasetsWithAI(datasets);
      return aiAnalysis;
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      return null;
    }
  }

  private static getEmptyResult(): AnalyticsResult {
    return {
      summary: {
        totalDatasets: 0,
        totalRecords: 0,
        domains: {},
        lastUpdated: new Date()
      },
      insights: [],
      crossDatasetInsights: [],
      recommendations: [
        "Upload your first dataset to start getting insights",
        "Try uploading different types of data to discover correlations",
        "Use the text input to quickly add data points"
      ],
      charts: [],
      aiInsights: [],
      aiAnalysis: null,
      aiSummary: "No data available for analysis"
    };
  }
} 