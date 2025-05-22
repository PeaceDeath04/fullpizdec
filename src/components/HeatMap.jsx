import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Rectangle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Компонент для управления видом карты
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);

  return null;
};

const HeatMap = ({ incidents, lastIncident }) => {
  const [heatZones, setHeatZones] = useState([]);
  const [mapCenter, setMapCenter] = useState([55.7558, 37.6173]); // Москва по умолчанию
  const [mapZoom, setMapZoom] = useState(13);
  const lastProcessedIncident = useRef(null);

  // Функция для преобразования адреса в координаты (геокодинг)
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      if (data && data[0]) {
        return {
          coordinates: [parseFloat(data[0].lat), parseFloat(data[0].lon)],
          boundingbox: data[0].boundingbox.map(coord => parseFloat(coord))
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Функция для создания квадрата вокруг точки
  const createRectangleBounds = (center, sizeDegrees = 0.001) => {
    return [
      [center[0] - sizeDegrees, center[1] - sizeDegrees],
      [center[0] + sizeDegrees, center[1] + sizeDegrees]
    ];
  };

  // Функция для определения цвета зоны на основе количества инцидентов
  const getZoneColor = (count) => {
    if (count >= 7) return '#ef4444'; // red
    if (count >= 4) return '#f97316'; // orange
    return '#facc15'; // yellow
  };

  // Обработка нового инцидента
  useEffect(() => {
    const processNewIncident = async () => {
      if (lastIncident && lastIncident !== lastProcessedIncident.current) {
        const geoData = await geocodeAddress(lastIncident.address);
        if (geoData) {
          // Обновляем центр и зум карты
          setMapCenter(geoData.coordinates);
          // Вычисляем оптимальный зум на основе boundingbox
          const latDiff = geoData.boundingbox[1] - geoData.boundingbox[0];
          const lonDiff = geoData.boundingbox[3] - geoData.boundingbox[2];
          const maxDiff = Math.max(latDiff, lonDiff);
          // Преобразуем разницу координат в примерный уровень зума
          const zoom = Math.floor(14 - Math.log2(maxDiff * 100));
          setMapZoom(Math.min(Math.max(zoom, 12), 18)); // Ограничиваем зум между 12 и 18
        }
        lastProcessedIncident.current = lastIncident;
      }
    };

    processNewIncident();
  }, [lastIncident]);

  // Обработка всех инцидентов и создание тепловых зон
  useEffect(() => {
    const processIncidents = async () => {
      const zones = new Map();

      // Группируем инциденты по адресу
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

      // Получаем координаты для каждой зоны
      const processedZones = [];
      for (const [address, data] of zones) {
        const geoData = await geocodeAddress(address);
        if (geoData) {
          processedZones.push({
            id: address,
            bounds: createRectangleBounds(geoData.coordinates),
            count: data.incidents.length,
            incidents: data.incidents,
            center: geoData.coordinates
          });
        }
      }

      setHeatZones(processedZones);
    };

    processIncidents();
  }, [incidents]);

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      style={{ height: '100%', width: '100%' }}
    >
      <MapController center={mapCenter} zoom={mapZoom} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {heatZones.map((zone) => (
        <Rectangle
          key={zone.id}
          bounds={zone.bounds}
          pathOptions={{
            color: getZoneColor(zone.count),
            fillColor: getZoneColor(zone.count),
            fillOpacity: 0.6,
            weight: 2
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold mb-2">{zone.id}</h3>
              <p className="text-sm">Количество инцидентов: {zone.count}</p>
              <ul className="mt-2 space-y-1">
                {zone.incidents.map((incident) => (
                  <li key={incident.id} className="text-sm">
                    <span className="font-medium">
                      Подъезд {incident.entrance}, этаж {incident.floor}
                    </span>
                    <br />
                    <span className="text-gray-600">{incident.problemType}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Popup>
        </Rectangle>
      ))}
    </MapContainer>
  );
};

export default HeatMap; 