import React from 'react';
import { TABS } from '../../constants/tabs';
import { btnTab } from '../../styles/theme';

/**
 * Tab navigation bar.
 */
export default function TabNav({ activeTab, onTabChange }) {
  return (
    <nav
      style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        padding: '0 24px',
        gap: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={btnTab(activeTab === tab.id)}
        >
          <span style={{ fontSize: '14px' }}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
