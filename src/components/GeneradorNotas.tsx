import React, { useState, useMemo, useRef } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Printer, 
  Trash2, 
  ShoppingCart, 
  Car, 
  User, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  PackageCheck,
  ChevronRight,
  Filter,
  DollarSign,
  Download,
  AlertCircle,
  X,
  PlusCircle,
  MinusCircle,
  MapPin,
  Tag,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ServiceNote, NoteType, NoteStatus, Cliente, Tire, Branch, NoteItem } from '../types';
import { MOCK_NOTES, TIRES, MOCK_CLIENTES } from '../constants';

const STATUS_CONFIG: Record<NoteStatus, { icon: any, bg: string, text: string, label: string }> = {
  'Pendiente': { icon: Clock, bg: 'bg-brand-gold/10', text: 'text-brand-gold', label: 'Pendiente' },
  'Pagado': { icon: DollarSign, bg: 'bg-brand-blue/10', text: 'text-brand-blue', label: 'Pagado' },
  'En Taller': { icon: Wrench, bg: 'bg-brand-red/10', text: 'text-brand-red', label: 'En Taller' },
  'Listo para Entrega': { icon: PackageCheck, bg: 'bg-brand-gold/20', text: 'text-brand-gold', label: 'Listo' },
  'Finalizado': { icon: CheckCircle2, bg: 'bg-slate-800', text: 'text-slate-400', label: 'Finalizado' }
};

const COLUMNS: NoteStatus[] = ['Pendiente', 'Pagado', 'En Taller', 'Listo para Entrega', 'Finalizado'];

