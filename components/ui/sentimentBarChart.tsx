"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

type SentimentData = {
  sentiment: string;
  rating: number;
  created_at: string;
  course_name: string;
  faculty_name: string;
}[];

interface SentimentBarChartProps {
  data: SentimentData;
}

const COLORS: Record<string, string> = {
  Positive: "#10B981", // Emerald
  Neutral: "#FBBF24",  // Amber
  Negative: "#EF4444", // Red
};

const SentimentBarChart: React.FC<SentimentBarChartProps> = ({ data }) => {
  const sentimentCounts: Record<string, number> = data.reduce((acc, item) => {
    const sentiment = item.sentiment;
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(sentimentCounts).map(([sentiment, count]) => ({
    sentiment,
    count,
  }));

  return (
    <div className="w-full h-[320px] bg-white rounded-2xl shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Sentiment Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barSize={40} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="sentiment" stroke="#9CA3AF" fontSize={14} />
          <YAxis allowDecimals={false} stroke="#9CA3AF" fontSize={14} />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", borderColor: "#E5E7EB" }}
            labelStyle={{ fontWeight: 600 }}
            itemStyle={{ color: "#4B5563" }}
          />
          {/* Legend removed to avoid unwanted "count" box */}
          <Bar dataKey="count" radius={[10, 10, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.sentiment] || "#6366F1"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentBarChart;
