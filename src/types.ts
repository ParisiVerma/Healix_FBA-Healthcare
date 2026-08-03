export interface UserProfile {
  uid?: string;
  username: string;
  email: string;
  age: string;
  gender: string;
  weight: string; // in kg
  height: string; // in cm
  blood: string;
  photoURL?: string;
  isFirebaseUser?: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  taken: boolean;
  createdAt: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  rating: number;
  isOpenNow: boolean;
  phone: string;
  latitude: number;
  longitude: number;
  openHours: string;
  placeId?: string;
  vicinity?: string;
}

export interface SymptomAnalysis {
  title: string;
  severity: 'urgent' | 'warning' | 'info';
  description: string;
  recommendations: string[];
}

export type ActiveTab = 'dashboard' | 'medicines' | 'symptoms' | 'pharmacies' | 'health';

