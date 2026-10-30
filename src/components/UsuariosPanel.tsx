import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  MapPin, 
  Building2, 
  Eye, 
  EyeOff, 
  Key, 
  RotateCcw, 
  AlertTriangle,
  Layers,
  Sparkles,
  Check,
  X,
  Database,
  Copy,
  FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SystemUser, Role, Branch } from '../types';
import { 
  getSystemUsers, 
  saveSystemUsers, 
  addSystemUser, 
  updateSystemUser, 
  deleteSystemUser, 
  resetSystemUsers,
  getLoggedUser,
  addAuditLog 
} from '../utils/persistentStorage';

export const ALL_MODULES = [
  { id: 'dashboard', label: 'Tablero Principal', desc: 'Métricas, KPIs y alertas del día' },
  { id: 'ecommerce', label: 'Stock de Llantas', desc: 'Inventario físico, precios y disponibilidad' },
  { id: 'taller', label: 'Control Taller', desc: 'Recepción, inspección y bahías de servicio' },
  { id: 'clientes', label: 'Clientes', desc: 'Padrón de clientes, RFC y vehículos' },
  { id: 'notas', label: 'Notas / POS', desc: 'Generador de notas de venta, apartados y pedidos' },
  { id: 'credito-msi', label: 'Cobranza y Créditos', desc: 'Gestión de CxC, CxP y planes diferidos' },
  { id: 'facturacion', label: 'Facturación SAT', desc: 'Emisión de CFDI 4.0 y timbrado' },
  { id: 'control-operativo', label: 'Control Operativo', desc: 'Auditoría, cortes de caja y traspasos' },
  { id: 'inventario', label: 'Inventario', desc: 'Entradas, salidas y conteos físicos' },
  { id: 'analytics', label: 'Inteligencia', desc: 'Análisis predictivo de desgaste y rotación' },
  { id: 'plataforma-cobro', label: 'Pasarelas de Cobro', desc: 'Mercado Pago, terminales y comisiones' },
  { id: 'usuarios', label: 'Gestión de Usuarios', desc: 'Control de usuarios y asignación de permisos' },
];

export const DEFAULT_PERMISSIONS_BY_ROLE: Record<Role, string[]> = {
  'Administrador': ['dashboard', 'ecommerce', 'taller', 'clientes', 'notas', 'credito-msi', 'facturacion', 'control-operativo', 'inventario', 'analytics', 'plataforma-cobro', 'usuarios'],
  'Vendedor': ['dashboard', 'ecommerce', 'taller', 'clientes', 'facturacion', 'control-operativo', 'inventario'],
  'Técnico': ['dashboard', 'taller'],
  'Cliente': ['taller'],
  'Secretaria Facturista': ['dashboard', 'clientes', 'notas', 'credito-msi', 'facturacion', 'inventario', 'analytics'],
  'Tienda en línea': ['ecommerce']
};

const ROLE_COLORS: Record<Role, { badge: string; text: string; border: string }> = {
  'Administrador': { badge: 'bg-brand-red/20 text-brand-red', text: 'text-brand-red', border: 'border-brand-red/40' },
  'Vendedor': { badge: 'bg-blue-500/20 text-blue-400', text: 'text-blue-400', border: 'border-blue-500/40' },
  'Técnico': { badge: 'bg-emerald-500/20 text-emerald-400', text: 'text-emerald-400', border: 'border-emerald-500/40' },
  'Cliente': { badge: 'bg-amber-500/20 text-amber-400', text: 'text-amber-400', border: 'border-amber-500/40' },
  'Secretaria Facturista': { badge: 'bg-purple-500/20 text-purple-400', text: 'text-purple-400', border: 'border-purple-500/40' },
  'Tienda en línea': { badge: 'bg-slate-500/20 text-slate-300', text: 'text-slate-300', border: 'border-slate-500/40' }
};

