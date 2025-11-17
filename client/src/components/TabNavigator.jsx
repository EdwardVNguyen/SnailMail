import React from 'react';
import './TabNavigator.css';

/**
 * Reusable TabNavigator Component
 *
 * @param {Array} tabs - Array of tab objects: [{ id: 'add', label: 'Add Employee' }, ...]
 * @param {string} activeTab - ID of the currently active tab
 * @param {Function} onTabChange - Callback when tab is changed: (tabId) => void
 */
const TabNavigator = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="tab-navigator">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigator;
