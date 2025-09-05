"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class DataService {
    constructor() {
        this.dataPath = path_1.default.join(__dirname, '../../processed_data');
        this.cache = new Map();
        this.loadCache();
    }
    loadCache() {
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
                const filePath = path_1.default.join(this.dataPath, file);
                if (fs_1.default.existsSync(filePath)) {
                    const data = JSON.parse(fs_1.default.readFileSync(filePath, 'utf8'));
                    this.cache.set(file.replace('.json', ''), data);
                }
            });
            console.log('Data cache loaded successfully');
        }
        catch (error) {
            console.error('Error loading data cache:', error);
        }
    }
    createResponse(data, message) {
        return {
            success: true,
            data,
            message,
            timestamp: new Date().toISOString()
        };
    }
    createErrorResponse(message) {
        return {
            success: false,
            message,
            timestamp: new Date().toISOString()
        };
    }
    getRevenueByRegion(filters) {
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
        }
        catch (error) {
            return this.createErrorResponse(`Error retrieving revenue by region: ${error}`);
        }
    }
    getTopProducts(filters) {
        try {
            let data = this.cache.get('top_products') || [];
            if (!data.length) {
                return this.createErrorResponse('Top products data not found');
            }
            // Apply filters
            if (filters?.category) {
                data = data.filter(product => product.category === filters.category);
            }
            if (filters?.limit) {
                data = data.slice(0, filters.limit);
            }
            return this.createResponse(data, 'Top products data retrieved successfully');
        }
        catch (error) {
            return this.createErrorResponse(`Error retrieving top products: ${error}`);
        }
    }
    getCategoryPerformance() {
        try {
            const data = this.cache.get('category_performance');
            if (!data) {
                return this.createErrorResponse('Category performance data not found');
            }
            return this.createResponse(data, 'Category performance data retrieved successfully');
        }
        catch (error) {
            return this.createErrorResponse(`Error retrieving category performance: ${error}`);
        }
    }
    getCustomerSummary() {
        try {
            const data = this.cache.get('customer_summary');
            if (!data) {
                return this.createErrorResponse('Customer summary data not found');
            }
            return this.createResponse(data, 'Customer summary retrieved successfully');
        }
        catch (error) {
            return this.createErrorResponse(`Error retrieving customer summary: ${error}`);
        }
    }
    getAgeGroupAnalysis() {
        try {
            const data = this.cache.get('age_groups');
            if (!data) {
                return this.createErrorResponse('Age group analysis data not found');
            }
            return this.createResponse(data, 'Age group analysis retrieved successfully');
        }
        catch (error) {
            return this.createErrorResponse(`Error retrieving age group analysis: ${error}`);
        }
    }
    getInventoryRisks() {
        try {
            const data = this.cache.get('inventory_risks');
            if (!data) {
                return this.createErrorResponse('Inventory risks data not found');
            }
            return this.createResponse(data, 'Inventory risks retrieved successfully');
        }
        catch (error) {
            return this.createErrorResponse(`Error retrieving inventory risks: ${error}`);
        }
    }
    getMonthlyTrends() {
        try {
            const data = this.cache.get('monthly_trends');
            if (!data) {
                return this.createErrorResponse('Monthly trends data not found');
            }
            return this.createResponse(data, 'Monthly trends retrieved successfully');
        }
        catch (error) {
            return this.createErrorResponse(`Error retrieving monthly trends: ${error}`);
        }
    }
    getBusinessInsights(filters) {
        try {
            let data = this.cache.get('business_insights') || [];
            if (!data.length) {
                return this.createErrorResponse('Business insights data not found');
            }
            // Apply filters
            if (filters?.category) {
                data = data.filter(insight => insight.category.toLowerCase().includes(filters.category.toLowerCase()));
            }
            if (filters?.limit) {
                data = data.slice(0, filters.limit);
            }
            return this.createResponse(data, 'Business insights retrieved successfully');
        }
        catch (error) {
            return this.createErrorResponse(`Error retrieving business insights: ${error}`);
        }
    }
    getSalesByRegion(filters) {
        // This would be used for the React charts
        try {
            const regionData = this.cache.get('revenue_by_region');
            if (!regionData) {
                return this.createErrorResponse('Sales by region data not found');
            }
            // Transform data for charts
            const chartData = Object.entries(regionData).map(([region, data]) => ({
                region,
                revenue: data.total_revenue,
                sales: data.total_sales,
                avgOrderValue: data.avg_order_value
            }));
            return this.createResponse(chartData, 'Sales by region chart data retrieved successfully');
        }
        catch (error) {
            return this.createErrorResponse(`Error retrieving sales by region: ${error}`);
        }
    }
    refreshCache() {
        try {
            this.cache.clear();
            this.loadCache();
            return this.createResponse('Cache refreshed successfully', 'Data cache has been refreshed');
        }
        catch (error) {
            return this.createErrorResponse(`Error refreshing cache: ${error}`);
        }
    }
    getHealthCheck() {
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
exports.DataService = DataService;
