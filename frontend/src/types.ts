
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}


export interface RegionRevenue {
  total_revenue: number;
  total_sales: number;
  avg_order_value: number;
}

export interface TopProduct {
  product_id: number;
  name: string;
  category: string;
  total_quantity_sold: number;
  total_revenue: number;
  number_of_sales: number;
}

export interface CategoryPerformance {
  total_revenue: number;
  avg_order_value: number;
  total_quantity: number;
  number_of_sales: number;
}

export interface CustomerSummary {
  total_customers: number;
  active_customers: number;
  churned_customers: number;
  churn_rate: number;
  avg_customer_value: number;
  avg_order_value: number;
}

export interface BusinessInsight {
  title: string;
  description: string;
  recommendation: string;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  category: string;
}

export interface MonthlyTrend {
  year_month: string;
  revenue: number;
  quantity_sold: number;
  number_of_sales: number;
}


export interface RegionChartData {
  region: string;
  revenue: number;
  sales: number;
  avgOrderValue: number;
}

export interface CategoryChartData {
  category: string;
  revenue: number;
  sales: number;
  quantity: number;
}

// Filter Types
export interface FilterOptions {
  region?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}
