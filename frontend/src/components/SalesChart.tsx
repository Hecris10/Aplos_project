import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { RegionChartData } from '../types';
import { formatCurrency, formatNumber } from '../apiService';

interface SalesChartProps {
  data: RegionChartData[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Sales by Region</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis />
            <Tooltip formatter={(value, name) => [
              name === 'revenue' ? formatCurrency(Number(value)) : formatNumber(Number(value)),
              name === 'revenue' ? 'Revenue' : name === 'sales' ? 'Sales Count' : 'Avg Order Value'
            ]} />
            <Legend />
            <Bar dataKey="revenue" fill="#0088FE" name="Revenue" />
            <Bar dataKey="sales" fill="#00C49F" name="Sales Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
