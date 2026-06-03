import { Tire, Service, TPMS, InventoryMovement, StockTransfer, ServiceNote, Cliente, FinanceMovement, AccountReceivable, AccountPayable, AuditLog } from './types';

export const TIRES: Tire[] = [
  {
    id: '1',
    brand: 'Goodyear',
    model: 'Eagle F1 Asymmetric 5',
    width: 225,
    profile: 45,
    rim: 17,
    size: '225/45 R17',
    price: 3250,
    stock: 12,
    branchStocks: { 'Centro': 4, 'Norte': 4, 'Frontera': 4 },
    discount: 0.1,
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: '2',
    brand: 'Goodyear',
    model: 'Wrangler Duratrac',
    width: 265,
    profile: 70,
    rim: 17,
    size: '265/70 R17',
    price: 4800,
    stock: 8,
    branchStocks: { 'Centro': 2, 'Norte': 2, 'Frontera': 4 },
    discount: 0.1,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: '3',
    brand: 'Michelin',
    model: 'Pilot Sport 4S',
    width: 245,
    profile: 35,
    rim: 19,
    size: '245/35 R19',
    price: 5600,
    stock: 3,
    branchStocks: { 'Centro': 1, 'Norte': 1, 'Frontera': 1 },
    image: 'https://images.unsplash.com/photo-1549399542-7eed3a85d6bc?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: '4',
    brand: 'Bridgestone',
    model: 'Potenza S001',
    width: 225,
    profile: 40,
    rim: 18,
    size: '225/40 R18',
    price: 4100,
    stock: 16,
    branchStocks: { 'Centro': 8, 'Norte': 4, 'Frontera': 4 },
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: '5',
    brand: 'Pirelli',
    model: 'P Zero Corsa',
    width: 255,
    profile: 35,
    rim: 20,
    size: '255/35 R20',
    price: 6200,
    stock: 10,
    branchStocks: { 'Centro': 3, 'Norte': 3, 'Frontera': 4 },
    discount: 0.15,
    image: 'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: '6',
    brand: 'Continental',
    model: 'ExtremeContact DWS06 Plus',
    width: 225,
    profile: 40,
    rim: 18,
    size: '225/40 R18',
    price: 3850,
    stock: 15,
    branchStocks: { 'Centro': 5, 'Norte': 5, 'Frontera': 5 },
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: '7',
    brand: 'Michelin',
    model: 'Primacy 4',
    width: 205,
    profile: 55,
    rim: 16,
    size: '205/55 R16',
    price: 2900,
    stock: 20,
    branchStocks: { 'Centro': 10, 'Norte': 5, 'Frontera': 5 },
    discount: 0.05,
    image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: '8',
    brand: 'Yokohama',
    model: 'Advan Neova AD08R',
    width: 235,
    profile: 40,
    rim: 18,
    size: '235/40 R18',
    price: 4700,
    stock: 6,
    branchStocks: { 'Centro': 2, 'Norte': 2, 'Frontera': 2 },
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: '9',
    brand: 'Kumho',
    model: 'Ecsta PS31',
    width: 195,
    profile: 50,
    rim: 15,
    size: '195/50 R15',
    price: 1850,
    stock: 14,
    branchStocks: { 'Centro': 6, 'Norte': 4, 'Frontera': 4 },
    discount: 0.1,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: '10',
    brand: 'Toyo',
    model: 'Open Country M/T',
    width: 285,
    profile: 70,
    rim: 17,
    size: '285/70 R17',
    price: 5400,
    stock: 8,
    branchStocks: { 'Centro': 2, 'Norte': 3, 'Frontera': 3 },
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: '11',
    brand: 'Hankook',
    model: 'Ventus S1 Evo 3',
    width: 245,
    profile: 45,
    rim: 18,
    size: '245/45 R18',
    price: 3400,
    stock: 12,
    branchStocks: { 'Centro': 4, 'Norte': 4, 'Frontera': 4 },
    discount: 0.08,
    image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: '12',
    brand: 'Dunlop',
    model: 'SP Sport Maxx 050+',
    width: 225,
    profile: 50,
    rim: 17,
    size: '225/50 R17',
    price: 3100,
    stock: 10,
    branchStocks: { 'Centro': 3, 'Norte': 3, 'Frontera': 4 },
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=500&q=80'
  }
];

export const MOCK_MOVEMENTS: InventoryMovement[] = [
  { id: 'M1', tireId: '1', type: 'Entrada', quantity: 10, reason: 'Compra a proveedor', branch: 'Frontera', date: '2024-05-01T10:00:00Z', user: 'Admin' },
  { id: 'M2', tireId: '2', type: 'Salida', quantity: 2, reason: 'Ajuste inventario', branch: 'Centro', date: '2024-05-02T11:00:00Z', user: 'Admin' },
];

export const MOCK_TRANSFERS: StockTransfer[] = [
  { id: 'T1', tireId: '1', fromBranch: 'Centro', toBranch: 'Frontera', quantity: 4, status: 'En Tránsito', sentDate: '2024-05-02T12:00:00Z', user: 'Admin' },
];

