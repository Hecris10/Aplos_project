import axios from 'axios';
import type {
  ApiResponse,
  RegionRevenue,
  TopProduct,
  CategoryPerformance,
  CustomerSummary,
  BusinessInsight,
  MonthlyTrend,
  RegionChartData,
  FilterOptions
} from './types';

const API_BASE_URL = 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
    
      throw new Error(`API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
    } else if (error.request) {

      throw new Error('Network Error: Unable to connect to the API server');
    } else {

      throw new Error(`Request Error: ${error.message}`);
    }
  }
);

export class ApiService {
  static async getHealth(): Promise<ApiResponse<Record<string, unknown>>> {
    const response = await apiClient.get('/health');
    return response.data;
  }


  static async getRevenueByRegion(filters?: FilterOptions): Promise<ApiResponse<Record<string, RegionRevenue>>> {
    const response = await apiClient.get('/revenue-by-region', { params: filters });
    return response.data;
  }
    
  static async getTopProducts(filters?: FilterOptions): Promise<ApiResponse<TopProduct[]>> {
    const response = await apiClient.get('/top-products', { params: filters });
    return response.data;
  }


  static async getCategoryPerformance(): Promise<ApiResponse<Record<string, CategoryPerformance>>> {
    const response = await apiClient.get('/category-performance');
    return response.data;
  }


  static async getCustomerSummary(): Promise<ApiResponse<CustomerSummary>> {
    const response = await apiClient.get('/customer-summary');
    return response.data;
  }


  static async getBusinessInsights(filters?: FilterOptions): Promise<ApiResponse<BusinessInsight[]>> {
    const response = await apiClient.get('/business-insights', { params: filters });
    return response.data;
  }


  static async getMonthlyTrends(): Promise<ApiResponse<MonthlyTrend[]>> {
    const response = await apiClient.get('/monthly-trends');
    return response.data;
  }


  static async getSalesByRegion(filters?: FilterOptions): Promise<ApiResponse<RegionChartData[]>> {
    const response = await apiClient.get('/sales-by-region', { params: filters });
    return response.data;
  }


  static async refreshCache(): Promise<ApiResponse<string>> {
    const response = await apiClient.post('/refresh-cache');
    return response.data;
  }
}

export const transformCategoryData = (categoryData: Record<string, CategoryPerformance>) => {
  return Object.entries(categoryData).map(([category, data]) => ({
    category,
    revenue: data.total_revenue,
    sales: data.number_of_sales,
    quantity: data.total_quantity,
    avgOrderValue: data.avg_order_value
  }));
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercentage = (decimal: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(decimal);
};
