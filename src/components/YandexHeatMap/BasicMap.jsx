import React, { useState, useEffect } from 'react';
import { YMaps, Map as YandexMap } from '@pbe/react-yandex-maps';
import { YANDEX_MAPS_API_KEY } from '../../config';

const mapStyle = {
  width: '100%',
  height: '100%'
};

const defaultState = {
  center: [55.7558, 37.6173],
  zoom: 13
};

const BasicMap = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    // Логируем состояние при монтировании
    console.log('BasicMap mounted');
    console.log('API Key:', YANDEX_MAPS_API_KEY);
    
    return () => {
      console.log('BasicMap unmounted');
      if (mapInstance) {
        console.log('Cleaning up map instance');
      }
    };
  }, [mapInstance]);

  const handleError = (err) => {
    try {
      console.log('Error object:', {
        message: err?.message,
        name: err?.name,
        stack: err?.stack,
        toString: err?.toString()
      });
      setError(err);
    } catch (e) {
      console.log('Error in handleError:', e);
      setError(new Error('Неизвестная ошибка при загрузке карты'));
    }
  };

  const handleLoad = (ymaps) => {
    console.log('Map loaded:', ymaps);
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <div className="font-bold mb-2">Ошибка загрузки карты:</div>
        <div className="mb-2">{error.message || 'Неизвестная ошибка'}</div>
        <button 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Перезагрузить страницу
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-10">
          Загрузка карты...
        </div>
      )}
      <YMaps 
        query={{
          apikey: YANDEX_MAPS_API_KEY,
          lang: 'ru_RU',
          load: 'package.full'
        }}
      >
        <div style={{ width: '100%', height: '400px' }}>
          <YandexMap
            defaultState={defaultState}
            style={mapStyle}
            onError={handleError}
            onLoad={handleLoad}
            instanceRef={(inst) => {
              console.log('Map instance:', inst);
              setMapInstance(inst);
            }}
            modules={['control.ZoomControl', 'control.FullscreenControl']}
          />
        </div>
      </YMaps>
    </div>
  );
};

export default BasicMap; 