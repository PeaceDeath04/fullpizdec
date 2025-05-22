/**
 * Вычисляет радиус круга на основе количества инцидентов и текущего зума
 * @param {number} count - Количество инцидентов
 * @param {number} zoom - Текущий уровень зума
 * @returns {number} - Радиус круга в пикселях
 */
export const calculateCircleRadius = (count, zoom) => {
  const zoomFactor = Math.pow(2, 19 - zoom) * 2.6;
  const baseRadius = Math.max(40, Math.min(13000, zoomFactor * 5.2));
  const countMultiplier = Math.max(6.5, zoomFactor / 1.5);
  
  return baseRadius + (count * countMultiplier);
};

/**
 * Вычисляет расстояние между двумя точками на карте
 * @param {Array<number>} point1 - Координаты первой точки [lat, lon]
 * @param {Array<number>} point2 - Координаты второй точки [lat, lon]
 * @returns {number} - Расстояние в метрах
 */
export const calculateDistance = (point1, point2) => {
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  const R = 6371; // Радиус Земли в км

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // Переводим в метры
};

/**
 * Определяет максимальное расстояние для объединения зон в зависимости от зума
 * @param {number} zoom - Текущий уровень зума
 * @returns {number} - Максимальное расстояние в метрах
 */
export const getMaxMergeDistance = (zoom) => {
  const zoomFactor = Math.pow(2, 19 - zoom) * 2.6;
  return Math.max(260, Math.min(26000, zoomFactor * 10.4));
}; 