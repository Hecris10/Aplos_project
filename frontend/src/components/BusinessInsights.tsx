import React from 'react';
import type { BusinessInsight } from '../types';

interface BusinessInsightsProps {
  insights: BusinessInsight[];
}

export const BusinessInsights: React.FC<BusinessInsightsProps> = ({ insights }) => {
  const getImpactStyles = (impact: BusinessInsight['impact']) => {
    switch (impact) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Business Insights</h3>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="border-l-4 border-blue-400 bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getImpactStyles(insight.impact)}`}>
                  {insight.impact}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                <p className="mt-1 text-sm text-gray-700">{insight.description}</p>
                <p className="mt-2 text-sm text-blue-700 font-medium">{insight.recommendation}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {insight.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
