/**
 * Цветовая схема для разных уровней опасности
 */
export const ZONE_COLORS = {
  level1: '#2563eb', // Синий
  level2: '#3b82f6', // Светло-синий
  level3: '#f59e0b', // Оранжевый
  level4: '#f97316', // Ярко-оранжевый
  level5: '#ef4444', // Красный
  level6: '#dc2626'  // Тёмно-красный
};

/**
 * Определяет стиль зоны на основе количества инцидентов
 * @param {Object} zone - Объект зоны с данными
 * @returns {Object} - Объект со стилями (цвет и прозрачность)
 */
export const getZoneStyle = (zone) => {
  const count = zone.totalIncidents;
  const isHeatZone = zone.isHeatZone;

  let color, opacity;
  
  if (count >= 10) {
    color = ZONE_COLORS.level6;
    opacity = 0.8;
  } else if (count >= 8) {
    color = ZONE_COLORS.level5;
    opacity = 0.7;
  } else if (count >= 6) {
    color = ZONE_COLORS.level4;
    opacity = 0.65;
  } else if (count >= 4) {
    color = ZONE_COLORS.level3;
    opacity = 0.6;
  } else if (count >= 2) {
    color = ZONE_COLORS.level2;
    opacity = 0.55;
  } else {
    color = ZONE_COLORS.level1;
    opacity = 0.5;
  }

  if (isHeatZone) {
    opacity += 0.1;
  }

  return { color, opacity };
};

/**
 * Создает стили для круга на карте
 * @param {Object} zone - Объект зоны
 * @returns {Object} - Объект с настройками стилей для круга
 */
export const getCircleOptions = (zone) => {
  const { color, opacity } = getZoneStyle(zone);
  
  return {
    fillColor: color,
    fillOpacity: opacity,
    strokeColor: color,
    strokeOpacity: 0.8,
    strokeWidth: 2,
    cursor: 'pointer'
  };
}; 