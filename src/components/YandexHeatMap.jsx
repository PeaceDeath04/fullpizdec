import React, { useEffect, useState, useRef } from 'react';
import { YMaps, Map as YandexMap, Circle, Placemark } from '@pbe/react-yandex-maps';
import { YANDEX_MAPS_API_KEY } from '../config';

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

const mapContainerStyle = {
  position: 'relative',
  width: '100%',
  height: '100%'
};

const tooltipStyle = {
  position: 'fixed',
  backgroundColor: 'white',
  padding: '8px',
  borderRadius: '4px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  zIndex: 1000,
  maxWidth: '200px',
  pointerEvents: 'none',
  display: 'none'
};

const defaultState = {
  center: [55.7558, 37.6173], // Москва
  zoom: 13,
  controls: ['zoomControl', 'fullscreenControl'],
  type: 'yandex#map'
};

// Функция для определения радиуса круга на основе количества инцидентов и зума
const getCircleRadius = (count, zoom) => {
  // Увеличиваем чувствительность в 2.6 раза от исходной
  const zoomFactor = Math.pow(2, 19 - zoom) * 2.6;
  // Уменьшили минимальный радиус в 2 раза (с 80 до 40)
  const baseRadius = Math.max(40, Math.min(13000, zoomFactor * 5.2));
  
  // Уменьшили минимальный множитель для количества инцидентов в 2 раза
  const countMultiplier = Math.max(6.5, zoomFactor / 1.5);
  
  return baseRadius + (count * countMultiplier);
};

// Функция для расчета расстояния между двумя точками на карте
const calculateDistance = (point1, point2) => {
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000;
};

// Функция для объединения пересекающихся зон с учетом зума
const mergeOverlappingZones = (zones, zoom) => {
  if (!zones.length) return [];

  const mergedZones = [];
  const processed = new Set();

  // Определяем максимальное расстояние для объединения зон в зависимости от зума
  const getMaxMergeDistance = (zoom) => {
    const zoomFactor = Math.pow(2, 19 - zoom) * 2.6;
    return Math.max(260, Math.min(26000, zoomFactor * 10.4));
  };

  const maxMergeDistance = getMaxMergeDistance(zoom);

  for (let i = 0; i < zones.length; i++) {
    if (processed.has(i)) continue;

    let currentZone = { ...zones[i] };
    let overlappingZones = [zones[i]];
    processed.add(i);

    // Ищем все пересекающиеся зоны
    for (let j = 0; j < zones.length; j++) {
      if (i === j || processed.has(j)) continue;

      const distance = calculateDistance(zones[i].center, zones[j].center);
      
      if (distance <= maxMergeDistance) {
        overlappingZones.push(zones[j]);
        processed.add(j);
      }
    }

    if (overlappingZones.length > 1) {
      // Вычисляем уникальные адреса и все инциденты
      const uniqueAddresses = new Set(overlappingZones.map(zone => zone.id));
      const totalUniqueAddresses = uniqueAddresses.size;
      const allIncidents = overlappingZones.reduce((acc, zone) => [...acc, ...zone.incidents], []);
      
      const center = [
        overlappingZones.reduce((sum, zone) => sum + zone.center[0], 0) / overlappingZones.length,
        overlappingZones.reduce((sum, zone) => sum + zone.center[1], 0) / overlappingZones.length
      ];

      const zoneName = overlappingZones.length > 3 
        ? `Группа (${totalUniqueAddresses} адресов)` 
        : Array.from(uniqueAddresses).join(', ');

      mergedZones.push({
        id: zoneName,
        center,
        uniqueAddressCount: totalUniqueAddresses, // Для размера и цвета
        totalIncidents: allIncidents.length, // Общее количество инцидентов
        incidents: allIncidents,
        isHeatZone: true,
        addresses: Array.from(uniqueAddresses)
      });
    } else {
      mergedZones.push({
        ...currentZone,
        uniqueAddressCount: 1, // Один адрес
        totalIncidents: currentZone.incidents.length, // Сохраняем общее количество инцидентов
        isHeatZone: false
      });
    }
  }

  return mergedZones;
};

