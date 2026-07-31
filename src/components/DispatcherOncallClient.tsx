'use client'
import { useState } from 'react'
import Link from 'next/link'
import { 
  CalendarRange, 
  Briefcase, 
  Plus, 
  Trash2, 
  Clock, 
  Upload, 
  AlertTriangle,
  Check,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  X,
  Edit2,
  FileText,
  Download,
  Eye,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Truck,
  Wrench,
  Route as RouteIcon,
  Minimize2,
  Copy,
  ExternalLink
} from 'lucide-react'
import Topbar from '@/components/Topbar'
import { useLang } from '@/components/providers/LanguageProvider'

interface Props {
  userName: string
  role: string
}

interface Waypoint {
  id: string
  type: 'loading' | 'unloading'
  address: string
}

interface StatusLog {
  status: string
  timestamp: string
  odometer: number
  user: string
  created_at: string
  updated_at?: string
  updated_by?: string
}

interface Attachment {
  name: string
  url: string
  type: string // 'Surat Jalan' | 'Resi' | 'Kuitansi' | 'Approval' | 'Other'
}

interface Order {
  id: string
  orderNumber: string
  unitType: 'TWB' | 'CDDL'
  customer: string
  shipper: string
  tanggalJalan: string
  costAllowance: number
  rate: number
  notes: string
  nopol: string
  driverName: string
  driverPhone: string
  odooSo: string
  status: 'Draft/Request' | 'Dispatched' | 'In Progress' | 'Completed' | 'Closed' | 'Cancelled'
  statusDetail: string // e.g. "Otw Muat", "Antri Muat", "Otw Bongkar"
  waypoints: Waypoint[]
  origin: string
  destination: string
  endPoint?: string
  estimatedKm: number
  estimatedDays: number
  odometer: number
  startOdo: number
  historyLogs: StatusLog[]
  attachments: Attachment[]
  sjPhysicalDone: boolean
  cancelNote?: string
}

interface FleetVehicle {
  nopol: string
  driver: string
  location: string
  fleetStatus: 'moving' | 'stopped' | 'idle' | 'breakdown'
  orderStatus: string
  statusDuration: string
  doDuration: string
  eta: string
  nextPlan: string // 'planned' | 'empty'
  type: 'TWB' | 'CDDL'
  odometer?: number
  maintenanceNotes?: string
  maintenanceTime?: string
}

const INITIAL_FLEETS: FleetVehicle[] = [
  { nopol: 'B 9182 TXS', driver: 'Ahmad Subarjo', location: 'Cirebon Toll Road', fleetStatus: 'moving', orderStatus: 'Otw Bongkar', statusDuration: '1h 15m', doDuration: '2.5h', eta: '14:00 (Today)', nextPlan: 'planned', type: 'TWB' },
  { nopol: 'B 9531 WYV', driver: 'Suryono', location: 'Cakung Depot', fleetStatus: 'idle', orderStatus: 'Antri Muat', statusDuration: '30m', doDuration: '0h', eta: 'N/A', nextPlan: 'planned', type: 'CDDL' },
  { nopol: 'B 9042 KLV', driver: 'Budi Santoso', location: 'Gudang Marunda', fleetStatus: 'stopped', orderStatus: 'Empty', statusDuration: '4h 12m', doDuration: 'N/A', eta: 'N/A', nextPlan: 'empty', type: 'TWB' },
  { nopol: 'B 8901 PLK', driver: 'Supardi', location: 'Bengkel Pluit', fleetStatus: 'breakdown', orderStatus: 'Under Maintenance', statusDuration: '2 days', doDuration: 'N/A', eta: 'N/A', nextPlan: 'empty', type: 'CDDL', maintenanceNotes: 'Ganti oli transmisi dan check rem angin', maintenanceTime: '2026-07-18 10:00' },
  { nopol: 'B 9722 KKA', driver: 'Yusuf Ginanjar', location: 'Merak Port', fleetStatus: 'moving', orderStatus: 'Otw Muat', statusDuration: '45m', doDuration: '1h', eta: '11:30 (Today)', nextPlan: 'empty', type: 'TWB' },
  { nopol: 'B 9110 TXX', driver: 'Dedi Kurniawan', location: 'Gudang Cibitung', fleetStatus: 'idle', orderStatus: 'Empty', statusDuration: '6h', doDuration: 'N/A', eta: 'N/A', nextPlan: 'empty', type: 'CDDL' },
  { nopol: 'B 9205 PLS', driver: 'Heri Prasetyo', location: 'Karawang Timur', fleetStatus: 'stopped', orderStatus: 'Empty', statusDuration: '12h', doDuration: 'N/A', eta: 'N/A', nextPlan: 'empty', type: 'TWB' },
  { nopol: 'B 9801 WXZ', driver: 'Rian Hidayat', location: 'Bandung Hub', fleetStatus: 'moving', orderStatus: 'Otw Bongkar 2', statusDuration: '2h 10m', doDuration: '8h', eta: '16:45 (Today)', nextPlan: 'planned', type: 'TWB' },
  { nopol: 'B 9012 YYY', driver: 'Kusuma Wijaya', location: 'Semarang Depot', fleetStatus: 'idle', orderStatus: 'Empty', statusDuration: '1 day', doDuration: 'N/A', eta: 'N/A', nextPlan: 'empty', type: 'CDDL' },
  { nopol: 'B 9555 KKL', driver: 'Andi Wijaya', location: 'Bengkel Karawang', fleetStatus: 'breakdown', orderStatus: 'Under Maintenance', statusDuration: '5 hours', doDuration: 'N/A', eta: 'N/A', nextPlan: 'empty', type: 'TWB', maintenanceNotes: 'Radiator bocor', maintenanceTime: '2026-07-19 03:00' }
]

const INITIAL_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD/20260719/001',
    unitType: 'TWB',
    customer: 'PT. J&T Express',
    shipper: 'Gudang J&T Cengkareng',
    tanggalJalan: '2026-07-19',
    costAllowance: 3500000,
    rate: 6200000,
    notes: 'Muat paket eCommerce super prioritas',
    nopol: 'B 9182 TXS',
    driverName: 'Ahmad Subarjo',
    driverPhone: '08123456789',
    odooSo: 'SO/IBL/0087',
    status: 'In Progress',
    statusDetail: 'Otw Bongkar',
    origin: 'Cengkareng Hub',
    destination: 'Semarang Cargo Depot',
    endPoint: 'Surabaya Depot',
    estimatedKm: 850,
    estimatedDays: 2,
    odometer: 142100,
    startOdo: 142000,
    waypoints: [
      { id: 'w1', type: 'loading', address: 'Tangerang Hub' },
      { id: 'w2', type: 'unloading', address: 'Semarang Cargo' }
    ],
    historyLogs: [
      { status: 'Draft/Request Created', timestamp: '2026-07-18 17:00', odometer: 142000, user: 'Admin RST', created_at: '2026-07-18 17:00' },
      { status: 'Dispatched', timestamp: '2026-07-19 06:00', odometer: 142000, user: 'Admin RST', created_at: '2026-07-19 06:00' },
      { status: 'Otw Muat', timestamp: '2026-07-19 06:05', odometer: 142000, user: 'Admin RST', created_at: '2026-07-19 06:05' },
      { status: 'Antri Muat', timestamp: '2026-07-19 07:15', odometer: 142010, user: 'Admin RST', created_at: '2026-07-19 07:15' },
      { status: 'Otw Bongkar', timestamp: '2026-07-19 08:30', odometer: 142015, user: 'Admin RST', created_at: '2026-07-19 08:30' }
    ],
    attachments: [
      { name: 'Bukti_Uang_Jalan.pdf', url: '#', type: 'Approval' }
    ],
    sjPhysicalDone: false
  },
  {
    id: '2',
    orderNumber: 'ORD/20260719/002',
    unitType: 'CDDL',
    customer: 'PT. Rocket Gerbang Bersama',
    shipper: 'Gudang Cakung',
    tanggalJalan: '2026-07-19',
    costAllowance: 1200000,
    rate: 2200000,
    notes: 'Kirim sparepart urgent pabrik',
    nopol: 'B 9531 WYV',
    driverName: 'Suryono',
    driverPhone: '08139876543',
    odooSo: 'SO/IBL/0088',
    status: 'In Progress',
    statusDetail: 'Antri Muat',
    origin: 'Cakung Depot',
    destination: 'Bekasi Plant 1',
    endPoint: '',
    estimatedKm: 45,
    estimatedDays: 1,
    odometer: 89410,
    startOdo: 89400,
    waypoints: [
      { id: 'w3', type: 'loading', address: 'Cakung Depot' },
      { id: 'w4', type: 'unloading', address: 'Bekasi Plant' }
    ],
    historyLogs: [
      { status: 'Draft/Request Created', timestamp: '2026-07-19 08:00', odometer: 89400, user: 'Admin RST', created_at: '2026-07-19 08:00' },
      { status: 'Dispatched', timestamp: '2026-07-19 08:15', odometer: 89400, user: 'Admin RST', created_at: '2026-07-19 08:15' },
      { status: 'Otw Muat', timestamp: '2026-07-19 08:20', odometer: 89400, user: 'Admin RST', created_at: '2026-07-19 08:20' },
      { status: 'Antri Muat', timestamp: '2026-07-19 08:45', odometer: 89410, user: 'Admin RST', created_at: '2026-07-19 08:45' }
    ],
    attachments: [],
    sjPhysicalDone: false
  },
  {
    id: '3',
    orderNumber: 'ORD/20260718/005',
    unitType: 'TWB',
    customer: 'PT. Unilever Indonesia',
    shipper: 'Cikarang Distribution Center',
    tanggalJalan: '2026-07-18',
    costAllowance: 2200000,
    rate: 4500000,
    notes: 'Muat produk sabun cair',
    nopol: 'B 9801 WXZ',
    driverName: 'Rian Hidayat',
    driverPhone: '08151234567',
    odooSo: 'SO/IBL/0074',
    status: 'Completed',
    statusDetail: 'Complete',
    origin: 'Cikarang Hub',
    destination: 'Bandung Ritel Center',
    endPoint: '',
    estimatedKm: 180,
    estimatedDays: 1,
    odometer: 104520,
    startOdo: 104300,
    waypoints: [
      { id: 'w5', type: 'loading', address: 'Cikarang CDC' },
      { id: 'w6', type: 'unloading', address: 'Bandung Ritel' }
    ],
    historyLogs: [
      { status: 'Draft/Request Created', timestamp: '2026-07-18 07:00', odometer: 104300, user: 'Admin RST', created_at: '2026-07-18 07:00' },
      { status: 'Dispatched', timestamp: '2026-07-18 08:00', odometer: 104300, user: 'Admin RST', created_at: '2026-07-18 08:00' },
      { status: 'Otw Muat', timestamp: '2026-07-18 08:05', odometer: 104300, user: 'Admin RST', created_at: '2026-07-18 08:05' },
      { status: 'Antri Muat', timestamp: '2026-07-18 09:30', odometer: 104320, user: 'Admin RST', created_at: '2026-07-18 09:30' },
      { status: 'Otw Bongkar', timestamp: '2026-07-18 11:00', odometer: 104325, user: 'Admin RST', created_at: '2026-07-18 11:00' },
      { status: 'Antri Bongkar', timestamp: '2026-07-18 15:30', odometer: 104510, user: 'Admin RST', created_at: '2026-07-18 15:30' },
      { status: 'Empty', timestamp: '2026-07-18 17:00', odometer: 104520, user: 'Admin RST', created_at: '2026-07-18 17:00' },
      { status: 'Completed (Surat Jalan Softcopy diunggah)', timestamp: '2026-07-18 17:15', odometer: 104520, user: 'Admin RST', created_at: '2026-07-18 17:15' }
    ],
    attachments: [],
    sjPhysicalDone: false
  },
  {
    id: '4',
    orderNumber: 'ORD/20260717/001',
    unitType: 'CDDL',
    customer: 'PT. Tokopedia',
    shipper: 'Gudang Tokopedia Marunda',
    tanggalJalan: '2026-07-17',
    costAllowance: 800000,
    rate: 1800000,
    notes: 'Kirim barang elektronik promo',
    nopol: 'B 9110 TXX',
    driverName: 'Dedi Kurniawan',
    driverPhone: '08197775551',
    odooSo: 'SO/IBL/0065',
    status: 'Closed',
    statusDetail: 'Closed',
    origin: 'Marunda Hub',
    destination: 'Jakarta Selatan Hub',
    endPoint: '',
    estimatedKm: 35,
    estimatedDays: 1,
    odometer: 44020,
    startOdo: 43980,
    waypoints: [
      { id: 'w7', type: 'loading', address: 'Marunda Hub' },
      { id: 'w8', type: 'unloading', address: 'Jaksel Hub' }
    ],
    historyLogs: [
      { status: 'Draft/Request Created', timestamp: '2026-07-17 08:00', odometer: 43980, user: 'Admin RST', created_at: '2026-07-17 08:00' },
      { status: 'Dispatched', timestamp: '2026-07-17 09:00', odometer: 43980, user: 'Admin RST', created_at: '2026-07-17 09:00' },
      { status: 'Otw Muat', timestamp: '2026-07-17 09:10', odometer: 43980, user: 'Admin RST', created_at: '2026-07-17 09:10' },
      { status: 'Empty', timestamp: '2026-07-17 11:30', odometer: 44020, user: 'Admin RST', created_at: '2026-07-17 11:30' },
      { status: 'Completed (Surat Jalan Softcopy diunggah)', timestamp: '2026-07-17 12:00', odometer: 44020, user: 'Admin RST', created_at: '2026-07-17 12:00' },
      { status: 'Closed (Surat Jalan Fisik Diterima)', timestamp: '2026-07-17 16:30', odometer: 44020, user: 'Admin RST', created_at: '2026-07-17 16:30' }
    ],
    attachments: [
      { name: 'SJ_TOKOPEDIA_17_9110.png', url: '#', type: 'Surat Jalan' },
      { name: 'Resi_Fisik_Jaksel.jpg', url: '#', type: 'Resi' }
    ],
    sjPhysicalDone: true
  },
  {
    id: '5',
    orderNumber: 'ORD/20260719/009',
    unitType: 'TWB',
    customer: 'PT. Indofood CBP',
    shipper: 'Pabrik Indofood Cikarang',
    tanggalJalan: '2026-07-19',
    costAllowance: 2000000,
    rate: 4200000,
    notes: 'Kirim mie instan ekspor',
    nopol: 'B 9205 PLS',
    driverName: 'Heri Prasetyo',
    driverPhone: '08122334455',
    odooSo: '',
    status: 'Cancelled',
    statusDetail: 'Cancelled',
    origin: 'Cikarang Indofood',
    destination: 'Tanjung Priok Port',
    endPoint: '',
    estimatedKm: 60,
    estimatedDays: 1,
    odometer: 75300,
    startOdo: 75300,
    waypoints: [
      { id: 'w9', type: 'loading', address: 'Indofood Cik' },
      { id: 'w10', type: 'unloading', address: 'Tg Priok' }
    ],
    historyLogs: [
      { status: 'Draft/Request Created', timestamp: '2026-07-19 07:00', odometer: 75300, user: 'Admin RST', created_at: '2026-07-19 07:00' },
      { status: 'Cancelled (Batalkan Order)', timestamp: '2026-07-19 07:45', odometer: 75300, user: 'Admin RST', created_at: '2026-07-19 07:45' }
    ],
    attachments: [],
    sjPhysicalDone: false,
    cancelNote: 'Salah jadwal muat kapal, dibatalkan oleh customer'
  }
]

