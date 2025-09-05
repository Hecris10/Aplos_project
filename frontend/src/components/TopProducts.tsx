import React from 'react';
import type { TopProduct } from '../types';
import { formatCurrency, formatNumber } from '../apiService';

interface TopProductsProps {
  products: TopProduct[];
}

export const TopProducts: React.FC<TopProductsProps> = ({ products }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products</h3>
      <div className="space-y-3">
        {products.slice(0, 5).map((product, index) => (
          <div key={product.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{formatCurrency(product.total_revenue)}</p>
              <p className="text-xs text-gray-500">{formatNumber(product.total_quantity_sold)} sold</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Show more button if there are more products */}
      {products.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All {products.length} Products →
          </button>
        </div>
      )}
    </div>
  );
};
