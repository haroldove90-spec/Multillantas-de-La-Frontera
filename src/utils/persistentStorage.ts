import { Tire, AuditLog, Branch, AccountReceivable, AccountPayable, Cliente, SystemUser, WarehouseName, MercadoPagoConfig, ServiceNote } from '../types';
import { TIRES, MOCK_AUDIT, MOCK_CXC, MOCK_CXP, MOCK_CLIENTES, MOCK_NOTES } from '../constants';

const TIRES_STORAGE_KEY = 'multillantas_tires_v2';
const AUDIT_STORAGE_KEY = 'multillantas_audit_v1';
const COUNTS_STORAGE_KEY = 'multillantas_counts_v1';

export const getTires = (): Tire[] => {
  if (typeof window === 'undefined') return TIRES;
  const stored = localStorage.getItem(TIRES_STORAGE_KEY);
  
  const addDefaultWarehouseStocks = (list: Tire[]): Tire[] => {
    return list.map((t, idx) => {
      if (!t.warehouseStocks) {
        // Base initial values on index to be deterministic yet non-zero
        t.warehouseStocks = {
          'Bodega 1': (idx * 3 + 4) % 15,
          'Bodega 2': (idx * 2 + 1) % 10
        };
      }
      return t;
    });
  };

  if (!stored) {
    const enrichedOriginal = addDefaultWarehouseStocks(TIRES);
    localStorage.setItem(TIRES_STORAGE_KEY, JSON.stringify(enrichedOriginal));
    return enrichedOriginal;
  }
  try {
    const parsed = JSON.parse(stored);
    if (parsed.length < 12) {
      const enrichedOriginal = addDefaultWarehouseStocks(TIRES);
      localStorage.setItem(TIRES_STORAGE_KEY, JSON.stringify(enrichedOriginal));
      return enrichedOriginal;
    }
    const validated = addDefaultWarehouseStocks(parsed);
    return validated;
  } catch (e) {
    return addDefaultWarehouseStocks(TIRES);
  }
};

export const saveTires = (tires: Tire[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TIRES_STORAGE_KEY, JSON.stringify(tires));
    // Dispatch custom event to notify other components of state changes
    window.dispatchEvent(new Event('multillantas_state_update'));
  }
};

export const getAuditLogs = (): AuditLog[] => {
  if (typeof window === 'undefined') return MOCK_AUDIT;
  const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(MOCK_AUDIT));
    return MOCK_AUDIT;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return MOCK_AUDIT;
  }
};

export const saveAuditLogs = (logs: AuditLog[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
    window.dispatchEvent(new Event('multillantas_state_update'));
  }
};

export const addAuditLog = (
  userName: string,
  action: string,
  entity: string,
  entityId: string,
  branch: Branch,
  details: string
): AuditLog => {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    id: 'L-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    userId: userName === 'Administrador' ? 'A1' : userName === 'Vendedor' ? 'V1' : 'T1',
    userName,
    action,
    entity,
    entityId,
    timestamp: new Date().toISOString(),
    branch,
    details,
  };
  const updated = [newLog, ...logs];
  saveAuditLogs(updated);
  return newLog;
};

export interface PhysicalCountRecord {
  id: string;
  date: string;
  branch: Branch;
  user: string;
  items: {
    tireId: string;
    brand: string;
    model: string;
    size: string;
    theoretical: number;
    physical: number;
    discrepancy: number;
  }[];
}

export const getPhysicalCounts = (): PhysicalCountRecord[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(COUNTS_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
};

export const savePhysicalCount = (record: Omit<PhysicalCountRecord, 'id' | 'date'>) => {
  const counts = getPhysicalCounts();
  const newRecord: PhysicalCountRecord = {
    ...record,
    id: 'C-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    date: new Date().toISOString(),
  };
  const updated = [newRecord, ...counts];
  if (typeof window !== 'undefined') {
    localStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('multillantas_state_update'));
  }
  return newRecord;
};

export const deletePhysicalCount = (id: string) => {
  const counts = getPhysicalCounts();
  const updated = counts.filter(x => x.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('multillantas_state_update'));
  }
};