export const GeneradorNotas: React.FC = () => {
  const [notes, setNotes] = useState<ServiceNote[]>(MOCK_NOTES);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [selectedBranch, setSelectedBranch] = useState<Branch | 'Todas'>('Todas');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ServiceNote | null>(null);
  
  // New Note State
  const [noteForm, setNoteForm] = useState<{
    clienteId: string;
    type: NoteType;
    items: NoteItem[];
    anticipo: number;
    branch: Branch;
  }>({
    clienteId: '',
    type: 'Venta',
    items: [],
    anticipo: 0,
    branch: 'Frontera'
  });

  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [showProductResults, setShowProductResults] = useState(false);

  // Derived Data
  const filteredNotes = useMemo(() => {
    return notes.filter(n => selectedBranch === 'Todas' || n.branch === selectedBranch);
  }, [notes, selectedBranch]);

  const selectedCliente = useMemo(() => {
    return MOCK_CLIENTES.find(c => c.id === noteForm.clienteId);
  }, [noteForm.clienteId]);

  const subtotal = noteForm.items.reduce((acc, item) => acc + item.total, 0);
  const total = subtotal; // Simplified for this view, maybe add taxes logic if needed
  const saldoRestante = noteForm.type === 'Apartado' ? total - noteForm.anticipo : 0;

  // Handlers
  const handleAddProduct = (tire: Tire) => {
    const existing = noteForm.items.find(i => i.itemId === tire.id);
    if (existing) {
      setNoteForm({
        ...noteForm,
        items: noteForm.items.map(i => i.itemId === tire.id ? { 
          ...i, 
          quantity: i.quantity + 1, 
          total: (i.quantity + 1) * i.unitPrice 
        } : i)
      });
    } else {
      const newItem: NoteItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'Producto',
        itemId: tire.id,
        description: `${tire.brand} ${tire.model} (${tire.size})`,
        quantity: 1,
        unitPrice: tire.price,
        total: tire.price,
        image: tire.image
      };
      setNoteForm({ ...noteForm, items: [...noteForm.items, newItem] });
    }
    setShowProductResults(false);
    setProductSearch('');
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setNoteForm({
      ...noteForm,
      items: noteForm.items.map(i => {
        if (i.id === id) {
          const newQty = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQty, total: newQty * i.unitPrice };
        }
        return i;
      })
    });
  };

  const handleRemoveItem = (id: string) => {
    setNoteForm({ ...noteForm, items: noteForm.items.filter(i => i.id !== id) });
  };

  const handleCreateNote = () => {
    if (!noteForm.clienteId || noteForm.items.length === 0) return;
    
    const newNote: ServiceNote = {
      id: Math.random().toString(36).substr(2, 9),
      folio: `MF-${1000 + notes.length + 1}`,
      type: noteForm.type,
      status: 'Pendiente',
      clienteId: noteForm.clienteId,
      clienteNombre: selectedCliente?.nombre || '',
      clientePlaca: selectedCliente?.placa_vehiculo || '',
      clienteTelefono: selectedCliente?.telefono,
      branch: noteForm.branch,
      items: noteForm.items,
      subtotal: total / 1.16,
      iva: total - (total / 1.16),
      total: total,
      anticipo: noteForm.type === 'Apartado' ? noteForm.anticipo : undefined,
      saldoRestante: noteForm.type === 'Apartado' ? saldoRestante : undefined,
      exchangeRate: 20.50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      vendedor: 'Admin'
    };

    setNotes([newNote, ...notes]);
    setIsNoteModalOpen(false);
    // Reset form
    setNoteForm({ clienteId: '', type: 'Venta', items: [], anticipo: 0, branch: 'Frontera' });
  };

  const moveNote = (id: string, newStatus: NoteStatus) => {
    setNotes(notes.map(n => n.id === id ? { ...n, status: newStatus, updatedAt: new Date().toISOString() } : n));
  };

  const handlePrint = (note: ServiceNote) => {
    setSelectedNote(note);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <img src="https://appdesign.appdesignproyectos.com/multillantas.png" alt="Logo" className="h-12 w-auto" />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-red/20">
                <FileText size={22} />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white italic uppercase">
                NOTAS <span className="text-brand-red">INTELIGENTES</span>
              </h2>
            </div>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-1 border-l-2 border-brand-red pl-3">
              Generación de folios, ventas y apartados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-brand-matte border border-brand-border p-1 rounded-xl flex">
            {(['kanban', 'list'] as const).map(m => (
              <button 
                key={m}
                onClick={() => setView(m)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === m ? 'bg-brand-red text-white' : 'text-slate-500 hover:text-white'}`}
              >
                {m}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsNoteModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-brand-red hover:bg-brand-red/90 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-red/20 active:scale-95 transition-all"
          >
            <Plus size={16} strokeWidth={3} /> Nueva Nota
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-brand-matte border border-brand-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-2xl">
        <div className="flex items-center gap-4 flex-1">
          <Filter size={18} className="text-slate-600" />
          <div className="flex gap-2">
            {(['Todas', 'Centro', 'Norte', 'Frontera'] as const).map(b => (
              <button
                key={b}
                onClick={() => setSelectedBranch(b)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                  selectedBranch === b ? 'bg-brand-red border-brand-red text-white' : 'bg-brand-dark border-brand-border text-slate-500 hover:text-white'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Total de Notas: <span className="text-white">{filteredNotes.length}</span>
        </div>
      </div>

      {/* Kanban Board */}
      {view === 'kanban' && (
        <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-6 custom-scrollbar">
          {COLUMNS.map(status => (
            <div key={status} className="flex-1 min-w-[300px] flex flex-col gap-4">
              <div className={`p-4 rounded-2xl border border-brand-border/50 flex items-center justify-between ${STATUS_CONFIG[status].bg} bg-opacity-5`}>
                <div className="flex items-center gap-3">
                    <div className={`${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].text} p-2 rounded-lg`}>
                        {React.createElement(STATUS_CONFIG[status].icon, { size: 18 })}
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-tighter text-white">{status}</h3>
                </div>
                <span className="text-[10px] font-black text-slate-500">{filteredNotes.filter(n => n.status === status).length}</span>
              </div>

              <div className="flex flex-col gap-4">
                <AnimatePresence mode='popLayout'>
                    {filteredNotes.filter(n => n.status === status).map(note => (
                      <motion.div 
                        key={note.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-brand-matte border border-brand-border rounded-2xl p-5 group hover:border-brand-red/40 transition-all shadow-xl hover:shadow-brand-red/5"
                      >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="block text-[10px] font-black text-brand-red uppercase tracking-widest mb-1">{note.folio}</span>
                                <h4 className="text-sm font-bold text-white group-hover:text-brand-red transition-colors">{note.clienteNombre}</h4>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
                                    note.type === 'Venta' ? 'bg-brand-blue/10 text-brand-blue' : 
                                    note.type === 'Apartado' ? 'bg-brand-gold/10 text-brand-gold' : 'bg-brand-red/10 text-brand-red'
                                }`}>
                                    {note.type}
                                </span>
                                <span className="text-[10px] font-mono text-slate-600 mt-1">{note.clientePlaca}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-1">
                                {note.items.map(item => (
                                    <div key={item.id} className="w-8 h-8 rounded-lg bg-brand-dark border border-brand-border p-1 overflow-hidden" title={item.description}>
                                        <img src={item.image} alt="" className="w-full h-full object-contain" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">Total:</span>
                                <span className="font-black text-white">${note.total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-brand-border/30 flex items-center justify-between">
                            <button 
                                onClick={() => handlePrint(note)}
                                className="p-2 text-slate-500 hover:text-white transition-all bg-white/5 rounded-lg"
                                title="Imprimir Nota"
                            >
                                <Printer size={16} />
                            </button>
                            <div className="flex items-center gap-1">
                                {COLUMNS.indexOf(status) < COLUMNS.length - 1 && (
                                    <button 
                                        onClick={() => moveNote(note.id, COLUMNS[COLUMNS.indexOf(status) + 1])}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-brand-dark hover:bg-brand-red text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-white rounded-lg transition-all"
                                    >
                                        Mover <ChevronRight size={10} />
                                    </button>
                                )}
                            </div>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Note Modal */}
      <AnimatePresence>
        {isNoteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-matte border border-brand-border w-full max-w-5xl h-[85vh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-brand-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-red/10 rounded-2xl text-brand-red border border-brand-red/20 shadow-lg shadow-brand-red/10">
                    <PlusCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase text-white">
                      Nueva <span className="text-brand-red">Nota de Servicio</span>
                    </h3>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Generador inteligente de folios</p>
                  </div>
                </div>
                <button onClick={() => setIsNoteModalOpen(false)} className="p-2 text-slate-500 hover:text-white rounded-full bg-white/5"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Left: Search & Form */}
                <div className="flex-1 p-8 border-r border-brand-border overflow-y-auto custom-scrollbar space-y-8">
                  {/* Branch & Type Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <MapPin size={12} className="text-brand-red" /> Sucursal
                        </label>
                        <select 
                            value={noteForm.branch}
                            onChange={(e) => setNoteForm({...noteForm, branch: e.target.value as Branch})}
                            className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-red transition-all"
                        >
                            <option value="Centro">CENTRO</option>
                            <option value="Norte">NORTE</option>
                            <option value="Frontera">FRONTERA</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Tag size={12} className="text-brand-red" /> Tipo de Nota
                        </label>
                        <div className="flex bg-brand-dark border border-brand-border p-1 rounded-xl">
                            {(['Venta', 'Apartado', 'Pedido'] as NoteType[]).map(t => (
                                <button 
                                    key={t}
                                    onClick={() => setNoteForm({...noteForm, type: t})}
                                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${noteForm.type === t ? 'bg-brand-red text-white' : 'text-slate-500 hover:text-white'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                  </div>

                  {/* Customer Search */}
                  <div className="space-y-4">
                    <div className="relative">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Buscar Cliente (Nombre o Placa)</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="text"
                                placeholder="Ej. ABC-1234"
                                value={customerSearch}
                                onChange={(e) => {
                                    setCustomerSearch(e.target.value);
                                    setShowCustomerResults(true);
                                }}
                                className="w-full bg-brand-dark border border-brand-border rounded-2xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:border-brand-red transition-all shadow-xl"
                            />
                        </div>
                        {showCustomerResults && customerSearch && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-brand-matte border border-brand-border rounded-2xl shadow-2xl z-10 max-h-60 overflow-y-auto custom-scrollbar py-2">
                                {MOCK_CLIENTES.filter(c => c.nombre.toLowerCase().includes(customerSearch.toLowerCase()) || c.placa_vehiculo.toLowerCase().includes(customerSearch.toLowerCase())).map(c => (
                                    <button 
                                        key={c.id}
                                        onClick={() => {
                                            setNoteForm({...noteForm, clienteId: c.id});
                                            setShowCustomerResults(false);
                                            setCustomerSearch('');
                                        }}
                                        className="w-full px-6 py-3 text-left hover:bg-white/5 flex items-center justify-between group"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-slate-200 group-hover:text-brand-red transition-colors">{c.nombre}</p>
                                            <p className="text-[10px] text-slate-500 font-mono italic">{c.placa_vehiculo}</p>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-700" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedCliente && (
                        <div className="bg-brand-red/5 border border-brand-red/20 rounded-2xl p-6 flex items-center gap-6 animate-in zoom-in duration-300">
                           <div className="w-14 h-14 bg-brand-red/10 rounded-full flex items-center justify-center text-brand-red border border-brand-red/20 shadow-lg shadow-brand-red/5">
                                <User size={24} />
                           </div>
                           <div className="flex-1">
                                <h4 className="text-lg font-black italic uppercase text-white tracking-tight">{selectedCliente.nombre}</h4>
                                <div className="flex items-center gap-6 mt-1">
                                    <div className="flex items-center gap-2">
                                        <Car size={12} className="text-brand-red" />
                                        <span className="text-xs font-mono text-slate-300">{selectedCliente.placa_vehiculo}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} className="text-brand-red" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase">Miembro desde: {new Date(selectedCliente.created_at).getFullYear()}</span>
                                    </div>
                                </div>
                           </div>
                           <button onClick={() => setNoteForm({...noteForm, clienteId: ''})} className="p-2 text-slate-600 hover:text-brand-red transition-colors">
                                <Trash2 size={18} />
                           </button>
                        </div>
                    )}
                  </div>

                  {/* Product Search */}
                  <div className="space-y-4 relative">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Agregar Llantas al Servicio</label>
                        <div className="relative">
                            <ShoppingCart className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="text"
                                placeholder="Escribe marca, modelo o medida..."
                                value={productSearch}
                                onChange={(e) => {
                                    setProductSearch(e.target.value);
                                    setShowProductResults(true);
                                }}
                                className="w-full bg-brand-dark border border-brand-border rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-brand-red transition-all"
                            />
                        </div>
                        {showProductResults && productSearch && (
                            <div className="absolute bottom-full left-0 w-full mb-2 bg-brand-matte border border-brand-border rounded-2xl shadow-2xl z-10 max-h-60 overflow-y-auto custom-scrollbar py-2">
                                {TIRES.filter(t => t.brand.toLowerCase().includes(productSearch.toLowerCase()) || t.model.toLowerCase().includes(productSearch.toLowerCase()) || t.size.toLowerCase().includes(productSearch.toLowerCase())).map(t => (
                                    <button 
                                        key={t.id}
                                        onClick={() => handleAddProduct(t)}
                                        className="w-full px-6 py-3 text-left hover:bg-white/5 flex items-center gap-4 group"
                                    >
                                        <div className="w-10 h-10 rounded bg-brand-dark p-1">
                                            <img src={t.image} alt="" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-white group-hover:text-brand-red transition-colors">{t.brand} {t.model}</p>
                                            <p className="text-[10px] text-slate-500">{t.size}</p>
                                        </div>
                                        <span className="text-xs font-black text-brand-gold">${t.price.toLocaleString()}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                  </div>
                </div>

                {/* Right: Summary */}
                <div className="w-full lg:w-[400px] bg-brand-dark/50 p-8 flex flex-col">
                  <h4 className="text-[10px] font-black uppercase text-slate-600 tracking-[0.3em] mb-6 border-b border-brand-border pb-4">Artículos Seleccionados</h4>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                    {noteForm.items.map(item => (
                        <div key={item.id} className="bg-brand-matte border border-brand-border rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-right duration-300 shadow-xl group">
                            <div className="w-12 h-12 bg-white rounded-xl p-1 shrink-0">
                                <img src={item.image} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-bold text-white truncate">{item.description}</p>
                                <p className="text-[10px] font-black text-brand-gold">${item.unitPrice.toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 bg-brand-dark p-1 rounded-lg border border-brand-border shadow-inner">
                                    <button onClick={() => handleUpdateQuantity(item.id, -1)} className="text-slate-500 hover:text-white transition-colors"><MinusCircle size={14} /></button>
                                    <span className="text-xs font-black text-white w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => handleUpdateQuantity(item.id, 1)} className="text-slate-500 hover:text-white transition-colors"><PlusCircle size={14} /></button>
                                </div>
                                <button onClick={() => handleRemoveItem(item.id)} className="text-slate-700 hover:text-brand-red transition-colors"><Trash2 size={12} /></button>
                            </div>
                        </div>
                    ))}
                    {noteForm.items.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-700 opacity-50">
                            <ShoppingCart size={48} strokeWidth={1} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-center">La lista está vacía.<br/>Agregue productos para comenzar.</p>
                        </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-brand-border space-y-4 bg-brand-matte/50 -mx-8 -mb-8 px-8 pb-8 mt-6">
                    {noteForm.type === 'Apartado' && (
                        <div className="space-y-2 animate-in slide-in-from-bottom duration-500">
                             <div className="flex justify-between items-center text-[10px] font-black uppercase text-brand-gold tracking-widest">
                                <span>Anticipo</span>
                                <span>${noteForm.anticipo.toLocaleString()}</span>
                            </div>
                            <input 
                                type="range" 
                                min={0} 
                                max={total} 
                                step={100}
                                value={noteForm.anticipo}
                                onChange={(e) => setNoteForm({...noteForm, anticipo: Number(e.target.value)})}
                                className="w-full accent-brand-gold h-1 bg-brand-dark rounded-full cursor-pointer"
                            />
                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                <span>Restante</span>
                                <span className="text-white">${saldoRestante.toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center text-lg font-black text-white py-2">
                        <span className="text-slate-500 uppercase text-[10px] tracking-widest italic">Total Estimado</span>
                        <span className="text-3xl tracking-tighter">${total.toLocaleString()}</span>
                    </div>

                    <button 
                        disabled={!noteForm.clienteId || noteForm.items.length === 0}
                        onClick={handleCreateNote}
                        className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest shadow-2xl transition-all active:scale-95 ${
                            !noteForm.clienteId || noteForm.items.length === 0 
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-brand-border' 
                                : 'bg-brand-red text-white shadow-brand-red/20 hover:bg-brand-red/90'
                        }`}
                    >
                        {noteForm.type === 'Pedido' ? <PackageCheck size={18} /> : <CheckCircle2 size={18} />}
                        {noteForm.type === 'Apartado' ? 'Confirmar Apartado' : noteForm.type === 'Pedido' ? 'Generar Pedido' : 'Generar Nota de Venta'}
                    </button>
                    <p className="text-[8px] text-center text-slate-600 font-black uppercase tracking-[0.2em] italic">Se registrará con folio automático y tasa de $20.50 MXN</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Preview Modal */}
      <AnimatePresence>
        {isPrintModalOpen && selectedNote && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl overflow-y-auto">
             <div className="flex flex-col gap-6 max-w-[800px] w-full">
                <div className="flex justify-end gap-3 no-print">
                    <button 
                        onClick={() => window.print()}
                        className="px-6 py-3 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-brand-blue/90"
                    >
                        <Printer size={16} /> Imprimir Ahora
                    </button>
                    <button 
                        onClick={() => setIsPrintModalOpen(false)}
                        className="px-6 py-3 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20"
                    >
                        Cerrar
                    </button>
                </div>

                {/* Print Template */}
                <div className="bg-white text-black p-12 shadow-2xl rounded-sm print:p-8 print:shadow-none print:m-0 print:rounded-none" id="print-area">
                    {/* Header Layout based on Image */}
                    <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-8">
                        <div className="space-y-4">
                            <img src="https://appdesign.appdesignproyectos.com/multillantas.png" alt="Logo" className="h-20 w-auto invert brightness-0" />
                            <div className="text-[12px] font-bold">
                                <p>MULTILLANTAS DE LA FRONTERA</p>
                                <p>Blvd. Luis Echeverría No. 1200</p>
                                <p>Tel: (899) 923-4567 | (899) 922-1133</p>
                                <p>Reynosa, Tamaulipas, México</p>
                            </div>
                        </div>
                        <div className="text-right space-y-2">
                             <div className="bg-black text-white px-6 py-2 rounded-lg font-black text-xl mb-4 italic">
                                NOTA DE {selectedNote.type.toUpperCase()}
                             </div>
                             <p className="text-xs"><span className="text-slate-400 font-bold uppercase">Folio:</span> <span className="text-xl font-black">{selectedNote.folio}</span></p>
                             <p className="text-xs"><span className="text-slate-400 font-bold uppercase">Fecha:</span> {new Date(selectedNote.createdAt).toLocaleDateString()}</p>
                             <p className="text-xs"><span className="text-slate-400 font-bold uppercase">Sucursal:</span> {selectedNote.branch}</p>
                        </div>
                    </div>

                    {/* Customer Data */}
                    <div className="grid grid-cols-2 gap-8 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <div>
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Datos del Cliente</h5>
                            <p className="font-black text-lg">{selectedNote.clienteNombre}</p>
                            <p className="text-xs text-slate-600 mt-1">{selectedNote.clienteTelefono || 'Sin teléfono registrado'}</p>
                        </div>
                        <div className="text-right">
                             <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Vehículo / Placa</h5>
                             <p className="font-black text-lg uppercase font-mono">{selectedNote.clientePlaca}</p>
                             <p className="text-[10px] text-slate-500 mt-1">Status: {selectedNote.status}</p>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full text-sm border-collapse mb-8">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="px-4 py-3 text-left font-black uppercase text-[10px] tracking-widest rounded-tl-lg">Descripción</th>
                                <th className="px-4 py-3 text-center font-black uppercase text-[10px] tracking-widest">Cant.</th>
                                <th className="px-4 py-3 text-right font-black uppercase text-[10px] tracking-widest">P. Unitario</th>
                                <th className="px-4 py-3 text-right font-black uppercase text-[10px] tracking-widest rounded-tr-lg">Importe</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 border-x border-b border-slate-200">
                            {selectedNote.items.map((item, idx) => (
                                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50' }>
                                    <td className="px-4 py-4">
                                        <p className="font-bold">{item.description}</p>
                                        <p className="text-[10px] text-slate-400 italic">Garantía Aplicable: 1 año</p>
                                    </td>
                                    <td className="px-4 py-4 text-center font-bold">{item.quantity}</td>
                                    <td className="px-4 py-4 text-right">${item.unitPrice.toLocaleString()}</td>
                                    <td className="px-4 py-4 text-right font-bold text-lg">${item.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-[300px] space-y-3">
                            <div className="flex justify-between items-center text-xs text-slate-500">
                                <span>SUBTOTAL:</span>
                                <span className="font-bold">${selectedNote.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-slate-500">
                                <span>IVA (16%):</span>
                                <span className="font-bold">${selectedNote.iva.toLocaleString()}</span>
                            </div>
                            {selectedNote.anticipo && (
                                <div className="flex justify-between items-center text-xs text-brand-blue font-bold p-2 bg-brand-blue/5 rounded">
                                    <span>ANTICIPO RECIBIDO:</span>
                                    <span>- ${selectedNote.anticipo.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-3 border-t-4 border-black">
                                <span className="font-black text-[12px] uppercase tracking-widest">TOTAL A PAGAR:</span>
                                <span className="font-black text-2xl">${(selectedNote.saldoRestante ?? selectedNote.total).toLocaleString()} MXN</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Warranties */}
                    <div className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-200">
                        <div className="space-y-2">
                             <h6 className="text-[10px] font-black uppercase tracking-widest border-b pb-1 mb-2">Garantías y Políticas</h6>
                             <div className="text-[9px] text-slate-600 space-y-1">
                                <p className="font-bold">• Llantas Nuevas: 1 Año contra defectos de fábrica.</p>
                                <p className="font-bold">• Llantas Seminuevas/Usadas: 15 Días de garantía por bola.</p>
                                <p>• No hay devoluciones en efectivo, únicamente cambio físico o nota a favor.</p>
                                <p>• No nos hacemos responsables por objetos olvidados dentro de su vehículo.</p>
                             </div>
                        </div>
                        <div className="flex flex-col items-center justify-end">
                            <div className="w-48 h-1 bg-black mb-1" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Firma de Conformidad del Cliente</p>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            #print-area, #print-area * {
                visibility: visible;
            }
            #print-area {
                position: fixed;
                left: 0;
                top: 0;
                width: 100%;
                background: white;
                color: black;
            }
            .no-print {
                display: none !important;
            }
        }
      `}</style>
    </div>
  );
};
