import React from 'react';

interface SmartAlertsProps {
  healthAlerts: string[];
  smartAlerts: string[];
}

const SmartAlerts: React.FC<SmartAlertsProps> = ({ healthAlerts, smartAlerts }) => {
  const allAlerts = [...healthAlerts, ...smartAlerts];
  return (
    <div>
      {allAlerts.length > 0 ? (
        <ul className="space-y-1.5">
          {allAlerts.map((alert, index) => (
            <li key={index} className="text-sm font-light text-[#E5E7EB]">• {alert}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm font-light text-[#9CA3AF]">Nenhum alerta no momento.</p>
      )}
    </div>
  );
};

export default SmartAlerts;
