"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#6366F1"];

interface ChartProps {
  data: {
    name: string;
    value: number;
  }[];
  title?: string;
}

export default function ChartComponent({ data, title = "Sentiment Breakdown" }: ChartProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
