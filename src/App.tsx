import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  MessageCircle, 
  TrendingUp, 
  Package, 
  CreditCard, 
  History,
  Settings,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Sale {
  id: string;
  name: string;
  buyPrice: number;
  salePrice: number;
  time: string;
}

interface Stock {
  id: string;
  name: string;
  cost: number;
  qty: number;
}

interface Udhaar {
  id: string;
  name: string;
  phone: string;
  item: string;
  amount: number;
  date: string;
}

interface Archive {
  id: string;
  month: string;
  s: number;
  p: number;
  u: number;
}

type Tab = 'sales' | 'stock' | 'udhaar' | 'records';

export default function App() {
  // --- State ---
  const [sales, setSales] = useState<Sale[]>(() => JSON.parse(localStorage.getItem('mlk_sales') || '[]'));
  const [stock, setStock] = useState<Stock[]>(() => JSON.parse(localStorage.getItem('mlk_stock') || '[]'));
  const [udhaar, setUdhaar] = useState<Udhaar[]>(() => JSON.parse(localStorage.getItem('mlk_udhaar') || '[]'));
  const [archives, setArchives] = useState<Archive[]>(() => JSON.parse(localStorage.getItem('mlk_archives') || '[]'));
  
  const [activeTab, setActiveTab] = useState<Tab>('sales');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Form States ---
  const [saleForm, setSaleForm] = useState({ name: '', buy: '', sale: '' });
  const [stockForm, setStockForm] = useState({ name: '', cost: '', qty: '' });
  const [udhaarForm, setUdhaarForm] = useState({ name: '', phone: '', item: '', amount: '' });

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('mlk_sales', JSON.stringify(sales));
    localStorage.setItem('mlk_stock', JSON.stringify(stock));
    localStorage.setItem('mlk_udhaar', JSON.stringify(udhaar));
    localStorage.setItem('mlk_archives', JSON.stringify(archives));
  }, [sales, stock, udhaar, archives]);

  // --- Stats Calculations ---
  const stats = useMemo(() => {
    const totalSales = sales.reduce((acc, s) => acc + Number(s.salePrice), 0);
    const totalProfit = sales.reduce((acc, s) => acc + (Number(s.salePrice) - Number(s.buyPrice)), 0);
    const totalUdhaar = udhaar.reduce((acc, u) => acc + Number(u.amount), 0);
    const totalStockItems = stock.reduce((acc, st) => acc + Number(st.qty), 0);
    return { totalSales, totalProfit, totalUdhaar, totalStockItems };
  }, [sales, udhaar, stock]);

  // --- Handlers ---
  const addSale = () => {
    if (!saleForm.name || !saleForm.buy || !saleForm.sale) return;
    const newSale: Sale = {
      id: crypto.randomUUID(),
      name: saleForm.name,
      buyPrice: Number(saleForm.buy),
      salePrice: Number(saleForm.sale),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSales([newSale, ...sales]);
    setSaleForm({ name: '', buy: '', sale: '' });
  };

  const addStock = () => {
    if (!stockForm.name || !stockForm.cost || !stockForm.qty) return;
    const newStock: Stock = {
      id: crypto.randomUUID(),
      name: stockForm.name,
      cost: Number(stockForm.cost),
      qty: Number(stockForm.qty)
    };
    setStock([newStock, ...stock]);
    setStockForm({ name: '', cost: '', qty: '' });
  };

  const addUdhaar = () => {
    if (!udhaarForm.name || !udhaarForm.amount) return;
    const newUdhaar: Udhaar = {
      id: crypto.randomUUID(),
      name: udhaarForm.name,
      phone: udhaarForm.phone,
      item: udhaarForm.item,
      amount: Number(udhaarForm.amount),
      date: new Date().toLocaleDateString()
    };
    setUdhaar([newUdhaar, ...udhaar]);
    setUdhaarForm({ name: '', phone: '', item: '', amount: '' });
  };

  const archiveMonth = () => {
    if (!window.confirm("Close this month? Sales and Profit will reset.")) return;
    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const newArchive: Archive = {
      id: crypto.randomUUID(),
      month,
      s: stats.totalSales,
      p: stats.totalProfit,
      u: stats.totalUdhaar
    };
    setArchives([newArchive, ...archives]);
    setSales([]);
    // We keep udhaar and stock as they are ongoing
  };

  const deleteSale = (id: string) => setSales(sales.filter(s => s.id !== id));
  const deleteStock = (id: string) => setStock(stock.filter(s => s.id !== id));
  const payUdhaar = (id: string) => setUdhaar(udhaar.filter(u => u.id !== id));
  
  const sendWA = (phone: string, amount: number) => {
    window.open(`https://wa.me/${phone}?text=Reminder from Malik Mobile Shop: Pending amount Rs. ${amount}.`);
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const val = row[header];
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(','))
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- Filtered Lists ---
  const filteredSales = sales.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredStock = stock.filter(st => st.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredUdhaar = udhaar.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8 pb-32 selection:bg-amber-500/30">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter bg-gradient-to-br from-amber-400 to-amber-600 bg-clip-text text-transparent">
              MALIK ERP
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
              Inventory & Sales Ecosystem
            </p>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-amber-500"
          >
            <Settings size={20} />
          </motion.div>
        </header>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard label="Sale" value={`Rs. ${stats.totalSales.toLocaleString()}`} icon={<TrendingUp size={12} className="text-amber-400" />} />
          <StatCard label="Profit" value={`Rs. ${stats.totalProfit.toLocaleString()}`} icon={<ArrowUpRight size={12} className="text-emerald-400" />} color="text-emerald-400" />
          <StatCard label="Udhaar" value={`Rs. ${stats.totalUdhaar.toLocaleString()}`} icon={<ArrowDownRight size={12} className="text-rose-400" />} color="text-rose-400" />
          <StatCard label="Stock" value={`${stats.totalStockItems} Items`} icon={<Package size={12} className="text-blue-400" />} color="text-blue-400" />
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-500 transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, customers, or stock..." 
            className="w-full bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all text-sm"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 mb-8 overflow-x-auto no-scrollbar gap-6">
          <TabButton active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} label="SALES" icon={<TrendingUp size={14} />} />
          <TabButton active={activeTab === 'stock'} onClick={() => setActiveTab('stock')} label="BUYING STOCK" icon={<Package size={14} />} />
          <TabButton active={activeTab === 'udhaar'} onClick={() => setActiveTab('udhaar')} label="UDHAAR" icon={<CreditCard size={14} />} />
          <TabButton active={activeTab === 'records'} onClick={() => setActiveTab('records')} label="RECORDS" icon={<History size={14} />} />
        </div>

        {/* Sections */}
        <AnimatePresence mode="wait">
          {activeTab === 'sales' && (
            <motion.div 
              key="sales"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 border-t-2 border-t-amber-500/30">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">New Sale Transaction</h3>
                  <button 
                    onClick={() => downloadCSV(sales, 'malik_sales')}
                    className="flex items-center gap-2 text-[10px] font-bold text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    <Download size={12} /> EXPORT DATA
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <input 
                    type="text" 
                    placeholder="Item Name" 
                    value={saleForm.name}
                    onChange={(e) => setSaleForm({...saleForm, name: e.target.value})}
                    className="col-span-2 bg-slate-950/50 border border-slate-800 p-4 rounded-2xl outline-none focus:border-amber-500/50 text-sm"
                  />
                  <input 
                    type="number" 
                    placeholder="Cost Price" 
                    value={saleForm.buy}
                    onChange={(e) => setSaleForm({...saleForm, buy: e.target.value})}
                    className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl outline-none focus:border-amber-500/50 text-sm"
                  />
                  <input 
                    type="number" 
                    placeholder="Sale Price" 
                    value={saleForm.sale}
                    onChange={(e) => setSaleForm({...saleForm, sale: e.target.value})}
                    className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl outline-none focus:border-amber-500/50 text-sm"
                  />
                </div>
                <button 
                  onClick={addSale}
                  className="w-full bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-amber-500/10 active:scale-[0.98] transition-all text-slate-950"
                >
                  SAVE SALE
                </button>
              </div>
              <div className="space-y-3">
                {filteredSales.map((s) => (
                  <div key={s.id} className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-2xl flex justify-between items-center border border-white/5 group hover:border-amber-500/20 transition-colors">
                    <div>
                      <p className="font-bold text-sm">{s.name}</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">{s.time}</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="font-bold text-amber-400 text-sm">Rs. {s.salePrice}</p>
                        <p className="text-[10px] text-emerald-500 font-bold">+{s.salePrice - s.buyPrice}</p>
                      </div>
                      <button 
                        onClick={() => deleteSale(s.id)}
                        className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'stock' && (
            <motion.div 
              key="stock"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 border-t-2 border-t-blue-500/30">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Add New Buying Stock</h3>
                  <button 
                    onClick={() => downloadCSV(stock, 'malik_stock')}
                    className="flex items-center gap-2 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Download size={12} /> EXPORT DATA
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <input 
                    type="text" 
                    placeholder="Item Name (e.g. Charger)" 
                    value={stockForm.name}
                    onChange={(e) => setStockForm({...stockForm, name: e.target.value})}
                    className="col-span-2 bg-slate-950/50 border border-slate-800 p-4 rounded-2xl outline-none focus:border-blue-500/50 text-sm"
                  />
                  <input 
                    type="number" 
                    placeholder="Buying Rate" 
                    value={stockForm.cost}
                    onChange={(e) => setStockForm({...stockForm, cost: e.target.value})}
                    className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl outline-none focus:border-blue-500/50 text-sm"
                  />
                  <input 
                    type="number" 
                    placeholder="Quantity" 
                    value={stockForm.qty}
                    onChange={(e) => setStockForm({...stockForm, qty: e.target.value})}
                    className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl outline-none focus:border-blue-500/50 text-sm"
                  />
                </div>
                <button 
                  onClick={addStock}
                  className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all"
                >
                  ADD TO INVENTORY
                </button>
              </div>
              <div className="space-y-3">
                {filteredStock.map((st) => (
                  <div key={st.id} className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-2xl flex justify-between items-center border border-white/5 border-l-4 border-l-blue-500/50">
                    <div>
                      <p className="font-bold text-sm">{st.name}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">RATE: Rs. {st.cost}</span>
                        <span className="text-[10px] text-slate-400 font-bold bg-white/5 px-2 py-0.5 rounded">QTY: {st.qty}</span>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="font-bold text-slate-200 text-sm">Rs. {st.cost * st.qty}</p>
                      </div>
                      <button 
                        onClick={() => deleteStock(st.id)}
                        className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'udhaar' && (
            <motion.div 
              key="udhaar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 border-l-4 border-l-rose-500">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">New Udhaar Entry</h3>
                  <button 
                    onClick={() => downloadCSV(udhaar, 'malik_udhaar')}
                    className="flex items-center gap-2 text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    <Download size={12} /> EXPORT DATA
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <input 
                    type="text" 
                    placeholder="Customer Name" 
                    value={udhaarForm.name}
                    onChange={(e) => setUdhaarForm({...udhaarForm, name: e.target.value})}
                    className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl outline-none focus:border-rose-500/50 text-sm"
                  />
                  <input 
                    type="number" 
                    placeholder="WhatsApp Number" 
                    value={udhaarForm.phone}
                    onChange={(e) => setUdhaarForm({...udhaarForm, phone: e.target.value})}
                    className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl outline-none focus:border-rose-500/50 text-sm"
                  />
                  <input 
                    type="text" 
                    placeholder="Item" 
                    value={udhaarForm.item}
                    onChange={(e) => setUdhaarForm({...udhaarForm, item: e.target.value})}
                    className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl outline-none focus:border-rose-500/50 text-sm"
                  />
                  <input 
                    type="number" 
                    placeholder="Amount" 
                    value={udhaarForm.amount}
                    onChange={(e) => setUdhaarForm({...udhaarForm, amount: e.target.value})}
                    className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl outline-none focus:border-rose-500/50 text-sm"
                  />
                </div>
                <button 
                  onClick={addUdhaar}
                  className="w-full bg-rose-500/80 hover:bg-rose-500 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-rose-500/10 active:scale-[0.98] transition-all"
                >
                  RECORD UDHAAR
                </button>
              </div>
              <div className="space-y-3">
                {filteredUdhaar.map((u) => (
                  <div key={u.id} className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-2xl border border-white/5 border-l-4 border-l-rose-500/50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-sm">{u.name}</p>
                        <p className="text-[10px] text-slate-500 mt-1 font-medium">{u.item} • {u.date}</p>
                      </div>
                      <p className="font-bold text-rose-500 text-sm">Rs. {u.amount}</p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => sendWA(u.phone, u.amount)}
                        className="flex-1 bg-emerald-500/10 text-emerald-500 py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-colors"
                      >
                        <MessageCircle size={14} /> WHATSAPP
                      </button>
                      <button 
                        onClick={() => payUdhaar(u.id)}
                        className="flex-1 bg-white/5 text-slate-400 py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                      >
                        <CheckCircle2 size={14} /> PAID
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'records' && (
            <motion.div 
              key="records"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center px-2">
                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400">Monthly Archives</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => downloadCSV(archives, 'malik_archives')}
                    className="flex items-center gap-2 text-[10px] font-bold text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    <Download size={12} /> EXPORT
                  </button>
                  <button 
                    onClick={archiveMonth}
                    className="text-[10px] bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full font-black border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                  >
                    CLOSE MONTH
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {archives.map((a) => (
                  <div key={a.id} className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5">
                    <p className="text-[11px] font-black text-amber-500 uppercase mb-4 tracking-widest">{a.month}</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase mb-1">Sale</p>
                        <p className="text-[11px] font-bold">Rs. {a.s.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase mb-1">Profit</p>
                        <p className="text-[11px] font-bold text-emerald-400">Rs. {a.p.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase mb-1">Udhaar</p>
                        <p className="text-[11px] font-bold text-rose-400">Rs. {a.u.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Sub-components ---

function StatCard({ label, value, icon, color = "text-slate-100" }: { label: string, value: string, icon: React.ReactNode, color?: string }) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-slate-900/40 backdrop-blur-xl p-4 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center"
    >
      <div className="mb-2 p-1.5 bg-white/5 rounded-lg">
        {icon}
      </div>
      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">{label}</p>
      <p className={`text-xs font-black ${color}`}>{value}</p>
    </motion.div>
  );
}

function TabButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`
        flex items-center gap-2 px-1 py-4 text-[10px] font-black transition-all relative whitespace-nowrap
        ${active ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}
      `}
    >
      {icon}
      {label}
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full"
        />
      )}
    </button>
  );
}
