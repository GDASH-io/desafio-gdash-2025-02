import React from 'react';

interface MoodInsightsProps {
  insights: string;
}

const MoodInsights: React.FC<MoodInsightsProps> = ({ insights }) => {
  return (
    <div>
      <p className="text-sm font-light text-[#E5E7EB]">{insights}</p>
    </div>
  );
};

export default MoodInsights;
