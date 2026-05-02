import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Cpu, 
  Settings, 
  User, 
  ShieldCheck, 
  TrendingUp, 
  Box, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Search, 
  Filter,
  Plus,
  Zap,
  ArrowRight,
  Menu,
  X,
  CreditCard,
  Car,
  FileText,
  LogOut,
  Bell,
  AlertCircle,
  Activity,
  Printer,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Role, Tire, Service, VehicleEntry, Branch, InspectionData } from './types';
import { TIRES, SERVICES, INVENTORY, BILLING } from './constants';
import { HojaDeInspeccion } from './components/HojaDeInspeccion';
import { NotaDeServicio } from './components/NotaDeServicio';
import { ClientesPanel } from './components/ClientesPanel';
import { InventarioPanel } from './components/InventarioPanel';
import { GeneradorNotas } from './components/GeneradorNotas';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { FacturacionPanel } from './components/FacturacionPanel';

const LOGO_URL = 'https://appdesign.appdesignproyectos.com/multillantas.png';

const ExchangeRateWidget = () => {
  const [rate, setRate] = useState(20.42);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setRate(prev => Number((prev + (Math.random() - 0.5) * 0.01).toFixed(2)));
      setLastUpdate(new Date().toLocaleTimeString());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-brand-matte border border-brand-border rounded-2xl shadow-inner group hover:border-brand-gold/50 transition-all">
      <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold">
        <DollarSign size={16} />
      </div>
      <div>
        <div className="flex items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">USD/MXN</p>
            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
        </div>
        <p className="text-sm font-black text-white">${rate} <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Banxico Live</span></p>
      </div>
      <div className="ml-2 border-l border-brand-border pl-3 flex flex-col justify-center">
         <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Last Update</p>
         <p className="text-[9px] font-mono text-brand-gold opacity-60 leading-none">{lastUpdate}</p>
      </div>
    </div>
  );
};

