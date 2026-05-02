import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Users, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Filter,
  Download,
  FileText,
  Activity,
  UserCheck,
  Building2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Branch, 
  FinanceMovement, 
  AccountReceivable, 
  AccountPayable, 
  AuditLog,
  Tire
} from '../types';
import { 
  MOCK_FINANCE, 
  MOCK_CXC, 
  MOCK_CXP, 
  MOCK_AUDIT, 
  TIRES,
  MOCK_NOTES
} from '../constants';

export const AnalyticsPanel: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | 'Todas'>('Todas');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');

  // Chart Data Preparation
  const salesByBranch = useMemo(() => [
    { name: 'Centro', sales: 452000, color: '#D4AF37' },
    { name: 'Norte', sales: 385000, color: '#3b82f6' },
    { name: 'Frontera', sales: 512000, color: '#ef4444' },
  ].filter(b => selectedBranch === 'Todas' || b.name === selectedBranch), [selectedBranch]);

  const starProducts = useMemo(() => [
    { name: 'Goodyear Eagle F1', sales: 85, revenue: 276250 },
    { name: 'Michelin Pilot Sport', sales: 62, revenue: 347200 },
    { name: 'TPMS Universal', sales: 124, revenue: 121520 },
    { name: 'Wrangler Duratrac', sales: 45, revenue: 216000 },
  ].sort((a, b) => b.sales - a.sales), []);

  const revenueArea = useMemo(() => [
    { date: '01/05', revenue: 12000, net: 4500 },
    { date: '02/05', revenue: 18000, net: 7200 },
    { date: '03/05', revenue: 15000, net: 5800 },
    { date: '04/05', revenue: 22000, net: 9100 },
    { date: '05/05', revenue: 31000, net: 12400 },
    { date: '06/05', revenue: 28000, net: 10800 },
    { date: '07/05', revenue: 35000, net: 14500 },
  ], []);

  const branchDistribution = useMemo(() => [
    { name: 'Centro', value: 35 },
    { name: 'Norte', value: 25 },
    { name: 'Frontera', value: 40 },
  ], []);

  const COLORS = ['#D4AF37', '#3b82f6', '#ef4444'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <img src="https://appdesign.appdesignproyectos.com/multillantas.png" alt="Logo" className="h-12 w-auto" />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center text-black shadow-lg shadow-brand-gold/20">
                <Activity size={22} />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white italic uppercase">
                BUSINESS <span className="text-brand-gold">INTELLIGENCE</span>
              </h2>
            </div>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-1 border-l-2 border-brand-gold pl-3">
              Métricas financieras y auditoría operativa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-brand-matte border border-brand-border rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 outline-none hover:border-brand-gold/50 transition-all"
          >
            <option value="day">Hoy</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
            <option value="year">Este Año</option>
          </select>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-gold hover:bg-brand-gold/90 text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-gold/20 transition-all">
            <Download size={16} /> Exportar Reporte
          </button>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Ingresos Totales', val: '$1,349,000', delta: '+12.5%', up: true, icon: TrendingUp, color: 'text-brand-gold' },
          { label: 'Cuentas por Cobrar', val: '$6,600', delta: '-2.1%', up: false, icon: FileText, color: 'text-brand-blue' },
          { label: 'Utilidad Neta Est.', val: '$485,640', delta: '+8.4%', up: true, icon: DollarSign, color: 'text-brand-red' },
          { label: 'Ticket Promedio', val: '$4,850', delta: '+3.2%', up: true, icon: ShoppingBag, color: 'text-white' },
        ].map((kpi, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-brand-matte border border-brand-border rounded-3xl p-6 shadow-xl relative overflow-hidden group"
          >
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">{kpi.label}</p>
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-3xl font-black text-white group-hover:text-brand-gold transition-colors">{kpi.val}</h3>
                  <div className={`flex items-center gap-1 text-[10px] font-bold mt-2 ${kpi.up ? 'text-green-500' : 'text-brand-red'}`}>
                    {kpi.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {kpi.delta} vs mes anterior
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${kpi.color}`}>
                  <kpi.icon size={24} />
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-[40px] -rotate-45" />
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <div className="xl:col-span-2 bg-brand-matte border border-brand-border rounded-3xl p-8 shadow-2xl overflow-hidden relative">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg font-black uppercase italic text-white mb-1">Rendimiento <span className="text-brand-gold">Financiero</span></h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ingresos Brutos vs Utilidad Neta (MXN)</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-brand-gold" />
                 <span className="text-[10px] font-bold text-slate-400">Ingresos</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-brand-red" />
                 <span className="text-[10px] font-bold text-slate-400">Utilidad</span>
               </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueArea}>
                <defs>
                   <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#475569', fontWeight: 800 }}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#475569', fontWeight: 800 }}
                  tickFormatter={(val) => `$${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #262626', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ fontWeight: 800 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="net" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Distribution */}
        <div className="bg-brand-matte border border-brand-border rounded-3xl p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black uppercase italic text-white mb-1">Carga por <span className="text-brand-gold">Sucursal</span></h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Participación porcentual de ventas</p>
          </div>
          <div className="h-[250px] w-full mt-4">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                    data={branchDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                 >
                   {branchDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #262626', borderRadius: '12px', fontSize: '12px' }}
                />
               </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="space-y-3">
             {branchDistribution.map((b, idx) => (
                <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                        <span className="text-xs font-bold text-slate-400">{b.name}</span>
                    </div>
                    <span className="text-xs font-black text-white">{b.value}%</span>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Second Row: CXC / CXP & Products */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-brand-matte border border-brand-border rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-brand-border">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Productos <span className="text-brand-gold">Estrella</span></h3>
            <button className="text-[10px] font-black uppercase text-brand-gold hover:underline">Ver Todo</button>
          </div>
          <div className="space-y-6">
            {starProducts.map((p, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-dark flex items-center justify-center text-[10px] font-black text-brand-gold border border-brand-border">
                    #{idx + 1}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-white mb-1">{p.name}</p>
                    <div className="flex items-center gap-4">
                         <div className="flex-1 h-1.5 bg-brand-dark rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(p.sales/124)*100}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className="h-full bg-brand-gold rounded-full"
                            />
                         </div>
                         <span className="text-[10px] font-black text-slate-500">{p.sales} pz</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black text-white">${p.revenue.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-slate-600 uppercase">Ingreso</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Finance Snapshot (CXC / CXP) */}
        <div className="bg-brand-matte border border-brand-border rounded-3xl p-8 shadow-2xl flex flex-col">
            <div className="flex items-center gap-4 mb-8">
                <div className="px-4 py-2 bg-brand-gold text-black rounded-lg text-[10px] font-black uppercase tracking-widest">
                    Flujo de Caja
                </div>
                <div className="flex-1 h-px bg-brand-border" />
            </div>

            <div className="grid grid-cols-2 gap-8 flex-1">
                {/* Accounts Receivable */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <ArrowUpRight className="text-brand-blue" size={16} />
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">A Cobrar (CXC)</h4>
                    </div>
                    {MOCK_CXC.map(cxc => (
                        <div key={cxc.id} className="bg-brand-dark/50 border border-brand-border rounded-2xl p-4 group hover:border-brand-blue/40 transition-all">
                             <p className="text-xs font-bold text-white mb-1">{cxc.clienteNombre}</p>
                             <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-slate-500 font-mono italic">Folio: {cxc.noteId}</p>
                                    <p className="text-[10px] font-black text-brand-blue uppercase mt-1">Saldo: ${cxc.saldo.toLocaleString()}</p>
                                </div>
                                <button className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg hover:bg-brand-blue hover:text-white transition-all">
                                    <ArrowRight size={14} />
                                </button>
                             </div>
                        </div>
                    ))}
                </div>

                {/* Accounts Payable */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <ArrowDownRight className="text-brand-red" size={16} />
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">A Pagar (CXP)</h4>
                    </div>
                    {MOCK_CXP.map(cxp => (
                        <div key={cxp.id} className={`bg-brand-dark/50 border border-brand-border rounded-2xl p-4 group hover:border-brand-red/40 transition-all ${cxp.status === 'Vencido' ? 'border-brand-red/30 bg-brand-red/5' : ''}`}>
                             <p className="text-xs font-bold text-white mb-1 truncate">{cxp.supplier}</p>
                             <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-slate-500 font-mono italic">Vence: {new Date(cxp.dueDate).toLocaleDateString()}</p>
                                    <p className={`text-[10px] font-black uppercase mt-1 ${cxp.status === 'Vencido' ? 'text-brand-red animate-pulse' : 'text-slate-400'}`}>
                                        ${cxp.amount.toLocaleString()}
                                    </p>
                                </div>
                                <div className={`p-1.5 rounded text-[8px] font-black uppercase tracking-[0.2em] ${cxp.status === 'Vencido' ? 'bg-brand-red text-white' : 'bg-brand-dark bg-opacity-50 text-slate-600'}`}>
                                    {cxp.status}
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Audit Log (Bottom) */}
      <div className="bg-brand-matte border border-brand-border rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
            <ShieldAlert className="text-brand-red" size={20} />
            <h3 className="text-lg font-black uppercase italic text-white flex-1">Monitor de <span className="text-brand-red">Seguridad y Auditoría</span></h3>
            <div className="flex items-center gap-2 bg-brand-dark border border-brand-border px-4 py-2 rounded-xl">
                 <UserCheck size={14} className="text-slate-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Admin Activo</span>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-brand-border/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        <th className="pb-4 px-4">Timestamp</th>
                        <th className="pb-4 px-4">Usuario</th>
                        <th className="pb-4 px-4">Acción</th>
                        <th className="pb-4 px-4">Sucursal</th>
                        <th className="pb-4 px-4">Detalles</th>
                        <th className="pb-4 px-4 text-right">Referencia</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/20">
                    {MOCK_AUDIT.map(log => (
                        <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                            <td className="py-4 px-4">
                                <p className="text-[10px] font-mono text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</p>
                                <p className="text-[9px] font-mono text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</p>
                            </td>
                            <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                     <div className="w-6 h-6 rounded-lg bg-brand-red/10 flex items-center justify-center text-brand-red text-[8px] font-black">AD</div>
                                     <span className="text-xs font-bold text-white">{log.userName}</span>
                                </div>
                            </td>
                            <td className="py-4 px-4">
                                <span className={`px-2 py-1 rounded-[4px] text-[8px] font-black uppercase tracking-widest bg-brand-gold/10 text-brand-gold`}>
                                    {log.action}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">{log.branch}</td>
                            <td className="py-4 px-4 text-xs italic text-slate-400">{log.details}</td>
                            <td className="py-4 px-4 text-right">
                                <span className="text-[10px] font-mono text-brand-gold bg-brand-gold/5 px-2 py-1 rounded border border-brand-gold/20">{log.entityId}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
