export interface DomainInsight {
  type: 'financial' | 'sports' | 'health' | 'productivity' | 'social' | 'general';
  category: string;
  title: string;
  description: string;
  value: any;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  trend?: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
  recommendation?: string;
}

export interface DataDomain {
  type: string;
  confidence: number;
  indicators: string[];
  columns: string[];
}

export interface CrossDatasetInsight {
  datasets: string[];
  insight: string;
  correlation: number;
  recommendation: string;
}

export class DomainAnalyzer {
  /**
   * Detect the domain of the dataset
   */
  static detectDomain(data: any[], columns: string[], columnTypes: Record<string, string>): DataDomain {
    console.log('DomainAnalyzer: Detecting domain for dataset with', data.length, 'rows and', columns.length, 'columns');
    console.log('DomainAnalyzer: Columns:', columns);
    console.log('DomainAnalyzer: Column types:', columnTypes);
    
    const indicators = this.getDomainIndicators(data, columns, columnTypes);
    console.log('DomainAnalyzer: Indicators found:', indicators);
    
    // Financial domain detection
    if (this.isFinancialData(indicators, columns)) {
      console.log('DomainAnalyzer: Detected financial domain');
      return {
        type: 'financial',
        confidence: this.calculateFinancialConfidence(indicators),
        indicators,
        columns
      };
    }
    
    // Sports domain detection
    if (this.isSportsData(indicators, columns)) {
      console.log('DomainAnalyzer: Detected sports domain');
      return {
        type: 'sports',
        confidence: this.calculateSportsConfidence(indicators),
        indicators,
        columns
      };
    }
    
    // Health domain detection
    if (this.isHealthData(indicators, columns)) {
      console.log('DomainAnalyzer: Detected health domain');
      return {
        type: 'health',
        confidence: this.calculateHealthConfidence(indicators),
        indicators,
        columns
      };
    }
    
    // Productivity domain detection
    if (this.isProductivityData(indicators, columns)) {
      console.log('DomainAnalyzer: Detected productivity domain');
      return {
        type: 'productivity',
        confidence: this.calculateProductivityConfidence(indicators),
        indicators,
        columns
      };
    }
    
    console.log('DomainAnalyzer: Detected general domain');
    return {
      type: 'general',
      confidence: 0.5,
      indicators,
      columns
    };
  }

  /**
   * Generate domain-specific insights
   */
  static generateDomainInsights(
    data: any[], 
    columns: string[], 
    columnTypes: Record<string, string>,
    domain: DataDomain
  ): DomainInsight[] {
    switch (domain.type) {
      case 'financial':
        return this.generateFinancialInsights(data, columns, columnTypes);
      case 'sports':
        return this.generateSportsInsights(data, columns, columnTypes);
      case 'health':
        return this.generateHealthInsights(data, columns, columnTypes);
      case 'productivity':
        return this.generateProductivityInsights(data, columns, columnTypes);
      default:
        return this.generateGeneralInsights(data, columns, columnTypes);
    }
  }

