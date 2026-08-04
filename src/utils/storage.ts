import { UserProfile, Medicine } from '../types';

const USER_KEY = 'healix_user_profile';
const MEDICINES_KEY = 'healix_medicines';

export const storage = {
  getUser: (): UserProfile | null => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: UserProfile): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // Ignore write errors
    }
  },

  removeUser: (): void => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      // Ignore
    }
  },

  getMedicines: (): Medicine[] => {
    try {
      const data = localStorage.getItem(MEDICINES_KEY);
      if (!data) {
        // Return default demo medicines if none exist
        const defaultMeds: Medicine[] = [
          {
            id: 'med-1',
            name: 'Amoxicillin',
            dosage: '500mg',
            frequency: 'Twice daily',
            times: ['08:00 AM', '08:00 PM'],
            taken: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'med-2',
            name: 'Paracetamol',
            dosage: '650mg',
            frequency: 'As needed',
            times: ['02:00 PM'],
            taken: true,
            createdAt: new Date().toISOString(),
          }
        ];
        localStorage.setItem(MEDICINES_KEY, JSON.stringify(defaultMeds));
        return defaultMeds;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveMedicines: (medicines: Medicine[]): void => {
    try {
      localStorage.setItem(MEDICINES_KEY, JSON.stringify(medicines));
    } catch {
      // Ignore
    }
  },

  addMedicine: (med: Omit<Medicine, 'id' | 'createdAt'>): Medicine => {
    const medicines = storage.getMedicines();
    const newMed: Medicine = {
      ...med,
      id: 'med-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    medicines.unshift(newMed);
    storage.saveMedicines(medicines);
    return newMed;
  },

  updateMedicine: (id: string, updates: Partial<Medicine>): Medicine[] => {
    const medicines = storage.getMedicines();
    const updated = medicines.map((m) => (m.id === id ? { ...m, ...updates } : m));
    storage.saveMedicines(updated);
    return updated;
  },

  deleteMedicine: (id: string): Medicine[] => {
    const medicines = storage.getMedicines();
    const updated = medicines.filter((m) => m.id !== id);
    storage.saveMedicines(updated);
    return updated;
  }
};
