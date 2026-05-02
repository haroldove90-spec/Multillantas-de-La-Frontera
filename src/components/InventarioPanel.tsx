import React, { useState, useMemo } from 'react';
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
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tire, 
  Branch, 
  Role, 
  InventoryMovement, 
  StockTransfer, 
  TransferStatus,
  MovementType 
} from '../types';
import { TIRES, MOCK_MOVEMENTS, MOCK_TRANSFERS } from '../constants';

interface InventarioPanelProps {
  userRole: Role;
}

export const InventarioPanel: React.FC<InventarioPanelProps> = ({ userRole }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [tires, setTires] = useState<Tire[]>(TIRES);
  const [exchangeRate, setExchangeRate] = useState(20.50);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch | 'Todas'>('Todas');
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  // Filters
  const brands = useMemo(() => ['Todas', ...new Set(tires.map(t => t.brand))], [tires]);
  
  const filteredTires = useMemo(() => {
    return tires.filter(tire => {
      const matchesSearch = tire.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           tire.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tire.size.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = selectedBrand === 'Todas' || tire.brand === selectedBrand;
      const matchesBranch = selectedBranch === 'Todas' || tire.branchStocks[selectedBranch] > 0;
      return matchesSearch && matchesBrand && matchesBranch;
    });
  }, [tires, searchTerm, selectedBrand, selectedBranch]);

  const handleUpdateExchangeRate = () => {
    const newRate = 20 + Math.random();
    setExchangeRate(Number(newRate.toFixed(2)));
    // Simulating price update notification
    console.log(`Precios actualizados con tasa: ${newRate.toFixed(2)}`);
  };

  const isAdmin = userRole === 'Administrador';

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
                INVENTARIO <span className="text-brand-gold">AVANZADO</span>
              </h2>
            </div>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-1 border-l-2 border-brand-gold pl-3">
              Control de stock multi-sucursal y logística
            </p>
          </div>
        </div>

        {/* Exchange Rate Widget */}
        <div className="bg-brand-matte border border-brand-border rounded-2xl p-4 flex items-center gap-4 shadow-xl">
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
            title="Actualizar Precios"
          >
            <RefreshCw size={18} className="group-active:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </header>

      {/* Control Bar */}
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="flex-1 bg-brand-matte border border-brand-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-2xl">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Buscar llanta por marca, modelo o medida..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border rounded-xl pl-12 pr-4 py-3 text-sm focus:border-brand-gold transition-all text-white outline-none placeholder:text-slate-600"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex-1 md:w-40 relative group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
              <select 
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-brand-dark border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-300 outline-none appearance-none"
              >
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="flex-1 md:w-40 relative group">
              <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
              <select 
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value as any)}
                className="w-full bg-brand-dark border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-300 outline-none appearance-none"
              >
                <option value="Todas">TODAS SUCURSALES</option>
                <option value="Centro">CENTRO</option>
                <option value="Norte">NORTE</option>
                <option value="Frontera">FRONTERA</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-brand-matte border border-brand-border p-1 rounded-xl flex">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-gold text-black' : 'text-slate-500 hover:text-white'}`}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-gold text-black' : 'text-slate-500 hover:text-white'}`}
            >
              <List size={18} />
            </button>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsTransferModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-brand-matte border border-brand-border rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-gold hover:border-brand-gold/50 transition-all shadow-xl"
              >
                <ArrowRightLeft size={16} /> Transferencia
              </button>
              <button 
                onClick={() => setIsMovementModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-brand-gold hover:bg-brand-gold/90 text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-gold/20 active:scale-95 transition-all"
              >
                <Plus size={16} strokeWidth={3} /> Entrada/Salida
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={viewMode === 'grid' ? 
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : 
        "flex flex-col gap-4"
      }>
        <AnimatePresence mode='popLayout'>
          {filteredTires.map((tire) => (
            <motion.div 
              key={tire.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`relative overflow-hidden ${
                viewMode === 'grid' ? 
                "bg-brand-matte border border-brand-border rounded-3xl group" : 
                "bg-brand-matte border border-brand-border rounded-2xl flex items-center p-4 gap-6 group"
              }`}
            >
              {/* Image Section */}
              <div className={`${viewMode === 'grid' ? "w-full aspect-square p-6" : "w-24 h-24 p-2"} bg-brand-dark/50 flex items-center justify-center relative`}>
                <img 
                  src={tire.image} 
                  alt={tire.model} 
                  className={`object-contain transition-transform duration-500 group-hover:scale-110 ${viewMode === 'grid' ? "w-full h-full" : "w-auto h-full"}`}
                />
                
                {/* Low Stock Indicator */}
                {tire.stock < 4 && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-brand-red text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-lg shadow-brand-red/50 animate-pulse">
                    <AlertTriangle size={10} strokeWidth={3} /> Stock Bajo
                  </div>
                )}

                {/* Promo Indicator */}
                {tire.discount && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-brand-gold text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-brand-gold/30">
                    -{tire.discount * 100}%
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className={`p-6 flex-1 flex flex-col ${viewMode === 'list' && "justify-between"}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] mb-1">{tire.brand}</h4>
                    <h3 className="text-lg font-bold text-white group-hover:text-brand-gold transition-colors">{tire.model}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Medida</p>
                    <p className="text-sm font-bold text-slate-300">{tire.size}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-2xl border border-brand-border/50 relative overflow-hidden ${tire.stock < 4 ? 'bg-brand-red/5 border-brand-red/20' : 'bg-brand-dark/30'}`}>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Stock Total</p>
                    <p className={`text-xl font-black ${tire.stock < 4 ? 'text-brand-red' : 'text-white'}`}>{tire.stock}</p>
                    <Package size={30} className="absolute -bottom-2 -right-2 text-white/5" />
                  </div>
                  <div className="p-3 bg-brand-dark/30 rounded-2xl border border-brand-border/50">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Precio Unitario</p>
                    <div className="space-y-0.5">
                      {tire.discount ? (
                        <>
                          <p className="text-[10px] text-slate-500 line-through">${tire.price.toLocaleString()}</p>
                          <p className="text-xl font-black text-brand-gold">${(tire.price * (1 - tire.discount)).toLocaleString()}</p>
                        </>
                      ) : (
                        <p className="text-xl font-black text-white">${tire.price.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Branch Snapshot */}
                <div className="mt-4 pt-4 border-t border-brand-border/50">
                    <div className="flex items-center justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">
                        <span>Sucursal</span>
                        <span>Disp.</span>
                    </div>
                    <div className="space-y-1.5">
                        {(['Centro', 'Norte', 'Frontera'] as Branch[]).map(b => (
                            <div key={b} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1 h-1 rounded-full ${
                                        b === 'Centro' ? 'bg-brand-red' : b === 'Norte' ? 'bg-brand-blue' : 'bg-brand-gold'
                                    }`} />
                                    <span className="text-[10px] text-slate-400 font-bold">{b}</span>
                                </div>
                                <span className="text-[10px] font-mono text-white">{tire.branchStocks[b]}</span>
                            </div>
                        ))}
                    </div>
                </div>
              </div>

              {/* Quick Actions (Admin Only) */}
              {isAdmin && (
                <div className={`absolute bottom-4 right-4 flex gap-2 transition-all ${viewMode === 'grid' ? "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0" : ""}`}>
                   <button className="w-8 h-8 rounded-lg bg-brand-dark border border-brand-border flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-gold/50 transition-all">
                        <RefreshCw size={14} />
                   </button>
                   <button className="w-8 h-8 rounded-lg bg-brand-dark border border-brand-border flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-gold/50 transition-all">
                        <ArrowRightLeft size={14} />
                   </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modals placeholders for real interaction logic */}
      <AnimatePresence>
        {isTransferModalOpen && (
            <Modal title="Transferencia" subtitle="Logística de stock entre sucursales" icon={<ArrowRightLeft />} onClose={() => setIsTransferModalOpen(false)}>
                <div className="space-y-6 p-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Origen</label>
                            <select className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm text-white outline-none">
                                <option>Centro</option>
                                <option>Norte</option>
                                <option>Frontera</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Destino</label>
                            <select className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm text-white outline-none">
                                <option>Frontera</option>
                                <option>Centro</option>
                                <option>Norte</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Producto</label>
                         <select className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm text-white outline-none">
                            {tires.map(t => <option key={t.id}>{t.brand} {t.model} ({t.size})</option>)}
                         </select>
                    </div>
                    <div className="space-y-2 text-center py-4 bg-brand-gold/5 rounded-2xl border border-brand-gold/20">
                        <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] mb-1">Confirmar Transferencia</p>
                        <p className="text-slate-500 text-[9px] uppercase italic">Se marcará como 'En Tránsito' hasta su recepción</p>
                    </div>
                    <button className="w-full py-4 bg-brand-gold text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-brand-gold/20">Autorizar Envío</button>
                </div>
            </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ModalProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, subtitle, icon, children, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-brand-matte border border-brand-border w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(212,175,55,0.1)] flex flex-col"
        >
            <div className="p-8 border-b border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-gold/10 rounded-2xl text-brand-gold border border-brand-gold/20">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-xl font-black italic uppercase text-white">
                           {title} <span className="text-brand-gold">Stock</span>
                        </h3>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{subtitle}</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 text-slate-500 hover:text-white rounded-full bg-white/5 transition-colors"
                >
                    <RefreshCw className="rotate-45" size={20} />
                </button>
            </div>
            {children}
        </motion.div>
    </div>
);
