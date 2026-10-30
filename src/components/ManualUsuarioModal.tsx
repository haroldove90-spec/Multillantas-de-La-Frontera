import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  BookOpen, 
  ShieldCheck, 
  User, 
  Wrench, 
  CreditCard, 
  FileText, 
  Car, 
  Boxes, 
  Activity, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight,
  Copy,
  ExternalLink,
  Layers,
  MapPin,
  HelpCircle,
  Clock
} from 'lucide-react';
import { AppLogo } from './AppLogo';

interface ManualUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualUsuarioModal: React.FC<ManualUsuarioModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'todo' | 'roles' | 'modulos' | 'credenciales' | 'faq'>('todo');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `MANUAL DE USUARIO - MULTILLANTAS DE LA FRONTERA
Acceso al sistema:
1. Harold Anguiano: Usuario: admin_123 | Clave: Chevropar#1970 (Administrador)
2. Dorian Orlando: Usuario: dorian_orlando | Clave: Dorian#123. (Administrador)
3. Vendedor: Usuario: vendedor1 | Clave: ventas123
4. Técnico: Usuario: tecnico1 | Clave: taller123
5. Secretaria Facturista: Usuario: facturacion1 | Clave: factura123
6. Cliente: Usuario: cliente1 | Clave: cliente123

Sucursales: Centro, Norte, Frontera.
Seguridad: Cierre de sesión automático al cerrar la pestaña.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-hidden">
      {/* Container */}
      <div className="bg-[#0A0A0A] border border-brand-border/90 rounded-[2rem] w-full max-w-5xl h-[92vh] flex flex-col shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden text-slate-200">
        
        {/* Header - No print buttons bar */}
        <div className="p-4 sm:p-6 border-b border-brand-border/60 bg-black/70 flex flex-wrap items-center justify-between gap-4 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-gold/15 text-brand-gold border border-brand-gold/30">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-wider">
                  Manual de Usuario Oficial
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-brand-red text-white text-[9px] font-black uppercase">
                  PDF Listo
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Multillantas de la Frontera • Guía rol por rol y módulo por módulo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleCopySummary}
              className="px-3.5 py-2 rounded-xl bg-brand-matte border border-brand-border hover:border-brand-gold/40 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              title="Copiar resumen de credenciales"
            >
              <Copy size={14} className={copied ? 'text-green-400' : 'text-brand-gold'} />
              <span>{copied ? '¡Copiado!' : 'Copiar Claves'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-brand-gold hover:bg-brand-gold/90 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-brand-gold/20 active:scale-95 cursor-pointer"
              title="Guardar o imprimir como archivo PDF"
            >
              <Printer size={16} />
              <span>Imprimir / Guardar en PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Screen only */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-black/40 border-b border-brand-border/40 text-xs font-bold overflow-x-auto shrink-0 print:hidden">
          <button
            onClick={() => setActiveSection('todo')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSection === 'todo'
                ? 'bg-brand-gold text-black font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Ver Manual Completo
          </button>
          <button
            onClick={() => setActiveSection('credenciales')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSection === 'credenciales'
                ? 'bg-brand-red text-white font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            1. Credenciales y Acceso
          </button>
          <button
            onClick={() => setActiveSection('roles')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSection === 'roles'
                ? 'bg-brand-blue text-white font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            2. Guía Rol por Rol
          </button>
          <button
            onClick={() => setActiveSection('modulos')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSection === 'modulos'
                ? 'bg-green-600 text-white font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            3. Guía Módulo por Módulo (12)
          </button>
          <button
            onClick={() => setActiveSection('faq')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSection === 'faq'
                ? 'bg-purple-600 text-white font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            4. Preguntas Frecuentes
          </button>
        </div>

        {/* Printable & Scrollable Manual Content */}
        <div 
          id="manual-print-area" 
          className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-10 custom-scrollbar print:p-0 print:overflow-visible print:bg-white print:text-black"
        >
          {/* Document Cover / Header Banner */}
          <div className="border border-brand-border/80 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-black via-brand-dark to-brand-matte print:border-black print:bg-white print:text-black">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-brand-border/60 print:border-black">
              <div className="flex items-center gap-4">
                <AppLogo className="h-16 w-auto print:brightness-0" showSubtitle={false} />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white print:text-black">
                    MULTILLANTAS <span className="text-brand-gold print:text-black">DE LA FRONTERA</span>
                  </h1>
                  <p className="text-xs font-bold text-brand-red uppercase tracking-widest mt-0.5 print:text-black">
                    Manual de Usuario y Operación del Sistema v4.2
                  </p>
                </div>
              </div>
              <div className="text-right text-[11px] font-mono text-slate-400 print:text-black space-y-0.5">
                <p><strong className="text-white print:text-black">Sucursales:</strong> Centro • Norte • Frontera</p>
                <p><strong className="text-white print:text-black">Plataforma:</strong> Sistema de Gestión Integral</p>
                <p><strong className="text-white print:text-black">Seguridad:</strong> Sesión Volátil por Pestaña</p>
              </div>
            </div>

            <div className="mt-4 pt-2 flex flex-wrap gap-4 text-xs text-slate-300 print:text-black">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-brand-gold print:text-black" />
                Diseñado para usarse sin experiencia técnica previa.
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-brand-gold print:text-black" />
                Instrucciones paso a paso, botón por botón.
              </span>
            </div>
          </div>

          {/* SECTION 1: CREDENCIALES Y ACCESO */}
          {(activeSection === 'todo' || activeSection === 'credenciales') && (
            <section className="space-y-4 print:break-inside-avoid">
              <div className="flex items-center gap-2.5 pb-2 border-b border-brand-border/60 print:border-black">
                <span className="w-7 h-7 rounded-lg bg-brand-gold text-black flex items-center justify-center font-black text-xs">
                  1
                </span>
                <h2 className="text-xl font-black uppercase text-white print:text-black tracking-wide">
                  Acceso al Sistema y Credenciales
                </h2>
              </div>

              <p className="text-sm text-slate-300 print:text-black leading-relaxed">
                El sistema cuenta con inicio de sesión seguro. Cada usuario ingresa únicamente a las herramientas que le corresponden según su rol. 
                <strong className="text-brand-gold print:text-black"> Importante:</strong> Por seguridad bancaria y operativa, al cerrar la pestaña del navegador la sesión se finaliza automáticamente, protegiendo los datos de clientes e inventario.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Admin Harold */}
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:border-black print:bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-white print:text-black flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-brand-red" /> Harold Anguiano
                    </span>
                    <span className="px-2 py-0.5 rounded bg-brand-red/20 text-brand-red font-mono text-[10px] font-black uppercase">
                      Administrador
                    </span>
                  </div>
                  <div className="bg-black/60 p-2.5 rounded-xl border border-brand-border/50 font-mono text-xs space-y-1 print:bg-slate-100 print:border-slate-300">
                    <p><strong className="text-slate-400 print:text-black">Usuario:</strong> <span className="text-brand-gold print:text-black font-bold">admin_123</span></p>
                    <p><strong className="text-slate-400 print:text-black">Contraseña:</strong> <span className="text-white print:text-black font-bold">Chevropar#1970</span></p>
                    <p><strong className="text-slate-400 print:text-black">Sucursal predeterminada:</strong> Frontera</p>
                  </div>
                </div>

                {/* Admin Dorian */}
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:border-black print:bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-white print:text-black flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-brand-red" /> Dorian Orlando
                    </span>
                    <span className="px-2 py-0.5 rounded bg-brand-red/20 text-brand-red font-mono text-[10px] font-black uppercase">
                      Administrador
                    </span>
                  </div>
                  <div className="bg-black/60 p-2.5 rounded-xl border border-brand-border/50 font-mono text-xs space-y-1 print:bg-slate-100 print:border-slate-300">
                    <p><strong className="text-slate-400 print:text-black">Usuario:</strong> <span className="text-brand-gold print:text-black font-bold">dorian_orlando</span></p>
                    <p><strong className="text-slate-400 print:text-black">Contraseña:</strong> <span className="text-white print:text-black font-bold">Dorian#123.</span></p>
                    <p><strong className="text-slate-400 print:text-black">Sucursal predeterminada:</strong> Centro</p>
                  </div>
                </div>

                {/* Vendedor */}
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:border-black print:bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-white print:text-black flex items-center gap-1.5">
                      <User size={14} className="text-blue-400" /> Vendedor Mostrador
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px] font-black uppercase">
                      Ventas
                    </span>
                  </div>
                  <div className="bg-black/60 p-2.5 rounded-xl border border-brand-border/50 font-mono text-xs space-y-1 print:bg-slate-100 print:border-slate-300">
                    <p><strong className="text-slate-400 print:text-black">Usuario:</strong> <span className="text-brand-gold print:text-black font-bold">vendedor1</span></p>
                    <p><strong className="text-slate-400 print:text-black">Contraseña:</strong> <span className="text-white print:text-black font-bold">ventas123</span></p>
                  </div>
                </div>

                {/* Técnico */}
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:border-black print:bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-white print:text-black flex items-center gap-1.5">
                      <Wrench size={14} className="text-amber-400" /> Técnico / Asesor Taller
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] font-black uppercase">
                      Taller
                    </span>
                  </div>
                  <div className="bg-black/60 p-2.5 rounded-xl border border-brand-border/50 font-mono text-xs space-y-1 print:bg-slate-100 print:border-slate-300">
                    <p><strong className="text-slate-400 print:text-black">Usuario:</strong> <span className="text-brand-gold print:text-black font-bold">tecnico1</span></p>
                    <p><strong className="text-slate-400 print:text-black">Contraseña:</strong> <span className="text-white print:text-black font-bold">taller123</span></p>
                  </div>
                </div>

                {/* Secretaria Facturista */}
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:border-black print:bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-white print:text-black flex items-center gap-1.5">
                      <FileText size={14} className="text-purple-400" /> Secretaria Facturista
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono text-[10px] font-black uppercase">
                      Facturación / CxC
                    </span>
                  </div>
                  <div className="bg-black/60 p-2.5 rounded-xl border border-brand-border/50 font-mono text-xs space-y-1 print:bg-slate-100 print:border-slate-300">
                    <p><strong className="text-slate-400 print:text-black">Usuario:</strong> <span className="text-brand-gold print:text-black font-bold">facturacion1</span></p>
                    <p><strong className="text-slate-400 print:text-black">Contraseña:</strong> <span className="text-white print:text-black font-bold">factura123</span></p>
                  </div>
                </div>

                {/* Cliente */}
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:border-black print:bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-white print:text-black flex items-center gap-1.5">
                      <Car size={14} className="text-green-400" /> Cliente / Consulta
                    </span>
                    <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-mono text-[10px] font-black uppercase">
                      Rastreo
                    </span>
                  </div>
                  <div className="bg-black/60 p-2.5 rounded-xl border border-brand-border/50 font-mono text-xs space-y-1 print:bg-slate-100 print:border-slate-300">
                    <p><strong className="text-slate-400 print:text-black">Usuario:</strong> <span className="text-brand-gold print:text-black font-bold">cliente1</span></p>
                    <p><strong className="text-slate-400 print:text-black">Contraseña:</strong> <span className="text-white print:text-black font-bold">cliente123</span></p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-brand-gold/10 border border-brand-gold/30 print:bg-slate-50 print:border-black text-xs text-brand-gold print:text-black">
                💡 <strong>¿Cómo iniciar sesión?</strong> En la pantalla principal, escriba su <em>Usuario</em> y <em>Contraseña</em>, o presione el botón con su nombre en la barra de "Accesos Rápidos". Luego pulse el botón rojo <strong>"INICIAR SESIÓN"</strong>.
              </div>
            </section>
          )}

          {/* SECTION 2: GUÍA ROL POR ROL */}
          {(activeSection === 'todo' || activeSection === 'roles') && (
            <section className="space-y-6 print:break-inside-avoid">
              <div className="flex items-center gap-2.5 pb-2 border-b border-brand-border/60 print:border-black">
                <span className="w-7 h-7 rounded-lg bg-brand-red text-white flex items-center justify-center font-black text-xs">
                  2
                </span>
                <h2 className="text-xl font-black uppercase text-white print:text-black tracking-wide">
                  Guía Rol por Rol (¿Qué hace cada quien?)
                </h2>
              </div>

              {/* Rol Administrador */}
              <div className="p-5 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black space-y-3">
                <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                  <h3 className="text-base font-black uppercase text-white print:text-black flex items-center gap-2">
                    <ShieldCheck size={18} className="text-brand-red" /> Rol 1: Administrador (Harold Anguiano / Dorian Orlando)
                  </h3>
                  <span className="text-xs font-mono font-bold text-brand-gold">Control Total</span>
                </div>
                <p className="text-xs text-slate-300 print:text-black leading-relaxed">
                  Tiene las llaves de todo el negocio. Puede ver las finanzas de las 3 sucursales, dar de alta y baja empleados, fijar comisiones y crear llaves de cobro.
                </p>
                <div className="space-y-1.5 text-xs text-slate-300 print:text-black">
                  <p><strong>Sus tareas diarias principales:</strong></p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li><strong>Revisar el Tablero:</strong> Ver las ventas totales del día, cuántos autos entraron al taller y dinero cobrado.</li>
                    <li><strong>Crear nuevos usuarios:</strong> Ir al módulo <em>"Usuarios y Permisos"</em>, presionar <em>"+ Nuevo Usuario"</em> y asignarle rol y sucursal.</li>
                    <li><strong>Cambiar de sucursal:</strong> En la barra superior, dar clic a su nombre y elegir ver Centro, Norte o Frontera.</li>
                    <li><strong>Pasarela de Cobro:</strong> Configurar las llaves de Mercado Pago para cobros con tarjeta o terminal Point.</li>
                  </ul>
                </div>
              </div>

              {/* Rol Vendedor */}
              <div className="p-5 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black space-y-3">
                <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                  <h3 className="text-base font-black uppercase text-white print:text-black flex items-center gap-2">
                    <User size={18} className="text-blue-400" /> Rol 2: Vendedor (Mostrador y Asesoría)
                  </h3>
                  <span className="text-xs font-mono font-bold text-blue-400">Ventas y Clientes</span>
                </div>
                <p className="text-xs text-slate-300 print:text-black leading-relaxed">
                  Enfocado en atender clientes en mostrador, encontrar las llantas exactas que el cliente busca y cerrar ventas.
                </p>
                <div className="space-y-1.5 text-xs text-slate-300 print:text-black">
                  <p><strong>Pasos para atender a un cliente:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 pl-2">
                    <li>Entrar al módulo <strong>"Stock"</strong> para consultar medidas (ej. Rin 15, Rin 17) y marcas (Michelin, Bridgestone, etc.).</li>
                    <li>Verificar existencias en su sucursal activa. Si no hay en Frontera, ver si hay en Centro o Norte para pedir traspaso.</li>
                    <li>En el Tablero, revisar la sección <strong>"Oportunidades de Venta"</strong>: ahí aparecen autos que el mecánico inspeccionó y tienen llantas lisas o frenos desgastados, para ofrecerles el cambio de inmediato.</li>
                  </ol>
                </div>
              </div>

              {/* Rol Técnico */}
              <div className="p-5 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black space-y-3">
                <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                  <h3 className="text-base font-black uppercase text-white print:text-black flex items-center gap-2">
                    <Wrench size={18} className="text-amber-400" /> Rol 3: Técnico / Asesor de Taller
                  </h3>
                  <span className="text-xs font-mono font-bold text-amber-400">Patio y Bahías</span>
                </div>
                <p className="text-xs text-slate-300 print:text-black leading-relaxed">
                  Encargado de la inspección física de los vehículos que ingresan a servicio. Su trabajo respalda la seguridad del cliente y genera ventas adicionales.
                </p>
                <div className="space-y-1.5 text-xs text-slate-300 print:text-black">
                  <p><strong>Pasos para procesar un vehículo:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 pl-2">
                    <li>Entrar a <strong>"Control Taller"</strong> y dar de alta el auto con Placa, Marca, Modelo y Motivo de visita.</li>
                    <li>Hacer clic en el botón <strong>"Inspeccionar"</strong> junto al vehículo.</li>
                    <li>Llenar la profundidad de dibujo de las 4 llantas (en milímetros) y presión (PSI). El sistema pinta de color verde si está buena, amarillo si está regular y rojo si es peligroso.</li>
                    <li>Marcar el checklist de 5 puntos: Frenos, Luces, Fluidos, Suspensión y Batería.</li>
                    <li>Presionar <strong>"Guardar Inspección"</strong>. Automáticamente el cliente y el vendedor verán el reporte.</li>
                  </ol>
                </div>
              </div>

              {/* Rol Secretaria Facturista */}
              <div className="p-5 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black space-y-3">
                <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                  <h3 className="text-base font-black uppercase text-white print:text-black flex items-center gap-2">
                    <FileText size={18} className="text-purple-400" /> Rol 4: Secretaria Facturista
                  </h3>
                  <span className="text-xs font-mono font-bold text-purple-400">Caja, CFDI y Cobranza</span>
                </div>
                <p className="text-xs text-slate-300 print:text-black leading-relaxed">
                  Controla la emisión de notas de venta, cobros en parcialidades (CxC / Créditos a flotillas) y facturación electrónica CFDI 4.0 ante el SAT.
                </p>
                <div className="space-y-1.5 text-xs text-slate-300 print:text-black">
                  <p><strong>Funciones clave:</strong></p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li><strong>Emitir Notas:</strong> En <em>"Notas/POS"</em> crea notas de venta, apartados o pedidos especiales con cálculo automático de IVA.</li>
                    <li><strong>Cobranza:</strong> En <em>"Cobranza y Créditos"</em> ve a los clientes con saldo pendiente, registra abonos y genera comprobantes de pago.</li>
                    <li><strong>Facturar:</strong> En <em>"Facturación"</em> ingresa el RFC del cliente, Uso de CFDI (G03, G01) y método (PUE / PPD) para generar el comprobante fiscal.</li>
                  </ul>
                </div>
              </div>

              {/* Rol Cliente */}
              <div className="p-5 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black space-y-3">
                <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                  <h3 className="text-base font-black uppercase text-white print:text-black flex items-center gap-2">
                    <Car size={18} className="text-green-400" /> Rol 5: Cliente (Consulta y Rastreo)
                  </h3>
                  <span className="text-xs font-mono font-bold text-green-400">Transparencia Total</span>
                </div>
                <p className="text-xs text-slate-300 print:text-black leading-relaxed">
                  Permite a cualquier cliente ingresar al sistema y ver en tiempo real el estatus de su vehículo sin necesidad de llamar por teléfono.
                </p>
                <div className="space-y-1.5 text-xs text-slate-300 print:text-black">
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Puede ver si su auto está en <em>Recepción</em>, <em>En Bahía de Taller</em> o <em>Listo para Entrega</em>.</li>
                    <li>Revisa la hoja de inspección digital de sus neumáticos y sabe con honestidad qué llanta requiere reemplazo.</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 3: GUÍA MÓDULO POR MÓDULO */}
          {(activeSection === 'todo' || activeSection === 'modulos') && (
            <section className="space-y-6 print:break-inside-avoid">
              <div className="flex items-center gap-2.5 pb-2 border-b border-brand-border/60 print:border-black">
                <span className="w-7 h-7 rounded-lg bg-green-500 text-black flex items-center justify-center font-black text-xs">
                  3
                </span>
                <h2 className="text-xl font-black uppercase text-white print:text-black tracking-wide">
                  Guía Módulo por Módulo (Los 12 Módulos)
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Tablero */}
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs font-black">1</span>
                    <h4 className="text-sm font-black uppercase text-white print:text-black">Tablero Principal</h4>
                  </div>
                  <p className="text-xs text-slate-300 print:text-black">
                    <strong>¿Qué hace?:</strong> Muestra el pulso general de la sucursal activa.
                  </p>
                  <ul className="text-xs text-slate-400 print:text-black list-disc list-inside space-y-0.5">
                    <li>Ingresos cobrados hoy en pesos ($).</li>
                    <li>Total de ventas cerradas y autos en patio.</li>
                    <li>Sección <em>"Oportunidades de Venta"</em> para contactar clientes con llantas en rojo.</li>
                  </ul>
                </div>

                {/* 2. Stock */}
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs font-black">2</span>
                    <h4 className="text-sm font-black uppercase text-white print:text-black">Stock (Llantas y Rines)</h4>
                  </div>
                  <p className="text-xs text-slate-300 print:text-black">
                    <strong>¿Qué hace?:</strong> Catálogo digital completo con buscador por medida de Rin (13" a 22") y marca.
                  </p>
                  <ul className="text-xs text-slate-400 print:text-black list-disc list-inside space-y-0.5">
                    <li>Indica cuántas llantas hay en Centro, Norte y Frontera.</li>
                    <li>Permite agregar piezas al carrito para cotizar al cliente en 5 segundos.</li>
                    <li>Botón de fábrica para restablecer el stock oficial si es necesario.</li>
                  </ul>
                </div>

                {/* 3. Control Taller */}
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs font-black">3</span>
                    <h4 className="text-sm font-black uppercase text-white print:text-black">Control Taller y Bahías</h4>
                  </div>
                  <p className="text-xs text-slate-300 print:text-black">
                    <strong>¿Qué hace?:</strong> Control de vehículos en servicio técnico y bahías.
                  </p>
                  <ul className="text-xs text-slate-400 print:text-black list-disc list-inside space-y-0.5">
                    <li>Recepción con número de placa y motivo.</li>
                    <li>Hoja de inspección digital de neumáticos con medidor en milímetros.</li>
                    <li>Checklist de seguridad (Frenos, Luces, Fluidos, Batería).</li>
                  </ul>
                </div>

                {/* 4. Clientes */}
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs font-black">4</span>
                    <h4 className="text-sm font-black uppercase text-white print:text-black">Directorio de Clientes</h4>
                  </div>
                  <p className="text-xs text-slate-300 print:text-black">
                    <strong>¿Qué hace?:</strong> Base de datos de particulares, empresas y flotillas.
                  </p>
                  <ul className="text-xs text-slate-400 print:text-black list-disc list-inside space-y-0.5">
                    <li>Nombre, teléfono, correo y RFC fiscal.</li>
                    <li>Límite de crédito asignado y saldo actual.</li>
                    <li>Historial de compras y servicios anteriores.</li>
                  </ul>
                </div>

                {/* 5. Notas/POS */}
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs font-black">5</span>
                    <h4 className="text-sm font-black uppercase text-white print:text-black">Notas / Punto de Venta (POS)</h4>
                  </div>
                  <p className="text-xs text-slate-300 print:text-black">
                    <strong>¿Qué hace?:</strong> Emisión inmediata de notas de mostrador y pedidos.
                  </p>
                  <ul className="text-xs text-slate-400 print:text-black list-disc list-inside space-y-0.5">
                    <li>Genera notas con Folio único consecutivo.</li>
                    <li>Maneja modalidades: Venta de Contado, Apartado, Pedido Especial o Crédito.</li>
                    <li>Formato listo para imprimir en ticket o media carta.</li>
                  </ul>
                </div>

                {/* 6. Cobranza y Créditos */}
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs font-black">6</span>
                    <h4 className="text-sm font-black uppercase text-white print:text-black">Cobranza, Créditos y MSI</h4>
                  </div>
                  <p className="text-xs text-slate-300 print:text-black">
                    <strong>¿Qué hace?:</strong> Administración de Cuentas por Cobrar (CxC).
                  </p>
                  <ul className="text-xs text-slate-400 print:text-black list-disc list-inside space-y-0.5">
                    <li>Control de clientes con adeudo y fecha de vencimiento.</li>
                    <li>Registro de abonos parciales con cálculo de saldo restante.</li>
                    <li>Simulador de financiamiento a Meses Sin Intereses (3, 6, 9 y 12 MSI).</li>
                  </ul>
                </div>

                {/* 7. Facturación */}
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs font-black">7</span>
                    <h4 className="text-sm font-black uppercase text-white print:text-black">Facturación Electrónica SAT</h4>
                  </div>
                  <p className="text-xs text-slate-300 print:text-black">
                    <strong>¿Qué hace?:</strong> Emisión de comprobantes fiscales digitales CFDI 4.0.
                  </p>
                  <ul className="text-xs text-slate-400 print:text-black list-disc list-inside space-y-0.5">
                    <li>Validación de RFC y Régimen Fiscal del receptor.</li>
                    <li>Métodos de pago SAT: PUE (Pago en una sola exhibición) o PPD (En parcialidades).</li>
                    <li>Descarga de representación impresa y cadena digital.</li>
                  </ul>
                </div>

                {/* 8. Control Operativo */}
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs font-black">8</span>
                    <h4 className="text-sm font-black uppercase text-white print:text-black">Control Operativo y Auditoría</h4>
                  </div>
                  <p className="text-xs text-slate-300 print:text-black">
                    <strong>¿Qué hace?:</strong> Bitácora en vivo e inalterable de todos los movimientos.
                  </p>
                  <ul className="text-xs text-slate-400 print:text-black list-disc list-inside space-y-0.5">
                    <li>Registra quién hizo qué, a qué hora y en qué sucursal.</li>
                    <li>Alertas automáticas cuando el stock de una llanta baja a 2 o menos piezas.</li>
                    <li>Historial de auditoría para evitar pérdidas o discrepancias.</li>
                  </ul>
                </div>

                {/* 9. Inventario */}
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs font-black">9</span>
                    <h4 className="text-sm font-black uppercase text-white print:text-black">Inventario y Traspasos</h4>
                  </div>
                  <p className="text-xs text-slate-300 print:text-black">
                    <strong>¿Qué hace?:</strong> Administración de existencias físicas entre bodegas.
                  </p>
                  <ul className="text-xs text-slate-400 print:text-black list-disc list-inside space-y-0.5">
                    <li>Visualiza existencias desglosadas por Centro, Norte y Frontera.</li>
                    <li>Función de traspaso rápido: mueve 2 o 4 llantas de una sucursal a otra con un clic.</li>
                    <li>Registro de entrada de nuevos pedidos de fábrica.</li>
                  </ul>
                </div>

                {/* 10. Inteligencia */}
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs font-black">10</span>
                    <h4 className="text-sm font-black uppercase text-white print:text-black">Inteligencia y Diagnóstico</h4>
                  </div>
                  <p className="text-xs text-slate-300 print:text-black">
                    <strong>¿Qué hace?:</strong> Métricas de desgaste predictivo y ventas más demandadas.
                  </p>
                  <ul className="text-xs text-slate-400 print:text-black list-disc list-inside space-y-0.5">
                    <li>Calcula vida útil remanente según kilometraje y milímetros.</li>
                    <li>Identifica las marcas y medidas con mayor rotación en la frontera.</li>
                    <li>Gráficas de desempeño por sucursal.</li>
                  </ul>
                </div>

                {/* 11. Pasarela de Cobro */}
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs font-black">11</span>
                    <h4 className="text-sm font-black uppercase text-white print:text-black">Pasarelas de Pago y Terminales</h4>
                  </div>
                  <p className="text-xs text-slate-300 print:text-black">
                    <strong>¿Qué hace?:</strong> Configuración de cobro con tarjeta, Mercado Pago y terminales Point.
                  </p>
                  <ul className="text-xs text-slate-400 print:text-black list-disc list-inside space-y-0.5">
                    <li>Ingreso seguro de Public Key y Access Token.</li>
                    <li>Cobros con tarjeta de crédito/débito y generación de links de pago.</li>
                    <li>Cálculo transparente de comisiones e IVA.</li>
                  </ul>
                </div>

                {/* 12. Usuarios y Permisos */}
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs font-black">12</span>
                    <h4 className="text-sm font-black uppercase text-white print:text-black">Gestión de Usuarios y Permisos</h4>
                  </div>
                  <p className="text-xs text-slate-300 print:text-black">
                    <strong>¿Qué hace?:</strong> Panel exclusivo de Administrador para altas, bajas y permisos específicos.
                  </p>
                  <ul className="text-xs text-slate-400 print:text-black list-disc list-inside space-y-0.5">
                    <li>Crear usuarios con nombre, clave, rol y sucursal.</li>
                    <li>Asignar qué módulos puede ver cada empleado.</li>
                    <li>Exportar script SQL listo para PostgreSQL/Supabase.</li>
                  </ul>
                </div>

              </div>
            </section>
          )}

          {/* SECTION 4: FAQ Y DUDAS FRECUENTES */}
          {(activeSection === 'todo' || activeSection === 'faq') && (
            <section className="space-y-4 print:break-inside-avoid">
              <div className="flex items-center gap-2.5 pb-2 border-b border-brand-border/60 print:border-black">
                <span className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black text-xs">
                  4
                </span>
                <h2 className="text-xl font-black uppercase text-white print:text-black tracking-wide">
                  Preguntas Frecuentes y Solución Rápida de Dudas
                </h2>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black">
                  <h4 className="text-xs font-black uppercase text-white print:text-black flex items-center gap-2">
                    <HelpCircle size={14} className="text-brand-gold" /> ¿Por qué me pide iniciar sesión de nuevo al cerrar la pestaña?
                  </h4>
                  <p className="text-xs text-slate-300 print:text-black mt-1 leading-relaxed">
                    Es una medida de seguridad empresarial estricta. Si un empleado se retira de la computadora y cierra la ventana, nadie ajeno podrá ver cobros, clientes ni movimientos de caja. Al abrirla nuevamente, solo se ingresa el usuario y contraseña.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black">
                  <h4 className="text-xs font-black uppercase text-white print:text-black flex items-center gap-2">
                    <HelpCircle size={14} className="text-brand-gold" /> ¿Cómo cambio entre sucursal Centro, Norte y Frontera?
                  </h4>
                  <p className="text-xs text-slate-300 print:text-black mt-1 leading-relaxed">
                    En la esquina superior derecha, haga clic en el botón con su nombre y foto de perfil. En el menú desplegable verá los botones "Centro", "Norte" y "Frontera". Al dar clic en cualquiera de ellos, las estadísticas, vehículos en taller y existencias de stock cambiarán inmediatamente a esa ubicación.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black">
                  <h4 className="text-xs font-black uppercase text-white print:text-black flex items-center gap-2">
                    <HelpCircle size={14} className="text-brand-gold" /> ¿Cómo restauro el catálogo de llantas a los valores de fábrica?
                  </h4>
                  <p className="text-xs text-slate-300 print:text-black mt-1 leading-relaxed">
                    En el módulo <strong>"Stock"</strong>, encontrará un botón en la parte superior derecha llamado <em>"Restablecer Stock"</em>. Al pulsarlo, el sistema recargará las llantas originales oficiales (Michelin, Goodyear, Bridgestone, Continental, Pirelli, etc.) con sus precios y medidas exactas.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-brand-matte border border-brand-border/80 print:bg-white print:border-black">
                  <h4 className="text-xs font-black uppercase text-white print:text-black flex items-center gap-2">
                    <HelpCircle size={14} className="text-brand-gold" /> ¿Cómo guardo este manual en un archivo PDF en mi computadora o celular?
                  </h4>
                  <p className="text-xs text-slate-300 print:text-black mt-1 leading-relaxed">
                    Presione el botón dorado <strong>"Imprimir / Guardar en PDF"</strong> ubicado arriba a la derecha en esta misma ventana. En la ventana que aparece, en la opción <em>"Destino"</em> elija <strong>"Guardar como PDF"</strong> y dé clic en <em>Guardar</em>. Tendrá un archivo PDF profesional listo para imprimir o enviar por WhatsApp.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Document Sign-off / Print footer */}
          <div className="pt-6 border-t border-brand-border/60 text-center space-y-1 print:border-black">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 print:text-black">
              Multillantas de la Frontera S.A. de C.V.
            </p>
            <p className="text-[10px] text-slate-500 font-mono print:text-black">
              Documento Oficial de Inducción y Operación • Edición 2026 • Soporte Técnico Especializado
            </p>
          </div>

        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 border-t border-brand-border/60 bg-black/70 flex items-center justify-between text-xs text-slate-400 shrink-0 print:hidden">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Manual Activo y Sincronizado
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-brand-gold text-black font-black uppercase text-xs hover:bg-brand-gold/90 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} /> Imprimir / PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-brand-matte hover:bg-white/10 text-white font-bold transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
