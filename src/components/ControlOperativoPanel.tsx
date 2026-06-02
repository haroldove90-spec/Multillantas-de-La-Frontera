import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  History, 
  RefreshCw, 
  AlertTriangle, 
  Search, 
  Sliders, 
  Calendar, 
  User, 
  MapPin, 
  ClipboardCheck, 
  Play, 
  Check, 
  QrCode, 
  CornerDownRight, 
  Sparkles,
  ArrowRight,
  Database,
  Lock,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Branch } from '../types';
import { 
  getTires, 
  getAuditLogs, 
  addAuditLog, 
  updateTireStock, 
  savePhysicalCount, 
  getPhysicalCounts, 
  PhysicalCountRecord 
} from '../utils/persistentStorage';

export const ControlOperativoPanel: React.FC<{ currentUserName: string; currentBranch: Branch }> = ({ 
  currentUserName, 
  currentBranch 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'conteo'>('audit');
  
  // Real-time states hooked into local storage helper
  const [tires, setTires] = useState(getTires());
  const [auditLogs, setAuditLogs] = useState(getAuditLogs());
  const [pastCounts, setPastCounts] = useState(getPhysicalCounts());

  // Manual Adjustment states
  const [selectedTireId, setSelectedTireId] = useState('');
  const [selectedAdjBranch, setSelectedAdjBranch] = useState<Branch>(currentBranch);
  const [adjQuantity, setAdjQuantity] = useState<number>(0);
  const [adjReason, setAdjReason] = useState('Auditoría General');
  
  // Conteo Físico Wizard states
  const [isCountingActive, setIsCountingActive] = useState(false);
  const [conteoBranch, setConteoBranch] = useState<Branch>(currentBranch);
  const [countedQuantities, setCountedQuantities] = useState<Record<string, number>>({});
  
  // Deactivated scanner variables (satisfying legacy hidden markup)
  const barcodeInput = "";
  const setBarcodeInput = (val: string) => {};
  const handleBarcodeSubmit = (e: React.FormEvent) => e.preventDefault();
  const handleSimulateBulkScan = () => {};
  const hasScanned = false;
  const recentlyScannedName = "";
  const handleSimulateScan = (tireId: string) => {};
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState<Branch | 'Todas'>('Todas');

  // Load and refresh state dynamically via local storage dispatcher
  useEffect(() => {
    const handleStateUpdate = () => {
      setTires(getTires());
      setAuditLogs(getAuditLogs());
      setPastCounts(getPhysicalCounts());
    };
    window.addEventListener('multillantas_state_update', handleStateUpdate);
    return () => window.removeEventListener('multillantas_state_update', handleStateUpdate);
  }, []);

  // Filter audit logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.userName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchBranch = filterBranch === 'Todas' || log.branch === filterBranch;
      return matchSearch && matchBranch;
    });
  }, [auditLogs, searchTerm, filterBranch]);

  // Traffic Light Classification (Total Stocks and individual branch stocks)
  const semaforoStats = useMemo(() => {
    let sufficient = 0; // > 10
    let regular = 0;    // <= 10 and >= 1
    let empty = 0;      // 0

    tires.forEach(t => {
      const stockVal = t.stock;
      if (stockVal > 10) sufficient++;
      else if (stockVal > 0) regular++;
      else empty++;
    });

    return { sufficient, regular, empty };
  }, [tires]);

  // Handle Manual Stock Adjustment
  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTireId || adjQuantity === 0) return;
    
    const success = updateTireStock(
      selectedTireId,
      selectedAdjBranch,
      adjQuantity,
      currentUserName,
      adjReason
    );

    if (success) {
      // Reset form
      setSelectedTireId('');
      setAdjQuantity(0);
      setAdjReason('Auditoría General');
      // Success alert simulation banner can be displayed or logs updated
    }
  };

  // Start Physical counting
  const handleStartConteo = () => {
    const initialCounts: Record<string, number> = {};
    tires.forEach(t => {
      initialCounts[t.id] = 0; // Start at 0 counted
    });
    setCountedQuantities(initialCounts);
    setIsCountingActive(true);
  };

  // Submit and Conciliate count
  const handleFinalizeConteo = () => {
    // Generate list of compare items
    const comparisonItems = tires.map(t => {
      const theoretical = t.branchStocks[conteoBranch] || 0;
      const physical = countedQuantities[t.id] || 0;
      return {
        tireId: t.id,
        brand: t.brand,
        model: t.model,
        size: t.size,
        theoretical,
        physical,
        discrepancy: physical - theoretical
      };
    });

    // Save Physical Count Record
    savePhysicalCount({
      branch: conteoBranch,
      user: currentUserName,
      items: comparisonItems
    });

    // Log the event
    const missingTotal = comparisonItems.reduce((acc, current) => current.discrepancy < 0 ? acc + Math.abs(current.discrepancy) : acc, 0);
    const surplusTotal = comparisonItems.reduce((acc, current) => current.discrepancy > 0 ? acc + current.discrepancy : acc, 0);
    
    addAuditLog(
      currentUserName,
      `Conteo Físico Realizado`,
      `PhysicalCount`,
      'PC-' + Date.now(),
      conteoBranch,
      `Finalizó auditoría de rack en sucursal ${conteoBranch}. Se contaron físicamente ${comparisonItems.reduce((sum, item) => sum + item.physical, 0)} unidades. Faltantes totales: ${missingTotal}. Sobrantes totales: ${surplusTotal}.`
    );

    setIsCountingActive(false);
  };

  // Fast reconciliation to make theoretical stock match physical stock automatically
  const handleAutoReconcile = (record: PhysicalCountRecord) => {
    record.items.forEach(item => {
      if (item.discrepancy !== 0) {
        updateTireStock(
          item.tireId,
          record.branch,
          item.discrepancy, // adds or subtracts to match physical
          'Auditor Autómata',
          `Ajuste de Conciliación Física de fecha ${new Date(record.date).toLocaleDateString()}`
        );
      }
    });

    // Notify with an overall log
    addAuditLog(
      currentUserName,
      'Ajuste Fiscal Conciliado',
      'InventoryReconciled',
      record.id,
      record.branch,
      `Se aplicó ajuste fiscal automático para igualar inventarios teóricos con el conteo físico de la auditoría ID: ${record.id} en ${record.branch}.`
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Module Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <img src="https://appdesign.appdesignproyectos.com/multillantas.png" alt="Logo" className="h-12 w-auto hidden md:block" />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-red/20 border border-brand-red/30">
                <ShieldCheck size={22} className="text-brand-gold animate-pulse" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white italic uppercase">
                CONTROL <span className="text-brand-red">OPERATIVO & AUDITORÍA</span>
              </h2>
            </div>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-1 border-l-2 border-brand-gold pl-3">
              Monitoreo contra pérdidas, reconciliación física y auditoría continua
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Subtabs */}
        <div className="flex bg-brand-matte border border-brand-border p-1 rounded-2xl shadow-2xl">
          <button 
            onClick={() => setActiveSubTab('audit')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              activeSubTab === 'audit' ? 'bg-brand-red text-white font-bold shadow-lg shadow-brand-red/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History size={14} /> Audit Trail (Bitácora)
          </button>
          <button 
            onClick={() => setActiveSubTab('conteo')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              activeSubTab === 'conteo' ? 'bg-brand-red text-white font-bold shadow-lg shadow-brand-red/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode size={14} /> Conteo Físico Rack
          </button>
        </div>
      </header>

      {/* Semáforo Dashboard Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-brand-matte border border-brand-border rounded-3xl p-6 flex flex-col justify-between group hover:border-brand-red/30 transition-all relative overflow-hidden">
          <div className="flex justify-between items-start">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest leading-none">SEMAFORIZACIÓN INTEGRAL</p>
            <span className="w-2.5 h-2.5 rounded-full bg-brand-red animate-ping absolute top-6 right-6" />
          </div>
          <div className="mt-4">
             <h4 className="text-sm font-bold text-white mb-2">Semáforo de Rack</h4>
             <div className="flex items-center gap-3">
               <span className="flex items-center gap-1 bg-green-950/40 border border-green-500/20 px-2.5 py-1 rounded-full text-green-500 text-[10px] font-black">
                 🟢 {semaforoStats.sufficient} Llantas Ok
               </span>
               <span className="flex items-center gap-1 bg-amber-950/40 border border-amber-500/20 px-2.5 py-1 rounded-full text-amber-500 text-[10px] font-black">
                 🟡 {semaforoStats.regular} Alertas
               </span>
               <span className="flex items-center gap-1 bg-red-950/40 border border-brand-red/20 px-2.5 py-1 rounded-full text-brand-red text-[10px] font-black">
                 🔴 {semaforoStats.empty} Agotado
               </span>
             </div>
          </div>
        </div>

        {/* Semáforo definitions cards */}
        <div className="bg-brand-matte/50 border border-brand-border rounded-3xl p-5 flex items-center gap-4 hover:border-green-500/20 transition-all">
          <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 border border-green-500/20">
            🟢
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Stock Excelente</p>
            <p className="text-lg font-black text-white">Stock &gt; 10</p>
            <p className="text-[9px] text-green-500 font-bold uppercase">Suministro Óptimo</p>
          </div>
        </div>

        <div className="bg-brand-matte/50 border border-brand-border rounded-3xl p-5 flex items-center gap-4 hover:border-amber-500/20 transition-all">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20">
            🟡
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Stock Crítico</p>
            <p className="text-lg font-black text-white">Stock &lt; 5</p>
            <p className="text-[9px] text-amber-500 font-bold uppercase">Requiere Resurtido</p>
          </div>
        </div>

        <div className="bg-brand-matte/50 border border-brand-border rounded-3xl p-5 flex items-center gap-4 hover:border-brand-red/20 transition-all">
          <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-brand-red border border-brand-red/20">
            🔴
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Agotado / Quiebre</p>
            <p className="text-lg font-black text-white">Stock = 0</p>
            <p className="text-[9px] text-brand-red font-bold uppercase">Quiebre Logístico</p>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <AnimatePresence mode='wait'>
        {activeSubTab === 'audit' ? (
          <motion.div 
            key="audit-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Side: Audit Trail List */}
            <div className="lg:col-span-2 bg-brand-matte border border-brand-border rounded-[2.5rem] p-8 shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-black italic uppercase text-white tracking-tight">BITÁCORA SEGURA DE MOVIMIENTOS</h3>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Registros inmutables de auditorías y transferencias</p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text"
                      placeholder="Buscar bitácora..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-brand-dark border border-brand-border rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-brand-red transition-all"
                    />
                  </div>
                  <select
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value as any)}
                    className="bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-xs text-brand-gold font-bold outline-none uppercase"
                  >
                    <option value="Todas">TODAS SUCURSALES</option>
                    <option value="Centro">CENTRO</option>
                    <option value="Norte">NORTE</option>
                    <option value="Frontera">FRONTERA</option>
                  </select>
                </div>
              </div>

              {/* Table list */}
              <div className="overflow-y-auto max-h-[500px] pr-2 custom-scrollbar border border-brand-border/40 rounded-2xl bg-black/40">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-brand-matte border-b border-brand-border px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <tr>
                      <th className="py-3 px-4">Operador y Fecha</th>
                      <th className="py-3 px-4">Acción y Sucursal</th>
                      <th className="py-3 px-4">Detalles Operativos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/20">
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map(log => {
                        const isAlert = log.action.includes('Salida') || log.action.includes('Eliminó') || log.action.includes('Canceló');
                        return (
                          <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-dark border border-brand-border flex items-center justify-center text-brand-gold text-xs font-black">
                                  {log.userName.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-white">{log.userName}</p>
                                  <p className="text-[9px] text-slate-500 tracking-tighter">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                                isAlert ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-gold/10 text-brand-gold'
                              }`}>
                                {log.action}
                              </span>
                              <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-1 font-bold">
                                <MapPin size={10} className="text-slate-500" />
                                {log.branch}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-xs text-slate-300">
                              <p className="line-clamp-2 italic">{log.details}</p>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-slate-600 font-bold uppercase tracking-widest text-[10px] italic">
                          No se encontraron bitácoras de auditoría congruentes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Side: Manual Inventory Stock Adjustment */}
            <div className="bg-brand-matte border border-brand-border rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-brand-border pb-4">
                  <Database className="text-brand-gold" size={20} />
                  <div>
                    <h3 className="font-black italic uppercase text-white text-lg">AJUSTE DE INVENTARIO AUTORIZADO</h3>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest ">Requiere credenciales y firma administrativa</p>
                  </div>
                </div>

                <form onSubmit={handleApplyAdjustment} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sucursal de Destino</label>
                    <select
                      value={selectedAdjBranch}
                      onChange={(e) => setSelectedAdjBranch(e.target.value as Branch)}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-red"
                    >
                      <option value="Centro">Centro</option>
                      <option value="Norte">Norte</option>
                      <option value="Frontera">Frontera</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neumático de Referencia</label>
                    <select
                      value={selectedTireId}
                      onChange={(e) => setSelectedTireId(e.target.value)}
                      required
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-red"
                    >
                      <option value="">Selecciona neumático...</option>
                      {tires.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.brand} {t.model} ({t.size}) - Stock local: {t.branchStocks[selectedAdjBranch] || 0}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cantidad de Cambio</label>
                      <input 
                        type="number"
                        placeholder="Ej. +5 ó -3"
                        value={adjQuantity !== 0 ? adjQuantity : ''}
                        onChange={(e) => setAdjQuantity(Number(e.target.value))}
                        required
                        className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-red"
                      />
                    </div>
                    <div className="space-y-1 flex flex-col justify-end">
                      <span className="text-[8px] text-slate-500 italic pl-1 mb-1">Entrada (+) o Salida (-)</span>
                      <div className="text-xs font-black text-center py-2 px-3 rounded-lg border border-brand-border bg-black/40 text-brand-gold">
                        Nuevo Teórico: {(() => {
                          const t = tires.find(x => x.id === selectedTireId);
                          if (!t) return '0';
                          return Math.max(0, (t.branchStocks[selectedAdjBranch] || 0) + adjQuantity);
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Motivo Justificativo</label>
                    <input 
                      type="text"
                      placeholder="Ej. Ajuste por daño, compra autorizada..."
                      value={adjReason}
                      onChange={(e) => setAdjReason(e.target.value)}
                      required
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-red"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-brand-gold hover:bg-brand-gold/90 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-gold/20 flex items-center justify-center gap-2 mt-4"
                  >
                    <Plus size={16} strokeWidth={3} /> Aplicar Ajuste Continuo
                  </button>
                </form>
              </div>

              {/* Security Advisory */}
              <div className="mt-8 p-4 bg-brand-red/5 border border-brand-red/20 rounded-2xl flex items-start gap-3">
                 <Lock size={20} className="text-brand-red mt-0.5 shrink-0" />
                 <div>
                    <h5 className="text-[10px] font-black text-white uppercase tracking-wider mb-1">PROTOCOLO ANTIFRAUDE ACTIVO</h5>
                    <p className="text-[9px] text-slate-500 italic">Cada ajuste manual recalcula automáticamente los márgenes fiscales y genera un hash de registro asignado a tu sesión ({currentUserName}).</p>
                 </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="conteo-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8 animate-in fade-in"
          >
            {/* Upper count controller */}
            {!isCountingActive ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Conteo Launcher Panel */}
                <div className="bg-brand-matte border border-brand-border rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between">
                     <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <ClipboardCheck className="text-brand-red shrink-0" size={24} />
                          <div>
                            <h3 className="text-xl font-black italic uppercase text-white">CONTEO FÍSICO RACK</h3>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Verificación de discrepancias física vs teórica</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 italic leading-relaxed">
                          Este modo permite a los operarios realizar la planilla de conteo físico de forma manual directamente en el rack de almacén. Al completar, el sistema genera alertas de discrepancias, faltantes y conciliaciones logísticas.
                        </p>
                        
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Seleccionar Rack de Sucursal</label>
                             <select
                               value={conteoBranch}
                               onChange={(e) => setConteoBranch(e.target.value as Branch)}
                               className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none"
                             >
                               <option value="Centro">Centro</option>
                               <option value="Norte">Norte</option>
                               <option value="Frontera">Frontera</option>
                             </select>
                        </div>
                     </div>
                     <button
                       onClick={handleStartConteo}
                       className="w-full py-4 bg-brand-red hover:bg-brand-red/90 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-red/30 flex items-center justify-center gap-2 mt-8"
                     >
                       <Play size={14} fill="white" /> Iniciar Planilla de Conteo
                     </button>
                </div>

                {/* Historical counts list */}
                <div className="lg:col-span-2 bg-brand-matte border border-brand-border rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                  <div>
                    <h3 className="text-xl font-black italic uppercase text-white">REPORTE DE AUDITORÍAS REALIZADAS</h3>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Resultados de conciliaciones anteriores</p>
                  </div>

                  <div className="overflow-y-auto max-h-[300px] pr-2 custom-scrollbar space-y-4">
                    {pastCounts.length > 0 ? (
                      pastCounts.map(pc => {
                        const totalDiscrepancy = pc.items.reduce((sum, item) => sum + item.discrepancy, 0);
                        const absoluteFaltantes = pc.items.reduce((sum, item) => item.discrepancy < 0 ? sum + Math.abs(item.discrepancy) : sum, 0);
                        return (
                          <div key={pc.id} className="p-5 bg-brand-dark/40 border border-brand-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                               <div className="flex items-center gap-3">
                                 <h4 className="font-bold text-white text-sm">{pc.id}</h4>
                                 <span className="text-[9px] font-black px-2 py-0.5 rounded bg-brand-gold text-black uppercase">{pc.branch}</span>
                               </div>
                               <p className="text-[9px] text-slate-500 uppercase mt-1">Auditado por: <span className="text-slate-300 font-bold">{pc.user}</span> • {new Date(pc.date).toLocaleString()}</p>
                            </div>

                            <div className="flex items-center gap-4">
                               <div className="text-right">
                                  <p className="text-[8px] font-black text-slate-500 uppercase">Estado Auditoría</p>
                                  {absoluteFaltantes > 0 ? (
                                    <p className="text-xs font-black text-brand-red uppercase">🔴 Faltan -{absoluteFaltantes} Unidades</p>
                                  ) : (
                                    <p className="text-xs font-black text-green-500 uppercase">🟢 Rack Cuadrado</p>
                                  )}
                               </div>

                               <button 
                                 onClick={() => handleAutoReconcile(pc)}
                                 className="px-4 py-2 bg-brand-matte border border-brand-border hover:border-brand-gold/50 text-[10px] font-black uppercase text-brand-gold rounded-xl transition-all"
                               >
                                 Conciliar Stock
                               </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center text-slate-600 font-bold uppercase tracking-widest text-[10px] italic">
                        No hay auditorías físicas históricas registradas
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ACTIVE COUNTING TERMINAL SCREEN */
              <div className="grid grid-cols-1 gap-8">
                 {/* Left Side: Scanner Device screen simulator */}
                 <div className="hidden bg-black border-2 border-brand-red rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(255,0,0,0.15)] flex flex-col justify-between">
                     <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-brand-border/40 pb-4">
                           <div className="flex items-center gap-2">
                             <span className="w-2.5 h-2.5 rounded-full bg-brand-red animate-ping" />
                             <span className="text-xs tracking-widest font-mono text-brand-red font-bold">DEVICE: TERMINAL_M_04</span>
                           </div>
                           <span className="text-[10px] font-bold text-slate-500 bg-brand-matte px-2.5 py-1 rounded">Rack: {conteoBranch}</span>
                        </div>

                        {/* Scanner Viewport */}
                        <div className="aspect-video bg-neutral-950 border border-brand-border rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                           {/* Simulated Red Scanning laser line */}
                           <div className="absolute w-full h-[2px] bg-brand-red shadow-[0_0_10px_rgba(255,0,0,1)] top-0 left-0 animate-scan pointer-events-none" />
                           <QrCode size={40} className="text-brand-red opacity-30 mt-2" />
                           <p className="text-[9px] font-mono text-slate-500 mt-2 tracking-widest uppercase">Listo para simular lectura</p>
                        </div>

                        {/* Barcode typed scanner form */}
                        <form onSubmit={handleBarcodeSubmit} className="space-y-2">
                           <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Ingresar Código de Barra / Neumático</label>
                           <div className="flex gap-2">
                             <input 
                               type="text"
                               placeholder="Escribe marca, modelo o medida..."
                               value={barcodeInput}
                               onChange={(e) => setBarcodeInput(e.target.value)}
                               className="flex-1 bg-brand-matte border border-brand-border rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-700 outline-none focus:border-brand-red transition-all"
                             />
                             <button 
                               type="submit"
                               className="px-4 py-2.5 bg-brand-red hover:bg-brand-red/90 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-brand-red/10 animate-pulse"
                             >
                               LEER
                             </button>
                           </div>
                        </form>

                        {/* Simulated Bulk Scan trigger */}
                        <div className="space-y-2">
                           <button
                             type="button"
                             onClick={handleSimulateBulkScan}
                             className="w-full py-2.5 bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 text-brand-gold text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
                           >
                             ⚡ Escaneo Automático de Rack
                           </button>
                        </div>

                        {/* Instruction manual for testing client */}
                        <div className="p-4 bg-brand-matte border border-brand-border rounded-2xl space-y-2 text-slate-400">
                          <p className="text-[9px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                            <span className="text-brand-gold">📖</span> EXPERIENCIA DE ESCANEO DE SUCURSAL:
                          </p>
                          <ul className="text-[8px] list-disc list-inside space-y-1 text-slate-600">
                            <li><strong className="text-slate-350">Pila Virtual:</strong> Escribe marcas (ej. "Michelin", "Goodyear", "Pirelli") y presiona "LEER".</li>
                            <li><strong className="text-slate-350">Gatillo Rápido:</strong> Haz clic en <strong className="text-brand-red">+1 Escanear</strong> para simular tiro de pistola láser.</li>
                            <li><strong className="text-slate-350">Sónico:</strong> Emite un sonido agudo real para confirmar el registro.</li>
                            <li><strong className="text-slate-350">Masivo:</strong> Carga conteos instantáneos con variaciones aleatorias para pruebas rápidas.</li>
                          </ul>
                        </div>

                        {/* Scan Alert Feed */}
                        <AnimatePresence>
                          {hasScanned && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2.5 text-green-500 font-black"
                            >
                              <Check size={14} strokeWidth={3} />
                              <div className="flex-1 text-[10px] uppercase font-mono">
                                <p className="leading-none text-white tracking-widest font-black">BEEP! LEÍDO OK</p>
                                <p className="text-[9px] text-green-400 mt-0.5">{recentlyScannedName}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Scanning Quick Click simulator */}
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Simular Escaneo de Rack</label>
                           <div className="grid grid-cols-1 gap-2">
                             {tires.map(t => (
                               <button
                                 key={t.id}
                                 type="button"
                                 onClick={() => handleSimulateScan(t.id)}
                                 className="w-full text-left py-2 px-3 bg-brand-matte border border-brand-border hover:border-brand-red/50 rounded-xl flex items-center justify-between text-xs text-slate-300 hover:text-white transition-all group"
                               >
                                 <span className="truncate max-w-[150px]">{t.brand} {t.model}</span>
                                 <span className="text-[10px] font-bold text-brand-red bg-brand-red/10 px-2 py-0.5 rounded-md min-w-[30px] text-center group-hover:bg-brand-red group-hover:text-white transition-all">
                                   +1 Escanear
                                 </span>
                               </button>
                             ))}
                           </div>
                        </div>
                     </div>

                     <div className="space-y-3 mt-8">
                       <button
                         onClick={handleFinalizeConteo}
                         className="w-full py-4 bg-brand-red text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                       >
                         <Check size={16} strokeWidth={3} /> Finalizar y Conciliar
                       </button>
                       <button
                         onClick={() => {
                           setIsCountingActive(false);
                         }}
                         className="w-full py-3 bg-transparent hover:bg-white/5 border border-brand-border text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                       >
                         Cancelar Cuenta
                       </button>
                     </div>
                 </div>

                 {/* Right Side: Counting Results Table in Real Time */}
                 <div className="lg:col-span-2 bg-brand-matte border border-brand-border rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                     <div>
                       <h3 className="text-xl font-black italic uppercase text-white">PLANILLA DE CONTEO FÍSICO</h3>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Conteo físico manual de neumáticos en sucursal <span className="text-brand-gold font-bold">{conteoBranch}</span></p>
                     </div>

                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-brand-border/40 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              <th className="pb-3">Detalle Neumático</th>
                              <th className="pb-3 text-center">Teórico Local</th>
                              <th className="pb-3 text-center">Contado Físico</th>
                              <th className="pb-3 text-right">Faltante/Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border/20">
                            {tires.map(t => {
                              const theoretical = t.branchStocks[conteoBranch] || 0;
                              const physical = countedQuantities[t.id] || 0;
                              const diff = physical - theoretical;

                              return (
                                <tr key={t.id} className="hover:bg-white/[0.01] transition-colors">
                                  <td className="py-4">
                                     <p className="text-xs font-bold text-white leading-tight">{t.brand} {t.model}</p>
                                     <p className="text-[9px] text-slate-500">{t.size}</p>
                                  </td>
                                  <td className="py-4 text-center font-mono font-bold text-slate-400">
                                     {theoretical}
                                  </td>
                                  <td className="py-4 text-center">
                                     <div className="inline-flex items-center gap-2 bg-black/40 border border-brand-border px-3 py-1.5 rounded-lg">
                                       <button 
                                         onClick={() => {
                                           setCountedQuantities(prev => ({
                                             ...prev,
                                             [t.id]: Math.max(0, (prev[t.id] || 0) - 1)
                                           }));
                                         }}
                                         className="w-5 h-5 flex items-center justify-center bg-brand-border rounded text-slate-300 hover:text-white text-xs font-bold"
                                       >
                                         -
                                       </button>
                                       <span className="font-mono text-white text-sm font-black min-w-[20px] text-center">{physical}</span>
                                       <button 
                                         onClick={() => {
                                           setCountedQuantities(prev => ({
                                             ...prev,
                                             [t.id]: (prev[t.id] || 0) + 1
                                           }));
                                         }}
                                         className="w-5 h-5 flex items-center justify-center bg-brand-border rounded text-slate-300 hover:text-white text-xs font-bold"
                                       >
                                         +
                                       </button>
                                     </div>
                                  </td>
                                  <td className="py-4 text-right">
                                     {diff === 0 ? (
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-green-500/10 text-green-500 uppercase tracking-wider">Coincide</span>
                                     ) : diff > 0 ? (
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 uppercase tracking-wider">Sobrante (+{diff})</span>
                                     ) : (
                                        /* HIGHLIGHT RED: physical < theoretical */
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-brand-red/15 text-brand-red uppercase tracking-wider border border-brand-red/30">
                                          🔴 Faltante ({diff})
                                        </span>
                                     )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                     </div>

                     <div className="p-4 bg-brand-gold/5 border border-brand-gold/20 rounded-2xl flex items-center gap-3">
                        <Sparkles size={20} className="text-brand-gold animate-bounce" />
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">AUDITORÍA ACTIVA: Confirma los montos de neumáticos usando los selectores manuales antes de conciliar con la base teórica de la sucursal.</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-brand-border/40">
                        <button
                          onClick={handleFinalizeConteo}
                          type="button"
                          className="flex-1 py-4 bg-brand-red text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Check size={16} strokeWidth={3} /> Finalizar y Conciliar
                        </button>
                        <button
                          onClick={() => {
                            setIsCountingActive(false);
                          }}
                          type="button"
                          className="px-6 py-4 bg-transparent hover:bg-white/5 border border-brand-border text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                        >
                          Cancelar Cuenta
                        </button>
                     </div>
                 </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
