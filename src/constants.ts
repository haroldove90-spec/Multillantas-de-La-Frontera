import { Tire, Service, TPMS, InventoryMovement, StockTransfer, ServiceNote, Cliente } from './types';

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
    stock: 3, // Low stock for testing
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
  {
    id: '1',
    nombre: 'Juan Pérez',
    rfc: 'PERJ800101XYZ',
    telefono: '555-0101',
    direccion: 'Av. Reforma 123, Centro',
    placa_vehiculo: 'ABC-1234',
    sucursal_registro_id: 'Centro',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    nombre: 'Maria García',
    rfc: 'GARM900505ABC',
    telefono: '555-0202',
    direccion: 'Calle Norte 45, Col. Industrial',
    placa_vehiculo: 'XYZ-9876',
    sucursal_registro_id: 'Norte',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    nombre: 'Roberto Sánchez',
    rfc: 'SANR851010123',
    telefono: '555-0303',
    direccion: 'Blvd. Frontera 789',
    placa_vehiculo: 'MEX-1122',
    sucursal_registro_id: 'Frontera',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    nombre: 'Ana López',
    rfc: 'LOPA920303QWE',
    telefono: '555-0404',
    direccion: 'Av. Central 55',
    placa_vehiculo: 'GTO-9988',
    sucursal_registro_id: 'Centro',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const SERVICES: Service[] = [
  {
    id: 'S1',
    name: 'Alineación y Balanceo',
    price: 1200,
    duration: '45 min',
    status: 'in-progress',
    customer: 'Juan Pérez - BMW M3'
  },
  {
    id: 'S2',
    name: 'Montaje de Llantas (x4)',
    price: 800,
    duration: '60 min',
    status: 'pending',
    customer: 'María García - Toyota Hilux'
  },
  {
    id: 'S3',
    name: 'Programación TPMS',
    price: 450,
    duration: '15 min',
    status: 'completed',
    customer: 'Ricardo Soto - Ford F-150'
  }
];

export const INVENTORY = [
  { id: 'LL-001', type: 'Llanta', name: 'Eagle F1 Asymmetric 5', size: '225/45 R17', stock: 12, price: 3250, branch: 'Frontera' },
  { id: 'LL-002', type: 'Llanta', name: 'Wrangler Duratrac', size: '265/70 R17', stock: 8, price: 4800, branch: 'Frontera' },
  { id: 'SN-101', type: 'Sensor', name: 'Sensor TPMS Universal', size: 'Gen 2', stock: 45, price: 980, branch: 'Centro' },
  { id: 'AC-202', type: 'Accesorio', name: 'Válvula de Aire Aluminio', size: 'Universal', stock: 120, price: 150, branch: 'Norte' },
  { id: 'LL-003', type: 'Llanta', name: 'Pilot Sport 4S', size: '245/35 R19', stock: 4, price: 5600, branch: 'Centro' },
  { id: 'LL-004', type: 'Llanta', name: 'P Zero', size: '255/40 R20', stock: 15, price: 6800, branch: 'Norte' },
];

export const BILLING = [
  { id: 'F-8842', customer: 'Automotriz del Norte S.A.', date: '2023-11-20', total: 12450, status: 'Pagada', branch: 'Frontera' },
  { id: 'F-8843', customer: 'Distribuidora Global', date: '2023-11-21', total: 8900, status: 'Pendiente', branch: 'Centro' },
  { id: 'F-8844', customer: 'Particulares - Venta Mostrador', date: '2023-11-21', total: 3250, status: 'Pagada', branch: 'Frontera' },
  { id: 'F-8845', customer: 'Taller San José', date: '2023-11-22', total: 15600, status: 'Cancelada', branch: 'Norte' },
];
