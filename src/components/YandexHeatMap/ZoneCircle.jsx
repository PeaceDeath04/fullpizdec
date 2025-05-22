import React from 'react';
import { Circle } from '@pbe/react-yandex-maps';
import { calculateCircleRadius } from '../../utils/mapCalculations';
import { getCircleOptions } from '../../utils/zoneStyles';

/**
 * Проверяет валидность данных зоны
 * @param {Object} zone - Объект зоны для проверки
 * @returns {boolean} - Валидна ли зона
 */
const isValidZone = (zone) => {
  return zone &&
         Array.isArray(zone.center) &&
         zone.center.length === 2 &&
         typeof zone.center[0] === 'number' &&
         typeof zone.center[1] === 'number' &&
         !isNaN(zone.center[0]) &&
         !isNaN(zone.center[1]) &&
         typeof zone.uniqueAddressCount === 'number';
};

/**
 * Компонент для отображения зоны на карте в виде круга
 * @param {Object} props - Свойства компонента
 * @param {Object} props.zone - Данные о зоне
 * @param {number} props.zoom - Текущий уровень зума
 * @param {Function} props.onMouseEnter - Обработчик наведения
 * @param {Function} props.onMouseMove - Обработчик движения мыши
 * @param {Function} props.onMouseLeave - Обработчик ухода мыши
 * @param {Function} props.onClick - Обработчик клика
 */
const ZoneCircle = ({
  zone,
  zoom,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  onClick
}) => {
  if (!isValidZone(zone)) {
    console.error('Invalid zone data:', zone);
    return null;
  }

  try {
    const radius = calculateCircleRadius(zone.uniqueAddressCount, zoom);
    const options = getCircleOptions(zone);

    return (
      <Circle
        geometry={[zone.center, radius]}
        options={options}
        onClick={() => onClick(zone)}
        onMouseEnter={(e) => onMouseEnter(e, zone)}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      />
    );
  } catch (error) {
    console.error('Error rendering zone circle:', error);
    return null;
  }
};

export default React.memo(ZoneCircle); 