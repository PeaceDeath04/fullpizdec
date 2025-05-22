import React from 'react';

const tooltipStyle = {
  position: 'fixed',
  backgroundColor: 'white',
  padding: '8px',
  borderRadius: '4px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  zIndex: 1000,
  maxWidth: '250px',
  pointerEvents: 'none'
};

/**
 * Компонент для отображения всплывающей подсказки при наведении на зону
 * @param {Object} props - Свойства компонента
 * @param {Object} props.zone - Данные о зоне
 * @param {Object} props.position - Позиция подсказки {x, y}
 * @param {boolean} props.isVisible - Флаг видимости подсказки
 */
const ZoneTooltip = ({ zone, position, isVisible }) => {
  if (!isVisible || !zone) return null;

  const style = {
    ...tooltipStyle,
    display: isVisible ? 'block' : 'none',
    left: `${position.x + 10}px`,
    top: `${position.y - 10}px`
  };

  return (
    <div style={style}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
        {zone.isHeatZone ? zone.id : `Адрес: ${zone.id}`}
      </div>
      <div>Количество инцидентов: {zone.totalIncidents}</div>
      <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
        {zone.incidents.map((incident, index) => (
          <div
            key={index}
            style={{
              marginTop: '4px',
              paddingBottom: '4px',
              borderBottom: '1px solid #eee'
            }}
          >
            <div style={{ fontWeight: '500' }}>{incident.address}</div>
            <div>Подъезд {incident.entrance}, этаж {incident.floor}</div>
            <div style={{ color: '#888' }}>{incident.problemType}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZoneTooltip; 