export default function DispatcherOncallClient({ userName, role }: Props) {
  const { t } = useLang()
  const [tab, setTab] = useState<'overview' | 'orders'>('overview')
  const [unitFilter, setUnitFilter] = useState<'ALL' | 'CDDL' | 'TWB'>('ALL')
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS)
  const [fleets, setFleets] = useState<FleetVehicle[]>(INITIAL_FLEETS)
  
  // Filtering & Search
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')
  const [nopolFilter, setNopolFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // UI state
  const [isOverviewMetricOpen, setIsOverviewMetricOpen] = useState(true)
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false)
  const [timelineScale, setTimelineScale] = useState<'3D' | '7D' | '1M'>('7D')
  const [activeOrderDetailId, setActiveOrderDetailId] = useState<string | null>(null)

  // Form State for creating new order
  const [newUnitType, setNewUnitType] = useState<'TWB' | 'CDDL'>('TWB')
  const [newCustomer, setNewCustomer] = useState('')
  const [newShipper, setNewShipper] = useState('')
  const [newTanggalJalan, setNewTanggalJalan] = useState('')
  const [newCostAllowance, setNewCostAllowance] = useState('')
  const [newRate, setNewRate] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [loadings, setLoadings] = useState<string[]>([''])
  const [unloadings, setUnloadings] = useState<string[]>([''])
  const [estimatedKm, setEstimatedKm] = useState('')
  const [estimatedDays, setEstimatedDays] = useState('')
  const [newEndPoint, setNewEndPoint] = useState('')

  // Modal State for status updates
  const [activeUpdateOrderId, setActiveUpdateOrderId] = useState<string | null>(null)
  const [nextStatusDetail, setNextStatusDetail] = useState('Otw Muat')
  const [inputTime, setInputTime] = useState('')
  const [inputOdometer, setInputOdometer] = useState('')
  const [odoError, setOdoError] = useState('')

  // Modal State for Dispatch (Odoo SO link)
  const [activeDispatchOrderId, setActiveDispatchOrderId] = useState<string | null>(null)
  const [inputSoNumber, setInputSoNumber] = useState('')
  const [dispatchTime, setDispatchTime] = useState('')
  const [dispatchOdo, setDispatchOdo] = useState('')
  const [isValidatingSo, setIsValidatingSo] = useState(false)
  const [soError, setSoError] = useState('')

  // Modal State for Assign Fleet
  const [activeAssignOrderId, setActiveAssignOrderId] = useState<string | null>(null)
  const [assignNopol, setAssignNopol] = useState('')
  const [assignDriver, setAssignDriver] = useState('')
  const [assignOdo, setAssignOdo] = useState('')
  const [assignSearchQuery, setAssignSearchQuery] = useState('')

  // Modal State for Cancel Order
  const [activeCancelOrderId, setActiveCancelOrderId] = useState<string | null>(null)
  const [cancelTime, setCancelTime] = useState('')
  const [cancelReason, setCancelReason] = useState('')

  // Modal State for Maintenance Log
  const [activeMaintNopol, setActiveMaintNopol] = useState<string | null>(null)
  const [maintTime, setMaintTime] = useState('')
  const [maintNotes, setMaintNotes] = useState('')

  // Modal State for Set Active (Complete Maintenance)
  const [activeMaintCompleteNopol, setActiveMaintCompleteNopol] = useState<string | null>(null)
  const [maintCompleteTime, setMaintCompleteTime] = useState('')

  // Modal State for Upload Resi (Close Order)
  const [activeResiOrderId, setActiveResiOrderId] = useState<string | null>(null)
  const [resiFisikTerkirim, setResiFisikTerkirim] = useState(false)
  const [resiFileName, setResiFileName] = useState('')

  // Modal State for Upload Surat Jalan (Complete Order)
  const [activeSjOrderId, setActiveSjOrderId] = useState<string | null>(null)
  const [sjVerified, setSjVerified] = useState(false)
  const [sjFileName, setSjFileName] = useState('')

  // Uploader for specific order detail page
  const [detailUploadType, setDetailUploadType] = useState<'Surat Jalan' | 'Resi' | 'Kuitansi' | 'Approval'>('Surat Jalan')
  const [detailFileName, setDetailFileName] = useState('')

  // Specific Order Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editOrderObj, setEditOrderObj] = useState<Order | null>(null)

  // Trackback toggle states in Specific Order Page
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true)

  // Helpers for timeline scale & conflict styling
  const getTimelineDays = () => {
    if (timelineScale === '3D') {
      return [
        { label: '19 Jul (Mon) 00:00', date: '' },
        { label: '19 Jul (Mon) 12:00', date: '' },
        { label: '20 Jul (Tue) 00:00', date: '' },
        { label: '20 Jul (Tue) 12:00', date: '' },
        { label: '21 Jul (Wed) 00:00', date: '' },
        { label: '21 Jul (Wed) 12:00', date: '' },
      ]
    }
    if (timelineScale === '7D') {
      return [
        { label: '19 Jul (Mon)', date: '' },
        { label: '20 Jul (Tue)', date: '' },
        { label: '21 Jul (Wed)', date: '' },
        { label: '22 Jul (Thu)', date: '' },
        { label: '23 Jul (Fri)', date: '' },
        { label: '24 Jul (Sat)', date: '' },
        { label: '25 Jul (Sun)', date: '' },
      ]
    }
    // 1M
    return [
      { label: 'W1 (1-7 Jul)', date: '' },
      { label: 'W2 (8-14 Jul)', date: '' },
      { label: 'W3 (15-21 Jul)', date: '' },
      { label: 'W4 (22-28 Jul)', date: '' },
      { label: 'W5 (29-31 Jul)', date: '' },
    ]
  }

  const hasOrderConflict = (order: Order) => {
    if (!order.nopol || order.status === 'Closed' || order.status === 'Cancelled') return false
    const siblingOrders = orders.filter(o => o.nopol === order.nopol && o.id !== order.id && o.status !== 'Closed' && o.status !== 'Cancelled')
    
    let dateStrA = order.tanggalJalan.trim()
    if (!dateStrA.includes(' ') && !dateStrA.includes('T')) {
      dateStrA += 'T08:00:00'
    } else {
      dateStrA = dateStrA.replace(' ', 'T')
    }
    const startA = new Date(dateStrA).getTime()
    const endA = startA + (order.estimatedDays * 24 * 60 * 60 * 1000)

    for (const sib of siblingOrders) {
      let dateStrB = sib.tanggalJalan.trim()
      if (!dateStrB.includes(' ') && !dateStrB.includes('T')) {
        dateStrB += 'T08:00:00'
      } else {
        dateStrB = dateStrB.replace(' ', 'T')
      }
      const startB = new Date(dateStrB).getTime()
      const endB = startB + (sib.estimatedDays * 24 * 60 * 60 * 1000)

      if (startA < endB && startB < endA) {
        return true
      }
    }
    return false
  }

  const getTimelineStyle = (order: Order, scale: '3D' | '7D' | '1M') => {
    try {
      let dateStr = order.tanggalJalan.trim()
      if (!dateStr.includes(' ') && !dateStr.includes('T')) {
        dateStr += 'T08:00:00'
      } else {
        dateStr = dateStr.replace(' ', 'T')
      }
      const startMs = new Date(dateStr).getTime()
      const durationMs = order.estimatedDays * 24 * 60 * 60 * 1000
      const endMs = startMs + durationMs

      let timelineStartMs = new Date('2026-07-19T00:00:00').getTime()
      let timelineEndMs = new Date('2026-07-21T23:59:59').getTime()

      if (scale === '7D') {
        timelineStartMs = new Date('2026-07-19T00:00:00').getTime()
        timelineEndMs = new Date('2026-07-25T23:59:59').getTime()
      } else if (scale === '1M') {
        timelineStartMs = new Date('2026-07-01T00:00:00').getTime()
        timelineEndMs = new Date('2026-07-31T23:59:59').getTime()
      }

      const totalRange = timelineEndMs - timelineStartMs

      // Calculate left %
      let leftPct = ((startMs - timelineStartMs) / totalRange) * 100
      // Calculate width %
      let widthPct = ((endMs - startMs) / totalRange) * 100

      // Clamp values
      if (leftPct < 0) {
        widthPct = widthPct + leftPct
        leftPct = 0
      }
      if (leftPct > 100) {
        leftPct = 95
      }
      if (leftPct + widthPct > 100) {
        widthPct = 100 - leftPct
      }
      if (widthPct < 2) {
        widthPct = 2
      }

      const rightPct = 100 - (leftPct + widthPct)

      return {
        left: `${leftPct.toFixed(2)}%`,
        right: `${rightPct.toFixed(2)}%`
      }
    } catch (e) {
      return { left: '10%', right: '80%' }
    }
  }

  const hasConflict = (nopol: string) => {
    if (!nopol) return false
    const activeOrders = orders.filter(o => o.nopol === nopol && o.status !== 'Closed' && o.status !== 'Cancelled')
    if (activeOrders.length <= 1) return false

    for (let i = 0; i < activeOrders.length; i++) {
      try {
        let dateStrA = activeOrders[i].tanggalJalan.trim()
        if (!dateStrA.includes(' ') && !dateStrA.includes('T')) {
          dateStrA += 'T08:00:00'
        } else {
          dateStrA = dateStrA.replace(' ', 'T')
        }
        const startA = new Date(dateStrA).getTime()
        const endA = startA + (activeOrders[i].estimatedDays * 24 * 60 * 60 * 1000)

        for (let j = i + 1; j < activeOrders.length; j++) {
          let dateStrB = activeOrders[j].tanggalJalan.trim()
          if (!dateStrB.includes(' ') && !dateStrB.includes('T')) {
            dateStrB += 'T08:00:00'
          } else {
            dateStrB = dateStrB.replace(' ', 'T')
          }
          const startB = new Date(dateStrB).getTime()
          const endB = startB + (activeOrders[j].estimatedDays * 24 * 60 * 60 * 1000)
          if (startA < endB && startB < endA) {
            return true
          }
        }
      } catch (e) {}
    }
    return false
  }

  const getRouteText = (order: Order) => {
    if (order.waypoints && order.waypoints.length > 0) {
      return order.waypoints.map(w => w.address).join(' ➡️ ')
    }
    return `${order.origin} ➡️ ${order.destination}`
  }

  const getPossibleStatusDetails = (order: Order) => {
    const list: string[] = []
    const loads = order.waypoints.filter(w => w.type === 'loading')
    const unloads = order.waypoints.filter(w => w.type === 'unloading')

    if (order.waypoints.length > 2) {
      loads.forEach((_, idx) => {
        list.push(`Otw Muat ${idx + 1}`, `Antri Muat ${idx + 1}`)
      })
      unloads.forEach((_, idx) => {
        list.push(`Otw Bongkar ${idx + 1}`, `Antri Bongkar ${idx + 1}`)
      })
    } else {
      list.push('Otw Muat', 'Antri Muat', 'Otw Bongkar', 'Antri Bongkar')
    }
    if (order.endPoint && order.endPoint.trim() !== '') {
      list.push('Menuju End Point')
    }
    list.push('Complete')
    return list
  }

  const getFleetStatusDisplay = (f: FleetVehicle) => {
    if (f.fleetStatus === 'breakdown') return { label: 'Maintenance', color: 'bg-red-100 text-red-700' }
    const activeOrder = orders.find(o => o.nopol === f.nopol && (o.status === 'Dispatched' || o.status === 'In Progress'))
    if (activeOrder && activeOrder.statusDetail !== 'Menuju End Point') {
      return { label: 'On Call', color: 'bg-blue-100 text-blue-700' }
    }
    return { label: 'Empty', color: 'bg-red-100 text-red-700' }
  }

  // Helper values for calculations
  const totalOrdersThisMonth = orders.filter(o => o.status !== 'Cancelled').length
  const totalEmptyFleetToday = fleets.filter(f => f.orderStatus === 'Empty' && f.fleetStatus !== 'breakdown').length
  const totalOncallFleets = fleets.filter(f => unitFilter === 'ALL' || f.type === unitFilter).length
  const totalActiveFleets = fleets.filter(f => f.orderStatus !== 'Empty' && f.fleetStatus !== 'breakdown' && (unitFilter === 'ALL' || f.type === unitFilter)).length
  const utilizationRate = totalOncallFleets > 0 ? Math.round((totalActiveFleets / totalOncallFleets) * 100) : 0

  const activeFleets = fleets.filter(f => {
    if (f.fleetStatus === 'breakdown') return false
    if (unitFilter !== 'ALL' && f.type !== unitFilter) return false
    if (nopolFilter.trim() !== '') {
      const q = nopolFilter.toLowerCase()
      const matchNopol = f.nopol.toLowerCase().includes(q)
      const matchDriver = f.driver.toLowerCase().includes(q)
      if (!matchNopol && !matchDriver) return false
    }
    return true
  })
  const maintenanceFleets = fleets.filter(f => f.fleetStatus === 'breakdown' && (unitFilter === 'ALL' || f.type === unitFilter))

  // Dynamic Waypoint buttons
  const addLoadingField = () => setLoadings([...loadings, ''])
  const removeLoadingField = (index: number) => {
    const updated = [...loadings]
    updated.splice(index, 1)
    setLoadings(updated)
  }
  const addUnloadingField = () => setUnloadings([...unloadings, ''])
  const removeUnloadingField = (index: number) => {
    const updated = [...unloadings]
    updated.splice(index, 1)
    setUnloadings(updated)
  }

  // Create Order Request
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault()
    const filteredLoadings = loadings.filter(l => l.trim() !== '')
    const filteredUnloadings = unloadings.filter(u => u.trim() !== '')

    if (!newCustomer || !newShipper || !newTanggalJalan || !origin || filteredLoadings.length === 0 || filteredUnloadings.length === 0 || !estimatedKm || !estimatedDays) {
      alert('Mohon isi seluruh field wajib (termasuk minimal 1 lokasi Muat dan 1 lokasi Bongkar)!')
      return
    }

    const newWaypoints: Waypoint[] = [
      ...filteredLoadings.map((l, i) => ({ id: `load-${i}`, type: 'loading' as const, address: l })),
      ...filteredUnloadings.map((u, i) => ({ id: `unload-${i}`, type: 'unloading' as const, address: u }))
    ]

    const computedDestination = filteredUnloadings[filteredUnloadings.length - 1]

    const newOrder: Order = {
      id: String(Date.now()),
      orderNumber: `ORD/20260719/00${orders.length + 1}`,
      unitType: unitFilter !== 'ALL' ? (unitFilter as 'TWB' | 'CDDL') : newUnitType,
      customer: newCustomer,
      shipper: newShipper,
      tanggalJalan: newTanggalJalan.replace('T', ' '),
      costAllowance: Number(newCostAllowance) || 0,
      rate: Number(newRate) || 0,
      notes: newNotes,
      nopol: '',
      driverName: '',
      driverPhone: '',
      odooSo: '',
      status: 'Draft/Request',
      statusDetail: 'Draft',
      origin,
      destination: computedDestination,
      endPoint: newEndPoint,
      estimatedKm: Number(estimatedKm),
      estimatedDays: Number(estimatedDays),
      odometer: 0,
      startOdo: 0,
      waypoints: newWaypoints,
      historyLogs: [
        { status: 'Draft/Request Created', timestamp: newTanggalJalan.replace('T', ' '), odometer: 0, user: userName, created_at: new Date().toISOString() }
      ],
      attachments: [],
      sjPhysicalDone: false
    }

    setOrders([newOrder, ...orders])
    setIsCreateOrderOpen(false) // Auto minimize
    // Reset Form fields
    setNewCustomer('')
    setNewShipper('')
    setNewTanggalJalan('')
    setNewCostAllowance('')
    setNewRate('')
    setNewNotes('')
    setOrigin('')
    setDestination('')
    setLoadings([''])
    setUnloadings([''])
    setEstimatedKm('')
    setEstimatedDays('')
    setNewEndPoint('')
  }

  const handleDuplicateOrder = (order: Order) => {
    setNewUnitType(order.unitType)
    setNewCustomer(order.customer)
    setNewShipper(order.shipper)
    setNewTanggalJalan('')
    setNewCostAllowance(String(order.costAllowance))
    setNewRate(String(order.rate))
    setNewNotes(order.notes)
    setOrigin(order.origin)
    setNewEndPoint(order.endPoint || '')
    setEstimatedKm(String(order.estimatedKm))
    setEstimatedDays(String(order.estimatedDays))

    const lList = order.waypoints.filter(w => w.type === 'loading').map(w => w.address)
    const uList = order.waypoints.filter(w => w.type === 'unloading').map(w => w.address)

    setLoadings(lList.length > 0 ? lList : [''])
    setUnloadings(uList.length > 0 ? uList : [''])

    setActiveOrderDetailId(null)
    setIsCreateOrderOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle Assign Fleet
  const openAssignModal = (orderId: string) => {
    setActiveAssignOrderId(orderId)
    setAssignNopol('')
    setAssignDriver('')
    setAssignOdo('')
    setAssignSearchQuery('')
  }

  const handleAssignCommit = () => {
    if (!assignNopol || !assignDriver || !assignOdo) {
      alert('Nopol, Driver, dan Odometer wajib diisi!')
      return
    }

    setOrders(orders.map(o => {
      if (o.id === activeAssignOrderId) {
        const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16)
        return {
          ...o,
          nopol: assignNopol,
          driverName: assignDriver,
          startOdo: Number(assignOdo),
          odometer: Number(assignOdo),
          status: 'Draft/Request',
          statusDetail: 'Fleet Assigned',
          historyLogs: [
            ...o.historyLogs,
            { status: 'Fleet Assigned', timestamp: nowStr, odometer: Number(assignOdo), user: userName, created_at: new Date().toISOString() }
          ]
        }
      }
      return o
    }))

    setFleets(fleets.map(f => {
      if (f.nopol === assignNopol) {
        return { ...f, nextPlan: 'planned', driver: assignDriver }
      }
      return f
    }))

    setActiveAssignOrderId(null)
  }

  // Handle Dispatch (Odoo SO linkage)
  const openDispatchModal = (orderId: string) => {
    const orderObj = orders.find(o => o.id === orderId)
    setActiveDispatchOrderId(orderId)
    setInputSoNumber('')
    setDispatchTime(new Date().toISOString().slice(0, 16))
    setDispatchOdo(orderObj ? String(orderObj.odometer) : '')
    setSoError('')
  }

  const handleDispatchCommit = () => {
    if (!inputSoNumber.trim() || !dispatchTime || !dispatchOdo) {
      setSoError('Semua field wajib diisi!')
      return
    }

    const orderObj = orders.find(o => o.id === activeDispatchOrderId)
    if (orderObj && Number(dispatchOdo) < orderObj.odometer) {
      setSoError(`Odometer tidak boleh lebih kecil dari sebelumnya (${orderObj.odometer} km)!`);
      return
    }

    setIsValidatingSo(true)
    setSoError('')

    const formattedDispatchTime = dispatchTime.replace('T', ' ')

    setTimeout(() => {
      setIsValidatingSo(false)
      const valid = inputSoNumber.toUpperCase().startsWith('SO/IBL/') || inputSoNumber.toUpperCase().startsWith('SO/KSO/')
      if (!valid) {
        setSoError('Nomor SO tidak ditemukan di Odoo! Format harus valid (contoh: SO/IBL/0087)')
        return
      }

      setOrders(orders.map(o => {
        if (o.id === activeDispatchOrderId) {
          return {
            ...o,
            odooSo: inputSoNumber,
            status: 'Dispatched',
            statusDetail: 'Otw Muat',
            odometer: Number(dispatchOdo),
            historyLogs: [
              ...o.historyLogs,
              { status: 'Dispatched (Odoo SO: ' + inputSoNumber + ')', timestamp: formattedDispatchTime, odometer: Number(dispatchOdo), user: userName, created_at: new Date().toISOString() },
              { status: 'Otw Muat', timestamp: formattedDispatchTime, odometer: Number(dispatchOdo), user: userName, created_at: new Date().toISOString() }
            ]
          }
        }
        return o
      }))

      // Update active fleet status
      if (orderObj && orderObj.nopol) {
        setFleets(fleets.map(f => {
          if (f.nopol === orderObj.nopol) {
            return { ...f, orderStatus: 'Otw Muat', fleetStatus: 'moving' }
          }
          return f
        }))
      }

      setActiveDispatchOrderId(null)
    }, 1200)
  }

  // Handle Cancel Order
  const openCancelModal = (orderId: string) => {
    setActiveCancelOrderId(orderId)
    setCancelTime(new Date().toISOString().slice(0, 16))
    setCancelReason('')
  }

  const handleCancelCommit = () => {
    if (!cancelTime || !cancelReason.trim()) {
      alert('Timestamp dan alasan pembatalan wajib diisi!')
      return
    }

    const orderObj = orders.find(o => o.id === activeCancelOrderId)
    const formattedCancelTime = cancelTime.replace('T', ' ')

    setOrders(orders.map(o => {
      if (o.id === activeCancelOrderId) {
        return {
          ...o,
          status: 'Cancelled',
          statusDetail: 'Cancelled',
          cancelNote: cancelReason,
          historyLogs: [
            ...o.historyLogs,
            { status: 'Cancelled', timestamp: formattedCancelTime, odometer: o.odometer, user: userName, created_at: new Date().toISOString() }
          ]
        }
      }
      return o
    }))

    // Free the fleet vehicle
    if (orderObj && orderObj.nopol) {
      setFleets(fleets.map(f => {
        if (f.nopol === orderObj.nopol) {
          return { ...f, orderStatus: 'Empty', fleetStatus: 'idle', nextPlan: 'empty' }
        }
        return f
      }))
    }

    setActiveCancelOrderId(null)
  }

  // Handle Commit Status (Ubah Status)
  const openStatusUpdateModal = (orderId: string, currentDetail: string) => {
    setActiveUpdateOrderId(orderId)
    setOdoError('')
    
    const orderObj = orders.find(o => o.id === orderId)
    setNextStatusDetail(currentDetail)
    setInputTime(new Date().toISOString().slice(0, 16))
    setInputOdometer(orderObj ? String(orderObj.odometer + 80) : '')
  }

  const handleStatusCommit = () => {
    if (!inputTime || !inputOdometer) {
      alert('Timestamp dan Odometer wajib diisi!')
      return
    }

    const orderObj = orders.find(o => o.id === activeUpdateOrderId)
    if (!orderObj) return

    // Odometer validation: strictly block if new odo is smaller than the previous log
    if (Number(inputOdometer) < orderObj.odometer) {
      setOdoError(`Odometer tidak boleh lebih kecil dari sebelumnya (${orderObj.odometer} km)!`)
      return
    }

    const formattedTime = inputTime.replace('T', ' ')

    // Check trackback (if same status already exists)
    const existingLogIdx = orderObj.historyLogs.findIndex(log => log.status === nextStatusDetail)

    let updatedLogs = [...orderObj.historyLogs]
    if (existingLogIdx !== -1) {
      updatedLogs[existingLogIdx] = {
        ...updatedLogs[existingLogIdx],
        timestamp: formattedTime,
        odometer: Number(inputOdometer),
        updated_at: new Date().toISOString(),
        updated_by: userName
      }
    } else {
      updatedLogs.push({
        status: nextStatusDetail,
        timestamp: formattedTime,
        odometer: Number(inputOdometer),
        user: userName,
        created_at: new Date().toISOString()
      })
    }

    const finalStatus = (nextStatusDetail === 'Complete') 
      ? 'Completed' 
      : (nextStatusDetail === 'Empty' ? 'In Progress' : orderObj.status)

    setOrders(orders.map(o => {
      if (o.id === activeUpdateOrderId) {
        return {
          ...o,
          status: finalStatus as any,
          statusDetail: nextStatusDetail,
          odometer: Number(inputOdometer),
          historyLogs: updatedLogs
        }
      }
      return o
    }))

    if (orderObj.nopol) {
      setFleets(fleets.map(f => {
        if (f.nopol === orderObj.nopol) {
          const isMoving = nextStatusDetail.includes('Otw') || nextStatusDetail.includes('OTW') || nextStatusDetail === 'Menuju End Point'
          const isComplete = nextStatusDetail === 'Complete'

          return {
            ...f,
            orderStatus: isComplete ? 'Empty' : nextStatusDetail,
            fleetStatus: isComplete ? 'idle' : (isMoving ? 'moving' : 'stopped'),
            nextPlan: isComplete ? 'empty' : f.nextPlan
          }
        }
        return f
      }))
    }

    setActiveUpdateOrderId(null)
  }

  // Handle Delete Draft Order
  const handleDeleteDraft = (orderId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus permanent request order ini?')) {
      setOrders(orders.filter(o => o.id !== orderId))
    }
  }

  // Handle Maintenance Trigger
  const openMaintModal = (nopol: string) => {
    setActiveMaintNopol(nopol)
    setMaintTime(new Date().toISOString().replace('T', ' ').slice(0, 16))
    setMaintNotes('')
  }

  const handleMaintCommit = () => {
    if (!maintTime || !maintNotes.trim()) {
      alert('Semua field wajib diisi!')
      return
    }

    setFleets(fleets.map(f => {
      if (f.nopol === activeMaintNopol) {
        return {
          ...f,
          fleetStatus: 'breakdown',
          orderStatus: 'Under Maintenance',
          maintenanceNotes: maintNotes,
          maintenanceTime: maintTime
        }
      }
      return f
    }))

    setActiveMaintNopol(null)
  }

  // Handle Set Active (Maintenance Done)
  const openMaintCompleteModal = (nopol: string) => {
    setActiveMaintCompleteNopol(nopol)
    setMaintCompleteTime(new Date().toISOString().replace('T', ' ').slice(0, 16))
  }

  const handleMaintCompleteCommit = () => {
    if (!maintCompleteTime) {
      alert('Timestamp wajib diisi!')
      return
    }

    setFleets(fleets.map(f => {
      if (f.nopol === activeMaintCompleteNopol) {
        return {
          ...f,
          fleetStatus: 'idle',
          orderStatus: 'Empty',
          statusDuration: '0h',
          maintenanceNotes: undefined,
          maintenanceTime: undefined
        }
      }
      return f
    }))

    setActiveMaintCompleteNopol(null)
  }

  // Handle Upload Surat Jalan (Status Complete)
  const openSjModal = (orderId: string) => {
    setActiveSjOrderId(orderId)
    setSjVerified(false)
    setSjFileName('')
  }

  const handleSjCommit = () => {
    if (!sjVerified) {
      alert('Anda wajib mencentang verifikasi Surat Jalan Softcopy!')
      return
    }

    const orderId = activeSjOrderId
    if (!orderId) return

    const filename = sjFileName.trim() || `SJ_SOFTCOPY_${orderId.slice(-4)}.pdf`
    const mockFile: Attachment = { name: filename, url: '#', type: 'Surat Jalan' }
    
    const orderObj = orders.find(o => o.id === orderId)

    setOrders(orders.map(o => {
      if (o.id === orderId) {
        const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16)
        return {
          ...o,
          status: 'Completed',
          statusDetail: 'Complete',
          attachments: [...o.attachments, mockFile],
          historyLogs: [
            ...o.historyLogs,
            { status: 'Completed (Surat Jalan Softcopy diunggah)', timestamp: nowStr, odometer: o.odometer, user: userName, created_at: new Date().toISOString() }
          ]
        }
      }
      return o
    }))

    if (orderObj && orderObj.nopol) {
      setFleets(fleets.map(f => {
        if (f.nopol === orderObj.nopol) {
          return { 
            ...f, 
            orderStatus: 'Empty', 
            fleetStatus: 'idle', 
            nextPlan: 'empty' 
          }
        }
        return f
      }))
    }

    setActiveSjOrderId(null)
  }

  // Handle Resi Upload & Closing Order
  const openResiModal = (orderId: string) => {
    setActiveResiOrderId(orderId)
    setResiFisikTerkirim(false)
    setResiFileName('')
  }

  const handleResiCommit = () => {
    if (!resiFisikTerkirim) {
      alert('Anda wajib mencentang boolean "Fisik Terkirim" untuk menutup order ini!')
      return
    }

    const orderId = activeResiOrderId
    const filename = resiFileName || `RESI_FISIK_${orderId?.slice(-4)}.png`
    const resiAttachment: Attachment = { name: filename, url: '#', type: 'Resi' }

    setOrders(orders.map(o => {
      if (o.id === orderId) {
        const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16)
        return {
          ...o,
          status: 'Closed',
          statusDetail: 'Closed',
          sjPhysicalDone: true,
          attachments: [...o.attachments, resiAttachment],
          historyLogs: [
            ...o.historyLogs,
            { status: 'Closed (Surat Jalan & Resi Fisik Diterima)', timestamp: nowStr, odometer: o.odometer, user: userName, created_at: new Date().toISOString() }
          ]
        }
      }
      return o
    }))

    const orderObj = orders.find(o => o.id === orderId)
    if (orderObj && orderObj.nopol) {
      setFleets(fleets.map(f => {
        if (f.nopol === orderObj.nopol) {
          return { ...f, orderStatus: 'Empty', fleetStatus: 'idle', nextPlan: 'empty' }
        }
        return f
      }))
    }

    setActiveResiOrderId(null)
  }

  // Handle Set Fleet Available (from Menuju End Point)
  const handleSetAvailable = (nopol: string) => {
    if (confirm(`Ubah armada ${nopol} menjadi Available (Armada telah tiba di garasi)?`)) {
      setFleets(fleets.map(f => {
        if (f.nopol === nopol) {
          return { ...f, orderStatus: 'Empty', fleetStatus: 'idle', nextPlan: 'empty' }
        }
        return f
      }))
    }
  }

  // Upload attachment on Specific Order Page
  const handleDetailUpload = () => {
    if (!detailFileName.trim()) {
      alert('Ketik nama berkas terlebih dahulu!')
      return
    }

    const newAttach: Attachment = {
      name: detailFileName,
      url: '#',
      type: detailUploadType
    }

    setOrders(orders.map(o => {
      if (o.id === activeOrderDetailId) {
        return { ...o, attachments: [...o.attachments, newAttach] }
      }
      return o
    }))

    setDetailFileName('')
    alert('Berkas attachment berhasil diunggah!')
  }

  // Edit Order modal submit
  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editOrderObj) return

    setOrders(orders.map(o => {
      if (o.id === editOrderObj.id) {
        return {
          ...editOrderObj,
          tanggalJalan: editOrderObj.tanggalJalan.replace('T', ' '),
          historyLogs: [
            ...editOrderObj.historyLogs,
            { status: 'Order Data Edited', timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16), odometer: editOrderObj.odometer, user: userName, created_at: new Date().toISOString() }
          ]
        }
      }
      return o
    }))

    setIsEditModalOpen(false)
  }

  // Simulate CSV Log download
  const handleCsvDownload = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Order Number,Unit Type,Customer,Shipper,Route,Tanggal Jalan,Odoo SO,Odometer,Status,Notes\n"
      + filteredOrders.map(o => `"${o.orderNumber}","${o.unitType}","${o.customer}","${o.shipper}","${o.origin} - ${o.destination}","${o.tanggalJalan}","${o.odooSo}",${o.odometer},"${o.status}","${o.notes}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `oncall_orders_export_${startDateFilter || 'start'}_to_${endDateFilter || 'end'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredOrders = orders.filter(o => {
    if (unitFilter !== 'ALL' && o.unitType !== unitFilter) return false
    const oDate = o.tanggalJalan.slice(0, 10)
    if (startDateFilter && oDate < startDateFilter) return false
    if (endDateFilter && oDate > endDateFilter) return false
    if (nopolFilter.trim() !== '') {
      const q = nopolFilter.toLowerCase()
      const matchNopol = o.nopol?.toLowerCase().includes(q)
      const matchDriver = o.driverName?.toLowerCase().includes(q)
      if (!matchNopol && !matchDriver) return false
    }
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'Draft' && o.status !== 'Draft/Request') return false
      if (statusFilter === 'Assigned' && o.status !== 'Draft/Request' && o.statusDetail !== 'Fleet Assigned') return false
      if (statusFilter === 'Running' && o.status !== 'In Progress' && o.status !== 'Dispatched') return false
      if (statusFilter === 'Complete' && o.status !== 'Completed') return false
      if (statusFilter === 'Closed' && o.status !== 'Closed') return false
      if (statusFilter === 'Canceled' && o.status !== 'Cancelled') return false
    }
    return true
  })

  const selectedOrder = orders.find(o => o.id === activeOrderDetailId)

  return (
    <div className="p-4 lg:p-6 space-y-4 bg-[#F6F8FD] min-h-screen text-[#0F1629]">
      <Topbar
        title="Dispatcher On Call"
        subtitle="Sistem cockpit spot order untuk unit TWB dan CDDL. Atur penugasan armada, catat odometer, verifikasi surat jalan, dan unggah resi."
        userName={userName}
        role={role}
        hideSearch
      />

      {/* RENDER SPECIFIC DETAIL VIEW OR MAIN TABS */}
      {selectedOrder ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#E4E8F2] shadow-sm">
            <button 
              onClick={() => setActiveOrderDetailId(null)}
              className="flex items-center gap-2 text-sm font-bold text-[#666E82] hover:text-[#0F1629] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Daftar Orders
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDuplicateOrder(selectedOrder)}
                className="px-3 py-1.5 bg-[#0D21A1]/10 text-[#0D21A1] hover:bg-[#0D21A1]/20 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Buat Order Lagi
              </button>
              <span className="text-xs font-bold bg-[#E4E8F2] text-[#0F1629] px-3 py-1.5 rounded-lg font-mono">
                Order ID: {selectedOrder.orderNumber}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#E4E8F2] shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#E4E8F2] pb-3">
                  <h3 className="text-base font-bold">Detail Informasi Order</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedOrder.status === 'Draft/Request' ? 'bg-amber-100 text-amber-700' :
                    selectedOrder.status === 'Dispatched' ? 'bg-blue-100 text-blue-700' :
                    selectedOrder.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' :
                    selectedOrder.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    selectedOrder.status === 'Closed' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedOrder.statusDetail}
                  </span>
                </div>

                {selectedOrder.status === 'Cancelled' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-red-700 font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>Alasan Pembatalan Order (Insiden / Laka / Cancel)</span>
                    </div>
                    <p className="text-red-900 font-medium pl-6 leading-relaxed">
                      {selectedOrder.cancelNote || 'Order ini dibatalkan oleh admin/dispatcher.'}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-[#666E82] block uppercase font-bold">Customer</span>
                    <strong className="text-[#0F1629]">{selectedOrder.customer}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-[#666E82] block uppercase font-bold">Shipper</span>
                    <strong className="text-[#0F1629]">{selectedOrder.shipper}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-[#666E82] block uppercase font-bold">Tanggal Jalan</span>
                    <strong className="text-[#0F1629] font-mono">{selectedOrder.tanggalJalan}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-[#666E82] block uppercase font-bold">Unit Type</span>
                    <strong className="text-[#0F1629]">{selectedOrder.unitType}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-[#666E82] block uppercase font-bold">Nopol Assigned</span>
                    <strong className="text-[#0F1629] font-mono">{selectedOrder.nopol || 'Not Assigned'}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-[#666E82] block uppercase font-bold">Driver Name</span>
                    <strong className="text-[#0F1629]">{selectedOrder.driverName || 'Not Assigned'}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-[#666E82] block uppercase font-bold">Odoo Sales Order</span>
                    <strong className="text-[#0F1629] font-mono">{selectedOrder.odooSo || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-[#666E82] block uppercase font-bold">Uang Jalan</span>
                    <strong className="text-[#0F1629] font-mono">Rp {selectedOrder.costAllowance.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-[#666E82] block uppercase font-bold">Rate Order</span>
                    <strong className="text-[#0F1629] font-mono">Rp {selectedOrder.rate.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="bg-[#F6F8FD] p-4 rounded-xl border border-[#E4E8F2] space-y-2">
                  <h4 className="text-xs font-bold uppercase text-[#666E82]">Rute & Waypoints</h4>
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span className="bg-[#0D21A1]/10 text-[#0D21A1] px-2.5 py-1 rounded">Start Point: {selectedOrder.origin}</span>
                    {selectedOrder.waypoints.map((w, idx) => (
                      <span key={w.id} className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-[#666E82]" />
                        <span className={`px-2.5 py-1 rounded ${w.type === 'loading' ? 'bg-white border border-[#E4E8F2]' : 'bg-green-100 text-green-700'}`}>
                          {w.type === 'loading' ? 'Muat' : 'Bongkar'}: {w.address}
                        </span>
                      </span>
                    ))}
                    {selectedOrder.endPoint && (
                      <>
                        <ChevronRight className="w-4 h-4 text-[#666E82]" />
                        <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded">End Point: {selectedOrder.endPoint}</span>
                      </>
                    )}
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="text-sm">
                    <span className="text-xs text-[#666E82] block uppercase font-bold">Notes</span>
                    <p className="text-muted-foreground bg-[#F6F8FD] p-3 rounded-lg border border-[#E4E8F2] mt-1">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E4E8F2] shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#0F1629] uppercase tracking-wider flex items-center gap-2 border-b border-[#E4E8F2] pb-3">
                  <Clock className="text-[#0D21A1] w-5 h-5" />
                  Estimasi vs Aktual Pengiriman
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#F6F8FD] rounded-xl border border-[#E4E8F2] flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#666E82] uppercase tracking-wider">Durasi Pengiriman</span>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <span className="text-[11px] text-[#666E82]">Estimasi</span>
                          <p className="text-lg font-bold">{selectedOrder.estimatedDays} Hari</p>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#666E82]">Aktual</span>
                          <p className="text-lg font-bold">
                            {selectedOrder.status === 'Closed' || selectedOrder.status === 'Completed' ? '2 Hari' : 'Dalam Proses'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {(selectedOrder.status === 'Closed' || selectedOrder.status === 'Completed') && (
                      <div className="mt-3 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-100 p-2 rounded">
                        ⚠️ 1 Hari lebih lambat dari estimasi
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-[#F6F8FD] rounded-xl border border-[#E4E8F2] flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#666E82] uppercase tracking-wider">Jarak Tempuh</span>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <span className="text-[11px] text-[#666E82]">Estimasi</span>
                          <p className="text-lg font-bold font-mono">{selectedOrder.estimatedKm} km</p>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#666E82]">Aktual</span>
                          <p className="text-lg font-bold font-mono">
                            {selectedOrder.status === 'Closed' || selectedOrder.status === 'Completed'
                              ? `${(selectedOrder.odometer - selectedOrder.startOdo)} km`
                              : `${(selectedOrder.odometer - selectedOrder.startOdo)} km`}
                          </p>
                        </div>
                      </div>
                    </div>
                    {(selectedOrder.status === 'Closed' || selectedOrder.status === 'Completed') && (
                      <div className="mt-3 text-xs font-semibold text-[#16A34A] bg-green-50 border border-green-100 p-2 rounded">
                        ✅ Sesuai dengan estimasi rute (+20 km toleransi)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#E4E8F2] shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#0F1629] uppercase tracking-wider flex items-center gap-2 border-b border-[#E4E8F2] pb-3">
                  <FileText className="text-[#0D21A1] w-5 h-5" />
                  Attachment & Dokumen
                </h3>

                <div className="space-y-3">
                  {selectedOrder.attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-[#F6F8FD] border border-[#E4E8F2] rounded-lg">
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-[#0F1629] block truncate">{file.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{file.type}</span>
                      </div>
                      <a href={file.url} className="p-1.5 bg-white border border-[#E4E8F2] hover:bg-[#F6F8FD] text-[#0D21A1] rounded transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}

                  {selectedOrder.attachments.length === 0 && (
                    <div className="text-center py-6 text-xs text-[#666E82]">
                      Belum ada attachment yang diunggah.
                    </div>
                  )}
                </div>

                {selectedOrder.status !== 'Closed' && (
                  <div className="border-t border-[#E4E8F2] pt-4 space-y-3">
                    <label className="text-[11px] font-bold text-[#666E82] uppercase tracking-wider">Unggah Attachment Baru</label>
                    <div className="flex gap-2">
                      <select
                        value={detailUploadType}
                        onChange={(e) => setDetailUploadType(e.target.value as any)}
                        className="px-2 py-1.5 bg-white border border-[#E4E8F2] rounded-lg text-xs font-semibold focus:outline-none"
                      >
                        <option value="Surat Jalan">Surat Jalan</option>
                        <option value="Resi">Foto Resi</option>
                        <option value="Kuitansi">Kuitansi</option>
                        <option value="Approval">Approval</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Nama berkas..."
                        value={detailFileName}
                        onChange={(e) => setDetailFileName(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-[#E4E8F2] rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleDetailUpload}
                      className="w-full py-2 bg-[#0D21A1]/10 text-[#0D21A1] text-xs font-bold rounded-lg hover:bg-[#0D21A1]/20 transition-colors"
                    >
                      Unggah Berkas
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E4E8F2] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4E8F2] pb-3">
                  <h3 className="text-sm font-bold text-[#0F1629] uppercase tracking-wider flex items-center gap-2">
                    <Clock className="text-[#0D21A1] w-5 h-5" />
                    Tracking Audit Log
                  </h3>
                  <button 
                    onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                    className="text-xs font-semibold text-[#0D21A1] hover:underline"
                  >
                    {isHistoryExpanded ? 'Collapse' : 'Expand'}
                  </button>
                </div>

                {isHistoryExpanded && (
                  <div className="relative border-l border-indigo-200 ml-2 pl-4 space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {[...selectedOrder.historyLogs].reverse().map((log, idx) => (
                      <div key={idx} className="relative text-xs">
                        <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border border-white"></div>
                        <div className="font-bold text-[#0F1629]">{log.status}</div>
                        <div className="text-[#666E82] font-mono mt-0.5">{log.timestamp}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 flex flex-wrap gap-x-2">
                          <span>Odo: <strong className="font-mono">{log.odometer.toLocaleString()} km</strong></span>
                          <span>|</span>
                          <span>Admin: {log.user}</span>
                          {log.updated_at && (
                            <>
                              <span>|</span>
                              <span className="text-orange-600">Updated: {log.updated_at.slice(0,10)} by {log.updated_by}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Nested Tab Nav + Global Filter */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-xl border border-[#E4E8F2] shadow-sm mb-4">
            <div className="inline-flex p-1 bg-[#F6F8FD] rounded-lg border border-[#E4E8F2]">
              <button
                onClick={() => setTab('overview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-semibold transition-colors ${
                  tab === 'overview' ? 'bg-[#0D21A1] text-white' : 'text-[#666E82] hover:text-[#0F1629]'
                }`}
              >
                <CalendarRange className="w-4 h-4" />
                Fleet
              </button>
              <button
                onClick={() => setTab('orders')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-semibold transition-colors ${
                  tab === 'orders' ? 'bg-[#0D21A1] text-white' : 'text-[#666E82] hover:text-[#0F1629]'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Orders
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[12px] font-bold text-[#666E82] uppercase tracking-wider flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Unit Type:
              </label>
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-white border border-[#E4E8F2] rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D21A1]"
              >
                <option value="ALL">All Types (TWB & CDDL)</option>
                <option value="TWB">Tronton Wingbox (TWB)</option>
                <option value="CDDL">Colt Diesel Double Long (CDDL)</option>
              </select>
            </div>
          </div>

          {isOverviewMetricOpen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#E4E8F2] shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#666E82] uppercase tracking-wider block">Total Order Bulan Ini</span>
                  <strong className="text-2xl font-bold font-mono mt-1 block">{totalOrdersThisMonth}</strong>
                </div>
                <div className="p-3 bg-[#0D21A1]/10 text-[#0D21A1] rounded-lg">
                  <Briefcase className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E4E8F2] shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#666E82] uppercase tracking-wider block">Empty Fleet Hari Ini</span>
                  <strong className="text-2xl font-bold font-mono mt-1 block">{totalEmptyFleetToday}</strong>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                  <Truck className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E4E8F2] shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#666E82] uppercase tracking-wider block">Utilization Rate</span>
                  <strong className="text-2xl font-bold font-mono mt-1 block">{utilizationRate}%</strong>
                </div>
                <div className="p-3 bg-green-50 text-[#16A34A] rounded-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center -mt-2">
            <button
              onClick={() => setIsOverviewMetricOpen(!isOverviewMetricOpen)}
              className="px-3 py-1 bg-white border border-[#E4E8F2] rounded-full text-[10px] font-bold text-[#666E82] shadow-sm flex items-center gap-1 hover:bg-[#F6F8FD] transition-colors"
            >
              {isOverviewMetricOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {isOverviewMetricOpen ? 'Minimize Metrics' : 'Maximize Metrics'}
            </button>
          </div>

          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-[#E4E8F2] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E8F2] pb-3">
                  <h3 className="text-sm font-bold text-[#0F1629] uppercase tracking-wider flex items-center gap-2">
                    <Clock className="text-[#0D21A1] w-5 h-5" />
                    Active Shipments Timeline <span className="text-xs text-[#666E82] font-semibold lowercase font-sans">({new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })})</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex p-0.5 bg-[#F6F8FD] border border-[#E4E8F2] rounded-lg text-xs font-bold">
                      {(['3D', '7D', '1M'] as const).map(scale => (
                        <button
                          key={scale}
                          onClick={() => setTimelineScale(scale)}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            timelineScale === scale ? 'bg-[#0D21A1] text-white' : 'text-[#666E82] hover:text-[#0F1629]'
                          }`}
                        >
                          {scale}
                        </button>
                      ))}
                    </div>
                    <button className="px-3 py-1 bg-white border border-[#E4E8F2] rounded-lg text-xs font-bold hover:bg-[#F6F8FD]">
                      Today
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto space-y-4">
                  <div className="min-w-[800px]">
                    <div className="flex text-[10px] font-bold text-[#666E82] border-b border-[#F6F8FD] pb-2 text-center">
                      <div className="w-[20%] text-left">Plate / Driver</div>
                      <div className="w-[80%] flex justify-between">
                        {getTimelineDays().map((day, idx) => (
                          <div key={idx} className="flex-1 text-center font-semibold truncate border-l border-[#F6F8FD] first:border-0">
                            {day.label}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 mt-3 relative">
                      <div className="absolute left-[35%] top-0 bottom-0 w-0.5 bg-orange-500 z-10 opacity-70" title="Hari & Jam Saat Ini">
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[9px] px-1 rounded">NOW</span>
                      </div>

                      {activeFleets.map((f) => {
                        const fleetOrders = orders.filter(o => o.nopol === f.nopol && o.status !== 'Cancelled' && o.status !== 'Closed')
                        const isConflicted = hasConflict(f.nopol)
                        return (
                          <div key={f.nopol} className="flex items-center text-xs py-1">
                            <div className="w-[20%] font-semibold font-mono text-[#0F1629] flex flex-col">
                              <span className="flex items-center gap-1">
                                {f.nopol}
                                {isConflicted && (
                                  <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" title="Jadwal Overlap!" />
                                )}
                              </span>
                              <span className="text-[10px] font-sans font-normal text-[#666E82]">{f.driver}</span>
                            </div>
                            
                            <div className="w-[80%] relative h-7 bg-[#F6F8FD] rounded-lg border border-[#E4E8F2] overflow-hidden">
                              <div className="absolute inset-0 flex">
                                {getTimelineDays().map((_, idx) => (
                                  <div key={idx} className="flex-1 border-l border-[#E4E8F2]/40 first:border-0 h-full"></div>
                                ))}
                              </div>

                              {fleetOrders.length > 0 ? (
                                fleetOrders.map(order => (
                                  <div 
                                    key={order.id}
                                    onClick={() => setActiveOrderDetailId(order.id)}
                                    className={`absolute top-0.5 bottom-0.5 rounded cursor-pointer flex items-center px-2 text-[10px] font-bold text-white shadow-sm transition-all hover:scale-[1.01] ${
                                      order.status === 'Completed' 
                                        ? 'bg-gray-400 opacity-60' 
                                        : order.status === 'Draft/Request'
                                          ? 'bg-gradient-to-r from-[#16A34A] to-[#22C55E] border border-green-700'
                                          : 'bg-gradient-to-r from-[#0D21A1] to-[#4A63E6] border border-[#0A1A80]'
                                    }`}
                                    style={getTimelineStyle(order, timelineScale)}
                                    title={`Customer: ${order.customer}\nRute: ${getRouteText(order)}`}
                                  >
                                    <span className="truncate pr-1">
                                      {getRouteText(order)} - {order.statusDetail} - {order.customer}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                                  Empty
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E4E8F2] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4E8F2] pb-3">
                  <h3 className="text-sm font-bold text-[#0F1629] uppercase tracking-wider flex items-center gap-2">
                    Armada Status & Posisi
                  </h3>
                  <Link
                    href="/fleets"
                    className="px-3 py-1.5 bg-[#F6F8FD] hover:bg-[#0D21A1]/10 border border-[#E4E8F2] text-[#0D21A1] text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Manage Fleet
                    <ExternalLink className="w-3 h-3 text-[#0D21A1]/70" />
                  </Link>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E4E8F2] text-[#666E82] uppercase tracking-wider font-bold">
                        <th className="py-2.5">Nopol</th>
                        <th>Driver</th>
                        <th>GPS Location</th>
                        <th>Fleet Status</th>
                        <th>Current Order</th>
                        <th>Order Status</th>
                        <th>Next Order</th>
                        <th className="text-right">Maint.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F6F8FD]">
                      {activeFleets.map((f) => {
                        const activeOrder = orders.find(o => o.nopol === f.nopol && (o.status === 'Dispatched' || o.status === 'In Progress'))
                        return (
                          <tr key={f.nopol} className="hover:bg-[#F6F8FD]/50">
                            <td className="py-3 font-bold font-mono">{f.nopol}</td>
                            <td className="font-semibold">{f.driver}</td>
                            <td className="text-[#666E82]">
                              <span className="flex items-center gap-1.5 font-medium">
                                <span className={`w-2 h-2 rounded-full ${
                                  f.fleetStatus === 'moving' ? 'bg-green-500' :
                                  f.fleetStatus === 'idle' ? 'bg-amber-400' : 'bg-red-500'
                                }`} title={`GPS Status: ${f.fleetStatus}`} />
                                {f.location}
                              </span>
                            </td>
                            <td>
                              {(() => {
                                const st = getFleetStatusDisplay(f)
                                return (
                                  <div className="flex items-center gap-1.5">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${st.color}`}>
                                      {st.label}
                                    </span>
                                    <span className="font-mono text-[11px] font-semibold text-[#666E82]">{f.statusDuration}</span>
                                  </div>
                                )
                              })()}
                            </td>
                            <td className="font-semibold">
                              {activeOrder ? (
                                <button 
                                  onClick={() => setActiveOrderDetailId(activeOrder.id)}
                                  className="text-[#0D21A1] hover:underline text-left font-bold"
                                >
                                  {activeOrder.customer}
                                </button>
                              ) : 'N/A'}
                            </td>
                            <td>
                              {activeOrder ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => openStatusUpdateModal(activeOrder.id, activeOrder.statusDetail)}
                                    className="bg-[#F6F8FD] border border-[#E4E8F2] px-2 py-1 rounded font-bold text-[#0D21A1] hover:bg-[#0D21A1]/10"
                                  >
                                    {activeOrder.statusDetail}
                                  </button>
                                  <span className="font-mono text-[11px] font-semibold text-[#666E82]">{f.statusDuration}</span>
                                </div>
                              ) : (
                                <span className="text-[#666E82] font-semibold">-</span>
                              )}
                            </td>
                            <td>
                              {(() => {
                                const hasNextFutureOrder = orders.some(o => 
                                  o.nopol === f.nopol && 
                                  o.id !== activeOrder?.id && 
                                  o.status === 'Draft/Request' && 
                                  o.statusDetail === 'Fleet Assigned'
                                )
                                const displayNext = hasNextFutureOrder ? 'planned' : 'empty'
                                return (
                                  <span className={`font-semibold ${displayNext === 'planned' ? 'text-[#0D21A1]' : 'text-gray-400'}`}>
                                    {displayNext}
                                  </span>
                                )
                              })()}
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => openMaintModal(f.nopol)}
                                className="p-1 text-gray-400 hover:text-red-500 rounded border border-[#E4E8F2] hover:border-red-200 bg-white"
                                title="Set to Maintenance"
                              >
                                <Wrench className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E4E8F2] shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#DC2626] uppercase tracking-wider flex items-center gap-2 border-b border-[#E4E8F2] pb-3">
                  <AlertTriangle className="w-4 h-4" />
                  Armada Masuk Maintenance (Breakdown)
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E4E8F2] text-[#666E82] uppercase tracking-wider font-bold">
                        <th className="py-2.5">Nopol</th>
                        <th>Driver</th>
                        <th>Lokasi Terkini</th>
                        <th>Timestamp Masuk</th>
                        <th>Notes Perbaikan</th>
                        <th>Duration</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F6F8FD]">
                      {maintenanceFleets.map((f) => (
                        <tr key={f.nopol} className="hover:bg-[#F6F8FD]/50">
                          <td className="py-3 font-bold font-mono">{f.nopol}</td>
                          <td className="font-semibold">{f.driver}</td>
                          <td className="font-semibold text-muted-foreground">{f.location}</td>
                          <td className="font-mono">{f.maintenanceTime}</td>
                          <td className="text-muted-foreground font-semibold italic">{f.maintenanceNotes}</td>
                          <td className="font-mono">{f.statusDuration}</td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openMaintModal(f.nopol)}
                                className="px-2 py-1 bg-white border border-[#E4E8F2] hover:bg-[#F6F8FD] text-[#0F1629] rounded font-bold"
                              >
                                Edit Details
                              </button>
                              <button
                                onClick={() => openMaintCompleteModal(f.nopol)}
                                className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-bold"
                              >
                                Set Active
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {maintenanceFleets.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-sm text-[#666E82]">
                            Semua unit dalam kondisi prima. Tidak ada unit di bengkel.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-[#E4E8F2] shadow-sm flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#666E82] uppercase tracking-wider">Dari Tanggal</label>
                      <input
                        type="date"
                        value={startDateFilter}
                        onChange={(e) => setStartDateFilter(e.target.value)}
                        className="px-3 py-1.5 bg-[#F6F8FD] border border-[#E4E8F2] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D21A1]"
                      />
                    </div>
                    <span className="text-xs text-[#666E82] font-bold mt-4">-</span>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#666E82] uppercase tracking-wider">Sampai Tanggal</label>
                      <input
                        type="date"
                        value={endDateFilter}
                        onChange={(e) => setEndDateFilter(e.target.value)}
                        className="px-3 py-1.5 bg-[#F6F8FD] border border-[#E4E8F2] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D21A1]"
                      />
                    </div>
                    {(startDateFilter || endDateFilter || nopolFilter) && (
                      <button
                        onClick={() => { setStartDateFilter(''); setEndDateFilter(''); setNopolFilter('') }}
                        className="text-[10px] font-bold text-red-600 hover:underline mt-4 px-1"
                        title="Reset Semua Filter"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#666E82] uppercase tracking-wider">Filter Status Order</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-1.5 bg-[#F6F8FD] border border-[#E4E8F2] rounded-lg text-xs font-bold focus:outline-none"
                    >
                      <option value="ALL">All Status</option>
                      <option value="Draft">Draft</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Running">Running</option>
                      <option value="Complete">Complete</option>
                      <option value="Closed">Closed</option>
                      <option value="Canceled">Canceled</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#666E82] uppercase tracking-wider">Cari Nopol / Driver</label>
                    <input
                      type="text"
                      placeholder="Cth: B 9182 / Ahmad"
                      value={nopolFilter}
                      onChange={(e) => setNopolFilter(e.target.value)}
                      className="px-3 py-1.5 bg-[#F6F8FD] border border-[#E4E8F2] rounded-lg text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D21A1] w-44"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCsvDownload}
                    className="px-4 py-2 bg-white border border-[#E4E8F2] hover:bg-[#F6F8FD] text-[#0D21A1] text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Log CSV
                  </button>

                  <button
                    onClick={() => setIsCreateOrderOpen(!isCreateOrderOpen)}
                    className="px-4 py-2 bg-[#0D21A1] hover:bg-[#2740D6] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Order
                  </button>
                </div>
              </div>

              {isCreateOrderOpen && (
                <div className="bg-white p-6 rounded-2xl border border-[#E4E8F2] shadow-sm space-y-4 relative transition-all">
                  <button 
                    onClick={() => setIsCreateOrderOpen(false)}
                    className="absolute top-4 right-4 p-1 hover:bg-[#F6F8FD] rounded text-gray-400 hover:text-[#0F1629]"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h3 className="text-sm font-bold text-[#0F1629] uppercase tracking-wider flex items-center gap-2 border-b border-[#E4E8F2] pb-3">
                    Create Spot Order (On Call)
                  </h3>

                  <form onSubmit={handleCreateOrder} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#666E82] uppercase tracking-wider">Unit Type *</label>
                        {unitFilter !== 'ALL' ? (
                          <div className="px-3.5 py-2 bg-[#F6F8FD] border border-[#E4E8F2] rounded-lg text-sm font-bold text-[#0D21A1]">
                            {unitFilter}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            {(['TWB', 'CDDL'] as const).map(type => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setNewUnitType(type)}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-colors ${
                                  newUnitType === type
                                    ? 'bg-[#0D21A1] text-white border-[#0D21A1]'
                                    : 'bg-white text-[#666E82] border-[#E4E8F2] hover:bg-[#F6F8FD]'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#666E82] uppercase tracking-wider">Customer Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="PT. Unilever Indonesia"
                          value={newCustomer}
                          onChange={(e) => setNewCustomer(e.target.value)}
                          className="px-3.5 py-2 border border-[#E4E8F2] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D21A1]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#666E82] uppercase tracking-wider">Shipper *</label>
                        <input
                          type="text"
                          required
                          placeholder="Warehouse Cikarang CDC"
                          value={newShipper}
                          onChange={(e) => setNewShipper(e.target.value)}
                          className="px-3.5 py-2 border border-[#E4E8F2] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D21A1]"
                        />
                      </div>
                    </div>

                    <div className="bg-[#F6F8FD] p-4 rounded-xl border border-[#E4E8F2] space-y-4">
                      <label className="text-xs font-bold text-[#0F1629] uppercase tracking-wider flex items-center gap-1.5">
                        <RouteIcon className="w-4 h-4 text-[#0D21A1]" />
                        Dynamic Waypoints Routing (Multitrip)
                      </label>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="w-20 text-xs font-bold text-[#666E82] uppercase">Start Point *</span>
                          <input
                            type="text"
                            required
                            placeholder="Pool Keberangkatan awal"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            className="flex-1 px-3.5 py-2 border border-[#E4E8F2] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D21A1]"
                          />
                          <div className="w-9"></div>
                        </div>

                        {loadings.map((l, index) => (
                          <div key={`load-${index}`} className="flex items-center gap-3">
                            <span className="w-20 text-xs font-bold text-[#666E82] uppercase">Muat {index + 1}</span>
                            <input
                              type="text"
                              placeholder="Alamat Lokasi Muat Tambahan"
                              value={l}
                              onChange={(e) => {
                                const updated = [...loadings]
                                updated[index] = e.target.value
                                setLoadings(updated)
                              }}
                              className="flex-1 px-3.5 py-2 border border-[#E4E8F2] rounded-lg text-sm bg-white focus:outline-none"
                            />
                            {index === loadings.length - 1 ? (
                              <button
                                type="button"
                                onClick={addLoadingField}
                                className="w-9 h-9 flex items-center justify-center bg-white border border-[#E4E8F2] text-[#0D21A1] rounded-lg hover:bg-slate-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => removeLoadingField(index)}
                                className="w-9 h-9 flex items-center justify-center bg-white border border-red-200 text-red-500 rounded-lg hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}

                        {unloadings.map((u, index) => (
                          <div key={`unload-${index}`} className="flex items-center gap-3">
                            <span className="w-20 text-xs font-bold text-[#666E82] uppercase">Bongkar {index + 1}</span>
                            <input
                              type="text"
                              placeholder="Alamat Lokasi Bongkar Tambahan"
                              value={u}
                              onChange={(e) => {
                                const updated = [...unloadings]
                                updated[index] = e.target.value
                                setUnloadings(updated)
                              }}
                              className="flex-1 px-3.5 py-2 border border-[#E4E8F2] rounded-lg text-sm bg-white focus:outline-none"
                            />
                            {index === unloadings.length - 1 ? (
                              <button
                                type="button"
                                onClick={addUnloadingField}
                                className="w-9 h-9 flex items-center justify-center bg-white border border-[#E4E8F2] text-[#0D21A1] rounded-lg hover:bg-slate-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => removeUnloadingField(index)}
                                className="w-9 h-9 flex items-center justify-center bg-white border border-red-200 text-red-500 rounded-lg hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}

                        <div className="flex items-center gap-3">
                          <span className="w-20 text-xs font-bold text-[#666E82] uppercase">End Point</span>
                          <input
                            type="text"
                            placeholder="Lokasi Akhir (Roundtrip, nullable)"
                            value={newEndPoint}
                            onChange={(e) => setNewEndPoint(e.target.value)}
                            className="flex-1 px-3.5 py-2 border border-[#E4E8F2] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D21A1]"
                          />
                          <div className="w-9"></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#666E82] uppercase tracking-wider">Tanggal Jalan *</label>
                        <input
                          type="datetime-local"
                          required
                          value={newTanggalJalan}
                          onChange={(e) => setNewTanggalJalan(e.target.value)}
                          className="px-3.5 py-2 border border-[#E4E8F2] rounded-lg text-sm focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#666E82] uppercase tracking-wider">Estimasi Jarak (KM) *</label>
                        <input
                          type="number"
                          required
                          placeholder="km"
                          value={estimatedKm}
                          onChange={(e) => setEstimatedKm(e.target.value)}
                          className="px-3.5 py-2 border border-[#E4E8F2] rounded-lg text-sm focus:outline-none font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#666E82] uppercase tracking-wider">Estimasi Waktu (Hari) *</label>
                        <input
                          type="number"
                          required
                          placeholder="Hari"
                          value={estimatedDays}
                          onChange={(e) => setEstimatedDays(e.target.value)}
                          className="px-3.5 py-2 border border-[#E4E8F2] rounded-lg text-sm focus:outline-none font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#666E82] uppercase tracking-wider">Uang Jalan *</label>
                        <input
                          type="number"
                          required
                          placeholder="Rupiah"
                          value={newCostAllowance}
                          onChange={(e) => setNewCostAllowance(e.target.value)}
                          className="px-3.5 py-2 border border-[#E4E8F2] rounded-lg text-sm focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#666E82] uppercase tracking-wider">Rate Order *</label>
                        <input
                          type="number"
                          required
                          placeholder="Rupiah"
                          value={newRate}
                          onChange={(e) => setNewRate(e.target.value)}
                          className="px-3.5 py-2 border border-[#E4E8F2] rounded-lg text-sm focus:outline-none font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#666E82] uppercase tracking-wider">Notes (Catatan)</label>
                        <textarea
                          placeholder="Ketik keterangan atau catatan khusus di sini..."
                          value={newNotes}
                          onChange={(e) => setNewNotes(e.target.value)}
                          className="px-3.5 py-2 border border-[#E4E8F2] rounded-lg text-sm focus:outline-none h-16"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#0D21A1] text-white text-sm font-bold rounded-lg shadow-md hover:bg-[#2740D6] transition-colors"
                      >
                        Create Order Request
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white p-5 rounded-2xl border border-[#E4E8F2] shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#0F1629] uppercase tracking-wider flex items-center gap-2 border-b border-[#E4E8F2] pb-3">
                  Orders List
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E4E8F2] text-[#666E82] uppercase tracking-wider font-bold">
                        <th className="py-2.5">Action Panel</th>
                        <th>Customer / Shipper</th>
                        <th>Fleet</th>
                        <th>Rute & Tanggal Jalan</th>
                        <th>Status</th>
                        <th className="text-right">Nav</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F6F8FD]">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-[#F6F8FD]/50">
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              {o.status === 'Draft/Request' && o.statusDetail !== 'Fleet Assigned' && (
                                <button
                                  onClick={() => openAssignModal(o.id)}
                                  className="px-2.5 py-1 bg-[#0D21A1]/10 text-[#0D21A1] font-bold rounded hover:bg-[#0D21A1]/20 transition-colors"
                                >
                                  Assign Fleet
                                </button>
                              )}

                              {o.status === 'Draft/Request' && o.statusDetail === 'Fleet Assigned' && (
                                <button
                                  onClick={() => openDispatchModal(o.id)}
                                  className="px-2.5 py-1 bg-gradient-to-r from-[#0D21A1] to-[#2740D6] text-white font-bold rounded hover:scale-[1.01] transition-all shadow-sm"
                                >
                                  Dispatch
                                </button>
                              )}

                              {o.status !== 'Draft/Request' && o.status !== 'Completed' && o.status !== 'Closed' && o.status !== 'Cancelled' && (
                                <button
                                  onClick={() => openStatusUpdateModal(o.id, o.statusDetail)}
                                  className="px-2.5 py-1 bg-[#F6F8FD] border border-[#E4E8F2] text-[#0D21A1] rounded font-bold hover:bg-[#0D21A1]/10 flex items-center gap-1 transition-colors"
                                >
                                  <TrendingUp className="w-3 h-3" />
                                  Ubah Status
                                </button>
                              )}

                              {(() => {
                                const hasSjAttachment = o.attachments.some(att => att.type === 'Surat Jalan')

                                if (o.status === 'Completed') {
                                  if (!hasSjAttachment) {
                                    return (
                                      <button
                                        onClick={() => openSjModal(o.id)}
                                        className="px-2.5 py-1 bg-green-600 text-white rounded font-bold hover:bg-green-700 flex items-center gap-1 shadow-sm transition-colors"
                                      >
                                        <Upload className="w-3 h-3" />
                                        Upload SJ
                                      </button>
                                    )
                                  } else {
                                    return (
                                      <button
                                        onClick={() => openResiModal(o.id)}
                                        className="px-2.5 py-1 bg-[#EA580C] text-white rounded font-bold hover:bg-[#d95007] flex items-center gap-1 shadow-sm transition-colors"
                                      >
                                        <Upload className="w-3 h-3" />
                                        Upload Resi
                                      </button>
                                    )
                                  }
                                }
                                return null
                              })()}

                              {(o.status === 'Closed' || o.status === 'Cancelled') && (
                                <span className="text-[#666E82] font-bold uppercase italic text-[10px]">Locked</span>
                              )}
                            </div>
                          </td>

                          <td>
                            <div className="font-bold">{o.customer}</div>
                            <div className="text-[10px] text-[#666E82] mt-0.5">{o.shipper}</div>
                          </td>

                          <td>
                            {o.nopol ? (
                              <div>
                                <div className="font-bold font-mono">{o.nopol} ({o.unitType})</div>
                                <div className="text-[#666E82] text-[10px]">{o.driverName}</div>
                              </div>
                            ) : (
                              <span className="text-[#666E82] italic">Not assigned</span>
                            )}
                          </td>

                          <td>
                            <div className="font-bold">
                              {o.waypoints[0]?.address} ➡️ {o.waypoints[o.waypoints.length - 1]?.address}
                            </div>
                            <div className="text-[10px] text-[#666E82] font-mono mt-0.5">{o.tanggalJalan}</div>
                          </td>

                          <td>
                            {o.status !== 'Closed' && o.status !== 'Cancelled' && o.nopol ? (
                              <span 
                                onClick={() => openStatusUpdateModal(o.id, o.statusDetail)}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] cursor-pointer hover:ring-2 hover:ring-[#0D21A1] transition-all ${
                                  o.status === 'Draft/Request' ? 'bg-amber-100 text-amber-700' :
                                  o.status === 'Dispatched' ? 'bg-blue-100 text-blue-700' :
                                  o.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' :
                                  o.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                  o.status === 'Closed' ? 'bg-gray-100 text-gray-700' :
                                  'bg-red-100 text-red-700'
                                }`}
                                title="Click to change status"
                              >
                                {o.statusDetail}
                              </span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                                o.status === 'Draft/Request' ? 'bg-amber-100 text-amber-700' :
                                o.status === 'Dispatched' ? 'bg-blue-100 text-blue-700' :
                                o.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' :
                                o.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                o.status === 'Closed' ? 'bg-gray-100 text-gray-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {o.statusDetail}
                              </span>
                            )}
                          </td>

                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setActiveOrderDetailId(o.id)}
                                className="p-1 border border-[#E4E8F2] hover:bg-[#F6F8FD] rounded text-[#0D21A1]"
                                title="Specific Order Page"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {o.status !== 'Closed' && o.status !== 'Cancelled' && (
                                <button
                                  onClick={() => {
                                    setEditOrderObj(o)
                                    setIsEditModalOpen(true)
                                  }}
                                  className="p-1 border border-[#E4E8F2] hover:bg-[#F6F8FD] rounded text-gray-600"
                                  title="Edit Order"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {o.status === 'Draft/Request' ? (
                                <button
                                  onClick={() => handleDeleteDraft(o.id)}
                                  className="p-1 border border-red-200 hover:bg-red-50 rounded text-red-600"
                                  title="Delete Request"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                o.status !== 'Closed' && o.status !== 'Cancelled' && o.statusDetail !== 'Antri Bongkar' && (
                                  <button
                                    onClick={() => openCancelModal(o.id)}
                                    className="p-1 border border-red-200 hover:bg-red-50 rounded text-red-500 font-bold text-[10px] uppercase px-1.5"
                                    title="Cancel Order"
                                  >
                                    Cancel
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </>
      )}

      {/* ASSIGN ACTIVE FLEET MODAL POPUP */}
      {activeAssignOrderId !== null && (() => {
        const targetOrder = orders.find(o => o.id === activeAssignOrderId)
        const targetUnitType = targetOrder?.unitType
        
        const filteredAssignableFleets = fleets.filter(f => {
          if (f.fleetStatus === 'breakdown') return false
          if (targetUnitType && f.type !== targetUnitType) return false
          if (unitFilter !== 'ALL' && f.type !== unitFilter) return false
          if (assignSearchQuery.trim() !== '') {
            const q = assignSearchQuery.toLowerCase()
            const matchNopol = f.nopol.toLowerCase().includes(q)
            const matchDriver = f.driver.toLowerCase().includes(q)
            return matchNopol || matchDriver
          }
          return true
        })

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-5 rounded-2xl max-w-sm w-full space-y-4 shadow-xl border border-[#E4E8F2]">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#0F1629] uppercase tracking-wider">Assign Active Fleet</h3>
                  {targetUnitType && (
                    <span className="text-[10px] font-bold bg-[#0D21A1]/10 text-[#0D21A1] px-2 py-0.5 rounded-full border border-[#0D21A1]/20 font-mono">
                      {targetUnitType}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Pilih armada kosong {targetUnitType ? `bertipe ${targetUnitType}` : ''} untuk order ini.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#666E82]">Cari & Pilih Truk (Nopol / Driver) *</label>
                  <input
                    type="text"
                    placeholder="Ketik nopol (cth: B 9182) atau driver..."
                    value={assignSearchQuery}
                    onChange={(e) => setAssignSearchQuery(e.target.value)}
                    className="px-3 py-2 border border-[#E4E8F2] rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0D21A1]"
                  />

                  <div className="max-h-40 overflow-y-auto border border-[#E4E8F2] rounded-lg divide-y divide-[#F6F8FD] bg-[#F6F8FD]/30">
                    {filteredAssignableFleets.length > 0 ? (
                      filteredAssignableFleets.map(f => (
                        <div
                          key={f.nopol}
                          onClick={() => {
                            setAssignNopol(f.nopol)
                            setAssignDriver(f.driver)
                            setAssignOdo(String(f.odometer || 120300))
                          }}
                          className={`p-2.5 flex items-center justify-between cursor-pointer hover:bg-[#F6F8FD] transition-colors ${
                            assignNopol === f.nopol ? 'bg-[#0D21A1]/10 font-bold border-l-4 border-[#0D21A1]' : ''
                          }`}
                        >
                          <div>
                            <span className="font-mono font-bold text-[#0F1629] block">{f.nopol}</span>
                            <span className="text-[11px] text-[#666E82]">{f.driver}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold text-[9px] uppercase">
                              {f.type}
                            </span>
                            {assignNopol === f.nopol && (
                              <Check className="w-4 h-4 text-[#0D21A1]" />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-gray-400 font-semibold">
                        Tidak ada armada {targetUnitType || ''} yang cocok
                      </div>
                    )}
                  </div>
                </div>

                {assignNopol && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-[#666E82]">Nama Driver *</label>
                      <input
                        type="text"
                        value={assignDriver}
                        onChange={(e) => setAssignDriver(e.target.value)}
                        className="px-3 py-2 border border-[#E4E8F2] rounded-lg text-xs font-semibold"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-[#666E82]">Odometer Berangkat *</label>
                      <input
                        type="number"
                        value={assignOdo}
                        onChange={(e) => setAssignOdo(e.target.value)}
                        className="px-3 py-2 border border-[#E4E8F2] rounded-lg text-xs font-mono"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 text-xs font-bold pt-2">
                <button
                  type="button"
                  onClick={() => setActiveAssignOrderId(null)}
                  className="px-4 py-2 border border-[#E4E8F2] text-[#666E82] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignCommit}
                  className="px-4 py-2 bg-[#0D21A1] text-white rounded-lg hover:bg-[#2740D6]"
                >
                  Assign Fleet
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* DISPATCH SO MODAL POPUP */}
      {activeDispatchOrderId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 rounded-2xl max-w-sm w-full space-y-4 shadow-xl border border-[#E4E8F2]">
            <div>
              <h3 className="font-bold text-sm text-[#0F1629] uppercase tracking-wider">Dispatch Order</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Masukkan nomor SO Odoo untuk melepaskan order.</p>
            </div>
            
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#666E82]">Sales Order (SO) Number *</label>
                <input
                  type="text"
                  placeholder="SO/IBL/0087"
                  value={inputSoNumber}
                  onChange={(e) => setInputSoNumber(e.target.value)}
                  className="px-3 py-2 border border-[#E4E8F2] rounded-lg text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#666E82]">Tanggal & Jam Kejadian (WIB) *</label>
                <input
                  type="datetime-local"
                  value={dispatchTime}
                  onChange={(e) => setDispatchTime(e.target.value)}
                  className="px-3 py-2 border border-[#E4E8F2] rounded-lg text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#666E82]">Odometer Dispatch (KM) *</label>
                <input
                  type="number"
                  value={dispatchOdo}
                  onChange={(e) => setDispatchOdo(e.target.value)}
                  className="px-3 py-2 border border-[#E4E8F2] rounded-lg text-xs font-mono focus:outline-none"
                />
              </div>

              {soError && <span className="text-xs text-red-600 font-semibold">{soError}</span>}
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button
                type="button"
                onClick={() => setActiveDispatchOrderId(null)}
                className="px-4 py-2 border border-[#E4E8F2] text-[#666E82] rounded-lg hover:bg-[#F6F8FD]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDispatchCommit}
                disabled={isValidatingSo}
                className="px-4 py-2 bg-[#0D21A1] text-white rounded-lg hover:bg-[#2740D6] flex items-center gap-1.5"
              >
                {isValidatingSo ? 'Validating Odoo...' : 'Verify & Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMIT STATUS LOG MODAL POPUP */}
      {activeUpdateOrderId !== null && (() => {
        const orderObj = orders.find(o => o.id === activeUpdateOrderId)
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-5 rounded-2xl max-w-sm w-full space-y-4 shadow-xl border border-[#E4E8F2]">
              <div>
                <h3 className="font-bold text-sm text-[#0F1629] uppercase tracking-wider">Commit Status Change</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Catat timestamp aktual kejadian dan kilometer odometer untuk audit log.</p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#666E82] uppercase tracking-wider font-semibold">Pilih Status *</label>
                  <select
                    value={nextStatusDetail}
                    onChange={(e) => setNextStatusDetail(e.target.value)}
                    className="px-3 py-2 border border-[#E4E8F2] rounded-lg text-sm font-bold text-[#0D21A1] focus:outline-none focus:ring-2 focus:ring-[#0D21A1]"
                  >
                    {orderObj && getPossibleStatusDetails(orderObj).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#666E82] uppercase tracking-wider">Tanggal & Jam Kejadian (WIB) *</label>
                  <input
                    type="datetime-local"
                    value={inputTime}
                    onChange={(e) => setInputTime(e.target.value)}
                    className="px-3 py-2 border border-[#E4E8F2] rounded-lg text-sm font-mono focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#666E82] uppercase tracking-wider">Odometer Odo (KM) *</label>
                  <input
                    type="number"
                    placeholder="Kilometer"
                    value={inputOdometer}
                    onChange={(e) => setInputOdometer(e.target.value)}
                    className="px-3 py-2 border border-[#E4E8F2] rounded-lg text-sm font-mono focus:outline-none"
                  />
                </div>
                {odoError && <span className="text-xs text-red-600 font-semibold">{odoError}</span>}
              </div>

              <div className="flex justify-end gap-2 text-xs font-bold pt-2">
                <button
                  type="button"
                  onClick={() => setActiveUpdateOrderId(null)}
                  className="px-4 py-2 border border-[#E4E8F2] text-[#666E82] rounded-lg hover:bg-[#F6F8FD]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStatusCommit}
                  className="px-4 py-2 bg-[#0D21A1] text-white rounded-lg hover:bg-[#2740D6]"
                >
                  Commit Changes
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* CANCEL ORDER MODAL */}
      {activeCancelOrderId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 rounded-2xl max-w-sm w-full space-y-4 shadow-xl border border-[#E4E8F2]">
            <div>
              <h3 className="font-bold text-sm text-[#0F1629] uppercase tracking-wider">Cancel Order Request</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Batalkan order dan kembalikan unit fleet ke status empty.</p>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#666E82]">Tanggal & Jam Pembatalan (WIB) *</label>
                <input
                  type="datetime-local"
                  value={cancelTime}
                  onChange={(e) => setCancelTime(e.target.value)}
                  className="px-3 py-2 border border-[#E4E8F2] rounded-lg font-mono focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#666E82]">Alasan Pembatalan *</label>
                <textarea
                  placeholder="Ketik alasan pembatalan order di sini..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="px-3 py-2 border border-[#E4E8F2] rounded-lg focus:outline-none h-16"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button
                type="button"
                onClick={() => setActiveCancelOrderId(null)}
                className="px-4 py-2 border border-[#E4E8F2] text-[#666E82] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCancelCommit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD SURAT JALAN SOFTCOPY MODAL */}
      {activeSjOrderId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 rounded-2xl max-w-sm w-full space-y-4 shadow-xl border border-[#E4E8F2]">
            <div>
              <h3 className="font-bold text-sm text-[#0F1629] uppercase tracking-wider">Upload Surat Jalan Softcopy</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Unggah bukti softcopy Surat Jalan untuk menyelesaikan order (Complete).</p>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer p-2 bg-[#F6F8FD] rounded-lg border border-[#E4E8F2]">
                <input
                  type="checkbox"
                  checked={sjVerified}
                  onChange={(e) => setSjVerified(e.target.checked)}
                  className="rounded text-[#0D21A1] w-4 h-4 focus:ring-0"
                />
                <span className="font-bold text-[#0F1629]">Softcopy Surat Jalan Telah Sesuai *</span>
              </label>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#666E82]">Nama File Surat Jalan (Optional)</label>
                <input
                  type="text"
                  placeholder="Contoh: SJ_SOFTCOPY_0087.pdf"
                  value={sjFileName}
                  onChange={(e) => setSjFileName(e.target.value)}
                  className="px-3 py-2 border border-[#E4E8F2] rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button
                type="button"
                onClick={() => setActiveSjOrderId(null)}
                className="px-4 py-2 border border-[#E4E8F2] text-[#666E82] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSjCommit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
              >
                Upload & Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD RESI MODAL */}
      {activeResiOrderId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 rounded-2xl max-w-sm w-full space-y-4 shadow-xl border border-[#E4E8F2]">
            <div>
              <h3 className="font-bold text-sm text-[#0F1629] uppercase tracking-wider">Upload Resi Fisik</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Ubah status order ke Closed dengan memverifikasi tanda terima fisik.</p>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer p-2 bg-[#F6F8FD] rounded-lg border border-[#E4E8F2]">
                <input
                  type="checkbox"
                  checked={resiFisikTerkirim}
                  onChange={(e) => setResiFisikTerkirim(e.target.checked)}
                  className="rounded text-[#0D21A1] w-4 h-4 focus:ring-0"
                />
                <span className="font-bold text-[#0F1629]">Fisik Surat Jalan Terkirim *</span>
              </label>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#666E82]">Nama File Foto Resi (Optional)</label>
                <input
                  type="text"
                  placeholder="Contoh: RESI_FISIK_0087.png"
                  value={resiFileName}
                  onChange={(e) => setResiFileName(e.target.value)}
                  className="px-3 py-2 border border-[#E4E8F2] rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button
                type="button"
                onClick={() => setActiveResiOrderId(null)}
                className="px-4 py-2 border border-[#E4E8F2] text-[#666E82] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResiCommit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Close Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ORDER MODAL */}
      {isEditModalOpen && editOrderObj && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 rounded-2xl max-w-lg w-full space-y-4 shadow-xl border border-[#E4E8F2] max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#E4E8F2] pb-2">
              <h3 className="font-bold text-sm text-[#0F1629] uppercase tracking-wider">Edit Order Request</h3>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-black" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#666E82]">Customer Name</label>
                  <input
                    type="text"
                    value={editOrderObj.customer}
                    onChange={(e) => setEditOrderObj({ ...editOrderObj, customer: e.target.value })}
                    className="px-3 py-2 border border-[#E4E8F2] rounded"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#666E82]">Shipper Name</label>
                  <input
                    type="text"
                    value={editOrderObj.shipper}
                    onChange={(e) => setEditOrderObj({ ...editOrderObj, shipper: e.target.value })}
                    className="px-3 py-2 border border-[#E4E8F2] rounded"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#666E82]">Tanggal Jalan</label>
                  <input
                    type="datetime-local"
                    value={editOrderObj.tanggalJalan}
                    onChange={(e) => setEditOrderObj({ ...editOrderObj, tanggalJalan: e.target.value })}
                    className="px-3 py-2 border border-[#E4E8F2] rounded"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#666E82]">Odoo Sales Order</label>
                  <input
                    type="text"
                    value={editOrderObj.odooSo}
                    onChange={(e) => setEditOrderObj({ ...editOrderObj, odooSo: e.target.value })}
                    className="px-3 py-2 border border-[#E4E8F2] rounded font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#666E82]">Uang Jalan (Allowance)</label>
                  <input
                    type="number"
                    value={editOrderObj.costAllowance}
                    onChange={(e) => setEditOrderObj({ ...editOrderObj, costAllowance: Number(e.target.value) })}
                    className="px-3 py-2 border border-[#E4E8F2] rounded font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#666E82]">Rate Order</label>
                  <input
                    type="number"
                    value={editOrderObj.rate}
                    onChange={(e) => setEditOrderObj({ ...editOrderObj, rate: Number(e.target.value) })}
                    className="px-3 py-2 border border-[#E4E8F2] rounded font-mono"
                  />
                </div>
              </div>

              <div className="bg-[#F6F8FD] p-3 rounded border border-[#E4E8F2] space-y-2">
                <label className="font-bold text-[#666E82]">Edit Waypoints Rute</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-gray-500">Origin</span>
                    <input
                      type="text"
                      value={editOrderObj.origin}
                      onChange={(e) => setEditOrderObj({ ...editOrderObj, origin: e.target.value })}
                      className="px-3 py-1.5 border border-[#E4E8F2] bg-white rounded"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-gray-500">Bongkar Akhir</span>
                    <input
                      type="text"
                      value={editOrderObj.destination}
                      onChange={(e) => setEditOrderObj({ ...editOrderObj, destination: e.target.value })}
                      className="px-3 py-1.5 border border-[#E4E8F2] bg-white rounded"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-500">End Point (Return Address)</span>
                  <input
                    type="text"
                    value={editOrderObj.endPoint || ''}
                    onChange={(e) => setEditOrderObj({ ...editOrderObj, endPoint: e.target.value })}
                    className="px-3 py-1.5 border border-[#E4E8F2] bg-white rounded"
                  />
                </div>
              </div>

              {editOrderObj.status !== 'Closed' && editOrderObj.status !== 'Cancelled' && (
                <div className="bg-[#F6F8FD] p-3 rounded border border-[#E4E8F2] space-y-2">
                  <label className="font-bold text-[#666E82] block">Penggantian Nopol / Driver</label>
                  <select
                    value={editOrderObj.nopol}
                    onChange={(e) => {
                      const fl = fleets.find(f => f.nopol === e.target.value)
                      if (fl) {
                        setEditOrderObj({ ...editOrderObj, nopol: fl.nopol, driverName: fl.driver })
                      }
                    }}
                    className="px-3 py-1.5 border border-[#E4E8F2] bg-white rounded w-full"
                  >
                    <option value="">Pilih...</option>
                    {fleets.map(f => (
                      <option key={f.nopol} value={f.nopol}>{f.nopol} - {f.driver} ({f.type})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E4E8F2]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-[#E4E8F2] text-[#666E82] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D21A1] text-white rounded font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SET TO MAINTENANCE */}
      {activeMaintNopol !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 rounded-2xl max-w-sm w-full space-y-4 shadow-xl border border-[#E4E8F2]">
            <div>
              <h3 className="font-bold text-sm text-[#0F1629] uppercase tracking-wider">Set Fleet to Maintenance</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Tandai nopol {activeMaintNopol} masuk ke bengkel/breakdown.</p>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#666E82]">Timestamp Masuk Perbaikan *</label>
                <input
                  type="text"
                  value={maintTime}
                  onChange={(e) => setMaintTime(e.target.value)}
                  className="px-3 py-2 border border-[#E4E8F2] rounded-lg font-mono focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#666E82]">Alasan / Catatan Perbaikan *</label>
                <textarea
                  placeholder="Contoh: Radiator bocor, rem blong, dll..."
                  value={maintNotes}
                  onChange={(e) => setMaintNotes(e.target.value)}
                  className="px-3 py-2 border border-[#E4E8F2] rounded-lg focus:outline-none h-16"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button
                type="button"
                onClick={() => setActiveMaintNopol(null)}
                className="px-4 py-2 border border-[#E4E8F2] text-[#666E82] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMaintCommit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SET ACTIVE MODAL */}
      {activeMaintCompleteNopol !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 rounded-2xl max-w-sm w-full space-y-4 shadow-xl border border-[#E4E8F2]">
            <div>
              <h3 className="font-bold text-sm text-[#0F1629] uppercase tracking-wider">Set Fleet to Active</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Tandai perbaikan nopol {activeMaintCompleteNopol} selesai.</p>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#666E82]">Timestamp Keluar Perbaikan *</label>
                <input
                  type="text"
                  value={maintCompleteTime}
                  onChange={(e) => setMaintCompleteTime(e.target.value)}
                  className="px-3 py-2 border border-[#E4E8F2] rounded-lg font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button
                type="button"
                onClick={() => setActiveMaintCompleteNopol(null)}
                className="px-4 py-2 border border-[#E4E8F2] text-[#666E82] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMaintCompleteCommit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Save & Set Active
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
