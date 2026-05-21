import React from 'react';
import '../styles/Dashboard.css';

const Dashboard = ({ entries }) => {
  const paid = entries.filter(e => e.status === 'Paid');
  const pending = entries.filter(e => e.status === 'Pending');
  const unpaid = entries.filter(e => e.status === 'Unpaid');
  
  return (
    <div className="stats-row">
      <div className="stat-card blue">
        <div className="stat-num">{entries.length}</div>
        <div className="stat-label">Total Entries</div>
      </div>
      <div className="stat-card green">
        <div className="stat-num">{paid.length}</div>
        <div className="stat-label">Paid</div>
      </div>
      <div className="stat-card amber">
        <div className="stat-num">{pending.length}</div>
        <div className="stat-label">Pending</div>
      </div>
      <div className="stat-card red">
        <div className="stat-num">{unpaid.length}</div>
        <div className="stat-label">Unpaid</div>
      </div>
    </div>
  );
};

export default Dashboard;
