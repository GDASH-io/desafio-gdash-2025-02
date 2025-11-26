import React from 'react';

interface DaySummaryCardProps {
  summary: string;
}

const DaySummaryCard: React.FC<DaySummaryCardProps> = ({ summary }) => {
  return (
    <div className="ai-card">
      <h3>Resumo Inteligente do Dia</h3>
      <p>{summary}</p>
    </div>
  );
};

export default DaySummaryCard;
