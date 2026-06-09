import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Briefcase, 
  MapPin, 
  ArrowRight, 
  KeyRound, 
  Sparkles, 
  AlertTriangle,
  UserPlus,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SystemUser, Role, Branch } from '../types';
import { getSystemUsers, saveSystemUsers, saveLoggedUser } from '../utils/persistentStorage';

interface LoginScreenProps {
  onLoginSuccess: (user: SystemUser) => void;
}

const LOGO_URL = 'https://appdesign.appdesignproyectos.com/multillantas.png';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Registry States
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<Role>('Vendedor');
  const [regBranch, setRegBranch] = useState<Branch>('Frontera');
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const users = getSystemUsers();
    const foundUser = users.find(
      u => u.username.toLowerCase() === loginUsername.trim().toLowerCase() && u.password === loginPassword
    );

    if (foundUser) {
      saveLoggedUser(foundUser);
      onLoginSuccess(foundUser);
    } else {
      setLoginError('Credenciales incorrectas. Verifique el nombre de usuario y su clave de acceso.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setRegError('Todos los campos con asterisco son obligatorios.');
      return;
    }

    const users = getSystemUsers();
    const usernameExists = users.some(u => u.username.toLowerCase() === regUsername.trim().toLowerCase());

    if (usernameExists) {
      setRegError('El nombre de usuario ya está registrado en el sistema.');
      return;
    }

    const newUser: SystemUser = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      name: regName.trim(),
      username: regUsername.trim().toLowerCase(),
      password: regPassword,
      role: regRole,
      branch: regBranch,
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    saveSystemUsers(updatedUsers);

    setRegSuccess(`¡Usuario "${newUser.username}" registrado con éxito! Ya puedes iniciar sesión.`);
    
    // Reset fields
    setRegName('');
    setRegUsername('');
    setRegPassword('');
    
    // Auto switch to login tab after brief delay
    setTimeout(() => {
      setLoginUsername(newUser.username);
      setActiveTab('login');
      setRegSuccess('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-brand-red selection:text-white">
      {/* Background Decorative Neon Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-red/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-gold/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main card box container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl bg-brand-dark/40 border border-brand-border/80 backdrop-blur-3xl rounded-[3rem] shadow-[0_0_80px_rgba(230,190,0,0.06)] overflow-hidden flex flex-col"
      >
        <div className="p-8 md:p-12 pb-6 border-b border-brand-border/40 bg-black/60 flex flex-col items-center text-center">
          <motion.img 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            src={LOGO_URL} 
            alt="Multillantas de la Frontera" 
            className="h-16 md:h-20 w-auto object-contain mb-6 hover:brightness-110 transition-all cursor-pointer"
          />
          <h2 className="text-2xl md:text-3xl font-black italic uppercase text-white tracking-tight flex items-center gap-2">
            MULTILLANTAS <span className="text-brand-gold">FRONTERA</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
            Acceso Centralizado de Personal v4.2
          </p>
        </div>

        {/* Tab switch control */}
        <div className="flex bg-[#030303] border-b border-brand-border/40 p-2 gap-2 text-xs font-mono font-black uppercase">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setLoginError(''); setRegSuccess(''); }}
            className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'login'
                ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20 border border-brand-red/30'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <LogIn size={14} /> Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setLoginError(''); setRegSuccess(''); }}
            className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'register'
                ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/25'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserPlus size={14} /> Registrar Usuario
          </button>
        </div>

        <div className="p-8 md:p-12 pt-8">
          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.form 
                key="login"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-6"
              >
                {/* Seed information hint */}
                <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-2xl p-4 flex gap-3 text-slate-300">
                  <div className="p-1.5 bg-brand-gold/10 rounded-lg text-brand-gold h-fit">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-brand-gold tracking-widest">Credenciales del Sistema</h4>
                    <p className="text-[11px] text-slate-400 mt-1">Usa <span className="text-white font-mono font-bold">admin1</span> con contraseña <span className="text-white font-mono font-bold">admin123</span> para acceder como Administrador General.</p>
                  </div>
                </div>

                {loginError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-brand-red/10 border border-brand-red/20 rounded-2xl flex gap-3 text-brand-red"
                  >
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <p className="text-xs font-bold leading-relaxed">{loginError}</p>
                  </motion.div>
                )}

                <div className="space-y-2 font-sans">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Nombre de Usuario</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      <User size={16} />
                    </div>
                    <input 
                      type="text"
                      required
                      placeholder="admin1"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full bg-brand-dark/60 border border-brand-border/80 rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2 font-sans">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Clave de Acceso</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      <Lock size={16} />
                    </div>
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-brand-dark/60 border border-brand-border/80 rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 transition-all font-mono"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-red hover:bg-brand-red/90 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-brand-red/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <KeyRound size={14} /> Entrar al Sistema
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="register"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRegister}
                className="space-y-5"
              >
                {regSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex gap-3 text-green-400"
                  >
                    <Sparkles size={16} className="shrink-0 mt-0.5" />
                    <p className="text-xs font-bold leading-relaxed">{regSuccess}</p>
                  </motion.div>
                )}

                {regError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-brand-red/10 border border-brand-red/20 rounded-2xl flex gap-3 text-brand-red"
                  >
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <p className="text-xs font-bold leading-relaxed">{regError}</p>
                  </motion.div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5 font-sans">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Nombre Completo *</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ej. Ing. Carlos Martínez"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-brand-dark/60 border border-brand-border/80 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-brand-gold transition-all"
                    />
                  </div>

                  <div className="space-y-1.5 font-sans">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Nombre de Usuario *</label>
                    <input 
                      type="text"
                      required
                      placeholder="carlos_front"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full bg-brand-dark/60 border border-brand-border/80 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-brand-gold transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 font-sans">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Contraseña de Acceso *</label>
                    <input 
                      type="password"
                      required
                      placeholder="Contraseña segura"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-brand-dark/60 border border-brand-border/80 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-brand-gold transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 font-sans">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1 flex items-center gap-1.5">
                      <Briefcase size={12} className="text-brand-gold" /> Rol Asignado
                    </label>
                    <select 
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as Role)}
                      className="w-full bg-brand-dark border border-brand-border rounded-2xl px-4 py-3 text-xs text-slate-350 outline-none focus:border-brand-gold transition-all cursor-pointer font-black"
                    >
                      <option className="bg-brand-matte text-slate-300 font-bold" value="Administrador">Administrador</option>
                      <option className="bg-brand-matte text-slate-300 font-bold" value="Vendedor">Vendedor</option>
                      <option className="bg-brand-matte text-slate-300 font-bold" value="Técnico">Técnico</option>
                      <option className="bg-brand-matte text-slate-300 font-bold" value="Cliente">Cliente</option>
                      <option className="bg-brand-matte text-slate-300 font-bold" value="Secretaria Facturista">Secretaria Facturista</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 font-sans">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1 flex items-center gap-1.5">
                      <MapPin size={12} className="text-brand-gold" /> Sucursal
                    </label>
                    <select 
                      value={regBranch}
                      onChange={(e) => setRegBranch(e.target.value as Branch)}
                      className="w-full bg-brand-dark border border-brand-border rounded-2xl px-4 py-3 text-xs text-slate-350 outline-none focus:border-brand-gold transition-all cursor-pointer font-black"
                    >
                      <option className="bg-brand-matte text-slate-300 font-bold" value="Centro">Centro</option>
                      <option className="bg-brand-matte text-slate-300 font-bold" value="Norte">Norte</option>
                      <option className="bg-brand-matte text-slate-300 font-bold" value="Frontera">Frontera</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-gold hover:bg-brand-gold/90 text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-brand-gold/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <UserPlus size={14} /> Registrar Usuario Nuevo
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer credits / non-intrusive */}
      <div className="mt-8 text-center text-[10px] text-slate-700 font-mono flex items-center gap-2 font-bold uppercase tracking-widest">
        <span>© 2026 Multillantas de la Frontera S.A. de C.V.</span>
        <span>•</span>
        <span>Secure SQL Ledger Interface v4</span>
      </div>
    </div>
  );
};
