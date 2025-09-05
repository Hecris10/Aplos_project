import React from 'react';

interface DashboardHeaderProps {
  onRefresh: () => void;
  isLoading?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onRefresh, isLoading = false }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Retail Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Real-time insights into sales, customers, and inventory performance
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white transition-colors flex items-center ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <svg 
              className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isLoading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>
      </div>
    </header>
  );
};
