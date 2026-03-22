/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Search, 
  History, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  User, 
  Car, 
  Home, 
  LogOut,
  Camera,
  Flashlight,
  ArrowRight,
  AlertCircle,
  UserPlus,
  IdCard,
  Loader2,
  FileText,
  Upload,
  Building2,
  Users,
  MapPin,
  ShieldAlert,
  Trash2,
  Plus,
  ShieldCheck,
  ScanEye,
  AlertTriangle,
  Scan,
  FileDown,
  Calendar,
  Settings,
  Keyboard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, Resident, AccessLog, Stats, GuestEntry, User as AppUser, Company, Site, Vehicle, BannedUser, UserRole, Residence } from './types';
import { GoogleGenAI, Type } from "@google/genai";
import Webcam from 'react-webcam';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QRCodeCanvas } from 'qrcode.react';
import jsQR from 'jsqr';

const MOCK_COMPANIES: Company[] = [
  { id: 'c1', name: 'SecureCorp Solutions', adminId: 'u2' },
  { id: 'c2', name: 'Global Guarding Inc', adminId: 'u5' },
];

const MOCK_SITES: Site[] = [
  { id: 's1', companyId: 'c1', name: 'North Gate Residential', location: '123 North St' },
  { id: 's2', companyId: 'c1', name: 'Industrial Park West', location: '456 West Ave' },
];

const MOCK_USERS: AppUser[] = [
  { id: 'u1', username: 'admin', role: 'super-admin' },
  { id: 'u2', username: 'cadmin', role: 'company-admin', companyId: 'c1' },
  { id: 'u3', username: 'super', role: 'supervisor', companyId: 'c1', siteId: 's1' },
  { id: 'u4', username: 'guard', role: 'guard', companyId: 'c1', siteId: 's1' },
];

const MOCK_BANNED: BannedUser[] = [
  { id: 'b1', name: 'Mark "The Shadow" Thompson', description: 'Known for trespassing and aggressive behavior. Tall, thin, often wears a black hoodie.', photoUrl: 'https://picsum.photos/seed/banned1/200/200' },
];

const MOCK_RESIDENT: Resident = {
  id: '1',
  name: 'John Anderson',
  plateNumber: 'T 122 ABB',
  unit: 'Unit 305',
  photoUrl: 'https://picsum.photos/seed/john/200/200'
};

const MOCK_LOGS: AccessLog[] = [
  { 
    id: '1', 
    timestamp: new Date(), 
    plateNumber: 'T 123 ABC', 
    status: 'granted', 
    residentName: 'John Anderson',
    companyName: 'SecureCorp Solutions',
    guardName: 'Officer guard',
    action: 'check-in'
  },
  { 
    id: '2', 
    timestamp: new Date(Date.now() - 15 * 60000), 
    plateNumber: 'T 999 XYZ', 
    status: 'denied',
    companyName: 'SecureCorp Solutions',
    guardName: 'Officer guard',
    action: 'check-in',
    guestDetails: {
      idType: 'National ID',
      idNumber: 'NID-8822',
      purpose: 'Delivery'
    }
  },
  { 
    id: '3', 
    timestamp: new Date(Date.now() - 45 * 60000), 
    plateNumber: 'T 567 DEF', 
    status: 'granted', 
    residentName: 'Sarah Miller',
    companyName: 'Global Guarding Inc',
    guardName: 'Officer g2',
    action: 'check-in'
  },
  { 
    id: '4', 
    timestamp: new Date(Date.now() - 120 * 60000), 
    plateNumber: 'T 101 GHI', 
    status: 'granted', 
    residentName: 'Michael Chen',
    companyName: 'Global Guarding Inc',
    guardName: 'Officer g2',
    action: 'check-in'
  },
  { id: '5', timestamp: new Date(Date.now() - 130 * 60000), plateNumber: 'T 202 JKL', status: 'granted', residentName: 'Michael Wilson', companyName: 'SecureCorp Solutions', guardName: 'Officer guard', action: 'check-in' },
  { id: '6', timestamp: new Date(Date.now() - 140 * 60000), plateNumber: 'T 334 MNO', status: 'denied', companyName: 'SecureCorp Solutions', guardName: 'Officer guard', action: 'check-in' },
  { id: '7', timestamp: new Date(Date.now() - 150 * 60000), plateNumber: 'T 556 PQR', status: 'granted', residentName: 'Laura Thompson', companyName: 'SecureCorp Solutions', guardName: 'Officer guard', action: 'check-in' },
  { id: '8', timestamp: new Date(Date.now() - 160 * 60000), plateNumber: 'T 778 STU', status: 'granted', residentName: 'David Lee', companyName: 'SecureCorp Solutions', guardName: 'Officer guard', action: 'check-in' },
  { id: '9', timestamp: new Date(Date.now() - 170 * 60000), plateNumber: 'T 990 VWX', status: 'denied', companyName: 'SecureCorp Solutions', guardName: 'Officer guard', action: 'check-in' },
  { id: '10', timestamp: new Date(Date.now() - 180 * 60000), plateNumber: 'T 112 YZA', status: 'granted', residentName: 'Emma White', companyName: 'SecureCorp Solutions', guardName: 'Officer guard', action: 'check-in' },
  { id: '11', timestamp: new Date(Date.now() - 190 * 60000), plateNumber: 'T 334 BCD', status: 'granted', residentName: 'James Brown', companyName: 'SecureCorp Solutions', guardName: 'Officer guard', action: 'check-in' },
  { id: '12', timestamp: new Date(Date.now() - 200 * 60000), plateNumber: 'T 556 EFG', status: 'denied', companyName: 'SecureCorp Solutions', guardName: 'Officer guard', action: 'check-in' },
  { id: '13', timestamp: new Date(Date.now() - 210 * 60000), plateNumber: 'T 778 HIJ', status: 'granted', residentName: 'Sophia Green', companyName: 'SecureCorp Solutions', guardName: 'Officer guard', action: 'check-in' },
];

