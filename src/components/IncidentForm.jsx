import React, { useState } from 'react';

const IncidentForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    address: '',
    entrance: '',
    floor: '',
    locationType: '', // тип помещения (квартира/общее помещение)
    location: '', // конкретное помещение
    apartment: '',
    problemType: '', // тип проблемы
    customProblem: '' // для своего варианта проблемы
  });

  // Типы помещений
  const locationTypes = [
    { id: 'apartment', label: 'Квартира' },
    { id: 'common', label: 'Общее помещение' }
  ];

  // Типы общих помещений
  const commonAreaTypes = [
    'Общий балкон',
    'Общий коридор',
    'Лестничная площадка',
    'Лифт',
    'Мусоропровод',
    'Подвал',
    'Чердак',
    'Техническое помещение',
    'Другое'
  ];

  // Типы проблем
  const problemTypes = [
    { id: 'leak', label: 'Протечка/Затопление' },
    { id: 'electricity', label: 'Проблемы с электричеством' },
    { id: 'heating', label: 'Отопление не работает' },
    { id: 'sewage', label: 'Канализация' },
    { id: 'structural', label: 'Повреждение конструкций' },
    { id: 'elevator', label: 'Неисправность лифта' },
    { id: 'garbage', label: 'Мусоропровод засорен' },
    { id: 'pest', label: 'Насекомые/Грызуны' },
    { id: 'other', label: 'Другое' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Сброс зависимых полей при изменении типа помещения
      if (name === 'locationType') {
        newData.location = '';
        newData.apartment = '';
      }

      // Сброс пользовательского описания проблемы при выборе стандартного типа
      if (name === 'problemType' && value !== 'other') {
        newData.customProblem = '';
      }

      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      // Формируем итоговое описание проблемы
      problemType: formData.problemType === 'other' 
        ? formData.customProblem 
        : problemTypes.find(p => p.id === formData.problemType)?.label || formData.problemType,
      // Формируем итоговое местоположение
      location: formData.locationType === 'apartment' 
        ? `Квартира ${formData.apartment}` 
        : formData.location
    };
    onSubmit(submissionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Создание инцидента</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Адрес*
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Введите адрес"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="entrance" className="block text-sm font-medium text-gray-700">
                  Подъезд*
                </label>
                <input
                  type="number"
                  id="entrance"
                  name="entrance"
                  required
                  min="1"
                  value={formData.entrance}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="№"
                />
              </div>

              <div>
                <label htmlFor="floor" className="block text-sm font-medium text-gray-700">
                  Этаж*
                </label>
                <input
                  type="number"
                  id="floor"
                  name="floor"
                  required
                  value={formData.floor}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="№"
                />
              </div>
            </div>

            <div>
              <label htmlFor="locationType" className="block text-sm font-medium text-gray-700">
                Тип помещения*
              </label>
              <select
                id="locationType"
                name="locationType"
                required
                value={formData.locationType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Выберите тип помещения</option>
                {locationTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>

            {formData.locationType === 'apartment' ? (
              <div>
                <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">
                  Номер квартиры*
                </label>
                <input
                  type="number"
                  id="apartment"
                  name="apartment"
                  required
                  value={formData.apartment}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="№ квартиры"
                />
              </div>
            ) : formData.locationType === 'common' ? (
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Общее помещение*
                </label>
                <select
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Выберите помещение</option>
                  {commonAreaTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            ) : null}

            <div>
              <label htmlFor="problemType" className="block text-sm font-medium text-gray-700">
                Тип проблемы*
              </label>
              <select
                id="problemType"
                name="problemType"
                required
                value={formData.problemType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Выберите тип проблемы</option>
                {problemTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>

            {formData.problemType === 'other' && (
              <div>
                <label htmlFor="customProblem" className="block text-sm font-medium text-gray-700">
                  Опишите проблему*
                </label>
                <input
                  type="text"
                  id="customProblem"
                  name="customProblem"
                  required
                  value={formData.customProblem}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Опишите проблему"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Создать
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IncidentForm; 