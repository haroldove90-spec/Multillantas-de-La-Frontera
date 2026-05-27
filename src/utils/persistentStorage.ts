import { Tire, AuditLog, Branch } from '../types';
import { TIRES, MOCK_AUDIT } from '../constants';

const TIRES_STORAGE_KEY = 'multillantas_tires_v1';
const AUDIT_STORAGE_KEY = 'multillantas_audit_v1';
const COUNTS_STORAGE_KEY = 'multillantas_counts_v1';

export const getTires = (): Tire[] => {
  if (typeof window === 'undefined') return TIRES;
  const stored = localStorage.getItem(TIRES_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(TIRES_STORAGE_KEY, JSON.stringify(TIRES));
    return TIRES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return TIRES;
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
