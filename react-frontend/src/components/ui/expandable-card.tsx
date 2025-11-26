import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface ExpandableCardProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  icon?: LucideIcon;
}

const ExpandableCard: React.FC<ExpandableCardProps> = ({
  title,
  children,
  defaultExpanded = false,
  icon: Icon,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full">
      <button
        className="flex items-center justify-between w-full px-4 py-3 bg-[#0e1a24] hover:bg-[#11202d] rounded-xl border border-white/5 transition-all duration-200 text-left"
        onClick={toggleExpanded}
      >
        <div className="flex items-center space-x-3">
          {Icon && <Icon size={18} className="text-[#00D9FF]" />}
          <span className="text-sm font-medium text-[#E5E7EB]">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronDown size={18} className="text-[#00D9FF]" />
        ) : (
          <ChevronRight size={18} className="text-[#00D9FF]" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-2 px-4 py-3 bg-[#0D1117] border border-white/5 rounded-xl">
          {children}
        </div>
      )}
    </div>
  );
};

export default ExpandableCard;
