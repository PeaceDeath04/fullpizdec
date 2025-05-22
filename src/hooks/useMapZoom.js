import { useState, useCallback } from 'react';

/**
 * Хук для управления зумом карты
 * @param {number} initialZoom - Начальный уровень зума
 * @returns {Object} - Объект с текущим зумом и функцией его обновления
 */
export const useMapZoom = (initialZoom) => {
  const [currentZoom, setCurrentZoom] = useState(initialZoom);

  const handleZoomChange = useCallback((newZoom) => {
    setCurrentZoom(newZoom);
  }, []);

  return {
    currentZoom,
    handleZoomChange
  };
}; 