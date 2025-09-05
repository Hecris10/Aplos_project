import React, { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../apiService';
import type { 
  RegionChartData, 
  CustomerSummary, 
  BusinessInsight, 
  TopProduct,
  MonthlyTrend,
  CategoryPerformance
} from '../types';
import { LoadingSpinner, ErrorMessage } from './LoadingSpinner';
import { DashboardHeader } from './DashboardHeader';
import { MetricsCards } from './MetricsCards';
import { SalesChart } from './SalesChart';
import { CategoryChart } from './CategoryChart';
import { BusinessInsights } from './BusinessInsights';
import { TopProducts } from './TopProducts';

interface DashboardState {
  salesByRegion: RegionChartData[];
  categoryPerformance: Record<string, CategoryPerformance>;
  customerSummary: CustomerSummary | null;
  businessInsights: BusinessInsight[];
  topProducts: TopProduct[];
  monthlyTrends: MonthlyTrend[];
  loading: boolean;
  error: string | null;
}

export const Dashboard: React.FC = () => {
  const [state, setState] = useState<DashboardState>({
    salesByRegion: [],
    categoryPerformance: {},
    customerSummary: null,
    businessInsights: [],
    topProducts: [],
    monthlyTrends: [],
    loading: true,
    error: null,
  });

  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const [
        salesResponse,
        categoryResponse,
        customerResponse,
        insightsResponse,
        productsResponse,
        trendsResponse
      ] = await Promise.all([
        ApiService.getSalesByRegion(),
        ApiService.getCategoryPerformance(),
        ApiService.getCustomerSummary(),
        ApiService.getBusinessInsights({ limit: 5 }),
        ApiService.getTopProducts({ limit: 10 }),
        ApiService.getMonthlyTrends()
      ]);

      if (!salesResponse.success || !categoryResponse.success || !customerResponse.success) {
        throw new Error('Failed to load dashboard data');
      }

      setState(prev => ({
        ...prev,
        salesByRegion: salesResponse.data || [],
        categoryPerformance: categoryResponse.data || {},
        customerSummary: customerResponse.data || null,
        businessInsights: insightsResponse.data || [],
        topProducts: productsResponse.data || [],
        monthlyTrends: trendsResponse.data || [],
        loading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading retail analytics dashboard..." />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <ErrorMessage message={state.error} onRetry={loadData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader onRefresh={loadData} isLoading={state.loading} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        {state.customerSummary && (
          <MetricsCards customerSummary={state.customerSummary} />
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SalesChart data={state.salesByRegion} />
          <CategoryChart data={state.categoryPerformance} />
        </div>

        {/* Business Insights and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BusinessInsights insights={state.businessInsights} />
          <TopProducts products={state.topProducts} />
        </div>
      </main>
    </div>
  );
};
