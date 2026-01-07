
import React, { useState, useMemo, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
} from 'recharts';
import { 
  LayoutDashboard, Home, TrendingUp, DollarSign, Target, Award,
  CheckCircle, ShieldCheck, History, PlusCircle, Filter, 
  Handshake, Clock, ShieldAlert, LayoutList, Trophy, Crown, BrainCircuit,
  Calendar, ChevronDown, Wallet, ReceiptText, Landmark, FileText, Users,
  AlertCircle, ChevronRight, BellRing, Building2, X
} from 'lucide-react';
import { AGENTS, PROPERTIES as INITIAL_PROPERTIES, INITIAL_FINANCIAL_ENTRIES, INITIAL_LOGS } from './constants.ts';
import { Agent, FinancialEntry, AuditLog, Property, SaleCategory } from './types.ts';
import { getBusinessInsights } from './geminiService.ts';

const COLORS = {
  primary: '#6366f1',
  secondary: '#ec4899',
  accent: '#f59e0b',
  success: '#10b981',
  danger: '#ef4444',
  info: '#3b82f6',
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    400: '#94a3b8',
    600: '#475569',
    800: '#1e293b',
    900: '#0f172a'
  },
  pricing: {
    CORRECT: '#10b981',
    MARKET: '#3b82f6',
    ABOVE_MARKET: '#ef4444'
  },
  categories: {
    DIRECT: '#6366f1',
    PARTNERSHIP: '#ec4899',
    BUILDER: '#f59e0b'
  }
};

const TRADUCOES_STATUS = {
  CORRECT: 'Preço Correto',
  MARKET: 'Valor de Mercado',
  ABOVE_MARKET: 'Acima do Mercado'
};

const TRADUCOES_FINANCEIRO = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  RECEIVED: 'Recebido',
  DIRECT: 'Direta',
  PARTNERSHIP: 'Parceria',
  BUILDER: 'Construtora'
};