// Функция для определения цвета зоны и её прозрачности
const getZoneStyle = (zone) => {
  // Используем общее количество инцидентов для определения цвета
  const count = zone.totalIncidents;
  const isHeatZone = zone.isHeatZone;

  // Определяем цвета для разных уровней (от безопасного к опасному)
  const colors = {
    level1: '#2563eb', // Синий
    level2: '#3b82f6', // Светло-синий
    level3: '#f59e0b', // Оранжевый
    level4: '#f97316', // Ярко-оранжевый
    level5: '#ef4444', // Красный
    level6: '#dc2626'  // Тёмно-красный
  };

  // Определяем пороги для каждого уровня на основе общего количества инцидентов
  let color, opacity;
  
  if (count >= 10) {
    color = colors.level6;
    opacity = 0.8;
  } else if (count >= 8) {
    color = colors.level5;
    opacity = 0.7;
  } else if (count >= 6) {
    color = colors.level4;
    opacity = 0.65;
  } else if (count >= 4) {
    color = colors.level3;
    opacity = 0.6;
  } else if (count >= 2) {
    color = colors.level2;
    opacity = 0.55;
  } else {
    color = colors.level1;
    opacity = 0.5;
  }

  // Для тепловых зон увеличиваем насыщенность
  if (isHeatZone) {
    opacity += 0.1;
  }

  return { color, opacity };
};

