"use client";

import React, { useState, useEffect } from "react";
import { DataInsight, ChartSuggestion } from "@/lib/analyticsService";

interface AnalyticsData {
  hasData: boolean;
  summary: {
    totalDatasets: number;
    totalRows: number;
    totalColumns: number;
    analyzedDatasets: number;
  };
  analyses: any[];
  topInsights: DataInsight[];
  recommendedCharts: ChartSuggestion[];
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analytics");
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'statistical': return '📊';
      case 'trend': return '📈';
      case 'correlation': return '🔗';
      case 'anomaly': return '⚠️';
      case 'recommendation': return '💡';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const renderChart = (chart: ChartSuggestion) => {
    switch (chart.type) {
      case 'bar':
        return (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">{chart.title}</h4>
            <div className="space-y-2">
              {chart.data.slice(0, 5).map((item: any, index: number) => (
                <div key={index} className="flex items-center">
                  <div className="w-24 text-sm truncate">{item.label}</div>
                  <div className="flex-1 ml-2">
                    <div className="bg-blue-200 rounded h-4" style={{ width: `${(item.value / Math.max(...chart.data.map((d: any) => d.value))) * 100}%` }}></div>
                  </div>
                  <div className="ml-2 text-sm font-medium">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'histogram':
        return (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">{chart.title}</h4>
            <div className="space-y-2">
              {chart.data.slice(0, 5).map((item: any, index: number) => (
                <div key={index} className="flex items-center">
                  <div className="w-32 text-xs truncate">{item.bin}</div>
                  <div className="flex-1 ml-2">
                    <div className="bg-green-200 rounded h-4" style={{ width: `${(item.count / Math.max(...chart.data.map((d: any) => d.count))) * 100}%` }}></div>
                  </div>
                  <div className="ml-2 text-sm font-medium">{item.count}</div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'scatter':
        return (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">{chart.title}</h4>
            <div className="text-sm text-gray-600">
              {chart.data.length} data points
              <br />
              X: {chart.xAxis}, Y: {chart.yAxis}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">{chart.title}</h4>
            <div className="text-sm text-gray-600">{chart.description}</div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-lg">Analyzing your data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!analyticsData || !analyticsData.hasData) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
          <p className="text-lg text-gray-600 mb-8">
            No data available for analysis. Upload some data to see insights and visualizations.
          </p>
          <button
            onClick={() => window.location.href = '/upload'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Make Your First Entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-lg text-gray-600">
          AI-powered insights from your personal data
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📊</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalDatasets}</div>
              <div className="text-sm text-gray-600">Total Datasets</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📈</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalRows.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Rows</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🔍</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalColumns}</div>
              <div className="text-sm text-gray-600">Total Columns</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">💡</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.topInsights.length}</div>
              <div className="text-sm text-gray-600">Key Insights</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Insights */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyticsData.topInsights.map((insight, index) => (
            <div
              key={index}
              className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(insight.priority)}`}
            >
              <div className="flex items-start">
                <div className="text-2xl mr-3">{getInsightIcon(insight.type)}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                  <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                  {insight.confidence && (
                    <div className="text-xs text-gray-500">
                      Confidence: {(insight.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Charts */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommended Visualizations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyticsData.recommendedCharts.map((chart, index) => (
            <div key={index}>
              {renderChart(chart)}
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Analysis */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dataset Analysis</h2>
        <div className="space-y-4">
          {analyticsData.analyses.map((analysis, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{analysis.fileName}</h3>
                  <p className="text-sm text-gray-600">
                    {analysis.rowCount} rows × {analysis.columnCount} columns
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(analysis.uploadDate).toLocaleDateString()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">{analysis.summary.numericColumns.length}</div>
                  <div className="text-xs text-gray-600">Numeric</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{analysis.summary.categoricalColumns.length}</div>
                  <div className="text-xs text-gray-600">Categorical</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">{analysis.summary.dateColumns.length}</div>
                  <div className="text-xs text-gray-600">Date</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-orange-600">{analysis.summary.textColumns.length}</div>
                  <div className="text-xs text-gray-600">Text</div>
                </div>
              </div>
              
              {analysis.insights.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Insights</h4>
                  <div className="space-y-2">
                                         {analysis.insights.slice(0, 3).map((insight: DataInsight, insightIndex: number) => (
                       <div key={insightIndex} className="text-sm text-gray-700">
                         • {insight.description}
                       </div>
                     ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchAnalytics}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Refresh Analytics
        </button>
      </div>
    </div>
  );
} 