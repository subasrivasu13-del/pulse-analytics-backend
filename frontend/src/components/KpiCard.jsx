import React from 'react';

const KpiCard = ({ title, value, icon: Icon, trend, trendType, colorClass = 'primary' }) => {
  return (
    <div className={`kpi-card ${colorClass}`}>
      <div className="kpi-card-header">
        <span className="kpi-title">{title}</span>
        <div className="kpi-icon-wrapper">
          <Icon size={20} />
        </div>
      </div>
      <div className="kpi-card-body">
        <h3 className="kpi-value">{value !== undefined && value !== null ? value.toLocaleString() : '0'}</h3>
        {trend && (
          <div className={`kpi-trend ${trendType}`}>
            <span className="trend-text">{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
