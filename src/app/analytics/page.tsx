"use client";

import React, { useState, useEffect } from 'react';
import { AnalyticsResult } from '@/lib/analyticsService';
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
          insightsCount: result.data.insights.length
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
              <div className="text-3xl mr-4">🔍</div>
              <div>
                <p className="text-sm text-gray-600">Insights Found</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.insights.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🔗</div>
              <div>
                <p className="text-sm text-gray-600">Correlations</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.crossDatasetInsights.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🤖</div>
              <div>
                <p className="text-sm text-gray-600">AI Insights</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.aiInsights.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Domain Distribution */}
        {Object.keys(analytics.summary.domains).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Data Domains</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(analytics.summary.domains).map(([domain, count]) => (
                <div key={domain} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">{getInsightIcon(domain)}</div>
                  <p className="font-semibold text-gray-900 capitalize">{domain}</p>
                  <p className="text-sm text-gray-600">{count} dataset{count !== 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights by Category */}
        {analytics.insights.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">All Insights</h2>
              <div className="text-sm text-gray-600">
                {analytics.insights.length} total insights organized by category
              </div>
            </div>
            
            {/* Category Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Category Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(() => {
                  const categories: Record<string, number> = {};
                  analytics.insights.forEach(insight => {
                    const category = insight.category || 'general';
                    categories[category] = (categories[category] || 0) + 1;
                  });
                  
                  return Object.entries(categories)
                    .sort(([,a], [,b]) => b - a)
                    .map(([category, count]) => (
                      <div key={category} className="text-center p-3 bg-white rounded border">
                        <div className="text-lg font-semibold text-gray-900">{count}</div>
                        <div className="text-sm text-gray-600 capitalize">
                          {category.replace(/_/g, ' ')}
                        </div>
                      </div>
                    ));
                })()}
              </div>
            </div>
            
            <InsightsByCategory insights={analytics.insights} />
          </div>
        )}

        {/* AI Insights */}
        {analytics.aiInsights.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🤖 AI-Powered Insights</h2>
            {analytics.aiSummary && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <p className="text-gray-800 leading-relaxed">{analytics.aiSummary}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.aiInsights.slice(0, 8).map((insight, index) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border ${getAIInsightColor(insight.type)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-2xl">{getAIInsightIcon(insight.type)}</div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                        {insight.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(insight.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{insight.title}</h3>
                  <p className="text-sm mb-2">{insight.description}</p>
                  <p className="text-xs mb-3 text-gray-600">{insight.explanation}</p>
                  {insight.actionItems && insight.actionItems.length > 0 && (
                    <div className="text-xs">
                      <p className="font-medium mb-1">Action Items:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {insight.actionItems.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {insight.timeframe && (
                    <p className="text-xs mt-2">
                      <span className="font-medium">Timeframe:</span> {insight.timeframe}
                    </p>
                  )}
                  {insight.impact && (
                    <p className={`text-xs mt-1 ${getImpactColor(insight.impact)}`}>
                      <span className="font-medium">Impact:</span> {insight.impact}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {analytics.aiInsights.length > 8 && (
              <div className="text-center mt-4">
                <p className="text-gray-600">+{analytics.aiInsights.length - 8} more AI insights</p>
              </div>
            )}
          </div>
        )}

        {/* Cross-Dataset Insights */}
        {analytics.crossDatasetInsights.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Dataset Correlations</h2>
            <div className="space-y-4">
              {analytics.crossDatasetInsights.map((insight, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-2xl">🔗</div>
                    <span className="text-sm text-blue-600 font-medium">
                      {(insight.correlation * 100).toFixed(0)}% correlation
                    </span>
                  </div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    {insight.datasets.join(' ↔ ')}
                  </h3>
                  <p className="text-blue-800 mb-2">{insight.insight}</p>
                  <p className="text-sm text-blue-700 italic">💡 {insight.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {analytics.recommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h2>
            <div className="space-y-3">
              {analytics.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-yellow-600 mr-3 mt-1">💡</div>
                  <p className="text-yellow-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart Suggestions */}
        {analytics.charts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended Visualizations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.charts.slice(0, 6).map((chart, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">
                      {chart.type === 'line' ? '📈' : 
                       chart.type === 'bar' ? '📊' : 
                       chart.type === 'pie' ? '🥧' : 
                       chart.type === 'scatter' ? '🔍' : '📋'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(chart.priority)}`}>
                      {chart.priority}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1">{chart.title}</h3>
                  <p className="text-sm text-gray-600">{chart.description}</p>
                </div>
              ))}
            </div>
            {analytics.charts.length > 6 && (
              <div className="text-center mt-4">
                <p className="text-gray-600">+{analytics.charts.length - 6} more charts</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {analytics.summary.totalDatasets === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data to Analyze</h2>
            <p className="text-gray-600 mb-6">
              Upload some data to start getting AI-powered insights and visualizations
            </p>
            <a
              href="/upload"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Data
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 