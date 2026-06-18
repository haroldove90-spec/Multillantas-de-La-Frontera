import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Key, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Sparkles,
  Save,
  RefreshCw,
  Copy,
  Check,
  Building,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MercadoPagoConfig } from '../types';
import { getMercadoPagoConfig, saveMercadoPagoConfig, addAuditLog } from '../utils/persistentStorage';

export const PlataformaCobroPanel: React.FC = () => {
  const [config, setConfig] = useState<MercadoPagoConfig>(() => getMercadoPagoConfig());
  const [isSaved, setIsSaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  // Sync state with other tabs or changes
  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getMercadoPagoConfig());
    };
    window.addEventListener('multillantas_state_update', handleUpdate);
    return () => window.removeEventListener('multillantas_state_update', handleUpdate);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMercadoPagoConfig(config);
    
    // Add audit log for saving gateway configuration
    const statusText = config.isActive ? 'Activada' : 'Guardada/Inactiva';
    const modeText = config.isSandbox ? 'Pruebas (Sandbox)' : 'Producción Real';
    
    addAuditLog(
      'Administrador',
      'Configuración Pago',
      'MercadoPago',
      'MP-GATEWAY',
      'Frontera',
      `Pasarela de Cobros Mercado Pago actualizada. Estado: ${statusText}, Modo: ${modeText}.`
    );

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 4000);
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTesting(false);
      
      if (!config.publicKey || !config.accessToken) {
        setTestResult({
          success: false,
          message: 'Error de validación: Ambas credenciales (Public Key y Access Token) son requeridas antes de realizar la prueba.'
        });
        return;
      }

      const pkValid = config.publicKey.startsWith('APP_USR-') || config.publicKey.startsWith('TEST-');
      const tokenValid = config.accessToken.startsWith('APP_USR-') || config.accessToken.startsWith('TEST-');

      if (!pkValid && !tokenValid) {
        setTestResult({
          success: false,
          message: 'Advertencia: Las credenciales parecen no tener el formato correcto de Mercado Pago (ej. APP_USR-... o TEST-...). Favor de verificarlas.'
        });
      } else {
        const isProdConfig = config.publicKey.startsWith('APP_USR-');
        setTestResult({
          success: true,
          message: `¡Conexión establecida con éxito! Credenciales correspondientes a ${isProdConfig ? 'Producción Oficial' : 'Sandbox (Modo Prueba)'}. Listo para recibir pagos online de inmediato.`
        });
      }
    }, 1200);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(index);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8 pb-16 text-white"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-black via-[#080808] to-black border border-brand-border/60 rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-gold/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-brand-red text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                MÓDULO ADMINISTRADOR
              </span>
              {config.isActive ? (
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ACTIVO ONLINE
                </span>
              ) : (
                <span className="bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                  ⚠️ REQUIERE CREDENCIALES
                </span>
              )}
            </div>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase whitespace-normal">
              PLATAFORMA DE <span className="text-brand-red">COBRO</span>
            </h2>
            <p className="text-slate-400 text-xs max-w-xl">
              Configura tu pasarela de pagos oficial integrada directamente con <strong className="text-brand-gold">Mercado Pago</strong>. Al activar tus llaves privadas, la tienda de comercio electrónico se sincroniza y configura de manera automática para recibir compras y pagos con tarjeta de crédito, débito o meses sin intereses.
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center bg-black/50 border border-brand-border/40 p-6 rounded-2xl md:w-64 shrink-0 shadow-xl backdrop-blur-md">
            <span className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-3">CONECTOR OFICIAL</span>
            <img 
              src="https://vectorseek.com/wp-content/uploads/2023/08/Mercado-Pago-Logo-Vector.svg-1-1.png" 
              alt="Mercado Pago" 
              className="h-10 object-contain filter drop-shadow-[0_0_10px_rgba(0,186,242,0.3)]"
            />
            <div className="mt-4 text-center">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">API Integrada v2.0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-brand-matte border border-brand-border rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="border-b border-brand-border/60 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
                  <Key size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">VINCULACIÓN DE CREDENCIALES</h3>
                  <p className="text-[10px] text-slate-500">Inserta tus claves privadas del panel de Mercado Pago</p>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Estado</span>
                <span className={`text-[11px] font-black uppercase tracking-widest ${config.isActive ? 'text-emerald-400' : 'text-brand-red'}`}>
                  {config.isActive ? '● En Línea' : '○ Desactivado'}
                </span>
              </div>
            </div>

            {/* Config Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                  <Building size={12} className="text-brand-gold" /> Nombre de Comercio (Visible en el Recibo)
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ej. Multillantas de la Frontera"
                  value={config.businessName}
                  onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                  className="w-full bg-[#030303] border border-brand-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-gold text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
                  <Key size={12} className="text-brand-red" /> Clave Pública (Public Key)
                </label>
                <div className="text-[10px] text-slate-500 mb-2">Comienza típicamente con <code className="text-brand-gold font-mono font-bold">APP_USR-</code> o <code className="text-brand-gold font-mono font-bold">TEST-</code></div>
                <input 
                  type="password"
                  required
                  placeholder="Ej. APP_USR-c4b8-8bb5-..."
                  value={config.publicKey}
                  onChange={(e) => setConfig({ ...config, publicKey: e.target.value.trim() })}
                  className="w-full bg-[#030303] border border-brand-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-red text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
                  <Key size={12} className="text-brand-red" /> Token de Acceso (Access Token)
                </label>
                <div className="text-[10px] text-slate-500 mb-2">Llave de seguridad secreta que procesa las transacciones de forma encriptada</div>
                <input 
                  type="password"
                  required
                  placeholder="Ej. APP_USR-845620935874..."
                  value={config.accessToken}
                  onChange={(e) => setConfig({ ...config, accessToken: e.target.value.trim() })}
                  className="w-full bg-[#030303] border border-brand-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-red text-white font-mono"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#030303] border border-brand-border/40 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-300">MODO SANDBOX (PRUEBAS)</span>
                    <span className="text-[9px] text-slate-500">Simula cobros sin dinero real para capacitación</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, isSandbox: !config.isSandbox })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${config.isSandbox ? 'bg-brand-gold' : 'bg-slate-700'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${config.isSandbox ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>

                <div className="bg-[#030303] border border-brand-border/40 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-400">ACTIVAR INTEGRACIÓN</span>
                    <span className="text-[9px] text-slate-500">Habilitar Mercado Pago en el Catálogo Online</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, isActive: !config.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${config.isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${config.isActive ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>

              {/* Advanced Months Interest-Free Setting */}
              <div className="border-t border-brand-border/40 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-brand-gold">OFRECER MESES SIN INTERESES (MSI)</span>
                    <p className="text-[9px] text-slate-500">Muestra y activa automáticamente 3, 6, 9 o 12 MSI configurados en tu panel de Mercado Pago.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, allowMsi: !config.allowMsi })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${config.allowMsi ? 'bg-brand-gold' : 'bg-slate-700'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${config.allowMsi ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>

                {config.allowMsi && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                        Monto Mínimo de Pedido para MSI ($ MXN)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-[10px] font-bold">
                          $
                        </span>
                        <input 
                          type="number"
                          value={config.minMsiAmount || 1000}
                          onChange={(e) => setConfig({ ...config, minMsiAmount: Number(e.target.value) })}
                          className="w-full bg-[#030303] border border-brand-border rounded-xl pl-8 pr-4 py-2 text-xs focus:outline-none focus:border-brand-gold text-white font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-[10px] text-slate-400 bg-brand-gold/5 border border-brand-gold/10 p-3 rounded-xl">
                        💡 <strong>Sugerencia:</strong> Se aconseja $1,000.00 MXN para incentivar mayores volúmenes de compra de rines o paquetes de llantas premium.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Test Connection Display */}
            <AnimatePresence mode="wait">
              {testResult && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
                    testResult.success 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                      : 'bg-brand-red/10 border-brand-red/30 text-brand-red/90'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {testResult.success ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                  </div>
                  <div>
                    <span className="block font-black uppercase tracking-wider mb-1">
                      {testResult.success ? 'CONEXIÓN VALIDADA' : 'CONEXIÓN FALLIDA / ALERTA'}
                    </span>
                    <p>{testResult.message}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error notifications or Save State Notifications */}
            <AnimatePresence>
              {isSaved && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-brand-gold text-black p-4 rounded-xl flex items-center justify-between font-black uppercase text-[10px] tracking-widest shadow-xl shadow-brand-gold/20"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} /> ¡Configuración guardada y vinculada a la pasarela!
                  </span>
                  <span className="bg-black/20 text-black px-2 py-0.5 rounded text-[8px]">SINCED</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-brand-border/40 pt-4">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="w-full bg-[#0c0c0c] hover:bg-[#121212] border border-slate-700/60 transition-all text-white px-5 py-3.5 rounded-xl uppercase font-black text-[10px] tracking-widest flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} className={isTesting ? 'animate-spin' : ''} />
                {isTesting ? 'Validando Claves...' : 'Probar Conexión'}
              </button>
              
              <button
                type="submit"
                className="w-full bg-brand-red hover:bg-brand-red/90 text-white transition-all px-5 py-3.5 rounded-xl uppercase font-black text-[10px] tracking-widest shadow-lg shadow-brand-red/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <Save size={14} /> Guardar y Vincular
              </button>
            </div>
          </form>
        </div>

        {/* Documentation step by step */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-brand-matte border border-brand-border rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-brand-border/60 pb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-blue/10 border border-brand-blue/30 flex items-center justify-center text-brand-blue">
                <HelpCircle size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">GUÍA PASO A PASO</h3>
                <p className="text-[10px] text-slate-500">Consigue tus claves de Mercado Pago en 5 minutos</p>
              </div>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-y-3 before:left-[15px] before:w-0.5 before:bg-brand-border/50">
              
              {/* Step 1 */}
              <div className="flex gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-black border-2 border-brand-gold text-brand-gold flex items-center justify-center text-xs font-black shrink-0 relative z-10 shadow-md">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase text-slate-200">Accede a Developers</h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Inicia sesión en tu cuenta de <strong className="text-brand-gold">Mercado Pago</strong> o ve directamente al portal de desarrolladores:
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <a 
                      href="https://developers.mercadopago.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] text-brand-blue hover:underline bg-brand-blue/5 border border-brand-blue/20 px-2.5 py-1 rounded inline-block font-mono tracking-tighter"
                    >
                      developers.mercadopago.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-black border-2 border-slate-700 text-slate-400 flex items-center justify-center text-xs font-black shrink-0 relative z-10">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase text-slate-200">Crea tu Aplicación</h4>
                  <p className="text-[11px] text-slate-400">
                    En el panel superior izquierdo, ingresa a la pestaña <span className="bg-[#030303] border border-brand-border text-slate-300 px-1 py-0.5 rounded font-bold text-[10px]">Tus Integraciones</span>. Haz clic en "Crear Aplicación" y asígnale un nombre para reconocerla (ej. "Multillantas E-Commerce").
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-black border-2 border-slate-700 text-slate-400 flex items-center justify-center text-xs font-black shrink-0 relative z-10">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase text-slate-200">Menú "Credenciales"</h4>
                  <p className="text-[11px] text-slate-400">
                    Una vez creada tu aplicación, busca en la barra lateral el menú llamado <strong className="text-brand-gold">Credenciales de producción</strong> para procesar dinero real, o <strong className="text-brand-gold">Credenciales de prueba</strong> para realizar pruebas en Sandbox.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-black border-2 border-brand-red text-brand-red flex items-center justify-center text-xs font-black shrink-0 relative z-10 shadow-md">
                  4
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase text-slate-200">Copia "Public Key"</h4>
                  <p className="text-[11px] text-slate-400">
                    Copia la clave pública de tu cuenta de Mercado Pago y pégala en el primer recuadro del formulario de la izquierda.
                  </p>
                  <div className="pt-2">
                    <button 
                      type="button"
                      onClick={() => copyToClipboard('TEST-PUBLIC-KEY-EXAMPLE-1234', 4)}
                      className="bg-[#030303] hover:bg-black border border-brand-border px-2.5 py-1.5 rounded-lg text-[9px] font-mono text-slate-400 flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      {copiedStep === 4 ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      Copiar Formato Test Pública
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-black border-2 border-brand-red text-brand-red flex items-center justify-center text-xs font-black shrink-0 relative z-10 shadow-md">
                  5
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase text-slate-200">Copia "Access Token"</h4>
                  <p className="text-[11px] text-slate-400">
                    Copia la clave de token de acceso secreta (Access Token) y pégala en el segundo campo. ¡Guarda los cambios y tu ecommerce comenzará a procesar cobros de forma automatizada y sincronizada!
                  </p>
                  <div className="pt-2">
                    <button 
                      type="button"
                      onClick={() => copyToClipboard('TEST-ACCESS-TOKEN-EXAMPLE-84758', 5)}
                      className="bg-[#030303] hover:bg-black border border-brand-border px-2.5 py-1.5 rounded-lg text-[9px] font-mono text-slate-400 flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      {copiedStep === 5 ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      Copiar Formato Test Token
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-black/40 border border-brand-border p-6 rounded-3xl space-y-3">
            <h4 className="text-xs font-black uppercase text-brand-gold flex items-center gap-2">
              <ShieldAlert size={14} /> SEGURIDAD MERCADO PAGO PCI-DSS
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tus llaves privadas se configuran localmente de manera segura en tu navegador. Toda transacción realizada por el cliente cuenta con encriptación SSL, impidiendo que los datos de las tarjetas sean capturados o comprometidos, cumpliendo rigurosamente con los estándares bancarios PCI de seguridad en México.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
