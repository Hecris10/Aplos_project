import React, { useState, useCallback } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { ApiService } from "../apiService";
import type {
  RegionChartData,
  CustomerSummary,
  BusinessInsight,
  TopProduct,
  CategoryPerformance,
  FilterOptions,
} from "../types";
import { LoadingSpinner, ErrorMessage } from "./LoadingSpinner";
import { DashboardHeader } from "./DashboardHeader";
import { MetricsCards } from "./MetricsCards";
import { SalesChart } from "./SalesChart";
import { CategoryChart } from "./CategoryChart";
import { BusinessInsights } from "./BusinessInsights";
import { TopProducts } from "./TopProducts";
import { FilterPanel } from "./FilterPanel";

interface DashboardState {
  filters: FilterOptions;
}

export const Dashboard: React.FC = () => {
  const [state, setState] = useState<DashboardState>({
    filters: { limit: 10 },
  });

  // Load filter options (independent of other data)
  const {
    data: availableRegions = [],
    isLoading: regionsLoading,
    error: regionsError,
  } = useQuery({
    queryKey: ["availableRegions"],
    queryFn: async () => {
      const response = await ApiService.getAvailableRegions();
      if (!response.success) throw new Error(response.message);
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: availableCategories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["availableCategories"],
    queryFn: async () => {
      const response = await ApiService.getAvailableCategories();
      if (!response.success) throw new Error(response.message);
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Load dashboard data based on current filters
  const dashboardQueries = useQueries({
    queries: [
      {
        queryKey: ["salesByRegion", state.filters],
        queryFn: async () => {
          const response = await ApiService.getSalesByRegion(state.filters);
          if (!response.success) throw new Error(response.message);
          return response.data || [];
        },
      },
      {
        queryKey: ["categoryPerformance"],
        queryFn: async () => {
          const response = await ApiService.getCategoryPerformance();
          if (!response.success) throw new Error(response.message);
          return response.data || {};
        },
      },
      {
        queryKey: ["customerSummary"],
        queryFn: async () => {
          const response = await ApiService.getCustomerSummary();
          if (!response.success) throw new Error(response.message);
          return response.data;
        },
      },
      {
        queryKey: ["businessInsights", { limit: state.filters.limit || 5 }],
        queryFn: async () => {
          const response = await ApiService.getBusinessInsights({
            limit: state.filters.limit || 5,
          });
          if (!response.success) throw new Error(response.message);
          return response.data || [];
        },
      },
      {
        queryKey: ["topProducts", { limit: state.filters.limit || 10 }],
        queryFn: async () => {
          const response = await ApiService.getTopProducts({
            limit: state.filters.limit || 10,
          });
          if (!response.success) throw new Error(response.message);
          return response.data || [];
        },
      },
    ],
  });

  // Extract data and loading states from queries
  const [
    salesByRegionQuery,
    categoryPerformanceQuery,
    customerSummaryQuery,
    businessInsightsQuery,
    topProductsQuery,
  ] = dashboardQueries;

  const salesByRegion: RegionChartData[] = salesByRegionQuery.data || [];
  const categoryPerformance: Record<string, CategoryPerformance> =
    categoryPerformanceQuery.data || {};
  const customerSummary: CustomerSummary | null =
    customerSummaryQuery.data || null;
  const businessInsights: BusinessInsight[] = businessInsightsQuery.data || [];
  const topProducts: TopProduct[] = topProductsQuery.data || [];

  // Check loading and error states
  const isLoading =
    regionsLoading ||
    categoriesLoading ||
    dashboardQueries.some((query) => query.isLoading);
  const error =
    regionsError ||
    categoriesError ||
    dashboardQueries.find((query) => query.error)?.error;

  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    setState((prev) => ({ ...prev, filters: newFilters }));
  }, []);

  const handleFiltersReset = useCallback(() => {
    setState((prev) => ({ ...prev, filters: { limit: 10 } }));
  }, []);

  const handleRefresh = useCallback(() => {
    dashboardQueries.forEach((query) => query.refetch());
  }, [dashboardQueries]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <ErrorMessage
            message={error instanceof Error ? error.message : String(error)}
            onRetry={handleRefresh}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gray-50">
      {isLoading && (
        <div className="min-h-screen w-screen flex items-center absolute justify-center">
          <LoadingSpinner
            size="large"
            message="Loading retail analytics dashboard..."
          />
        </div>
      )}
      {/* Header */}

      <DashboardHeader onRefresh={handleRefresh} isLoading={isLoading} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Panel */}
        <div className="mb-8">
          <FilterPanel
            filters={state.filters}
            onFiltersChange={handleFiltersChange}
            availableRegions={availableRegions}
            availableCategories={availableCategories}
            onReset={handleFiltersReset}
          />
        </div>

        {/* Summary Cards */}
        {customerSummary && <MetricsCards customerSummary={customerSummary} />}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SalesChart data={salesByRegion} />
          <CategoryChart data={categoryPerformance} />
        </div>

        {/* Business Insights and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BusinessInsights insights={businessInsights} />
          <TopProducts products={topProducts} />
        </div>
      </main>
    </div>
  );
};