export default function App() {
  const [role, setRole] = useState<Role>('Administrador');
  const [branch, setBranch] = useState<Branch>('Frontera');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // States for simulation (Synchronized by Branch)
  // We use useMemo to simulate different data per branch for some stats
  const branchData = useMemo(() => {
    const data = {
      'Frontera': { revenue: 89450, sales: 245, workshop: 8, stock: '1,240' },
      'Centro': { revenue: 156200, sales: 412, workshop: 15, stock: '2,100' },
      'Norte': { revenue: 42300, sales: 98, workshop: 4, stock: '850' },
    };
    return data[branch];
  }, [branch]);

  const [salesCount, setSalesCount] = useState(branchData.sales);
  const [dailyRevenue, setDailyRevenue] = useState(branchData.revenue);
  const [workshopEntries, setWorkshopEntries] = useState(branchData.workshop);

  useEffect(() => {
    setSalesCount(branchData.sales);
    setDailyRevenue(branchData.revenue);
    setWorkshopEntries(branchData.workshop);
  }, [branchData]);

  const [selectedRim, setSelectedRim] = useState<number | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string | 'all'>('all');
  
  const [vehicles, setVehicles] = useState<VehicleEntry[]>([
    { 
      id: '1', 
      plate: 'ABC-1234', 
      brand: 'Nissan', 
      model: 'Versa 2022', 
      reason: 'Cambio de Llantas', 
      status: 'inspeccionada', 
      entryTime: '10:30 AM', 
      branch: 'Frontera',
      inspection: {
        completedAt: '10:45 AM',
        tires: {
          fl: { depth: 1.8, psi: 28 },
          fr: { depth: 2.2, psi: 30 },
          rl: { depth: 4.5, psi: 32 },
          rr: { depth: 4.2, psi: 32 },
        },
        checklist: [
          { label: 'Sistema de Frenos', status: 'rojo', icon: 'CircleDot' },
          { label: 'Luces y Señalización', status: 'verde', icon: 'Zap' },
          { label: 'Niveles de Fluidos', status: 'amarillo', icon: 'Droplets' },
          { label: 'Suspensión y Amort.', status: 'rojo', icon: 'Settings' },
          { label: 'Estado de Batería', status: 'verde', icon: 'Zap' },
        ]
      }
    },
    { id: '2', plate: 'XYZ-9876', brand: 'Ford', model: 'Lobo 2023', reason: 'Alineación y Balanceo', status: 'recepcion', entryTime: '11:15 AM', branch: 'Frontera' },
    { id: '3', plate: 'MEX-1122', brand: 'VW', model: 'Jetta 2021', reason: 'Revisión de Suspensión', status: 'taller', entryTime: '09:45 AM', branch: 'Centro' },
    { id: '4', plate: 'NR-5566', brand: 'Chevrolet', model: 'Aveo 2020', reason: 'Cambio de Aceite', status: 'recepcion', entryTime: '12:00 PM', branch: 'Norte' },
    { id: '5', plate: 'GTO-9988', brand: 'Toyota', model: 'Hilux', reason: 'Alineación', status: 'taller', entryTime: '08:30 AM', branch: 'Frontera' },
    { id: '6', plate: 'PBA-4433', brand: 'Mazda', model: '3', reason: 'Balanceo', status: 'recepcion', entryTime: '01:20 PM', branch: 'Centro' },
  ]);

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleEntry | null>(null);
  const [selectedVehicleForNote, setSelectedVehicleForNote] = useState<VehicleEntry | null>(null);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => v.branch === branch);
  }, [vehicles, branch]);

  // Form State for Entry
  const [newVehicle, setNewVehicle] = useState({ plate: '', brand: '', model: '', reason: '' });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [cartItems, setCartItems] = useState<{ tire: Tire; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleSaveInspection = (id: string, data: InspectionData) => {
    setVehicles(prev => prev.map(v => v.id === id ? { 
      ...v, 
      status: 'inspeccionada', 
      inspection: { ...data, completedAt: new Date().toLocaleTimeString() } 
    } : v));
    setSelectedVehicle(null);
  };

  const opportunities = useMemo(() => {
    return vehicles.filter(v => v.inspection?.checklist.some(p => p.status === 'rojo'));
  }, [vehicles]);

  const addToCart = (tire: Tire) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.tire.id === tire.id);
      if (existing) {
        return prev.map(item => item.tire.id === tire.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { tire, quantity: 1 }];
    });
    if (role === 'cliente') {
      setIsCartOpen(true);
    }
  };

  const navItems = useMemo(() => [
    { id: 'dashboard', label: 'Tablero', icon: <LayoutDashboard size={20} />, roles: ['Administrador', 'Vendedor', 'Técnico'] },
    { id: 'ecommerce', label: 'Catálogo', icon: <ShoppingCart size={20} />, roles: ['Administrador', 'Vendedor', 'Cliente'] },
    { id: 'taller', label: 'Control Taller', icon: <Car size={20} />, roles: ['Administrador', 'Técnico'] },
    { id: 'clientes', label: 'Clientes', icon: <User size={20} />, roles: ['Administrador', 'Vendedor'] },
    { id: 'notas', label: 'Notas/POS', icon: <FileText size={20} />, roles: ['Administrador', 'Vendedor'] },
    { id: 'inventario', label: 'Inventario', icon: <Box size={20} />, roles: ['Administrador', 'Vendedor'] },
    { id: 'analytics', label: 'Inteligencia', icon: <Activity size={20} />, roles: ['Administrador'] },
  ].filter(item => {
    // Role specific logic
    if (role === 'Cliente') return item.id === 'ecommerce';
    if (role === 'Técnico') return item.id === 'taller' || item.id === 'dashboard';
    if (role === 'Vendedor') return item.id !== 'taller' && item.id !== 'analytics';
    return item.roles.includes(role);
  }), [role]);

  const handleSale = (amount: number) => {
    setSalesCount(prev => prev + 1);
    setDailyRevenue(prev => prev + amount);
  };

  const handleRegisterEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.plate) return;
    const entry: VehicleEntry = {
      ...newVehicle,
      id: Date.now().toString(),
      status: 'recepcion',
      entryTime: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      branch: branch
    };
    setVehicles([entry, ...vehicles]);
    setWorkshopEntries(prev => prev + 1);
    setNewVehicle({ plate: '', brand: '', model: '', reason: '' });
  };

  const filteredTires = useMemo(() => {
    return TIRES.filter(tire => {
      const rimMatch = selectedRim === 'all' || tire.rim === selectedRim;
      const brandMatch = selectedBrand === 'all' || tire.brand === selectedBrand;
      return rimMatch && brandMatch;
    });
  }, [selectedRim, selectedBrand]);

  const brands = Array.from(new Set(TIRES.map(t => t.brand)));
  const rims = Array.from(new Set(TIRES.map(t => t.rim))).sort((a, b) => a - b);

  // Sync active tab when role changes
  useEffect(() => {
    if (role === 'Cliente') setActiveTab('ecommerce');
    else if (role === 'Técnico') setActiveTab('taller');
    else if (!navItems.find(i => i.id === activeTab)) setActiveTab(navItems[0].id);
  }, [role]);

  const handleUpdateVehicleStatus = (id: string, status: 'recepcion' | 'taller' | 'listo') => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, status } : v));
    if (status === 'listo') {
      // Simulate notification logic here if needed
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 font-sans selection:bg-brand-red/30 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar - Desktop & Tablet */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-brand-dark border-r border-brand-border transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto lg:h-screen
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col p-6">
            <div className="mb-10 flex items-center justify-between">
              <img src={LOGO_URL} alt="Multillantas" className="h-10 w-auto object-contain" />
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="lg:hidden text-slate-400 p-2 hover:bg-white/5 rounded-full outline-none"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
              {navItems.map(item => (
                <SidebarLink 
                  key={item.id}
                  active={activeTab === item.id} 
                  onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} 
                  icon={item.icon} 
                  label={item.label} 
                />
              ))}

              {/* Mobile Role Switcher (integrated in nav) */}
              <div className="lg:hidden mt-8 pt-8 border-t border-brand-border space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Cambiar Perfil</p>
                <RoleSwitcher currentRole={role} setRole={setRole} isMobile />
              </div>
            </nav>

            <div className="mt-auto pt-6 border-t border-brand-border space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-brand-matte border border-brand-border">
                <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white font-black shadow-lg shadow-brand-blue/20 flex-shrink-0">
                  {role[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold capitalize truncate">{role}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter truncate">Terminal {branch}</p>
                </div>
              </div>
              <button className="flex items-center gap-3 w-full px-4 py-2 text-slate-500 hover:text-white transition-colors text-sm font-bold outline-none">
                <LogOut size={18} /> Salir
              </button>
            </div>
          </div>
        </aside>

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen bg-brand-dark">
          {/* Main Header */}
          <header className="h-20 lg:h-24 bg-brand-dark border-b border-brand-border flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 shrink-0 shadow-2xl">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="lg:hidden p-2 -ml-2 text-white hover:bg-white/5 rounded-lg active:scale-95 transition-all outline-none"
              >
                <Menu size={28} />
              </button>
              <div className="hidden lg:flex items-center gap-3">
                <ShieldCheck size={24} className="text-brand-gold" />
                <div>
                  <h1 className="text-xs font-black uppercase tracking-widest text-white/90">Multillantas <span className="text-brand-gold">Pro</span></h1>
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Gestión de Taller y E-commerce</p>
                </div>
              </div>
              {/* Keep logo hidden on desktop header since it's on sidebar, but on mobile it's here */}
              <img src={LOGO_URL} alt="Logo" className="lg:hidden h-8 w-auto" />
            </div>

            {/* Desktop Role Selector - Refined */}
            <div className="hidden md:block">
              <RoleSwitcher currentRole={role} setRole={setRole} />
            </div>

            {/* User Icon & Notifications for mobile/desktop toggle */}
            <div className="flex items-center gap-3">
              <ExchangeRateWidget />
              {role === 'Cliente' && (
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="p-2 text-slate-400 hover:text-white rounded-full bg-brand-matte border border-brand-border hover:border-brand-blue/30 transition-all relative group"
                >
                  <ShoppingCart size={18} />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-red text-white flex items-center justify-center rounded-full text-[8px] font-black animate-pulse">
                      {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
                    </span>
                  )}
                </button>
              )}
              <button className="p-2 text-slate-400 hover:text-white rounded-full bg-brand-matte border border-brand-border hover:border-brand-red/30 transition-all">
                <Bell size={18} />
              </button>
              <div className="w-8 h-8 rounded-full bg-brand-matte border border-brand-border flex items-center justify-center text-brand-red">
                <User size={16} />
              </div>
            </div>
          </header>

          <main className="p-4 md:p-8 lg:p-10 pb-24 max-w-[1600px] mx-auto w-full">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-10"
                >
                  <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <h2 className="text-3xl font-black tracking-tight text-white italic uppercase">OPERACIONES <span className="text-brand-red">RESUMEN</span></h2>
                      <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-1 border-l-2 border-brand-blue pl-3">Dashboard de Gestión en Tiempo Real</p>
                    </div>
                    
                    {/* Branch Switcher */}
                    <div className="bg-brand-matte border border-brand-border p-1 rounded-2xl flex items-center shadow-xl">
                      {(['Centro', 'Norte', 'Frontera'] as Branch[]).map((b) => (
                        <button
                          key={b}
                          onClick={() => setBranch(b)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            branch === b 
                              ? 'bg-brand-blue text-white shadow-lg' 
                              : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </header>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="Ventas Hoy" value={salesCount.toString()} diff="+15%" icon={<TrendingUp />} color="gold" />
                    <StatCard label="Caja Total" value={`$${dailyRevenue.toLocaleString()}`} diff="Meta Lograda" icon={<CreditCard />} color="red" />
                    <StatCard label="En Taller" value={workshopEntries.toString()} diff="Flujo Constante" icon={<Car />} color="blue" />
                    <StatCard label="Stock Llantas" value={branchData.stock} diff="Actualizado" icon={<Box />} color="gold" />
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Opportunities Section */}
                    {(role === 'Administrador' || role === 'Vendedor') && opportunities.length > 0 && (
                      <div className="xl:col-span-3">
                        <section className="bg-brand-matte border border-brand-red/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/5 blur-[100px] -z-1" />
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-brand-red rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-red/20">
                                <TrendingUp size={24} />
                              </div>
                              <div>
                                <h3 className="text-xl font-black italic uppercase tracking-tight text-white mb-1">Oportunidades de <span className="text-brand-red">Venta</span></h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Basado en Inspecciones de Taller</p>
                              </div>
                            </div>
                            <div className="px-4 py-1.5 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-black text-brand-red uppercase animate-pulse">
                              {opportunities.length} ALERTAS
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {opportunities.map(v => (
                              <div key={v.id} className="bg-brand-dark border border-brand-border rounded-2xl p-5 hover:border-brand-red/50 transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-brand-matte rounded-xl flex items-center justify-center font-black text-brand-red border border-brand-border">
                                      {v.plate.slice(0, 2)}
                                    </div>
                                    <div>
                                      <p className="text-sm font-black text-white">{v.plate}</p>
                                      <p className="text-[9px] text-slate-500 font-bold uppercase">{v.brand} {v.model}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-600 uppercase">Diagnóstico</p>
                                    <p className="text-[10px] font-black text-brand-gold">{v.inspection?.completedAt}</p>
                                  </div>
                                </div>
                                {v.inspection?.tires && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {(Object.entries(v.inspection.tires) as [keyof typeof v.inspection.tires, { depth: number; psi: number }][]).map(([pos, data]) => (
                                      data.depth < 3 && (
                                        <div key={pos} className="text-[8px] font-black bg-brand-red/10 text-brand-red px-2 py-1 rounded-lg border border-brand-red/20 uppercase flex items-center gap-1">
                                          <div className="w-1 h-1 bg-brand-red rounded-full animate-ping" />
                                          {pos}: {data.depth}mm
                                        </div>
                                      )
                                    ))}
                                  </div>
                                )}
                                <div className="space-y-2">
                                  {v.inspection?.checklist.filter(p => p.status === 'rojo').map((point, i) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-brand-red/5 rounded-lg border border-brand-red/10">
                                      <AlertCircle size={12} className="text-brand-red" />
                                      <span className="text-[10px] font-black text-brand-red uppercase">{point.label}</span>
                                    </div>
                                  ))}
                                </div>
                                <button className="w-full mt-4 py-3 bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white text-[9px] font-black uppercase tracking-widest rounded-xl border border-brand-red/20 transition-all">
                                  Contactar Cliente
                                </button>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>
                    )}

                    <div className="xl:col-span-2 space-y-6">
                      <div className="bg-brand-matte border border-brand-border rounded-3xl p-6 overflow-x-auto shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-bold flex items-center gap-2 uppercase tracking-tighter text-white/90"><Clock className="text-brand-red" size={18} /> Vehículos en Turno - {branch}</h3>
                          <button className="text-[10px] font-black uppercase tracking-widest text-brand-red hover:text-brand-red/80 active:scale-95 transition-all">Ver Historial</button>
                        </div>
                        <div className="w-full">
                          <table className="w-full text-left min-w-[500px]">
                            <thead>
                              <tr className="border-b border-brand-border/50">
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Placas</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Vehículo</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Servicio</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Encargado</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/30">
                              {filteredVehicles.length > 0 ? filteredVehicles.map(v => (
                                <tr key={v.id} className="group hover:bg-white/[0.02] transition-colors">
                                  <td className="py-4 font-black">{v.plate}</td>
                                  <td className="py-4 text-sm text-slate-400 font-medium">{v.brand} {v.model}</td>
                                  <td className="py-4">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-1.5 h-1.5 rounded-full ${
                                        v.status === 'taller' ? 'bg-brand-blue animate-pulse' : 
                                        v.status === 'inspeccionada' ? 'bg-purple-500' : 'bg-green-500'
                                      }`} />
                                      <span className={`text-[9px] font-black uppercase tracking-tighter ${
                                        v.status === 'taller' ? 'text-brand-blue' : 
                                        v.status === 'inspeccionada' ? 'text-purple-500' : 'text-green-500'
                                      }`}>
                                        {v.status === 'taller' ? 'EN PROCESO' : 
                                         v.status === 'inspeccionada' ? 'PARA VENTA' : 'LISTO'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-4">
                                    <div className="flex -space-x-2">
                                      <div className="w-6 h-6 rounded-full bg-brand-red border border-brand-dark flex items-center justify-center text-[8px] font-bold">HR</div>
                                    </div>
                                  </td>
                                  <td className="py-4">
                                    <div className="flex items-center gap-2">
                                      {v.status === 'inspeccionada' && (role === 'Administrador' || role === 'Vendedor') && (
                                        <button 
                                          onClick={() => setSelectedVehicleForNote(v)}
                                          className="p-2 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded-lg hover:bg-brand-gold hover:text-black transition-all shadow-lg shadow-brand-gold/10"
                                          title="Generar Nota de Salida"
                                        >
                                          <FileText size={14} />
                                        </button>
                                      )}
                                      {v.status === 'taller' && role === 'Técnico' && (
                                        <button 
                                          onClick={() => setSelectedVehicle(v)}
                                          className="p-2 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded-lg hover:bg-brand-blue hover:text-white transition-all shadow-lg"
                                        >
                                          <Settings size={14} />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )) : (
                                <tr>
                                  <td colSpan={4} className="py-10 text-center text-slate-600 text-xs font-bold uppercase tracking-widest italic">No hay vehículos en turno para esta sucursal</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-brand-red/10 to-transparent border border-brand-red/20 rounded-3xl p-6 shadow-2xl">
                        <h3 className="font-bold mb-4 flex items-center gap-2 uppercase tracking-tight"><Zap className="text-brand-red" size={18} /> Acceso Rápido</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <QuickAction label="Venta/Nota" icon={<Plus />} color="red" onClick={() => setActiveTab('notas')} />
                          <QuickAction label="Gestión Clientes" icon={<User />} color="red" onClick={() => setActiveTab('clientes')} />
                          <QuickAction label="Stock" icon={<Box />} color="slate" onClick={() => setActiveTab('inventario')} />
                          <QuickAction label="Ingreso Taller" icon={<Car />} color="blue" onClick={() => setActiveTab('taller')} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'inventario' && (
                <motion.div key="inventario" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <InventarioPanel userRole={role} />
                </motion.div>
              )}

              {activeTab === 'notas' && (
                <motion.div key="notas" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <GeneradorNotas />
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <AnalyticsPanel />
                </motion.div>
              )}

              {activeTab === 'facturacion' && (
                <motion.div key="facturacion" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <FacturacionPanel />
                </motion.div>
              )}

              {activeTab === 'ecommerce' && (
                <motion.div key="ecommerce" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                  <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                      <h2 className="text-4xl font-black italic tracking-tighter uppercase whitespace-nowrap">CATÁLOGO <span className="text-brand-red">PREMIUM</span></h2>
                      <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] border-l-2 border-brand-blue pl-3">Marcas líderes con garantía total - {branch}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                      {role === 'Administrador' && (
                        <button 
                          onClick={() => setIsAddingProduct(true)}
                          className="bg-brand-gold hover:bg-brand-gold/90 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-brand-gold/20 active:scale-95 transition-all"
                        >
                          <Plus size={16} strokeWidth={3} /> Nuevo Producto
                        </button>
                      )}
                      {/* Selects with brand color focus */}
                      <select 
                        onChange={(e) => setSelectedRim(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="bg-brand-matte border border-brand-border rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-brand-red transition-colors text-white"
                      >
                        <option value="all">TODOS LOS RINES</option>
                        {rims.map(r => <option key={r} value={r}>Rin {r}"</option>)}
                      </select>
                      <select 
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="bg-brand-matte border border-brand-border rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-brand-blue transition-colors text-white"
                      >
                        <option value="all">TODAS LAS MARCAS</option>
                        {brands.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </header>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTires.map(tire => (
                      <ProductCard 
                        key={tire.id} 
                        tire={tire} 
                        onSell={() => role === 'Cliente' ? addToCart(tire) : handleSale(tire.price * (1 - (tire.discount || 0)))} 
                        isCustomer={role === 'Cliente'}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'clientes' && (
                <motion.div key="clientes" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <ClientesPanel />
                </motion.div>
              )}

              {activeTab === 'taller' && (
                <motion.div key="taller" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Reception Form (for Admin/Asesor -> Tech now) */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-brand-matte border border-brand-border rounded-3xl p-6 shadow-2xl sticky top-28">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center text-white">
                            <Plus size={20} />
                          </div>
                          <div>
                            <h3 className="text-md font-bold uppercase text-white">Nuevo Ingreso</h3>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Recepción de Vehículo</p>
                          </div>
                        </div>

                        <form onSubmit={handleRegisterEntry} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Placas</label>
                            <input 
                              type="text" required placeholder="ABC-1234" value={newVehicle.plate}
                              onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value})}
                              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 font-mono text-md focus:border-brand-red transition-colors uppercase text-white outline-none" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Marca / Modelo</label>
                            <input 
                              type="text" required placeholder="Toyota Camry" value={newVehicle.brand}
                              onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})}
                              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-blue transition-colors text-white outline-none" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Motivo</label>
                            <input 
                              type="text" required placeholder="Servicio..." value={newVehicle.reason}
                              onChange={(e) => setNewVehicle({...newVehicle, reason: e.target.value})}
                              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-red transition-colors text-white outline-none" 
                            />
                          </div>
                          <button type="submit" className="w-full bg-brand-red hover:bg-brand-red/90 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all text-white">
                            Registrar Entrada
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Technical Bay List */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black italic uppercase text-white tracking-tight">Vehículos en <span className="text-brand-red">Bahía</span></h3>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500">
                          <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" /> MONITOREO ACTIVO
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {filteredVehicles.map(v => (
                          <div 
                            key={v.id} 
                            onClick={() => setSelectedVehicle(v)}
                            className="bg-brand-matte border border-brand-border rounded-3xl p-5 hover:border-brand-red/40 transition-all cursor-pointer group relative overflow-hidden shadow-xl"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand-dark border border-brand-border rounded-2xl flex items-center justify-center text-xl font-black text-brand-red shadow-inner">
                                  {v.plate.slice(0, 1)}
                                </div>
                                <div>
                                  <h4 className="font-black text-lg text-white/90 group-hover:text-white transition-colors">{v.plate}</h4>
                                  <p className="text-xs text-slate-500 font-bold uppercase">{v.brand} {v.model}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block pr-3 border-r border-brand-border">
                                  <p className="text-[10px] font-black text-slate-500 uppercase">Ingreso</p>
                                  <p className="text-xs font-bold text-slate-300">{v.entryTime}</p>
                                </div>
                                <span className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest ${
                                  v.status === 'taller' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                                  v.status === 'listo' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                  'bg-brand-blue/10 text-brand-blue border border-brand-blue/20'
                                }`}>
                                  {v.status === 'listo' ? 'COMPLETADO' : v.status}
                                </span>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-brand-border flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="text-brand-red" size={14} />
                                <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[200px]">{v.reason}</span>
                              </div>
                              {v.status !== 'listo' && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateVehicleStatus(v.id, 'listo');
                                  }}
                                  className="bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white text-[9px] font-black px-3 py-1.5 rounded-lg border border-brand-red/20 transition-all uppercase tracking-widest"
                                >
                                  Finalizar Servicio
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Technician Inspection Modal (Overlay) */}
                  <AnimatePresence>
                    {selectedVehicle && (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
                      >
                        <HojaDeInspeccion 
                          vehicle={selectedVehicle}
                          onClose={() => setSelectedVehicle(null)}
                          onSave={(data) => handleSaveInspection(selectedVehicle.id, data)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

              <footer className="fixed bottom-0 inset-x-0 h-12 bg-black/95 backdrop-blur-3xl border-t border-brand-border flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-green-500">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Servidor Activo
          </div>
          <p className="text-[8px] font-bold text-slate-600 hidden md:block uppercase tracking-tighter">V 2.3.0-TOTAL-BLACK</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Sesión: <span className="text-white">{role}</span></p>
          <div className="w-px h-4 bg-brand-border" />
          <p className="text-xs font-black text-brand-red italic tracking-tighter">${dailyRevenue.toLocaleString()} <span className="text-[9px] not-italic text-slate-600">CIERRE</span></p>
        </div>
      </footer>

      {/* New Product Modal (Admin) */}
      <AnimatePresence>
        {isAddingProduct && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-brand-matte border border-brand-border w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(197,160,89,0.1)] flex flex-col"
            >
              <div className="p-8 border-b border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-gold/10 rounded-2xl text-brand-gold border border-brand-gold/20">
                    <Box size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase text-white">Alta de <span className="text-brand-gold">Producto</span></h3>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Catálogo Multillantas Pro</p>
                  </div>
                </div>
                <button onClick={() => setIsAddingProduct(false)} className="p-2 text-slate-500 hover:text-white rounded-full bg-white/5 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Marca</label>
                    <input type="text" className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-gold transition-all text-white outline-none" placeholder="Eje: Goodyear" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Modelo</label>
                    <input type="text" className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-gold transition-all text-white outline-none" placeholder="Eje: Eagle F1" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Medida</label>
                    <input type="text" className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-gold transition-all text-white outline-none" placeholder="225/45 R17" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Precio</label>
                    <input type="number" className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-gold transition-all text-white outline-none font-mono" placeholder="0.00" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Stock</label>
                    <input type="number" className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-gold transition-all text-white outline-none font-mono" placeholder="10" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Imagen URL (Opcional)</label>
                  <input type="text" className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-gold transition-all text-white outline-none font-mono text-[10px]" placeholder="https://images.unsplash.com/..." />
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsAddingProduct(false)}
                  className="w-full bg-brand-gold hover:bg-brand-gold/90 text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-brand-gold/20 active:scale-95 transition-all mt-4"
                >
                  Registrar Producto
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shopping Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-brand-matte border-l border-brand-border z-[120] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue border border-brand-blue/20">
                    <ShoppingCart size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black italic uppercase text-white">Tu <span className="text-brand-blue">Carrito</span></h3>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{cartItems.length} items seleccionados</p>
                  </div>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 text-slate-500 hover:text-white rounded-full bg-white/5 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <Box size={48} className="text-slate-700 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">El carrito está vacío</p>
                  </div>
                ) : (
                  cartItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 bg-brand-dark border border-brand-border rounded-2xl group transition-all hover:border-brand-blue/30">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-brand-matte border border-brand-border shrink-0">
                        <img src={item.tire.image} alt={item.tire.model} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black text-brand-blue uppercase tracking-widest mb-1">{item.tire.brand}</p>
                        <h4 className="font-bold text-sm text-white truncate">{item.tire.model}</h4>
                        <p className="text-[10px] text-slate-500 font-mono mb-2">{item.tire.size}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-brand-red font-black text-sm">${(item.tire.discount ? item.tire.price * (1 - item.tire.discount) : item.tire.price).toLocaleString()}</p>
                          <div className="flex items-center gap-3 bg-brand-matte border border-brand-border rounded-lg px-2 py-1">
                            <span className="text-[10px] font-black text-slate-500">Q: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-6 bg-brand-dark border-t border-brand-border space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-slate-500 uppercase">Subtotal Estimado</p>
                    <p className="text-xl font-black text-white italic">
                      ${cartItems.reduce((acc, curr) => acc + (curr.tire.discount ? curr.tire.price * (1 - curr.tire.discount) : curr.tire.price) * curr.quantity, 0).toLocaleString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-brand-blue/20 active:scale-95 transition-all"
                  >
                    Proceder al Pago
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Success Modal */}
      <AnimatePresence>
        {selectedVehicleForNote && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
          >
            <NotaDeServicio 
              vehicle={selectedVehicleForNote} 
              onClose={() => setSelectedVehicleForNote(null)} 
              branch={branch}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
              className="bg-brand-matte border border-brand-border w-full max-w-md rounded-[3rem] p-12 text-center shadow-[0_0_100px_rgba(34,197,94,0.1)]"
            >
              <div className="w-24 h-24 bg-green-500/10 rounded-[2rem] flex items-center justify-center text-green-500 border border-green-500/20 mx-auto mb-8">
                <ShieldCheck size={48} strokeWidth={1} />
              </div>
              <h3 className="text-3xl font-black italic uppercase text-white mb-4">ORDEN <span className="text-green-500">RECOLECTADA</span></h3>
              <p className="text-slate-400 text-sm font-medium mb-12 leading-relaxed">Su pedido ha sido procesado exitosamente. Un asesor se pondrá en contacto pronto para coordinar la instalación.</p>
              
              <div className="bg-brand-dark rounded-3xl p-6 border border-brand-border mb-12">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ID de Transacción</p>
                <p className="text-xl font-mono text-brand-gold">#MP-99482-TX</p>
              </div>

              <button 
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setCartItems([]);
                }}
                className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all"
              >
                Volver a la Tienda
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface RoleSwitcherProps {
  currentRole: Role;
  setRole: (r: Role) => void;
  isMobile?: boolean;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, setRole, isMobile }) => {
  const roles: Role[] = ['Administrador', 'Vendedor', 'Técnico', 'Cliente'];
  
  return (
    <div className={`${isMobile ? 'grid grid-cols-2 gap-2' : 'flex items-center gap-1 bg-brand-matte border border-brand-border p-1 rounded-2xl shadow-xl'}`}>
      {roles.map((r) => (
        <button
          key={r}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setRole(r);
          }}
          className={`
            px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 relative z-10
            ${currentRole === r 
              ? 'bg-brand-red text-white shadow-lg shadow-brand-red/40 translate-y-[-1px]' 
              : 'text-slate-500 hover:text-white hover:bg-white/5'
            }
            ${!isMobile && currentRole === r ? 'scale-105' : ''}
          `}
        >
          {r}
        </button>
      ))}
    </div>
  );
};

interface SidebarLinkProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ active, icon, label, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all relative group overflow-hidden ${
        active 
          ? 'bg-brand-red/10 text-white border border-brand-red/20 shadow-inner' 
          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
      }`}
    >
      <span className={active ? 'text-brand-red relative z-10' : 'relative z-10 group-hover:text-white transition-colors'}>{icon}</span>
      <span className="text-sm font-bold tracking-tight relative z-10">{label}</span>
      {active && <motion.div layoutId="nav-pill" className="absolute right-0 w-1 h-6 bg-brand-red rounded-l-full" />}
    </button>
  );
};

function StatCard({ label, value, diff, icon, color }: any) {
  return (
    <div className="bg-brand-matte border border-brand-border rounded-3xl p-6 relative group overflow-hidden hover:border-white/10 transition-all shadow-xl">
      <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 group-hover:opacity-25 transition-all ${
        color === 'blue' ? 'bg-brand-blue' : 
        color === 'red' ? 'bg-brand-red' : 
        color === 'gold' ? 'bg-brand-gold' :
        'bg-slate-600'
      }`} />
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl bg-brand-dark border border-brand-border text-slate-400 group-hover:text-white transition-colors ${
          color === 'blue' ? 'group-hover:bg-brand-blue' : 
          color === 'red' ? 'group-hover:bg-brand-red' : 
          color === 'gold' ? 'group-hover:bg-brand-gold' :
          'group-hover:bg-slate-600'
        }`}>
          {icon}
        </div>
        <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded italic">{diff}</span>
      </div>
      <div>
        <p className="text-3xl font-black text-white italic tracking-tighter">{value}</p>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] mt-1 group-hover:text-slate-400 transition-colors">{label}</p>
      </div>
    </div>
  );
}

function ProductCard({ tire, onSell, isCustomer }: any) {
  const [loading, setLoading] = useState(false);
  const handleSale = () => {
    setLoading(true);
    onSell();
    setTimeout(() => setLoading(false), 800);
  };

  const currentPrice = tire.price * (1 - (tire.discount || 0));

  return (
    <div className="bg-brand-matte border border-brand-border rounded-3xl overflow-hidden group hover:border-brand-red/40 transition-all relative shadow-2xl">
      <div className="aspect-square relative overflow-hidden bg-black/40">
        <img src={tire.image} alt={tire.model} className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" />
        {tire.discount && <div className="absolute top-4 left-4 bg-brand-red text-white text-[10px] font-black px-2 py-1 rounded shadow-xl tracking-widest">-{tire.discount * 100}% DTO</div>}
      </div>
      <div className="p-6 space-y-4">
        <div>
          <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-1">{tire.brand}</p>
          <h4 className="font-bold text-lg text-white leading-tight uppercase tracking-tighter">{tire.model}</h4>
          <p className="text-xs text-slate-500 font-bold mt-1">{tire.size}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-right">
            {tire.discount && <p className="text-[10px] text-slate-600 line-through font-bold">${tire.price}</p>}
            <p className="text-xl font-black text-white tracking-tighter italic">${currentPrice.toLocaleString()}</p>
          </div>
          <div className="w-px h-8 bg-brand-border" />
          <div className="text-center px-3 py-1 bg-brand-dark rounded-lg border border-brand-border group-hover:border-brand-blue/30 transition-colors">
            <p className="text-[8px] font-black text-slate-500 uppercase">Stock</p>
            <p className="text-xs font-black text-brand-blue">{tire.stock}</p>
          </div>
        </div>

        <button 
          onClick={handleSale}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg ${
            loading ? 'bg-green-600 shadow-green-900/40' : (isCustomer ? 'bg-brand-blue hover:bg-brand-blue/90 shadow-brand-blue/30' : 'bg-brand-red hover:bg-brand-red/90 active:scale-95 shadow-brand-red/30')
          }`}
        >
          {loading ? <CheckCircle2 size={16} /> : (isCustomer ? <ShoppingCart size={16} /> : <ShoppingCart size={16} />)}
          {loading ? (isCustomer ? 'AÑADIDO' : '¡LISTO!') : (isCustomer ? 'COMPRAR' : 'VENDER AHORA')}
        </button>
      </div>
    </div>
  );
}

function QuickAction({ label, icon, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-brand-dark border border-brand-border hover:border-brand-red/50 hover:bg-brand-red/5 transition-all group active:scale-95"
    >
      <div className={`p-2.5 rounded-xl bg-brand-matte border border-brand-border group-hover:bg-brand-red text-slate-400 group-hover:text-white transition-all shadow-lg`}>
        {icon}
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block text-center min-h-[2.5em] flex items-center leading-tight group-hover:text-white transition-colors">{label}</span>
    </button>
  );
}
