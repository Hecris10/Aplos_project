import fs from 'fs';
import path from 'path';
import {
  RegionRevenue,
  TopProduct,
  CategoryPerformance,
  CustomerSummary,
  AgeGroupAnalysis,
  InventoryInsights,
  MonthlyTrend,
  BusinessInsight,
  FilterOptions,
  ApiResponse,
  RegionChartData
} from './types';

interface RawSaleRecord {
  id: number;
  customer_id: number;
  product_id: number;
  date: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
}

interface RawProductRecord {
  id: number;
  name: string;
  category: string;
  price: number;
  cost: number;
}

interface RawCustomerRecord {
  id: number;
  name: string;
  age: number;
  region: string;
  created_at: string;
}

export class DataService {
  private dataPath: string;
  private rawDataPath: string;
  private cache: Map<string, any>;
  private rawCache: Map<string, any>;

  constructor() {
    this.dataPath = path.join(__dirname, '../../processed_data');
    this.rawDataPath = path.join(__dirname, '../../data');
    this.cache = new Map();
    this.rawCache = new Map();
    this.loadCache();
    this.loadRawCache();
  }

  private loadRawCache(): void {
    try {
      // Load raw CSV data
      const csvFiles = ['sales.csv', 'products.csv', 'customers.csv'];
      
      csvFiles.forEach(file => {
        const filePath = path.join(this.rawDataPath, file);
        if (fs.existsSync(filePath)) {
          const data = this.parseCSV(filePath);
          this.rawCache.set(file.replace('.csv', ''), data);
        }
      });

      console.log('Raw data cache loaded successfully');
    } catch (error) {
      console.error('Error loading raw data cache:', error);
    }
  }