export const MOCK_NOTES: ServiceNote[] = [
  {
    id: 'N1',
    folio: 'MF-1001',
    type: 'Venta',
    status: 'Pagado',
    clienteId: '1',
    clienteNombre: 'Juan Pérez',
    clientePlaca: 'ABC-1234',
    branch: 'Frontera',
    items: [
      { id: 'I1', type: 'Producto', itemId: '1', description: 'Goodyear Eagle F1 Asymmetric 5 (225/45 R17)', quantity: 4, unitPrice: 3250, total: 13000, image: 'https://m.media-amazon.com/images/I/6141vzcneUL._AC_SX522_.jpg' }
    ],
    subtotal: 11206.90,
    iva: 1793.10,
    total: 13000,
    exchangeRate: 20.20,
    createdAt: '2024-05-01T14:00:00Z',
    updatedAt: '2024-05-01T15:00:00Z',
    vendedor: 'Gael Martínez'
  },
  {
    id: 'N2',
    folio: 'MF-1002',
    type: 'Apartado',
    status: 'Pendiente',
    clienteId: '2',
    clienteNombre: 'Maria García',
    clientePlaca: 'XYZ-9876',
    branch: 'Centro',
    items: [
      { id: 'I2', type: 'Producto', itemId: '2', description: 'Goodyear Wrangler Duratrac (265/70 R17)', quantity: 2, unitPrice: 4800, total: 9600, image: 'https://m.media-amazon.com/images/I/615U7NOewyL._AC_SY300_SX300_QL70_ML2_.jpg' }
    ],
    subtotal: 8275.86,
    iva: 1324.14,
    total: 9600,
    anticipo: 3000,
    saldoRestante: 6600,
    exchangeRate: 20.20,
    createdAt: '2024-05-02T09:00:00Z',
    updatedAt: '2024-05-02T09:00:00Z',
    vendedor: 'Elena Cruz'
  }
];

export const MOCK_CLIENTES: Cliente[] = [
  { id: '1', nombre: 'Juan Pérez', rfc: 'PERJ800101XYZ', telefono: '555-0101', direccion: 'Av. Reforma 123, Centro', placa_vehiculo: 'ABC-1234', sucursal_registro_id: 'Centro', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', nombre: 'Maria García', rfc: 'GARM900505ABC', telefono: '555-0202', direccion: 'Calle Norte 45, Col. Industrial', placa_vehiculo: 'XYZ-9876', sucursal_registro_id: 'Norte', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const MOCK_FINANCE: FinanceMovement[] = [
  { id: 'F1', type: 'Ingreso', category: 'Venta', amount: 13000, description: 'Pago Nota MF-1001', date: '2024-05-01T15:00:00Z', branch: 'Frontera', status: 'Completado' },
  { id: 'F2', type: 'Ingreso', category: 'Venta', amount: 3000, description: 'Anticipo Nota MF-1002', date: '2024-05-02T09:00:00Z', branch: 'Centro', status: 'Completado' },
  { id: 'F3', type: 'Egreso', category: 'Proveedor', amount: 45000, description: 'Compra Llantas Goodyear', date: '2024-05-01T10:00:00Z', branch: 'Frontera', status: 'Completado' },
];

export const MOCK_CXC: AccountReceivable[] = [
  { id: 'CXC1', noteId: 'N2', clienteId: '2', clienteNombre: 'Maria García', total: 9600, saldo: 6600, dueDate: '2024-06-02T09:00:00Z', status: 'Al Corriente' },
];

export const MOCK_CXP: AccountPayable[] = [
  { id: 'CXP1', supplier: 'Goodyear Distribución', amount: 85000, dueDate: '2024-05-20T10:00:00Z', description: 'Factura F-9901 Lote Mayo', status: 'Pendiente' },
  { id: 'CXP2', supplier: 'Michelin México', amount: 120000, dueDate: '2024-05-15T12:00:00Z', description: 'Factura M-4432 Neumáticos Deportivos', status: 'Vencido' },
];

export const MOCK_AUDIT: AuditLog[] = [
  { id: 'L1', userId: 'A1', userName: 'Admin', action: 'Transferencia Autorizada', entity: 'StockTransfer', entityId: 'T1', timestamp: '2024-05-02T12:00:00Z', branch: 'Centro', details: 'Envió 4 unidades de Goodyear a Frontera' },
  { id: 'L2', userId: 'A1', userName: 'Admin', action: 'Ajuste Stock', entity: 'InventoryMovement', entityId: 'M2', timestamp: '2024-05-02T11:00:00Z', branch: 'Centro', details: 'Salida de 2 unidades por daño' },
];

export const SERVICES: Service[] = [
  { id: 'S1', name: 'Alineación y Balanceo', price: 1200, duration: '45 min', status: 'in-progress', customer: 'Juan Pérez - BMW M3' },
  { id: 'S2', name: 'Montaje de Llantas (x4)', price: 800, duration: '60 min', status: 'pending', customer: 'María García - Toyota Hilux' },
  { id: 'S3', name: 'Programación TPMS', price: 450, duration: '15 min', status: 'completed', customer: 'Ricardo Soto - Ford F-150' }
];

export const INVENTORY = [
  { id: 'LL-001', type: 'Llanta', name: 'Eagle F1 Asymmetric 5', size: '225/45 R17', stock: 12, price: 3250, branch: 'Frontera' },
  { id: 'SN-101', type: 'Sensor', name: 'Sensor TPMS Universal', size: 'Gen 2', stock: 45, price: 980, branch: 'Centro' },
];

export const BILLING = [
  { id: 'F-8842', customer: 'Automotriz del Norte S.A.', date: '2023-11-20', total: 12450, status: 'Pagada', branch: 'Frontera' },
];