export const updateTireStock = (
  tireId: string,
  branch: Branch,
  quantityChange: number,
  userName: string,
  reason: string
): boolean => {
  const tires = getTires();
  const tireIndex = tires.findIndex(t => t.id === tireId);
  if (tireIndex === -1) return false;

  const tire = tires[tireIndex];
  const oldStock = tire.branchStocks[branch] || 0;
  const newStock = Math.max(0, oldStock + quantityChange);
  
  tire.branchStocks[branch] = newStock;
  
  // Update overall stock (sum of all branch stocks)
  tire.stock = Object.values(tire.branchStocks).reduce((sum, val) => sum + val, 0);
  
  tires[tireIndex] = { ...tire };
  saveTires(tires);
  
  // Log audit
  const action = quantityChange >= 0 ? 'Entrada Inventario' : 'Salida Inventario';
  const changeStr = quantityChange >= 0 ? `+${quantityChange}` : `${quantityChange}`;
  addAuditLog(
    userName,
    action,
    'Tire',
    tireId,
    branch,
    `Ajuste de stock: ${changeStr} un. para ${tire.brand} ${tire.model} en Sucursal ${branch}. Motivo: ${reason}. Anterior: ${oldStock}, Nuevo: ${newStock}`
  );
  
  return true;
};

const CXC_STORAGE_KEY = 'multillantas_cxc_v1';
const CXP_STORAGE_KEY = 'multillantas_cxp_v1';

export const getCXC = (): AccountReceivable[] => {
  if (typeof window === 'undefined') return MOCK_CXC;
  const stored = localStorage.getItem(CXC_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(CXC_STORAGE_KEY, JSON.stringify(MOCK_CXC));
    return MOCK_CXC;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return MOCK_CXC;
  }
};

export const saveCXC = (cxc: AccountReceivable[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CXC_STORAGE_KEY, JSON.stringify(cxc));
    window.dispatchEvent(new Event('multillantas_state_update'));
  }
};

export const getCXP = (): AccountPayable[] => {
  if (typeof window === 'undefined') return MOCK_CXP;
  const stored = localStorage.getItem(CXP_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(CXP_STORAGE_KEY, JSON.stringify(MOCK_CXP));
    return MOCK_CXP;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return MOCK_CXP;
  }
};

export const saveCXP = (cxp: AccountPayable[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CXP_STORAGE_KEY, JSON.stringify(cxp));
    window.dispatchEvent(new Event('multillantas_state_update'));
  }
};

const INVOICES_STORAGE_KEY = 'multillantas_invoices_v1';

export interface Invoice {
  id: string;
  uuid: string;
  customer: string;
  rfc: string;
  date: string;
  total: number;
  status: 'Timbrada' | 'Cancelada' | 'Pendiente';
  type: 'Ingreso' | 'Egreso';
  branch: Branch;
  isActive?: boolean;
}

const MOCK_INVOICES_INITIAL: Invoice[] = [
  { id: 'F-1025', uuid: 'E48-842-X-99-4A1', customer: 'Automotriz del Norte S.A.', rfc: 'ANS120512QW1', date: '2024-05-02', total: 12450.00, status: 'Timbrada', type: 'Ingreso', branch: 'Frontera' },
  { id: 'F-1026', uuid: 'B22-111-Y-00-5B2', customer: 'Transportes Rápidos S.A.', rfc: 'TRA880808ABC', date: '2024-05-01', total: 45600.50, status: 'Timbrada', type: 'Ingreso', branch: 'Centro' },
  { id: 'F-1027', uuid: 'C33-222-Z-11-6C3', customer: 'Juan Pérez García', rfc: 'PEGJ800101XYZ', date: '2024-04-30', total: 3250.00, status: 'Cancelada', type: 'Ingreso', branch: 'Norte' },
  { id: 'F-1028', uuid: 'D44-333-A-22-7D4', customer: 'Distribuidora Llantas MX', rfc: 'DLM150101GTO', date: '2024-04-29', total: 8900.00, status: 'Timbrada', type: 'Ingreso', branch: 'Frontera' },
];

export const getInvoices = (): Invoice[] => {
  if (typeof window === 'undefined') return MOCK_INVOICES_INITIAL;
  const stored = localStorage.getItem(INVOICES_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(MOCK_INVOICES_INITIAL));
    return MOCK_INVOICES_INITIAL;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return MOCK_INVOICES_INITIAL;
  }
};