  /**
   * Generate financial insights
   */
  private static generateFinancialInsights(data: any[], columns: string[], columnTypes: Record<string, string>): DomainInsight[] {
    const insights: DomainInsight[] = [];
    
    // Find money-related columns
    const moneyColumns = columns.filter(col => 
      this.isMoneyColumn(col, data) || 
      (columnTypes[col] === 'number' && this.hasMoneyValues(data, col))
    );
    
    const dateColumns = columns.filter(col => this.isDateColumn(data, col));
    
    moneyColumns.forEach(moneyCol => {
      const values = data.map(row => row[moneyCol]).filter(v => v !== null && !isNaN(v));
      if (values.length === 0) return;
      
      const total = values.reduce((sum, val) => sum + val, 0);
      const avg = total / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      // Total insights
      insights.push({
        type: 'financial',
        category: 'summary',
        title: `Total ${this.getMoneyColumnName(moneyCol)}`,
        description: `You have ${this.formatMoney(total)} in total ${this.getMoneyColumnName(moneyCol).toLowerCase()}`,
        value: { total, avg, max, min },
        confidence: 0.9,
        priority: 'high'
      });
      
      // Trend analysis
      if (dateColumns.length > 0) {
        const dateCol = dateColumns[0];
        const timeSeriesData = data
          .map(row => ({ date: new Date(row[dateCol]), value: row[moneyCol] }))
          .filter(item => !isNaN(item.date.getTime()) && item.value !== null && !isNaN(item.value))
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        
        if (timeSeriesData.length >= 3) {
          const trend = this.calculateTrend(timeSeriesData.map(item => item.value));
          const trendDirection = trend > 0.1 ? 'increasing' : trend < -0.1 ? 'decreasing' : 'stable';
          
          insights.push({
            type: 'financial',
            category: 'trend',
            title: `${this.getMoneyColumnName(moneyCol)} Trend`,
            description: `Your ${this.getMoneyColumnName(moneyCol).toLowerCase()} is ${trendDirection} over time`,
            value: { trend, timeSeriesData },
            confidence: 0.8,
            priority: 'high',
            trend: trendDirection,
            recommendation: this.getFinancialRecommendation(trendDirection, avg)
          });
          
          // Best/worst periods
          const bestMonth = timeSeriesData.reduce((best, current) => 
            current.value > best.value ? current : best
          );
          const worstMonth = timeSeriesData.reduce((worst, current) => 
            current.value < worst.value ? current : worst
          );
          
          insights.push({
            type: 'financial',
            category: 'performance',
            title: `Best ${this.getMoneyColumnName(moneyCol)} Month`,
            description: `Your best month was ${bestMonth.date.toLocaleDateString()} with ${this.formatMoney(bestMonth.value)}`,
            value: { bestMonth, worstMonth },
            confidence: 0.9,
            priority: 'medium'
          });
        }
      }
      
      // Savings rate analysis (if it's savings data)
      if (this.isSavingsColumn(moneyCol)) {
        const positiveValues = values.filter(v => v > 0);
        const negativeValues = values.filter(v => v < 0);
        
        if (positiveValues.length > 0) {
          const avgSavings = positiveValues.reduce((sum, val) => sum + val, 0) / positiveValues.length;
          insights.push({
            type: 'financial',
            category: 'savings',
            title: 'Average Monthly Savings',
            description: `You save an average of ${this.formatMoney(avgSavings)} per month`,
            value: { avgSavings, positiveCount: positiveValues.length },
            confidence: 0.8,
            priority: 'high'
          });
        }
      }
    });
    
    return insights;
  }

  /**
   * Generate sports insights
   */
  private static generateSportsInsights(data: any[], columns: string[], columnTypes: Record<string, string>): DomainInsight[] {
    const insights: DomainInsight[] = [];
    
    // Find sports-related columns
    const performanceColumns = columns.filter(col => 
      this.isSportsPerformanceColumn(col) || 
      (columnTypes[col] === 'number' && this.hasSportsValues(data, col))
    );
    
    const dateColumns = columns.filter(col => this.isDateColumn(data, col));
    
    performanceColumns.forEach(perfCol => {
      const values = data.map(row => row[perfCol]).filter(v => v !== null && !isNaN(v));
      if (values.length === 0) return;
      
      const total = values.reduce((sum, val) => sum + val, 0);
      const avg = total / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      insights.push({
        type: 'sports',
        category: 'performance',
        title: `Total ${this.getSportsColumnName(perfCol)}`,
        description: `You have ${total} total ${this.getSportsColumnName(perfCol).toLowerCase()}`,
        value: { total, avg, max, min },
        confidence: 0.9,
        priority: 'high'
      });
      
      // Performance trend
      if (dateColumns.length > 0) {
        const dateCol = dateColumns[0];
        const timeSeriesData = data
          .map(row => ({ date: new Date(row[dateCol]), value: row[perfCol] }))
          .filter(item => !isNaN(item.date.getTime()) && item.value !== null && !isNaN(item.value))
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        
        if (timeSeriesData.length >= 3) {
          const trend = this.calculateTrend(timeSeriesData.map(item => item.value));
          const trendDirection = trend > 0.1 ? 'increasing' : trend < -0.1 ? 'decreasing' : 'stable';
          
          insights.push({
            type: 'sports',
            category: 'trend',
            title: `${this.getSportsColumnName(perfCol)} Performance Trend`,
            description: `Your ${this.getSportsColumnName(perfCol).toLowerCase()} performance is ${trendDirection}`,
            value: { trend, timeSeriesData },
            confidence: 0.8,
            priority: 'high',
            trend: trendDirection,
            recommendation: this.getSportsRecommendation(trendDirection, avg)
          });
        }
      }
    });
    
    return insights;
  }

