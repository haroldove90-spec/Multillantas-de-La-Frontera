import React, { useState, useMemo, useEffect } from 'react';
import { 
  Box, 
  Search, 
  Plus, 
  ArrowRightLeft, 
  History, 
  AlertTriangle, 
  DollarSign, 
  Grid, 
  List, 
  Filter, 
  Download, 
  Truck, 
  Package, 
  RefreshCw,
  TrendingUp,
  Image as ImageIcon,
  Bell,
  Trash2,
  CheckCircle2,
  ArrowRight,
  User,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tire, 
  Branch, 
  Role, 
  InventoryMovement, 
  StockTransfer, 
  TransferStatus,
  MovementType,
  WarehouseName
} from '../types';
import { getTires, saveTires, addAuditLog } from '../utils/persistentStorage';

interface InventarioPanelProps {
  userRole: Role;
}

interface LogNotification {
  id: string;
  type: 'incoming' | 'outgoing' | 'transfer' | 'system';
  title: string;
  message: string;
  timestamp: string;
}

const NOTIFICATIONS_STORAGE_KEY = 'multillantas_warehouse_notifs_v1';

export const InventarioPanel: React.FC<InventarioPanelProps> = ({ userRole }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [tires, setTires] = useState<Tire[]>(() => getTires());
  const [exchangeRate, setExchangeRate] = useState(20.50);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  
  // Custom notifications state
  const [notifications, setNotifications] = useState<LogNotification[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { return []; }
    }
    // Return sample initial notifications if none exist
    const initial: LogNotification[] = [
      {
        id: 'n1',
        type: 'system',
        title: 'Sincronización de Bodegas',
        message: 'Inventarios de Bodega 1 (Nacional) y Bodega 2 (Importaciones) se encuentran activos y vinculados.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  });

  // Admin Level Access Tabs: 'sucursales' | 'bodega1' | 'bodega2'
  const [activeAccessTab, setActiveAccessTab] = useState<'sucursales' | 'bodega1' | 'bodega2'>('sucursales');

  // Modals state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  // States for individual card direct registration
  const [editingTireId, setEditingTireId] = useState<string | null>(null);
  const [directAddQty, setDirectAddQty] = useState<number>(0);

  // Advanced Transfer Cart Form State (supports multiple item transferring)
  const [transferSource, setTransferSource] = useState<Branch | WarehouseName>('Bodega 1');
  const [transferDest, setTransferDest] = useState<Branch | WarehouseName>('Frontera');
  const [transferCart, setTransferCart] = useState<Array<{ tireId: string; quantity: number }>>([
    { tireId: '', quantity: 1 }
  ]);
  const [transferError, setTransferError] = useState('');

  // Individual Entrada Form State
  const [entradaTarget, setEntradaTarget] = useState<WarehouseName>('Bodega 1');
  const [entradaTireId, setEntradaTireId] = useState('');
  const [entradaQty, setEntradaQty] = useState<number>(10);
  const [entradaReason, setEntradaReason] = useState('Importación Directa');
  const [entradaError, setEntradaError] = useState('');

  // Sync state with standard events
  useEffect(() => {
    const handleStateUpdate = () => {
      setTires(getTires());
    };
    window.addEventListener('multillantas_state_update', handleStateUpdate);
    return () => window.removeEventListener('multillantas_state_update', handleStateUpdate);
  }, []);

  // Save notifications helper
  const addAndSaveNotification = (type: 'incoming' | 'outgoing' | 'transfer' | 'system', title: string, message: string) => {
    const newNotif: LogNotification = {
      id: 'notif-' + Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    const updated = [newNotif, ...notifications].slice(0, 30); // Keep last 30
    setNotifications(updated);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  };

  // Filters calculation
  const brands = useMemo(() => ['Todas', ...new Set(tires.map(t => t.brand))], [tires]);
  
  const filteredTires = useMemo(() => {
    return tires.filter(tire => {
      const matchesSearch = tire.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           tire.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tire.size.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = selectedBrand === 'Todas' || tire.brand === selectedBrand;
      
      // If we are looking at branch stocks, show only if total stock > 0.
      // If looking at Bodega 1 or Bodega 2, show those catalog tires
      return matchesSearch && matchesBrand;
    });
  }, [tires, searchTerm, selectedBrand]);

  const handleUpdateExchangeRate = () => {
    const newRate = 20.30 + Math.random() * 0.40;
    setExchangeRate(Number(newRate.toFixed(2)));
    addAndSaveNotification('system', 'Actualización de Cambios', `Se recalculó la tasa cambiaría a $${newRate.toFixed(2)} MXN.`);
  };

  const isAdmin = userRole === 'Administrador';

  // Quick Inline stock add handler (For direct stock intake at individual level)
  const handleDirectAdd = (tireId: string, warehouse: WarehouseName) => {
    if (directAddQty <= 0) return;
    
    const updatedTires = tires.map(t => {
      if (t.id === tireId) {
        const currentStocks = t.warehouseStocks || { 'Bodega 1': 0, 'Bodega 2': 0 };
        const newQty = (currentStocks[warehouse] || 0) + directAddQty;
        
        // Update general stock as well
        const generalStockDiff = directAddQty;
        
        return {
          ...t,
          stock: t.stock + generalStockDiff,
          warehouseStocks: {
            ...currentStocks,
            [warehouse]: newQty
          }
        };
      }
      return t;
    });

    saveTires(updatedTires);
    setTires(updatedTires);
    
    const matchedTire = tires.find(t => t.id === tireId);
    if (matchedTire) {
      addAndSaveNotification(
        'incoming', 
        `Entrada en ${warehouse}`, 
        `Se dieron de alta ${directAddQty} unidades de ${matchedTire.brand} ${matchedTire.model} directamente.`
      );

      addAuditLog(
        'Administrador',
        'Entrada Inventario Bodega',
        'Tire',
        tireId,
        'Frontera',
        `Entrada de ${directAddQty} unidades de ${matchedTire.brand} ${matchedTire.model} en ${warehouse}.`
      );
    }

    setEditingTireId(null);
    setDirectAddQty(0);
  };

  // Advanced Transfer execution (handling single or multiple products)
  const handlePerformTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');

    if (transferSource === transferDest) {
      setTransferError('El origen y destino no pueden ser el mismo.');
      return;
    }

    // Validate cart
    for (const item of transferCart) {
      if (!item.tireId) {
        setTransferError('Selecciona todos los productos antes de transferir.');
        return;
      }
      if (item.quantity <= 0) {
        setTransferError('Las cantidades de traspaso deben ser mayores a 0.');
        return;
      }

      // Check if source has enough stock
      const tire = tires.find(t => t.id === item.tireId);
      if (!tire) {
        setTransferError('Producto no encontrado.');
        return;
      }

      let availableStock = 0;
      if (transferSource === 'Bodega 1' || transferSource === 'Bodega 2') {
        availableStock = (tire.warehouseStocks?.[transferSource] || 0);
      } else {
        availableStock = (tire.branchStocks[transferSource as Branch] || 0);
      }

      if (availableStock < item.quantity) {
        setTransferError(`Stock insuficiente para ${tire.brand} ${tire.model}. Disponible en ${transferSource}: ${availableStock}. Solicitado: ${item.quantity}.`);
        return;
      }
    }

    // Execute transfer
    const updatedTires = tires.map(t => {
      const match = transferCart.find(item => item.tireId === t.id);
      if (match) {
        const qty = match.quantity;
        let newBranchStocks = { ...t.branchStocks };
        let newWarehouseStocks = t.warehouseStocks ? { ...t.warehouseStocks } : { 'Bodega 1': 0, 'Bodega 2': 0 };

        // Subtract from source
        if (transferSource === 'Bodega 1' || transferSource === 'Bodega 2') {
          newWarehouseStocks[transferSource] = (newWarehouseStocks[transferSource] || 0) - qty;
        } else {
          newBranchStocks[transferSource as Branch] = (newBranchStocks[transferSource as Branch] || 0) - qty;
        }

        // Add to destination
        if (transferDest === 'Bodega 1' || transferDest === 'Bodega 2') {
          newWarehouseStocks[transferDest] = (newWarehouseStocks[transferDest] || 0) + qty;
        } else {
          newBranchStocks[transferDest as Branch] = (newBranchStocks[transferDest as Branch] || 0) + qty;
        }

        return {
          ...t,
          branchStocks: newBranchStocks,
          warehouseStocks: newWarehouseStocks
        };
      }
      return t;
    });

    saveTires(updatedTires);
    setTires(updatedTires);

    // Create notifications and audit logs
    transferCart.forEach(item => {
      const tire = tires.find(t => t.id === item.tireId);
      if (tire) {
        addAndSaveNotification(
          'transfer',
          'Traspaso Autorizado',
          `Se enviaron ${item.quantity} unidades de ${tire.brand} ${tire.model} de ${transferSource} a ${transferDest}.`
        );

        addAuditLog(
          'Administrador',
          'Traspaso Stock',
          'Tire',
          item.tireId,
          'Frontera',
          `Traspaso logístico de ${item.quantity} piezas de ${tire.brand} ${tire.model} desde ${transferSource} hacia ${transferDest}.`
        );
      }
    });

    setIsTransferModalOpen(false);
    // Reset Cart
    setTransferCart([{ tireId: '', quantity: 1 }]);
  };

  // Perform Individual Entrada
  const handlePerformEntrada = (e: React.FormEvent) => {
    e.preventDefault();
    setEntradaError('');

    if (!entradaTireId) {
      setEntradaError('Selecciona un producto para dar de alta.');
      return;
    }
    if (entradaQty <= 0) {
      setEntradaError('Ingresa una cantidad válida mayor a 0.');
      return;
    }

    const updatedTires = tires.map(t => {
      if (t.id === entradaTireId) {
        const currentStocks = t.warehouseStocks || { 'Bodega 1': 0, 'Bodega 2': 0 };
        const newWarehouseStocks = {
          ...currentStocks,
          [entradaTarget]: (currentStocks[entradaTarget] || 0) + entradaQty
        };

        // Increment general stock sum
        return {
          ...t,
          stock: t.stock + entradaQty,
          warehouseStocks: newWarehouseStocks
        };
      }
      return t;
    });

    saveTires(updatedTires);
    setTires(updatedTires);

    const matched = tires.find(t => t.id === entradaTireId);
    if (matched) {
      addAndSaveNotification(
        'incoming',
        `Entrada Registrada`,
        `Ingresaron ${entradaQty} unidades de ${matched.brand} ${matched.model} en ${entradaTarget} por ${entradaReason}.`
      );

      addAuditLog(
        'Administrador',
        'Alta Stock Individual',
        'Tire',
        entradaTireId,
        'Frontera',
        `Ingreso individual de ${entradaQty} piezas en ${entradaTarget}. Concepto: ${entradaReason}.`
      );
    }

    setIsMovementModalOpen(false);
    setEntradaTireId('');
    setEntradaQty(10);
    setEntradaReason('Importación Directa');
  };

  // Cart manipulation for transfers
  const handleAddTransferCartRow = () => {
    setTransferCart([...transferCart, { tireId: '', quantity: 1 }]);
  };

  const handleRemoveTransferCartRow = (idx: number) => {
    if (transferCart.length === 1) return;
    setTransferCart(transferCart.filter((_, i) => i !== idx));
  };

  const handleUpdateTransferCartItem = (idx: number, field: 'tireId' | 'quantity', value: any) => {
    const updated = [...transferCart];
    updated[idx] = {
      ...updated[idx],
      [field]: value
    };
    setTransferCart(updated);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <img src="https://appdesign.appdesignproyectos.com/multillantas.png" alt="Logo" className="h-12 w-auto hidden md:block" />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center text-black shadow-lg shadow-brand-gold/20">
                <Box size={22} />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white italic uppercase">
                INVENTARIO <span className="text-brand-gold">MULTIBODEGA</span>
              </h2>
            </div>
            <p className="text-slate-550 text-[11px] font-black uppercase tracking-[0.2em] mt-1 border-l-2 border-brand-red pl-3">
              Administración de Stocks e Importaciones de la Frontera
            </p>
          </div>
        </div>

        {/* Exchange Rate & Sinc Stats Widget */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Sinc Status */}
          <div className="hidden sm:flex bg-[#050505] border border-brand-border rounded-2xl px-4 py-3 items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-ping" />
            <div>
              <p className="text-[8px] font-black uppercase text-slate-500 leading-none">Canales de Bodega</p>
              <p className="text-[10px] font-black text-brand-gold mt-1">ONLINE / SINCRONIZADO</p>
            </div>
          </div>

          <div className="bg-[#050505] border border-brand-border rounded-2xl p-4 flex items-center gap-4 shadow-xl">
            <div className="flex items-center gap-3 pr-4 border-r border-brand-border">
              <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                <DollarSign size={16} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Tasa USD/MXN</p>
                <p className="text-lg font-black text-white">${exchangeRate.toFixed(2)}</p>
              </div>
            </div>
            <button 
              onClick={handleUpdateExchangeRate}
              className="p-2 hover:bg-white/5 rounded-xl transition-all text-brand-gold group"
              title="Recalcular Precios con Tasa"
            >
              <RefreshCw size={18} className="group-active:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </div>
      </header>

      {/* ACCESS CHANNELS / TABS FOR WAREHOUSES - REQUIREMENT */}
      <div className="bg-[#030303] border-b border-brand-border/60 p-2 rounded-[2rem] flex flex-col md:flex-row gap-2 justify-between items-stretch md:items-center">
        <div className="flex p-1 bg-[#090909] border border-brand-border/40 rounded-2xl gap-1 flex-1 md:flex-initial">
          <button
            type="button"
            onClick={() => setActiveAccessTab('sucursales')}
            className={`flex-1 py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all text-xs font-black uppercase tracking-wider font-mono ${
              activeAccessTab === 'sucursales'
                ? 'bg-brand-red text-white shadow-lg shadow-brand-red/10 border border-brand-red/20'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <Truck size={14} /> Sucursales Físicas
          </button>
          
          {isAdmin ? (
            <>
              <button
                type="button"
                onClick={() => { setActiveAccessTab('bodega1'); setEditingTireId(null); }}
                className={`flex-1 py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all text-xs font-black uppercase tracking-wider font-mono ${
                  activeAccessTab === 'bodega1'
                    ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <Box size={14} /> Bodega 1 <span className="bg-black/20 text-black px-1.5 py-0.5 rounded text-[9px]">Gral</span>
              </button>
              
              <button
                type="button"
                onClick={() => { setActiveAccessTab('bodega2'); setEditingTireId(null); }}
                className={`flex-1 py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all text-xs font-black uppercase tracking-wider font-mono ${
                  activeAccessTab === 'bodega2'
                    ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers size={14} /> Bodega 2 <span className="bg-black/20 text-black px-1.5 py-0.5 rounded text-[9px]">Imp</span>
              </button>
            </>
          ) : (
            <div className="flex items-center px-4 text-[10px] uppercase font-black tracking-widest text-[#990000] border-l border-brand-border/30">
              🔒 Administrador controla stocks de bodegas centralizadas
            </div>
          )}
        </div>

        {/* Action Controls for Admin */}
        {isAdmin && (
          <div className="flex items-center gap-2 p-1">
            <button 
              onClick={() => setIsTransferModalOpen(true)}
              className="px-5 py-3 bg-brand-matte border border-brand-border/80 hover:border-brand-gold hover:text-brand-gold rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all flex items-center gap-2"
              title="Realizar traspasos entre bodegas y sucursales"
            >
              <ArrowRightLeft size={14} className="text-brand-gold" /> Traspaso Logístico
            </button>
            <button 
              onClick={() => setIsMovementModalOpen(true)}
              className="px-5 py-3 bg-brand-gold text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-gold/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
              title="Dar de alta de inventario individual"
            >
              <Plus size={14} strokeWidth={3} /> Alta Individual
            </button>
          </div>
        )}
      </div>

      {/* Grid container: Left is Filters / List and Right is Real-Time Log Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Side: Filter and main product grid */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Inner Search & Filter controller */}
          <div className="bg-brand-matte border border-brand-border rounded-3xl p-5 flex flex-col md:flex-row gap-4 items-center shadow-2xl">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text"
                placeholder={`Buscar neumáticos en ${activeAccessTab === 'sucursales' ? 'sucursales' : activeAccessTab === 'bodega1' ? 'Bodega 1' : 'Bodega 2'} por marca o medida...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#000000] border border-brand-border rounded-xl pl-12 pr-4 py-3 text-sm focus:border-brand-gold transition-all text-white outline-none placeholder:text-slate-600"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <div className="w-full md:w-48 relative group">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                <select 
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-[#000000] border border-brand-border rounded-xl pl-10 pr-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-300 outline-none appearance-none cursor-pointer"
                >
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="bg-brand-dark border border-brand-border p-1 rounded-xl flex shrink-0">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-red text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  <Grid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-red text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Current view disclaimer */}
          <div className="p-4 bg-black/60 border border-brand-border/40 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                <Info size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-white">
                  {activeAccessTab === 'sucursales' 
                    ? 'Monitoreo General de Sucursales' 
                    : activeAccessTab === 'bodega1' 
                    ? 'Bodega Central de Almacenamiento 1' 
                    : 'Bodega de Reserva e Importaciones 2'}
                </p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">
                  {activeAccessTab === 'sucursales' 
                    ? 'Muestra las llantas distribuidas en Centro, Norte y Frontera.' 
                    : 'Stock exclusivo para resguardo y abastecimiento principal.'}
                </p>
              </div>
            </div>
            {isAdmin && activeAccessTab !== 'sucursales' && (
              <span className="text-[9px] bg-brand-gold/10 border border-brand-gold/20 text-brand-gold px-3 py-1 rounded-full font-mono font-black uppercase tracking-wider">
                EDITABLE AL VUELO
              </span>
            )}
          </div>

          {/* Tires stock layout */}
          <div className={viewMode === 'grid' ? 
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : 
            "flex flex-col gap-4"
          }>
            <AnimatePresence mode='popLayout'>
              {filteredTires.map((tire) => {
                // Determine stocks based on selected view channel
                let displayedStock = 0;
                if (activeAccessTab === 'sucursales') {
                  displayedStock = tire.stock;
                } else if (activeAccessTab === 'bodega1') {
                  displayedStock = tire.warehouseStocks?.['Bodega 1'] ?? 0;
                } else if (activeAccessTab === 'bodega2') {
                  displayedStock = tire.warehouseStocks?.['Bodega 2'] ?? 0;
                }
                const isUnderStock = displayedStock < 4;

                return (
                  <motion.div 
                    key={tire.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`relative overflow-hidden flex flex-col justify-between ${
                      viewMode === 'grid' ? 
                      "bg-[#050505] border border-brand-border/80 rounded-3xl group hover:border-brand-gold/35 transition-colors" : 
                      "bg-[#050505] border border-brand-border/80 rounded-2xl flex-row items-center p-4 gap-6 group hover:border-brand-gold/35"
                    }`}
                  >
                    
                    {/* Visual display section */}
                    <div className={viewMode === 'grid' ? "w-full aspect-square p-6 bg-[#010101] flex items-center justify-center relative" : "w-32 h-32 p-3 bg-[#010101] flex items-center justify-center relative"}>
                      <img 
                        src={tire.image} 
                        alt={tire.model} 
                        referrerPolicy="no-referrer"
                        className="object-contain max-h-full max-w-full transition-transform duration-500 group-hover:scale-110"
                      />
                      
                      {isUnderStock && (
                        <div className="absolute top-4 left-4 px-2.5 py-1 bg-brand-red text-white text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-lg shadow-brand-red/50 animate-pulse">
                          <AlertTriangle size={10} strokeWidth={3} /> Stock Bajo
                        </div>
                      )}

                      {tire.discount && (
                        <div className="absolute top-4 right-4 px-2 py-0.5 bg-brand-gold text-black text-[9px] font-black uppercase tracking-widest rounded font-mono">
                          -{tire.discount * 100}%
                        </div>
                      )}
                    </div>

                    {/* Meta info body */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[9px] font-black text-brand-gold uppercase tracking-widest">{tire.brand}</span>
                            <h3 className="text-base font-black text-white group-hover:text-brand-gold transition-colors">{tire.model}</h3>
                          </div>
                          <span className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest bg-white/5 py-1 px-2.5 rounded border border-brand-border">
                            {tire.size}
                          </span>
                        </div>

                        {/* Stock visual representation */}
                        <div className="grid grid-cols-1 gap-2 mt-4">
                          <div className={`p-3.5 rounded-2xl border relative overflow-hidden ${
                            isUnderStock 
                              ? 'bg-[#990000]/5 border-[#990000]/30' 
                              : 'bg-black/60 border-brand-border'
                          }`}>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                              {activeAccessTab === 'sucursales' ? 'Stock Total Unificado' : `Stock en ${activeAccessTab === 'bodega1' ? 'Bodega 1' : 'Bodega 2'}`}
                            </p>
                            <div className="flex items-baseline justify-between">
                              <p className={`text-2xl font-mono font-black ${isUnderStock ? 'text-brand-red' : 'text-slate-100'}`}>
                                {displayedStock} <span className="text-[10px] font-sans font-bold text-slate-550">piezas</span>
                              </p>
                              <Package size={18} className="text-slate-700" />
                            </div>
                          </div>
                        </div>

                        {/* Branch Specific Snapshot or Warehouse details */}
                        {activeAccessTab === 'sucursales' ? (
                          <div className="mt-4 pt-4 border-t border-brand-border/40 space-y-1.5 text-xs">
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-wider mb-2">Desglose Sucursales</p>
                            {(['Centro', 'Norte', 'Frontera'] as Branch[]).map(b => {
                              const subStock = tire.branchStocks[b] || 0;
                              return (
                                <div key={b} className="flex justify-between items-center px-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${subStock > 8 ? 'bg-green-500' : subStock === 0 ? 'bg-brand-red animate-pulse' : 'bg-brand-gold'}`} />
                                    <span className="text-slate-450 font-bold uppercase text-[9px]">{b}</span>
                                  </div>
                                  <span className="font-mono text-white font-bold text-[10px]">{subStock}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          /* Warehouse view - displays sub stocks in reference to other locations, for context */
                          <div className="mt-4 pt-4 border-t border-brand-border/40 space-y-2">
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-wider">Distribución Restante</p>
                            <div className="grid grid-cols-2 gap-2 text-[9px]">
                              {activeAccessTab === 'bodega1' ? (
                                <>
                                  <div className="bg-[#020202] p-1.5 rounded border border-brand-border/40 text-center">
                                    <span className="text-slate-500 block text-[7px] uppercase font-black">Bodega 2</span>
                                    <span className="font-mono text-brand-gold font-black text-[11px]">{tire.warehouseStocks?.['Bodega 2'] ?? 0}</span>
                                  </div>
                                  <div className="bg-[#020202] p-1.5 rounded border border-brand-border/40 text-center">
                                    <span className="text-slate-500 block text-[7px] uppercase font-black">En Tiendas</span>
                                    <span className="font-mono text-slate-300 font-bold text-[11px]">
                                      {(Object.values(tire.branchStocks) as number[]).reduce((sum, val) => sum + val, 0)}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="bg-[#020202] p-1.5 rounded border border-brand-border/40 text-center">
                                    <span className="text-slate-500 block text-[7px] uppercase font-black">Bodega 1</span>
                                    <span className="font-mono text-brand-gold font-black text-[11px]">{tire.warehouseStocks?.['Bodega 1'] ?? 0}</span>
                                  </div>
                                  <div className="bg-[#020202] p-1.5 rounded border border-brand-border/40 text-center">
                                    <span className="text-slate-500 block text-[7px] uppercase font-black">En Tiendas</span>
                                    <span className="font-mono text-slate-300 font-bold text-[11px]">
                                      {(Object.values(tire.branchStocks) as number[]).reduce((sum, val) => sum + val, 0)}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* INDIVIDUAL STOCK INTAKE IN-PLACE FOR ADMIN - REQUIREMENT */}
                      {isAdmin && activeAccessTab !== 'sucursales' && (
                        <div className="mt-4 pt-4 border-t border-brand-border/40 font-mono">
                          {editingTireId === tire.id ? (
                            <div className="space-y-3 bg-brand-dark/80 p-3 rounded-2xl border border-brand-gold/30">
                              <p className="text-[8px] font-black text-brand-gold uppercase tracking-widest flex items-center gap-1.5">
                                <Sparkles size={10} /> Ingreso de Stock Individual
                              </p>
                              
                              <div className="flex gap-2 items-center">
                                <button 
                                  type="button"
                                  onClick={() => setDirectAddQty(Math.max(1, directAddQty - 1))}
                                  className="w-8 h-8 rounded bg-brand-matte border border-brand-border font-bold text-white hover:text-brand-red flex items-center justify-center text-xs"
                                >
                                  -
                                </button>
                                <input 
                                  type="number"
                                  value={directAddQty}
                                  onChange={(e) => setDirectAddQty(Math.max(1, parseInt(e.target.value) || 1))}
                                  className="w-16 bg-[#000000] border border-brand-border rounded text-center text-xs py-1.5 text-white font-bold outline-none focus:border-brand-gold"
                                />
                                <button 
                                  type="button"
                                  onClick={() => setDirectAddQty(directAddQty + 1)}
                                  className="w-8 h-8 rounded bg-brand-matte border border-brand-border font-bold text-white hover:text-brand-gold flex items-center justify-center text-xs"
                                >
                                  +
                                </button>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingTireId(null)}
                                  className="flex-1 py-1.5 bg-transparent border border-brand-border rounded text-[8px] font-black uppercase text-slate-400 hover:bg-white/5 transition-all"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDirectAdd(tire.id, activeAccessTab === 'bodega1' ? 'Bodega 1' : 'Bodega 2')}
                                  className="flex-1 py-1.5 bg-brand-gold text-black rounded text-[8px] font-black uppercase hover:opacity-90 transition-all flex items-center justify-center gap-1"
                                >
                                  <CheckCircle2 size={10} /> Alta Ok
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => { setEditingTireId(tire.id); setDirectAddQty(10); }}
                              className="w-full py-2.5 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold border border-brand-gold/25 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                            >
                              <Plus size={14} strokeWidth={2.5} /> Alta Individual en {activeAccessTab === 'bodega1' ? 'B1' : 'B2'}
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Persistent Notifications & Audit Logs list */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-brand-matte border border-brand-border rounded-[2.5rem] p-6 flex flex-col h-[650px] shadow-2xl relative overflow-hidden">
            <div className="border-b border-brand-border pb-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-brand-red/10 rounded-xl text-brand-red border border-brand-red/20">
                  <Bell size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Alertas & Traspasos</h3>
                  <p className="text-[8px] text-slate-500 font-mono font-black uppercase">Notificaciones de almacén</p>
                </div>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="p-1.5 hover:bg-[#990000]/10 hover:text-brand-red text-slate-550 rounded-lg transition-colors"
                  title="Limpiar todas las notificaciones"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Notifications Scroller container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
              <AnimatePresence initial={false}>
                {notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-650">
                    <Info size={32} strokeWidth={1.5} className="mb-2" />
                    <p className="text-xs font-bold uppercase">Sin notificaciones</p>
                    <p className="text-[10px] text-slate-550 mt-1">Los movimientos de traspaso logísticos y entradas de stock se desplegarán aquí.</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    let typeColor = 'sky-500';
                    let borderAccent = 'border-l-sky-500';
                    if (n.type === 'incoming') {
                      typeColor = 'text-green-400';
                      borderAccent = 'border-l-green-500';
                    } else if (n.type === 'outgoing') {
                      typeColor = 'text-brand-red';
                      borderAccent = 'border-l-[#990000]';
                    } else if (n.type === 'transfer') {
                      typeColor = 'text-brand-gold';
                      borderAccent = 'border-l-brand-gold';
                    }

                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`p-3 bg-brand-dark/50 border border-brand-border border-l-4 ${borderAccent} rounded-xl text-left space-y-1.5`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`text-[9px] font-black uppercase ${typeColor} tracking-widest`}>
                            {n.type === 'incoming' && 'Entrada'}
                            {n.type === 'outgoing' && 'Salida'}
                            {n.type === 'transfer' && 'Traspaso'}
                            {n.type === 'system' && 'Ajuste'}
                          </span>
                          <span className="text-[9px] text-slate-550 font-mono">{n.timestamp}</span>
                        </div>
                        <h4 className="text-[11px] font-black text-slate-200 leading-tight uppercase font-sans">{n.title}</h4>
                        <p className="text-[10px] text-slate-450 leading-normal">{n.message}</p>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Bottom help banner info */}
            <div className="mt-4 pt-4 border-t border-brand-border/45 bg-black/40 p-3 rounded-2xl">
              <p className="text-[9px] text-slate-500 leading-normal flex gap-2">
                <Info size={14} className="shrink-0 text-brand-gold" />
                <span>Cualquier traspaso logístico genera un hash de auditoría y ajusta el stock total unificado automáticamente.</span>
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* COMPREHENSIVE BODEGA/SUCURSAL TRANSFER MODAL WITH CART / MULTIPLE PRODUCTS SUPPORT */}
      <AnimatePresence>
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md font-sans">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-brand-matte border border-brand-border w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(212,175,55,0.15)] flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-brand-border flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-gold/10 rounded-2xl text-brand-gold border border-brand-gold/20">
                    <ArrowRightLeft size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase text-white">
                      Traspaso de <span className="text-brand-gold">Inventario Multibodega</span>
                    </h3>
                    <p className="text-[9px] text-slate-550 font-black uppercase tracking-widest font-mono">Pasar uno o varios productos entre bodegas / sucursales</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsTransferModalOpen(false)}
                  className="p-2 text-slate-500 hover:text-white rounded-full bg-white/5 transition-colors"
                >
                  <RefreshCw className="rotate-45" size={20} />
                </button>
              </div>

              <form onSubmit={handlePerformTransfer} className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                
                {transferError && (
                  <div className="p-4 bg-brand-red/10 border border-brand-red/20 rounded-2xl flex gap-3 text-brand-red text-xs font-bold leading-normal">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span>{transferError}</span>
                  </div>
                )}

                {/* Origin / Dest selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#990000] pl-1 font-mono">Origen del Inventario</label>
                    <select 
                      value={transferSource}
                      onChange={(e) => setTransferSource(e.target.value as any)}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-gold cursor-pointer font-black"
                    >
                      <option value="Bodega 1">BODEGA 1 (PRINCIPAL)</option>
                      <option value="Bodega 2">BODEGA 2 (RESERVA/IMP)</option>
                      <option value="Centro">SUCURSAL CENTRO</option>
                      <option value="Norte">SUCURSAL NORTE</option>
                      <option value="Frontera">SUCURSAL FRONTERA</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-gold pl-1 font-mono">Destino del Inventario</label>
                    <select 
                      value={transferDest}
                      onChange={(e) => setTransferDest(e.target.value as any)}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-gold cursor-pointer font-black"
                    >
                      <option value="Frontera">SUCURSAL FRONTERA</option>
                      <option value="Centro">SUCURSAL CENTRO</option>
                      <option value="Norte">SUCURSAL NORTE</option>
                      <option value="Bodega 1">BODEGA 1 (PRINCIPAL)</option>
                      <option value="Bodega 2">BODEGA 2 (RESERVA/IMP)</option>
                    </select>
                  </div>
                </div>

                {/* Multiple Stock Transfer List (Multiple Items support!) */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-350">Productos a Traspasar</label>
                    <button
                      type="button"
                      onClick={handleAddTransferCartRow}
                      className="px-3 py-1.5 bg-brand-gold text-black rounded-lg text-[9px] font-black uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-1"
                    >
                      <Plus size={12} strokeWidth={3} /> Agregar Línea
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                    {transferCart.map((row, idx) => {
                      // Lookup available quantity for row tire in the selected source
                      const selectedTireObj = tires.find(t => t.id === row.tireId);
                      let maxAvailable = 0;
                      if (selectedTireObj) {
                        if (transferSource === 'Bodega 1' || transferSource === 'Bodega 2') {
                          maxAvailable = selectedTireObj.warehouseStocks?.[transferSource] ?? 0;
                        } else {
                          maxAvailable = selectedTireObj.branchStocks[transferSource as Branch] ?? 0;
                        }
                      }

                      return (
                        <div key={idx} className="flex gap-3 items-center bg-black/40 border border-brand-border p-3.5 rounded-xl">
                          <div className="flex-1">
                            <select
                              value={row.tireId}
                              onChange={(e) => handleUpdateTransferCartItem(idx, 'tireId', e.target.value)}
                              className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-xs text-white font-black"
                            >
                              <option value="">-- SELECCIONA NEUMÁTICO --</option>
                              {tires.map(t => {
                                const currentAmt = (transferSource === 'Bodega 1' || transferSource === 'Bodega 2') 
                                  ? (t.warehouseStocks?.[transferSource] ?? 0)
                                  : (t.branchStocks[transferSource as Branch] ?? 0);
                                return (
                                  <option key={t.id} value={t.id}>
                                    {t.brand} {t.model} ({t.size}) - [Disponibles: {currentAmt}]
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          <div className="w-24">
                            <input
                              type="number"
                              min={1}
                              max={maxAvailable > 0 ? maxAvailable : 999}
                              value={row.quantity}
                              onChange={(e) => handleUpdateTransferCartItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-xs text-center text-white outline-none focus:border-brand-gold font-bold font-mono"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveTransferCartRow(idx)}
                            disabled={transferCart.length === 1}
                            className={`p-2 rounded-lg border transition-all ${
                              transferCart.length === 1 
                                ? 'border-brand-border/20 text-slate-700 cursor-not-allowed'
                                : 'border-[#990000]/30 hover:bg-[#990000]/10 text-brand-red'
                            }`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 text-center py-4 bg-brand-gold/5 rounded-2xl border border-brand-gold/20">
                  <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] mb-1">Confirmación de Operación Logística</p>
                  <p className="text-slate-500 text-[10px] uppercase font-mono italic">Los stocks de origen disminuirán y los de destino aumentarán instantáneamente.</p>
                </div>

                <div className="flex gap-4 pt-4 border-t border-brand-border/40 font-mono">
                  <button 
                    type="button"
                    onClick={() => setIsTransferModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-transparent border border-brand-border hover:bg-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-all"
                  >
                    Cerrar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] px-6 py-4 bg-brand-gold hover:bg-brand-gold/90 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-gold/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRightLeft size={14} strokeWidth={3} /> Procesar Traspaso
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FORMAL ENTRADA / INDIVIDUAL INVENTORY INTAKE MODAL FOR ADMIN */}
      <AnimatePresence>
        {isMovementModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md font-sans">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-brand-matte border border-brand-border w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(230,190,0,0.1)] flex flex-col"
            >
              <div className="p-8 border-b border-brand-border flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-gold/10 rounded-2xl text-brand-gold border border-brand-gold/20">
                    <Plus size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase text-white">
                      Entrada de <span className="text-brand-gold">Inventario Central</span>
                    </h3>
                    <p className="text-[9px] text-slate-550 font-black uppercase tracking-widest font-mono">Dar de alta stock individual por concepto</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMovementModalOpen(false)}
                  className="p-2 text-slate-500 hover:text-white rounded-full bg-white/5 transition-colors"
                >
                  <RefreshCw className="rotate-45" size={20} />
                </button>
              </div>

              <form onSubmit={handlePerformEntrada} className="p-8 space-y-5">
                
                {entradaError && (
                  <div className="p-4 bg-brand-red/10 border border-brand-red/20 rounded-2xl text-brand-red text-xs font-bold leading-normal flex gap-3">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span>{entradaError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Destino de la Entrada</label>
                  <select 
                    value={entradaTarget}
                    onChange={(e) => setEntradaTarget(e.target.value as WarehouseName)}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-gold cursor-pointer font-black"
                  >
                    <option value="Bodega 1">BODEGA 1 (ALMACÉN GENERAL)</option>
                    <option value="Bodega 2">BODEGA 2 (IMPORTACIONES DIRECTAS)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Seleccionar Neumático</label>
                  <select 
                    value={entradaTireId}
                    onChange={(e) => setEntradaTireId(e.target.value)}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-gold cursor-pointer font-black"
                  >
                    <option value="">-- SELECCIONAR PRODUCTO --</option>
                    {tires.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.brand} {t.model} ({t.size})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Cantidad de Ingreso</label>
                    <input 
                      type="number"
                      min={1}
                      value={entradaQty}
                      onChange={(e) => setEntradaQty(parseInt(e.target.value) || 10)}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-gold font-bold font-mono text-center"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Concepto o Razon</label>
                    <input 
                      type="text"
                      placeholder="Ej. Importación, Devolución o Ajuste"
                      value={entradaReason}
                      onChange={(e) => setEntradaReason(e.target.value)}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-gold font-bold"
                    />
                  </div>
                </div>

                <div className="bg-brand-red/5 p-4 rounded-2xl border border-[#990000]/25">
                  <p className="text-[9px] font-black text-brand-red uppercase tracking-wider mb-1 flex items-center gap-1.5 justify-center">
                    <Info size={12} /> Alta de Inventario Oficial
                  </p>
                  <p className="text-slate-550 text-[10px] uppercase font-mono italic text-center">Registrará una entrada en la base de datos de {entradaTarget} para abastecer las tiendas.</p>
                </div>

                <div className="flex gap-4 pt-4 border-t border-brand-border/40 font-mono">
                  <button 
                    type="button"
                    onClick={() => setIsMovementModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-transparent border border-brand-border hover:bg-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-all font-bold"
                  >
                    Salir
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] px-6 py-4 bg-brand-gold hover:bg-brand-gold/90 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-gold/20 active:scale-95 transition-all text-center"
                  >
                    Confirmar Alta
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
