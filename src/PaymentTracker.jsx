






import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  HiCreditCard, 
  HiLightningBolt, 
  HiOutlineCash, 
  HiTrash, 
  HiDownload, 
  HiDocumentDownload, 
  HiRefresh, 
  HiPlusCircle,
  HiFilm,
  HiMap,
  HiFire,
  HiQuestionMarkCircle,
  HiChevronDown,
  HiCheckCircle,
  HiExclamation,
  HiX
} from 'react-icons/hi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * CustomSelect Component
 * A premium, reactive dropdown replacement
 */
const CustomSelect = ({ label, icon: Icon, value, options, onChange, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="space-y-3 relative" ref={containerRef}>
      <label className="text-[10px] font-black uppercase text-neutral-600 tracking-widest flex items-center gap-2">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black border-2 border-neutral-900 rounded-2xl px-6 py-4 flex items-center justify-between hover:border-neutral-700 transition-all focus:border-paymentCard outline-none"
      >
        <span className="font-bold text-sm flex items-center gap-3">
          {selectedOption.icon && <selectedOption.icon className="w-4 h-4 text-neutral-400" />}
          {selectedOption.label}
        </span>
        <HiChevronDown className={`w-5 h-5 text-neutral-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-2 bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange({ target: { name, value: opt.value } });
                  setIsOpen(false);
                }}
                className={`w-full px-6 py-4 text-left hover:bg-neutral-900 transition-colors flex items-center justify-between group ${value === opt.value ? 'bg-neutral-900' : ''}`}
              >
                <span className="font-bold text-sm flex items-center gap-3">
                  {opt.icon && <opt.icon className={`w-4 h-4 ${value === opt.value ? 'text-paymentCard' : 'text-neutral-500 group-hover:text-neutral-300'}`} />}
                  {opt.label}
                </span>
                {value === opt.value && <HiCheckCircle className="w-4 h-4 text-paymentCard" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * CustomAlert Component
 * A polished replacement for browser native alerts
 */
const CustomAlert = ({ isOpen, type, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const isConfirm = !!onCancel;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel || onConfirm} />
      <div className="relative bg-neutral-950 border border-neutral-800 rounded-3xl p-8 max-w-sm w-full shadow-3xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-paymentCard/10 text-paymentCard'}`}>
            {type === 'error' ? <HiExclamation className="w-8 h-8" /> : <HiCheckCircle className="w-8 h-8" />}
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{title}</h3>
            <p className="text-neutral-500 text-sm font-medium leading-relaxed">{message}</p>
          </div>
          <div className="flex gap-3 w-full">
            {isConfirm && (
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-4 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-black uppercase text-[10px] tracking-widest hover:bg-neutral-800 transition-all"
              >
                Cancel
              </button>
            )}
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-4 rounded-xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-neutral-200 transition-all"
            >
              {isConfirm ? 'Confirm' : 'Got it'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentTracker = () => {
  // --- State ---
  const [payments, setPayments] = useState([]);
  const [formData, setFormData] = useState({
    mode: 'upi',
    amount: '',
    datetime: '',
    category: 'Movie',
    customCategory: ''
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null, onCancel: null });

  // --- Effects ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem('payments_v1');
      if (saved) setPayments(JSON.parse(saved));
    } catch (error) {
      console.error('Persistence error:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('payments_v1', JSON.stringify(payments));
    }
  }, [payments, isLoaded]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showAlert = (title, message, type = 'info') => {
    setAlertConfig({
      isOpen: true,
      type,
      title,
      message,
      onConfirm: () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
    });
  };

  const showConfirm = (title, message, onConfirm) => {
    setAlertConfig({
      isOpen: true,
      type: 'info',
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
    });
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    
    const amountNum = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amountNum) || amountNum <= 0) {
      showAlert('Invalid Amount', 'Please enter a valid amount greater than zero.', 'error');
      return;
    }

    const finalCategory = formData.category === 'Others' 
      ? (formData.customCategory || 'Miscellaneous') 
      : formData.category;

    const newPayment = {
      id: Date.now().toString(),
      mode: formData.mode,
      amount: amountNum,
      category: finalCategory,
      datetime: formData.datetime || new Date().toISOString()
    };

    setPayments(prev => [newPayment, ...prev]);
    setFormData(prev => ({
      ...prev,
      amount: '',
      datetime: '',
      customCategory: ''
    }));
  };

  const handleDelete = (id) => {
    showConfirm('Confirm Delete', 'Are you sure you want to permanently delete this transaction?', () => {
      setPayments(prev => prev.filter(p => p.id !== id));
    });
  };

  const handleClearAll = () => {
    showConfirm('Clear Ledger', 'Are you sure you want to wipe all transaction history?', () => {
      setPayments([]);
      localStorage.removeItem('payments_v1');
    });
  };

  // --- Calculations ---
  const stats = useMemo(() => {
    const total = payments.reduce((acc, p) => acc + p.amount, 0);
    const byMode = {
      upi: payments.filter(p => p.mode === 'upi').reduce((acc, p) => acc + p.amount, 0),
      card: payments.filter(p => p.mode === 'card').reduce((acc, p) => acc + p.amount, 0),
      cash: payments.filter(p => p.mode === 'cash').reduce((acc, p) => acc + p.amount, 0),
    };
    return { total, byMode };
  }, [payments]);

  // --- Export Logic ---
  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.text('SIMPLE PAYMENTS LEDGER', 14, 20);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
      
      const body = payments.map((p, i) => [
        i + 1,
        p.category || 'Other',
        p.mode.toUpperCase(),
        `INR ${p.amount.toFixed(2)}`,
        new Date(p.datetime).toLocaleString()
      ]);

      // Add Total Row to Body for PDF
      body.push([
        { content: 'TOTAL', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: `INR ${stats.total.toFixed(2)}`, styles: { fontStyle: 'bold' } },
        ''
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['#', 'Category', 'Method', 'Value', 'Timeline']],
        body: body,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 9 }
      });

      doc.save(`Simple_Payments_${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF Export Failed:', err);
      showAlert('Export Error', 'Failed to generate PDF report.', 'error');
    }
  };

  const exportExcel = () => {
    const data = payments.map((p, i) => ({
      ID: i + 1,
      Category: p.category || 'Other',
      Method: p.mode.toUpperCase(),
      "Value (INR)": p.amount,
      Timeline: new Date(p.datetime).toLocaleString()
    }));
    
    // Add Total Row to Excel Data
    data.push({
      ID: '',
      Category: 'TOTAL',
      Method: '',
      "Value (INR)": stats.total,
      Timeline: ''
    });

    const ws = XLSX.utils.json_to_sheet(data);
    
    // Professional column widths
    ws['!cols'] = [
      { wch: 5 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 25 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `Simple_Payments_${Date.now()}.xlsx`);
  };

  // --- UI Helpers ---
  const getCatIcon = (cat) => {
    const low = (cat || 'Others').toLowerCase();
    if (low.includes('movie')) return <HiFilm className="w-4 h-4" />;
    if (low.includes('outing')) return <HiMap className="w-4 h-4" />;
    if (low.includes('fuel')) return <HiFire className="w-4 h-4" />;
    return <HiQuestionMarkCircle className="w-4 h-4" />;
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'upi': return <HiLightningBolt className="w-4 h-4" />;
      case 'card': return <HiCreditCard className="w-4 h-4" />;
      case 'cash': return <HiOutlineCash className="w-4 h-4" />;
      default: return null;
    }
  };

  const modeOptions = [
    { value: 'upi', label: 'UPI Realtime', icon: HiLightningBolt },
    { value: 'card', label: 'Card Terminal', icon: HiCreditCard },
    { value: 'cash', label: 'Liquid Cash', icon: HiOutlineCash },
  ];

  const categoryOptions = [
    { value: 'Movie', label: 'Movie & Cinema', icon: HiFilm },
    { value: 'Outing', label: 'Travel & Outing', icon: HiMap },
    { value: 'Fuel', label: 'Fuel & Gas', icon: HiFire },
    { value: 'Others', label: 'Custom Category', icon: HiQuestionMarkCircle },
  ];

  const badgeStyles = {
    upi: 'bg-paymentUpi/20 text-paymentUpi border-paymentUpi/30',
    card: 'bg-paymentCard/20 text-paymentCard border-paymentCard/30',
    cash: 'bg-paymentCash/20 text-paymentCash border-paymentCash/30',
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 font-sans selection:bg-paymentCard p-4 md:p-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <CustomAlert {...alertConfig} />

      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Nav */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-900 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black shadow-xl">
              <HiPlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight uppercase text-white">Simple Payments</h1>
              <p className="text-neutral-600 text-[10px] font-bold tracking-[0.2em] uppercase">Private • Secure • Global</p>
            </div>
          </div>
          <div className="flex gap-3">
            {payments.length > 0 && (
              <>
                <button onClick={exportPDF} className="group flex items-center gap-3 px-5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-paymentCard transition-all shadow-sm">
                  <HiDocumentDownload className="w-5 h-5 text-paymentCard group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-widest">Generate PDF</span>
                </button>
                <button onClick={exportExcel} className="group flex items-center gap-3 px-5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-paymentUpi transition-all shadow-sm">
                  <HiDownload className="w-5 h-5 text-paymentUpi group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-widest">Extract XL</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Global Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Volume', val: stats.total, color: 'text-white' },
            { label: 'UPI Total', val: stats.byMode.upi, color: 'text-paymentUpi' },
            { label: 'Card Total', val: stats.byMode.card, color: 'text-paymentCard' },
            { label: 'Cash Total', val: stats.byMode.cash, color: 'text-paymentCash' },
          ].map((s, i) => (
            <div key={i} className="bg-neutral-950 border border-neutral-900 p-6 rounded-3xl animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: `${i*100}ms` }}>
              <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${s.color} opacity-40 mb-3`}>{s.label}</p>
              <p className={`text-2xl font-black tabular-nums ${s.color} tracking-tight`}>
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(s.val)}
              </p>
            </div>
          ))}
        </section>

        {/* Form Container */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-[2.5rem] p-8 md:p-10 shadow-3xl overflow-visible">
          <form onSubmit={handleAddPayment} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-end">
            
            <CustomSelect
              label="Settlement Method"
              icon={HiRefresh}
              name="mode"
              value={formData.mode}
              options={modeOptions}
              onChange={handleInputChange}
            />

            <CustomSelect
              label="Transaction Category"
              icon={HiFilm}
              name="category"
              value={formData.category}
              options={categoryOptions}
              onChange={handleInputChange}
            />

            {formData.category === 'Others' ? (
              <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                <label className="text-[10px] font-black uppercase text-neutral-600 tracking-widest underline decoration-paymentCash">Define Category</label>
                <input name="customCategory" type="text" value={formData.customCategory} onChange={handleInputChange} placeholder="e.g. Rent" className="w-full bg-black border-2 border-neutral-900 rounded-2xl px-6 py-4 focus:border-paymentCard transition-all font-bold text-sm outline-none" />
              </div>
            ) : (
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-neutral-600 tracking-widest">Amount (INR)</label>
                <input name="amount" type="number" step="0.01" value={formData.amount} onChange={handleInputChange} placeholder="0.00" className="w-full bg-black border-2 border-neutral-900 rounded-2xl px-6 py-4 focus:border-paymentCard transition-all font-mono text-lg font-black outline-none" required />
              </div>
            )}

            {formData.category === 'Others' ? (
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-neutral-600 tracking-widest">Amount (INR)</label>
                <input name="amount" type="number" step="0.01" value={formData.amount} onChange={handleInputChange} placeholder="0.00" className="w-full bg-black border-2 border-neutral-900 rounded-2xl px-6 py-4 focus:border-paymentCard transition-all font-mono text-lg font-black outline-none" required />
              </div>
            ) : (
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-neutral-600 tracking-widest">Occurrence Date</label>
                <input name="datetime" type="datetime-local" value={formData.datetime} onChange={handleInputChange} className="w-full bg-black border-2 border-neutral-900 rounded-2xl px-6 py-4 focus:border-paymentCard transition-all [color-scheme:dark] font-bold text-sm outline-none" />
              </div>
            )}

            {formData.category === 'Others' && (
               <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase text-neutral-600 tracking-widest">Occurrence Date</label>
                 <input name="datetime" type="datetime-local" value={formData.datetime} onChange={handleInputChange} className="w-full bg-black border-2 border-neutral-900 rounded-2xl px-6 py-4 focus:border-paymentCard transition-all [color-scheme:dark] font-bold text-sm outline-none" />
               </div>
            )}

            <div className={`lg:col-span-1 ${formData.category === 'Others' ? 'lg:col-start-5' : ''}`}>
              <button type="submit" className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-neutral-200 transition-all transform active:scale-95 shadow-xl flex items-center justify-center gap-3">
                <HiPlusCircle className="w-6 h-6" /> 
                <span className="uppercase tracking-[0.1em]">Commit</span>
              </button>
            </div>
          </form>
        </div>

        {/* Ledger List */}
        <section className="bg-neutral-950 border border-neutral-900 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-1000">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-neutral-900/30 border-b border-neutral-900">
                  <th className="px-4 md:px-10 py-6 text-[10px] font-black uppercase text-neutral-600 tracking-[0.3em] text-center w-20">Seq</th>
                  <th className="px-4 md:px-10 py-6 text-[10px] font-black uppercase text-neutral-600 tracking-[0.3em]">Identity</th>
                  <th className="px-4 md:px-10 py-6 text-[10px] font-black uppercase text-neutral-600 tracking-[0.3em]">Valuation</th>
                  <th className="px-4 md:px-10 py-6 text-[10px] font-black uppercase text-neutral-600 tracking-[0.3em]">Timeline</th>
                  <th className="px-4 md:px-10 py-6 text-[10px] font-black uppercase text-neutral-600 tracking-[0.3em] text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900/50">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-10 py-32 text-center text-neutral-700 font-bold uppercase tracking-widest text-xs opacity-50">Empty Ledger History</td>
                  </tr>
                ) : (
                  <>
                    {payments.map((p, i) => (
                      <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 md:px-10 py-6 md:py-8 text-neutral-100 text-[10px] font-mono font-black text-center opacity-30 group-hover:opacity-100 transition-opacity">
                          {String(i + 1).padStart(2, '0')}
                        </td>
                        <td className="px-4 md:px-10 py-6 md:py-8">
                          <div className="flex flex-col gap-3">
                            <span className="flex items-center gap-2 text-white font-black uppercase text-xs tracking-wider">
                              {getCatIcon(p.category)} {p.category || 'Legacy Entry'}
                            </span>
                            <span className={`w-fit inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest ${badgeStyles[p.mode]}`}>
                              {getModeIcon(p.mode)} {p.mode}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 md:px-10 py-6 md:py-8">
                          <span className="text-2xl font-black text-white tabular-nums tracking-tighter">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p.amount)}
                          </span>
                        </td>
                        <td className="px-4 md:px-10 py-6 md:py-8">
                          <div className="flex flex-col gap-1">
                            <span className="text-neutral-100 font-black text-sm uppercase tracking-tighter">
                              {new Date(p.datetime).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                            <span className="text-neutral-600 text-[10px] font-bold uppercase tracking-widest">
                              {new Date(p.datetime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 md:px-10 py-6 md:py-8 text-right">
                          <div className="relative inline-block group/tip">
                            <button onClick={() => handleDelete(p.id)} className="p-4 text-neutral-700 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all">
                              <HiTrash className="w-6 h-6" />
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1 bg-red-600 text-[10px] font-black uppercase text-white rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity">
                              Delete Log
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {/* Total Row in UI Table */}
                    <tr className="bg-neutral-900/40 font-black border-t-2 border-neutral-800">
                      <td className="px-4 md:px-10 py-6 md:py-8 text-right text-[10px] uppercase tracking-widest text-neutral-500" colSpan="2">
                        Gross Total Settlement:
                      </td>
                      <td className="px-4 md:px-10 py-6 md:py-8 text-2xl text-paymentUpi tabular-nums">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.total)}
                      </td>
                      <td className="px-4 md:px-10 py-6 md:py-8" colSpan="2"></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Global Destruction */}
        {payments.length > 0 && (
          <div className="flex justify-center flex-col items-center gap-4 pt-10">
            <p className="text-neutral-700 text-[9px] font-black uppercase tracking-[0.5em]">Ledger Maintenance</p>
            <button
              onClick={handleClearAll}
              className="px-12 py-5 rounded-full border border-neutral-900 text-neutral-600 hover:text-red-600 hover:border-red-600/30 transition-all text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-600/5 shadow-inner"
            >
              Delete All
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentTracker;
