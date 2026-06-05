import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2, 
  User, 
  Calendar, 
  CheckCircle2, 
  Search, 
  DollarSign, 
  Building2, 
  FileText,
  Percent,
  Clock,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AccountReceivable, AccountPayable, Branch } from '../types';
import { getCXC, saveCXC, getCXP, saveCXP, addAuditLog } from '../utils/persistentStorage';
import { MOCK_CLIENTES } from '../constants';

interface CobranzaPanelProps {
  userRole: string;
  userBranch: Branch;
}

function MsiCalculator() {
  const [monto, setMonto] = useState<number>(12000);
  const [plazo, setPlazo] = useState<number>(6);
  const pagoMensual = plazo > 0 ? (monto / plazo) : 0;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Monto de Venta ($ MXN)</label>
          <input 
            type="number"
            value={monto}
            onChange={(e) => setMonto(Math.max(0, Number(e.target.value)))}
            className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-gold transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Plazo Dividido (Meses)</label>
          <div className="flex bg-brand-dark border border-brand-border p-1 rounded-xl">
            {[3, 6, 9, 12].map(p => (
              <button
                key={p}
                onClick={() => setPlazo(p)}
                type="button"
                className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                  plazo === p ? 'bg-brand-gold text-black' : 'text-slate-500 hover:text-white'
                }`}
              >
                {p} MSI
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 bg-brand-dark rounded-3xl border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Monto de Pago Mensual</p>
          <p className="text-3xl font-black text-brand-gold italic">${pagoMensual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN</p>
        </div>
        <div className="text-left shrink-0">
          <p className="text-[8px] font-mono text-slate-500 uppercase">Sin intereses de financiamiento</p>
          <p className="text-xs text-green-500 font-bold uppercase mt-1">🔴 Cargo Directo Terminal SAT CFDI 4.0</p>
        </div>
      </div>
    </div>
  );
}

export const CobranzaPanel: React.FC<CobranzaPanelProps> = ({ userRole, userBranch }) => {
  const [activeTab, setActiveTab] = useState<'cxc' | 'cxp' | 'msi'>('cxc');
  const [cxcList, setCxcList] = useState<AccountReceivable[]>([]);
  const [cxpList, setCxpList] = useState<AccountPayable[]>([]);
  const [selectedCxc, setSelectedCxc] = useState<AccountReceivable | null>(null);
  const [selectedCxp, setSelectedCxp] = useState<AccountPayable | null>(null);

  // Modals state
  const [isNewCxcModalOpen, setIsNewCxcModalOpen] = useState(false);
  const [isNewCxpModalOpen, setIsNewCxpModalOpen] = useState(false);

  // New Credit (CXC) Form State
  const [cxcForm, setCxcForm] = useState({
    clienteId: '',
    noteId: '',
    total: 0,
    dueDate: '',
  });
  const [clientSearch, setClientSearch] = useState('');
  const [showClientResults, setShowClientResults] = useState(false);

  // New Payable (CXP) Form State
  const [cxpForm, setCxpForm] = useState({
    supplier: '',
    amount: 0,
    dueDate: '',
    description: '',
  });

  // Pay/Abonar Inputs
  const [cxcAbonoAmount, setCxcAbonoAmount] = useState<string>('');
  const [cxpAbonoAmount, setCxpAbonoAmount] = useState<string>('');

  // Load and refresh lists from localStorage
  useEffect(() => {
    setCxcList(getCXC());
    setCxpList(getCXP());

    const handleStateUpdate = () => {
      setCxcList(getCXC());
      setCxpList(getCXP());
    };

    window.addEventListener('multillantas_state_update', handleStateUpdate);
    return () => window.removeEventListener('multillantas_state_update', handleStateUpdate);
  }, []);

  // Update selected credit profile on list state updates
  useEffect(() => {
    if (selectedCxc) {
      const current = cxcList.find(c => c.id === selectedCxc.id);
      setSelectedCxc(current || null);
    }
  }, [cxcList]);

  useEffect(() => {
    if (selectedCxp) {
      const current = cxpList.find(c => c.id === selectedCxp.id);
      setSelectedCxp(current || null);
    }
  }, [cxpList]);

  // Client Selection helper for New Credit Creation
  const selectedCliente = useMemo(() => {
    return MOCK_CLIENTES.find(c => c.id === cxcForm.clienteId);
  }, [cxcForm.clienteId]);

  // Handlers for CXC (Customer Credits)
  const handleCreateCxc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cxcForm.clienteId || cxcForm.total <= 0 || !cxcForm.dueDate) return;

    const chosenClient = MOCK_CLIENTES.find(c => c.id === cxcForm.clienteId);
    if (!chosenClient) return;

    const newCredit: AccountReceivable = {
      id: 'CXC' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      noteId: cxcForm.noteId || 'S/N-Ref',
      clienteId: cxcForm.clienteId,
      clienteNombre: chosenClient.nombre,
      total: Number(cxcForm.total),
      saldo: Number(cxcForm.total),
      dueDate: new Date(cxcForm.dueDate).toISOString(),
      status: 'Al Corriente'
    };

    const updated = [...cxcList, newCredit];
    saveCXC(updated);

    // Audit Log
    addAuditLog(
      userRole,
      'Registro Crédito',
      'AccountReceivable',
      newCredit.id,
      userBranch,
      `Concedido un nuevo crédito a ${chosenClient.nombre} por un monto de $${newCredit.total.toLocaleString()} MXN con vencimiento al ${new Date(newCredit.dueDate).toLocaleDateString()}.`
    );

    // Reset Form
    setCxcForm({ clienteId: '', noteId: '', total: 0, dueDate: '' });
    setClientSearch('');
    setIsNewCxcModalOpen(false);
  };

  const handleCxcAbono = () => {
    if (!selectedCxc) return;
    const payment = Number(cxcAbonoAmount);
    if (isNaN(payment) || payment <= 0 || payment > selectedCxc.saldo) return;

    const updated = cxcList.map(cxc => {
      if (cxc.id === selectedCxc.id) {
        const remaining = Number((cxc.saldo - payment).toFixed(2));
        return {
          ...cxc,
          saldo: remaining,
          lastPaymentDate: new Date().toISOString(),
          status: remaining === 0 ? 'Al Corriente' : cxc.status // Reset status if paid in full
        };
      }
      return cxc;
    });

    saveCXC(updated);

    // Audit Log
    addAuditLog(
      userRole,
      'Abono Crédito',
      'AccountReceivable',
      selectedCxc.id,
      userBranch,
      `Abono registrado a la cuenta de ${selectedCxc.clienteNombre} por un monto de $${payment.toLocaleString()} MXN. Saldo anterior: $${selectedCxc.saldo.toLocaleString()} MXN, Saldo restante: $${(selectedCxc.saldo - payment).toLocaleString()} MXN.`
    );

    setCxcAbonoAmount('');
  };

  // Handlers for CXP (Supplier Payments / Accounts Payable)
  const handleCreateCxp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cxpForm.supplier || cxpForm.amount <= 0 || !cxpForm.dueDate) return;

    const newPayable: AccountPayable = {
      id: 'CXP' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      supplier: cxpForm.supplier,
      amount: Number(cxpForm.amount),
      dueDate: new Date(cxpForm.dueDate).toISOString(),
      description: cxpForm.description || 'Suministros varios',
      status: 'Pendiente'
    };

    const updated = [...cxpList, newPayable];
    saveCXP(updated);

    // Audit Log
    addAuditLog(
      userRole,
      'Registro Cuenta por Pagar',
      'AccountPayable',
      newPayable.id,
      userBranch,
      `Nueva cuenta por pagar registrada para el proveedor ${newPayable.supplier} por $${newPayable.amount.toLocaleString()} MXN.`
    );

    setCxpForm({ supplier: '', amount: 0, dueDate: '', description: '' });
    setIsNewCxpModalOpen(false);
  };

  const handleCxpAbono = () => {
    if (!selectedCxp) return;
    const payment = Number(cxpAbonoAmount);
    if (isNaN(payment) || payment <= 0 || payment > selectedCxp.amount) return;

    const updated = cxpList.map(cxp => {
      if (cxp.id === selectedCxp.id) {
        const remaining = Number((cxp.amount - payment).toFixed(2));
        return {
          ...cxp,
          amount: remaining,
          status: remaining === 0 ? 'Pagado' : cxp.status
        };
      }
      return cxp;
    });

    saveCXP(updated);

    // Audit Log
    addAuditLog(
      userRole,
      'Abono Proveedor',
      'AccountPayable',
      selectedCxp.id,
      userBranch,
      `Abono registrado a la cuenta del proveedor ${selectedCxp.supplier} por un valor de $${payment.toLocaleString()} MXN.`
    );

    setCxpAbonoAmount('');
  };

  const handleCxpLiquidar = () => {
    if (!selectedCxp) return;
    const liquidationAmount = selectedCxp.amount;

    const updated = cxpList.map(cxp => {
      if (cxp.id === selectedCxp.id) {
        return {
          ...cxp,
          amount: 0,
          status: 'Pagado' as const
        };
      }
      return cxp;
    });

    saveCXP(updated);

    // Audit Log
    addAuditLog(
      userRole,
      'Liquidación Proveedor',
      'AccountPayable',
      selectedCxp.id,
      userBranch,
      `Liquidación total realizada a la cuenta del proveedor ${selectedCxp.supplier} por un total de $${liquidationAmount.toLocaleString()} MXN. Estado cambiado a Pagado.`
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Search & Navigation Bar */}
      <div className="bg-brand-matte border border-brand-border rounded-[2.5rem] p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl">
        <div className="flex bg-brand-dark border border-brand-border/60 p-1 rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => { setActiveTab('cxc'); setSelectedCxc(null); }}
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'cxc' ? 'bg-brand-red text-white' : 'text-slate-500 hover:text-white'}`}
          >
            <ArrowUpRight size={16} /> Créditos Clientes (CXC)
          </button>
          <button 
            onClick={() => { setActiveTab('cxp'); setSelectedCxp(null); }}
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'cxp' ? 'bg-brand-red text-white' : 'text-slate-500 hover:text-white'}`}
          >
            <ArrowDownRight size={16} /> Proveedores (CXP)
          </button>
          <button 
            onClick={() => { setActiveTab('msi'); setSelectedCxc(null); setSelectedCxp(null); }}
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'msi' ? 'bg-brand-red text-white' : 'text-slate-500 hover:text-white'}`}
          >
            <Percent size={16} /> Promociones MSI
          </button>
        </div>

        <div>
          {activeTab === 'cxc' && (
            <button 
              onClick={() => setIsNewCxcModalOpen(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-red hover:bg-brand-red/90 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-red/20 active:scale-95 transition-all"
            >
              <PlusCircle size={16} strokeWidth={3} /> Registrar Crédito Clientes
            </button>
          )}
          {activeTab === 'cxp' && (
            <button 
              onClick={() => setIsNewCxpModalOpen(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-red hover:bg-brand-red/90 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-red/20 active:scale-95 transition-all"
            >
              <PlusCircle size={16} strokeWidth={3} /> Crear Cuenta Proveedor
            </button>
          )}
        </div>
      </div>

      {activeTab === 'msi' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-brand-matte border border-brand-border rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <h3 className="text-lg font-black italic uppercase text-white">💰 Promociones Bancarias MSI</h3>
            <p className="text-xs text-slate-400">Convenios activos para diferir compras con Tarjeta de Crédito.</p>
            <div className="space-y-3">
              {[
                { bank: "BBVA México", msi: "3, 6, 9 Meses", rate: "Sin comisión", color: "text-blue-400 hover:border-blue-400/30" },
                { bank: "CitiBanamex", msi: "3, 6, 12 Meses", rate: "Sin comisión", color: "text-blue-500 hover:border-blue-500/30" },
                { bank: "Banorte / Santander", msi: "3, 6 Meses", rate: "Fijo 2.5%", color: "text-red-400 hover:border-red-400/30" },
                { bank: "American Express", msi: "6, 12 Meses", rate: "Fijo 4.8%", color: "text-cyan-400 hover:border-cyan-400/30" }
              ].map((promo, idx) => (
                <div key={idx} className={`p-4 bg-brand-dark/40 border border-brand-border/60 rounded-2xl flex items-center justify-between gap-4 transition-all hover:-translate-y-0.5 ${promo.color}`}>
                  <div>
                    <p className="text-sm font-black text-white">{promo.bank}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mt-1 font-mono">{promo.rate}</p>
                  </div>
                  <span className="text-xs font-black text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-3 py-1 rounded-lg font-mono">
                    {promo.msi}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand-matte border border-brand-border rounded-[2.5rem] p-8 shadow-2xl space-y-6 lg:col-span-2">
            <h3 className="text-lg font-black italic uppercase text-white">🧮 Simulador de Liquidación MSI</h3>
            <p className="text-xs text-slate-400">Calcula los pagos mensuales de forma instantánea según la sucursal y la promoción seleccionada.</p>
            <MsiCalculator />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left column: List of Credits / Payables */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'cxc' ? (
            <div className="bg-[#050505] border border-brand-border/60 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
              <div>
                <h3 className="text-xl font-black italic uppercase text-white tracking-widest flex items-center gap-3">
                  <CreditCard className="text-brand-gold" size={20} />
                  Perfil de Créditos Concedidos
                </h3>
                <p className="text-slate-500 text-[10px] uppercase font-bold mt-1 font-mono">Control y cobro de cartera de clientes</p>
              </div>

              <div className="space-y-4">
                {cxcList.map(cxc => (
                  <button 
                    key={cxc.id} 
                    onClick={() => setSelectedCxc(cxc)}
                    className={`w-full text-left p-6 rounded-3xl border transition-all flex items-center justify-between group ${
                      selectedCxc?.id === cxc.id 
                        ? 'bg-brand-red/10 border-brand-red' 
                        : 'bg-brand-matte border-brand-border/60 hover:border-brand-gold/40'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl flex items-center justify-center ${selectedCxc?.id === cxc.id ? 'bg-brand-red/20 text-brand-red' : 'bg-brand-dark text-slate-500'}`}>
                        <User size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider group-hover:text-brand-gold transition-colors">{cxc.clienteNombre}</h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">Folio Operativo: <span className="font-extrabold text-slate-400">{cxc.noteId}</span></p>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <p className="text-[11px] font-black uppercase text-brand-gold font-mono">Saldo: ${cxc.saldo.toLocaleString()} MXN</p>
                      <p className="text-[9px] text-slate-500 font-mono">Límite Total: ${cxc.total.toLocaleString()} MXN</p>
                    </div>
                  </button>
                ))}

                {cxcList.length === 0 && (
                  <div className="py-12 border border-dashed border-brand-border/40 rounded-3xl text-center text-slate-600 space-y-3">
                    <Clock size={36} className="mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No hay créditos registrados.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#050505] border border-brand-border/60 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
              <div>
                <h3 className="text-xl font-black italic uppercase text-white tracking-widest flex items-center gap-3">
                  <Building2 className="text-brand-red" size={20} />
                  Cartera de Proveedores
                </h3>
                <p className="text-slate-500 text-[10px] uppercase font-bold mt-1 font-mono">Cuentas por pagar con proveedores</p>
              </div>

              <div className="space-y-4">
                {cxpList.map(cxp => (
                  <button 
                    key={cxp.id} 
                    onClick={() => setSelectedCxp(cxp)}
                    className={`w-full text-left p-6 rounded-3xl border transition-all flex items-center justify-between group ${
                      selectedCxp?.id === cxp.id 
                        ? 'bg-brand-red/10 border-brand-red' 
                        : 'bg-brand-matte border-brand-border/60 hover:border-brand-red/40'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl flex items-center justify-center ${selectedCxp?.id === cxp.id ? 'bg-brand-red/20 text-brand-red' : 'bg-brand-dark text-slate-500'}`}>
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider group-hover:text-brand-red transition-colors">{cxp.supplier}</h4>
                        <p className="text-[10px] text-slate-500 max-w-sm truncate mt-1">{cxp.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <p className="text-[11px] font-black uppercase text-brand-red font-mono">${cxp.amount.toLocaleString()} MXN</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${cxp.status === 'Pagado' ? 'bg-green-500/10 text-green-400' : cxp.status === 'Vencido' ? 'bg-brand-red/10 text-brand-red animate-pulse' : 'bg-brand-gold/10 text-brand-gold'}`}>{cxp.status}</span>
                    </div>
                  </button>
                ))}

                {cxpList.length === 0 && (
                  <div className="py-12 border border-dashed border-brand-border/40 rounded-3xl text-center text-slate-600 space-y-3">
                    <Clock size={36} className="mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No hay cuentas por pagar registradas.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Selected Profile View & Payments/Abonos */}
        <div className="space-y-6">
          {activeTab === 'cxc' ? (
            selectedCxc ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-brand-matte border border-brand-border/60 rounded-[2.5rem] p-8 shadow-2xl space-y-6"
              >
                <div>
                  <span className="text-[8px] font-black text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-2 py-1 rounded-xl uppercase tracking-widest">Perfil de Crédito Cliente</span>
                  <h3 className="text-2xl font-black italic uppercase text-white mt-4">{selectedCxc.clienteNombre}</h3>
                  <p className="text-[10px] font-mono text-slate-500">ID Crédito: {selectedCxc.id}</p>
                </div>

                <div className="bg-brand-dark/40 border border-brand-border/40 rounded-2xl p-4 divide-y divide-brand-border/20 space-y-3 text-xs">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">Saldo outstanding</span>
                    <span className="font-extrabold text-brand-gold text-sm">${selectedCxc.saldo.toLocaleString()} MXN</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">Financiamiento Concedido</span>
                    <span className="font-bold text-white">${selectedCxc.total.toLocaleString()} MXN</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">Folio Relacionado</span>
                    <span className="font-mono text-white">{selectedCxc.noteId}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">Siguiente Vencimiento</span>
                    <span className="font-bold text-brand-red flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(selectedCxc.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedCxc.lastPaymentDate && (
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">Último Abono Recibido</span>
                      <span className="text-slate-400">{new Date(selectedCxc.lastPaymentDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* (5) Choose payment amount / abonar */}
                <div className="space-y-4 pt-4 border-t border-brand-border/30">
                  <h4 className="text-xs font-black uppercase text-white tracking-widest">Registrar Abono Parcial</h4>
                  <p className="text-[10px] text-slate-500">Introduzca un valor numérico para abonar saldo al crédito.</p>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="number"
                        placeholder="Monto"
                        value={cxcAbonoAmount}
                        onChange={(e) => setCxcAbonoAmount(e.target.value)}
                        className="w-full bg-brand-dark border border-brand-border rounded-xl pl-9 pr-3 py-3 text-xs text-white outline-none focus:border-brand-gold transition-all"
                      />
                    </div>
                    <button 
                      onClick={handleCxcAbono}
                      className="px-6 py-3 bg-brand-gold text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Abonar
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-brand-matte border border-brand-border/60 rounded-[2.5rem] p-8 text-center py-16 text-slate-600 space-y-3">
                <User size={36} className="mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest">Seleccione un cliente para ver su perfil de crédito y abonar.</p>
              </div>
            )
          ) : (
            selectedCxp ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-brand-matte border border-brand-border/60 rounded-[2.5rem] p-8 shadow-2xl space-y-6"
              >
                <div>
                  <span className="text-[8px] font-black text-brand-red bg-brand-red/10 border border-brand-red/20 px-2 py-1 rounded-xl uppercase tracking-widest">Cuenta Proveedor CXP</span>
                  <h3 className="text-2xl font-black italic uppercase text-white mt-4">{selectedCxp.supplier}</h3>
                  <p className="text-[10px] font-mono text-slate-500">ID Payable: {selectedCxp.id}</p>
                </div>

                <div className="bg-brand-dark/40 border border-brand-border/40 rounded-2xl p-4 divide-y divide-brand-border/20 space-y-3 text-xs">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">Saldo Pendiente</span>
                    <span className="font-extrabold text-brand-red text-sm">${selectedCxp.amount.toLocaleString()} MXN</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">Fecha Compromiso</span>
                    <span className="font-bold text-white flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(selectedCxp.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">Descripción</span>
                    <span className="text-slate-400 truncate max-w-[150px]">{selectedCxp.description}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">Estado</span>
                    <span className={`font-black uppercase text-[10px] ${selectedCxp.status === 'Pagado' ? 'text-green-400' : 'text-brand-gold'}`}>{selectedCxp.status}</span>
                  </div>
                </div>

                {/* (6) Choose payment amount / abonar to supplier or liquidate */}
                <div className="space-y-4 pt-4 border-t border-brand-border/30">
                  <h4 className="text-xs font-black uppercase text-white tracking-widest">Registrar Abono Proveedor</h4>
                  <p className="text-[10px] text-slate-500">Introduzca un abono parcial o liquide el total de la cuenta.</p>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="number"
                        placeholder="Monto"
                        value={cxpAbonoAmount}
                        onChange={(e) => setCxpAbonoAmount(e.target.value)}
                        className="w-full bg-brand-dark border border-brand-border rounded-xl pl-9 pr-3 py-3 text-xs text-white outline-none focus:border-brand-red transition-all"
                      />
                    </div>
                    <button 
                      onClick={handleCxpAbono}
                      className="px-6 py-3 bg-brand-red text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-red/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Abonar
                    </button>
                  </div>

                  <button 
                    onClick={handleCxpLiquidar}
                    disabled={selectedCxp.amount === 0}
                    className="w-full py-3 border border-brand-red/30 hover:bg-brand-red/10 disabled:opacity-30 disabled:hover:bg-transparent text-brand-red rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Liquidar Cuenta Completa ($ {selectedCxp.amount.toLocaleString()} MXN)
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-brand-matte border border-brand-border/60 rounded-[2.5rem] p-8 text-center py-16 text-slate-600 space-y-3">
                <Building2 size={36} className="mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest">Seleccione una cuenta por pagar para ver detalles o abonar o liquidar.</p>
              </div>
            )
          )}
        </div>

      </div>
      )}

      {/* MODAL 1: New Credit (CXC) Form */}
      <AnimatePresence>
        {isNewCxcModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-matte border border-brand-border w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col p-8"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-border/40">
                <h3 className="text-xl font-black italic uppercase text-white tracking-wider">
                  Registrar <span className="text-brand-gold">Nuevo Crédito (CXC)</span>
                </h3>
                <button 
                  onClick={() => setIsNewCxcModalOpen(false)} 
                  className="p-2 text-slate-500 hover:text-white rounded-full bg-white/5 text-xs font-black"
                >
                  X
                </button>
              </div>

              <form onSubmit={handleCreateCxc} className="space-y-6">
                
                {/* Search Client */}
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Buscar y Seleccionar Cliente</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="text"
                      placeholder="Nombre del cliente..."
                      value={clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setShowClientResults(true);
                      }}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl pl-12 pr-4 py-3 text-xs text-white outline-none focus:border-brand-gold transition-all"
                    />
                  </div>

                  {showClientResults && clientSearch && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#050505] border border-brand-border rounded-2xl shadow-2xl z-20 max-h-48 overflow-y-auto custom-scrollbar py-2">
                      {MOCK_CLIENTES.filter(c => c.nombre.toLowerCase().includes(clientSearch.toLowerCase())).map(c => (
                        <button 
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setCxcForm({ ...cxcForm, clienteId: c.id });
                            setClientSearch(c.nombre);
                            setShowClientResults(false);
                          }}
                          className="w-full px-6 py-3 text-left hover:bg-white/5 flex items-center justify-between group"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-200 group-hover:text-brand-gold transition-colors">{c.nombre}</p>
                            <p className="text-[9px] text-slate-500 font-mono">{c.placa_vehiculo}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedCliente && (
                    <div className="mt-2 p-3 bg-brand-gold/5 border border-brand-gold/20 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-brand-gold" />
                        <span className="text-xs text-white font-bold">{selectedCliente.nombre}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">Vehículo: {selectedCliente.placa_vehiculo}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Folio o Referencia</label>
                    <input 
                      type="text"
                      placeholder="Ej. MF-1002, T-899"
                      value={cxcForm.noteId}
                      onChange={(e) => setCxcForm({ ...cxcForm, noteId: e.target.value })}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-gold transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Importe del Crédito ($)</label>
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={cxcForm.total || ''}
                      onChange={(e) => setCxcForm({ ...cxcForm, total: Number(e.target.value) })}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-gold transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Fecha de Vencimiento de Pago</label>
                  <input 
                    type="date"
                    value={cxcForm.dueDate}
                    onChange={(e) => setCxcForm({ ...cxcForm, dueDate: e.target.value })}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-gold transition-all"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsNewCxcModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={!cxcForm.clienteId || cxcForm.total <= 0 || !cxcForm.dueDate}
                    className="flex-1 py-3 bg-brand-gold text-black disabled:opacity-30 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-gold/10"
                  >
                    Registrar Crédito
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: New Payable (CXP) Form */}
      <AnimatePresence>
        {isNewCxpModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-matte border border-brand-border w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col p-8"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-border/40">
                <h3 className="text-xl font-black italic uppercase text-white tracking-wider">
                  Registrar <span className="text-brand-red font-bold">Cuenta Proveedor (CXP)</span>
                </h3>
                <button 
                  onClick={() => setIsNewCxpModalOpen(false)} 
                  className="p-2 text-slate-500 hover:text-white rounded-full bg-white/0 text-xs font-black"
                >
                  X
                </button>
              </div>

              <form onSubmit={handleCreateCxp} className="space-y-6">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Nombre o Razón Social del Proveedor</label>
                  <input 
                    type="text"
                    placeholder="Ej. Distribuidor Nacional Michelin S.A."
                    value={cxpForm.supplier}
                    onChange={(e) => setCxpForm({ ...cxpForm, supplier: e.target.value })}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-red transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Importe de la Factura ($)</label>
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={cxpForm.amount || ''}
                      onChange={(e) => setCxpForm({ ...cxpForm, amount: Number(e.target.value) })}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-red transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Fecha Límite Pago</label>
                    <input 
                      type="date"
                      value={cxpForm.dueDate}
                      onChange={(e) => setCxpForm({ ...cxpForm, dueDate: e.target.value })}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-red transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Concepto o Descripción de Suministros</label>
                  <input 
                    type="text"
                    placeholder="Ej. Adquisición lote de llantas Pilot Sport"
                    value={cxpForm.description}
                    onChange={(e) => setCxpForm({ ...cxpForm, description: e.target.value })}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-red transition-all"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsNewCxpModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={!cxpForm.supplier || cxpForm.amount <= 0 || !cxpForm.dueDate}
                    className="flex-1 py-3 bg-brand-red text-white disabled:opacity-30 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-red/20"
                  >
                    Crear Cuenta CXP
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