const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', plateNumber: 'T 123 ABC', ownerName: 'John Doe', siteId: 's1', parkingNumber: 'P-101', vehicleNumber: 'AV-001', qrCode: 'QR-ABC1234', status: 'checked-out' },
  { id: 'v2', plateNumber: 'T 456 DEF', ownerName: 'Jane Smith', siteId: 's1', parkingNumber: 'P-102', vehicleNumber: 'AV-002', qrCode: 'QR-XYZ9876', status: 'checked-out' },
  { id: 'v3', plateNumber: 'T 789 GHI', ownerName: 'Robert Johnson', siteId: 's2', parkingNumber: 'VIP-1', vehicleNumber: 'AV-003', qrCode: 'QR-DEF5678', status: 'checked-out' },
  { id: 'v4', plateNumber: 'T 101 JKL', ownerName: 'Emily Davis', siteId: 's1', vehicleNumber: 'AV-004', qrCode: 'QR-GHI1011', status: 'checked-out' },
  { id: 'v5', plateNumber: 'T 202 MNO', ownerName: 'Michael Wilson', siteId: 's1', parkingNumber: 'P-105', vehicleNumber: 'AV-005', qrCode: 'QR-JKL2022', status: 'checked-out' },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [stats, setStats] = useState<Stats>({ entries: 142, denied: 8 });
  const [searchQuery, setSearchQuery] = useState('');
  const [deniedReason, setDeniedReason] = useState<string>('');
  const [verifiedResident, setVerifiedResident] = useState<{
    name: string;
    plateNumber: string;
    parkingNumber: string;
    unit?: string;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [dbStatus, setDbStatus] = useState<{status: 'checking' | 'connected' | 'error', message?: string}>({ status: 'checking' });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const isOnlineRef = useRef(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      isOnlineRef.current = true;
    };
    const handleOffline = () => {
      setIsOnline(false);
      isOnlineRef.current = false;
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      syncPendingLogs();
    }
  }, [isOnline]);

  const toggleFlashlight = async () => {
    const nextState = !isFlashlightOn;
    setIsFlashlightOn(nextState);

    // If webcam is active, try to control the torch
    if (webcamRef.current && webcamRef.current.video) {
      const stream = webcamRef.current.video.srcObject as MediaStream;
      if (stream) {
        const track = stream.getVideoTracks()[0];
        if (track) {
          try {
            // Check if getCapabilities exists (not supported in all browsers)
            const capabilities = typeof track.getCapabilities === 'function' ? track.getCapabilities() as any : {};
            
            // Even if we can't detect it, we can try to apply it
            // Some browsers support torch but don't list it in capabilities
            await track.applyConstraints({
              advanced: [{ torch: nextState }]
            } as any);
          } catch (err) {
            console.warn('Flashlight control not supported or failed:', err);
          }
        }
      }
    }
  };

  const syncPendingLogs = async () => {
    const { getPendingLogs, deletePendingLog } = await import('./db');
    const logs = await getPendingLogs();
    for (const log of logs) {
      try {
        await fetch('/api/verify-plate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(log)
        });
        await deletePendingLog(log.id);
      } catch (err) {
        console.error('Failed to sync log:', err);
      }
    }
  };

  const checkDbConnection = async () => {
    try {
      setDbStatus({ status: 'checking' });
      const response = await fetch('/api/db-status');
      if (response.ok) {
        setDbStatus({ status: 'connected' });
      } else {
        const data = await response.json();
        setDbStatus({ status: 'error', message: data.error || 'Connection failed' });
      }
    } catch (err) {
      setDbStatus({ status: 'error', message: String(err) });
    }
  };

  useEffect(() => {
    checkDbConnection();
  }, []);

  const fetchStats = async () => {
    try {
      const url = currentUser?.siteId ? `/api/stats?residenceId=${currentUser.siteId}` : '/api/stats';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // System relies on local logs for accurate realtime session stats
        // setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchStats();
    }
  }, [currentUser]);
  
  // Multi-tenant State
  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem('app_companies');
    return saved ? JSON.parse(saved) : MOCK_COMPANIES;
  });
  const [sites, setSites] = useState<Site[]>(() => {
    const saved = localStorage.getItem('app_sites');
    return saved ? JSON.parse(saved) : MOCK_SITES;
  });
  const [residences, setResidences] = useState<Residence[]>(() => {
    const saved = localStorage.getItem('app_residences');
    // Provide a default mock residence if empty
    return saved ? JSON.parse(saved) : [{ id: 'r1', name: 'Sample Residence', companyId: 'c1' }];
  });
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('app_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('app_vehicles');
    return saved ? JSON.parse(saved) : MOCK_VEHICLES;
  });
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>(() => {
    const saved = localStorage.getItem('app_banned');
    return saved ? JSON.parse(saved) : MOCK_BANNED;
  });
  const [logs, setLogs] = useState<AccessLog[]>(() => {
    const saved = localStorage.getItem('app_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((l: any) => ({
          ...l,
          timestamp: new Date(l.timestamp)
        }));
      } catch (e) {
        return MOCK_LOGS;
      }
    }
    return MOCK_LOGS;
  });

  useEffect(() => { localStorage.setItem('app_companies', JSON.stringify(companies)); }, [companies]);
  useEffect(() => { localStorage.setItem('app_sites', JSON.stringify(sites)); }, [sites]);
  useEffect(() => { localStorage.setItem('app_residences', JSON.stringify(residences)); }, [residences]);
  useEffect(() => { localStorage.setItem('app_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('app_vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('app_banned', JSON.stringify(bannedUsers)); }, [bannedUsers]);
  useEffect(() => { 
    localStorage.setItem('app_logs', JSON.stringify(logs)); 
    
    // Calculate today's stats from logs
    const today = new Date().toDateString();
    const todayLogs = logs.filter(log => new Date(log.timestamp).toDateString() === today);
    setStats({
      entries: todayLogs.filter(log => log.status === 'granted').length,
      denied: todayLogs.filter(log => log.status === 'denied').length
    });
  }, [logs]);

  // Guest Entry State
  const [guestData, setGuestData] = useState<GuestEntry>({
    name: '',
    idType: '',
    idNumber: '',
    purpose: '',
    plateNumber: ''
  });
  const [isProcessingID, setIsProcessingID] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null);
  const [isProcessingFace, setIsProcessingFace] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState<'qr' | 'plate' | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const qrDetectingRef = useRef(false);
  const plateDetectingRef = useRef(false);
  const profileCamRef = useRef<Webcam>(null);
  const [showProfileCam, setShowProfileCam] = useState<'add' | 'edit' | null>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const editProfilePhotoInputRef = useRef<HTMLInputElement>(null);
  const [faceAlert, setFaceAlert] = useState<{ name: string, reason: string } | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<'company' | 'site' | 'residence' | 'user' | 'vehicle' | 'banned' | null>(null);
  const [newItemData, setNewItemData] = useState<any>({});
  const [manualPlate, setManualPlate] = useState('');
  const [authorizedSearchQuery, setAuthorizedSearchQuery] = useState('');
  const [authorizedStatusFilter, setAuthorizedStatusFilter] = useState<'all' | 'checked-in' | 'checked-out'>('all');
  const [scannedVehicle, setScannedVehicle] = useState<Vehicle | null>(null);
  const [scannedLogs, setScannedLogs] = useState<AccessLog[]>([]);
  const [isScanningVehicle, setIsScanningVehicle] = useState<'qr' | 'plate' | null>(null);
  const [showKeypad, setShowKeypad] = useState(false);
  const [isManualInputFocused, setIsManualInputFocused] = useState(false);
  const [plateFormatError, setPlateFormatError] = useState<string | null>(null);

  // Tanzanian Plate Formatting & Validation
  const formatTanzanianPlate = (value: string) => {
    // Remove all non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    if (cleaned.length === 0) return '';
    
    let formatted = cleaned;
    
    // Ensure it starts with T
    if (!formatted.startsWith('T') && formatted.length > 0) {
      formatted = 'T' + formatted;
    }
    
    // Add space after T: T 123 ABC
    let result = '';
    if (formatted.length > 0) {
      result += formatted[0]; // T
      if (formatted.length > 1) {
        result += ' ' + formatted.slice(1, 4); // 123
        if (formatted.length > 4) {
          result += ' ' + formatted.slice(4, 7); // ABC
        }
      }
    }
    
    return result.trim().slice(0, 9);
  };

  const normalizePlate = (plate: string) => plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();

  const formatPlateForDisplay = (plate: string) => {
    const p = normalizePlate(plate);
    if (/^T\d{3}[A-Z]{3}$/.test(p)) {
      return `T ${p.slice(1,4)} ${p.slice(4,7)}`;
    }
    if (/^T\d{3}CD\d{3}$/.test(p)) {
      return `T ${p.slice(1,4)} CD ${p.slice(7,10)}`;
    }
    return p;
  };

  const isValidTanzanianPlate = (plate: string) => {
    const p = normalizePlate(plate);
    return /^T\d{3}[A-Z]{3}$/.test(p) || /^T\d{3}CD\d{3}$/.test(p);
  };
  const [scanDirection, setScanDirection] = useState<'in' | 'out'>('in');
  const [exportDateRange, setExportDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [exportResidenceFilter, setExportResidenceFilter] = useState<string[]>([]);
  const [exportSitePage, setExportSitePage] = useState(0); // Pagination for sites list in export modal
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);
  const manualPlateInputRef = useRef<HTMLInputElement>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [selectedVehicleForQR, setSelectedVehicleForQR] = useState<Vehicle | null>(null);
  const [recentLogsPage, setRecentLogsPage] = useState(1);
  const [authorizedLogsPage, setAuthorizedLogsPage] = useState(1);
  const [fullLogsPage, setFullLogsPage] = useState(1);
  const [fullLogsPerPage, setFullLogsPerPage] = useState(10);
  const logsPerPage = 5;
  const QR_SCAN_INTERVAL_MS = 200;
  const PLATE_SCAN_INTERVAL_MS = 1000;

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const isAuthorized = (item: any, type: 'company' | 'site' | 'user' | 'vehicle' | 'log') => {
    if (!currentUser) return false;
    if (currentUser.role === 'super-admin') return true;
    
    switch (type) {
      case 'company':
        return item.id === currentUser.companyId;
      case 'site':
        return item.companyId === currentUser.companyId;
      case 'user':
        return item.companyId === currentUser.companyId;
      case 'vehicle':
        const site = sites.find(s => s.id === item.siteId);
        return site?.companyId === currentUser.companyId;
      case 'log':
        const company = companies.find(c => c.id === currentUser.companyId);
        return item.companyName === company?.name;
      default:
        return false;
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    // Simple mock auth
    const user = users.find(u => u.username === username);
    if (user && password === username + '123') {
      setCurrentUser(user);
      navigate('dashboard');
    } else {
      alert('Invalid credentials. Use username and username123 (e.g. admin/admin123)');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('login');
    setShowAddModal(false);
    setShowExportModal(false);
    setExportSitePage(0);
    setShowCamera(false);
    setShowProfileCam(null);
    setAddModalType(null);
    setNewItemData({});
  };

  const handleScanVehicle = (type: 'qr' | 'plate') => {
    setCameraType(type);
    setShowCamera(true);
  };

  const decodeQRFromBase64 = (imageSrc: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        resolve(code?.data || null);
      };
      img.onerror = () => resolve(null);
      img.src = imageSrc;
    });
  };

  const decodePlateFromBase64 = async (imageSrc: string): Promise<string | null> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const base64Data = imageSrc.split(',')[1];
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: "Extract the license plate number from this car photo. Return only the plate number in JSON format." },
              { inlineData: { mimeType: "image/jpeg", data: base64Data } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              plateNumber: { type: Type.STRING }
            },
            required: ["plateNumber"]
          }
        }
      });
      const aiResult = JSON.parse(response.text || '{}');
      const plate = aiResult.plateNumber?.toUpperCase() || null;
      if (plate && isValidTanzanianPlate(plate)) return plate;
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (showCamera && cameraType === 'qr') {
      qrDetectingRef.current = true;
      const loop = async () => {
        if (!qrDetectingRef.current) return;
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
          const decoded = await decodeQRFromBase64(imageSrc);
          if (decoded) {
            qrDetectingRef.current = false;
            await processVehicleScan(imageSrc);
            return;
          }
        }
        setTimeout(loop, QR_SCAN_INTERVAL_MS);
      };
      loop();
      return () => {
        qrDetectingRef.current = false;
      };
    } else if (showCamera && cameraType === 'plate') {
      plateDetectingRef.current = true;
      const loop = async () => {
        if (!plateDetectingRef.current) return;
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
          const plate = await decodePlateFromBase64(imageSrc);
          if (plate) {
            plateDetectingRef.current = false;
            await processVehicleScan(imageSrc);
            return;
          }
        }
        setTimeout(loop, PLATE_SCAN_INTERVAL_MS);
      };
      loop();
      return () => {
        plateDetectingRef.current = false;
      };
    }
  }, [showCamera, cameraType]);

  const processVehicleScan = async (imageSrc: string) => {
    if (!cameraType) return;
    setIsScanningVehicle(cameraType);
    setShowCamera(false);

    try {
      let plate: string | undefined;
      let result: any = {};
      if (cameraType === 'qr') {
        const decoded = await decodeQRFromBase64(imageSrc);
        if (decoded) {
          try {
            const parsed = JSON.parse(decoded);
            result = parsed;
            const raw = (parsed.plate || parsed.plateNumber || '') as string;
            const normalized = normalizePlate(raw);
            plate = isValidTanzanianPlate(normalized) ? formatPlateForDisplay(normalized) : undefined;
          } catch {
            const normalized = normalizePlate(decoded);
            plate = isValidTanzanianPlate(normalized) ? formatPlateForDisplay(normalized) : undefined;
          }
        }
      } else {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const base64Data = imageSrc.split(',')[1];
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                { text: "Extract the license plate number from this car photo. Return only the plate number in JSON format." },
                { inlineData: { mimeType: "image/jpeg", data: base64Data } }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                plateNumber: { type: Type.STRING }
              },
              required: ["plateNumber"]
            }
          }
        });
        const aiResult = JSON.parse(response.text || '{}');
        const raw = aiResult.plateNumber || '';
        const normalized = normalizePlate(raw);
        plate = isValidTanzanianPlate(normalized) ? formatPlateForDisplay(normalized) : undefined;
      }

        if (plate) {
        // Find vehicle in authorized list (normalize for matching)
        const normalizedPlate = normalizePlate(plate);
        const foundVehicleIndex = vehicles.findIndex(v => normalizePlate(v.plateNumber) === normalizedPlate);
          const foundVehicle = foundVehicleIndex !== -1 ? vehicles[foundVehicleIndex] : null;
          
          // Determine check-in/check-out action
          const action = foundVehicle?.status === 'checked-in' ? 'check-out' : 'check-in';

          // Check if parking slot is occupied by another vehicle (only for check-in)
          const parkingNumber = foundVehicle?.parkingNumber || result.parking;
          const occupyingVehicle = action === 'check-in' && parkingNumber ? vehicles.find(v => 
            v.parkingNumber === parkingNumber && 
            v.plateNumber !== plate && 
            v.status === 'checked-in'
          ) : null;

          if (occupyingVehicle) {
            setDeniedReason(`Entrance Denied: Parking slot ${parkingNumber} is currently occupied by vehicle ${occupyingVehicle.plateNumber}. The previous vehicle must check out first.`);
            
            const deniedLog: AccessLog = {
              id: `log-${Date.now()}`,
              timestamp: new Date(),
              plateNumber: plate,
              status: 'denied',
              action: 'check-in',
            residentName: foundVehicle?.ownerName || result.owner || 'Unknown Visitor',
              companyName: currentUser?.companyName || 'SecureCorp Solutions',
              guardName: currentUser?.name || 'Officer guard'
            };

            setLogs(prev => [deniedLog, ...prev]);
            navigate('denied');
            return;
          }

          const newStatus = action === 'check-in' ? 'checked-in' : 'checked-out';

          const vehicleToLog: Vehicle = foundVehicle ? {
            ...foundVehicle,
            status: newStatus,
            lastScanTime: new Date()
          } : {
            id: `v-${Date.now()}`,
            siteId: currentUser?.siteId || 's1',
            plateNumber: plate,
            ownerName: result.ownerName || 'Unknown Visitor',
            parkingNumber: result.parkingNumber,
            vehicleNumber: result.vehicleNumber,
            status: newStatus,
            lastScanTime: new Date()
          };

          // Update vehicles state if it's a known vehicle or if we want to track visitors too
          if (foundVehicleIndex !== -1) {
            const updatedVehicles = [...vehicles];
            updatedVehicles[foundVehicleIndex] = vehicleToLog;
            setVehicles(updatedVehicles);
            localStorage.setItem('app_vehicles', JSON.stringify(updatedVehicles));
          }

          setScannedVehicle(vehicleToLog);

          const newLog: AccessLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date(),
            plateNumber: plate,
            status: foundVehicle ? 'granted' : 'denied',
            action: action,
            residentName: vehicleToLog.ownerName,
            companyName: currentUser?.companyName || 'SecureCorp Solutions',
            guardName: currentUser?.name || 'Officer guard'
          };

          setLogs(prev => [newLog, ...prev]);
          const history = logs.filter(l => normalizePlate(l.plateNumber) === normalizedPlate);
          setScannedLogs([newLog, ...history]);

        try {
          await fetch('/api/verify-plate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              plateNumber: plate,
              officerName: currentUser?.username || 'Officer Johnson',
              direction: action === 'check-in' ? 'in' : 'out',
              residenceId: currentUser?.siteId
            })
          });
        } catch {}
          // Handle navigation/state updates based on current screen
          if (currentScreen === 'dashboard') {
            navigate(foundVehicle ? 'success' : 'denied');
          } else if (currentScreen === 'manual') {
            setSearchQuery(plate);
          } else if (currentScreen === 'guest-entry') {
            setGuestData(prev => ({ ...prev, plateNumber: plate }));
          }
        }
    } catch (error) {
      console.error("Vehicle Scan Error:", error);
    } finally {
      setIsScanningVehicle(null);
      setCameraType(null);
    }
  };

  const handleManualPlateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPlate.trim()) return;

    const plate = manualPlate.trim().toUpperCase();
    
    // Validate Tanzanian format
    if (!isValidTanzanianPlate(plate)) {
      setPlateFormatError("Invalid format. Use T 123 ABC");
      setTimeout(() => setPlateFormatError(null), 3000);
      return;
    }

    const foundVehicleIndex = vehicles.findIndex(v => v.plateNumber === plate);
    const foundVehicle = foundVehicleIndex !== -1 ? vehicles[foundVehicleIndex] : null;
    
    // Determine check-in/check-out action
    const action = foundVehicle?.status === 'checked-in' ? 'check-out' : 'check-in';

    // Check if parking slot is occupied by another vehicle (only for check-in)
    const parkingNumber = foundVehicle?.parkingNumber;
    const occupyingVehicle = action === 'check-in' && parkingNumber ? vehicles.find(v => 
      v.parkingNumber === parkingNumber && 
      v.plateNumber !== plate && 
      v.status === 'checked-in'
    ) : null;

    if (occupyingVehicle) {
      setDeniedReason(`Entrance Denied: Parking slot ${parkingNumber} is currently occupied by vehicle ${occupyingVehicle.plateNumber}. The previous vehicle must check out first.`);
      
      const deniedLog: AccessLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        plateNumber: plate,
        status: 'denied',
        action: 'check-in',
        residentName: foundVehicle?.ownerName || 'Manual Entry',
        companyName: currentUser?.companyName || 'SecureCorp Solutions',
        guardName: currentUser?.name || 'Officer guard'
      };

      setLogs(prev => [deniedLog, ...prev]);
      setManualPlate('');
      setShowKeypad(false);
      navigate('denied');
      return;
    }

    const newStatus = action === 'check-in' ? 'checked-in' : 'checked-out';

    const vehicleToLog: Vehicle = foundVehicle ? {
      ...foundVehicle,
      status: newStatus,
      lastScanTime: new Date()
    } : {
      id: `v-${Date.now()}`,
      siteId: currentUser?.siteId || 's1',
      plateNumber: plate,
      ownerName: 'Manual Entry',
      vehicleNumber: 'MANUAL',
      status: newStatus,
      lastScanTime: new Date()
    };

    // Update vehicles state if it's a known vehicle
    if (foundVehicleIndex !== -1) {
      const updatedVehicles = [...vehicles];
      updatedVehicles[foundVehicleIndex] = vehicleToLog;
      setVehicles(updatedVehicles);
      localStorage.setItem('app_vehicles', JSON.stringify(updatedVehicles));
    }

    setScannedVehicle(vehicleToLog);
    setManualPlate('');
    setShowKeypad(false);

    const newLog: AccessLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      plateNumber: plate,
      status: foundVehicle ? 'granted' : 'denied',
      action: action,
      residentName: vehicleToLog.ownerName,
      siteId: vehicleToLog.siteId,
      companyName: currentUser?.companyName || 'SecureCorp Solutions',
      guardName: currentUser?.name || 'Officer guard'
    };

    setLogs(prev => [newLog, ...prev]);
    const history = logs.filter(l => l.plateNumber === plate);
    setScannedLogs([newLog, ...history]);
    
    if (foundVehicle) {
      navigate('success');
    } else {
      navigate('denied');
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const startDate = new Date(exportDateRange.start);
    const endDate = new Date(exportDateRange.end);
    endDate.setHours(23, 59, 59, 999);

    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      const inDateRange = logDate >= startDate && logDate <= endDate;
      const matchesSite = exportResidenceFilter.length === 0 || (log.siteId && exportResidenceFilter.includes(log.siteId));
      return inDateRange && matchesSite;
    });

    // Add title
    doc.setFontSize(22);
    doc.setTextColor(10, 25, 49); // Deep blue
    doc.text('Anasel Gate System', 14, 22);

    doc.setFontSize(16);
    const adminCompanyName = companies.find(c => c.id === currentUser?.companyId)?.name || 'Security Company';
    doc.text(adminCompanyName, 14, 30);
    
    doc.setFontSize(14);
    doc.text('Vehicle Activity Report', 14, 38);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Report Period: ${exportDateRange.start} to ${exportDateRange.end}`, 14, 46);
    if (exportResidenceFilter.length > 0) {
      const filteredSiteNames = exportResidenceFilter.map(id => sites.find(s => s.id === id)?.name || id).join(', ');
      doc.text(`Residence Filter: ${filteredSiteNames.substring(0, 100)}${filteredSiteNames.length > 100 ? '...' : ''}`, 14, 52);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 58);
      doc.text(`Generated by: ${currentUser?.name} (${currentUser?.role})`, 14, 64);
    } else {
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 52);
      doc.text(`Generated by: ${currentUser?.name} (${currentUser?.role})`, 14, 58);
    }

    const tableData = filteredLogs.map(log => [
      log.timestamp.toLocaleString(),
      log.plateNumber,
      log.residentName || 'Unknown Visitor',
      log.status.toUpperCase(),
      sites.find(s => s.id === log.siteId)?.name || log.companyName || 'N/A',
      log.guardName || 'N/A'
    ]);

    autoTable(doc, {
      startY: exportResidenceFilter.length > 0 ? 70 : 64,
      head: [['Timestamp', 'Plate Number', 'Resident/Visitor', 'Status', 'Res-company', 'Guard']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [10, 25, 49], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    // Manual blob download to ensure filename and extension
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vehicle-activity-report-${exportDateRange.start}-to-${exportDateRange.end}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    setExportSitePage(0); // Reset site pagination
  };

  const processFaceImage = async (base64Data: string) => {
    setIsProcessingFace(true);
    setFaceAlert(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const bannedDescriptions = bannedUsers.map(b => `${b.name}: ${b.description}`).join('\n');
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: `Check if the person in this photo matches any of the following banned individuals. If there is a match, return the name and the reason for the alert. If no match, return null. 
              Banned List:
              ${bannedDescriptions}
              
              Return the data in valid JSON format.` },
              { inlineData: { mimeType: "image/jpeg", data: base64Data.split(',')[1] } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              match: { type: Type.BOOLEAN },
              name: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["match"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      if (result.match) {
        setFaceAlert({ name: result.name, reason: result.reason });
      } else {
        navigate('guest-entry');
      }
    } catch (error) {
      console.error("Face Processing Error:", error);
      navigate('guest-entry');
    } finally {
      setIsProcessingFace(false);
    }
  };

  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        processFaceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };



  const handleManualCheck = async () => {
    if (!isOnlineRef.current) {
        const log: AccessLog = { 
          id: `log-${Date.now()}`,
          timestamp: new Date(),
          plateNumber: searchQuery.toUpperCase(),
          status: 'granted' as const,
          action: 'check-in' as const,
          residentName: 'Unknown Resident',
          siteId: currentUser?.siteId,
          companyName: currentUser?.companyName || 'SecureCorp Solutions',
          guardName: currentUser?.name || 'Officer guard'
        };
        const { savePendingLog } = await import('./db');
        await savePendingLog(log);
        setLogs(prev => [log, ...prev]);
        navigate('success');
        return;
    }

    try {
      const response = await fetch('/api/verify-plate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plateNumber: searchQuery.toUpperCase(),
          officerName: currentUser?.username || 'Officer Johnson',
          direction: scanDirection,
          residenceId: currentUser?.siteId
        })
      });
      const data = await response.json();
      await fetchStats(); // Update stats after manual check
      
      const newLog: AccessLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        plateNumber: searchQuery.toUpperCase(),
        status: data.status === 'Access Granted' ? 'granted' : 'denied',
        action: scanDirection === 'in' ? 'check-in' : 'check-out',
        residentName: data.ownerName || 'Unknown Visitor',
        siteId: currentUser?.siteId,
        companyName: currentUser?.companyName || 'SecureCorp Solutions',
        guardName: currentUser?.name || 'Officer guard'
      };
      setLogs(prev => [newLog, ...prev]);

      if (data.status === 'Access Granted') {
        setVerifiedResident({
          name: data.ownerName || 'Unknown Resident',
          plateNumber: data.plateNumber,
          parkingNumber: data.parkingNumber || 'N/A',
          unit: 'Unit 101' // Mock unit for now
        });
        navigate('success');
      } else {
        setDeniedReason(data.reason || 'Vehicle not registered');
        navigate('denied');
      }
    } catch (err) {
      console.error('API Error:', err);
      const log: AccessLog = { 
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        plateNumber: searchQuery.toUpperCase(),
        status: 'granted' as const,
        action: 'check-in' as const,
        residentName: 'Unknown Resident',
        siteId: currentUser?.siteId,
        companyName: currentUser?.companyName || 'SecureCorp Solutions',
        guardName: currentUser?.name || 'Officer guard'
      };
      const { savePendingLog } = await import('./db');
      await savePendingLog(log);
      setLogs(prev => [log, ...prev]);
      navigate('success');
    }
  };

  const processIDImage = async (base64Data: string) => {
    setIsProcessingID(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: "Extract the following details from this ID card image: Full Name, ID Type (e.g., Driver's License, National ID, Passport), and ID Number. Return the data in valid JSON format." },
              { inlineData: { mimeType: "image/jpeg", data: base64Data.split(',')[1] } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              idType: { type: Type.STRING },
              idNumber: { type: Type.STRING }
            },
            required: ["name", "idType", "idNumber"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setGuestData(prev => ({
        ...prev,
        name: result.name || '',
        idType: result.idType || '',
        idNumber: result.idNumber || ''
      }));
      navigate('guest-entry');
    } catch (error) {
      console.error("AI Processing Error:", error);
      alert("Failed to process ID. Please enter details manually.");
      navigate('guest-entry');
    } finally {
      setIsProcessingID(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        processIDImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Login Screen
  if (currentScreen === 'login') {
    return (
      <div className="min-h-screen bg-deep-blue flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-8 z-10"
        >
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl mb-4">
              <div className="p-4 bg-white rounded-2xl shadow-[0_0_20px_rgba(176,32,41,0.5)]">
                <div className="w-16 h-16 bg-[#b02029] rounded-2xl flex items-center justify-center">
                   <ShieldCheck className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Anasel Gate System</h1>
            <p className="text-white/60 font-medium">Verification System v1.0</p>
            
            <div className="flex items-center justify-center space-x-2 mt-4">
              <div className="relative w-2.5 h-2.5">
                <div className={`w-full h-full rounded-full ${
                  dbStatus.status === 'connected' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
                  dbStatus.status === 'checking' ? 'bg-yellow-500 animate-pulse' : 
                  'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                }`} />
                {dbStatus.status === 'checking' && (
                  <div className="absolute inset-0 rounded-full shimmer opacity-50" />
                )}
              </div>
              <span className="text-xs font-medium text-white/80">
                {dbStatus.status === 'connected' ? 'Database Connected' : 
                 dbStatus.status === 'checking' ? 'Checking Connection...' : 
                 'Database Disconnected'}
              </span>
              {dbStatus.status === 'error' && (
                <button 
                  onClick={checkDbConnection}
                  className="ml-2 text-xs text-blue-300 hover:text-blue-200 underline"
                >
                  Retry
                </button>
              )}
            </div>
            {dbStatus.status === 'error' && dbStatus.message && (
              <p className="text-[10px] text-red-300 mt-1 max-w-xs mx-auto break-words opacity-80">
                {dbStatus.message}
              </p>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  name="username"
                  placeholder="Officer ID / Username"
                  className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-white/50 transition-all shadow-lg"
                  required
                />
              </div>
              <div className="relative">
                <LogOut className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 rotate-90" />
                <input 
                  type="password" 
                  name="password"
                  placeholder="Access Password"
                  className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-white/50 transition-all shadow-lg"
                  required
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-white text-[#b02029] font-black py-5 rounded-[24px] shadow-xl hover:bg-slate-50 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
            >
              Login to System
            </button>
          </form>
        </motion.div>
        
        <div className="absolute bottom-8 text-white/40 text-sm font-medium">
          Secure Access Protocol Active
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-0 md:p-12 overflow-hidden selection:bg-[#b02029]/30">
      <div className="w-full h-full md:h-[90vh] bg-slate-50 flex flex-col max-w-md mx-auto shadow-[0_0_100px_rgba(0,0,0,0.5)] md:rounded-[48px] relative overflow-hidden border-8 border-slate-800 md:border-slate-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-slate-800 rounded-b-3xl z-[100] hidden md:block" />

      <AnimatePresence mode="wait">
        {currentScreen === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {currentUser?.role === 'guard' ? (
              /* Guard Dashboard (New Layout) */
              <div className="flex-1 flex flex-col bg-slate-50">
                {/* Header */}
                <div className="bg-[#b02029] p-6 pb-12 rounded-b-[40px] shadow-[0_10px_40px_rgba(176,32,41,0.3)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full shimmer opacity-10 pointer-events-none" />
                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg">
                        <User className="text-white w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Active Duty</p>
                        <h2 className="text-white font-black text-xl tracking-tight">
                          Officer {currentUser?.username}
                        </h2>
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleLogout}
                      className="p-3 bg-white/10 rounded-2xl text-white hover:bg-white/20 backdrop-blur-md transition-colors border border-white/10"
                    >
                      <LogOut className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-[32px]">
                      <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">Today's Entries</p>
                      <p className="text-white text-4xl font-bold">{stats.entries}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-[32px]">
                      <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">Denied Access</p>
                      <p className="text-white text-4xl font-bold">{stats.denied}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Access to Authorized List */}
                <div className="px-6 -mt-6">
                  <button 
                    onClick={() => navigate('authorized-list-report')}
                    className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-700">Authorized List</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 pt-8 space-y-8">
                    {/* Scanning Section */}
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleScanVehicle('qr')}
                        disabled={isScanningVehicle !== null}
                        className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-3 active:scale-95 transition-all disabled:opacity-50"
                      >
                        <div className="w-14 h-14 bg-blue-50 text-deep-blue rounded-2xl flex items-center justify-center">
                          {isScanningVehicle === 'qr' ? <Loader2 className="w-8 h-8 animate-spin" /> : <QrCode className="w-8 h-8 text-[#b02029]" />}
                        </div>
                        <span className="font-bold text-slate-700">Scan QR</span>
                      </button>
                      <button 
                        onClick={() => handleScanVehicle('plate')}
                        disabled={isScanningVehicle !== null}
                        className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-3 active:scale-95 transition-all disabled:opacity-50"
                      >
                        <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center">
                          {isScanningVehicle === 'plate' ? <Loader2 className="w-8 h-8 animate-spin" /> : <Scan className="w-8 h-8 text-[#b02029]" />}
                        </div>
                        <span className="font-bold text-slate-700">Scan Plate</span>
                      </button>
                    </div>

                    {/* Sticky Manual Entry Bar */}
                    <div className="sticky top-0 z-30 -mx-6 px-6 py-4 bg-slate-50/95 backdrop-blur-md border-b border-slate-100/50 shadow-sm">
                      <div className="relative">
                        <form 
                          onSubmit={handleManualPlateSubmit}
                          className={`bg-white p-4 rounded-[32px] shadow-lg border transition-all duration-300 flex items-center space-x-3 ${isManualInputFocused ? 'border-deep-blue ring-4 ring-deep-blue/5' : 'border-slate-100'}`}
                        >
                          <button 
                            type="button"
                            onClick={() => setShowKeypad(!showKeypad)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-all ${showKeypad ? 'bg-deep-blue text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                          >
                            <Keyboard className="w-6 h-6" />
                          </button>
                          <div className="flex-1 flex items-center">
                            <input 
                              ref={manualPlateInputRef}
                              type="text" 
                              placeholder="T 123 ABC"
                              value={manualPlate}
                              onFocus={() => setIsManualInputFocused(true)}
                              onBlur={() => setTimeout(() => setIsManualInputFocused(false), 200)}
                              onChange={(e) => {
                                const formatted = formatTanzanianPlate(e.target.value);
                                setManualPlate(formatted);
                                setPlateFormatError(null);
                              }}
                              className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium uppercase"
                            />
                            <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform duration-300 ${isManualInputFocused ? 'rotate-180' : ''}`} />
                          </div>
                          <button 
                            type="submit"
                            disabled={!manualPlate.trim()}
                            className="bg-[#d49a9a] text-white px-6 py-3 rounded-2xl font-bold text-sm active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                          >
                            Verify
                          </button>
                        </form>

                        {/* Error Message for Plate Format */}
                        <AnimatePresence>
                          {plateFormatError && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute -top-8 left-0 right-0 text-center"
                            >
                              <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                                {plateFormatError}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Plate Suggestions Dropdown */}
                        <AnimatePresence>
                          {isManualInputFocused && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[24px] shadow-2xl border border-slate-100 z-30 overflow-hidden max-h-64 overflow-y-auto"
                            >
                              {vehicles
                                .filter(v => 
                                  !manualPlate.trim() || 
                                  v.plateNumber.toUpperCase().includes(manualPlate.trim().toUpperCase())
                                )
                                .slice(0, 10)
                                .map(v => (
                                  <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => {
                                      setManualPlate(v.plateNumber);
                                      setShowKeypad(false);
                                      setIsManualInputFocused(false);
                                    }}
                                    className="w-full text-left px-6 py-4 hover:bg-slate-50 flex items-center justify-between transition-colors border-b border-slate-100 last:border-0"
                                  >
                                    <div className="flex items-center space-x-4">
                                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                                        <Car className="w-4 h-4 text-slate-400" />
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-800">{v.plateNumber}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{v.ownerName}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {v.vehicleNumber && (
                                        <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                          {v.vehicleNumber}
                                        </span>
                                      )}
                                      <ArrowRight className="w-4 h-4 text-slate-300" />
                                    </div>
                                  </button>
                                ))
                              }
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Custom Keypad */}
                    <AnimatePresence>
                      {showKeypad && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-white p-4 rounded-[32px] shadow-sm border border-slate-100 grid grid-cols-10 gap-2">
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(key => (
                              <button
                                key={key}
                                onClick={() => setManualPlate(prev => prev + key)}
                                className="h-12 bg-slate-50 rounded-xl font-bold text-slate-700 active:bg-slate-200 transition-colors"
                              >
                                {key}
                              </button>
                            ))}
                            {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map(key => (
                              <button
                                key={key}
                                onClick={() => setManualPlate(prev => prev + key)}
                                className="h-12 bg-slate-50 rounded-xl font-bold text-slate-700 active:bg-slate-200 transition-colors"
                              >
                                {key}
                              </button>
                            ))}
                            <div className="col-span-1" />
                            {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map(key => (
                              <button
                                key={key}
                                onClick={() => setManualPlate(prev => prev + key)}
                                className="h-12 bg-slate-50 rounded-xl font-bold text-slate-700 active:bg-slate-200 transition-colors"
                              >
                                {key}
                              </button>
                            ))}
                            <div className="col-span-1" />
                            <div className="col-span-2" />
                            {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map(key => (
                              <button
                                key={key}
                                onClick={() => setManualPlate(prev => prev + key)}
                                className="h-12 bg-slate-50 rounded-xl font-bold text-slate-700 active:bg-slate-200 transition-colors"
                              >
                                {key}
                              </button>
                            ))}
                            <button
                              onClick={() => setManualPlate(prev => prev.slice(0, -1))}
                              className="col-span-1 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center active:bg-rose-100 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Recent Logs Card */}
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                          <History className="text-slate-400 w-5 h-5" />
                          <h3 className="font-bold text-slate-800">Recent Logs</h3>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => setLogs([])}
                            className="flex items-center space-x-2 text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Clear</span>
                          </button>
                          <button 
                            onClick={() => setShowExportModal(true)}
                            className="flex items-center space-x-2 text-[#b02029] text-sm font-bold hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => navigate('full-recent-logs')}
                            className="p-1.5 text-[#b02029] hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {logs.slice(0, 5).map((log) => (
                          <div 
                            key={log.id} 
                            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                log.status === 'granted' ? 'bg-green-50 text-success-green' : 'bg-red-50 text-error-red'
                              }`}>
                                {log.status === 'granted' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{log.plateNumber}</p>
                                <p className="text-xs text-slate-400 font-medium">
                                  {log.residentName || 'Unknown Visitor'} • {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {log.action && (
                                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                      log.action === 'check-in' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                      {log.action === 'check-in' ? 'In' : 'Out'}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                log.status === 'granted' ? 'bg-green-100 text-success-green' : 'bg-red-100 text-error-red'
                              }`}>
                                {log.status === 'granted' ? 'Passed' : 'Denied'}
                              </div>
                              <Settings className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Admin Dashboard (Original Layout) */
              <>
                {/* Header */}
                <div className="bg-[#b02029] p-6 pb-12 rounded-b-[40px] shadow-[0_10px_40px_rgba(176,32,41,0.3)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full shimmer opacity-10 pointer-events-none" />
                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg">
                        <User className="text-white w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Secure Access</p>
                        <h2 className="text-white font-black text-xl tracking-tight">
                          {currentUser?.role === 'super-admin' ? 'Super Admin' : 
                          currentUser?.role === 'company-admin' ? 'Company Admin' :
                          currentUser?.role === 'supervisor' ? 'Site Supervisor' : 'Officer ' + currentUser?.username}
                        </h2>
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleLogout}
                      className="p-3 bg-white/10 rounded-2xl text-white hover:bg-white/20 backdrop-blur-md transition-colors border border-white/10"
                    >
                      <LogOut className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-3xl">
                      <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Today's Entries</p>
                      <p className="text-white text-3xl font-bold">{stats.entries}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-3xl">
                      <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Denied Access</p>
                      <p className="text-white text-3xl font-bold">{stats.denied}</p>
                    </div>
                  </div>
                </div>

                {/* Main Actions */}
                <div className="px-6 -mt-6 space-y-4">
                  {/* Super Admin Actions */}
                  {currentUser?.role === 'super-admin' && (
                    <div className="grid grid-cols-1 gap-4">
                      <motion.div 
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('admin-companies')}
                        className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center space-x-4 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="w-14 h-14 bg-blue-50 text-deep-blue rounded-2xl flex items-center justify-center">
                          <Building2 className="w-8 h-8" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800">Manage Companies</p>
                          <p className="text-xs text-slate-400 font-medium">Add and manage security companies</p>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Company Admin / Supervisor / Super Admin Actions */}
                  {(currentUser?.role === 'company-admin' || currentUser?.role === 'supervisor' || currentUser?.role === 'super-admin') && (
                    <div className="grid grid-cols-1 gap-4">
                      <motion.div 
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('company-sites')}
                        className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center space-x-4 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                          <MapPin className="w-8 h-8" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800">Manage Residence Companies</p>
                          <p className="text-xs text-slate-400 font-medium">Add and configure residence companies</p>
                        </div>
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('company-users')}
                        className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center space-x-4 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                          <Users className="w-8 h-8" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800">Manage Personnel</p>
                          <p className="text-xs text-slate-400 font-medium">Add supervisors and guards</p>
                        </div>
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('company-residences')}
                        className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center space-x-4 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                          <Building2 className="w-8 h-8" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800">Manage Residences</p>
                          <p className="text-xs text-slate-400 font-medium">Add and configure residence names</p>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Shared Actions (Authorized Vehicles & Banned Database) */}
                  {(currentUser?.role === 'company-admin' || currentUser?.role === 'supervisor' || currentUser?.role === 'super-admin') && (
                    <div className="grid grid-cols-1 gap-4">
                      <button 
                        onClick={() => navigate('site-vehicles')}
                        className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center space-x-4 active:scale-[0.98] transition-transform"
                      >
                        <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                          <Car className="w-8 h-8" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800">Authorized Vehicles</p>
                          <p className="text-xs text-slate-400 font-medium">Manage allowed plate numbers</p>
                        </div>
                      </button>
                      {(currentUser?.role === 'company-admin' || currentUser?.role === 'supervisor' || currentUser?.role === 'super-admin') && (
                        <button 
                          onClick={() => navigate('banned-list')}
                          className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center space-x-4 active:scale-[0.98] transition-transform"
                        >
                          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-slate-800">Banned Database</p>
                            <p className="text-xs text-slate-400 font-medium">Manage restricted individuals</p>
                          </div>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Super Admin Actions */}
                  {currentUser?.role === 'super-admin' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <motion.div 
                          whileHover={{ scale: 1.05, translateY: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleScanVehicle('qr')}
                          className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-3 cursor-pointer hover:shadow-md transition-shadow"
                        >
                          <div className="w-14 h-14 bg-blue-50 text-deep-blue rounded-2xl flex items-center justify-center">
                            <QrCode className="w-8 h-8 text-[#b02029]" />
                          </div>
                          <span className="font-bold text-slate-700">Scan QR</span>
                        </motion.div>
                        <motion.div 
                          whileHover={{ scale: 1.05, translateY: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleScanVehicle('plate')}
                          className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-3 cursor-pointer hover:shadow-md transition-shadow"
                        >
                          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                            <Car className="w-8 h-8 text-[#b02029]" />
                          </div>
                          <span className="font-bold text-slate-700">Scan Plate</span>
                        </motion.div>
                      </div>
                      <motion.div 
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('manual')}
                        className="w-full bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center space-x-4 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center">
                          <Search className="w-8 h-8 text-[#b02029]" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800">Manual Entry</p>
                          <p className="text-xs text-slate-400 font-medium">Type plate number manually</p>
                        </div>
                      </motion.div>

                      <motion.div 
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setGuestData({ name: '', idType: '', idNumber: '', purpose: '', plateNumber: '' });
                          navigate('guest-entry');
                        }}
                        className="w-full bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center space-x-4 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                          <UserPlus className="w-8 h-8 text-[#b02029]" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800">Guest Entry</p>
                          <p className="text-xs text-slate-400 font-medium">Register visitor with Face Recognition</p>
                        </div>
                      </motion.div>
                    </>
                  )}

                  {/* Vehicle Status Summary - For Super Admin */}
                  {currentUser?.role === 'super-admin' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-2">
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Checked In</p>
                          <p className="text-2xl font-black text-slate-800">{vehicles.filter(v => v.status === 'checked-in').length}</p>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-2">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                          <LogOut className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Checked Out</p>
                          <p className="text-2xl font-black text-slate-800">{vehicles.filter(v => v.status === 'checked-out').length}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Logs - For Supervisors and Super Admin */}
                  {(currentUser?.role === 'supervisor' || currentUser?.role === 'super-admin') && (
                    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 flex-1">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-2">
                          <History className="text-[#b02029] w-5 h-5" />
                          <h3 className="font-bold text-slate-800">Recent Logs</h3>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => setLogs([])}
                            className="flex items-center space-x-2 text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Clear</span>
                          </button>
                          <button 
                            onClick={() => setShowExportModal(true)}
                            className="flex items-center space-x-2 text-deep-blue text-sm font-bold hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors"
                          >
                            <FileDown className="w-4 h-4 text-[#b02029]" />
                          </button>
                          <button 
                            onClick={() => navigate('full-recent-logs')}
                            className="p-1.5 text-deep-blue hover:bg-blue-50 rounded-xl transition-colors"
                          >
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {logs.filter(log => isAuthorized(log, 'log')).slice((recentLogsPage - 1) * logsPerPage, recentLogsPage * logsPerPage).map((log) => (
                          <div 
                            key={log.id} 
                            onClick={() => currentUser?.role === 'super-admin' && setSelectedLog(log)}
                            className={`flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors ${currentUser?.role === 'super-admin' ? 'cursor-pointer' : ''}`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                log.status === 'granted' ? 'bg-green-50 text-success-green' : 'bg-red-50 text-error-red'
                              }`}>
                                {log.status === 'granted' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{log.plateNumber}</p>
                                <p className="text-xs text-slate-400 font-medium">
                                  {log.residentName || 'Unknown Visitor'} • {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {log.action && (
                                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                      log.action === 'check-in' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                      {log.action === 'check-in' ? 'In' : 'Out'}
                                    </span>
                                  )}
                                </p>
                                {currentUser?.role === 'super-admin' && (
                                  <p className="text-[10px] text-deep-blue font-semibold mt-1">
                                    {sites.find(s => s.id === log.siteId)?.name || log.companyName} • {log.guardName}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                log.status === 'granted' ? 'bg-green-100 text-success-green' : 'bg-red-100 text-error-red'
                              }`}>
                                {log.status === 'granted' ? 'Passed' : 'Denied'}
                              </div>
                              <Settings className="w-4 h-4 text-[#b02029]" />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Pagination Controls */}
                      {logs.length > logsPerPage && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                          <p className="text-sm text-slate-400 font-medium">
                            Showing {((recentLogsPage - 1) * logsPerPage) + 1} to {Math.min(recentLogsPage * logsPerPage, logs.length)} of {logs.length} entries
                          </p>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => setRecentLogsPage(prev => Math.max(prev - 1, 1))}
                              disabled={recentLogsPage === 1}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: Math.ceil(logs.length / logsPerPage) }).map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setRecentLogsPage(i + 1)}
                                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                                    recentLogsPage === i + 1 
                                      ? 'bg-deep-blue text-white' 
                                      : 'text-slate-400 hover:bg-slate-50'
                                  }`}
                                >
                                  {i + 1}
                                </button>
                              ))}
                            </div>
                            <button 
                              onClick={() => setRecentLogsPage(prev => Math.min(prev + 1, Math.ceil(logs.length / logsPerPage)))}
                              disabled={recentLogsPage === Math.ceil(logs.length / logsPerPage)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}



        {currentScreen === 'manual' && (
          <motion.div 
            key="manual"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="flex-1 bg-white flex flex-col"
          >
            <div className="bg-deep-blue p-6 pb-12 rounded-b-[40px] shadow-lg">
              <div className="flex items-center space-x-4 mb-8">
                <button 
                  onClick={() => navigate('dashboard')}
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-white font-bold text-xl">Manual Plate Check</h2>
              </div>

              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                    placeholder="Enter Plate Number"
                    className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-white/50 transition-all shadow-lg font-mono text-lg tracking-widest"
                  />
                </div>
                <button 
                  onClick={() => handleScanVehicle('plate')}
                  className="bg-white/10 text-white p-4 rounded-2xl border border-white/20 active:scale-95 transition-transform"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Quick Keyboard</h3>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', '0', 'DEL'].map((key) => (
                  <button 
                    key={key}
                    onClick={() => {
                      if (key === 'DEL') setSearchQuery(prev => prev.slice(0, -1));
                      else setSearchQuery(prev => prev + key);
                    }}
                    className="bg-slate-50 py-4 rounded-2xl font-bold text-slate-700 active:bg-slate-200 transition-colors border border-slate-100"
                  >
                    {key}
                  </button>
                ))}
              </div>

              <div className="mt-auto">
                <button 
                  onClick={handleManualCheck}
                  disabled={!searchQuery}
                  className="w-full bg-deep-blue text-white font-bold py-5 rounded-[24px] shadow-xl disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Verify Plate Number</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {currentScreen === 'guest-entry' && (
          <motion.div 
            key="guest-entry"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="flex-1 bg-slate-50 flex flex-col"
          >
            <div className="bg-deep-blue p-6 pb-8 rounded-b-[40px] shadow-lg">
              <div className="flex items-center space-x-4 mb-6">
                <button 
                  onClick={() => navigate('dashboard')}
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-white font-bold text-xl">Guest Registration</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate('id-scan')}
                  className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg flex flex-col items-center space-y-2 active:scale-[0.98] transition-all"
                >
                  <Scan className="w-6 h-6" />
                  <span className="text-xs font-bold">AI ID Scan</span>
                </button>
                <button 
                  onClick={() => faceInputRef.current?.click()}
                  disabled={isProcessingFace}
                  className="bg-slate-800 text-white p-4 rounded-2xl shadow-lg flex flex-col items-center space-y-2 active:scale-[0.98] transition-all relative overflow-hidden"
                >
                  {isProcessingFace ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6" />
                  )}
                  <span className="text-xs font-bold">{isProcessingFace ? 'Checking...' : 'Face Check'}</span>
                  <input 
                    type="file" 
                    ref={faceInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFaceUpload} 
                  />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              {faceAlert && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start space-x-3"
                >
                  <AlertTriangle className="text-red-600 w-6 h-6 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-bold">BANNED USER DETECTED</p>
                    <p className="text-red-600 text-sm font-medium">{faceAlert.name}: {faceAlert.reason}</p>
                    <button 
                      onClick={() => setFaceAlert(null)}
                      className="mt-2 text-xs bg-red-600 text-white px-3 py-1 rounded-lg font-bold"
                    >
                      Dismiss Alert
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Guest Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="text" 
                      value={guestData.name}
                      onChange={(e) => setGuestData({...guestData, name: e.target.value})}
                      placeholder="Full Name"
                      className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">ID Type</label>
                    <div className="relative">
                      <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="text" 
                        value={guestData.idType}
                        onChange={(e) => setGuestData({...guestData, idType: e.target.value})}
                        placeholder="e.g. License"
                        className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">ID Number</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="text" 
                        value={guestData.idNumber}
                        onChange={(e) => setGuestData({...guestData, idNumber: e.target.value})}
                        placeholder="ID #"
                        className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Vehicle Plate</label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="text" 
                        value={guestData.plateNumber}
                        onChange={(e) => setGuestData({...guestData, plateNumber: formatTanzanianPlate(e.target.value)})}
                        placeholder="T 122 ABB"
                        className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all shadow-sm font-mono"
                      />
                    </div>
                    <button 
                      onClick={() => handleScanVehicle('plate')}
                      type="button"
                      className="bg-slate-100 text-slate-600 p-4 rounded-2xl border border-slate-200 active:scale-95 transition-transform"
                    >
                      <Camera className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Purpose of Visit</label>
                  <textarea 
                    value={guestData.purpose}
                    onChange={(e) => setGuestData({...guestData, purpose: e.target.value})}
                    placeholder="e.g. Visiting Unit 204"
                    rows={3}
                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all shadow-sm resize-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => {
                    const newLog: AccessLog = {
                      id: `log-${Date.now()}`,
                      timestamp: new Date(),
                      plateNumber: guestData.plateNumber || 'N/A',
                      status: 'granted',
                      action: 'check-in',
                      residentName: guestData.name,
                      siteId: currentUser?.siteId,
                      companyName: currentUser?.companyName || 'SecureCorp Solutions',
                      guardName: currentUser?.name || 'Officer guard',
                      guestDetails: {
                        idType: guestData.idType,
                        idNumber: guestData.idNumber,
                        purpose: guestData.purpose
                      }
                    };
                    setLogs(prev => [newLog, ...prev]);
                    navigate('success');
                  }}
                  disabled={!guestData.name || !!faceAlert}
                  className="w-full bg-deep-blue text-white font-bold py-5 rounded-[24px] shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                >
                  Register Guest & Grant Access
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {currentScreen === 'admin-companies' && (
          <motion.div 
            key="admin-companies"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="flex-1 bg-slate-50 flex flex-col"
          >
            <div className="bg-deep-blue p-6 pb-8 rounded-b-[40px] shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <button onClick={() => navigate('dashboard')} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-white font-bold text-xl">Companies</h2>
                </div>
                <button 
                  onClick={() => {
                    setAddModalType('company');
                    setNewItemData({ name: '' });
                    setShowAddModal(true);
                  }}
                  className="p-3 bg-white/20 text-white rounded-2xl"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              {companies.filter(c => isAuthorized(c, 'company')).map(company => (
                <div key={company.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-50 text-deep-blue rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-[#b02029]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{company.name}</p>
                      <p className="text-xs text-slate-400 font-medium">ID: {company.id}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-4">
                          Residence Companies: {sites.filter(s => s.companyId === company.id).length}
                        </p>
                        <p className="text-[10px] text-indigo-600 font-semibold">
                          Supervisors: {users.filter(u => u.companyId === company.id && u.role === 'supervisor').map(u => u.username).join(', ') || 'None'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {currentScreen === 'company-sites' && (
          <motion.div 
            key="company-sites"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="flex-1 bg-slate-50 flex flex-col"
          >
            <div className="bg-deep-blue p-6 pb-8 rounded-b-[40px] shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <button onClick={() => navigate('dashboard')} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-white font-bold text-xl">Residence Companies</h2>
                </div>
                <button 
                  onClick={() => {
                    setAddModalType('site');
                    setNewItemData({ name: '', location: '', companyId: currentUser?.companyId || 'c1' });
                    setShowAddModal(true);
                  }}
                  className="p-3 bg-white/20 text-white rounded-2xl"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              {sites.filter(s => isAuthorized(s, 'site')).map(site => (
                <div key={site.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-[#b02029]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{site.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{site.location}</p>
                      {(currentUser?.role === 'super-admin' || currentUser?.role === 'company-admin') && (
                        <p className="text-[10px] text-deep-blue font-semibold mt-1">
                          {companies.find(c => c.id === site.companyId)?.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {currentScreen === 'company-residences' && (
          <motion.div 
            key="company-residences"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="flex-1 bg-slate-50 flex flex-col"
          >
            <div className="bg-deep-blue p-6 pb-8 rounded-b-[40px] shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <button onClick={() => navigate('dashboard')} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-white font-bold text-xl">Residence Names</h2>
                </div>
                <button 
                  onClick={() => {
                    setAddModalType('residence');
                    setNewItemData({ name: '', companyId: currentUser?.companyId || 'c1' });
                    setShowAddModal(true);
                  }}
                  className="p-3 bg-white/20 text-white rounded-2xl"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              {residences.filter(r => isAuthorized({ companyId: r.companyId } as any, 'site')).map(residence => (
                <div key={residence.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{residence.name}</p>
                      {(currentUser?.role === 'super-admin' || currentUser?.role === 'company-admin') && (
                        <p className="text-[10px] text-deep-blue font-semibold mt-1">
                          {companies.find(c => c.id === residence.companyId)?.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {currentScreen === 'company-users' && (
          <motion.div 
            key="company-users"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="flex-1 bg-slate-50 flex flex-col"
          >
            <div className="bg-deep-blue p-6 pb-8 rounded-b-[40px] shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <button onClick={() => navigate('dashboard')} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-white font-bold text-xl">Personnel</h2>
                </div>
                <button 
                  onClick={() => {
                    setAddModalType('user');
                    setNewItemData({ username: '', role: 'guard', companyId: currentUser?.companyId || 'c1', siteId: currentUser?.siteId || 's1' });
                    setShowAddModal(true);
                  }}
                  className="p-3 bg-white/20 text-white rounded-2xl"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              {users.filter(u => isAuthorized(u, 'user')).map(user => (
                <div key={user.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-[#b02029]" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{user.username}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">{user.role}</p>
                      </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-red-500">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {(user.role === 'guard' || user.role === 'supervisor') && (
                    <div className="pt-2 border-t border-slate-50">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">Assigned Site</label>
                      <select 
                        value={user.siteId || ''}
                        onChange={(e) => {
                          setUsers(users.map(u => u.id === user.id ? { ...u, siteId: e.target.value } : u));
                        }}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-sm text-slate-700 focus:ring-2 focus:ring-deep-blue/20 transition-all"
                      >
                        <option value="" disabled>Select a site</option>
                        {sites.filter(s => s.companyId === user.companyId).map(site => (
                          <option key={site.id} value={site.id}>{site.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {currentScreen === 'site-vehicles' && (
          <motion.div 
            key="site-vehicles"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="flex-1 bg-slate-50 flex flex-col"
          >
            <div className="bg-deep-blue p-6 pb-8 rounded-b-[40px] shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <button onClick={() => navigate('dashboard')} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-white font-bold text-xl">Authorized Vehicles</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowExportModal(true)}
                    className="p-3 bg-white/20 text-white rounded-2xl hover:bg-white/30 transition-colors"
                  >
                    <FileDown className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      setAddModalType('vehicle');
                      setNewItemData({ plateNumber: '', ownerName: '', parkingNumber: '', vehicleNumber: '', siteId: currentUser?.siteId || 's1' });
                      setShowAddModal(true);
                    }}
                    className="p-3 bg-white/20 text-white rounded-2xl"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button 
                onClick={() => navigate('authorized-list-report')}
                className="mt-4 w-full bg-white/10 backdrop-blur-md border border-white/20 text-white p-4 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="font-bold">Authorized List</span>
                </div>
                <ArrowRight className="w-5 h-5 opacity-50" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 pt-8 space-y-8">
                {/* Scanning Section */}
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleScanVehicle('qr')}
                    disabled={isScanningVehicle !== null}
                    className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-3 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <div className="w-14 h-14 bg-blue-50 text-deep-blue rounded-2xl flex items-center justify-center">
                      {isScanningVehicle === 'qr' ? <Loader2 className="w-8 h-8 animate-spin" /> : <QrCode className="w-8 h-8" />}
                    </div>
                    <span className="font-bold text-slate-700">Scan QR</span>
                  </button>
                  <button 
                    onClick={() => handleScanVehicle('plate')}
                    disabled={isScanningVehicle !== null}
                    className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-3 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center">
                      {isScanningVehicle === 'plate' ? <Loader2 className="w-8 h-8 animate-spin" /> : <Scan className="w-8 h-8" />}
                    </div>
                    <span className="font-bold text-slate-700">Scan Plate</span>
                  </button>
                </div>

                {/* Sticky Manual Entry Bar */}
                <div className="sticky top-0 z-30 -mx-6 px-6 py-4 bg-slate-50/95 backdrop-blur-md border-b border-slate-100/50 shadow-sm">
                  <div className="relative">
                    <form 
                      onSubmit={handleManualPlateSubmit}
                      className={`bg-white p-4 rounded-[32px] shadow-lg border transition-all duration-300 flex items-center space-x-3 ${isManualInputFocused ? 'border-deep-blue ring-4 ring-deep-blue/5' : 'border-slate-100'}`}
                    >
                      <button 
                        type="button"
                        onClick={() => setShowKeypad(!showKeypad)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-all ${showKeypad ? 'bg-deep-blue text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                      >
                        <Keyboard className="w-6 h-6" />
                      </button>
                      <div className="flex-1 flex items-center">
                        <input 
                          ref={manualPlateInputRef}
                          type="text" 
                          placeholder="T 123 ABC"
                          value={manualPlate}
                          onFocus={() => setIsManualInputFocused(true)}
                          onBlur={() => setTimeout(() => setIsManualInputFocused(false), 200)}
                          onChange={(e) => {
                            const formatted = formatTanzanianPlate(e.target.value);
                            setManualPlate(formatted);
                            setPlateFormatError(null);
                          }}
                          className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium uppercase"
                        />
                        <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform duration-300 ${isManualInputFocused ? 'rotate-180' : ''}`} />
                      </div>
                      <button 
                        type="submit"
                        disabled={!manualPlate.trim()}
                        className="bg-deep-blue text-white px-6 py-3 rounded-2xl font-bold text-sm active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                      >
                        Verify
                      </button>
                    </form>

                    {/* Error Message for Plate Format */}
                    <AnimatePresence>
                      {plateFormatError && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -top-8 left-0 right-0 text-center"
                        >
                          <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                            {plateFormatError}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Plate Suggestions Dropdown */}
                    <AnimatePresence>
                      {isManualInputFocused && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[24px] shadow-2xl border border-slate-100 z-30 overflow-hidden max-h-64 overflow-y-auto"
                        >
                          {vehicles
                            .filter(v => 
                              !manualPlate.trim() || 
                              v.plateNumber.toUpperCase().includes(manualPlate.trim().toUpperCase())
                            )
                            .slice(0, 10)
                            .map(v => (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => {
                                  setManualPlate(v.plateNumber);
                                  setShowKeypad(false);
                                  setIsManualInputFocused(false);
                                }}
                                className="w-full text-left px-6 py-4 hover:bg-slate-50 flex items-center justify-between transition-colors border-b border-slate-100 last:border-0"
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                                    <Car className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-800">{v.plateNumber}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{v.ownerName}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {v.vehicleNumber && (
                                    <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                      {v.vehicleNumber}
                                    </span>
                                  )}
                                  <ArrowRight className="w-4 h-4 text-slate-300" />
                                </div>
                              </button>
                            ))
                          }
                          {vehicles.filter(v => !manualPlate.trim() || v.plateNumber.toUpperCase().includes(manualPlate.trim().toUpperCase())).length === 0 && (
                            <div className="p-6 text-center text-slate-400">
                              <Car className="w-8 h-8 mx-auto mb-2 opacity-20" />
                              <p className="text-xs font-medium">No authorized vehicles found</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Custom Keypad */}
                <AnimatePresence>
                  {showKeypad && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white p-4 rounded-[32px] shadow-sm border border-slate-100 grid grid-cols-10 gap-2">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(key => (
                          <button
                            key={key}
                            onClick={() => setManualPlate(prev => prev + key)}
                            className="h-12 bg-slate-50 rounded-xl font-bold text-slate-700 active:bg-slate-200 transition-colors"
                          >
                            {key}
                          </button>
                        ))}
                        {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map(key => (
                          <button
                            key={key}
                            onClick={() => setManualPlate(prev => prev + key)}
                            className="h-12 bg-slate-50 rounded-xl font-bold text-slate-700 active:bg-slate-200 transition-colors"
                          >
                            {key}
                          </button>
                        ))}
                        <div className="col-span-1" />
                        {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map(key => (
                          <button
                            key={key}
                            onClick={() => setManualPlate(prev => prev + key)}
                            className="h-12 bg-slate-50 rounded-xl font-bold text-slate-700 active:bg-slate-200 transition-colors"
                          >
                            {key}
                          </button>
                        ))}
                        <div className="col-span-1" />
                        <div className="col-span-2" />
                        {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map(key => (
                          <button
                            key={key}
                            onClick={() => setManualPlate(prev => prev + key)}
                            className="h-12 bg-slate-50 rounded-xl font-bold text-slate-700 active:bg-slate-200 transition-colors"
                          >
                            {key}
                          </button>
                        ))}
                        <button
                          onClick={() => setManualPlate(prev => prev.slice(0, -1))}
                          className="col-span-1 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center active:bg-rose-100 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              {/* Scanned Vehicle Info */}
              {scannedVehicle && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                        <Car className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Scanned Vehicle</p>
                        <p className="font-bold text-slate-800 text-xl">{scannedVehicle.plateNumber}</p>
                        <p className="text-sm text-slate-500">{scannedVehicle.ownerName} {scannedVehicle.parkingNumber && `• Parking: ${scannedVehicle.parkingNumber}`}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setScannedVehicle(null)}
                      className="p-2 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Vehicle Logs */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <History className="text-slate-400 w-4 h-4" />
                      <h4 className="font-bold text-slate-800 text-sm">Vehicle History</h4>
                    </div>
                    
                    {scannedLogs.length > 0 ? (
                      <div className="space-y-3">
                        {scannedLogs.map((log) => (
                          <div 
                            key={log.id} 
                            className={`flex items-center justify-between p-4 rounded-2xl border border-slate-50 ${
                              (currentUser?.role === 'super-admin' || currentUser?.role === 'company-admin' || currentUser?.role === 'supervisor') ? 'bg-slate-50/50' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                log.status === 'granted' ? 'bg-green-50 text-success-green' : 'bg-red-50 text-error-red'
                              }`}>
                                {log.status === 'granted' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{log.timestamp.toLocaleDateString()} • {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                {(currentUser?.role === 'super-admin' || currentUser?.role === 'company-admin' || currentUser?.role === 'supervisor') && (
                                  <p className="text-[10px] text-deep-blue font-semibold mt-1">
                                    {sites.find(s => s.id === log.siteId)?.name || log.companyName} • {log.guardName}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              log.status === 'granted' ? 'bg-green-100 text-success-green' : 'bg-red-100 text-error-red'
                            }`}>
                              {log.status === 'granted' ? 'Passed' : 'Denied'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-slate-50 rounded-2xl">
                        <p className="text-slate-400 text-sm">No logs found for this vehicle</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Recent Activity Card */}
              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <History className="text-slate-400 w-5 h-5" />
                    <h3 className="font-bold text-slate-800">Recent Logs</h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setLogs([])}
                      className="flex items-center space-x-2 text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear</span>
                    </button>
                    <button 
                      onClick={() => setShowExportModal(true)}
                      className="flex items-center space-x-2 text-deep-blue text-sm font-bold hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => navigate('full-recent-logs')}
                      className="p-1.5 text-deep-blue hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {logs.slice((authorizedLogsPage - 1) * logsPerPage, authorizedLogsPage * logsPerPage).map((log) => (
                    <div 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          log.status === 'granted' ? 'bg-green-50 text-success-green' : 'bg-red-50 text-error-red'
                        }`}>
                          {log.status === 'granted' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{log.plateNumber}</p>
                          <p className="text-xs text-slate-400 font-medium">
                            {log.residentName || 'Unknown Visitor'} • {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {log.action && (
                              <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                log.action === 'check-in' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {log.action === 'check-in' ? 'In' : 'Out'}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-deep-blue font-semibold mt-1">
                            {sites.find(s => s.id === log.siteId)?.name || log.companyName} • {log.guardName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          log.status === 'granted' ? 'bg-green-100 text-success-green' : 'bg-red-100 text-error-red'
                        }`}>
                          {log.status === 'granted' ? 'Passed' : 'Denied'}
                        </div>
                        <Settings className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {logs.length > logsPerPage && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                    <p className="text-sm text-slate-400 font-medium">
                      Showing {((authorizedLogsPage - 1) * logsPerPage) + 1} to {Math.min(authorizedLogsPage * logsPerPage, logs.length)} of {logs.length} entries
                    </p>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setAuthorizedLogsPage(prev => Math.max(prev - 1, 1))}
                        disabled={authorizedLogsPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.ceil(logs.length / logsPerPage) }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setAuthorizedLogsPage(i + 1)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                              authorizedLogsPage === i + 1 
                                ? 'bg-deep-blue text-white' 
                                : 'text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => setAuthorizedLogsPage(prev => Math.min(prev + 1, Math.ceil(logs.length / logsPerPage)))}
                        disabled={authorizedLogsPage === Math.ceil(logs.length / logsPerPage)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

        {currentScreen === 'authorized-list-report' && (
          <motion.div 
            key="authorized-list-report"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="flex-1 bg-slate-50 flex flex-col"
          >
            <div className="bg-[#b02029] p-6 pb-12 rounded-b-[40px] shadow-lg">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate(currentUser?.role === 'guard' ? 'dashboard' : 'site-vehicles')} 
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-white font-bold text-xl">Authorized List Report</h2>
              </div>
              
              {/* Search and Filter Bar */}
              <div className="mt-6 flex gap-2">
                <input
                  type="text"
                  placeholder="Search plate or owner..."
                  value={authorizedSearchQuery}
                  onChange={(e) => setAuthorizedSearchQuery(e.target.value)}
                  className="flex-1 bg-white/10 text-white placeholder-white/50 border border-white/20 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <select
                  value={authorizedStatusFilter}
                  onChange={(e) => setAuthorizedStatusFilter(e.target.value as any)}
                  className="bg-white/10 text-white border border-white/20 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <option value="all" className="text-slate-900">All Status</option>
                  <option value="checked-in" className="text-slate-900">Checked-in</option>
                  <option value="checked-out" className="text-slate-900">Checked-out</option>
                </select>
              </div>
            </div>

            <div className="p-4 -mt-8 space-y-4 flex-1 overflow-y-auto pb-20">
              {vehicles
                .filter(v => isAuthorized(v, 'vehicle'))
                .filter(v => 
                  (authorizedStatusFilter === 'all' || v.status === authorizedStatusFilter) &&
                  (v.plateNumber.toLowerCase().includes(authorizedSearchQuery.toLowerCase()) || 
                   v.ownerName.toLowerCase().includes(authorizedSearchQuery.toLowerCase()))
                )
                .map((vehicle, index) => (
                <motion.div 
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-4 transition-all hover:shadow-md active:scale-[0.99]"
                >
                  {/* Top Section: Icon, Plate & Badge */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 flex items-center justify-center shrink-0 border border-slate-100">
                      {vehicle.ownerPhotoUrl ? (
                        <img src={vehicle.ownerPhotoUrl} alt={vehicle.ownerName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-300" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-xl font-black text-slate-900 leading-tight tracking-tight uppercase break-words">
                          {vehicle.plateNumber}
                        </h3>
                        
                        {vehicle.vehicleNumber && (
                          <div className="bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-xl text-center flex flex-col justify-center shrink-0 min-w-[60px]">
                            <span className="text-[10px] font-black text-slate-600 leading-none tracking-widest uppercase">{vehicle.vehicleNumber}</span>
                            <span className="text-[7px] font-black text-slate-400 leading-none mt-1 tracking-widest uppercase">Vehicle</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-400 font-semibold mt-1 truncate">
                        {vehicle.ownerName}
                      </p>
                    </div>
                  </div>
                  
                  {/* Divider */}
                  <div className="h-px bg-slate-50 w-full" />
                  
                  {/* Bottom Section: Details, Status & Actions */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-200 mr-2" />
                          Parking: {vehicle.parkingNumber || 'N/A'}
                        </div>
                        
                        <div className="pt-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            vehicle.status === 'checked-in' 
                              ? 'bg-amber-50 text-amber-600' 
                              : 'bg-emerald-50 text-emerald-500'
                          }`}>
                            <div className={`w-1 h-1 rounded-full mr-1.5 ${
                              vehicle.status === 'checked-in' ? 'bg-amber-400' : 'bg-emerald-400'
                            }`} />
                            {vehicle.status === 'checked-in' ? 'Occupied' : 'Available'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setSelectedVehicleForQR(vehicle)}
                          className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                        >
                          <QrCode className="w-5 h-5" />
                        </button>
                        {(currentUser?.role === 'super-admin' || currentUser?.role === 'company-admin' || currentUser?.role === 'supervisor') && (
                          <>
                            <button 
                              onClick={() => {
                                setEditingVehicle(vehicle);
                                setShowEditVehicleModal(true);
                              }}
                              className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all active:scale-90"
                            >
                              <Settings className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => {
                                setVehicles(prev => prev.filter(v => v.id !== vehicle.id));
                              }}
                              className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {vehicles
                .filter(v => isAuthorized(v, 'vehicle'))
                .filter(v => 
                  (authorizedStatusFilter === 'all' || v.status === authorizedStatusFilter) &&
                  (v.plateNumber.toLowerCase().includes(authorizedSearchQuery.toLowerCase()) || 
                   v.ownerName.toLowerCase().includes(authorizedSearchQuery.toLowerCase()))
                )
                .length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Car className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-medium">No vehicles match your search</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {currentScreen === 'banned-list' && (
          <motion.div 
            key="banned-list"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="flex-1 bg-slate-50 flex flex-col"
          >
            <div className="bg-deep-blue p-6 pb-8 rounded-b-[40px] shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <button onClick={() => navigate('dashboard')} className="p-2 bg-white/10 rounded-xl text-white">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-white font-bold text-xl">Banned List</h2>
                </div>
                <button 
                  onClick={() => {
                    setAddModalType('banned');
                    setNewItemData({ name: '', description: '', photoUrl: 'https://picsum.photos/seed/newbanned/200/200' });
                    setShowAddModal(true);
                  }}
                  className="p-3 bg-white/20 text-white rounded-2xl"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              {bannedUsers.map(user => (
                <div key={user.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 flex items-center space-x-4">
                  <img src={user.photoUrl} alt={user.name} className="w-16 h-16 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-red-500 font-medium">{user.description}</p>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {currentScreen === 'face-scan' && (
          <motion.div 
            key="face-scan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 bg-black relative flex flex-col"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)] z-0" />
            
            <div className="relative z-10 p-6 flex justify-between items-center">
              <button 
                onClick={() => navigate('dashboard')}
                className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h3 className="text-white font-bold">Face Recognition</h3>
              <div className="w-12" />
            </div>

            <div className="flex-1 flex items-center justify-center relative z-10 p-6">
              <div className="w-full aspect-square border-2 border-dashed border-white/50 rounded-full flex flex-col items-center justify-center space-y-4 bg-white/5 backdrop-blur-sm relative overflow-hidden">
                {isProcessingFace ? (
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                    <p className="text-blue-400 font-bold animate-pulse">Analyzing features...</p>
                  </div>
                ) : (
                  <>
                    <User className="w-24 h-24 text-white/20" />
                    <p className="text-white/60 text-center px-8 font-medium">Align face within the circle</p>
                    
                    {/* Scanning line */}
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)] z-20"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="relative z-10 p-12 space-y-4">
              <input 
                type="file" 
                accept="image/*" 
                ref={faceInputRef}
                onChange={handleFaceUpload}
                className="hidden"
              />
              <button 
                onClick={() => faceInputRef.current?.click()}
                className="w-full bg-white text-slate-900 font-bold py-5 rounded-[24px] shadow-xl flex items-center justify-center space-x-3 active:scale-[0.98] transition-all"
              >
                <Camera className="w-6 h-6" />
                <span>Capture Face</span>
              </button>
              <p className="text-white/40 text-center text-xs font-medium">Real-time comparison with banned database</p>
            </div>
          </motion.div>
        )}
        {currentScreen === 'id-scan' && (
          <motion.div 
            key="id-scan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 bg-black relative flex flex-col"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)] z-0" />
            
            <div className="relative z-10 p-6 flex justify-between items-center">
              <button 
                onClick={() => navigate('guest-entry')}
                className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h3 className="text-white font-bold">ID Scanner</h3>
              <div className="w-12" />
            </div>

            <div className="flex-1 flex items-center justify-center relative z-10 p-6">
              <div className="w-full aspect-[1.586/1] border-2 border-dashed border-white/50 rounded-2xl flex flex-col items-center justify-center space-y-4 bg-white/5 backdrop-blur-sm relative overflow-hidden">
                {isProcessingID ? (
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
                    <p className="text-emerald-400 font-bold animate-pulse">AI is reading ID details...</p>
                  </div>
                ) : (
                  <>
                    <IdCard className="w-16 h-16 text-white/30" />
                    <p className="text-white/60 text-center px-8 font-medium">Place ID card within the frame</p>
                    
                    {/* Corner accents */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />
                  </>
                )}
              </div>
            </div>

            <div className="relative z-10 p-12 space-y-4">
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-white text-slate-900 font-bold py-5 rounded-[24px] shadow-xl flex items-center justify-center space-x-3 active:scale-[0.98] transition-all"
              >
                <Upload className="w-6 h-6" />
                <span>Upload ID Photo</span>
              </button>
              <p className="text-white/40 text-center text-xs font-medium">AI will automatically fill the form after scanning</p>
            </div>
          </motion.div>
        )}

        {(currentScreen === 'success' || currentScreen === 'denied') && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className={`flex-1 flex flex-col p-6 ${
              currentScreen === 'success' ? 'bg-success-green' : 'bg-error-red'
            }`}
          >
            <div className="flex justify-start mb-8">
              <button 
                onClick={() => navigate('dashboard')}
                className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center space-y-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl"
              >
                {currentScreen === 'success' ? (
                  <CheckCircle2 className="w-20 h-20 text-success-green" />
                ) : (
                  <XCircle className="w-20 h-20 text-error-red" />
                )}
              </motion.div>

              <div className="text-center text-white space-y-2">
                <h2 className="text-3xl font-black tracking-tight uppercase">
                  {currentScreen === 'success' 
                    ? (scannedVehicle?.status === 'checked-in' ? 'Check-In Successful' : 'Check-Out Successful') 
                    : 'Access Denied'}
                </h2>
                <p className="text-white/80 font-medium">
                  {currentScreen === 'success' 
                    ? (scannedVehicle?.status === 'checked-in' ? 'Vehicle Entered Premises' : 'Vehicle Exited Premises') 
                    : 'Unregistered Vehicle Detected'}
                </p>
              </div>

              {currentScreen === 'success' ? (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="w-full bg-white rounded-[40px] p-8 shadow-2xl space-y-6"
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 rounded-3xl border-4 border-slate-50 overflow-hidden bg-slate-800 flex items-center justify-center flex-shrink-0">
                      {scannedVehicle?.ownerPhotoUrl ? (
                        <img src={scannedVehicle.ownerPhotoUrl} alt="Owner" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-1 w-full h-full">
                          <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-slate-300" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Resident Name</p>
                      <h3 className="text-xl font-bold text-slate-800">{verifiedResident?.name || scannedVehicle?.ownerName || MOCK_RESIDENT.name}</h3>
                      <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-deep-blue rounded-lg text-xs font-bold">
                        Verified Member
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-slate-400">
                        <Car className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Plate Number</span>
                      </div>
                      <p className="font-mono font-bold text-slate-700 text-lg">{verifiedResident?.plateNumber || MOCK_RESIDENT.plateNumber}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-slate-400">
                        <Home className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Parking Spot</span>
                      </div>
                      <p className="font-bold text-slate-700 text-lg">{scannedVehicle?.parkingNumber || verifiedResident?.parkingNumber || MOCK_RESIDENT.unit}</p>
                      {scannedVehicle?.parkingNumber && (
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mt-1 ${
                          scannedVehicle.status === 'checked-in' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {scannedVehicle.status === 'checked-in' ? 'Occupied' : 'Available'}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="w-full bg-white rounded-[40px] p-8 shadow-2xl space-y-6"
                >
                  <div className="flex items-center space-x-4 text-error-red bg-red-50 p-4 rounded-2xl">
                    <AlertCircle className="w-8 h-8 flex-shrink-0" />
                    <p className="font-bold text-sm leading-tight">
                      {deniedReason || `Vehicle plate ${searchQuery || scannedVehicle?.plateNumber || 'Unknown'} is not registered in the resident database.`}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Security Protocol</p>
                      <ul className="text-xs text-slate-600 space-y-2 font-medium">
                        <li className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1" />
                          <span>Request driver's identification</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1" />
                          <span>Log attempt in visitor registry</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1" />
                          <span>Contact resident for authorization</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="mt-8 space-y-3">
              <button 
                onClick={() => {
                  navigate('dashboard');
                }}
                className="w-full bg-white text-slate-900 font-bold py-5 rounded-[24px] shadow-xl active:scale-[0.98] transition-all"
              >
                {currentScreen === 'success' ? 'Finish & Return' : 'Return to Dashboard'}
              </button>
              {currentScreen === 'denied' && (
                <button 
                  onClick={() => navigate('manual')}
                  className="w-full bg-white/20 text-white font-bold py-5 rounded-[24px] backdrop-blur-md border border-white/20 active:scale-[0.98] transition-all"
                >
                  Try Manual Entry
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Modal for Scanning */}
      <AnimatePresence>
        {showCamera && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCamera(false)}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl z-10 overflow-hidden flex flex-col"
            >
              <div className="bg-deep-blue p-6 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    Scan {cameraType === 'qr' ? 'QR Code' : 'Plate Number'}
                  </h3>
                  <p className="text-white/60 text-xs font-medium">Position the {cameraType === 'qr' ? 'code' : 'plate'} within the frame</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={toggleFlashlight}
                    className={`w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 ${
                      isFlashlightOn 
                        ? 'bg-yellow-400 text-slate-900 shadow-[0_0_15px_rgba(250,204,21,0.4)]' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Flashlight className={`w-5 h-5 ${isFlashlightOn ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    onClick={() => setShowCamera(false)}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: "environment",
                    width: 1280,
                    height: 720
                  }}
                  disablePictureInPicture={true}
                  forceScreenshotSourceSize={false}
                  imageSmoothing={true}
                  mirrored={false}
                  onUserMedia={(stream) => {
                    if (isFlashlightOn) {
                      const track = stream.getVideoTracks()[0];
                      if (track) {
                        try {
                          // Try to apply torch even if capabilities check is uncertain
                          track.applyConstraints({
                            advanced: [{ torch: true }]
                          } as any).catch(e => console.warn('Initial torch failed:', e));
                        } catch (err) {
                          console.warn('Initial torch not supported:', err);
                        }
                      }
                    }
                  }}
                  onUserMediaError={() => {}}
                  screenshotQuality={0.92}
                  className="w-full h-full object-cover"
                />

                {/* Simulated Flashlight Glow in Modal */}
                {isFlashlightOn && (
                  <div className="absolute inset-0 pointer-events-none z-10 bg-white/5 mix-blend-overlay" />
                )}
                
                {/* Scanning Frame Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`${cameraType === 'qr' ? 'w-64 h-64' : 'w-3/4 h-1/2'} border-2 border-white/50 rounded-2xl relative transition-all duration-300`}>
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-deep-blue -mt-1 -ml-1 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-deep-blue -mt-1 -mr-1 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-deep-blue -mb-1 -ml-1 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-deep-blue -mb-1 -mr-1 rounded-br-lg" />
                    
                    {/* Scanning Line Animation */}
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-0.5 bg-deep-blue/50 shadow-[0_0_15px_rgba(10,37,64,0.8)]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 flex flex-col items-center">
                <button 
                  onClick={() => {
                    const imageSrc = webcamRef.current?.getScreenshot();
                    if (imageSrc) {
                      processVehicleScan(imageSrc);
                    }
                  }}
                  className="w-20 h-20 bg-deep-blue rounded-full flex items-center justify-center text-white shadow-xl active:scale-90 transition-all hover:bg-deep-blue/90"
                >
                  <Camera className="w-10 h-10" />
                </button>
                <p className="mt-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  {cameraType === 'qr' ? 'Auto scanning… Hold QR steady in the frame' : 'Auto scanning… Hold plate steady; use good lighting'}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Photo Camera Modal */}
      <AnimatePresence>
        {showProfileCam && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileCam(null)}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl z-10 overflow-hidden flex flex-col"
            >
              <div className="bg-deep-blue p-6 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Take Profile Photo</h3>
                  <p className="text-white/60 text-xs font-medium">Position face within the square frame</p>
                </div>
                <button
                  onClick={() => setShowProfileCam(null)}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="relative bg-black flex items-center justify-center overflow-hidden" style={{ aspectRatio: '1/1' }}>
                <Webcam
                  audio={false}
                  ref={profileCamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: 'user', width: 480, height: 480 }}
                  mirrored={true}
                  screenshotQuality={0.92}
                  disablePictureInPicture={true}
                  forceScreenshotSourceSize={false}
                  imageSmoothing={true}
                  onUserMedia={() => {}}
                  onUserMediaError={() => {}}
                  className="w-full h-full object-cover"
                />
                {/* Square crop guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-56 h-56 border-2 border-white/60 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white -mt-1 -ml-1 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white -mt-1 -mr-1 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white -mb-1 -ml-1 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white -mb-1 -mr-1 rounded-br-lg" />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 flex flex-col items-center">
                <button
                  onClick={() => {
                    const imageSrc = profileCamRef.current?.getScreenshot();
                    if (imageSrc) {
                      if (showProfileCam === 'add') {
                        setNewItemData(prev => ({...prev, ownerPhotoUrl: imageSrc}));
                      } else if (showProfileCam === 'edit' && editingVehicle) {
                        setEditingVehicle(prev => prev ? {...prev, ownerPhotoUrl: imageSrc} : prev);
                      }
                      setShowProfileCam(null);
                    }
                  }}
                  className="w-20 h-20 bg-deep-blue rounded-full flex items-center justify-center text-white shadow-xl active:scale-90 transition-all hover:bg-deep-blue/90"
                >
                  <Camera className="w-10 h-10" />
                </button>
                <p className="mt-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">Tap to Capture Photo</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-sm rounded-t-[40px] sm:rounded-[40px] shadow-2xl z-10 overflow-hidden flex flex-col"
            >
              <div className="bg-[#b02029] p-8 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full shimmer opacity-10 pointer-events-none" />
                <h3 className="text-2xl font-black uppercase tracking-tight relative z-10">
                  {addModalType === 'site' ? 'New Residence Co' : 
                   addModalType === 'residence' ? 'New Residence' : 
                   'Add New ' + addModalType}
                </h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1 relative z-10">Secure Entry Protocol</p>
              </div>
              
              <div className="p-8 space-y-4">
                {addModalType === 'company' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Company Name</label>
                      <input 
                        type="text" 
                        value={newItemData.name}
                        onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all"
                        placeholder="e.g. Acme Security"
                      />
                    </div>
                  </div>
                )}

                {addModalType === 'residence' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Residence Name</label>
                      <input 
                        type="text" 
                        value={newItemData.name}
                        onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all"
                        placeholder="e.g. Green Valley Estate"
                      />
                    </div>
                  </div>
                )}

                {addModalType === 'site' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Company Name</label>
                      <input 
                        type="text" 
                        value={newItemData.name}
                        onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all"
                        placeholder="e.g. North Gate"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Select Residence Name</label>
                      <select 
                        value={newItemData.location || ''}
                        onChange={(e) => setNewItemData({...newItemData, location: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all"
                      >
                        <option value="">Select a residence</option>
                        {residences
                          .filter(r => currentUser?.role === 'super-admin' ? r.companyId === newItemData.companyId : r.companyId === currentUser?.companyId)
                          .map(r => (
                          <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {addModalType === 'user' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
                      <input 
                        type="text" 
                        value={newItemData.username}
                        onChange={(e) => setNewItemData({...newItemData, username: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all"
                        placeholder="e.g. officer_smith"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                      <input 
                        type="password" 
                        value={newItemData.password || ''}
                        onChange={(e) => setNewItemData({...newItemData, password: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all"
                        placeholder="Enter password"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Role</label>
                      <select 
                        value={newItemData.role}
                        onChange={(e) => setNewItemData({...newItemData, role: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all"
                      >
                        <option value="guard">Guard</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="company-admin">Company Admin</option>
                      </select>
                    </div>
                    {(newItemData.role === 'guard' || newItemData.role === 'supervisor') && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Assigned Site</label>
                        <select 
                          value={newItemData.siteId || ''}
                          onChange={(e) => setNewItemData({...newItemData, siteId: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all"
                        >
                          <option value="" disabled>Select a site</option>
                          {sites.filter(s => s.companyId === newItemData.companyId).map(site => (
                            <option key={site.id} value={site.id}>{site.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {addModalType === 'vehicle' && (
                  <div className="space-y-4">
                    {/* Owner Profile Photo */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Owner Profile Photo</label>
                      <div className="flex flex-col items-center space-y-3">
                        {/* Square photo preview */}
                        <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-800 flex items-center justify-center border-2 border-slate-200 shadow-inner relative group">
                          {newItemData.ownerPhotoUrl ? (
                            <img src={newItemData.ownerPhotoUrl} alt="Owner" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                                <User className="w-7 h-7 text-slate-300" />
                              </div>
                              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">No Photo</span>
                            </div>
                          )}
                          {newItemData.ownerPhotoUrl && (
                            <button
                              type="button"
                              onClick={() => setNewItemData({...newItemData, ownerPhotoUrl: ''})}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XCircle className="w-3 h-3 text-white" />
                            </button>
                          )}
                        </div>
                        {/* Action buttons */}
                        <div className="flex space-x-2 w-full">
                          <input
                            ref={profilePhotoInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => setNewItemData({...newItemData, ownerPhotoUrl: ev.target?.result as string});
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => profilePhotoInputRef.current?.click()}
                            className="flex-1 flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowProfileCam('add')}
                            className="flex-1 flex items-center justify-center space-x-1.5 bg-deep-blue hover:bg-deep-blue/90 text-white font-bold text-xs py-3 rounded-xl transition-colors"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Camera</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Select Company Resident</label>
                      <select 
                        value={newItemData.companyId || ''}
                        onChange={(e) => setNewItemData({...newItemData, companyId: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all"
                      >
                        <option value="">No Residence Company</option>
                        {sites.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Authorized Vehicle Number</label>
                      <input 
                        type="text" 
                        value={newItemData.vehicleNumber}
                        onChange={(e) => setNewItemData({...newItemData, vehicleNumber: e.target.value.toUpperCase()})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all font-mono"
                        placeholder="AV-001"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Plate Number</label>
                      <input 
                        type="text" 
                        value={newItemData.plateNumber}
                        onChange={(e) => setNewItemData({...newItemData, plateNumber: formatTanzanianPlate(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all font-mono"
                        placeholder="T 122 ABB"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Owner Name</label>
                      <input 
                        type="text" 
                        value={newItemData.ownerName}
                        onChange={(e) => setNewItemData({...newItemData, ownerName: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Dedicated Parking Number</label>
                      <input 
                        type="text" 
                        value={newItemData.parkingNumber}
                        onChange={(e) => setNewItemData({...newItemData, parkingNumber: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all"
                        placeholder="e.g. P-101"
                      />
                    </div>

                    {newItemData.plateNumber && (
                      <div className="mt-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col items-center space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Generated QR Code</p>
                        <div className="bg-white p-4 rounded-2xl shadow-sm">
                          <QRCodeCanvas 
                            id="vehicle-qr"
                            value={JSON.stringify({
                              plate: newItemData.plateNumber,
                              owner: newItemData.ownerName,
                              parking: newItemData.parkingNumber,
                              vehicleNumber: newItemData.vehicleNumber,
                              siteId: currentUser?.siteId || 's1'
                            })}
                            size={160}
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                        <button 
                          onClick={() => {
                            const canvas = document.getElementById('vehicle-qr') as HTMLCanvasElement;
                            if (canvas) {
                              const url = canvas.toDataURL('image/png');
                              const link = document.createElement('a');
                              link.download = `QR_${newItemData.plateNumber}.png`;
                              link.href = url;
                              link.click();
                            }
                          }}
                          className="flex items-center space-x-2 text-deep-blue font-bold text-sm hover:opacity-80 transition-opacity"
                        >
                          <FileDown className="w-4 h-4" />
                          <span>Download QR Code</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {addModalType === 'banned' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                      <input 
                        type="text" 
                        value={newItemData.name}
                        onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all"
                        placeholder="e.g. Jane Smith"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Reason</label>
                      <input 
                        type="text" 
                        value={newItemData.description}
                        onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all"
                        placeholder="e.g. Unauthorized access"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 space-y-3">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                    if (addModalType === 'company') {
                        const newCompany: Company = { id: `c${companies.length + 1}`, name: newItemData.name, adminId: 'u1' };
                        setCompanies([...companies, newCompany]);
                      } else if (addModalType as any === 'residence') {
                        const newResidence: Residence = { id: `r${residences.length + 1}`, companyId: newItemData.companyId, name: newItemData.name };
                        setResidences([...residences, newResidence]);
                      } else if (addModalType === 'site') {
                        const newSite: Site = { id: `s${sites.length + 1}`, companyId: newItemData.companyId, name: newItemData.name, location: newItemData.location };
                        setSites([...sites, newSite]);
                      } else if (addModalType === 'user') {
                        const newUser: AppUser = { 
                          id: `u${users.length + 1}`, 
                          username: newItemData.username, 
                          role: newItemData.role as any, 
                          companyId: newItemData.companyId, 
                          siteId: (newItemData.role === 'guard' || newItemData.role === 'supervisor') ? newItemData.siteId : undefined 
                        };
                        setUsers([...users, newUser]);
                      } else if (addModalType === 'vehicle') {
                        const newVehicle: Vehicle = { 
                          id: `v${vehicles.length + 1}`, 
                          companyId: newItemData.companyId,
                          plateNumber: newItemData.plateNumber, 
                          ownerName: newItemData.ownerName, 
                          siteId: newItemData.siteId || currentUser?.siteId || 's1',
                          parkingNumber: newItemData.parkingNumber,
                          vehicleNumber: newItemData.vehicleNumber,
                          qrCode: `QR-${newItemData.plateNumber}`,
                          status: 'checked-out',
                          ownerPhotoUrl: newItemData.ownerPhotoUrl || undefined
                        };
                        setVehicles([...vehicles, newVehicle]);
                      } else if (addModalType === 'banned') {
                        const newBanned: BannedUser = { id: `b${bannedUsers.length + 1}`, name: newItemData.name, description: newItemData.description, photoUrl: newItemData.photoUrl };
                        setBannedUsers([...bannedUsers, newBanned]);
                      }
                      setShowAddModal(false);
                    }}
                    className="w-full bg-[#b02029] text-white font-bold py-5 rounded-[24px] shadow-lg shadow-red-900/20 active:scale-[0.98] transition-all"
                  >
                    Save {addModalType === 'site' ? 'Residence Company' : addModalType === 'residence' ? 'Residence Name' : addModalType}
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddModal(false)}
                    className="w-full bg-slate-100 text-slate-600 font-bold py-5 rounded-[24px] active:scale-[0.98] transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Vehicle Modal */}
      <AnimatePresence>
        {showEditVehicleModal && editingVehicle && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditVehicleModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-sm rounded-t-[40px] sm:rounded-[40px] shadow-2xl z-10 overflow-hidden flex flex-col"
            >
              <div className="bg-[#b02029] p-8 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full shimmer opacity-10 pointer-events-none" />
                <h3 className="text-2xl font-black uppercase tracking-tight relative z-10">Edit Vehicle</h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1 relative z-10">ID: {editingVehicle?.id}</p>
              </div>
              
              <div className="p-8 space-y-4">
                {/* Owner Profile Photo (Edit) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Owner Profile Photo</label>
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-800 flex items-center justify-center border-2 border-slate-200 shadow-inner relative group">
                      {editingVehicle.ownerPhotoUrl ? (
                        <img src={editingVehicle.ownerPhotoUrl} alt="Owner" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                            <User className="w-7 h-7 text-slate-300" />
                          </div>
                          <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">No Photo</span>
                        </div>
                      )}
                      {editingVehicle.ownerPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setEditingVehicle({...editingVehicle, ownerPhotoUrl: ''})}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XCircle className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </div>
                    <div className="flex space-x-2 w-full">
                      <input
                        ref={editProfilePhotoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setEditingVehicle({...editingVehicle, ownerPhotoUrl: ev.target?.result as string});
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => editProfilePhotoInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setShowProfileCam('edit')}
                        className="flex-1 flex items-center justify-center space-x-1.5 bg-[#b02029] hover:bg-[#901a21] text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Camera</span>
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Select Company Resident</label>
                  <select 
                    value={editingVehicle.companyId || ''}
                    onChange={(e) => setEditingVehicle({...editingVehicle, companyId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all"
                  >
                    <option value="">No Residence Company</option>
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Authorized Vehicle Number</label>
                  <input 
                    type="text" 
                    value={editingVehicle.vehicleNumber || ''}
                    onChange={(e) => setEditingVehicle({...editingVehicle, vehicleNumber: e.target.value.toUpperCase()})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all font-mono"
                    placeholder="AV-001"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Plate Number</label>
                  <input 
                    type="text" 
                    value={editingVehicle.plateNumber}
                    onChange={(e) => setEditingVehicle({...editingVehicle, plateNumber: formatTanzanianPlate(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all font-mono"
                    placeholder="T 122 ABB"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Owner Name</label>
                  <input 
                    type="text" 
                    value={editingVehicle.ownerName}
                    onChange={(e) => setEditingVehicle({...editingVehicle, ownerName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Dedicated Parking Number</label>
                  <input 
                    type="text" 
                    value={editingVehicle.parkingNumber || ''}
                    onChange={(e) => setEditingVehicle({...editingVehicle, parkingNumber: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-deep-blue/20 transition-all"
                    placeholder="e.g. P-101"
                  />
                </div>

                <div className="pt-4 space-y-3">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? editingVehicle : v));
                      setShowEditVehicleModal(false);
                    }}
                    className="w-full bg-[#b02029] text-white font-bold py-5 rounded-[24px] shadow-lg shadow-red-900/20 active:scale-[0.98] transition-all"
                  >
                    Save Changes
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowEditVehicleModal(false)}
                    className="w-full bg-slate-100 text-slate-600 font-bold py-5 rounded-[24px] active:scale-[0.98] transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Vehicle QR Modal */}
      <AnimatePresence>
        {selectedVehicleForQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVehicleForQR(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl z-10 overflow-hidden"
            >
              <div className="bg-deep-blue p-8 text-white text-center">
                <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Vehicle QR Code</h3>
                <p className="text-white/60 text-sm">{selectedVehicleForQR.plateNumber}</p>
              </div>

              <div className="p-8 flex flex-col items-center space-y-6">
                <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100">
                  <QRCodeCanvas 
                    id="vehicle-qr-report"
                    value={JSON.stringify({
                      plate: selectedVehicleForQR.plateNumber,
                      owner: selectedVehicleForQR.ownerName,
                      parking: selectedVehicleForQR.parkingNumber,
                      siteId: selectedVehicleForQR.siteId
                    })}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                <div className="w-full space-y-3">
                  <button 
                    onClick={() => {
                      const canvas = document.getElementById('vehicle-qr-report') as HTMLCanvasElement;
                      if (canvas) {
                        const url = canvas.toDataURL('image/png');
                        const link = document.createElement('a');
                        link.download = `QR_${selectedVehicleForQR.plateNumber}.png`;
                        link.href = url;
                        link.click();
                      }
                    }}
                    className="w-full bg-deep-blue text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg active:scale-[0.98] transition-all"
                  >
                    <FileDown className="w-5 h-5" />
                    <span>Download QR Code</span>
                  </button>
                  <button 
                    onClick={() => setSelectedVehicleForQR(null)}
                    className="w-full bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl active:scale-[0.98] transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Modals */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl z-10 overflow-hidden"
            >
              <div className="bg-deep-blue p-8 text-white text-center relative">
                <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4 ${
                  selectedLog.status === 'granted' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {selectedLog.status === 'granted' ? 
                    <ShieldCheck className="w-10 h-10 text-green-400" /> : 
                    <ShieldAlert className="w-10 h-10 text-red-400" />
                  }
                </div>
                <h3 className="text-2xl font-bold">Log Details</h3>
                <p className="text-white/60 text-sm">{selectedLog.timestamp.toLocaleString()}</p>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Car className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Vehicle Info</p>
                      <p className="font-bold text-slate-800 text-lg">{selectedLog.plateNumber}</p>
                      <p className="text-sm text-slate-500">{selectedLog.residentName || 'Visitor'}</p>
                    </div>
                  </div>

                  {selectedLog.guestDetails && (
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IdCard className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Guest Details</p>
                        <p className="font-bold text-slate-800">{selectedLog.guestDetails.idType}</p>
                        <p className="text-sm text-slate-500">ID: {selectedLog.guestDetails.idNumber}</p>
                        <p className="text-sm text-slate-500 mt-1 italic">" {selectedLog.guestDetails.purpose} "</p>
                      </div>
                    </div>
                  )}

                  <div className="h-px bg-slate-100 my-4" />

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-deep-blue" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Authorized Vehicle Number</p>
                      <p className="font-bold text-slate-800">{vehicles.find(v => v.plateNumber === selectedLog.plateNumber)?.vehicleNumber || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Attending Guard</p>
                      <p className="font-bold text-slate-800">{selectedLog.guardName}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedLog(null)}
                  className="w-full bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {currentScreen === 'full-recent-logs' && (
          <motion.div 
            key="full-recent-logs"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="flex-1 bg-slate-50 flex flex-col"
          >
            <div className="bg-deep-blue p-6 pb-12 rounded-b-[40px] shadow-lg">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate('dashboard')} 
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-white font-bold text-xl">Full Recent Logs</h2>
              </div>
            </div>

            <div className="p-4 -mt-8 space-y-4 flex-1 overflow-y-auto pb-20">
              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                <div className="space-y-4">
                  {logs
                    .slice((fullLogsPage - 1) * fullLogsPerPage, fullLogsPage * fullLogsPerPage)
                    .map((log) => (
                    <div 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          log.status === 'granted' ? 'bg-green-50 text-success-green' : 'bg-red-50 text-error-red'
                        }`}>
                          {log.status === 'granted' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{log.plateNumber}</p>
                          <p className="text-xs text-slate-400 font-medium">
                            {log.residentName || 'Unknown Visitor'} • {log.timestamp.toLocaleDateString()} {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {log.action && (
                              <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                log.action === 'check-in' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {log.action === 'check-in' ? 'In' : 'Out'}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-deep-blue font-semibold mt-1">
                            {sites.find(s => s.id === log.siteId)?.name || log.companyName} • {log.guardName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          log.status === 'granted' ? 'bg-green-100 text-success-green' : 'bg-red-100 text-error-red'
                        }`}>
                          {log.status === 'granted' ? 'Passed' : 'Denied'}
                        </div>
                        <Settings className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination and Filter Controls */}
                <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Show:</span>
                      <div className="flex bg-slate-50 p-1 rounded-xl">
                        {[5, 10, 20, 30, 50].map((num) => (
                          <button
                            key={num}
                            onClick={() => {
                              setFullLogsPerPage(num);
                              setFullLogsPage(1);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              fullLogsPerPage === num 
                                ? 'bg-white text-deep-blue shadow-sm' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => setShowExportModal(true)}
                      className="flex items-center space-x-2 bg-[#b02029] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-red-900/20 active:scale-95 transition-all"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Export PDF Report</span>
                    </button>
                  </div>

                  {logs.length > fullLogsPerPage && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-400 font-medium">
                        Showing {((fullLogsPage - 1) * fullLogsPerPage) + 1} to {Math.min(fullLogsPage * fullLogsPerPage, logs.length)} of {logs.length} entries
                      </p>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setFullLogsPage(prev => Math.max(prev - 1, 1))}
                          disabled={fullLogsPage === 1}
                          className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, Math.ceil(logs.length / fullLogsPerPage)) }).map((_, i) => {
                            const pageNum = i + 1;
                            return (
                              <button
                                key={i}
                                onClick={() => setFullLogsPage(pageNum)}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                                  fullLogsPage === pageNum 
                                    ? 'bg-deep-blue text-white shadow-md' 
                                    : 'text-slate-400 hover:bg-slate-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        <button 
                          onClick={() => setFullLogsPage(prev => Math.min(prev + 1, Math.ceil(logs.length / fullLogsPerPage)))}
                          disabled={fullLogsPage === Math.ceil(logs.length / fullLogsPerPage)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExportModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl z-10 overflow-hidden"
            >
              <div className="bg-[#b02029] p-8 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full shimmer opacity-10 pointer-events-none" />
                <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/10 relative z-10">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight relative z-10">Vehicle Activity Report</h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1 relative z-10">Secure Data Retrieval</p>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">From Date</label>
                    <input 
                      type="date" 
                      value={exportDateRange.start}
                      onChange={(e) => setExportDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800 focus:ring-2 focus:ring-deep-blue transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">To Date</label>
                    <input 
                      type="date" 
                      value={exportDateRange.end}
                      onChange={(e) => setExportDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800 focus:ring-2 focus:ring-deep-blue transition-all"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Residence Company List</label>
                      {sites.length > 5 && (
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setExportSitePage(prev => Math.max(0, prev - 1))}
                            disabled={exportSitePage === 0}
                            className="p-1 rounded-lg bg-slate-100 text-slate-400 disabled:opacity-30 hover:bg-slate-200 transition-all"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-[10px] font-black text-slate-400">
                            {exportSitePage + 1} / {Math.ceil(sites.length / 5)}
                          </span>
                          <button 
                            onClick={() => setExportSitePage(prev => Math.min(Math.ceil(sites.length / 5) - 1, prev + 1))}
                            disabled={exportSitePage >= Math.ceil(sites.length / 5) - 1}
                            className="p-1 rounded-lg bg-slate-100 text-slate-400 disabled:opacity-30 hover:bg-slate-200 transition-all"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="w-full bg-slate-50 border-none rounded-2xl p-4 space-y-2">
                      {sites.length === 0 ? (
                        <p className="text-sm font-bold text-slate-400 italic">No residence companies found</p>
                      ) : (
                        sites.slice(exportSitePage * 5, (exportSitePage * 5) + 5).map(site => (
                          <label key={site.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white rounded-xl transition-colors">
                            <input 
                              type="checkbox"
                              checked={exportResidenceFilter.includes(site.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setExportResidenceFilter(prev => [...prev, site.id]);
                                } else {
                                  setExportResidenceFilter(prev => prev.filter(id => id !== site.id));
                                }
                              }}
                              className="w-5 h-5 rounded border-slate-300 text-deep-blue focus:ring-deep-blue"
                            />
                            <span className="font-bold text-slate-800">{site.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Check boxes to include them in the report. Leave all unselected for all.</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowExportModal(false);
                      setExportSitePage(0);
                    }}
                    className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExportPDF}
                    className="flex-1 bg-[#b02029] text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-900/20 active:scale-[0.98] transition-all"
                  >
                    Generate Report
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
