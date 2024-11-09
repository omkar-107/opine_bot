import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Smile, Meh, Frown } from 'lucide-react';

const FeedbackSummaryCard = ({ feedbackSummary,  totalStudents }) => {
  const avgRating = feedbackSummary.avg;
  console.log(feedbackSummary);
 
  // console.log('FeedbackSummaryCard props:', { avgRating, positiveCount, negativeCount, totalStudents });
  
  let positiveCount= 0;
  let negativeCount = 0;

    for(let i = 0; i < feedbackSummary.summaries.length; i++) {
      if(feedbackSummary.summaries[i].summary.rating >= 6) {
        positiveCount++;
      } else {
        negativeCount++;
      }
    }
  
  const totalFeedback = positiveCount + negativeCount;
  const positivePercentage = (positiveCount / totalFeedback) * 100;
  const negativePercentage = (negativeCount / totalFeedback) * 100;

  const data = [
    { name: 'Positive', value: positivePercentage },
    { name: 'Negative', value: negativePercentage },
  ];

  const COLORS = ['#00C49F', '#FF8042'];

  // Determine feedback summary icon based on the avgRating
  const getFeedbackIcon = () => {
    if (avgRating >= 4) return <Smile className="text-green-500 w-8 h-8" />;
    if (avgRating >= 2) return <Meh className="text-yellow-500 w-8 h-8" />;
    return <Frown className="text-red-500 w-8 h-8" />;
  };

  // Determine feedback message based on the avgRating
  const getFeedbackMessage = () => {
    if (avgRating >= 4) return "Great Feedback!";
    if (avgRating >= 2) return "Mixed Feedback";
    return "Room for Improvement";
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Feedback Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-4xl font-bold">
              {typeof avgRating === 'number' ? avgRating.toFixed(1) : 'N/A'}
            </span>
            <span className="text-gray-500">Average Rating</span>
          </div>
          <div className="text-gray-500">{totalStudents} Students</div>
        </div>

        {/* Feedback summary icon and message */}
        <div className="flex items-center justify-center mt-4 space-x-2">
          {getFeedbackIcon()}
          <span className="text-xl font-semibold text-gray-700">{getFeedbackMessage()}</span>
        </div>

        <div className="mt-6 flex justify-center">
          <PieChart width={200} height={200}>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `${value.toFixed(2)}%`} 
              contentStyle={{ backgroundColor: 'white', borderColor: 'gray', borderRadius: '5px', padding: '5px' }}
            />
          </PieChart>
        </div>

        {/* Progress bars for positive and negative feedback */}
        <div className="flex justify-center mt-4 space-x-4 text-sm">
          <div className="flex items-center space-x-2 text-green-500">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Positive ({positiveCount}, {positivePercentage.toFixed(2)}%)</span>
          </div>
          <div className="flex items-center space-x-2 text-red-500">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span>Negative ({negativeCount}, {negativePercentage.toFixed(2)}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackSummaryCard;
