"use client";

import React, { useState, useEffect } from 'react';
import { AnalyticsResult, AggregatedInsight } from '@/lib/analyticsService';
import { DomainInsight } from '@/lib/domainAnalyzer';
import { CrossDatasetInsight } from '@/lib/correlationAnalyzer';
import InsightsByCategory from '@/components/InsightsByCategory';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      console.log('Fetching analytics...');
      
      const response = await fetch('/api/analytics');
      console.log('Analytics response status:', response.status);
      
      const result = await response.json();
      console.log('Analytics result:', result);
      
      if (result.success) {
        setAnalytics(result.data);
        console.log('Analytics data set:', {
          totalDatasets: result.data.summary.totalDatasets,
          totalRecords: result.data.summary.totalRecords,
          insightsCount: result.data.insights.length,
          aggregatedInsightsCount: result.data.aggregatedInsights?.length || 0
        });
      } else {
        setError(result.error || 'Failed to fetch analytics');
        console.error('Analytics error:', result.error, result.details);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'financial': return '💰';
      case 'sports': return '⚽';
      case 'health': return '🏥';
      case 'productivity': return '📈';
      default: return '📊';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'financial': return 'bg-green-50 border-green-200 text-green-800';
      case 'sports': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'health': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'productivity': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAIInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return '📈';
      case 'anomaly': return '⚠️';
      case 'correlation': return '🔗';
      case 'recommendation': return '💡';
      case 'prediction': return '🔮';
      case 'pattern': return '🔍';
      default: return '📊';
    }
  };

  const getAIInsightColor = (type: string) => {
    switch (type) {
      case 'trend': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'anomaly': return 'bg-red-50 border-red-200 text-red-800';
      case 'correlation': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'recommendation': return 'bg-green-50 border-green-200 text-green-800';
      case 'prediction': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'pattern': return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
            <p className="text-gray-600 mb-8">No data available for analysis</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">
              AI-powered insights from your data • Last updated: {analytics.summary.lastUpdated.toLocaleString()}
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📊</div>
              <div>
                <p className="text-sm text-gray-600">Total Datasets</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalDatasets}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📝</div>
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalRecords}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📈</div>
              <div>
                <p className="text-sm text-gray-600">Total Metrics</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalMetrics || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🎯</div>
              <div>
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalEntries || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Aggregated Metrics Section */}
        {analytics.aggregatedInsights && analytics.aggregatedInsights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Aggregated Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analytics.aggregatedInsights.slice(0, 9).map((insight, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{getInsightIcon(insight.domain)}</span>
                      <span className="text-sm font-medium text-gray-500 uppercase">{insight.domain}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                      {insight.priority}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                    {insight.metric}
                  </h3>
                  
                  <p className="text-gray-600 mb-3">{insight.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`text-lg font-semibold ${getTrendColor(insight.trend)}`}>
                        {getTrendIcon(insight.trend)}
                      </span>
                      <span className="ml-2 text-sm text-gray-600">
                        Avg: {insight.average.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {insight.total.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cross-Domain Analysis */}
        {analytics.crossDomainAnalysis && analytics.crossDomainAnalysis.correlations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🔗 Cross-Domain Correlations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analytics.crossDomainAnalysis.correlations.slice(0, 6).map((correlation, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-2">🔗</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      correlation.strength === 'strong' ? 'bg-purple-100 text-purple-800' :
                      correlation.strength === 'moderate' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {correlation.strength}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {correlation.metric1} ↔ {correlation.metric2}
                  </h3>
                  
                  <p className="text-gray-600 mb-3">{correlation.description}</p>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {(correlation.correlation * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">Correlation</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Combined Insights */}
        {analytics.crossDomainAnalysis && analytics.crossDomainAnalysis.combinedInsights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">💡 Combined Insights</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.crossDomainAnalysis.combinedInsights.map((insight, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl mr-3">💡</span>
                    <span className="text-gray-700">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Insights */}
        {analytics.aiInsights && analytics.aiInsights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🤖 AI-Powered Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analytics.aiInsights.slice(0, 9).map((insight, index) => (
                <div key={index} className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                  insight.type === 'trend' ? 'border-blue-500' :
                  insight.type === 'anomaly' ? 'border-red-500' :
                  insight.type === 'correlation' ? 'border-purple-500' :
                  insight.type === 'recommendation' ? 'border-green-500' :
                  insight.type === 'prediction' ? 'border-orange-500' :
                  'border-gray-500'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{getAIInsightIcon(insight.type)}</span>
                      <span className="text-sm font-medium text-gray-500 uppercase">{insight.type}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                      {insight.priority}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                  
                  <p className="text-gray-600 mb-3">{insight.description}</p>
                  
                  {insight.explanation && (
                    <p className="text-sm text-gray-500 mb-3">{insight.explanation}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${getImpactColor(insight.impact || 'neutral')}`}>
                        {insight.impact || 'neutral'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {(insight.confidence * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">Confidence</div>
                    </div>
                  </div>
                  
                  {insight.actionItems && insight.actionItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-2">Action Items:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {insight.actionItems.slice(0, 2).map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start">
                            <span className="mr-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Traditional Insights */}
        {analytics.insights && analytics.insights.length > 0 && (
          <div className="mb-8">
            <InsightsByCategory insights={analytics.insights} />
          </div>
        )}

        {/* Recommendations */}
        {analytics.recommendations && analytics.recommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">💡 Recommendations</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                    <span className="text-xl mr-3 mt-1">💡</span>
                    <span className="text-gray-700">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {analytics.charts && analytics.charts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Recommended Charts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analytics.charts.slice(0, 6).map((chart, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-2">📊</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(chart.priority)}`}>
                      {chart.priority}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{chart.title}</h3>
                  
                  <p className="text-gray-600 mb-3">{chart.description}</p>
                  
                  <div className="text-center py-4 bg-gray-50 rounded">
                    <span className="text-gray-500">Chart placeholder</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}