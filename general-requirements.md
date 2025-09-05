Technical Challenge – Software Engineering
Context
A fictitious retail network needs to better understand its sales, customers, and inventory. Your mission will be to model the ontology, process raw data, analyze it,
and present business insights in a React interface.
Challenge Steps
1) Ontology (Conceptual Model)
Build an ontology diagram that represents the main entities and relationships, inspired
by Palantir Foundry models. Suggested entities:
• Customers
• Products
• Sales
• Inventory
• Categories
Relate:
• Who buys what, when, and for how much;
• Current inventory per product and turnover;
• Product categories and customer preferences.
2) Data Generation (CSV)
Generate fictitious datasets in CSV format (at least 3 files). You may use Faker, Python
scripts, Mockaroo, or another tool.
• customers.csv → id, name, age, region
• products.csv → id, category, price, supplier
• sales.csv → id, customer_id, product_id, date, quantity
1
3) Data Pipeline in Python
Create an ETL pipeline that:
• Reads the CSVs;
• Handles inconsistencies (missing values, duplicates, outliers);
• Generates consolidated metrics (e.g.: revenue by region, top-selling products, customer
churn).
4) Use of TypeScript
Implement a TypeScript service that:
• Consumes the processed data (via JSON file exported by the pipeline or API);
• Exposes endpoints for the frontend (e.g.: /api/top-products, /api/sales-by-region).
5) React Interface
Create at least one screen that:
• Shows two data visualizations (e.g.: sales by region chart, top-selling products ranking);
• Allows exploration/filtering (e.g.: by period, category, region);
• Is simple and clear (you may use Recharts, Victory, or Chart.js).
6) Business Insights
From the data, deliver at least 3 business insights that support decision-making. Examples:
• Customers from the South region buy 30% more electronics than the national average;
• Product X represents 20% of revenue but is in critical stock;
• Young customers (<25 years old) concentrate purchases in the Fashion category.
Evaluation Criteria
1) Ontology – clarity and logic of the conceptual model;
2) Data structuring and cleaning – quality of the pipeline and documentation in
Python;
3) Coding and interface – best practices in Python + TypeScript + React;
4) Creativity and business insights – relevance and decision-making potential.
2