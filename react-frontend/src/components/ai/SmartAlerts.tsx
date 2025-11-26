import React from 'react';

interface SmartAlertsProps {
  healthAlerts: string[];
  smartAlerts: string[];
}

const SmartAlerts: React.FC<SmartAlertsProps> = ({ healthAlerts, smartAlerts }) => {
  const allAlerts = [...healthAlerts, ...smartAlerts];
  return (
    <div className="ai-card">
      <h3>Alertas Inteligentes</h3>
      {allAlerts.length > 0 ? (
        <ul>
          {allAlerts.map((alert, index) => (
            <li key={index}>{alert}</li>
          ))}
        </ul>
      ) : (
        <p>Nenhum alerta no momento.</p>
      )}
    </div>
  );
};

export default SmartAlerts;