  private parseCSV(filePath: string): any[] {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const record: any = {};
      headers.forEach((header, index) => {
        const value = values[index];
        // Try to parse numbers
        if (!isNaN(Number(value)) && value !== '') {
          record[header] = Number(value);
        } else {
          record[header] = value;
        }
      });
      return record;
    });
  }

  private filterSalesData(filters: FilterOptions): RawSaleRecord[] {
    const sales: RawSaleRecord[] = this.rawCache.get('sales') || [];
    const customers: RawCustomerRecord[] = this.rawCache.get('customers') || [];
    const products: RawProductRecord[] = this.rawCache.get('products') || [];
    
    return sales.filter(sale => {
      // Filter by region (need to join with customers)
      if (filters.region) {
        const customer = customers.find(c => c.id === sale.customer_id);
        if (!customer || customer.region !== filters.region) {
          return false;
        }
      }

      // Filter by date range
      if (filters.startDate && sale.date < filters.startDate) {
        return false;
      }
      if (filters.endDate && sale.date > filters.endDate) {
        return false;
      }

      // Filter by category (need to join with products)
      if (filters.category) {
        const product = products.find(p => p.id === sale.product_id);
        if (!product || product.category !== filters.category) {
          return false;
        }
      }

      return true;
    });
  }

  private loadCache(): void {
    try {
      // Load all processed data files into cache
      const files = [
        'revenue_by_region.json',
        'top_products.json',
        'category_performance.json',
        'customer_summary.json',
        'age_groups.json',
        'inventory_risks.json',
        'monthly_trends.json',
        'business_insights.json'
      ];

      files.forEach(file => {
        const filePath = path.join(this.dataPath, file);
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          this.cache.set(file.replace('.json', ''), data);
        }
      });

      console.log('Data cache loaded successfully');
    } catch (error) {
      console.error('Error loading data cache:', error);
    }
  }

  private createResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };
  }

  private createErrorResponse<T>(message: string): ApiResponse<T> {
    return {
      success: false,
      message,
      timestamp: new Date().toISOString()
    } as ApiResponse<T>;
  }

  public getRevenueByRegion(filters?: FilterOptions): ApiResponse<Record<string, RegionRevenue>> {
    try {
      const data = this.cache.get('revenue_by_region');
      if (!data) {
        return this.createErrorResponse('Revenue by region data not found');
      }

      // Apply filters if needed
      let filteredData = data;
      if (filters?.region) {
        filteredData = { [filters.region]: data[filters.region] };
      }

      return this.createResponse(filteredData, 'Revenue by region data retrieved successfully');
    } catch (error) {
      return this.createErrorResponse(`Error retrieving revenue by region: ${error}`);
    }
  }

  public getTopProducts(filters?: FilterOptions): ApiResponse<TopProduct[]> {
    try {
      // If no filters (except limit), use cached data
      if (!filters || (Object.keys(filters).length === 1 && filters.limit)) {
        let data: TopProduct[] = this.cache.get('top_products') || [];
        
        if (!data.length) {
          return this.createErrorResponse('Top products data not found');
        }

        if (filters?.limit) {
          data = data.slice(0, filters.limit);
        }

        return this.createResponse(data, 'Top products data retrieved successfully');
      }

      // Apply filters to raw data and calculate top products
      const filteredSales = this.filterSalesData(filters);
      const products: RawProductRecord[] = this.rawCache.get('products') || [];
      
      // Aggregate product sales
      const productAggregation: Record<string, { 
        revenue: number; 
        quantity: number; 
        sales: number;
        product: RawProductRecord | undefined;
      }> = {};
      
      filteredSales.forEach(sale => {
        if (!productAggregation[sale.product_id]) {
          const product = products.find(p => p.id === sale.product_id);
          productAggregation[sale.product_id] = { 
            revenue: 0, 
            quantity: 0, 
            sales: 0,
            product 
          };
        }
        productAggregation[sale.product_id].revenue += sale.total_amount;
        productAggregation[sale.product_id].quantity += sale.quantity;
        productAggregation[sale.product_id].sales += 1;
      });

      // Convert to TopProduct format and sort by revenue
      let topProducts = Object.entries(productAggregation)
        .filter(([_, data]) => data.product)
        .map(([productId, data]) => ({
          product_id: parseInt(productId),
          name: data.product!.name,
          category: data.product!.category,
          total_revenue: data.revenue,
          total_quantity_sold: data.quantity,
          number_of_sales: data.sales
        }))
        .sort((a, b) => b.total_revenue - a.total_revenue);

      if (filters?.limit) {
        topProducts = topProducts.slice(0, filters.limit);
      }

      return this.createResponse(topProducts, 'Filtered top products data retrieved successfully');
    } catch (error) {
      return this.createErrorResponse(`Error retrieving top products: ${error}`);
    }
  }

  public getCategoryPerformance(): ApiResponse<Record<string, CategoryPerformance>> {
    try {
      const data = this.cache.get('category_performance');
      if (!data) {
        return this.createErrorResponse('Category performance data not found');
      }

      return this.createResponse(data, 'Category performance data retrieved successfully');
    } catch (error) {
      return this.createErrorResponse(`Error retrieving category performance: ${error}`);
    }
  }

  public getCustomerSummary(): ApiResponse<CustomerSummary> {
    try {
      const data = this.cache.get('customer_summary');
      if (!data) {
        return this.createErrorResponse('Customer summary data not found');
      }

      return this.createResponse(data, 'Customer summary retrieved successfully');
    } catch (error) {
      return this.createErrorResponse(`Error retrieving customer summary: ${error}`);
    }
  }

  public getAgeGroupAnalysis(): ApiResponse<Record<string, AgeGroupAnalysis>> {
    try {
      const data = this.cache.get('age_groups');
      if (!data) {
        return this.createErrorResponse('Age group analysis data not found');
      }

      return this.createResponse(data, 'Age group analysis retrieved successfully');
    } catch (error) {
      return this.createErrorResponse(`Error retrieving age group analysis: ${error}`);
    }
  }

  public getInventoryRisks(): ApiResponse<InventoryInsights> {
    try {
      const data = this.cache.get('inventory_risks');
      if (!data) {
        return this.createErrorResponse('Inventory risks data not found');
      }

      return this.createResponse(data, 'Inventory risks retrieved successfully');
    } catch (error) {
      return this.createErrorResponse(`Error retrieving inventory risks: ${error}`);
    }
  }

  public getMonthlyTrends(): ApiResponse<MonthlyTrend[]> {
    try {
      const data = this.cache.get('monthly_trends');
      if (!data) {
        return this.createErrorResponse('Monthly trends data not found');
      }

      return this.createResponse(data, 'Monthly trends retrieved successfully');
    } catch (error) {
      return this.createErrorResponse(`Error retrieving monthly trends: ${error}`);
    }
  }

  public getBusinessInsights(filters?: FilterOptions): ApiResponse<BusinessInsight[]> {
    try {
      let data: BusinessInsight[] = this.cache.get('business_insights') || [];
      
      if (!data.length) {
        return this.createErrorResponse('Business insights data not found');
      }

      // Apply filters
      if (filters?.category) {
        data = data.filter(insight => 
          insight.category.toLowerCase().includes(filters.category!.toLowerCase())
        );
      }

      if (filters?.limit) {
        data = data.slice(0, filters.limit);
      }

      return this.createResponse(data, 'Business insights retrieved successfully');
    } catch (error) {
      return this.createErrorResponse(`Error retrieving business insights: ${error}`);
    }
  }

  public getSalesByRegion(filters?: FilterOptions): ApiResponse<RegionChartData[]> {
    try {
      console.log('getSalesByRegion called with filters:', filters);
      
      // Always process raw data to ensure consistency and filtering capability
      console.log('Processing raw data for sales by region');
      const filteredSales = this.filterSalesData(filters || {});
      const customers: RawCustomerRecord[] = this.rawCache.get('customers') || [];
      
      console.log('Filtered sales count:', filteredSales.length);
      
      // Aggregate filtered data by region
      const regionAggregation: Record<string, { revenue: number; sales: number }> = {};
      
      filteredSales.forEach(sale => {
        // Join with customer to get region
        const customer = customers.find(c => c.id === sale.customer_id);
        if (!customer) return;
        
        const region = customer.region;
        if (!regionAggregation[region]) {
          regionAggregation[region] = { revenue: 0, sales: 0 };
        }
        regionAggregation[region].revenue += sale.total_amount;
        regionAggregation[region].sales += 1;
      });

      console.log('Region aggregation result:', regionAggregation);

      // Transform to chart format
      const chartData = Object.entries(regionAggregation).map(([region, data]) => ({
        region,
        revenue: data.revenue,
        sales: data.sales,
        avgOrderValue: data.sales > 0 ? data.revenue / data.sales : 0
      }));

      const message = filters && Object.keys(filters).length > 0 
        ? 'Filtered sales by region chart data retrieved successfully'
        : 'Sales by region chart data retrieved successfully';
        
      return this.createResponse(chartData, message);
    } catch (error) {
      return this.createErrorResponse(`Error retrieving sales by region: ${error}`);
    }
  }

  public refreshCache(): ApiResponse<string> {
    try {
      this.cache.clear();
      this.rawCache.clear();
      this.loadCache();
      this.loadRawCache();
      return this.createResponse('Cache refreshed successfully', 'Data cache has been refreshed');
    } catch (error) {
      return this.createErrorResponse(`Error refreshing cache: ${error}`);
    }
  }

  public getAvailableRegions(): ApiResponse<string[]> {
    try {
      const customers: RawCustomerRecord[] = this.rawCache.get('customers') || [];
      const regions = Array.from(new Set(customers.map(customer => customer.region))).sort();
      
      return this.createResponse(regions, 'Available regions retrieved successfully');
    } catch (error) {
      return this.createErrorResponse(`Error retrieving available regions: ${error}`);
    }
  }

  public getAvailableCategories(): ApiResponse<string[]> {
    try {
      const products: RawProductRecord[] = this.rawCache.get('products') || [];
      const categories = Array.from(new Set(products.map(product => product.category))).sort();
      
      return this.createResponse(categories, 'Available categories retrieved successfully');
    } catch (error) {
      return this.createErrorResponse(`Error retrieving available categories: ${error}`);
    }
  }

  public getHealthCheck(): ApiResponse<any> {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      cacheSize: this.cache.size,
      availableEndpoints: [
        '/api/revenue-by-region',
        '/api/top-products',
        '/api/category-performance',
        '/api/customer-summary',
        '/api/age-groups',
        '/api/inventory-risks',
        '/api/monthly-trends',
        '/api/business-insights',
        '/api/sales-by-region'
      ]
    };

    return this.createResponse(health, 'API is healthy');
  }
}
