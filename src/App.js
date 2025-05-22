import React, { useState } from 'react';
import YandexHeatMap from './components/YandexHeatMap';
import IncidentList from './components/IncidentList';
import IncidentForm from './components/IncidentForm';

function App() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleAddIncident = (incident) => {
    const newIncident = {
      ...incident,
      timestamp: new Date().toISOString()
    };
    setIncidents([...incidents, newIncident]);
    setShowForm(false);
  };

  const handleDeleteIncident = (incidentToDelete) => {
    if (window.confirm('Вы уверены, что хотите удалить этот инцидент?')) {
      setIncidents(incidents.filter(incident => incident !== incidentToDelete));
    }
  };

  const handleSelectIncident = (incident) => {
    setSelectedIncident(incident);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Система управления инцидентами
          </h1>
        </div>
      </header>

      <main>
        <div className="relative">
          <IncidentList 
            incidents={incidents}
            onDelete={handleDeleteIncident}
            onSelect={handleSelectIncident}
          />
          
          <YandexHeatMap 
            incidents={incidents}
            lastIncident={incidents[incidents.length - 1]}
            selectedIncident={selectedIncident}
          />

          <button
            onClick={() => setShowForm(true)}
            className="fixed bottom-8 right-[calc(50vw+20px)] bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-20"
          >
            Создать инцидент
          </button>

          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full mx-4">
                <IncidentForm
                  onSubmit={handleAddIncident}
                  onClose={() => setShowForm(false)}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
