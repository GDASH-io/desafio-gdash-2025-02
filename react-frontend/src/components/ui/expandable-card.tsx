import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ExpandableCardProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const ExpandableCard: React.FC<ExpandableCardProps> = ({
  title,
  children,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="ai-card w-full">
      <div
        className="flex items-center justify-between p-3 cursor-pointer expandable-card-header-hover rounded-md transition-all duration-200"
        onClick={toggleExpanded}
        style={{
          borderColor: 'var(--ai-border)',
        }}
      >
        <h3 className="text-lg font-semibold m-0" style={{ color: 'var(--ai-primary)' }}>{title}</h3>
        {isExpanded ? (
          <ChevronDown size={20} style={{ color: 'var(--ai-icon)' }} />
        ) : (
          <ChevronRight size={20} style={{ color: 'var(--ai-icon)' }} />
        )}
      </div>
      {isExpanded && <div className="p-3 border-t mt-2 pt-2" style={{ borderColor: 'var(--ai-border)' }}>{children}</div>}
    </div>
  );
};

export default ExpandableCard;
