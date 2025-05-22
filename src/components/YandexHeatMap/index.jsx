import React from 'react';
import BasicMap from './BasicMap';

const mapStyle = {
  position: 'fixed',
  bottom: '0',
  right: '0',
  width: 'calc(50vw - 1px)',
  height: 'calc(100vh - 120px)',
  boxShadow: '-4px 0 6px -1px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  zIndex: 1,
  borderLeft: '1px solid #e5e7eb'
};

const YandexHeatMap = () => {
  return (
    <div style={mapStyle}>
      <BasicMap />
    </div>
  );
};

export default YandexHeatMap; 