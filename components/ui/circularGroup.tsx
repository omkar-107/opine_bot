// components/SentimentCircleGroup.tsx

import React from 'react';
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface SentimentDataProps {
  sentimentData: {
    sentiment: string;
  }[];
}

const CircularGroup: React.FC<SentimentDataProps> = ({ sentimentData }) => {
    const total = sentimentData.length;
    const positive = sentimentData.filter((d) => d.sentiment === 'Positive').length;
    const neutral = sentimentData.filter((d) => d.sentiment === 'Neutral').length;
    const negative = sentimentData.filter((d) => d.sentiment === 'Negative').length;
  
    const getPercentage = (count: number) => Math.round((count / total) * 100);
  
    const summary = [
      { label: 'Total', value: total, percentage: 100, color: '#3b82f6' },
      { label: 'Positive', value: positive, percentage: getPercentage(positive), color: '#10b981' },
      { label: 'Neutral', value: neutral, percentage: getPercentage(neutral), color: '#f59e0b' },
      { label: 'Negative', value: negative, percentage: getPercentage(negative), color: '#ef4444' },
    ];
  
    return (
      <div className="flex justify-around items-center flex-wrap bg-cover bg-center rounded-lg p-6">
        {summary.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center w-36">
            <CircularProgressbarWithChildren
              value={item.percentage}
              styles={buildStyles({
                pathColor: item.color,
                trailColor: '#e5e7eb',
              })}
            >
              <div className="text-center">
                <div className="text-xl font-semibold text-black">
                  {item.label === 'Total' ? item.value : `${item.percentage}%`}
                </div>
              </div>
            </CircularProgressbarWithChildren>
            <span className="text-sm text-center mt-2" style={{ color: item.color }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

export default CircularGroup;
