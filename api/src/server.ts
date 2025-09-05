import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { DataService } from './dataService';
import { FilterOptions } from './types';

const app = express();
const port = process.env.PORT || 3001;

// Initialize data service
const dataService = new DataService();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Parse query parameters for filters
const parseFilters = (query: any): FilterOptions => {
  const filters: FilterOptions = {};
  
  if (query.region) filters.region = query.region;
  if (query.category) filters.category = query.category;
  if (query.startDate) filters.startDate = query.startDate;
  if (query.endDate) filters.endDate = query.endDate;
  if (query.limit) filters.limit = parseInt(query.limit);
  
  return filters;
};

// Routes

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  const response = dataService.getHealthCheck();
  res.json(response);
});

// Revenue by region
app.get('/api/revenue-by-region', (req: Request, res: Response) => {
  const filters = parseFilters(req.query);
  const response = dataService.getRevenueByRegion(filters);
  res.json(response);
});

// Top products
app.get('/api/top-products', (req: Request, res: Response) => {
  const filters = parseFilters(req.query);
  const response = dataService.getTopProducts(filters);
  res.json(response);
});

// Category performance
app.get('/api/category-performance', (req: Request, res: Response) => {
  const response = dataService.getCategoryPerformance();
  res.json(response);
});

// Customer summary
app.get('/api/customer-summary', (req: Request, res: Response) => {
  const response = dataService.getCustomerSummary();
  res.json(response);
});

// Age group analysis
app.get('/api/age-groups', (req: Request, res: Response) => {
  const response = dataService.getAgeGroupAnalysis();
  res.json(response);
});

// Inventory risks
app.get('/api/inventory-risks', (req: Request, res: Response) => {
  const response = dataService.getInventoryRisks();
  res.json(response);
});

// Monthly trends
app.get('/api/monthly-trends', (req: Request, res: Response) => {
  const response = dataService.getMonthlyTrends();
  res.json(response);
});

// Business insights
app.get('/api/business-insights', (req: Request, res: Response) => {
  const filters = parseFilters(req.query);
  const response = dataService.getBusinessInsights(filters);
  res.json(response);
});

// Sales by region (for charts)
app.get('/api/sales-by-region', (req: Request, res: Response) => {
  const filters = parseFilters(req.query);
  const response = dataService.getSalesByRegion(filters);
  res.json(response);
});

// Refresh cache
app.post('/api/refresh-cache', (req: Request, res: Response) => {
  const response = dataService.refreshCache();
  res.json(response);
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler - must be last
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /api/health',
      'GET /api/revenue-by-region',
      'GET /api/top-products',
      'GET /api/category-performance',
      'GET /api/customer-summary',
      'GET /api/age-groups',
      'GET /api/inventory-risks',
      'GET /api/monthly-trends',
      'GET /api/business-insights',
      'GET /api/sales-by-region',
      'POST /api/refresh-cache'
    ]
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Retail Analytics API server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`📈 API Documentation available at: http://localhost:${port}/api/health`);
});

export default app;
