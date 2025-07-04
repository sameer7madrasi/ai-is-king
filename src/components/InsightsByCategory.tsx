"use client";

import React, { useState } from 'react';
import { DomainInsight } from '@/lib/domainAnalyzer';

interface InsightsByCategoryProps {
  insights: DomainInsight[];
}

interface CategoryGroup {
  category: string;
  insights: DomainInsight[];
  count: number;
}

export default function InsightsByCategory({ insights }: InsightsByCategoryProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);

  // Group insights by category
  const categoryGroups: CategoryGroup[] = React.useMemo(() => {
    const groups: Record<string, DomainInsight[]> = {};
    
    insights.forEach(insight => {
      const category = insight.category || 'general';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(insight);
    });

    return Object.entries(groups).map(([category, categoryInsights]) => ({
      category,
      insights: categoryInsights,
      count: categoryInsights.length
    })).sort((a, b) => b.count - a.count); // Sort by count descending
  }, [insights]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedCategories(new Set());
    } else {
      setExpandedCategories(new Set(categoryGroups.map(group => group.category)));
    }
    setExpandAll(!expandAll);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'recommendation':
        return '💡';
      case 'metrics':
        return '📊';
      case 'nlp_insight':
        return '🤖';
      case 'summary':
        return '📋';
      case 'trend':
        return '📈';
      case 'performance':
        return '🏆';
      case 'financial':
        return '💰';
      case 'sports':
        return '⚽';
      case 'health':
        return '🏥';
      case 'productivity':
        return '📈';
      case 'statistics':
        return '📊';
      default:
        return '📝';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'recommendation':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'metrics':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'nlp_insight':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'summary':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      case 'trend':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'performance':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'financial':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'sports':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'health':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'productivity':
        return 'bg-pink-50 border-pink-200 text-pink-800';
      case 'statistics':
        return 'bg-cyan-50 border-cyan-200 text-cyan-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'financial': return '💰';
      case 'sports': return '⚽';
      case 'health': return '🏥';
      case 'productivity': return '📈';
      default: return '📊';
    }
  };

  if (categoryGroups.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No insights available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Expand All Button */}
      <div className="flex justify-end">
        <button
          onClick={toggleExpandAll}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {expandAll ? 'Collapse All' : 'Expand All'}
        </button>
      </div>
      
      {categoryGroups.map((group) => {
        const isExpanded = expandedCategories.has(group.category);
        const displayName = group.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        return (
          <div key={group.category} className="bg-white rounded-lg shadow border">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(group.category)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getCategoryIcon(group.category)}</span>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">{displayName}</h3>
                  <p className="text-sm text-gray-600">{group.count} insight{group.count !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(group.category)}`}>
                  {group.count}
                </span>
                <span className="text-gray-400">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </div>
            </button>

            {/* Category Content */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="pt-4 space-y-3">
                  {group.insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${getCategoryColor(group.category)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-xl">{getInsightIcon(insight.type)}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                          {insight.priority}
                        </span>
                      </div>
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm mb-2">{insight.description}</p>
                      {insight.recommendation && (
                        <p className="text-xs italic">💡 {insight.recommendation}</p>
                      )}
                      {insight.value && typeof insight.value === 'object' && Object.keys(insight.value).length > 0 && (
                        <div className="text-xs mt-2 p-2 bg-white bg-opacity-50 rounded">
                          <span className="font-medium">Details:</span>
                          <pre className="mt-1 text-xs overflow-auto">
                            {JSON.stringify(insight.value, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 