// Types for the retail analytics data
export interface Customer {
  id: number;
  name: string;
  age: number;
  region: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  supplier: string;
  created_at: string;
}

export interface Sale {
  id: number;
  customer_id: number;
  product_id: number;
  date: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
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

export interface AgeGroupAnalysis {
  avg_spent: number;
  total_spent: number;
  avg_orders: number;
  churn_rate: number;
}

export interface InventoryRisk {
  product_id: number;
  name: string;
  category: string;
  current_stock: number;
  reorder_level: number;
  turnover_rate: number;
}

export interface InventoryInsights {
  low_stock_products: InventoryRisk[];
  total_products_at_risk: number;
  turnover_by_category: Record<string, {
    avg_turnover: number;
    min_turnover: number;
    max_turnover: number;
  }>;
}

export interface MonthlyTrend {
  year_month: string;
  revenue: number;
  quantity_sold: number;
  number_of_sales: number;
}

export interface BusinessInsight {
  title: string;
  description: string;
  recommendation: string;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  category: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}

export interface FilterOptions {
  region?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}
