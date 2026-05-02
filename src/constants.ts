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
    image: 'https://m.media-amazon.com/images/I/6141vzcneUL._AC_SX522_.jpg'
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
    image: 'https://m.media-amazon.com/images/I/615U7NOewyL._AC_SY300_SX300_QL70_ML2_.jpg'
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
    image: 'https://i5.walmartimages.com/asr/bc253198-fac1-4a77-b3a6-0cd3ab900844.5267cce960c39019c47a6e50a5715bc9.jpeg?odnHeight=640&odnWidth=640&odnBg=FFFFFF'
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
    image: 'https://m.media-amazon.com/images/I/611l5mPy8KL._AC_SY300_SX300_QL70_ML2_.jpg'
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