export const saveInvoices = (invoices: Invoice[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
    window.dispatchEvent(new Event('multillantas_state_update'));
  }
};

const CLIENTES_STORAGE_KEY = 'multillantas_clientes_v1';

export const getClientes = (): Cliente[] => {
  if (typeof window === 'undefined') return MOCK_CLIENTES;
  const stored = localStorage.getItem(CLIENTES_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(CLIENTES_STORAGE_KEY, JSON.stringify(MOCK_CLIENTES));
    return MOCK_CLIENTES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return MOCK_CLIENTES;
  }
};

export const saveClientes = (clientes: Cliente[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CLIENTES_STORAGE_KEY, JSON.stringify(clientes));
    window.dispatchEvent(new Event('multillantas_state_update'));
  }
};

const USERS_STORAGE_KEY = 'multillantas_users_v1';
const LOGGED_USER_STORAGE_KEY = 'multillantas_logged_user_v1';

const INITIAL_USERS: SystemUser[] = [
  {
    id: 'usr-admin',
    username: 'admin1',
    password: 'admin123',
    name: 'Administrador Principal',
    role: 'Administrador',
    branch: 'Frontera',
    createdAt: '2026-06-09T14:20:00.000Z'
  },
  {
    id: 'usr-vendedor',
    username: 'vendedor1',
    password: 'vendedor123',
    name: 'Vendedor Centro',
    role: 'Vendedor',
    branch: 'Centro',
    createdAt: '2026-06-09T14:20:00.000Z'
  }
];

export const getSystemUsers = (): SystemUser[] => {
  if (typeof window === 'undefined') return INITIAL_USERS;
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_USERS;
  }
};

export const saveSystemUsers = (users: SystemUser[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event('multillantas_state_update'));
  }
};

export const getLoggedUser = (): SystemUser | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(LOGGED_USER_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
};

export const saveLoggedUser = (user: SystemUser) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOGGED_USER_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('multillantas_state_update'));
  }
};

export const clearLoggedUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOGGED_USER_STORAGE_KEY);
    window.dispatchEvent(new Event('multillantas_state_update'));
  }
};

const MERCADO_PAGO_STORAGE_KEY = 'multillantas_mercado_pago_v1';

const INITIAL_MERCADO_PAGO: MercadoPagoConfig = {
  publicKey: '',
  accessToken: '',
  isActive: false,
  isSandbox: true,
  businessName: 'Multillantas de la Frontera',
  allowMsi: true,
  minMsiAmount: 1000
};

export const getMercadoPagoConfig = (): MercadoPagoConfig => {
  if (typeof window === 'undefined') return INITIAL_MERCADO_PAGO;
  const stored = localStorage.getItem(MERCADO_PAGO_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(MERCADO_PAGO_STORAGE_KEY, JSON.stringify(INITIAL_MERCADO_PAGO));
    return INITIAL_MERCADO_PAGO;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_MERCADO_PAGO;
  }
};

export const saveMercadoPagoConfig = (config: MercadoPagoConfig) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MERCADO_PAGO_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('multillantas_state_update'));
  }
};

const NOTES_STORAGE_KEY = 'multillantas_notes_v1';
const CATALOG_TIRES_STORAGE_KEY = 'multillantas_catalog_tires_v1';

export const getServiceNotes = (): ServiceNote[] => {
  if (typeof window === 'undefined') return MOCK_NOTES;
  const stored = localStorage.getItem(NOTES_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(MOCK_NOTES));
    return MOCK_NOTES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return MOCK_NOTES;
  }
};

export const saveServiceNotes = (notes: ServiceNote[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    window.dispatchEvent(new Event('multillantas_state_update'));
  }
};

export const getCatalogTires = (): Tire[] => {
  if (typeof window === 'undefined') return TIRES;
  const stored = localStorage.getItem(CATALOG_TIRES_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(CATALOG_TIRES_STORAGE_KEY, JSON.stringify(TIRES));
    return TIRES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return TIRES;
  }
};

export const saveCatalogTires = (tires: Tire[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CATALOG_TIRES_STORAGE_KEY, JSON.stringify(tires));
    window.dispatchEvent(new Event('multillantas_state_update'));
  }
};


