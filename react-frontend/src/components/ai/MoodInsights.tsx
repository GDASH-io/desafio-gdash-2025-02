import React from 'react';

interface MoodInsightsProps {
  insights: string;
}

const MoodInsights: React.FC<MoodInsightsProps> = ({ insights }) => {
  return (
    <div className="ai-card">
      <h3>Insights de Humor</h3>
      <p>{insights}</p>
    </div>
  );
};

export default MoodInsights;
