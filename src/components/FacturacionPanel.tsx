import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Printer, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  Filter,
  Calendar,
  Building2,
  Lock,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Branch } from '../types';
import { getInvoices, saveInvoices, Invoice } from '../utils/persistentStorage';
import { useEffect } from 'react';

export const FacturacionPanel: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(() => getInvoices());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setInvoices(getInvoices());
    };
    window.addEventListener('multillantas_state_update', handleUpdate);
    return () => window.removeEventListener('multillantas_state_update', handleUpdate);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <img src="https://appdesign.appdesignproyectos.com/multillantas.png" alt="Logo" className="h-12 w-auto" />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center text-black shadow-lg shadow-brand-gold/20">
                <FileText size={22} />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white italic uppercase">
                FACTURACIÓN <span className="text-brand-gold">CFDI 4.0</span>
              </h2>
            </div>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-1 border-l-2 border-brand-gold pl-3">
              Gestión fiscal y timbrado SAT para México
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-matte border border-brand-border hover:border-brand-gold/50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
            <Lock size={14} className="text-brand-gold" /> Certificados (CSD)
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-gold hover:bg-brand-gold/90 text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-gold/20 transition-all">
            <ShieldCheck size={16} /> Validar Portal SAT
          </button>
        </div>
      </header>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-matte border border-brand-border rounded-3xl p-6 flex flex-col justify-between group hover:border-brand-gold/30 transition-all">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Total Facturado (Mes)</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-white">$70,210.50</h3>
            <span className="text-green-500 text-[10px] font-black uppercase bg-green-500/10 px-2 py-1 rounded">VIGENTE</span>
          </div>
        </div>
        <div className="bg-brand-matte border border-brand-border rounded-3xl p-6 flex flex-col justify-between group hover:border-brand-blue/30 transition-all">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Timbrados Exitosos</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-white">482</h3>
            <span className="text-brand-blue text-[10px] font-black uppercase bg-brand-blue/10 px-2 py-1 rounded">PAC ACTIVO</span>
          </div>
        </div>
        <div className="bg-brand-matte border border-brand-border rounded-3xl p-6 flex flex-col justify-between group hover:border-brand-red/30 transition-all">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Cancelaciones</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-white">3</h3>
            <span className="text-brand-red text-[10px] font-black uppercase bg-brand-red/10 px-2 py-1 rounded">VALIDADAS</span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-brand-matte border border-brand-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por Folio, UUID o RFC..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:border-brand-gold outline-none transition-all shadow-xl"
            />
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-brand-dark border border-brand-border text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                <Filter size={14} /> Filtros Avanzados
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-border/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                <th className="pb-6 px-4">Folio Fiscal / Datos</th>
                <th className="pb-6 px-4">Cliente y RFC</th>
                <th className="pb-6 px-4">Estatus SAT</th>
                <th className="pb-6 px-4 text-right">Monto Total</th>
                <th className="pb-6 px-4 text-center">Material Fiscal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/20">
              {invoices.map(inv => (
                <tr key={inv.id} className="group hover:bg-white/[0.02] transition-colors relative">
                  <td className="py-6 px-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-dark border border-brand-border rounded-xl flex items-center justify-center text-brand-gold">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-black text-white group-hover:text-brand-gold transition-colors">{inv.id}</p>
                        <p className="text-[9px] font-mono text-slate-600 mt-1 uppercase tracking-tighter truncate max-w-[150px]">{inv.uuid}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <p className="text-sm font-bold text-white mb-1">{inv.customer}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{inv.rfc}</p>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex items-center gap-2">
                       {inv.status === 'Timbrada' ? (
                         <div className="flex items-center gap-1.5 text-green-500 bg-green-500/10 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest">
                            <CheckCircle2 size={12} /> Vigente
                         </div>
                       ) : inv.status === 'Cancelada' ? (
                         <div className="flex items-center gap-1.5 text-brand-red bg-brand-red/10 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest">
                            <AlertTriangle size={12} /> Cancelada
                         </div>
                       ) : (
                         <div className="flex items-center gap-1.5 text-brand-gold bg-brand-gold/10 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest animate-pulse">
                            Pendiente
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="py-6 px-4 text-right">
                    <p className="font-black text-white text-lg">${inv.total.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-slate-600 uppercase">MXN</p>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex items-center justify-center gap-3">
                      <button className="p-2.5 bg-brand-dark border border-brand-border text-brand-gold rounded-xl hover:bg-brand-gold hover:text-black transition-all group/btn relative" title="Descargar XML">
                        <Share2 size={14} />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 whitespace-nowrap">XML</span>
                      </button>
                      <button className="p-2.5 bg-brand-dark border border-brand-border text-brand-red rounded-xl hover:bg-brand-red hover:text-white transition-all group/btn relative" title="Imprimir PDF">
                        <Printer size={14} />
                         <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 whitespace-nowrap">PDF</span>
                      </button>
                      <button className="p-2.5 bg-brand-dark border border-brand-border text-slate-500 hover:text-white rounded-xl transition-all">
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-brand-matte border border-brand-border p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
        <div className="flex items-center gap-4">
            <Building2 size={32} className="text-slate-500" />
            <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Proveedor Alt. Capacitación (PAC)</p>
                <p className="text-sm font-bold text-white tracking-tight">INDRA LOGISTICS MEX S.A. DE C.V.</p>
            </div>
        </div>
        <div className="flex items-center gap-8">
            <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vigencia CSD</p>
                <p className="text-xs font-bold text-white">Vence: 20/09/2026</p>
            </div>
            <div className="w-px h-8 bg-brand-border" />
            <button className="text-[10px] font-black uppercase text-brand-gold flex items-center gap-1">
                Soporte Técnico <ChevronRight size={12} />
            </button>
        </div>
      </div>
    </div>
  );
};
