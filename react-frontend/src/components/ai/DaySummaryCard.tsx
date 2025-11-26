import React from 'react';

interface DaySummaryCardProps {
  summary: string;
}

const DaySummaryCard: React.FC<DaySummaryCardProps> = ({ summary }) => {
  return (
    <div>
      <p className="text-sm font-light text-[#E5E7EB] whitespace-pre-line">{summary}</p>
    </div>
  );
};

export default DaySummaryCard;
