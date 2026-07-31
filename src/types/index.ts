// Centralized TypeScript Interface Definitions for Dispatcher & OMS

export type UserRole = 'admin' | 'dispatcher' | 'fleet_ops' | 'driver';

export type UnitType = 'TWB' | 'CDDL';

export type OrderStatus = 
  | 'Draft/Request' 
  | 'Dispatched' 
  | 'In Progress' 
  | 'Completed' 
  | 'Closed' 
  | 'Cancelled';

export type OrderSubStatus = 
  | '1. Otw Muat'
  | '2. Antri Muat'
  | '3. Proses Muat'
  | '4. Otw Bongkar'
  | '5. Antri Bongkar'
  | '6. Proses Bongkar'
  | '7. Menuju End Point'
  | '8. Standby';

export type FleetVehicleStatus = 'moving' | 'stopped' | 'idle' | 'breakdown';

export type AttachmentType = 
  | 'SuratJalanScan' 
  | 'SuratJalanPhysical' 
  | 'Resi' 
  | 'Kuitansi' 
  | 'ApprovalCost' 
  | 'Other';

export type BreakdownStatus = 'Open' | 'In Repair' | 'Resolved' | 'Cancelled';

export type ShiftName = 'Morning' | 'Evening' | 'Night' | 'Weekend';

export type ShiftStatus = 'Scheduled' | 'Active' | 'Handover' | 'Completed';

export type CallStatus = 'Open' | 'Resolved' | 'Escalated';

export interface Waypoint {
  id: string;
  type: 'loading' | 'unloading';
  address: string;
}

export interface StatusLog {
  status: OrderStatus | string;
  statusDetail?: OrderSubStatus | string;
  timestamp: string;
  odometer: number;
  user: string;
  created_at: string;
  updated_at?: string;
  updated_by?: string;
}

export interface Attachment {
  id?: string;
  name: string;
  url: string;
  type: AttachmentType | string;
  fileSize?: number;
  uploadedAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  unitType: UnitType;
  customer: string;
  shipper: string;
  tanggalJalan: string;
  costAllowance: number;
  rate: number;
  notes: string;
  nopol: string;
  driverName: string;
  driverPhone: string;
  odooSo: string;
  status: OrderStatus;
  statusDetail: OrderSubStatus | string;
  waypoints: Waypoint[];
  origin: string;
  destination: string;
  endPoint?: string;
  estimatedKm: number;
  estimatedDays: number;
  odometer: number;
  startOdo: number;
  historyLogs: StatusLog[];
  attachments: Attachment[];
  sjPhysicalDone: boolean;
  cancelNote?: string;
}

export interface FleetVehicle {
  nopol: string;
  driver: string;
  location: string;
  fleetStatus: FleetVehicleStatus;
  orderStatus: string;
  statusDuration: string;
  doDuration: string;
  eta: string;
  nextPlan: 'planned' | 'empty' | string;
  type?: UnitType;
  unitType?: UnitType;
  odometer?: number;
  lastOdometer?: number;
  maintenanceNotes?: string;
  maintenanceTime?: string;
}

export interface BreakdownLog {
  id: string;
  nopol: string;
  driver: string;
  issueDescription: string;
  sparepartsNeeded?: string;
  estimatedCost: number;
  actualCost?: number;
  startOdometer: number;
  startTimestamp: string;
  endTimestamp?: string;
  status: BreakdownStatus;
  reportedBy: string;
  resolvedBy?: string;
}

export interface OnCallShift {
  id: string;
  dispatcherId: string;
  dispatcherName: string;
  shiftName: ShiftName;
  startTime: string;
  endTime: string;
  actualLogin?: string;
  actualLogout?: string;
  status: ShiftStatus;
  handoverNotes?: string;
}

export interface CallLog {
  id: string;
  dispatcherId?: string;
  shiftId?: string;
  callerName: string;
  callerPhone: string;
  issue: string;
  status: CallStatus;
  createdAt: string;
}
