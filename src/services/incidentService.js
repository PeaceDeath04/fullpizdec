const INCIDENTS_STORAGE_KEY = 'incidents';

export const incidentService = {
  // Получить все инциденты
  getAll: () => {
    try {
      const incidents = localStorage.getItem(INCIDENTS_STORAGE_KEY);
      return incidents ? JSON.parse(incidents) : [];
    } catch (error) {
      console.error('Error loading incidents:', error);
      return [];
    }
  },

  // Добавить новый инцидент
  create: (incident) => {
    try {
      const incidents = incidentService.getAll();
      const newIncident = {
        ...incident,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        status: 'Новая',
        updatedAt: null
      };
      
      incidents.push(newIncident);
      localStorage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(incidents));
      return newIncident;
    } catch (error) {
      console.error('Error creating incident:', error);
      throw new Error('Failed to create incident');
    }
  },

  // Обновить статус инцидента
  updateStatus: (id, status) => {
    try {
      const incidents = incidentService.getAll();
      const index = incidents.findIndex(inc => inc.id === id);
      
      if (index !== -1) {
        incidents[index] = {
          ...incidents[index],
          status,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(incidents));
        return incidents[index];
      }
      throw new Error('Incident not found');
    } catch (error) {
      console.error('Error updating incident:', error);
      throw new Error('Failed to update incident');
    }
  },

  // Удалить инцидент
  delete: (id) => {
    try {
      const incidents = incidentService.getAll();
      const filtered = incidents.filter(inc => inc.id !== id);
      localStorage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting incident:', error);
      throw new Error('Failed to delete incident');
    }
  }
}; 