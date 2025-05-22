import { useState, useEffect } from 'react';
import { calculateDistance, getMaxMergeDistance } from '../utils/mapCalculations';

/**
 * Проверяет валидность координат
 * @param {Array|undefined} coordinates - Координаты для проверки
 * @returns {boolean} - Валидны ли координаты
 */
const isValidCoordinates = (coordinates) => {
  return Array.isArray(coordinates) && 
         coordinates.length === 2 && 
         typeof coordinates[0] === 'number' && 
         typeof coordinates[1] === 'number' &&
         !isNaN(coordinates[0]) && 
         !isNaN(coordinates[1]);
};

/**
 * Хук для управления зонами на карте
 * @param {Array} incidents - Массив инцидентов
 * @param {number} zoom - Текущий уровень зума
 * @returns {Object} - Объект с зонами и функциями управления
 */
export const useZones = (incidents, zoom) => {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    if (!incidents?.length) return;

    // Группируем инциденты по адресам
    const zonesByAddress = new Map();
    incidents.forEach(incident => {
      const key = incident.address;
      if (!zonesByAddress.has(key)) {
        zonesByAddress.set(key, {
          incidents: [],
          coordinates: incident.coordinates
        });
      }
      zonesByAddress.get(key).incidents.push(incident);
    });

    // Создаем базовые зоны
    const baseZones = Array.from(zonesByAddress.entries()).map(([address, data]) => ({
      id: address,
      center: data.coordinates,
      incidents: data.incidents,
      uniqueAddressCount: 1,
      totalIncidents: data.incidents.length
    }));

    // Объединяем пересекающиеся зоны
    const mergedZones = mergeOverlappingZones(baseZones, zoom);
    setZones(mergedZones);
  }, [incidents, zoom]);

  /**
   * Объединяет пересекающиеся зоны с учетом расстояния
   * @param {Array} baseZones - Исходные зоны
   * @param {number} zoom - Текущий уровень зума
   * @returns {Array} - Массив объединенных зон
   */
  const mergeOverlappingZones = (baseZones, zoom) => {
    if (!baseZones.length) return [];

    const mergedZones = [];
    const processed = new Set();
    const maxMergeDistance = getMaxMergeDistance(zoom);

    for (let i = 0; i < baseZones.length; i++) {
      if (processed.has(i)) continue;

      let overlappingZones = [baseZones[i]];
      processed.add(i);

      // Ищем все пересекающиеся зоны
      for (let j = 0; j < baseZones.length; j++) {
        if (i === j || processed.has(j)) continue;

        const distance = calculateDistance(baseZones[i].center, baseZones[j].center);
        
        if (distance <= maxMergeDistance) {
          overlappingZones.push(baseZones[j]);
          processed.add(j);
        }
      }

      if (overlappingZones.length > 1) {
        // Объединяем несколько зон
        const uniqueAddresses = new Set(overlappingZones.map(zone => zone.id));
        const allIncidents = overlappingZones.reduce((acc, zone) => [...acc, ...zone.incidents], []);
        
        const center = [
          overlappingZones.reduce((sum, zone) => sum + zone.center[0], 0) / overlappingZones.length,
          overlappingZones.reduce((sum, zone) => sum + zone.center[1], 0) / overlappingZones.length
        ];

        mergedZones.push({
          id: `Группа (${uniqueAddresses.size} адресов)`,
          center,
          uniqueAddressCount: uniqueAddresses.size,
          totalIncidents: allIncidents.length,
          incidents: allIncidents,
          isHeatZone: true,
          addresses: Array.from(uniqueAddresses)
        });
      } else {
        // Одиночная зона
        mergedZones.push({
          ...overlappingZones[0],
          isHeatZone: false
        });
      }
    }

    return mergedZones;
  };

  return { zones };
}; 