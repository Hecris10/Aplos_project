# Retail Network Analytics Project

A comprehensive retail analytics system built with Python ETL pipeline, TypeScript Express API, and React frontend.

## 🏗️ Project Architecture

```
Aplos_project/
├── ontology/           # Data model and conceptual design
├── python_pipeline/    # ETL pipeline and data generation
├── api/               # TypeScript Express API server
├── frontend/          # React dashboard with Vite
├── data/              # Generated CSV datasets
└── processed_data/    # JSON files for API consumption
```

## 📊 Ontology Model

The system models a retail network with the following entities:

- **Customers**: Demographics and purchase behavior
- **Products**: Catalog with categories and suppliers
- **Sales**: Transaction records with temporal data
- **Inventory**: Stock levels and turnover metrics
- **Categories**: Product groupings for analysis

See `ontology/retail_ontology.md` for detailed entity relationships.

## 🚀 Quick Start

### 1. Generate Data (Python Pipeline)
```bash
cd python_pipeline/
pip install -r requirements.txt
python generate_data.py    # Generates CSV files
python etl_pipeline.py     # Processes data and exports JSON
```

### 2. Start API Server (TypeScript)
```bash
cd api/
npm install
npm run build
npm start                  # Runs on http://localhost:3001
```

### 3. Start Frontend (React + Vite)
```bash
cd frontend/
npm install
npm run dev               # Runs on http://localhost:5173
```

## 📈 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | API health check |
| `GET /api/revenue-by-region` | Revenue breakdown by region |
| `GET /api/top-products` | Best performing products |
| `GET /api/category-performance` | Sales by product category |
| `GET /api/customer-summary` | Customer metrics overview |
| `GET /api/age-groups` | Customer segmentation by age |
| `GET /api/inventory-risks` | Products with low stock |
| `GET /api/monthly-trends` | Time-series sales data |
| `GET /api/business-insights` | AI-generated insights |
| `GET /api/sales-by-region` | Chart-ready regional data |

## 📊 Dashboard Features

### Key Metrics Cards
- Total Customers
- Average Customer Value
- Average Order Value  
- Customer Churn Rate

### Visualizations
1. **Sales by Region** (Bar Chart)
   - Revenue and sales count comparison
   - Regional performance analysis

2. **Category Performance** (Pie Chart)
   - Revenue distribution by product category
   - Market share visualization

### Business Intelligence
- **Automated Insights**: AI-generated business recommendations
- **Top Products**: Best performers by revenue
- **Risk Alerts**: Low stock inventory warnings
- **Customer Analytics**: Churn analysis and segmentation

## 🎯 Business Insights Generated

The system automatically generates actionable insights such as:

1. **Regional Performance Leaders**
   - Identifies regions outperforming averages
   - Recommends expansion strategies

2. **Category Dominance Analysis**
   - Revenue concentration by product category
   - Inventory allocation suggestions

3. **Customer Segmentation**
   - High-value age groups identification
   - Targeted marketing opportunities

4. **Inventory Risk Management**
   - Low stock alerts by category
   - Reorder recommendations

5. **Customer Retention Analysis**
   - Churn rate monitoring
   - Retention program suggestions

## 🛠️ Technology Stack

- **Backend**: TypeScript, Express.js, Node.js
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Charts**: Recharts library
- **Data Processing**: Python, Pandas, NumPy
- **Data Generation**: Faker library
- **API Client**: Axios

## 📁 Data Schema

### Customers
- `id`, `name`, `age`, `region`, `created_at`

### Products  
- `id`, `name`, `category`, `price`, `supplier`, `created_at`

### Sales
- `id`, `customer_id`, `product_id`, `date`, `quantity`, `unit_price`, `total_amount`

### Inventory
- `id`, `product_id`, `current_stock`, `reorder_level`, `max_stock`, `turnover_rate`

## 🔧 Development

### Python Pipeline
- Data generation with realistic distributions
- ETL processing with data cleaning
- Business metrics calculation
- JSON export for API consumption

### TypeScript API
- RESTful API design
- Type-safe data handling
- Error handling and validation
- CORS enabled for frontend access

### React Frontend
- Modern component architecture
- Responsive design with Tailwind
- Real-time data visualization
- Error handling with retry logic

## 📋 Requirements Met

✅ **Ontology**: Clear entity-relationship model  
✅ **Data Generation**: 4 CSV files with realistic data  
✅ **ETL Pipeline**: Data cleaning and metrics generation  
✅ **TypeScript API**: 9 endpoints with type safety  
✅ **React Interface**: Dashboard with 2+ visualizations  
✅ **Business Insights**: 5+ automated recommendations  

## 🎨 Design Decisions

1. **Modular Architecture**: Separate concerns across pipeline, API, and frontend
2. **Type Safety**: TypeScript throughout for better development experience
3. **Responsive Design**: Tailwind CSS for mobile-friendly interface
4. **Real-time Updates**: Refresh button for data synchronization
5. **Error Handling**: Comprehensive error states with retry logic

## 🚦 Production Considerations

- **Database**: Replace CSV files with PostgreSQL/MongoDB
- **Authentication**: Add user management and API keys
- **Caching**: Implement Redis for API response caching
- **Monitoring**: Add logging and performance metrics
- **Deployment**: Docker containers and CI/CD pipeline
- **Scaling**: Load balancing and microservices architecture

## 📊 Sample Insights

Based on the generated data, typical insights include:

- "North region generates 25% above average revenue"
- "Electronics represents 22% of total revenue"  
- "Customers aged 36-50 have highest average spending"
- "44 products are at or below reorder levels"
- "Customer churn rate is 73.5% - retention programs needed"

This project demonstrates a complete data-to-insights pipeline suitable for retail decision-making.
