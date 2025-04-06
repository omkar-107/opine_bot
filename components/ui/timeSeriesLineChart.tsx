"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type SentimentData = {
  sentiment: string;
  rating: number;
  created_at: string;
  course_name: string;
  faculty_name: string;
}[];

interface TimeSeriesLineChartProps {
  data: SentimentData;
}

const TimeSeriesLineChart: React.FC<TimeSeriesLineChartProps> = ({ data }) => {
  // Sort data by date for accurate line chart
  const sortedData = [...data].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Format data
  const formattedData = sortedData.map(item => ({
    rating: item.rating,
    createdAt: new Date(item.created_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
  }));

  return (
    <div className="w-full h-[320px] bg-white rounded-2xl shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Rating Trend Over Time</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="createdAt"
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
          />
          <YAxis
            domain={[0, 10]}
            stroke="#9CA3AF"
            fontSize={12}
            tickCount={6}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              borderColor: "#E5E7EB",
              boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
            }}
            labelStyle={{ fontWeight: 600, color: "#4B5563" }}
            itemStyle={{ color: "#4B5563" }}
          />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="#6366F1" // Indigo
            strokeWidth={3}
            dot={{ r: 4, fill: "#6366F1" }}
            activeDot={{ r: 6, stroke: "#6366F1", strokeWidth: 2, fill: "#ffffff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeSeriesLineChart;
