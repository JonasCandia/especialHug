import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  RefreshCw,
  Eye
} from 'lucide-react';
import type { Order } from '../types.js';

interface MyOrdersModalProps {
  isOpen: boolean;
  userEmail: string;
  onClose: () => void;
  onSelectOrder: (orderId: string) => void;
  onEmailChanged: (email: string) => void;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({
  isOpen,
  userEmail,
  onClose,
  onSelectOrder,
  onEmailChanged
}) => {
  const [emailInput, setEmailInput] = useState<string>(userEmail || '');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);

  const fetchOrders = async (targetEmail: string) => {
    if (!targetEmail || !targetEmail.includes('@')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/user/history?email=${encodeURIComponent(targetEmail)}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
      setSearched(true);
    } catch (e) {
      console.error('Error fetching user orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userEmail) {
      fetchOrders(userEmail);
    }
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput) {
      onEmailChanged(emailInput);
      fetchOrders(emailInput);
    }
  };

  const handleResend = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/resend-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput })
      });
      const data = await res.json();
      if (data.success) {
        alert('Novo link assinado válido por 48 horas gerado com sucesso!');
        fetchOrders(emailInput);
      }
    } catch (e) {
      alert('Erro ao solicitar novo link.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] border border-black/5 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#FAF9F6] p-6 text-[#2C2C2C] border-b border-black/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#A68A56] text-white flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif italic text-xl font-semibold text-[#2C2C2C]">Meus Pedidos & Downloads</h3>
              <p className="text-xs text-[#2C2C2C] opacity-60">Consulte suas artes e links de download ativos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#2C2C2C] opacity-50 hover:opacity-100 p-2 rounded-full hover:bg-black/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-black/5 bg-[#FAF9F6]/50 shrink-0">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#2C2C2C] opacity-40 absolute left-4 top-3" />
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Informe seu e-mail cadastrado..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-black/10 focus:border-[#A68A56] text-xs text-[#2C2C2C] outline-none bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#2C2C2C] hover:bg-[#A68A56] text-white font-medium px-6 py-2.5 rounded-full text-xs uppercase tracking-wider transition shrink-0 cursor-pointer"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
        </div>

        {/* Orders List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-[#2C2C2C] opacity-60">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#A68A56]" />
              <p className="text-xs">Buscando seus pedidos...</p>
            </div>
          ) : orders.length > 0 ? (
            orders.map((order) => {
              const isCompleted = order.status === 'concluido' || order.status === 'pago';
              const isExpired =
                order.downloadExpiresAt && new Date(order.downloadExpiresAt).getTime() < Date.now();

              return (
                <div
                  key={order.id}
                  className="bg-white border border-black/5 rounded-[20px] p-4 shadow-sm hover:border-[#A68A56]/30 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    {order.previewUrl ? (
                      <img
                        src={order.previewUrl}
                        alt="Prévia"
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-[14px] object-cover border border-black/5 shrink-0 bg-[#2C2C2C]"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-[14px] bg-[#FAF9F6] border border-[#A68A56]/30 flex items-center justify-center text-[#A68A56] shrink-0">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif italic font-semibold text-[#2C2C2C] text-sm">{order.themeName}</h4>
                        <span className="text-[10px] text-[#2C2C2C] opacity-40 font-mono">#{order.id}</span>
                      </div>

                      <span className="text-xs text-[#2C2C2C] opacity-60 block">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')} • R$ {order.priceBrl?.toFixed(2)}
                      </span>

                      {/* Status */}
                      <div className="mt-1 flex items-center gap-2">
                        {isCompleted ? (
                          <span className="text-[10px] font-bold text-[#A68A56] bg-[#A68A56]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Liberado (HD)</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#2C2C2C] opacity-70 bg-[#FAF9F6] border border-black/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Aguardando Pagamento
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {isCompleted ? (
                      isExpired ? (
                        <button
                          onClick={() => handleResend(order.id)}
                          className="text-xs bg-[#FAF9F6] hover:bg-[#EAE8E1] text-[#2C2C2C] font-semibold px-3 py-2 rounded-full transition border border-black/5 cursor-pointer"
                        >
                          Reativar Link
                        </button>
                      ) : (
                        <a
                          href={`/api/download/${order.downloadToken}`}
                          download
                          className="text-xs bg-[#2C2C2C] hover:bg-[#A68A56] text-white font-medium px-4 py-2 rounded-full shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Baixar HD</span>
                        </a>
                      )
                    ) : (
                      <button
                        onClick={() => {
                          onSelectOrder(order.id);
                          onClose();
                        }}
                        className="text-xs bg-[#2C2C2C] hover:bg-[#A68A56] text-white font-medium px-4 py-2 rounded-full shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver e Pagar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : searched ? (
            <div className="py-12 text-center text-[#2C2C2C] opacity-60">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">Nenhum pedido encontrado</p>
              <p className="text-xs opacity-70 mt-1">
                Não localizamos pedidos para o e-mail informado ({emailInput}).
              </p>
            </div>
          ) : (
            <div className="py-12 text-center text-[#2C2C2C] opacity-50">
              <p className="text-xs">Informe seu e-mail acima para listar seus pedidos e links de download.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
