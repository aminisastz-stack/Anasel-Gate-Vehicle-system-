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
  | 'company-residences'
  | 'site-vehicles'
  | 'authorized-list-report'
  | 'full-recent-logs'
  | 'banned-list'
  | 'company-settings';

export interface CompanySettings {
  enableGuestEntry: boolean;
  enableVehicleVerification: boolean;
  enableAuthorizedVehicles: boolean;
  enableBannedDatabase: boolean;
}

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
  settings?: CompanySettings;
}

export interface Site {
  id: string;
  companyId: string;
  name: string;
  location: string;
}

export interface Residence {
  id: string;
  companyId: string;
  name: string;
}

export interface Vehicle {
  id: string;
  siteId: string;
  companyId?: string;
  plateNumber: string;
  ownerName: string;
  parkingNumber?: string;
  vehicleNumber?: string;
  qrCode?: string;
  status: 'checked-in' | 'checked-out';
  lastScanTime?: Date;
  ownerPhotoUrl?: string;
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
