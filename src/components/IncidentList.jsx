import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StatusBadge = ({ status }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Новая':
        return 'bg-blue-100 text-blue-800';
      case 'В работе':
        return 'bg-yellow-100 text-yellow-800';
      case 'Завершена':
        return 'bg-green-100 text-green-800';
      case 'Отменена':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(status)}`}>
      {status}
    </span>
  );
};

const IncidentCard = ({ incident, isExpanded }) => {
  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <span className="font-medium">
          {incident.locationType === 'apartment' ? `Квартира ${incident.apartment}` : 'Общее помещение'}
        </span>
        <span className="text-gray-500">•</span>
        <span className="text-gray-600">Этаж {incident.floor}</span>
        {incident.locationType === 'common' && incident.location && (
          <>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">{incident.location}</span>
          </>
        )}
      </div>
      <p className="text-gray-700 mt-1">{incident.problemType}</p>
      <div className="text-xs text-gray-500 mt-1">
        {new Date(incident.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

const ExpandButton = ({ isExpanded, onClick }) => (
  <button
    onClick={onClick}
    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
    title={isExpanded ? "Свернуть" : "Развернуть"}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </button>
);

const GroupedIncidentCard = ({ address, incidents, onSelect, onDelete, isSelected, onToggleExpand }) => {
  const totalIncidents = incidents.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-all
        ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'hover:border-blue-500'}`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{address}</h3>
                <span className="text-sm text-gray-600">
                  {totalIncidents} {totalIncidents === 1 ? 'инцидент' : 
                    totalIncidents < 5 ? 'инцидента' : 'инцидентов'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ExpandButton
                  isExpanded={isSelected}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand();
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    incidents.forEach(incident => onDelete(incident));
                  }}
                  className="text-gray-400 hover:text-red-500 p-2 rounded hover:bg-red-50 transition-colors"
                  title="Удалить все инциденты по адресу"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div 
              onClick={() => onSelect(incidents[0])}
              className="cursor-pointer"
            >
              <AnimatePresence>
                {!isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3"
                  >
                    <IncidentCard incident={incidents[0]} isExpanded={false} />
                    {totalIncidents > 1 && (
                      <p className="text-sm text-blue-600">
                        + ещё {totalIncidents - 1} {totalIncidents - 1 === 1 ? 'инцидент' : 
                          totalIncidents - 1 < 5 ? 'инцидента' : 'инцидентов'}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 space-y-4 divide-y"
                  >
                    {incidents.map((incident, index) => (
                      <div 
                        key={index} 
                        className={index > 0 ? 'pt-4' : ''}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(incident);
                        }}
                      >
                        <IncidentCard incident={incident} isExpanded={true} />
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const IncidentList = ({ incidents, onDelete, onSelect }) => {
  const [selectedAddress, setSelectedAddress] = useState(null);

  const groupedIncidents = useMemo(() => {
    const groups = {};
    incidents.forEach(incident => {
      if (!groups[incident.address]) {
        groups[incident.address] = [];
      }
      groups[incident.address].push(incident);
    });
    return groups;
  }, [incidents]);

  return (
    <div className="w-[50vw] h-[calc(100vh-120px)] fixed left-0 bottom-0 bg-white overflow-auto z-10 border-r shadow-lg">
      <div className="p-6">
        <div className="sticky top-0 bg-white pb-4 border-b z-20">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Список инцидентов</h2>
            {selectedAddress && (
              <button
                onClick={() => setSelectedAddress(null)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
                Вернуться к списку
              </button>
            )}
          </div>
        </div>

        {Object.keys(groupedIncidents).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Нет активных инцидентов
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4 mt-4">
              {Object.entries(groupedIncidents).map(([address, addressIncidents]) => (
                (!selectedAddress || selectedAddress === address) && (
                  <GroupedIncidentCard
                    key={address}
                    address={address}
                    incidents={addressIncidents}
                    onSelect={onSelect}
                    onDelete={onDelete}
                    isSelected={selectedAddress === address}
                    onToggleExpand={() => setSelectedAddress(prev => prev === address ? null : address)}
                  />
                )
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default IncidentList; 