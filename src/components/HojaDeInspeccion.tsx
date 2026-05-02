import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Zap, 
  Droplets, 
  CircleDot, 
  Settings, 
  Car, 
  Save, 
  Activity as TreadIcon, 
  Gauge
} from 'lucide-react';
import { motion } from 'motion/react';
import { VehicleEntry, InspectionData, StatusColor, InspectionPoint } from '../types';

interface HojaDeInspeccionProps {
  vehicle: VehicleEntry;
  onSave: (data: InspectionData) => void;
  onClose: () => void;
}

const INITIAL_CHECKLIST: InspectionPoint[] = [
  { label: 'Sistema de Frenos', status: 'verde', icon: 'CircleDot' },
  { label: 'Luces y Señalización', status: 'verde', icon: 'Zap' },
  { label: 'Niveles de Fluidos', status: 'verde', icon: 'Droplets' },
  { label: 'Suspensión y Amort.', status: 'verde', icon: 'Settings' },
  { label: 'Estado de Batería', status: 'verde', icon: 'Zap' },
];

export const HojaDeInspeccion: React.FC<HojaDeInspeccionProps> = ({ vehicle, onSave, onClose }) => {
  const [checklist, setChecklist] = useState<InspectionPoint[]>(INITIAL_CHECKLIST);
  const [tires, setTires] = useState({
    fl: { depth: 8, psi: 32 },
    fr: { depth: 8, psi: 32 },
    rl: { depth: 8, psi: 32 },
    rr: { depth: 8, psi: 32 },
  });

  const handleStatusChange = (index: number, status: StatusColor) => {
    const newChecklist = [...checklist];
    newChecklist[index].status = status;
    setChecklist(newChecklist);
  };

  const handleTireChange = (pos: 'fl' | 'fr' | 'rl' | 'rr', field: 'depth' | 'psi', value: number) => {
    setTires(prev => ({
      ...prev,
      [pos]: { ...prev[pos], [field]: value }
    }));
  };

  const getIcon = (name: string) => {
    switch(name) {
      case 'CircleDot': return <CircleDot size={20} />;
      case 'Zap': return <Zap size={20} />;
      case 'Droplets': return <Droplets size={20} />;
      case 'Settings': return <Settings size={20} />;
      default: return <Settings size={20} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-black border border-brand-border w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(227,6,19,0.1)] flex flex-col max-h-[90vh]"
    >
      <div className="p-8 border-b border-brand-border flex items-center justify-between shrink-0 bg-brand-matte">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-brand-red/10 rounded-2xl text-brand-red border border-brand-red/20">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">{vehicle.plate}</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Hoja de Inspección Digital</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 text-slate-500 hover:text-white rounded-full bg-white/5 transition-all">
          <X size={28} />
        </button>
      </div>

      <div className="p-8 overflow-y-auto space-y-12 flex-1 custom-scrollbar">
        {/* Interactive Checklist */}
        <section className="space-y-6">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-3">
            <Settings size={16} /> Puntos de Seguridad Críticos
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checklist.map((item, idx) => (
              <div key={idx} className="bg-brand-matte p-6 rounded-3xl border border-brand-border flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{getIcon(item.icon)}</span>
                  <p className="text-xs font-black uppercase text-white/90">{item.label}</p>
                </div>
                <div className="flex gap-2">
                  {(['verde', 'amarillo', 'rojo'] as StatusColor[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(idx, s)}
                      className={`
                        flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all
                        ${s === 'verde' && item.status === 'verde' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : ''}
                        ${s === 'amarillo' && item.status === 'amarillo' ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20' : ''}
                        ${s === 'rojo' && item.status === 'rojo' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : ''}
                        ${item.status !== s ? 'bg-brand-dark text-slate-600 border border-brand-border hover:border-slate-500' : ''}
                      `}
                    >
                      {s === 'verde' ? 'Bueno' : s === 'amarillo' ? 'Regular' : 'Peligro'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tires Section with Diagram */}
        <section className="space-y-6">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-brand-blue flex items-center gap-3">
            <Gauge size={16} /> Diagnóstico de Neumáticos
          </h4>
          
          <div className="flex flex-col lg:flex-row items-center gap-12 bg-brand-matte p-10 rounded-[3rem] border border-brand-border shadow-inner">
            {/* Auto Diagram */}
            <div className="relative w-48 h-80 flex-shrink-0">
              <div className="absolute inset-0 border-[3px] border-slate-800 rounded-[2.5rem] shadow-[0_0_20px_rgba(255,255,255,0.02)]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 border-[1px] border-slate-900 rounded-full" />
              <Car className="absolute inset-0 m-auto text-slate-700 opacity-60" size={140} strokeWidth={0.5} />
              
              {/* Tire indicators with glow */}
              <div className="absolute -top-4 -left-4 w-12 h-20 bg-brand-dark border-2 border-brand-red/30 rounded-xl shadow-[0_0_15px_rgba(227,6,19,0.1)] flex items-center justify-center text-[10px] font-black text-brand-red">DI</div>
              <div className="absolute -top-4 -right-4 w-12 h-20 bg-brand-dark border-2 border-brand-red/30 rounded-xl shadow-[0_0_15px_rgba(227,6,19,0.1)] flex items-center justify-center text-[10px] font-black text-brand-red">DD</div>
              <div className="absolute -bottom-4 -left-4 w-12 h-20 bg-brand-dark border-2 border-slate-800 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-700">TI</div>
              <div className="absolute -bottom-4 -right-4 w-12 h-20 bg-brand-dark border-2 border-slate-800 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-700">TD</div>
            </div>

            {/* Inputs Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {(['fl', 'fr', 'rl', 'rr'] as const).map((pos) => (
                <div key={pos} className="bg-brand-dark p-6 rounded-3xl border border-brand-border space-y-4 hover:border-brand-blue/30 transition-all group">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {pos === 'fl' ? 'Delantero Izq' : pos === 'fr' ? 'Delantero Der' : pos === 'rl' ? 'Trasero Izq' : 'Trasero Der'}
                    </p>
                    <div className={`w-2 h-2 rounded-full ${tires[pos].depth < 3 ? 'bg-brand-red animate-pulse' : 'bg-green-500'}`} />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-[8px] font-black text-slate-600 uppercase flex items-center gap-1 group-hover:text-brand-red transition-colors"><TreadIcon size={12} /> mm Profundidad</label>
                      <input 
                        type="number" step={0.1} value={tires[pos].depth}
                        onChange={(e) => handleTireChange(pos, 'depth', parseFloat(e.target.value))}
                        className="w-full bg-black border border-brand-border rounded-xl px-4 py-3 text-brand-red font-black text-lg outline-none focus:border-brand-red transition-all shadow-inner"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[8px] font-black text-slate-600 uppercase flex items-center gap-1 group-hover:text-brand-blue transition-colors"><Gauge size={12} /> psi Presión</label>
                      <input 
                        type="number" value={tires[pos].psi}
                        onChange={(e) => handleTireChange(pos, 'psi', parseInt(e.target.value))}
                        className="w-full bg-black border border-brand-border rounded-xl px-4 py-3 text-brand-blue font-black text-lg outline-none focus:border-brand-blue transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="pt-4 pb-8">
          <button 
            onClick={() => onSave({ tires, checklist })}
            className="w-full bg-brand-red hover:bg-brand-red/90 py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-brand-red/20 transition-all text-white flex items-center justify-center gap-4 active:scale-95"
          >
            <Save size={20} /> Guardar Inspección Finalizada
          </button>
        </div>
      </div>
    </motion.div>
  );
};
