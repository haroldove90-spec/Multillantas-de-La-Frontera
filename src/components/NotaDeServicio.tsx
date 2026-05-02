import React, { useRef, useState } from 'react';
import { 
  Printer, 
  Send, 
  X, 
  ShieldCheck, 
  FileText, 
  MapPin, 
  Phone,
  Calendar,
  Layers,
  Download,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VehicleEntry, Branch } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface OrderItem {
  quantity: number;
  description: string;
  unitPrice: number;
}

interface NotaDeServicioProps {
  vehicle: VehicleEntry;
  onClose: () => void;
  branch: Branch;
}

export const NotaDeServicio: React.FC<NotaDeServicioProps> = ({ vehicle, onClose, branch }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Simulated items based on vehicle reason or general services
  const items: OrderItem[] = [
    { quantity: 4, description: 'Neumáticos NUEVOS ' + vehicle.brand + ' (Standard Kit)', unitPrice: 2850 },
    { quantity: 1, description: 'Servicio de Alineación y Balanceo Premium', unitPrice: 850 },
    { quantity: 4, description: 'Válvulas de Seguridad N2', unitPrice: 150 },
  ];

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  const folio = `NB-${Math.floor(10000 + Math.random() * 90000)}`;
  const date = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    
    try {
      setIsGenerating(true);
      const element = printRef.current.querySelector('.nota-paper') as HTMLElement;
      if (!element) throw new Error('Paper element not found');

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: element.offsetWidth,
        height: element.offsetHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.nota-paper') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.background = 'white';
            // Force specific HEX colors during capture to avoid oklch parsing errors in html2canvas
            clonedElement.querySelectorAll('*').forEach((node) => {
              const el = node as HTMLElement;
              if (el.classList.contains('text-brand-red')) el.style.color = '#E30613';
              if (el.classList.contains('text-brand-blue')) el.style.color = '#0055b8';
              if (el.classList.contains('text-brand-gold')) el.style.color = '#D4AF37';
              if (el.classList.contains('text-slate-900')) el.style.color = '#000000';
              if (el.classList.contains('text-slate-500')) el.style.color = '#64748b';
              if (el.classList.contains('bg-slate-50')) el.style.backgroundColor = '#f8fafc';
              if (el.classList.contains('bg-blue-50')) el.style.backgroundColor = '#eff6ff';
            });
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Nota_Multillantas_${folio}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error técnico al generar PDF. Use el botón de "Imprimir" y seleccione "Guardar como PDF".');
    } finally {
      setIsGenerating(false);
    }
  };

  const shareWhatsApp = () => {
    const text = `*MULTILLANTAS PRO - NOTA DE SERVICIO*\n\nFolio: ${folio}\nCliente: ${vehicle.plate}\nVehículo: ${vehicle.brand} ${vehicle.model}\nTotal: $${total.toLocaleString()} MXN\n\nGracias por su preferencia.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-brand-matte border border-brand-border w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[95vh] relative nota-modal-container"
    >
      {/* Sticky Header for Actions */}
      <div className="p-4 md:p-6 border-b border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-brand-matte sticky top-0 z-20 print:hidden shrink-0">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 shrink-0">
            <FileText size={20} />
          </div>
          <div className="overflow-hidden">
            <h3 className="text-base sm:text-lg font-black italic uppercase text-white leading-none truncate">Nota de <span className="text-[#D4AF37]">Salida</span></h3>
            <p className="text-[7px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 truncate">Generación de Comprobante Final</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <button 
            onClick={shareWhatsApp}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg"
          >
            <Send size={14} /> <span className="hidden xs:inline">WhatsApp</span>
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[#0055b8] hover:bg-[#0055b8]/90 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} <span className="hidden xs:inline">PDF</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white hover:bg-slate-100 text-black text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg"
          >
            <Printer size={14} /> <span className="hidden xs:inline">Imprimir</span>
          </button>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white rounded-full transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Nota Content (The Paper) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 bg-white print:p-0 print:overflow-visible custom-scrollbar" id="nota-print-area" ref={printRef}>
        <div className="nota-paper max-w-[800px] mx-auto text-slate-900 font-sans print:max-w-full print:text-black bg-white">
          
          {/* Header Format */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-8 mb-8">
            <div className="space-y-4 w-full sm:w-auto">
              <img src="https://appdesign.appdesignproyectos.com/multillantas.png" alt="Logo" className="h-12 sm:h-16 w-auto object-contain mx-auto sm:mx-0" />
              <div className="space-y-1 text-center sm:text-left">
                <h1 className="text-lg sm:text-xl font-black uppercase tracking-tighter text-slate-900 print:text-black">Multillantas de la Frontera</h1>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase flex items-center justify-center sm:justify-start gap-2 print:text-black">
                  <MapPin size={10} className="text-brand-red print:text-black" /> Sucursal {branch} • {branch === 'Frontera' ? 'Av. Tecnológico 120' : 'Eje Central 450'}
                </p>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase flex items-center justify-center sm:justify-start gap-2 print:text-black">
                  <Phone size={10} className="text-brand-red print:text-black" /> 800-TYRE-PRO • www.multillantas.mx
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto text-center sm:text-right space-y-2 bg-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 min-w-full sm:min-w-[220px] print:bg-white print:border-black">
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest print:text-black">Folio de Servicio</p>
              <p className="text-xl sm:text-2xl font-black text-brand-red italic print:text-black">{folio}</p>
              <div className="h-px bg-slate-200 my-2 print:bg-black" />
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-600 flex items-center justify-center sm:justify-end gap-2 print:text-black">
                <Calendar size={12} /> {date}
              </p>
            </div>
          </div>

          {/* Customer & Vehicle Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 bg-slate-50 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 print:bg-white print:border-black print:rounded-none">
            <div className="col-span-2 space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest print:text-black">Cliente / Razón Social</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 print:text-black">PUBLICO EN GENERAL</p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest print:text-black">Placas</p>
              <p className="text-xs sm:text-sm font-black text-brand-blue uppercase print:text-black">{vehicle.plate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest print:text-black">Kilometraje</p>
              <p className="font-mono text-xs sm:text-sm font-bold text-slate-800 print:text-black">42,550 KM</p>
            </div>
            <div className="col-span-2 space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest print:text-black">Vehículo</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 uppercase print:text-black">{vehicle.brand} {vehicle.model}</p>
            </div>
            <div className="col-span-2 space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest print:text-black">Motivo de Ingreso</p>
              <p className="text-xs sm:text-sm font-medium text-slate-600 print:text-black">{vehicle.reason}</p>
            </div>
          </div>

          {/* Service Table */}
          <div className="overflow-x-auto -mx-4 sm:mx-0 mb-8 custom-scrollbar-horizontal">
            <div className="min-w-[600px] px-4 sm:px-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-900 print:border-black">
                    <th className="text-left py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 print:text-black">Cant.</th>
                    <th className="text-left py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 print:text-black">Descripción</th>
                    <th className="text-right py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 print:text-black">Unitario</th>
                    <th className="text-right py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 print:text-black">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-black/10">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-4 font-mono text-xs font-bold text-slate-500 print:text-black">{item.quantity}</td>
                      <td className="py-4">
                        <p className="text-xs font-bold text-slate-800 uppercase print:text-black">{item.description}</p>
                      </td>
                      <td className="py-4 text-right font-mono text-xs text-slate-600 print:text-black">${item.unitPrice.toLocaleString()}</td>
                      <td className="py-4 text-right font-mono text-xs font-black text-slate-900 print:text-black">${(item.quantity * item.unitPrice).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex flex-col md:flex-row justify-between gap-8 sm:gap-12 mb-10">
            <div className="flex-1 space-y-4">
              <div className="bg-blue-50 p-4 sm:p-6 rounded-2xl border border-blue-100 print:bg-white print:border-black">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 print:text-black mb-3">
                  <ShieldCheck size={14} /> Póliza de Garantía Multillantas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[9px] text-blue-900 font-medium leading-tight print:text-black">
                  <div className="space-y-1">
                    <p className="font-black text-blue-700 print:text-black uppercase">Llantas Nuevas:</p>
                    <p>• Garantía de 1 año contra defectos de fábrica.</p>
                    <p>• 6 meses contra daños accidentales (Goodyear).</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-blue-700 print:text-black uppercase">Llantas Usadas:</p>
                    <p>• 15 días de garantía solo por bolas o fugas.</p>
                    <p>• No aplica en golpes después de la salida.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 print:text-black">
                <span className="uppercase tracking-widest">Subtotal</span>
                <span className="font-mono">${subtotal.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 print:text-black">
                <span className="uppercase tracking-widest">I.V.A (16%)</span>
                <span className="font-mono">${iva.toLocaleString()}.20</span>
              </div>
              <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center print:border-black">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 print:text-black">Total MXN</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 italic print:text-black">${total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* New Multi-Signature Area */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 mb-10">
            <div className="text-center space-y-3">
              <div className="h-10 sm:h-16 flex items-end justify-center">
                <div className="h-px bg-slate-300 w-full print:bg-black" />
              </div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest print:text-black">Vendedor</p>
            </div>
            <div className="text-center space-y-3">
              <div className="h-10 sm:h-16 flex items-end justify-center">
                <div className="h-px bg-slate-300 w-full print:bg-black" />
              </div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest print:text-black">Técnico / Diagnóstico</p>
            </div>
            <div className="text-center space-y-3">
              <div className="h-10 sm:h-16 flex items-end justify-center">
                <div className="h-px bg-slate-300 w-full print:bg-black" />
              </div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest print:text-black">Instalador / Firma Cliente</p>
            </div>
          </div>


          {/* Paper Footer */}
          <div className="mt-8 pt-8 border-t border-slate-100 text-center print:border-black">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.4em] print:text-black mb-1">Calidad • Seguridad • Confianza</p>
            <p className="text-[10px] font-black text-brand-red uppercase tracking-widest print:text-black">
              Gracias por su preferencia - Multillantas de la Frontera - Sucursal {branch}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 0;
          }
          
          body, html {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          #root > *:not(.nota-modal-container) {
            display: none !important;
          }
          
          .nota-modal-container {
            position: relative !important;
            z-index: 9999999 !important;
            display: block !important;
            background: white !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          #nota-print-area {
            position: relative !important;
            width: 100% !important;
            height: auto !important;
            padding: 1.5cm !important;
            background: white !important;
            overflow: visible !important;
            display: block !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          .nota-paper {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            background: white !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color: black !important;
            font-family: Arial, sans-serif !important;
          }
          
          .text-brand-red { color: #E30613 !important; }
          .text-brand-blue { color: #0055b8 !important; }
          .bg-slate-50, .bg-blue-50 {
            background-color: #f8fafc !important;
          }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }

        @media (max-width: 480px) {
          .xs\:inline { display: inline; }
          .hidden.xs\:inline { display: none; }
        }
      `}</style>
    </motion.div>
  );
};