// --- SUBCOMPONENTE: PÓDIO DE RANKING ---
const PódioRanking = ({ agents, valueKey, label, isCurrency = true }: any) => {
  const top3 = agents.slice(0, 3);
  const order = [1, 0, 2]; 
  
  if (top3.length < 1) return (
    <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
      Sem dados suficientes para o pódio
    </div>
  );

  return (
    <div className="flex items-end justify-center gap-4 md:gap-10 py-12">
      {order.map((idx) => {
        const agent = top3[idx];
        if (!agent) return null;
        const isFirst = idx === 0;
        const height = isFirst ? 'h-72 md:h-80' : idx === 1 ? 'h-56 md:h-64' : 'h-48 md:h-56';
        const bg = isFirst ? 'bg-amber-400/10 border-amber-400/20' : idx === 1 ? 'bg-slate-300/10 border-slate-300/20' : 'bg-amber-700/10 border-amber-700/20';
        
        return (
          <div key={agent.id} className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-10 duration-700">
            <div className="relative group">
              <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 group-hover:blur-2xl ${isFirst ? 'bg-amber-400/30' : 'bg-indigo-500/20'}`} />
              <img src={agent.avatar} className={`relative w-16 h-16 md:w-24 md:h-24 rounded-[28px] object-cover border-4 ${isFirst ? 'border-amber-400 shadow-2xl shadow-amber-400/20' : 'border-white'}`} alt={agent.name} />
              <div className={`absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 ${isFirst ? 'bg-amber-400' : 'bg-slate-800'} rounded-xl flex items-center justify-center text-white shadow-xl`}>
                {isFirst ? <Crown size={18} /> : <span className="font-black italic text-xs md:text-sm">{idx + 1}</span>}
              </div>
            </div>
            <div className={`w-28 md:w-44 ${height} ${bg} border rounded-t-[32px] md:rounded-t-[40px] flex flex-col items-center p-4 md:p-6 text-center`}>
              <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-500 mb-1 leading-none">{label}</p>
              <p className="text-xs md:text-base font-black text-slate-900 leading-tight italic truncate w-full">{agent.name.split(' ')[0]}</p>
              <div className="mt-auto pb-4">
                <p className={`text-sm md:text-xl font-black ${isFirst ? 'text-slate-900' : 'text-slate-700'}`}>
                  {isCurrency 
                    ? new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(agent[valueKey])
                    : agent[valueKey]
                  }
                </p>
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Acumulado</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- SUBCOMPONENTE: CARD KPI ---
const CardKPI = ({ title, value, icon: Icon, color, subtitle, delta }: any) => {
  const configs: any = {
    danger: { bg: 'bg-red-50', text: 'text-red-600', sub: 'text-red-400' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-500', sub: 'text-amber-400' },
    primary: { bg: 'bg-indigo-50', text: 'text-indigo-600', sub: 'text-indigo-400' },
    success: { bg: 'bg-emerald-50', text: 'text-emerald-600', sub: 'text-emerald-400' },
    accent: { bg: 'bg-slate-50', text: 'text-slate-900', sub: 'text-slate-400' },
    info: { bg: 'bg-blue-50', text: 'text-blue-600', sub: 'text-blue-400' }
  };
  const c = configs[color] || configs.accent;

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 relative overflow-hidden group hover:-translate-y-1 transition-all duration-500">
      <div className={`w-10 h-10 ${c.bg} ${c.text} rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110`}>
        <Icon size={20} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-center gap-2">
        <h3 className={`text-2xl font-black ${c.text} italic`}>{value}</h3>
        {delta !== undefined && (
          <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg font-black text-[9px] ${delta >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {delta >= 0 ? '+' : ''}{delta.toFixed(0)}%
          </div>
        )}
      </div>
      <p className={`text-[9px] ${c.sub} font-black mt-2 uppercase tracking-wide`}>{subtitle}</p>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'painel' | 'rankings' | 'estoque' | 'financeiro'>('painel');
  const [rankingCategory, setRankingCategory] = useState<'vgc' | 'vgv' | 'transactions' | 'captures'>('vgc');
  const [inventoryFilterAgentId, setInventoryFilterAgentId] = useState<string>('all');
  const [aiInsights, setAiInsights] = useState<string>('Analisando desempenho...');
  const [isFinModalOpen, setIsFinModalOpen] = useState(false);
  
  const now = new Date();
  const [periodo, setPeriodo] = useState({
    inicio: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
    fim: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  });

  const [properties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>(INITIAL_FINANCIAL_ENTRIES);

  const stats = useMemo(() => {
    const start = new Date(periodo.inicio);
    const end = new Date(periodo.fim);
    end.setHours(23, 59, 59, 999);

    const finFiltered = financialEntries.filter(e => {
      const d = new Date(e.createdAt);
      return d >= start && d <= end;
    });
    
    const invFiltered = properties.filter(p => {
      const d = new Date(p.dateListed);
      return d >= start && d <= end;
    });

    const vgcTotal = finFiltered.reduce((acc, e) => acc + e.commissionValue, 0);
    const totalVgv = finFiltered.reduce((acc, e) => acc + e.saleValue, 0);
    const totalAgencia = finFiltered.reduce((acc, e) => acc + (e.agencyShare || 0), 0);
    const totalCorretores = finFiltered.reduce((acc, e) => acc + (e.agentShare || 0), 0);

    const hoje = new Date();
    const em30Dias = new Date(); em30Dias.setDate(hoje.getDate() + 30);

    // Identificando imóveis críticos
    const imoveisVencidos = properties.filter(p => p.exclusivityStatus === 'EXPIRED');
    const imoveisAVencer = properties.filter(p => {
      const d = new Date(p.exclusivityDeadline);
      return d >= hoje && d <= em30Dias && p.exclusivityStatus === 'ACTIVE';
    });

    const exclusividade = {
      ativa: properties.filter(p => p.exclusivityStatus === 'ACTIVE').length,
      vencida: imoveisVencidos.length,
      vencendo: imoveisAVencer.length,
      alertas: [
        ...imoveisVencidos.map(p => ({ ...p, tipoAlerta: 'danger' as const })),
        ...imoveisAVencer.map(p => ({ ...p, tipoAlerta: 'warning' as const }))
      ]
    };

    // Saúde de Preço
    const saudePreco = Object.keys(TRADUCOES_STATUS).map(key => ({
      name: TRADUCOES_STATUS[key as keyof typeof TRADUCOES_STATUS],
      value: properties.filter(p => p.status === key).length,
      color: COLORS.pricing[key as keyof typeof COLORS.pricing]
    })).filter(i => i.value > 0);

    // Análise de Canais (Parceria vs Direta)
    const canaisData = [
      { name: 'Direta', value: finFiltered.filter(e => e.saleCategory === 'DIRECT').length, vgc: finFiltered.filter(e => e.saleCategory === 'DIRECT').reduce((acc, e) => acc + e.commissionValue, 0), color: COLORS.categories.DIRECT },
      { name: 'Parceria', value: finFiltered.filter(e => e.saleCategory === 'PARTNERSHIP').length, vgc: finFiltered.filter(e => e.saleCategory === 'PARTNERSHIP').reduce((acc, e) => acc + e.commissionValue, 0), color: COLORS.categories.PARTNERSHIP },
      { name: 'Construtora', value: finFiltered.filter(e => e.saleCategory === 'BUILDER').length, vgc: finFiltered.filter(e => e.saleCategory === 'BUILDER').reduce((acc, e) => acc + e.commissionValue, 0), color: COLORS.categories.BUILDER },
    ].filter(c => c.value > 0);

    // Detalhamento de Imobiliárias Parceiras
    const parceriasMap: Record<string, { vgc: number, transacoes: number }> = {};
    finFiltered.filter(e => e.saleCategory === 'PARTNERSHIP' && e.partnerAgency).forEach(e => {
       const agency = e.partnerAgency!;
       if (!parceriasMap[agency]) parceriasMap[agency] = { vgc: 0, transacoes: 0 };
       parceriasMap[agency].vgc += e.commissionValue;
       parceriasMap[agency].transacoes += 1;
    });
    const topParcerias = Object.entries(parceriasMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.vgc - a.vgc);

    const performanceCorretores = AGENTS.filter(a => a.role === 'AGENT').map(agent => ({
      ...agent,
      vgc: finFiltered.filter(e => e.agentId === agent.id).reduce((acc, e) => acc + e.commissionValue, 0),
      vgv: finFiltered.filter(e => e.agentId === agent.id).reduce((acc, e) => acc + e.saleValue, 0),
      transactions: finFiltered.filter(e => e.agentId === agent.id).length,
      captures: invFiltered.filter(p => p.agentId === agent.id).length
    }));

    return { 
      vgcTotal, 
      totalVgv, 
      totalAgencia,
      totalCorretores,
      exclusividade, 
      saudePreco, 
      canaisData,
      topParcerias,
      finFiltered,
      rankings: {
        vgc: [...performanceCorretores].sort((a,b) => b.vgc - a.vgc),
        vgv: [...performanceCorretores].sort((a,b) => b.vgv - a.vgv),
        transactions: [...performanceCorretores].sort((a,b) => b.transactions - a.transactions),
        captures: [...performanceCorretores].sort((a,b) => b.captures - a.captures)
      }
    };
  }, [financialEntries, properties, periodo]);

  useEffect(() => {
    getBusinessInsights(stats).then(setAiInsights);
  }, [stats.vgcTotal, stats.totalVgv]);

  const filteredProperties = useMemo(() => {
    if (inventoryFilterAgentId === 'all') return properties;
    return properties.filter(p => p.agentId === inventoryFilterAgentId);
  }, [properties, inventoryFilterAgentId]);

  const ajustarPeriodo = (tipo: 'mes' | 'ano') => {
    const d = new Date();
    if (tipo === 'mes') {
      setPeriodo({
        inicio: new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0],
        fim: new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
      });
    } else {
      setPeriodo({
        inicio: new Date(d.getFullYear(), 0, 1).toISOString().split('T')[0],
        fim: new Date(d.getFullYear(), 11, 31).toISOString().split('T')[0]
      });
    }
  };

  const [newEntry, setNewEntry] = useState<Partial<FinancialEntry>>({
    saleCategory: 'DIRECT',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    saleValue: 0,
    commissionValue: 0,
    agentShare: 0,
    agencyShare: 0
  });

  const handleAddEntry = () => {
    const entry: FinancialEntry = {
      ...newEntry,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    } as FinancialEntry;
    setFinancialEntries([...financialEntries, entry]);
    setIsFinModalOpen(false);
    setNewEntry({ saleCategory: 'DIRECT', status: 'PENDING' });
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 p-8 flex flex-col space-y-10 hidden lg:flex sticky top-0 h-screen">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
            <Target size={28} />
          </div>
          <span className="text-xl font-black text-white uppercase italic tracking-tighter">ImobiMax</span>
        </div>
        <nav className="flex-1 space-y-2">
          {[
            { id: 'painel', label: 'Painel Geral', icon: LayoutDashboard },
            { id: 'rankings', label: 'Classificação', icon: Trophy },
            { id: 'estoque', label: 'Estoque Ativo', icon: LayoutList },
            { id: 'financeiro', label: 'Financeiro', icon: Wallet }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center space-x-3 w-full p-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 p-8 sticky top-0 z-50 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase italic leading-none">{activeTab === 'painel' ? 'Painel Geral' : activeTab === 'rankings' ? 'Classificação' : activeTab === 'estoque' ? 'Estoque' : 'Financeiro'}</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Sistema de Gestão Inteligente</p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl">
               <button onClick={() => ajustarPeriodo('mes')} className="px-4 py-2 text-[9px] font-black uppercase hover:bg-white rounded-lg transition-all">Mês</button>
               <button onClick={() => ajustarPeriodo('ano')} className="px-4 py-2 text-[9px] font-black uppercase hover:bg-white rounded-lg transition-all">Ano</button>
            </div>
            <input type="date" value={periodo.inicio} onChange={e => setPeriodo(p => ({...p, inicio: e.target.value}))} className="bg-slate-100 border-none rounded-xl p-3 text-[10px] font-black uppercase" />
            <input type="date" value={periodo.fim} onChange={e => setPeriodo(p => ({...p, fim: e.target.value}))} className="bg-slate-100 border-none rounded-xl p-3 text-[10px] font-black uppercase" />
          </div>
        </header>

        <div className="p-10 space-y-10">
          {activeTab === 'painel' && (
            <>
              {/* IA Insights Section */}
              <section className="bg-slate-900 rounded-[40px] p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <BrainCircuit size={120} />
                </div>
                <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-500/30">
                  <BrainCircuit size={32} className="text-indigo-400" />
                </div>
                <div className="flex-1 space-y-2 relative z-10">
                  <h3 className="text-lg font-black italic">Consultoria de IA ImobiMax</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{aiInsights}</p>
                </div>
              </section>

              {/* Central de Alertas Críticos */}
              {(stats.exclusividade.vencendo > 0 || stats.exclusividade.vencida > 0) && (
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center animate-pulse">
                      <BellRing size={18} />
                    </div>
                    <h2 className="text-sm font-black uppercase italic text-slate-900 tracking-widest">Central de Alertas Críticos</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.exclusividade.alertas.map((alerta: any) => (
                      <div key={alerta.id} className={`bg-white p-5 rounded-[28px] border-l-4 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${alerta.tipoAlerta === 'danger' ? 'border-red-500' : 'border-amber-400'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-2 rounded-xl ${alerta.tipoAlerta === 'danger' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                            {alerta.tipoAlerta === 'danger' ? <ShieldAlert size={20} /> : <Clock size={20} />}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${alerta.tipoAlerta === 'danger' ? 'bg-red-500 text-white' : 'bg-amber-400 text-white'}`}>
                            {alerta.tipoAlerta === 'danger' ? 'Vencido' : 'Expira Breve'}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-slate-900 uppercase italic truncate">{alerta.title}</h4>
                          <div className="flex items-center gap-2">
                             <img src={AGENTS.find(a => a.id === alerta.agentId)?.avatar} className="w-5 h-5 rounded-full" />
                             <p className="text-[10px] font-bold text-slate-400 uppercase">{AGENTS.find(a => a.id === alerta.agentId)?.name}</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Limite Exclusividade</span>
                              <span className="text-[10px] font-black text-slate-900">{new Date(alerta.exclusivityDeadline).toLocaleDateString('pt-BR')}</span>
                           </div>
                           <button onClick={() => setActiveTab('estoque')} className={`p-2 rounded-xl transition-all ${alerta.tipoAlerta === 'danger' ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-amber-50 text-amber-500 hover:bg-amber-400 hover:text-white'}`}>
                              <ChevronRight size={18} />
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* KPI Section */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <CardKPI title="Vencidas" value={stats.exclusividade.vencida} icon={ShieldAlert} color="danger" subtitle="Ação Necessária" />
                <CardKPI title="Renovação" value={stats.exclusividade.vencendo} icon={Clock} color="warning" subtitle="Próximos 30 dias" />
                <CardKPI title="Estoque" value={stats.exclusividade.ativa} icon={ShieldCheck} color="primary" subtitle="Base Ativa" />
                <CardKPI title="VGV Vendido" value={new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(stats.totalVgv)} icon={Award} color="success" subtitle="Volume Total" />
                <CardKPI title="VGC Líquido" value={new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(stats.vgcTotal)} icon={TrendingUp} color="accent" subtitle="Comissão Gerada" />
              </div>

              {/* Novos Gráficos: Saúde e Parcerias */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Saúde de Precificação */}
                 <div className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-xl shadow-slate-200/20">
                    <h3 className="text-xs font-black uppercase mb-8 italic text-slate-400 tracking-widest text-center md:text-left">Saúde de Precificação</h3>
                    <div className="flex flex-col md:flex-row items-center gap-10">
                       <div className="w-48 h-48 relative">
                          <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie data={stats.saudePreco} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                                   {stats.saudePreco.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <RechartsTooltip />
                             </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                             <span className="text-2xl font-black italic">{stats.saudePreco.reduce((acc, i) => acc + i.value, 0)}</span>
                             <span className="text-[8px] font-black text-slate-400 uppercase">Ativos</span>
                          </div>
                       </div>
                       <div className="flex-1 space-y-4 w-full">
                          {stats.saudePreco.map(item => (
                             <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                   <span className="text-xs font-bold text-slate-600">{item.name}</span>
                                </div>
                                <span className="text-xs font-black">{item.value} imov.</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
                 
                 {/* Análise de Canais & Parcerias */}
                 <div className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-xl shadow-slate-200/20">
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="text-xs font-black uppercase italic text-slate-400 tracking-widest">Canais & Parcerias</h3>
                       <div className="flex gap-2">
                          {stats.canaisData.map(c => (
                            <div key={c.name} className="flex items-center gap-1.5">
                               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                               <span className="text-[8px] font-black text-slate-400 uppercase">{c.name}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-10">
                       <div className="w-48 h-48 relative">
                          <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie data={stats.canaisData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                                   {stats.canaisData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <RechartsTooltip />
                             </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none text-center px-4">
                             <Handshake size={16} className="text-slate-300 mb-1" />
                             <span className="text-lg font-black italic">{stats.canaisData.reduce((acc, i) => acc + i.value, 0)}</span>
                             <span className="text-[7px] font-black text-slate-400 uppercase leading-none">Vendas Totais</span>
                          </div>
                       </div>
                       <div className="flex-1 space-y-4 w-full h-[180px] overflow-y-auto custom-scrollbar pr-2">
                          {stats.topParcerias.length > 0 ? (
                            stats.topParcerias.map((p, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors">
                                 <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-indigo-500 shadow-sm">
                                       <Building2 size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-[10px] font-black text-slate-900 uppercase italic leading-none truncate w-24">{p.name}</span>
                                       <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{p.transacoes} Negócios</span>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <span className="text-[10px] font-black text-indigo-600 block leading-none">
                                       {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(p.vgc)}
                                    </span>
                                    <span className="text-[7px] font-black text-slate-400 uppercase">VGC Gerado</span>
                                 </div>
                              </div>
                            ))
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                               <p className="text-[9px] font-black text-slate-400 uppercase italic">Nenhuma parceria registrada no período</p>
                            </div>
                          )}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Top Performance Table (Mês) */}
              <div className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                <h3 className="text-xs font-black uppercase mb-8 italic text-slate-400 tracking-widest text-center md:text-left">Destaques da Equipe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {stats.rankings.vgc.slice(0, 4).map((agent, i) => (
                     <div key={agent.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4 hover:border-indigo-200 transition-all group">
                        <div className="relative">
                           <img src={agent.avatar} className="w-12 h-12 rounded-2xl object-cover" />
                           <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-amber-400 text-white' : 'bg-slate-800 text-white'}`}>
                              {i + 1}
                           </div>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-900 uppercase italic truncate w-32">{agent.name}</p>
                           <p className="text-xs font-black text-indigo-600 mt-0.5">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(agent.vgc)}
                           </p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'rankings' && (
            <div className="space-y-12 pb-20">
              <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-xl flex flex-col lg:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-amber-400 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-200">
                      <Trophy size={32} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black uppercase italic tracking-tight">Hall da Fama</h2>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Desempenho de Elite</p>
                   </div>
                </div>
                
                <div className="flex bg-slate-100 p-1.5 rounded-3xl gap-1 overflow-x-auto max-w-full">
                   {[
                     { id: 'vgc', label: 'VGC Líquido', icon: DollarSign },
                     { id: 'vgv', label: 'Volume VGV', icon: TrendingUp },
                     { id: 'transactions', label: 'Vendas', icon: Handshake },
                     { id: 'captures', label: 'Captações', icon: Home }
                   ].map(cat => (
                     <button 
                       key={cat.id} 
                       onClick={() => setRankingCategory(cat.id as any)}
                       className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${rankingCategory === cat.id ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                       <cat.icon size={14} />
                       <span>{cat.label}</span>
                     </button>
                   ))}
                </div>
              </div>

              <PódioRanking 
                agents={stats.rankings[rankingCategory]} 
                valueKey={rankingCategory} 
                label={rankingCategory.toUpperCase()} 
                isCurrency={rankingCategory === 'vgc' || rankingCategory === 'vgv'}
              />

              <div className="bg-white rounded-[56px] border border-slate-100 shadow-2xl p-6 md:p-12">
                 <h3 className="text-sm font-black uppercase italic text-slate-400 tracking-widest mb-10 text-center">Classificação Geral do Período</h3>
                 <div className="space-y-4">
                    {stats.rankings[rankingCategory].map((agent, i) => {
                       const max = stats.rankings[rankingCategory][0][rankingCategory];
                       const percent = max > 0 ? (agent[rankingCategory] / max) * 100 : 0;
                       
                       return (
                        <div key={agent.id} className="group flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 p-4 hover:bg-slate-50 rounded-3xl transition-all border border-transparent hover:border-slate-100">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${i < 3 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                              {i + 1}
                           </div>
                           <img src={agent.avatar} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover shadow-lg shrink-0" />
                           <div className="flex-1 w-full">
                              <div className="flex justify-between items-end mb-2">
                                 <p className="text-sm font-black uppercase italic text-slate-900">{agent.name}</p>
                                 <p className="text-sm font-black text-indigo-600">
                                    {rankingCategory === 'vgc' || rankingCategory === 'vgv' 
                                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(agent[rankingCategory])
                                      : `${agent[rankingCategory]} ${rankingCategory === 'transactions' ? 'Negócios' : 'Capt.'}`
                                    }
                                 </p>
                              </div>
                              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                 <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(99,102,241,0.5)]" style={{ width: `${percent}%` }} />
                              </div>
                           </div>
                        </div>
                       );
                    })}
                 </div>
              </div>
            </div>
          )}
          
          {activeTab === 'estoque' && (
            <div className="space-y-6 pb-20">
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-slate-900 text-white rounded-2xl">
                      <LayoutList size={24} />
                   </div>
                   <div>
                      <h2 className="text-lg font-black uppercase italic tracking-tight">Portfólio de Ativos</h2>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Gestão de Inventário e Exclusividades</p>
                   </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                   <div className="relative flex-1 md:flex-none">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <select 
                        value={inventoryFilterAgentId} 
                        onChange={(e) => setInventoryFilterAgentId(e.target.value)}
                        className="pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500/20 w-full appearance-none"
                      >
                         <option value="all">Equipe Inteira</option>
                         {AGENTS.filter(a => a.role === 'AGENT').map(agent => (
                           <option key={agent.id} value={agent.id}>{agent.name}</option>
                         ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                   </div>
                   <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                      <PlusCircle size={14} /> Novo Imóvel
                   </button>
                </div>
              </div>

              <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-slate-900 text-[10px] font-black text-indigo-200 uppercase tracking-widest h-16">
                          <tr>
                             <th className="px-8">Imóvel</th>
                             <th className="px-6">Responsável</th>
                             <th className="px-6">Status Preço</th>
                             <th className="px-6">Vencimento</th>
                             <th className="px-6">Valor Venda</th>
                             <th className="px-6 text-right pr-8">Ações</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {filteredProperties.length > 0 ? filteredProperties.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors h-20">
                               <td className="px-8 font-black text-xs uppercase italic text-slate-900">{p.title}</td>
                               <td className="px-6">
                                  <div className="flex items-center gap-2">
                                     <img src={AGENTS.find(a => a.id === p.agentId)?.avatar} className="w-6 h-6 rounded-lg" />
                                     <span className="text-[10px] font-bold text-slate-500 uppercase">{AGENTS.find(a => a.id === p.agentId)?.name}</span>
                                  </div>
                               </td>
                               <td className="px-6">
                                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${p.status === 'CORRECT' ? 'bg-emerald-100 text-emerald-700' : p.status === 'MARKET' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                    {TRADUCOES_STATUS[p.status as keyof typeof TRADUCOES_STATUS]}
                                  </span>
                               </td>
                               <td className="px-6 text-xs text-slate-400 font-bold">{new Date(p.exclusivityDeadline).toLocaleDateString('pt-BR')}</td>
                               <td className="px-6 font-black text-slate-900 text-xs">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}</td>
                               <td className="px-6 text-right pr-8">
                                  <div className="flex justify-end gap-2">
                                     <button className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"><PlusCircle size={16}/></button>
                                     <button className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle size={16}/></button>
                                  </div>
                               </td>
                            </tr>
                          )) : (
                            <tr>
                               <td colSpan={6} className="text-center py-20">
                                  <p className="text-slate-400 font-black uppercase text-xs">Nenhum registro encontrado.</p>
                               </td>
                            </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div className="space-y-10 pb-20">
              {/* Cards de Resumo Financeiro */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <CardKPI title="Volume de Vendas" value={new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(stats.totalVgv)} icon={Landmark} color="primary" subtitle="VGV Efetivado" />
                <CardKPI title="Receita de Comissão" value={new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(stats.vgcTotal)} icon={Wallet} color="success" subtitle="VGC Bruto Total" />
                <CardKPI title="Parte Imobiliária" value={new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(stats.totalAgencia)} icon={ReceiptText} color="info" subtitle="Retenção Agência" />
                <CardKPI title="Repasse Corretores" value={new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(stats.totalCorretores)} icon={Users} color="accent" subtitle="Total Comissionado" />
              </div>

              {/* Tabela de Lançamentos Financeiros */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase italic tracking-tight">Extrato Financeiro</h2>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Controle de Comissões e Recebíveis</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsFinModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg"
                  >
                    <PlusCircle size={14} /> Novo Lançamento
                  </button>
                </div>

                <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-900 text-[10px] font-black text-indigo-200 uppercase tracking-widest h-16">
                        <tr>
                          <th className="px-8">Data</th>
                          <th className="px-6">Corretor</th>
                          <th className="px-6">Categoria</th>
                          <th className="px-6">VGV</th>
                          <th className="px-6">VGC Bruto</th>
                          <th className="px-6">Repasse</th>
                          <th className="px-6">Status</th>
                          <th className="px-6 text-right pr-8">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {stats.finFiltered.length > 0 ? stats.finFiltered.map(entry => (
                          <tr key={entry.id} className="hover:bg-slate-50 transition-colors h-20">
                            <td className="px-8 text-xs font-bold text-slate-500 uppercase">{new Date(entry.createdAt).toLocaleDateString('pt-BR')}</td>
                            <td className="px-6">
                              <div className="flex items-center gap-2">
                                <img src={AGENTS.find(a => a.id === entry.agentId)?.avatar || 'https://picsum.photos/50'} className="w-6 h-6 rounded-lg" />
                                <span className="text-[10px] font-black text-slate-900 uppercase italic">{AGENTS.find(a => a.id === entry.agentId)?.name.split(' ')[0] || 'Desconhecido'}</span>
                              </div>
                            </td>
                            <td className="px-6">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">
                                {TRADUCOES_FINANCEIRO[entry.saleCategory as keyof typeof TRADUCOES_FINANCEIRO] || entry.saleCategory}
                              </span>
                            </td>
                            <td className="px-6 font-black text-slate-900 text-xs">{new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(entry.saleValue)}</td>
                            <td className="px-6 font-black text-indigo-600 text-xs">{new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(entry.commissionValue)}</td>
                            <td className="px-6 font-black text-slate-900 text-xs">{new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(entry.agentShare)}</td>
                            <td className="px-6">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${entry.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {TRADUCOES_FINANCEIRO[entry.status as keyof typeof TRADUCOES_FINANCEIRO] || entry.status}
                              </span>
                            </td>
                            <td className="px-6 text-right pr-8">
                              <button className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                                <FileText size={16} />
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={8} className="text-center py-20">
                              <p className="text-slate-400 font-black uppercase text-xs">Sem lançamentos financeiros neste período.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Novo Lançamento Financeiro */}
        {isFinModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                         <ReceiptText size={20} />
                      </div>
                      <h2 className="text-lg font-black uppercase italic text-slate-900">Novo Lançamento Financeiro</h2>
                   </div>
                   <button onClick={() => setIsFinModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                      <X size={20} className="text-slate-400" />
                   </button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Corretor Responsável</label>
                         <select 
                           value={newEntry.agentId} 
                           onChange={e => setNewEntry({...newEntry, agentId: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
                         >
                            <option value="">Selecione...</option>
                            {AGENTS.filter(a => a.role === 'AGENT').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Categoria da Venda</label>
                         <select 
                           value={newEntry.saleCategory} 
                           onChange={e => setNewEntry({...newEntry, saleCategory: e.target.value as SaleCategory})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
                         >
                            <option value="DIRECT">Venda Direta</option>
                            <option value="PARTNERSHIP">Parceria (Imobiliária)</option>
                            <option value="BUILDER">Construtora</option>
                         </select>
                      </div>
                   </div>

                   {newEntry.saleCategory === 'PARTNERSHIP' && (
                     <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-3xl space-y-4 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-2 mb-2">
                           <Handshake size={16} className="text-indigo-600" />
                           <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Dados da Parceria</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <input 
                             placeholder="Nome da Imobiliária Parceira" 
                             className="bg-white border border-indigo-100 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600/20"
                             value={newEntry.partnerAgency || ''}
                             onChange={e => setNewEntry({...newEntry, partnerAgency: e.target.value})}
                           />
                           <input 
                             placeholder="Corretor Parceiro" 
                             className="bg-white border border-indigo-100 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600/20"
                             value={newEntry.partnerBroker || ''}
                             onChange={e => setNewEntry({...newEntry, partnerBroker: e.target.value})}
                           />
                        </div>
                     </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Valor VGV (Venda)</label>
                         <input 
                           type="number" 
                           placeholder="R$ 0,00"
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                           value={newEntry.saleValue || ''}
                           onChange={e => setNewEntry({...newEntry, saleValue: Number(e.target.value)})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">VGC Bruto (Comissão)</label>
                         <input 
                           type="number" 
                           placeholder="R$ 0,00"
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                           value={newEntry.commissionValue || ''}
                           onChange={e => setNewEntry({...newEntry, commissionValue: Number(e.target.value)})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Repasse Corretor</label>
                         <input 
                           type="number" 
                           placeholder="R$ 0,00"
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                           value={newEntry.agentShare || ''}
                           onChange={e => setNewEntry({...newEntry, agentShare: Number(e.target.value)})}
                         />
                      </div>
                   </div>
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                   <button 
                     onClick={() => setIsFinModalOpen(false)}
                     className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-100 transition-all"
                   >
                      Cancelar
                   </button>
                   <button 
                     onClick={handleAddEntry}
                     className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
                   >
                      Efetivar Lançamento
                   </button>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
