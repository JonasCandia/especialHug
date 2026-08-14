import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Download,
  Coins,
  QrCode,
  CreditCard,
  CheckCircle,
  Copy,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Eye,
  ExternalLink
} from 'lucide-react';
import type { Order, Payment } from '../types.js';

interface PreviewAndCheckoutProps {
  orderId: string;
  userEmail: string;
  userCredits: number;
  onCreditsUpdated: () => void;
  onBackToHome: () => void;
  onOpenCreditsModal: () => void;
}

export const PreviewAndCheckout: React.FC<PreviewAndCheckoutProps> = ({
  orderId,
  userEmail,
  userCredits,
  onCreditsUpdated,
  onBackToHome,
  onOpenCreditsModal
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Checkout states
  const [selectedMethod, setSelectedMethod] = useState<'credit' | 'direct_pix' | 'direct_card' | 'pack_3'>('direct_pix');
  const [activePayment, setActivePayment] = useState<Payment | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [copiedPix, setCopiedPix] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  // Credit card inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Fetch order info
  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        if (data.order.status === 'concluido' || data.order.status === 'pago') {
          setPaymentSuccess(true);
        }
      } else {
        setError(data.error || 'Erro ao carregar o pedido');
      }
    } catch (err: any) {
      setError(err?.message || 'Falha na comunicação com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(() => {
      // Auto-poll if waiting for payment
      fetchOrder();
    }, 4000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Unlock with existing credit
  const handleUseCredit = async () => {
    if (userCredits < 1) {
      onOpenCreditsModal();
      return;
    }

    setIsProcessingPayment(true);
    setError('');

    try {
      const res = await fetch(`/api/orders/${orderId}/unlock-with-credit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail || order?.customerEmail })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Erro ao utilizar crédito');
      }

      onCreditsUpdated();
      await fetchOrder();
      setPaymentSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Erro ao desbloquear com crédito');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Create Mercado Pago direct payment
  const handleCreateDirectPayment = async (method: 'pix' | 'card') => {
    setIsProcessingPayment(true);
    setError('');

    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order?.id,
          method,
          customerEmail: userEmail || order?.customerEmail
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erro ao criar pagamento');

      setActivePayment(data.payment);
    } catch (err: any) {
      setError(err?.message || 'Erro ao gerar pagamento Mercado Pago');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Buy 3-credit pack with 1 applied immediately
  const handleBuyPack3 = async (method: 'pix' | 'card') => {
    setIsProcessingPayment(true);
    setError('');

    try {
      const res = await fetch('/api/credits/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail || order?.customerEmail,
          packageId: 'pack-3',
          method
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erro ao criar compra de pacote');

      setActivePayment(data.payment);
    } catch (err: any) {
      setError(err?.message || 'Erro ao comprar pacote de créditos');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Simulate instant payment (for demo/test purposes)
  const handleSimulatePayment = async () => {
    if (!activePayment) return;
    setIsProcessingPayment(true);

    try {
      const res = await fetch(`/api/payments/${activePayment.id}/simulate-success`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      onCreditsUpdated();
      await fetchOrder();
      setPaymentSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Erro ao simular aprovação');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCopyPix = () => {
    if (activePayment?.pixCopyPaste) {
      navigator.clipboard.writeText(activePayment.pixCopyPaste);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

  const handleResendLink = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/resend-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail || order?.customerEmail })
      });
      const data = await res.json();
      if (data.success) {
        alert('Novo link assinado válido por 48 horas gerado!');
        fetchOrder();
      }
    } catch (e) {
      alert('Erro ao reenviar link');
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-4" />
        <h3 className="font-serif text-xl font-bold text-slate-800">Carregando seu Abraço...</h3>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="bg-red-50 border border-red-200 p-8 rounded-3xl">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />
          <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2">Pedido não encontrado</h3>
          <p className="text-sm text-slate-600 mb-6">{error}</p>
          <button
            onClick={onBackToHome}
            className="bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-amber-700 transition"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const isUnlocked = order?.status === 'concluido' || order?.status === 'pago';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <button
          id="preview-back-home-btn"
          onClick={onBackToHome}
          className="inline-flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-amber-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a página inicial</span>
        </button>

        <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
          <span>Pedido #{order?.id}</span>
        </div>
      </div>

      {/* Main Grid: Preview on Left, Payment/Download on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Preview Card */}
        <div className="lg:col-span-7 bg-white rounded-[32px] border border-black/5 shadow-sm overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="p-6 bg-[#FAF9F6] border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isUnlocked ? (
                <div className="w-10 h-10 rounded-full bg-white border border-[#A68A56]/30 text-[#A68A56] flex items-center justify-center">
                  <Unlock className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#A68A56]/30 text-[#A68A56] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
              )}
              <div>
                <h2 className="font-serif italic text-xl text-[#2C2C2C] leading-tight">
                  {order?.themeName}
                </h2>
                <span className="text-xs text-[#2C2C2C] opacity-60 font-medium">
                  {isUnlocked ? 'Arte liberada em Alta Resolução' : 'Prévia com Marca d\'Água do Servidor'}
                </span>
              </div>
            </div>

            {isUnlocked ? (
              <span className="bg-[#A68A56] text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-sm">
                Liberado ✓
              </span>
            ) : (
              <span className="bg-[#FAF9F6] text-[#A68A56] border border-[#A68A56]/40 text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-sm animate-pulse">
                Aguardando Pagamento
              </span>
            )}
          </div>

          {/* Image Display */}
          <div className="relative bg-[#2C2C2C] aspect-[4/3] flex items-center justify-center overflow-hidden">
            {order?.previewUrl ? (
              <img
                src={order.previewUrl}
                alt="Prévia do seu Abraço"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-white/60 text-sm flex items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-[#A68A56]" />
                <span>Carregando imagem...</span>
              </div>
            )}

            {!isUnlocked && (
              <div className="absolute bottom-4 left-4 right-4 bg-[#2C2C2C]/90 backdrop-blur-sm border border-[#A68A56]/40 rounded-[20px] p-3 text-center text-xs text-white/90 shadow-xl">
                🔒 <strong>Atenção:</strong> A versão original sem marca d'água e em alta nitidez já está pronta no servidor e será liberada imediatamente após a confirmação.
              </div>
            )}
          </div>

          {/* Image Details Footer */}
          <div className="p-5 bg-[#FAF9F6] text-xs text-[#2C2C2C] opacity-70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A68A56]" />
              <span>Estilo: <strong className="capitalize">{order?.styleChosen.replace('-', ' ')}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#A68A56]" />
              <span>Criado em: {new Date(order?.createdAt || '').toLocaleString('pt-BR')}</span>
            </div>
          </div>

        </div>

        {/* Right Column: Unlock Actions / Payment Options */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* IF UNLOCKED: SHOW DOWNLOAD CARD */}
          {isUnlocked ? (
            <div className="bg-white rounded-[32px] border border-[#A68A56]/30 p-6 sm:p-8 shadow-sm text-center space-y-6">
              
              <div className="w-16 h-16 rounded-full bg-[#A68A56] text-white flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-serif italic text-2xl text-[#2C2C2C]">
                  Pagamento Confirmado!
                </h3>
                <p className="text-xs text-[#2C2C2C] opacity-60 mt-1">
                  Sua arte em Alta Definição (sem nenhuma marca d'água) está pronta para download.
                </p>
              </div>

              {/* Direct Download Action */}
              <a
                id="download-master-btn"
                href={order?.downloadUrl}
                download
                className="w-full py-4 px-6 bg-[#2C2C2C] hover:bg-[#A68A56] text-white font-medium rounded-full shadow-sm transition flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-98 tracking-wide"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Imagem em Alta Resolução</span>
              </a>

              {/* 48 Hours Link Expiration Notice */}
              <div className="bg-[#FAF9F6] border border-black/5 rounded-[24px] p-5 text-xs text-[#2C2C2C] text-left space-y-2">
                <div className="flex items-center gap-2 text-[#A68A56] font-serif italic font-semibold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Validade do Link: 48 Horas</span>
                </div>
                <p className="text-[11px] opacity-70 leading-relaxed">
                  Por conformidade com a LGPD e zelo pela privacidade, seu link de download expira em 48 horas. Você poderá solicitar novo reenvio informando seu e-mail caso expire.
                </p>
                <button
                  type="button"
                  onClick={handleResendLink}
                  className="text-xs font-bold uppercase tracking-widest text-[#A68A56] hover:text-[#8F7444] underline block pt-1"
                >
                  Solicitar Reenvio de Link (48h)
                </button>
              </div>

              {/* Next Actions */}
              <button
                onClick={onBackToHome}
                className="w-full bg-[#FAF9F6] hover:bg-[#EAE8E1] text-[#2C2C2C] font-semibold py-3 px-4 rounded-full text-xs uppercase tracking-wider transition border border-black/5"
              >
                Criar Outro Abraço com IA
              </button>

            </div>
          ) : (
            /* IF NOT UNLOCKED: SHOW PAYMENT CHOICES */
            <div className="bg-white rounded-[32px] border border-black/5 shadow-sm p-6 sm:p-7 space-y-6">
              
              <div>
                <h3 className="font-serif italic text-2xl text-[#2C2C2C]">
                  Liberar Imagem Final
                </h3>
                <p className="text-xs text-[#2C2C2C] opacity-60 mt-1">
                  Escolha como deseja liberar sua arte em Alta Definição:
                </p>
              </div>

              {/* Option 1: Use 1 Credit (if available) */}
              <div className="p-4 rounded-[24px] border border-[#A68A56]/40 bg-[#FAF9F6] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#A68A56] text-white font-bold flex items-center justify-center shrink-0">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif italic font-semibold text-[#2C2C2C] text-sm">Seu Saldo de Créditos</h4>
                    <p className="text-xs text-[#2C2C2C] opacity-60">
                      Você possui <strong>{userCredits}</strong> {userCredits === 1 ? 'crédito' : 'créditos'}
                    </p>
                  </div>
                </div>

                {userCredits >= 1 ? (
                  <button
                    id="btn-unlock-with-credit"
                    onClick={handleUseCredit}
                    disabled={isProcessingPayment}
                    className="bg-[#2C2C2C] hover:bg-[#A68A56] text-white font-medium text-xs py-2.5 px-4 rounded-full shadow-sm transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Usar 1 Crédito</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenCreditsModal}
                    className="text-xs font-bold uppercase tracking-widest text-[#A68A56] hover:text-[#8F7444] underline"
                  >
                    Recarregar
                  </button>
                )}
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-black/5 w-full" />
                <span className="bg-white px-3 text-[10px] font-bold text-[#2C2C2C] opacity-40 uppercase tracking-widest">ou pague agora</span>
              </div>

              {/* Payment Methods Selection */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="tab-pix"
                  onClick={() => {
                    setSelectedMethod('direct_pix');
                    handleCreateDirectPayment('pix');
                  }}
                  className={`p-3.5 rounded-[20px] border text-center transition cursor-pointer ${
                    selectedMethod === 'direct_pix'
                      ? 'border-[#A68A56] bg-[#FAF9F6] font-bold text-[#2C2C2C] ring-1 ring-[#A68A56]'
                      : 'border-black/5 hover:border-[#A68A56]/30 text-[#2C2C2C]'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1 text-[#A68A56]" />
                  <span className="text-xs block">Pix Mercado Pago</span>
                  <span className="text-[11px] text-[#A68A56] font-semibold">R$ 5,00 (Avulso)</span>
                </button>

                <button
                  type="button"
                  id="tab-card"
                  onClick={() => {
                    setSelectedMethod('direct_card');
                    handleCreateDirectPayment('card');
                  }}
                  className={`p-3.5 rounded-[20px] border text-center transition cursor-pointer ${
                    selectedMethod === 'direct_card'
                      ? 'border-[#A68A56] bg-[#FAF9F6] font-bold text-[#2C2C2C] ring-1 ring-[#A68A56]'
                      : 'border-black/5 hover:border-[#A68A56]/30 text-[#2C2C2C]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-[#A68A56]" />
                  <span className="text-xs block">Cartão de Crédito</span>
                  <span className="text-[11px] text-[#A68A56] font-semibold">R$ 5,00 (Avulso)</span>
                </button>
              </div>

              {/* Special Promotion Package Card (3 credits = R$ 10,00) */}
              <div className="bg-[#A68A56] text-white rounded-[24px] p-5 shadow-sm flex items-center justify-between">
                <div>
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                    Mais Econômico
                  </span>
                  <h4 className="font-serif italic font-semibold text-base mt-1.5">Pacote com 3 Créditos</h4>
                  <p className="text-xs text-white/80">
                    Apenas <strong>R$ 10,00</strong> (1 crédito libera esta arte + 2 créditos no saldo)
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-buy-pack-3"
                  onClick={() => {
                    setSelectedMethod('pack_3');
                    handleBuyPack3('pix');
                  }}
                  className="bg-[#2C2C2C] text-white hover:bg-black font-medium text-xs py-2.5 px-4 rounded-full shadow-sm transition active:scale-95 shrink-0"
                >
                  Comprar R$ 10
                </button>
              </div>

              {/* PAYMENT DETAILS VIEW: PIX */}
              {activePayment && (selectedMethod === 'direct_pix' || selectedMethod === 'pack_3') && (
                <div className="bg-[#FAF9F6] border border-black/5 rounded-[24px] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#2C2C2C] opacity-60 uppercase tracking-widest">
                      QR Code Pix Mercado Pago
                    </span>
                    <span className="text-sm font-serif italic font-bold text-[#A68A56]">
                      R$ {activePayment.amountBrl.toFixed(2)}
                    </span>
                  </div>

                  {/* QR Code Mock / Visual Display */}
                  <div className="bg-white p-4 rounded-[20px] border border-black/5 w-44 h-44 mx-auto flex flex-col items-center justify-center shadow-inner">
                    <QrCode className="w-32 h-32 text-[#2C2C2C]" />
                    <span className="text-[9px] text-[#2C2C2C] opacity-40 uppercase tracking-wider mt-1">Mercado Pago Pix</span>
                  </div>

                  {/* Pix Copy and Paste String */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#2C2C2C] mb-1">
                      Código Pix Copia e Cola:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={activePayment.pixCopyPaste || ''}
                        className="w-full bg-white border border-black/10 px-3.5 py-2.5 rounded-full text-xs text-[#2C2C2C] outline-none select-all font-mono"
                      />
                      <button
                        type="button"
                        id="btn-copy-pix"
                        onClick={handleCopyPix}
                        className="bg-[#2C2C2C] hover:bg-[#A68A56] text-white p-2.5 rounded-full transition shrink-0"
                        title="Copiar código Pix"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {copiedPix && (
                      <span className="text-xs text-[#A68A56] font-semibold block mt-1">
                        Código Pix copiado com sucesso!
                      </span>
                    )}
                  </div>

                  {/* Test Simulation Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      id="btn-simulate-pix-success"
                      onClick={handleSimulatePayment}
                      disabled={isProcessingPayment}
                      className="w-full py-3 px-4 bg-[#2C2C2C] text-white rounded-full font-medium tracking-wide hover:bg-[#A68A56] transition shadow-sm text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Sparkles className="w-4 h-4 text-[#A68A56]" />
                      <span>Simular Aprovação Instantânea (Mercado Pago Teste)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* PAYMENT DETAILS VIEW: CREDIT CARD */}
              {activePayment && selectedMethod === 'direct_card' && (
                <div className="bg-[#FAF9F6] border border-black/5 rounded-[24px] p-5 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[#2C2C2C] opacity-60 uppercase tracking-widest">
                      Dados do Cartão de Crédito
                    </span>
                    <span className="text-sm font-serif italic font-bold text-[#A68A56]">
                      R$ {activePayment.amountBrl.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#2C2C2C] mb-1">
                      Número do Cartão
                    </label>
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-black/10 px-4 py-2.5 rounded-full text-xs text-[#2C2C2C] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#2C2C2C] mb-1">
                      Nome impresso no Cartão
                    </label>
                    <input
                      type="text"
                      placeholder="MARIA SILVA"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-white border border-black/10 px-4 py-2.5 rounded-full text-xs text-[#2C2C2C] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2C2C2C] mb-1">Validade</label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white border border-black/10 px-4 py-2.5 rounded-full text-xs text-[#2C2C2C] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2C2C2C] mb-1">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-white border border-black/10 px-4 py-2.5 rounded-full text-xs text-[#2C2C2C] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    id="btn-submit-card-payment"
                    onClick={handleSimulatePayment}
                    disabled={isProcessingPayment}
                    className="w-full mt-2 py-3 px-4 bg-[#2C2C2C] text-white rounded-full font-medium tracking-wide hover:bg-[#A68A56] transition shadow-sm text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pagar R$ {activePayment.amountBrl.toFixed(2)} com Cartão</span>
                  </button>
                </div>
              )}

              {/* Trust Badge Footer */}
              <div className="text-center pt-2">
                <div className="inline-flex items-center gap-1.5 text-[11px] text-[#2C2C2C] opacity-50">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#A68A56]" />
                  <span>Processamento seguro via Mercado Pago Oficial</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