const YandexHeatMap = ({ incidents, lastIncident, selectedIncident }) => {
  const [mapRef, setMapRef] = useState(null);
  const [heatZones, setHeatZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [mapState, setMapState] = useState(defaultState);
  const mapInstanceRef = useRef(null);
  const [currentZoom, setCurrentZoom] = useState(defaultState.zoom);
  const tooltipRef = useRef(null);
  const [tooltipContent, setTooltipContent] = useState(null);

  // Функция для геокодирования адреса
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?format=json&apikey=${YANDEX_MAPS_API_KEY}&geocode=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      
      if (data.response?.GeoObjectCollection?.featureMember?.length > 0) {
        const coords = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos
          .split(' ')
          .map(Number)
          .reverse();
        
        return {
          coordinates: coords,
          bounds: null
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Обработка нового инцидента
  useEffect(() => {
    if (!lastIncident || !mapRef) return;

    const processNewIncident = async () => {
      const geoData = await geocodeAddress(lastIncident.address);
      if (geoData) {
        setMapState({
          ...defaultState,
          center: geoData.coordinates,
          zoom: 16
        });
      }
    };

    processNewIncident();
  }, [lastIncident, mapRef]);

  // Обработка всех инцидентов
  useEffect(() => {
    const processIncidents = async () => {
      if (!incidents?.length) return;

      const zones = new Map();

      for (const incident of incidents) {
        const key = incident.address;
        if (!zones.has(key)) {
          zones.set(key, {
            incidents: [],
            coordinates: null
          });
        }
        zones.get(key).incidents.push(incident);
      }

      const processedZones = [];
      for (const [address, data] of zones) {
        const geoData = await geocodeAddress(address);
        if (geoData) {
          processedZones.push({
            id: address,
            center: geoData.coordinates,
            count: data.incidents.length,
            incidents: data.incidents
          });
        }
      }

      // Объединяем зоны с учетом текущего зума
      const mergedZones = mergeOverlappingZones(processedZones, currentZoom);
      setHeatZones(mergedZones);
    };

    processIncidents();
  }, [incidents, currentZoom]);

  // Обработка выбранного инцидента
  useEffect(() => {
    if (!selectedIncident || !mapRef) return;

    const showSelectedIncident = async () => {
      const geoData = await geocodeAddress(selectedIncident.address);
      if (geoData) {
        setMapState({
          ...defaultState,
          center: geoData.coordinates,
          zoom: 17
        });
      }
    };

    showSelectedIncident();
  }, [selectedIncident, mapRef]);

  const handleBalloonClose = () => {
    setSelectedZone(null);
  };

  // Обработчик изменения зума карты
  const handleBoundsChange = (e) => {
    if (mapInstanceRef.current) {
      const newZoom = mapInstanceRef.current.getZoom();
      if (newZoom !== currentZoom) {
        setCurrentZoom(newZoom);
      }
    }
  };

  // Обработчики для всплывающей подсказки
  const handleMouseEnter = (e, zone) => {
    if (tooltipRef.current) {
      const content = `
        <div style="padding: 8px; max-width: 250px;">
          <div style="font-weight: bold; margin-bottom: 4px;">
            ${zone.isHeatZone ? zone.id : 'Адрес: ' + zone.id}
          </div>
          <div>Количество инцидентов: ${zone.totalIncidents}</div>
          <div style="margin-top: 4px; font-size: 12px; color: #666;">
            ${zone.incidents.map(incident => `
              <div style="margin-top: 4px; padding-bottom: 4px; border-bottom: 1px solid #eee;">
                <div style="font-weight: 500;">${incident.address}</div>
                <div>Подъезд ${incident.entrance}, этаж ${incident.floor}</div>
                <div style="color: #888;">${incident.problemType}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      setTooltipContent(content);
      tooltipRef.current.style.display = 'block';
      
      // Обновляем позицию подсказки
      const mapContainer = document.querySelector('[class*="ymaps-2"][class*="-map"]');
      if (mapContainer) {
        const rect = mapContainer.getBoundingClientRect();
        const x = e.get('domEvent').originalEvent.clientX;
        const y = e.get('domEvent').originalEvent.clientY;
        
        tooltipRef.current.style.left = `${x + 10}px`;
        tooltipRef.current.style.top = `${y - 10}px`;
      }
    }
  };

  const handleMouseMove = (e) => {
    if (tooltipRef.current && tooltipRef.current.style.display === 'block') {
      const mapContainer = document.querySelector('[class*="ymaps-2"][class*="-map"]');
      if (mapContainer) {
        const x = e.get('domEvent').originalEvent.clientX;
        const y = e.get('domEvent').originalEvent.clientY;
        
        tooltipRef.current.style.left = `${x + 10}px`;
        tooltipRef.current.style.top = `${y - 10}px`;
      }
    }
  };

  const handleMouseLeave = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
      setTooltipContent(null);
    }
  };

  return (
    <div className="relative">
      <div style={mapStyle}>
        <div style={mapContainerStyle}>
          <YMaps 
            query={{ 
              apikey: YANDEX_MAPS_API_KEY,
              lang: 'ru_RU'
            }}
          >
            <YandexMap
              defaultState={defaultState}
              state={mapState}
              width="100%"
              height="100%"
              onLoad={(ymaps) => {
                setMapRef(ymaps);
                mapInstanceRef.current = ymaps;
              }}
              instanceRef={inst => {
                if (inst) {
                  mapInstanceRef.current = inst;
                }
              }}
              onBoundsChange={handleBoundsChange}
              modules={[
                'geocode',
                'control.ZoomControl',
                'control.FullscreenControl'
              ]}
            >
              {heatZones.map((zone) => (
                <React.Fragment key={zone.id}>
                  <Circle
                    geometry={[zone.center, getCircleRadius(zone.uniqueAddressCount, currentZoom)]}
                    options={{
                      fillColor: getZoneStyle(zone).color,
                      fillOpacity: getZoneStyle(zone).opacity,
                      strokeColor: getZoneStyle(zone).color,
                      strokeOpacity: 0.8,
                      strokeWidth: 2,
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedZone(zone)}
                    onMouseEnter={(e) => handleMouseEnter(e, zone)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  />
                  <div
                    ref={tooltipRef}
                    style={tooltipStyle}
                    dangerouslySetInnerHTML={{
                      __html: `
                        <div style="padding: 8px; max-width: 250px;">
                          <div style="font-weight: bold; margin-bottom: 4px;">
                            ${zone.isHeatZone ? zone.id : 'Адрес: ' + zone.id}
                          </div>
                          <div>Количество инцидентов: ${zone.totalIncidents}</div>
                          <div style="margin-top: 4px; font-size: 12px; color: #666;">
                            ${zone.incidents.map(incident => `
                              <div style="margin-top: 4px; padding-bottom: 4px; border-bottom: 1px solid #eee;">
                                <div style="font-weight: 500;">${incident.address}</div>
                                <div>Подъезд ${incident.entrance}, этаж ${incident.floor}</div>
                                <div style="color: #888;">${incident.problemType}</div>
                              </div>
                            `).join('')}
                          </div>
                        </div>
                      `
                    }}
                  />
                </React.Fragment>
              ))}
            </YandexMap>
          </YMaps>
        </div>
      </div>
    </div>
  );
};

export default YandexHeatMap; 