const COMPLETE_SQL_TEXT = `-- ============================================================================
-- MULTILLANTAS DE LA FRONTERA S.A. DE C.V.
-- ESQUEMA COMPLETO DE BASE DE DATOS Y USUARIOS
-- Compatible con: PostgreSQL 14+, PostgreSQL 15+, Supabase Database & Auth
-- Generado: Octubre 2026
-- ============================================================================

-- 1. ACTIVACIÓN DE EXTENSIONES CRIPTOGRÁFICAS Y UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA PRINCIPAL DE USUARIOS Y CONTROL DE ACCESO
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (
        role IN ('Administrador', 'Vendedor', 'Técnico', 'Cliente', 'Tienda en línea', 'Secretaria Facturista')
    ),
    branch VARCHAR(50) NOT NULL CHECK (
        branch IN ('Centro', 'Norte', 'Frontera')
    ),
    permissions TEXT[] NOT NULL DEFAULT ARRAY['dashboard']::TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ÍNDICES DE ALTO RENDIMIENTO
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_username_unique ON public.usuarios(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON public.usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_branch ON public.usuarios(branch);
CREATE INDEX IF NOT EXISTS idx_usuarios_is_active ON public.usuarios(is_active);

-- 4. DISPARADOR PARA ACTUALIZACIÓN AUTOMÁTICA DE TIMESTAMP
CREATE OR REPLACE FUNCTION public.set_usuarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON public.usuarios;
CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW
    EXECUTE FUNCTION public.set_usuarios_updated_at();

-- 5. TABLA DE AUDITORÍA Y BITÁCORA DE ACCIONES
CREATE TABLE IF NOT EXISTS public.auditoria_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    branch VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auditoria_created_at ON public.auditoria_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_branch ON public.auditoria_logs(branch);

-- 6. SEGURIDAD DE FILA (ROW LEVEL SECURITY - RLS)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura de usuarios para personal activo" ON public.usuarios;
CREATE POLICY "Lectura de usuarios para personal activo" 
    ON public.usuarios FOR SELECT 
    USING (is_active = true);

DROP POLICY IF EXISTS "Insercion y modificacion de usuarios por administradores" ON public.usuarios;
CREATE POLICY "Insercion y modificacion de usuarios por administradores" 
    ON public.usuarios FOR ALL 
    USING (true);

DROP POLICY IF EXISTS "Auditoria visible para personal" ON public.auditoria_logs;
CREATE POLICY "Auditoria visible para personal" 
    ON public.auditoria_logs FOR ALL 
    USING (true);

-- 7. REGISTRO DE CREDENCIALES SOLICITADAS Y CUENTAS BASE

-- A. HAROLD ANGUIANO (ADMINISTRADOR GENERAL - SUCURSAL FRONTERA)
-- Usuario: admin_123 | Clave: Chevropar#1970
INSERT INTO public.usuarios (id, nombre, username, password_hash, role, branch, permissions, is_active)
VALUES (
    'a1000000-0000-0000-0000-000000000001',
    'Harold Anguiano',
    'admin_123',
    'Chevropar#1970',
    'Administrador',
    'Frontera',
    ARRAY['dashboard', 'ecommerce', 'taller', 'clientes', 'notas', 'credito-msi', 'facturacion', 'control-operativo', 'inventario', 'analytics', 'plataforma-cobro', 'usuarios']::TEXT[],
    true
)
ON CONFLICT (username) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    branch = EXCLUDED.branch,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- B. DORIAN ORLANDO (ADMINISTRADOR GENERAL - SUCURSAL FRONTERA)
-- Usuario: dorian_orlando | Contraseña: Dorian#123.
INSERT INTO public.usuarios (id, nombre, username, password_hash, role, branch, permissions, is_active)
VALUES (
    'a2000000-0000-0000-0000-000000000002',
    'Dorian Orlando',
    'dorian_orlando',
    'Dorian#123.',
    'Administrador',
    'Frontera',
    ARRAY['dashboard', 'ecommerce', 'taller', 'clientes', 'notas', 'credito-msi', 'facturacion', 'control-operativo', 'inventario', 'analytics', 'plataforma-cobro', 'usuarios']::TEXT[],
    true
)
ON CONFLICT (username) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    branch = EXCLUDED.branch,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- C. ADMINISTRADOR PRINCIPAL DEMO
INSERT INTO public.usuarios (id, nombre, username, password_hash, role, branch, permissions, is_active)
VALUES (
    'aa11bb22-33cc-44dd-abee-112233445566',
    'Administrador Principal',
    'admin1',
    'admin123',
    'Administrador',
    'Frontera',
    ARRAY['dashboard', 'ecommerce', 'taller', 'clientes', 'notas', 'credito-msi', 'facturacion', 'control-operativo', 'inventario', 'analytics', 'plataforma-cobro', 'usuarios']::TEXT[],
    true
)
ON CONFLICT (username) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    branch = EXCLUDED.branch,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- D. VENDEDOR CENTRO
INSERT INTO public.usuarios (id, nombre, username, password_hash, role, branch, permissions, is_active)
VALUES (
    'bb22cc33-44dd-55ee-bfff-223344556677',
    'Vendedor Centro',
    'vendedor1',
    'vendedor123',
    'Vendedor',
    'Centro',
    ARRAY['dashboard', 'ecommerce', 'taller', 'clientes', 'facturacion', 'control-operativo', 'inventario']::TEXT[],
    true
)
ON CONFLICT (username) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    branch = EXCLUDED.branch,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- E. TÉCNICO ESPECIALISTA NORTE
INSERT INTO public.usuarios (id, nombre, username, password_hash, role, branch, permissions, is_active)
VALUES (
    'cc33dd44-55ee-66ff-c000-334455667788',
    'Técnico Especialista Norte',
    'tecnico1',
    'tecnico123',
    'Técnico',
    'Norte',
    ARRAY['dashboard', 'taller']::TEXT[],
    true
)
ON CONFLICT (username) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    branch = EXCLUDED.branch,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- F. CLIENTE FLOTILLA FRECUENTE
INSERT INTO public.usuarios (id, nombre, username, password_hash, role, branch, permissions, is_active)
VALUES (
    'dd44ee55-66ff-77aa-d111-445566778899',
    'Cliente Frecuente Flotilla',
    'cliente1',
    'cliente123',
    'Cliente',
    'Centro',
    ARRAY['taller']::TEXT[],
    true
)
ON CONFLICT (username) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    branch = EXCLUDED.branch,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- G. SECRETARÍA Y FACTURACIÓN FRONTERA
INSERT INTO public.usuarios (id, nombre, username, password_hash, role, branch, permissions, is_active)
VALUES (
    'ee55ff66-77aa-88bb-e222-556677889900',
    'Secretaría y Facturación Frontera',
    'secretaria1',
    'factura123',
    'Secretaria Facturista',
    'Frontera',
    ARRAY['dashboard', 'clientes', 'notas', 'credito-msi', 'facturacion', 'inventario', 'analytics']::TEXT[],
    true
)
ON CONFLICT (username) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    branch = EXCLUDED.branch,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;
`;

