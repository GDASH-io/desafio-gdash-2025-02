import React from "react";
import { WiStars } from "react-icons/wi";

interface InsightsCardProps {
  text: string;
  title: string;
  icon?: React.ReactNode; 
  className?: string;

}

export default function InsightsCard({ text, title }: InsightsCardProps) {
  if (!text) return null;

  // Quebra de linhas em parágrafos
  const lines = text.split("\n").map((line, idx) => (
    <p key={idx} className="text-gray-800 text-lg leading-relaxed">
      {line.startsWith("-") ? <span className="ml-4">{line}</span> : line}
    </p>
  ));

  return (
    <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 rounded-lg shadow hover:shadow-lg transition-transform transform hover:scale-[1.02]">
      <div className="flex items-start gap-3">
        <WiStars size={40} color="#1C4ED8" />
        <div>
          <h3 className="text-xl font-semibold text-blue-800 mb-2">{title}</h3>
          {lines}
        </div>
      </div>
    </div>
  );
}
