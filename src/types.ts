export type UserRole = 'super-admin' | 'company-admin' | 'supervisor' | 'guard';

export type Screen = 
  | 'login' 
  | 'dashboard' 
  | 'scanner' 
  | 'manual' 
  | 'success' 
  | 'denied' 
  | 'guest-entry' 
  | 'id-scan'
  | 'face-scan'
  | 'admin-companies'
  | 'company-sites'
  | 'company-users'
  | 'site-vehicles'
  | 'authorized-list-report'
  | 'banned-list';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  companyId?: string;
  siteId?: string;
}

export interface Company {
  id: string;
  name: string;
  adminId: string;
}

export interface Site {
  id: string;
  companyId: string;
  name: string;
  location: string;
}

export interface Vehicle {
  id: string;
  siteId: string;
  plateNumber: string;
  ownerName: string;
  parkingNumber?: string;
  vehicleNumber?: string;
  qrCode?: string;
  status: 'checked-in' | 'checked-out';
  lastScanTime?: Date;
}

export interface BannedUser {
  id: string;
  name: string;
  description: string; // For AI face matching
  photoUrl?: string;
}

export interface Resident {
  id: string;
  name: string;
  plateNumber: string;
  unit: string;
  photoUrl: string;
}

export interface GuestEntry {
  name: string;
  idType: string;
  idNumber: string;
  purpose: string;
  plateNumber: string;
  faceBase64?: string;
}

export interface AccessLog {
  id: string;
  timestamp: Date;
  plateNumber: string;
  status: 'granted' | 'denied';
  action: 'check-in' | 'check-out';
  residentName?: string;
  siteId?: string;
  companyName?: string;
  guardName?: string;
  guestDetails?: {
    idType: string;
    idNumber: string;
    purpose: string;
  };
}

export interface Stats {
  entries: number;
  denied: number;
}
