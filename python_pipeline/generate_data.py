"""
Data Generation Script for Retail Network Analytics
Generates fictitious CSV datasets for customers, products, and sales.
"""

import pandas as pd
import numpy as np
from faker import Faker
import random
from datetime import datetime, timedelta
import os

# Initialize Faker
fake = Faker()
np.random.seed(42)
random.seed(42)

# Configuration
NUM_CUSTOMERS = 1000
NUM_PRODUCTS = 200
NUM_SALES = 5000

# Regions and categories
REGIONS = ['North', 'South', 'East', 'West', 'Central']
CATEGORIES = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Beauty', 'Books', 'Automotive']
SUPPLIERS = ['TechCorp', 'FashionPlus', 'HomeBase', 'SportZone', 'BeautyWorld', 'BookLand', 'AutoParts']

def generate_customers():
    """Generate customers dataset"""
    customers = []
    
    for i in range(1, NUM_CUSTOMERS + 1):
        customer = {
            'id': i,
            'name': fake.name(),
            'age': np.random.normal(40, 15),  # Normal distribution around 40
            'region': np.random.choice(REGIONS, p=[0.25, 0.20, 0.20, 0.20, 0.15]),  # Weighted regions
            'created_at': fake.date_between(start_date='-2y', end_date='today')
        }
        # Ensure age is realistic
        customer['age'] = max(18, min(80, int(customer['age'])))
        customers.append(customer)
    
    return pd.DataFrame(customers)

def generate_products():
    """Generate products dataset"""
    products = []
    
    for i in range(1, NUM_PRODUCTS + 1):
        category = np.random.choice(CATEGORIES)
        
        # Price ranges by category
        price_ranges = {
            'Electronics': (50, 2000),
            'Fashion': (20, 500),
            'Home & Garden': (15, 800),
            'Sports': (25, 600),
            'Beauty': (10, 200),
            'Books': (8, 50),
            'Automotive': (30, 1500)
        }
        
        min_price, max_price = price_ranges[category]
        
        product = {
            'id': i,
            'name': f"{category} Product {i}",
            'category': category,
            'price': round(np.random.uniform(min_price, max_price), 2),
            'supplier': np.random.choice(SUPPLIERS),
            'created_at': fake.date_between(start_date='-1y', end_date='today')
        }
        products.append(product)
    
    return pd.DataFrame(products)

def generate_sales(customers_df, products_df):
    """Generate sales dataset"""
    sales = []
    
    # Create some customer preferences (some customers buy more from certain categories)
    customer_preferences = {}
    for customer_id in customers_df['id']:
        # Some customers have category preferences
        if random.random() < 0.3:  # 30% have strong preferences
            preferred_category = np.random.choice(CATEGORIES)
            customer_preferences[customer_id] = preferred_category
    
    for i in range(1, NUM_SALES + 1):
        customer = customers_df.sample(1).iloc[0]
        
        # If customer has preferences, bias product selection
        if customer['id'] in customer_preferences:
            preferred_cat = customer_preferences[customer['id']]
            if random.random() < 0.7:  # 70% chance to buy from preferred category
                available_products = products_df[products_df['category'] == preferred_cat]
                if len(available_products) > 0:
                    product = available_products.sample(1).iloc[0]
                else:
                    product = products_df.sample(1).iloc[0]
            else:
                product = products_df.sample(1).iloc[0]
        else:
            product = products_df.sample(1).iloc[0]
        
        # Generate realistic quantity (most sales are 1-3 items)
        quantity = np.random.choice([1, 2, 3, 4, 5], p=[0.5, 0.25, 0.15, 0.07, 0.03])
        
        # Add some price variation (discounts, etc.)
        unit_price = product['price'] * np.random.uniform(0.8, 1.0)
        
        # Generate date with some seasonality
        base_date = datetime.now() - timedelta(days=365)
        days_offset = np.random.exponential(100)  # More recent sales
        days_offset = min(days_offset, 365)
        sale_date = base_date + timedelta(days=days_offset)
        
        sale = {
            'id': i,
            'customer_id': customer['id'],
            'product_id': product['id'],
            'date': sale_date.strftime('%Y-%m-%d'),
            'quantity': quantity,
            'unit_price': round(unit_price, 2),
            'total_amount': round(unit_price * quantity, 2)
        }
        sales.append(sale)
    
    return pd.DataFrame(sales)

def generate_inventory(products_df):
    """Generate inventory dataset"""
    inventory = []
    
    for _, product in products_df.iterrows():
        # Generate realistic inventory levels
        max_stock = np.random.randint(10, 500)
        current_stock = np.random.randint(0, max_stock)
        reorder_level = int(max_stock * 0.2)  # 20% of max stock
        
        # Calculate turnover rate (higher for popular categories)
        high_turnover_categories = ['Electronics', 'Fashion', 'Beauty']
        if product['category'] in high_turnover_categories:
            turnover_rate = np.random.uniform(8, 15)  # Higher turnover
        else:
            turnover_rate = np.random.uniform(3, 8)   # Lower turnover
        
        inventory_item = {
            'id': product['id'],
            'product_id': product['id'],
            'current_stock': current_stock,
            'reorder_level': reorder_level,
            'max_stock': max_stock,
            'turnover_rate': round(turnover_rate, 2),
            'last_updated': fake.date_between(start_date='-30d', end_date='today')
        }
        inventory.append(inventory_item)
    
    return pd.DataFrame(inventory)

def main():
    """Generate all datasets and save to CSV files"""
    print("Generating retail network datasets...")
    
    # Create data directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    # Generate datasets
    print("1. Generating customers...")
    customers_df = generate_customers()
    customers_df.to_csv('data/customers.csv', index=False)
    print(f"   Generated {len(customers_df)} customers")
    
    print("2. Generating products...")
    products_df = generate_products()
    products_df.to_csv('data/products.csv', index=False)
    print(f"   Generated {len(products_df)} products")
    
    print("3. Generating sales...")
    sales_df = generate_sales(customers_df, products_df)
    sales_df.to_csv('data/sales.csv', index=False)
    print(f"   Generated {len(sales_df)} sales records")
    
    print("4. Generating inventory...")
    inventory_df = generate_inventory(products_df)
    inventory_df.to_csv('data/inventory.csv', index=False)
    print(f"   Generated {len(inventory_df)} inventory records")
    
    # Display sample data
    print("\n=== Sample Data ===")
    print("\nCustomers (first 5 rows):")
    print(customers_df.head())
    
    print("\nProducts (first 5 rows):")
    print(products_df.head())
    
    print("\nSales (first 5 rows):")
    print(sales_df.head())
    
    print("\nInventory (first 5 rows):")
    print(inventory_df.head())
    
    print(f"\nDatasets saved to 'data/' directory")

if __name__ == "__main__":
    main()
