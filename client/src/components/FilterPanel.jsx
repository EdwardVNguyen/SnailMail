import React from 'react';
import './FilterPanel.css';

/**
 * Reusable FilterPanel Component
 *
 * @param {Array} filters - Array of filter objects:
 *   [{
 *     label: 'Filter by Role',
 *     value: roleFilter,
 *     onChange: (value) => setRoleFilter(value),
 *     options: [
 *       { value: 'all', label: 'All Employees' },
 *       { value: 'manager', label: 'Managers' }
 *     ]
 *   }]
 *
 * @param {Array} toggles - Array of toggle button objects:
 *   [{
 *     label: 'Safety Lock (ID)',
 *     value: safetyLock,
 *     onToggle: () => setSafetyLock(!safetyLock),
 *     activeText: 'Locked',
 *     inactiveText: 'Unlocked',
 *     activeColor: '#50589C',
 *     helpText: {
 *       active: 'ID cannot be edited',
 *       inactive: 'ID can be edited'
 *     }
 *   }]
 */
const FilterPanel = ({ filters = [], toggles = [] }) => {
  return (
    <div className="filter-panel">
      {/* Render filter dropdowns */}
      {filters.map((filter, index) => (
        <div key={index} className="filter-item">
          <label className="filter-label">
            {filter.label}:
          </label>
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="filter-select"
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {/* Render toggle buttons */}
      {toggles.map((toggle, index) => (
        <div key={index} className="filter-item">
          <label className="filter-label">
            {toggle.label}:
          </label>
          <button
            onClick={toggle.onToggle}
            className={`filter-toggle ${toggle.value ? 'active' : ''}`}
            style={{
              backgroundColor: toggle.value ? toggle.activeColor : 'white',
              color: toggle.value ? 'white' : '#333',
              borderColor: toggle.activeColor
            }}
          >
            {toggle.value ? toggle.activeText : toggle.inactiveText}
          </button>
          {toggle.helpText && (
            <div className="filter-help-text">
              {toggle.value ? toggle.helpText.active : toggle.helpText.inactive}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FilterPanel;