  /**
   * Generate health insights
   */
  private static generateHealthInsights(data: any[], columns: string[], columnTypes: Record<string, string>): DomainInsight[] {
    const insights: DomainInsight[] = [];
    
    // Find health-related columns
    const healthColumns = columns.filter(col => 
      this.isHealthColumn(col) || 
      (columnTypes[col] === 'number' && this.hasHealthValues(data, col))
    );
    
    healthColumns.forEach(healthCol => {
      const values = data.map(row => row[healthCol]).filter(v => v !== null && !isNaN(v));
      if (values.length === 0) return;
      
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      insights.push({
        type: 'health',
        category: 'metrics',
        title: `Average ${this.getHealthColumnName(healthCol)}`,
        description: `Your average ${this.getHealthColumnName(healthCol).toLowerCase()} is ${avg.toFixed(1)}`,
        value: { avg, values },
        confidence: 0.8,
        priority: 'medium'
      });
    });
    
    return insights;
  }

  /**
   * Generate productivity insights
   */
  private static generateProductivityInsights(data: any[], columns: string[], columnTypes: Record<string, string>): DomainInsight[] {
    const insights: DomainInsight[] = [];
    
    // Find productivity-related columns
    const productivityColumns = columns.filter(col => 
      this.isProductivityColumn(col) || 
      (columnTypes[col] === 'number' && this.hasProductivityValues(data, col))
    );
    
    productivityColumns.forEach(prodCol => {
      const values = data.map(row => row[prodCol]).filter(v => v !== null && !isNaN(v));
      if (values.length === 0) return;
      
      const total = values.reduce((sum, val) => sum + val, 0);
      const avg = total / values.length;
      
      insights.push({
        type: 'productivity',
        category: 'summary',
        title: `Total ${this.getProductivityColumnName(prodCol)}`,
        description: `You have ${total} total ${this.getProductivityColumnName(prodCol).toLowerCase()}`,
        value: { total, avg },
        confidence: 0.8,
        priority: 'medium'
      });
    });
    
    return insights;
  }

  /**
   * Generate general insights
   */
  private static generateGeneralInsights(data: any[], columns: string[], columnTypes: Record<string, string>): DomainInsight[] {
    const insights: DomainInsight[] = [];
    
    // Basic statistical insights
    columns.forEach(col => {
      if (columnTypes[col] === 'number') {
        const values = data.map(row => row[col]).filter(v => v !== null && !isNaN(v));
        if (values.length > 0) {
          const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
          const max = Math.max(...values);
          const min = Math.min(...values);
          
          insights.push({
            type: 'general',
            category: 'statistics',
            title: `${col} Statistics`,
            description: `Average: ${avg.toFixed(2)}, Range: ${min.toFixed(2)} - ${max.toFixed(2)}`,
            value: { avg, max, min },
            confidence: 0.7,
            priority: 'medium'
          });
        }
      }
    });
    
    return insights;
  }