export const UsuariosPanel: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>(() => getSystemUsers());
  const [loggedUser] = useState<SystemUser | null>(() => getLoggedUser());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [hasCopiedSql, setHasCopiedSql] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [modalError, setModalError] = useState('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'Vendedor' as Role,
    branch: 'Centro' as Branch,
    isActive: true,
    permissions: DEFAULT_PERMISSIONS_BY_ROLE['Vendedor']
  });

  const notify = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'Vendedor',
      branch: 'Centro',
      isActive: true,
      permissions: [...DEFAULT_PERMISSIONS_BY_ROLE['Vendedor']]
    });
    setModalError('');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: SystemUser) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      username: u.username,
      password: u.password || '',
      role: u.role,
      branch: u.branch,
      isActive: u.isActive !== false,
      permissions: u.permissions && u.permissions.length > 0 ? [...u.permissions] : [...(DEFAULT_PERMISSIONS_BY_ROLE[u.role] || [])]
    });
    setModalError('');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleRoleChangeInForm = (newRole: Role) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      // If user hasn't explicitly customized, set recommended role permissions
      permissions: [...DEFAULT_PERMISSIONS_BY_ROLE[newRole]]
    }));
  };

  const togglePermission = (moduleId: string) => {
    setFormData(prev => {
      const exists = prev.permissions.includes(moduleId);
      return {
        ...prev,
        permissions: exists 
          ? prev.permissions.filter(p => p !== moduleId)
          : [...prev.permissions, moduleId]
      };
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!formData.name.trim() || !formData.username.trim() || !formData.password.trim()) {
      setModalError('Nombre, usuario y clave de acceso son requeridos.');
      return;
    }

    const cleanUsername = formData.username.trim().toLowerCase();

    // Check username uniqueness
    const exists = users.some(
      u => u.username.toLowerCase() === cleanUsername && (!editingUser || u.id !== editingUser.id)
    );
    if (exists) {
      setModalError(`El nombre de usuario "${cleanUsername}" ya existe en el sistema.`);
      return;
    }

    if (editingUser) {
      // Update
      const updatedUser: SystemUser = {
        ...editingUser,
        name: formData.name.trim(),
        username: cleanUsername,
        password: formData.password.trim(),
        role: formData.role,
        branch: formData.branch,
        isActive: formData.isActive,
        permissions: formData.permissions
      };
      updateSystemUser(updatedUser);
      setUsers(getSystemUsers());
      addAuditLog(
        loggedUser?.name || 'Administrador',
        'ACTUALIZAR_USUARIO',
        'usuarios',
        updatedUser.id,
        updatedUser.branch,
        `Se actualizó el usuario ${updatedUser.username} con rol ${updatedUser.role} (${updatedUser.permissions?.length || 0} permisos)`
      );
      notify(`Usuario "${updatedUser.name}" actualizado correctamente.`);
    } else {
      // Create
      const newUser: SystemUser = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        name: formData.name.trim(),
        username: cleanUsername,
        password: formData.password.trim(),
        role: formData.role,
        branch: formData.branch,
        isActive: formData.isActive,
        permissions: formData.permissions,
        createdAt: new Date().toISOString()
      };
      addSystemUser(newUser);
      setUsers(getSystemUsers());
      addAuditLog(
        loggedUser?.name || 'Administrador',
        'CREAR_USUARIO',
        'usuarios',
        newUser.id,
        newUser.branch,
        `Se dio de alta al usuario ${newUser.username} con rol ${newUser.role} en sucursal ${newUser.branch}`
      );
      notify(`Usuario "${newUser.name}" creado con éxito.`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteUser = (u: SystemUser) => {
    if (loggedUser && loggedUser.id === u.id) {
      alert('Por seguridad no puedes eliminar tu propia cuenta de Administrador activa.');
      return;
    }
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario "${u.name}" (@${u.username})?`)) {
      deleteSystemUser(u.id);
      setUsers(getSystemUsers());
      addAuditLog(
        loggedUser?.name || 'Administrador',
        'ELIMINAR_USUARIO',
        'usuarios',
        u.id,
        u.branch,
        `Se eliminó al usuario ${u.username} (${u.role})`
      );
      notify(`Usuario "${u.name}" eliminado del sistema.`);
    }
  };

  const handleToggleActive = (u: SystemUser) => {
    if (loggedUser && loggedUser.id === u.id) {
      alert('No puedes desactivar tu propia cuenta activa de Administrador.');
      return;
    }
    const updated: SystemUser = { ...u, isActive: u.isActive === false ? true : false };
    updateSystemUser(updated);
    setUsers(getSystemUsers());
    notify(`Estado de "${u.name}" cambiado a ${updated.isActive ? 'Activo' : 'Inactivo'}.`);
  };

  const handleResetDemoUsers = () => {
    if (confirm('¿Restablecer los usuarios del sistema a las cuentas maestras de demostración?')) {
      const reset = resetSystemUsers();
      setUsers(reset);
      notify('Usuarios restablecidos a la configuración inicial con éxito.');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
      const matchBranch = selectedBranchFilter === 'all' || u.branch === selectedBranchFilter;
      return matchSearch && matchRole && matchBranch;
    });
  }, [users, searchTerm, selectedRoleFilter, selectedBranchFilter]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.isActive !== false).length,
      admins: users.filter(u => u.role === 'Administrador').length,
      tecnicos: users.filter(u => u.role === 'Técnico').length,
      vendedores: users.filter(u => u.role === 'Vendedor').length
    };
  }, [users]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast Alert */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-8 z-50 bg-brand-matte border border-brand-gold/60 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl"
          >
            <CheckCircle2 size={18} className="text-brand-gold" />
            <span className="text-xs font-bold">{feedbackToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Module */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-red/30">
              <Users size={22} />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white italic uppercase">
              GESTIÓN DE <span className="text-brand-gold">USUARIOS Y PERMISOS</span>
            </h2>
          </div>
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-1 border-l-2 border-brand-red pl-3">
            Control de cuentas, asignación de roles y privilegios de acceso por sucursal
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="px-4 py-2.5 bg-brand-matte border border-brand-gold/50 hover:border-brand-gold text-brand-gold hover:bg-brand-gold/10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-brand-gold/5"
            title="Ver y copiar el script SQL completo para Supabase y PostgreSQL"
          >
            <Database size={14} /> Ver Script SQL Supabase
          </button>
          <button
            onClick={handleResetDemoUsers}
            className="px-4 py-2.5 bg-brand-matte border border-brand-border hover:border-slate-500 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer"
            title="Restaura los accesos originales de prueba"
          >
            <RotateCcw size={14} /> Restablecer Cuentas Base
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-brand-red hover:bg-brand-red/90 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-brand-red/30 active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus size={16} strokeWidth={2.5} /> Crear Nuevo Usuario
          </button>
        </div>
      </header>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-brand-matte border border-brand-border rounded-2xl p-4">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Usuarios</p>
          <p className="text-2xl font-black text-white italic mt-1">{stats.total}</p>
        </div>
        <div className="bg-brand-matte border border-brand-border rounded-2xl p-4">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Cuentas Activas</p>
          <p className="text-2xl font-black text-green-400 italic mt-1">{stats.active}</p>
        </div>
        <div className="bg-brand-matte border border-brand-border rounded-2xl p-4">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Administradores</p>
          <p className="text-2xl font-black text-brand-gold italic mt-1">{stats.admins}</p>
        </div>
        <div className="bg-brand-matte border border-brand-border rounded-2xl p-4">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Técnicos Bahía</p>
          <p className="text-2xl font-black text-emerald-400 italic mt-1">{stats.tecnicos}</p>
        </div>
        <div className="bg-brand-matte border border-brand-border rounded-2xl p-4">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Vendedores</p>
          <p className="text-2xl font-black text-blue-400 italic mt-1">{stats.vendedores}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-brand-matte border border-brand-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-dark border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-brand-red transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase text-slate-500">Rol:</span>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-brand-gold"
            >
              <option value="all">Todos los roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Vendedor">Vendedor</option>
              <option value="Técnico">Técnico</option>
              <option value="Cliente">Cliente</option>
              <option value="Secretaria Facturista">Secretaria Facturista</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase text-slate-500">Sucursal:</span>
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-brand-gold"
            >
              <option value="all">Todas las sucursales</option>
              <option value="Centro">Sucursal Centro</option>
              <option value="Norte">Sucursal Norte</option>
              <option value="Frontera">Sucursal Frontera</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-brand-matte border border-brand-border rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-brand-border/60 bg-black/40 text-[9px] font-black uppercase tracking-widest text-slate-500">
                <th className="py-4 px-6">Usuario & Personal</th>
                <th className="py-4 px-4">Rol Asignado</th>
                <th className="py-4 px-4">Sucursal Base</th>
                <th className="py-4 px-4">Módulos Habilitados</th>
                <th className="py-4 px-4 text-center">Estado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/30">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs font-bold uppercase">
                    No se encontraron usuarios con los filtros seleccionados
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleStyle = ROLE_COLORS[u.role] || ROLE_COLORS['Vendedor'];
                  const permsCount = u.permissions ? u.permissions.length : (DEFAULT_PERMISSIONS_BY_ROLE[u.role]?.length || 0);
                  const isCurrent = loggedUser?.id === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-brand-dark border ${roleStyle.border} flex items-center justify-center font-black text-sm text-white shrink-0`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-white group-hover:text-brand-gold transition-colors">{u.name}</p>
                              {isCurrent && (
                                <span className="bg-brand-gold/10 text-brand-gold text-[8px] font-black px-1.5 py-0.5 rounded border border-brand-gold/30 uppercase">
                                  Tú
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">@{u.username}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${roleStyle.badge} border ${roleStyle.border}`}>
                          <ShieldCheck size={12} />
                          {u.role}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300">
                          <Building2 size={13} className="text-slate-500" />
                          Sucursal {u.branch}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black font-mono text-brand-gold">{permsCount}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">de {ALL_MODULES.length} módulos</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                            u.isActive !== false 
                              ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20' 
                              : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                          }`}
                          title="Hacer clic para activar/desactivar"
                        >
                          {u.isActive !== false ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                          {u.isActive !== false ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-2 bg-brand-dark hover:bg-white/10 text-slate-400 hover:text-white rounded-xl border border-brand-border transition-all cursor-pointer"
                            title="Editar usuario y permisos"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={isCurrent}
                            className={`p-2 rounded-xl border transition-all ${
                              isCurrent 
                                ? 'opacity-30 cursor-not-allowed bg-brand-dark border-brand-border text-slate-600' 
                                : 'bg-brand-dark hover:bg-brand-red/20 text-slate-400 hover:text-brand-red border-brand-border hover:border-brand-red/40 cursor-pointer'
                            }`}
                            title={isCurrent ? 'No puedes eliminar tu usuario actual' : 'Eliminar usuario'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-brand-dark border border-brand-border w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl my-8 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-brand-border/60 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black italic uppercase text-white">
                      {editingUser ? 'Editar Usuario y Permisos' : 'Crear Nuevo Usuario'}
                    </h3>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      Multillantas de la Frontera • ERP Security
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-500 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {modalError && (
                <div className="mb-6 p-3 bg-brand-red/10 border border-brand-red/30 rounded-xl flex items-center gap-3 text-brand-red text-xs font-bold">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveUser} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Roberto Gómez"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-brand-matte border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-brand-red transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Usuario de Acceso *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. rgomez"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                      className="w-full bg-brand-matte border border-brand-border rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-600 outline-none focus:border-brand-red transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contraseña *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Clave de acceso"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-brand-matte border border-brand-border rounded-xl pl-4 pr-10 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-brand-red transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rol *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleRoleChangeInForm(e.target.value as Role)}
                      className="w-full bg-brand-matte border border-brand-border rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-brand-gold transition-all"
                    >
                      <option value="Administrador">Administrador</option>
                      <option value="Vendedor">Vendedor</option>
                      <option value="Técnico">Técnico (antes Asesor)</option>
                      <option value="Cliente">Cliente</option>
                      <option value="Secretaria Facturista">Secretaria Facturista</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sucursal Base *</label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value as Branch })}
                      className="w-full bg-brand-matte border border-brand-border rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-brand-gold transition-all"
                    >
                      <option value="Centro">Centro</option>
                      <option value="Norte">Norte</option>
                      <option value="Frontera">Frontera</option>
                    </select>
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-brand-matte border border-brand-border rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-white">Estado de la Cuenta</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Habilitar o inhabilitar acceso al sistema</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      formData.isActive 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/40' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}
                  >
                    {formData.isActive ? 'Cuenta Activa' : 'Cuenta Inactiva'}
                  </button>
                </div>

                {/* Module Permissions Granular Matrix */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                        <Layers size={14} className="text-brand-gold" /> Permisos de Módulos Asignados
                      </p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                        Selecciona a qué secciones puede ingresar este usuario
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, permissions: [...DEFAULT_PERMISSIONS_BY_ROLE[formData.role]] })}
                      className="text-[9px] font-black uppercase text-brand-gold hover:underline"
                    >
                      Restablecer por Rol
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                    {ALL_MODULES.map((m) => {
                      const isChecked = formData.permissions.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => togglePermission(m.id)}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                            isChecked 
                              ? 'bg-brand-red/10 border-brand-red/40 text-white' 
                              : 'bg-brand-matte border-brand-border/60 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                            isChecked ? 'bg-brand-red text-white' : 'border border-slate-600'
                          }`}>
                            {isChecked && <Check size={12} strokeWidth={3} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-black uppercase tracking-tight">{m.label}</p>
                            <p className="text-[9px] text-slate-400 truncate">{m.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/60">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-brand-matte border border-brand-border hover:bg-white/5 text-slate-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-brand-red hover:bg-brand-red/90 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-red/30 active:scale-95 transition-all cursor-pointer"
                  >
                    {editingUser ? 'Guardar Cambios' : 'Registrar Usuario'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Supabase SQL Script Viewer Modal */}
        {isSqlModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setIsSqlModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-brand-matte border border-brand-gold/40 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-brand-border/60 flex items-center justify-between bg-black/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold">
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tight flex items-center gap-2">
                      Script SQL Completo <span className="text-brand-gold font-mono text-sm">(PostgreSQL & Supabase)</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      Incluye credenciales de Harold Anguiano (@admin_123) y Dorian Orlando (@dorian_orlando)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(COMPLETE_SQL_TEXT);
                      setHasCopiedSql(true);
                      setTimeout(() => setHasCopiedSql(false), 3000);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                      hasCopiedSql 
                        ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' 
                        : 'bg-brand-gold hover:bg-brand-gold/90 text-black shadow-lg shadow-brand-gold/20'
                    }`}
                  >
                    {hasCopiedSql ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                    {hasCopiedSql ? '¡Copiado!' : 'Copiar SQL'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSqlModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Code viewer body */}
              <div className="p-6 flex-1 overflow-y-auto bg-[#030303] custom-scrollbar border-b border-brand-border/40">
                <pre className="text-xs font-mono text-emerald-400 whitespace-pre leading-relaxed select-all selection:bg-brand-gold selection:text-black">
                  {COMPLETE_SQL_TEXT}
                </pre>
              </div>

              {/* Footer */}
              <div className="p-4 bg-black/40 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Archivo físico generado en: <strong className="text-slate-300 font-sans">/src/db/users_schema.sql</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setIsSqlModalOpen(false)}
                  className="px-4 py-1.5 bg-brand-dark border border-brand-border text-white rounded-lg font-black uppercase text-[10px] hover:bg-white/5 cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
