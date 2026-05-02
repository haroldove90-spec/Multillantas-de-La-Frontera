import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  FileDown, 
  Edit2, 
  Trash2, 
  X, 
  MapPin, 
  Phone, 
  Car, 
  Hash,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Cliente, Branch } from '../types';
import { MOCK_CLIENTES } from '../constants';

interface ClientesPanelProps {
  onAddMessage?: (msg: string) => void;
}

export const ClientesPanel: React.FC<ClientesPanelProps> = () => {
  const [clientes, setClientes] = useState<Cliente[]>(MOCK_CLIENTES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    rfc: '',
    telefono: '',
    direccion: '',
    placa_vehiculo: '',
    sucursal_registro_id: 'Centro' as Branch
  });

  const filteredClientes = useMemo(() => {
    return clientes.filter(c => 
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.placa_vehiculo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clientes, searchTerm]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Nombre', 'RFC', 'Teléfono', 'Dirección', 'Placa', 'Sucursal', 'Registro'];
    const rows = clientes.map(c => [
      c.id,
      c.nombre,
      c.rfc || '',
      c.telefono || '',
      c.direccion || '',
      c.placa_vehiculo,
      c.sucursal_registro_id,
      new Date(c.created_at).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `clientes_multillantas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCliente) {
      setClientes(prev => prev.map(c => c.id === editingCliente.id ? {
        ...c,
        ...formData,
        updated_at: new Date().toISOString()
      } : c));
    } else {
      const newCliente: Cliente = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setClientes([newCliente, ...clientes]);
    }
    closeModal();
  };

  const openModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nombre: cliente.nombre,
        rfc: cliente.rfc || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        placa_vehiculo: cliente.placa_vehiculo,
        sucursal_registro_id: cliente.sucursal_registro_id as Branch
      });
    } else {
      setEditingCliente(null);
      setFormData({
        nombre: '',
        rfc: '',
        telefono: '',
        direccion: '',
        placa_vehiculo: '',
        sucursal_registro_id: 'Centro'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCliente(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      setClientes(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <img src="https://appdesign.appdesignproyectos.com/multillantas.png" alt="Logo" className="h-12 w-auto hidden md:block" />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-red/20">
                <Users size={22} />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white italic uppercase">
                GESTIÓN DE <span className="text-brand-red">CLIENTES</span>
              </h2>
            </div>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-1 border-l-2 border-brand-red pl-3">
              Administración central de base de datos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-matte border border-brand-border rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-brand-red/50 transition-all shadow-xl"
          >
            <FileDown size={16} /> Exportar CSV
          </button>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-red hover:bg-brand-red/90 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-red/20 active:scale-95 transition-all"
          >
            <Plus size={16} strokeWidth={3} /> Nuevo Cliente
          </button>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-brand-matte border border-brand-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-2xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nombre o placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-dark border border-brand-border rounded-xl pl-12 pr-4 py-3 text-sm focus:border-brand-red transition-all text-white outline-none placeholder:text-slate-600"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-dark border border-brand-border rounded-xl text-[10px] font-black uppercase text-slate-500">
          Resultados: <span className="text-brand-red">{filteredClientes.length}</span>
        </div>
      </div>

      {/* Clientes Table */}
      <div className="bg-brand-matte border border-brand-border rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-dark/50 border-b border-brand-border/50">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Cliente</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Placa</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Contacto</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Sucursal</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/30">
              {filteredClientes.map(cliente => (
                <tr key={cliente.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-matte to-brand-dark border border-brand-border flex items-center justify-center text-brand-red font-black text-xs shadow-inner">
                        {cliente.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-brand-red transition-colors">{cliente.nombre}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{cliente.rfc || 'Sin RFC'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-3 py-1 bg-brand-dark border border-brand-border rounded font-mono text-sm text-brand-red font-bold shadow-inner">
                      {cliente.placa_vehiculo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-slate-600" />
                        <span>{cliente.telefono || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-slate-600" />
                        <span className="truncate max-w-[200px]">{cliente.direccion || 'Sin dirección'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        cliente.sucursal_registro_id === 'Centro' ? 'bg-brand-red' : 
                        cliente.sucursal_registro_id === 'Norte' ? 'bg-brand-blue' : 'bg-brand-gold'
                      }`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                        {cliente.sucursal_registro_id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openModal(cliente)}
                        className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cliente.id)}
                        className="p-2 text-slate-500 hover:text-brand-red hover:bg-brand-red/5 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClientes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Search size={40} className="text-slate-700" strokeWidth={1} />
                      <p className="text-slate-600 text-xs font-black uppercase tracking-widest italic">
                        No se encontraron clientes que coincidan con la búsqueda
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Overlay Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-brand-matte border border-brand-border w-full max-w-lg rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(255,0,0,0.1)] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-red/10 rounded-2xl text-brand-red border border-brand-red/20">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase text-white">
                      {editingCliente ? 'Editar' : 'Registro de'} <span className="text-brand-red">Cliente</span>
                    </h3>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Base de datos Multillantas de la Frontera</p>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  className="p-2 text-slate-500 hover:text-white rounded-full bg-white/5 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Users size={12} className="text-brand-red" /> Nombre Completo
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="Ej. Juan Pérez López"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-red transition-all text-white outline-none placeholder:text-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Hash size={12} className="text-brand-red" /> RFC
                    </label>
                    <input 
                      type="text"
                      placeholder="XAXX010101000"
                      value={formData.rfc}
                      onChange={(e) => setFormData({...formData, rfc: e.target.value.toUpperCase()})}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-red transition-all text-white outline-none placeholder:text-slate-700 uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Phone size={12} className="text-brand-red" /> Teléfono
                    </label>
                    <input 
                      type="tel"
                      required
                      placeholder="55-1234-5678"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-red transition-all text-white outline-none placeholder:text-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Car size={12} className="text-brand-red" /> Placa del Vehículo
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="ABC-1234"
                      value={formData.placa_vehiculo}
                      onChange={(e) => setFormData({...formData, placa_vehiculo: e.target.value.toUpperCase()})}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-red transition-all text-white outline-none placeholder:text-slate-700 uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <MapPin size={12} className="text-brand-red" /> Sucursal Registro
                    </label>
                    <select 
                      value={formData.sucursal_registro_id}
                      onChange={(e) => setFormData({...formData, sucursal_registro_id: e.target.value as Branch})}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-red transition-all text-white outline-none"
                    >
                      <option value="Centro">CENTRO</option>
                      <option value="Norte">NORTE</option>
                      <option value="Frontera">FRONTERA</option>
                    </select>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <MapPin size={12} className="text-brand-red" /> Dirección
                    </label>
                    <textarea 
                      placeholder="Calle, Número, Colonia, CP..."
                      value={formData.direccion}
                      onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                      rows={3}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm focus:border-brand-red transition-all text-white outline-none placeholder:text-slate-700 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-brand-border">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-4 bg-transparent border border-brand-border hover:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] px-6 py-4 bg-brand-red hover:bg-brand-red/90 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-red/20 active:scale-95 transition-all"
                  >
                    {editingCliente ? 'Guardar Cambios' : 'Registrar Cliente'}
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
