
export type Role = 'Administrador' | 'Vendedor' | 'Técnico' | 'Cliente' | 'Tienda en línea' | 'Secretaria Facturista';

export type Branch = 'Centro' | 'Norte' | 'Frontera';

export interface SystemUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: Role;
  branch: Branch;
  createdAt: string;
}

export interface Sucursal {
  id: string;
  nombre: Branch;
  direccion?: string;
  telefono?: string;
  created_at: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  rfc?: string;
  telefono?: string;
  direccion?: string;
  placa_vehiculo: string;
  sucursal_registro_id: Branch;
  created_at: string;
  updated_at: string;
  isActive?: boolean;
}

export type StatusColor = 'verde' | 'amarillo' | 'rojo';

export interface InspectionPoint {
  label: string;
  status: StatusColor;
  icon: string;
}

export interface InspectionData {
  tires: {
    fl: { depth: number; psi: number };
    fr: { depth: number; psi: number };
    rl: { depth: number; psi: number };
    rr: { depth: number; psi: number };
  };
  checklist: InspectionPoint[];
  completedAt?: string;
}

export interface VehicleEntry {
  id: string;
  plate: string;
  brand: string;
  model: string;
  reason: string;
  status: 'recepcion' | 'taller' | 'inspeccionada' | 'listo';
  entryTime: string;
  branch: Branch;
  inspection?: InspectionData;
}

export type WarehouseName = 'Bodega 1' | 'Bodega 2';

export interface Tire {
  id: string;
  brand: string;
  model: string;
  width: number;
  profile: number;
  rim: number;
  size: string;
  price: number;
  stock: number; // General stock for listing, but we might need branch-specific later
  branchStocks: Record<Branch, number>;
  warehouseStocks?: Record<WarehouseName, number>;
  discount?: number;
  image: string;
  isActive?: boolean;
}

export type MovementType = 'Entrada' | 'Salida';

export interface InventoryMovement {
  id: string;
  tireId: string;
  type: MovementType;
  quantity: number;
  reason: string;
  branch: Branch;
  date: string;
  user: string;
}

export type TransferStatus = 'En Tránsito' | 'Recibido' | 'Cancelado';

export interface StockTransfer {
  id: string;
  tireId: string;
  fromBranch: Branch;
  toBranch: Branch;
  quantity: number;
  status: TransferStatus;
  sentDate: string;
  receivedDate?: string;
  user: string;
}

export interface ExchangeRate {
  rate: number;
  lastUpdate: string;
}

export type NoteType = 'Venta' | 'Apartado' | 'Pedido';

export type NoteStatus = 'Pendiente' | 'Pagado' | 'En Taller' | 'Listo para Entrega' | 'Finalizado';

export interface NoteItem {
  id: string;
  type: 'Producto' | 'Servicio';
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  image?: string;
}

export interface ServiceNote {
  id: string;
  folio: string;
  type: NoteType;
  status: NoteStatus;
  clienteId: string;
  clienteNombre: string;
  clientePlaca: string;
  clienteTelefono?: string;
  branch: Branch;
  items: NoteItem[];
  subtotal: number;
  iva: number;
  total: number;
  anticipo?: number;
  saldoRestante?: number;
  exchangeRate: number;
  createdAt: string;
  updatedAt: string;
  vendedor: string;
}

export interface FinanceMovement {
  id: string;
  type: 'Ingreso' | 'Egreso';
  category: 'Venta' | 'Servicio' | 'Proveedor' | 'Gasto Operativo';
  amount: number;
  description: string;
  date: string;
  branch: Branch;
  status: 'Completado' | 'Pendiente' | 'Vencido';
}

export interface AccountReceivable {
  id: string;
  noteId: string;
  clienteId: string;
  clienteNombre: string;
  total: number;
  saldo: number;
  dueDate: string;
  lastPaymentDate?: string;
  status: 'Al Corriente' | 'Atrasado';
  isActive?: boolean;
}

export interface AccountPayable {
  id: string;
  supplier: string;
  amount: number;
  dueDate: string;
  description: string;
  status: 'Pendiente' | 'Pagado' | 'Vencido';
  isActive?: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  branch: Branch;
  details: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  status: 'pending' | 'completed' | 'in-progress';
  customer: string;
}

export interface Sale {
  id: string;
  date: string;
  amount: number;
  items: string[];
  seller: string;
}

export interface TPMS {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface MercadoPagoConfig {
  publicKey: string;
  accessToken: string;
  isActive: boolean;
  isSandbox: boolean;
  businessName?: string;
  allowMsi?: boolean; // Meses sin intereses
  minMsiAmount?: number;
}

