import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  DollarSign,
  ShoppingBag,
  CheckCircle,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Edit,
  Save,
  RotateCcw,
  RefreshCw,
  Eye,
  Unlock,
  AlertCircle
} from 'lucide-react';
import type { Theme, Order, Payment, AdminMetrics } from '../types.js';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  themes: Theme[];
  onThemeUpdated: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  themes,
  onThemeUpdated
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'metrics' | 'orders' | 'themes'>('metrics');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Edit theme modal / state
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin' || passwordInput === 'abraco2025') {
      setIsAuthenticated(true);
      setAuthError('');
      fetchAdminData();
    } else {
      setAuthError('Senha administrativa incorreta (padrão: admin)');
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [mRes, oRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/orders')
      ]);
      const mData = await mRes.json();
      const oData = await oRes.json();

      if (mData.success) setMetrics(mData.metrics);
      if (oData.success) {
        setOrders(oData.orders || []);
        setPayments(oData.payments || []);
      }
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleThemeActive = async (theme: Theme) => {
    try {
      const res = await fetch(`/api/admin/themes/${theme.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !theme.active })
      });
      const data = await res.json();
      if (data.success) {
        onThemeUpdated();
      }
    } catch (e) {
      alert('Erro ao atualizar status do tema');
    }
  };

  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTheme) return;

    try {
      const res = await fetch(`/api/admin/themes/${editingTheme.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTheme)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess('Tema salvo com sucesso!');
        setTimeout(() => setSaveSuccess(''), 3000);
        setEditingTheme(null);
        onThemeUpdated();
      }
    } catch (e) {
      alert('Erro ao salvar tema');
    }
  };

  const handleManualApprove = async (orderId: string) => {
    if (!confirm('Deseja liberar este pedido manualmente sem necessidade de pagamento?')) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/approve`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        alert('Pedido liberado com sucesso!');
        fetchAdminData();
      }
    } catch (e) {
      alert('Erro ao aprovar pedido');
    }
  };

  const handleRegenerate = async (orderId: string) => {
    if (!confirm('Deseja acionar uma nova geração de IA para este pedido?')) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/regenerate`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        alert('Regeneração concluída!');
        fetchAdminData();
      }
    } catch (e) {
      alert('Erro ao regenerar');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-[32px] border border-black/5 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#2C2C2C] p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 text-[#A68A56] flex items-center justify-center border border-[#A68A56]/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif italic text-xl font-semibold">Painel Administrativo</h3>
                <span className="text-[9px] bg-[#A68A56] text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Backoffice
                </span>
              </div>
              <p className="text-xs text-white/60">Gestão de catálogo, pedidos e métricas do Abraço</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={fetchAdminData}
                className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition cursor-pointer"
                title="Atualizar dados"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isAuthenticated ? (
          /* Login Form */
          <div className="p-10 max-w-md mx-auto text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-[#FAF9F6] border border-[#A68A56]/30 flex items-center justify-center mx-auto text-[#A68A56]">
              <Shield className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-serif italic text-xl font-semibold text-[#2C2C2C]">Autenticação Restrita</h4>
              <p className="text-xs text-[#2C2C2C] opacity-60 mt-1">Informe a senha administrativa para acessar o backoffice.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Senha de acesso (padrão: admin)"
                className="w-full px-4 py-3 rounded-full border border-black/10 focus:border-[#A68A56] text-xs outline-none text-center text-[#2C2C2C]"
              />

              {authError && <p className="text-xs text-red-600 font-semibold">{authError}</p>}

              <button
                type="submit"
                className="w-full bg-[#2C2C2C] hover:bg-[#A68A56] text-white font-medium py-3 px-6 rounded-full transition text-xs uppercase tracking-wider shadow-sm cursor-pointer"
              >
                Acessar Painel
              </button>
            </form>
          </div>
        ) : (
          /* Admin Content */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Tabs Navigation */}
            <div className="flex items-center gap-1.5 p-3 bg-[#FAF9F6] border-b border-black/5 shrink-0 px-6">
              <button
                onClick={() => setActiveTab('metrics')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'metrics'
                    ? 'bg-white text-[#2C2C2C] shadow-sm border border-black/5'
                    : 'text-[#2C2C2C] opacity-60 hover:opacity-100'
                }`}
              >
                Métricas & Faturamento
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'orders'
                    ? 'bg-white text-[#2C2C2C] shadow-sm border border-black/5'
                    : 'text-[#2C2C2C] opacity-60 hover:opacity-100'
                }`}
              >
                <span>Pedidos ({orders.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('themes')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'themes'
                    ? 'bg-white text-[#2C2C2C] shadow-sm border border-black/5'
                    : 'text-[#2C2C2C] opacity-60 hover:opacity-100'
                }`}
              >
                Catálogo de Temas ({themes.length})
              </button>
            </div>

            {/* Tab 1: Metrics */}
            {activeTab === 'metrics' && (
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-[#FAF9F6] border border-black/5 p-5 rounded-[24px]">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#A68A56] block mb-1">
                      Faturamento Total
                    </span>
                    <span className="font-serif italic text-2xl font-bold text-[#2C2C2C]">
                      R$ {metrics?.totalRevenueBrl.toFixed(2) || '0.00'}
                    </span>
                    <p className="text-[10px] text-[#2C2C2C] opacity-60 mt-1">Mercado Pago Confirmado</p>
                  </div>

                  <div className="bg-[#FAF9F6] border border-black/5 p-5 rounded-[24px]">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#A68A56] block mb-1">
                      Total de Pedidos
                    </span>
                    <span className="font-serif italic text-2xl font-bold text-[#2C2C2C]">
                      {metrics?.totalOrders || 0}
                    </span>
                    <p className="text-[10px] text-[#2C2C2C] opacity-60 mt-1">
                      {metrics?.completedOrders || 0} liberados / {metrics?.pendingOrders || 0} pendentes
                    </p>
                  </div>

                  <div className="bg-[#FAF9F6] border border-black/5 p-5 rounded-[24px]">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#A68A56] block mb-1">
                      Créditos Vendidos
                    </span>
                    <span className="font-serif italic text-2xl font-bold text-[#2C2C2C]">
                      {metrics?.totalCreditsSold || 0}
                    </span>
                    <p className="text-[10px] text-[#2C2C2C] opacity-60 mt-1">Pacotes comercializados</p>
                  </div>

                  <div className="bg-[#FAF9F6] border border-black/5 p-5 rounded-[24px]">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#A68A56] block mb-1">
                      Temas Ativos
                    </span>
                    <span className="font-serif italic text-2xl font-bold text-[#2C2C2C]">
                      {metrics?.activeThemesCount || 0}
                    </span>
                    <p className="text-[10px] text-[#2C2C2C] opacity-60 mt-1">Disponíveis no catálogo</p>
                  </div>
                </div>

                {/* Payments Log */}
                <div className="bg-white border border-black/5 rounded-[24px] p-5 shadow-sm">
                  <h4 className="font-serif italic font-semibold text-[#2C2C2C] text-sm mb-3">Histórico Recente de Pagamentos</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-black/5 text-[#2C2C2C] opacity-60 font-semibold text-[11px]">
                          <th className="pb-2">ID</th>
                          <th className="pb-2">Cliente</th>
                          <th className="pb-2">Valor</th>
                          <th className="pb-2">Método</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {payments.length > 0 ? (
                          payments.slice(0, 10).map((p) => (
                            <tr key={p.id} className="text-[#2C2C2C]">
                              <td className="py-2.5 font-mono opacity-60">{p.id}</td>
                              <td className="py-2.5">{p.customerEmail}</td>
                              <td className="py-2.5 font-serif italic font-bold text-[#A68A56]">R$ {p.amountBrl.toFixed(2)}</td>
                              <td className="py-2.5 uppercase text-[10px]">{p.method}</td>
                              <td className="py-2.5">
                                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                                  p.status === 'approved' ? 'bg-[#A68A56]/10 text-[#A68A56]' : 'bg-[#FAF9F6] text-[#2C2C2C] border border-black/5'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-2.5 text-[#2C2C2C] opacity-40">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-4 text-center text-[#2C2C2C] opacity-40">Nenhum pagamento registrado ainda.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Orders List */}
            {activeTab === 'orders' && (
              <div className="p-6 overflow-y-auto space-y-4">
                <div className="space-y-3">
                  {orders.map((order) => {
                    const isCompleted = order.status === 'concluido' || order.status === 'pago';
                    return (
                      <div
                        key={order.id}
                        className="bg-white border border-black/5 rounded-[20px] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          {order.previewUrl && (
                            <img
                              src={order.previewUrl}
                              alt="Thumb"
                              referrerPolicy="no-referrer"
                              className="w-16 h-16 rounded-[14px] object-cover border border-black/5 shrink-0 bg-[#2C2C2C]"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-serif italic font-semibold text-[#2C2C2C] text-sm">{order.themeName}</span>
                              <span className="text-[10px] font-mono text-[#2C2C2C] opacity-40">#{order.id}</span>
                            </div>
                            <span className="text-xs text-[#2C2C2C] opacity-70 block">
                              Cliente: <strong>{order.customerEmail}</strong> {order.customerName ? `(${order.customerName})` : ''}
                            </span>
                            <span className="text-[10px] text-[#2C2C2C] opacity-40 block">
                              {new Date(order.createdAt).toLocaleString('pt-BR')} • {order.photos?.length || 0} foto(s) enviadas
                            </span>
                          </div>
                        </div>

                        {/* Status and Action Buttons */}
                        <div className="flex items-center gap-2 self-end md:self-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isCompleted ? 'bg-[#A68A56]/10 text-[#A68A56]' : 'bg-[#FAF9F6] text-[#2C2C2C] border border-black/5'
                          }`}>
                            {order.status}
                          </span>

                          {!isCompleted && (
                            <button
                              onClick={() => handleManualApprove(order.id)}
                              className="bg-[#2C2C2C] hover:bg-[#A68A56] text-white text-xs font-medium px-3.5 py-1.5 rounded-full transition flex items-center gap-1 cursor-pointer"
                              title="Aprovar e Liberar Master sem pagamento"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Aprovar</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleRegenerate(order.id)}
                            className="bg-[#FAF9F6] hover:bg-[#EAE8E1] text-[#2C2C2C] text-xs font-semibold px-3.5 py-1.5 rounded-full transition border border-black/5 flex items-center gap-1 cursor-pointer"
                            title="Regenerar imagem com IA"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Regenerar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Themes Management */}
            {activeTab === 'themes' && (
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {themes.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white border border-black/5 rounded-[24px] p-5 flex flex-col justify-between shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-serif italic font-semibold text-[#2C2C2C] text-base">{t.name}</h4>
                          <button
                            onClick={() => handleToggleThemeActive(t)}
                            className="text-[#2C2C2C] opacity-60 hover:opacity-100 transition cursor-pointer"
                            title={t.active ? 'Desativar tema' : 'Ativar tema'}
                          >
                            {t.active ? (
                              <ToggleRight className="w-7 h-7 text-[#A68A56]" />
                            ) : (
                              <ToggleLeft className="w-7 h-7 text-[#2C2C2C] opacity-30" />
                            )}
                          </button>
                        </div>

                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mb-3 ${
                          t.active ? 'bg-[#A68A56]/10 text-[#A68A56]' : 'bg-[#FAF9F6] text-[#2C2C2C] opacity-40 border border-black/5'
                        }`}>
                          {t.active ? 'Ativo no Catálogo' : 'Inativo / Oculto'}
                        </span>

                        <p className="text-xs text-[#2C2C2C] opacity-70 mb-2">{t.subtitle}</p>
                        <p className="text-[10px] text-[#2C2C2C] opacity-60 italic mb-4 font-mono bg-[#FAF9F6] p-2.5 rounded-[14px] line-clamp-3 border border-black/5">
                          {t.promptTemplate}
                        </p>
                      </div>

                      <button
                        onClick={() => setEditingTheme(t)}
                        className="w-full bg-[#2C2C2C] hover:bg-[#A68A56] text-white text-xs font-medium py-2.5 px-3 rounded-full transition flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar Prompt & Textos</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Edit Theme Drawer / Modal */}
                {editingTheme && (
                  <div className="bg-[#FAF9F6] border border-[#A68A56]/30 rounded-[24px] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif italic font-semibold text-[#2C2C2C] text-sm">
                        Editando Tema: {editingTheme.name}
                      </h4>
                      <button onClick={() => setEditingTheme(null)} className="text-[#2C2C2C] opacity-50 hover:opacity-100">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveTheme} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#2C2C2C] mb-1">Título do Tema</label>
                        <input
                          type="text"
                          value={editingTheme.name}
                          onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-full border border-black/10 text-xs outline-none bg-white text-[#2C2C2C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#2C2C2C] mb-1">Subtítulo / Chamada Afetiva</label>
                        <input
                          type="text"
                          value={editingTheme.subtitle}
                          onChange={(e) => setEditingTheme({ ...editingTheme, subtitle: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-full border border-black/10 text-xs outline-none bg-white text-[#2C2C2C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#2C2C2C] mb-1">Prompt Template de IA</label>
                        <textarea
                          rows={3}
                          value={editingTheme.promptTemplate}
                          onChange={(e) => setEditingTheme({ ...editingTheme, promptTemplate: e.target.value })}
                          className="w-full p-4 rounded-[20px] border border-black/10 text-xs font-mono outline-none bg-white text-[#2C2C2C]"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingTheme(null)}
                          className="px-4 py-2 rounded-full text-xs text-[#2C2C2C] opacity-70 hover:opacity-100"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="bg-[#2C2C2C] hover:bg-[#A68A56] text-white font-medium px-5 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Salvar Alterações</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