  /**
   * Helper methods for domain detection
   */
  private static getDomainIndicators(data: any[], columns: string[], columnTypes: Record<string, string>): string[] {
    const indicators: string[] = [];
    
    columns.forEach(col => {
      const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined);
      
      // Check for money indicators
      if (this.isMoneyColumn(col, data)) indicators.push('money');
      if (this.hasMoneyValues(data, col)) indicators.push('currency');
      
      // Check for sports indicators
      if (this.isSportsPerformanceColumn(col)) indicators.push('sports');
      if (this.hasSportsValues(data, col)) indicators.push('performance');
      
      // Check for health indicators
      if (this.isHealthColumn(col)) indicators.push('health');
      if (this.hasHealthValues(data, col)) indicators.push('wellness');
      
      // Check for productivity indicators
      if (this.isProductivityColumn(col)) indicators.push('productivity');
      if (this.hasProductivityValues(data, col)) indicators.push('tasks');
    });
    
    return [...new Set(indicators)];
  }

  private static isFinancialData(indicators: string[], columns: string[]): boolean {
    return indicators.includes('money') || 
           indicators.includes('currency') ||
           columns.some(col => this.isMoneyColumn(col, []));
  }

  private static isSportsData(indicators: string[], columns: string[]): boolean {
    return indicators.includes('sports') || 
           indicators.includes('performance') ||
           columns.some(col => this.isSportsPerformanceColumn(col));
  }

  private static isHealthData(indicators: string[], columns: string[]): boolean {
    return indicators.includes('health') || 
           indicators.includes('wellness') ||
           columns.some(col => this.isHealthColumn(col));
  }

  private static isProductivityData(indicators: string[], columns: string[]): boolean {
    return indicators.includes('productivity') || 
           indicators.includes('tasks') ||
           columns.some(col => this.isProductivityColumn(col));
  }

  /**
   * Column type detection methods
   */
  private static isMoneyColumn(col: string, data: any[]): boolean {
    const moneyKeywords = ['money', 'amount', 'cost', 'price', 'savings', 'spending', 'expense', 'income', 'revenue', 'budget', 'cash', 'dollar', 'euro', 'pound', 'currency'];
    return moneyKeywords.some(keyword => col.toLowerCase().includes(keyword));
  }

  private static isSavingsColumn(col: string): boolean {
    const savingsKeywords = ['savings', 'save', 'saved', 'deposit'];
    return savingsKeywords.some(keyword => col.toLowerCase().includes(keyword));
  }

  private static isSportsPerformanceColumn(col: string): boolean {
    const sportsKeywords = ['goal', 'assist', 'score', 'point', 'win', 'loss', 'match', 'game', 'performance', 'fitness', 'exercise', 'workout'];
    return sportsKeywords.some(keyword => col.toLowerCase().includes(keyword));
  }

  private static isHealthColumn(col: string): boolean {
    const healthKeywords = ['weight', 'height', 'bmi', 'heart', 'blood', 'pressure', 'sleep', 'calories', 'steps', 'mood', 'energy'];
    return healthKeywords.some(keyword => col.toLowerCase().includes(keyword));
  }

  private static isProductivityColumn(col: string): boolean {
    const productivityKeywords = ['task', 'todo', 'project', 'work', 'study', 'read', 'write', 'complete', 'done', 'progress'];
    return productivityKeywords.some(keyword => col.toLowerCase().includes(keyword));
  }

  private static hasMoneyValues(data: any[], col: string): boolean {
    const sampleValues = data.slice(0, 10).map(row => String(row[col]));
    return sampleValues.some(val => /[\$€£¥₹]/.test(val) || /\d+\.\d{2}/.test(val));
  }

  private static hasSportsValues(data: any[], col: string): boolean {
    const sampleValues = data.slice(0, 10).map(row => String(row[col]));
    return sampleValues.some(val => /goal|assist|win|loss|match/i.test(val));
  }

  private static hasHealthValues(data: any[], col: string): boolean {
    const sampleValues = data.slice(0, 10).map(row => String(row[col]));
    return sampleValues.some(val => /weight|height|bmi|sleep|calories/i.test(val));
  }

  private static hasProductivityValues(data: any[], col: string): boolean {
    const sampleValues = data.slice(0, 10).map(row => String(row[col]));
    return sampleValues.some(val => /task|todo|project|complete|done/i.test(val));
  }

  private static isDateColumn(data: any[], col: string): boolean {
    const sampleValues = data.slice(0, 10).map(row => row[col]).filter(v => v !== null && v !== undefined);
    return sampleValues.some(value => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    });
  }

  /**
   * Confidence calculation methods
   */
  private static calculateFinancialConfidence(indicators: string[]): number {
    let confidence = 0.5;
    if (indicators.includes('money')) confidence += 0.3;
    if (indicators.includes('currency')) confidence += 0.2;
    return Math.min(confidence, 1.0);
  }

  private static calculateSportsConfidence(indicators: string[]): number {
    let confidence = 0.5;
    if (indicators.includes('sports')) confidence += 0.3;
    if (indicators.includes('performance')) confidence += 0.2;
    return Math.min(confidence, 1.0);
  }

  private static calculateHealthConfidence(indicators: string[]): number {
    let confidence = 0.5;
    if (indicators.includes('health')) confidence += 0.3;
    if (indicators.includes('wellness')) confidence += 0.2;
    return Math.min(confidence, 1.0);
  }

  private static calculateProductivityConfidence(indicators: string[]): number {
    let confidence = 0.5;
    if (indicators.includes('productivity')) confidence += 0.3;
    if (indicators.includes('tasks')) confidence += 0.2;
    return Math.min(confidence, 1.0);
  }

  /**
   * Utility methods
   */
  private static calculateTrend(values: number[]): number {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private static formatMoney(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  private static getMoneyColumnName(col: string): string {
    if (col.toLowerCase().includes('savings')) return 'Savings';
    if (col.toLowerCase().includes('spending')) return 'Spending';
    if (col.toLowerCase().includes('income')) return 'Income';
    if (col.toLowerCase().includes('expense')) return 'Expenses';
    return 'Money';
  }

  private static getSportsColumnName(col: string): string {
    if (col.toLowerCase().includes('goal')) return 'Goals';
    if (col.toLowerCase().includes('assist')) return 'Assists';
    if (col.toLowerCase().includes('score')) return 'Score';
    return 'Performance';
  }

  private static getHealthColumnName(col: string): string {
    if (col.toLowerCase().includes('weight')) return 'Weight';
    if (col.toLowerCase().includes('sleep')) return 'Sleep';
    if (col.toLowerCase().includes('steps')) return 'Steps';
    return 'Health Metric';
  }

  private static getProductivityColumnName(col: string): string {
    if (col.toLowerCase().includes('task')) return 'Tasks';
    if (col.toLowerCase().includes('project')) return 'Projects';
    if (col.toLowerCase().includes('work')) return 'Work';
    return 'Productivity';
  }

  private static getFinancialRecommendation(trend: string, avg: number): string {
    if (trend === 'increasing') {
      return "Great job! Keep up the positive trend. Consider setting higher goals.";
    } else if (trend === 'decreasing') {
      return "Consider reviewing your spending habits and setting a budget.";
    } else {
      return "Your finances are stable. Consider diversifying your savings.";
    }
  }

  private static getSportsRecommendation(trend: string, avg: number): string {
    if (trend === 'increasing') {
      return "Excellent progress! Your training is paying off.";
    } else if (trend === 'decreasing') {
      return "Consider adjusting your training routine or seeking coaching.";
    } else {
      return "Consistent performance. Try setting new challenges to improve.";
    }
  }
} 