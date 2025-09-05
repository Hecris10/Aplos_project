"""
ETL Pipeline for Retail Network Analytics
Processes raw CSV data and generates consolidated metrics and insights.
"""

import pandas as pd
import numpy as np
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

class RetailETLPipeline:
    def __init__(self, data_dir: str = '../data'):
        self.data_dir = data_dir
        self.customers_df: Optional[pd.DataFrame] = None
        self.products_df: Optional[pd.DataFrame] = None
        self.sales_df: Optional[pd.DataFrame] = None
        self.inventory_df: Optional[pd.DataFrame] = None
        self.processed_data: Dict[str, Any] = {}
        
    def load_data(self):
        """Load CSV data into pandas DataFrames"""
        print("Loading raw data...")
        
        try:
            self.customers_df = pd.read_csv(f'{self.data_dir}/customers.csv')
            self.products_df = pd.read_csv(f'{self.data_dir}/products.csv')
            self.sales_df = pd.read_csv(f'{self.data_dir}/sales.csv')
            self.inventory_df = pd.read_csv(f'{self.data_dir}/inventory.csv')
            
            print(f"Loaded {len(self.customers_df)} customers")
            print(f"Loaded {len(self.products_df)} products")
            print(f"Loaded {len(self.sales_df)} sales records")
            print(f"Loaded {len(self.inventory_df)} inventory records")
            
        except FileNotFoundError as e:
            print(f"Error loading data: {e}")
            raise
    
    def clean_data(self):
        """Handle inconsistencies, missing values, duplicates, and outliers"""
        print("Cleaning data...")
        
        # Ensure DataFrames are loaded
        if self.customers_df is None or self.products_df is None or self.sales_df is None or self.inventory_df is None:
            raise ValueError("Data must be loaded before cleaning. Call load_data() first.")
        
        # Clean customers data
        print("  Cleaning customers...")
        # Remove duplicates
        initial_customers = len(self.customers_df)
        self.customers_df = self.customers_df.drop_duplicates(subset=['id'])
        print(f"    Removed {initial_customers - len(self.customers_df)} duplicate customers")
        
        # Handle missing values
        self.customers_df['name'] = self.customers_df['name'].fillna('Unknown Customer')
        self.customers_df['age'] = self.customers_df['age'].fillna(self.customers_df['age'].median())
        self.customers_df['region'] = self.customers_df['region'].fillna('Unknown')
        
        # Remove age outliers (below 18 or above 100)
        age_outliers = len(self.customers_df[(self.customers_df['age'] < 18) | (self.customers_df['age'] > 100)])
        self.customers_df = self.customers_df[(self.customers_df['age'] >= 18) & (self.customers_df['age'] <= 100)]
        print(f"    Removed {age_outliers} age outliers")
        
        # Clean products data
        print("  Cleaning products...")
        initial_products = len(self.products_df)
        self.products_df = self.products_df.drop_duplicates(subset=['id'])
        print(f"    Removed {initial_products - len(self.products_df)} duplicate products")
        
        # Handle missing values
        self.products_df['name'] = self.products_df['name'].fillna('Unknown Product')
        self.products_df['category'] = self.products_df['category'].fillna('Other')
        self.products_df['supplier'] = self.products_df['supplier'].fillna('Unknown Supplier')
        
        # Remove price outliers (negative prices or extremely high prices)
        price_outliers = len(self.products_df[(self.products_df['price'] <= 0) | (self.products_df['price'] > 10000)])
        self.products_df = self.products_df[(self.products_df['price'] > 0) & (self.products_df['price'] <= 10000)]
        print(f"    Removed {price_outliers} price outliers")
        
        # Clean sales data
        print("  Cleaning sales...")
        initial_sales = len(self.sales_df)
        self.sales_df = self.sales_df.drop_duplicates(subset=['id'])
        print(f"    Removed {initial_sales - len(self.sales_df)} duplicate sales")
        
        # Remove sales with invalid customer_id or product_id
        valid_customers = set(self.customers_df['id'])
        valid_products = set(self.products_df['id'])
        
        before_validation = len(self.sales_df)
        self.sales_df = self.sales_df[
            (self.sales_df['customer_id'].isin(valid_customers)) &
            (self.sales_df['product_id'].isin(valid_products))
        ]
        print(f"    Removed {before_validation - len(self.sales_df)} sales with invalid references")
        
        # Handle missing values and outliers
        self.sales_df['quantity'] = self.sales_df['quantity'].fillna(1)
        self.sales_df = self.sales_df[self.sales_df['quantity'] > 0]
        self.sales_df = self.sales_df[self.sales_df['total_amount'] > 0]
        
        # Convert date column
        self.sales_df['date'] = pd.to_datetime(self.sales_df['date'])
        
        # Clean inventory data
        print("  Cleaning inventory...")
        # Ensure all products have inventory records
        missing_inventory = set(self.products_df['id']) - set(self.inventory_df['product_id'])
        if missing_inventory:
            print(f"    Adding {len(missing_inventory)} missing inventory records")
            for product_id in missing_inventory:
                new_record = {
                    'id': product_id,
                    'product_id': product_id,
                    'current_stock': 0,
                    'reorder_level': 10,
                    'max_stock': 100,
                    'turnover_rate': 1.0,
                    'last_updated': datetime.now().strftime('%Y-%m-%d')
                }
                self.inventory_df = pd.concat([self.inventory_df, pd.DataFrame([new_record])], ignore_index=True)
        
        # Ensure non-negative stock levels
        self.inventory_df['current_stock'] = self.inventory_df['current_stock'].clip(lower=0)
        self.inventory_df['turnover_rate'] = self.inventory_df['turnover_rate'].fillna(1.0)
        
        print("Data cleaning completed.")
    
    def generate_metrics(self):
        """Generate consolidated metrics and business insights"""
        print("Generating consolidated metrics...")
        
        # Ensure DataFrames are loaded and cleaned
        if self.customers_df is None or self.products_df is None or self.sales_df is None or self.inventory_df is None:
            raise ValueError("Data must be loaded and cleaned before generating metrics.")
        
        # Revenue by region
        sales_with_customer = self.sales_df.merge(self.customers_df, left_on='customer_id', right_on='id', suffixes=('', '_customer'))
        revenue_by_region = sales_with_customer.groupby('region')['total_amount'].agg(['sum', 'count', 'mean']).round(2)
        revenue_by_region.columns = ['total_revenue', 'total_sales', 'avg_order_value']
        
        # Top-selling products
        sales_with_product = self.sales_df.merge(self.products_df, left_on='product_id', right_on='id', suffixes=('', '_product'))
        top_products = sales_with_product.groupby(['product_id', 'name', 'category']).agg({
            'quantity': 'sum',
            'total_amount': 'sum',
            'id': 'count'
        }).round(2)
        top_products.columns = ['total_quantity_sold', 'total_revenue', 'number_of_sales']
        top_products = top_products.sort_values('total_revenue', ascending=False).head(20)
        
        # Category performance
        category_performance = sales_with_product.groupby('category').agg({
            'total_amount': ['sum', 'mean'],
            'quantity': 'sum',
            'id': 'count'
        }).round(2)
        category_performance.columns = ['total_revenue', 'avg_order_value', 'total_quantity', 'number_of_sales']
        category_performance = category_performance.sort_values('total_revenue', ascending=False)
        
        # Customer analysis
        customer_metrics = self.sales_df.groupby('customer_id').agg({
            'total_amount': ['sum', 'mean', 'count'],
            'date': ['min', 'max']
        }).round(2)
        customer_metrics.columns = ['total_spent', 'avg_order_value', 'number_of_orders', 'first_purchase', 'last_purchase']
        
        # Add customer demographics
        customer_metrics = customer_metrics.merge(
            self.customers_df[['id', 'age', 'region']], 
            left_index=True, 
            right_on='id'
        ).set_index('id')
        
        # Customer churn analysis (customers who haven't purchased in last 90 days)
        cutoff_date = datetime.now() - timedelta(days=90)
        customer_metrics['days_since_last_purchase'] = (pd.Timestamp.now() - pd.to_datetime(customer_metrics['last_purchase'])).dt.days
        customer_metrics['is_churned'] = customer_metrics['days_since_last_purchase'] > 90
        
        # Age group analysis
        customer_metrics['age_group'] = pd.cut(
            customer_metrics['age'], 
            bins=[0, 25, 35, 50, 65, 100], 
            labels=['18-25', '26-35', '36-50', '51-65', '65+']
        )
        
        age_group_analysis = customer_metrics.groupby('age_group', observed=True).agg({
            'total_spent': ['mean', 'sum'],
            'number_of_orders': 'mean',
            'is_churned': 'mean'
        }).round(2)
        age_group_analysis.columns = ['avg_spent', 'total_spent', 'avg_orders', 'churn_rate']
        
        # Inventory insights
        inventory_with_product = self.inventory_df.merge(self.products_df, left_on='product_id', right_on='id', suffixes=('', '_product'))
        
        # Products at risk (low stock)
        low_stock_products = inventory_with_product[
            inventory_with_product['current_stock'] <= inventory_with_product['reorder_level']
        ][['product_id', 'name', 'category', 'current_stock', 'reorder_level', 'turnover_rate']]
        
        # High/low turnover products
        turnover_analysis = inventory_with_product.groupby('category')['turnover_rate'].agg(['mean', 'min', 'max']).round(2)
        turnover_analysis.columns = ['avg_turnover', 'min_turnover', 'max_turnover']
        
        # Monthly sales trends
        self.sales_df['year_month'] = self.sales_df['date'].dt.to_period('M')
        monthly_trends = self.sales_df.groupby('year_month').agg({
            'total_amount': 'sum',
            'quantity': 'sum',
            'id': 'count'
        }).round(2)
        monthly_trends.columns = ['revenue', 'quantity_sold', 'number_of_sales']
        
        # Store processed data
        self.processed_data = {
            'revenue_by_region': revenue_by_region.to_dict('index'),
            'top_products': top_products.reset_index().to_dict('records'),
            'category_performance': category_performance.to_dict('index'),
            'customer_metrics_summary': {
                'total_customers': len(customer_metrics),
                'active_customers': len(customer_metrics[~customer_metrics['is_churned']]),
                'churned_customers': len(customer_metrics[customer_metrics['is_churned']]),
                'churn_rate': customer_metrics['is_churned'].mean(),
                'avg_customer_value': customer_metrics['total_spent'].mean(),
                'avg_order_value': customer_metrics['avg_order_value'].mean()
            },
            'age_group_analysis': age_group_analysis.to_dict('index'),
            'inventory_insights': {
                'low_stock_products': low_stock_products.to_dict('records'),
                'total_products_at_risk': len(low_stock_products),
                'turnover_by_category': turnover_analysis.to_dict('index')
            },
            'monthly_trends': monthly_trends.reset_index().to_dict('records'),
            'business_insights': self.generate_business_insights(
                revenue_by_region, category_performance, age_group_analysis, 
                customer_metrics, low_stock_products
            )
        }
        
        print("Metrics generation completed.")
    
    def generate_business_insights(self, revenue_by_region, category_performance, 
                                 age_group_analysis, customer_metrics, low_stock_products):
        """Generate specific business insights for decision-making"""
        insights = []
        
        # Regional insights
        top_region = revenue_by_region['total_revenue'].idxmax()
        top_region_revenue = revenue_by_region.loc[top_region, 'total_revenue']
        avg_revenue = revenue_by_region['total_revenue'].mean()
        
        if top_region_revenue > avg_revenue * 1.2:
            insights.append({
                'title': 'Regional Performance Leader',
                'description': f'The {top_region} region generates ${top_region_revenue:,.2f} in revenue, which is {((top_region_revenue/avg_revenue - 1) * 100):.1f}% above the average region performance.',
                'recommendation': f'Consider expanding marketing efforts or inventory allocation in the {top_region} region.',
                'impact': 'High',
                'category': 'Regional Analysis'
            })
        
        # Category insights
        top_category = category_performance['total_revenue'].idxmax()
        top_category_revenue = category_performance.loc[top_category, 'total_revenue']
        total_revenue = category_performance['total_revenue'].sum()
        
        insights.append({
            'title': 'Category Dominance',
            'description': f'{top_category} represents {(top_category_revenue/total_revenue * 100):.1f}% of total revenue (${top_category_revenue:,.2f}).',
            'recommendation': f'Maintain strong inventory levels for {top_category} products and consider expanding this category.',
            'impact': 'High',
            'category': 'Category Performance'
        })
        
        # Age group insights
        if not age_group_analysis.empty:
            highest_spending_group = age_group_analysis['avg_spent'].idxmax()
            highest_avg_spent = age_group_analysis.loc[highest_spending_group, 'avg_spent']
            
            insights.append({
                'title': 'High-Value Customer Segment',
                'description': f'Customers aged {highest_spending_group} have the highest average spending at ${highest_avg_spent:,.2f} per customer.',
                'recommendation': f'Develop targeted marketing campaigns for the {highest_spending_group} age group to maximize revenue.',
                'impact': 'Medium',
                'category': 'Customer Segmentation'
            })
        
        # Inventory insights
        if len(low_stock_products) > 0:
            critical_categories = low_stock_products['category'].value_counts()
            most_affected_category = critical_categories.index[0] if len(critical_categories) > 0 else 'Unknown'
            
            insights.append({
                'title': 'Inventory Risk Alert',
                'description': f'{len(low_stock_products)} products are at or below reorder levels, with {most_affected_category} being the most affected category.',
                'recommendation': 'Immediate reordering required for critical stock items to prevent stockouts.',
                'impact': 'Critical',
                'category': 'Inventory Management'
            })
        
        # Customer churn insights
        churn_rate = customer_metrics['is_churned'].mean()
        if churn_rate > 0.3:  # 30% churn rate threshold
            insights.append({
                'title': 'Customer Retention Concern',
                'description': f'Customer churn rate is {churn_rate:.1%}, indicating potential retention issues.',
                'recommendation': 'Implement customer retention programs and analyze reasons for customer inactivity.',
                'impact': 'High',
                'category': 'Customer Retention'
            })
        
        return insights
    
    def export_data(self, output_dir: str = '../processed_data'):
        """Export processed data to JSON files for the API"""
        print("Exporting processed data...")
        
        os.makedirs(output_dir, exist_ok=True)
        
        # Export main metrics
        with open(f'{output_dir}/metrics.json', 'w') as f:
            json.dump(self.processed_data, f, indent=2, default=str)
        
        # Export individual datasets for API endpoints
        endpoints_data = {
            'revenue_by_region': self.processed_data['revenue_by_region'],
            'top_products': self.processed_data['top_products'],
            'category_performance': self.processed_data['category_performance'],
            'customer_summary': self.processed_data['customer_metrics_summary'],
            'age_groups': self.processed_data['age_group_analysis'],
            'inventory_risks': self.processed_data['inventory_insights'],
            'monthly_trends': self.processed_data['monthly_trends'],
            'business_insights': self.processed_data['business_insights']
        }
        
        for endpoint, data in endpoints_data.items():
            with open(f'{output_dir}/{endpoint}.json', 'w') as f:
                json.dump(data, f, indent=2, default=str)
        
        print(f"Processed data exported to '{output_dir}' directory")
    
    def run_pipeline(self):
        """Execute the complete ETL pipeline"""
        print("=== Starting Retail ETL Pipeline ===")
        
        self.load_data()
        self.clean_data()
        self.generate_metrics()
        self.export_data()
        
        print("=== ETL Pipeline Completed Successfully ===")
        
        # Print summary
        print("\n=== Summary ===")
        print(f"Total Revenue: ${sum(self.processed_data['revenue_by_region'][region]['total_revenue'] for region in self.processed_data['revenue_by_region']):,.2f}")
        print(f"Total Customers: {self.processed_data['customer_metrics_summary']['total_customers']}")
        print(f"Products at Risk: {self.processed_data['inventory_insights']['total_products_at_risk']}")
        print(f"Customer Churn Rate: {self.processed_data['customer_metrics_summary']['churn_rate']:.1%}")
        print(f"Generated {len(self.processed_data['business_insights'])} business insights")

def main():
    """Run the ETL pipeline"""
    pipeline = RetailETLPipeline()
    pipeline.run_pipeline()

if __name__ == "__main__":
    main()
