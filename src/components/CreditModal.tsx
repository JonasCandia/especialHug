import React, { useState } from 'react';
import {
  X,
  Coins,
  Sparkles,
  CheckCircle,
  QrCode,
  CreditCard,
  Copy,
  ShieldCheck,
  Zap
} from 'lucide-react';
import type { CreditPackage, Payment } from '../types.js';

interface CreditModalProps {
  isOpen: boolean;
  userEmail: string;
  userCredits: number;
  onClose: () => void;
  onCreditsUpdated: () => void;
  onEmailChanged: (email: string) => void;
}

export const CreditModal: React.FC<CreditModalProps> = ({
  isOpen,
  userEmail,
  userCredits,
  onClose,
  onCreditsUpdated,
  onEmailChanged
}) => {
  const [emailInput, setEmailInput] = useState<string>(userEmail || '');
  const [selectedPackId, setSelectedPackId] = useState<string>('pack-3');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [activePayment, setActivePayment] = useState<Payment | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedPix, setCopiedPix] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const packages: CreditPackage[] = [
    { id: 'pack-1', credits: 1, priceBrl: 5.0, tag: 'Básico' },
    {
      id: 'pack-3',
      credits: 3,
      priceBrl: 10.0,
      originalPriceBrl: 15.0,
      tag: 'Mais Popular',
      popular: true
    },
    {
      id: 'pack-5',
      credits: 5,
      priceBrl: 15.0,
      originalPriceBrl: 25.0,
      tag: 'Super Pacote'
    }
  ];

  const handleStartPurchase = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      setErrorMessage('Por favor, informe um e-mail válido para vincular os créditos.');
      return;
    }

    onEmailChanged(emailInput.trim().toLowerCase());
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/credits/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim().toLowerCase(),
          packageId: selectedPackId,
          method: paymentMethod
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erro ao gerar pagamento');

      setActivePayment(data.payment);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao processar compra de créditos');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateApproval = async () => {
    if (!activePayment) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/payments/${activePayment.id}/simulate-success`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      onCreditsUpdated();
      setActivePayment(null);
      alert('Créditos adicionados com sucesso!');
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao simular aprovação');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPix = () => {
    if (activePayment?.pixCopyPaste) {
      navigator.clipboard.writeText(activePayment.pixCopyPaste);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] border border-black/5 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#FAF9F6] p-6 text-[#2C2C2C] border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#A68A56] text-white flex items-center justify-center shadow-sm">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif italic text-xl font-semibold text-[#2C2C2C]">Comprar Créditos</h3>
              <p className="text-xs text-[#2C2C2C] opacity-60">1 crédito = 1 arte em Alta Resolução liberada</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#2C2C2C] opacity-50 hover:opacity-100 p-2 rounded-full hover:bg-black/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Current Balance Bar */}
          <div className="bg-[#FAF9F6] border border-[#A68A56]/30 rounded-[20px] p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#A68A56]" />
              <span className="text-xs font-semibold text-[#2C2C2C] opacity-70">Seu Saldo Atual:</span>
            </div>
            <span className="text-sm font-serif italic font-bold text-[#A68A56]">
              {userCredits} {userCredits === 1 ? 'crédito' : 'créditos'}
            </span>
          </div>

          {!activePayment ? (
            <>
              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-[#2C2C2C] mb-1">
                  Seu E-mail (para vincular os créditos) *
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full px-4 py-2.5 rounded-full border border-black/10 focus:border-[#A68A56] text-xs text-[#2C2C2C] outline-none"
                />
              </div>

              {/* Package Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#2C2C2C]">
                  Escolha seu Pacote de Créditos:
                </label>

                <div className="grid grid-cols-1 gap-2.5">
                  {packages.map((pack) => {
                    const isSelected = selectedPackId === pack.id;
                    return (
                      <button
                        key={pack.id}
                        type="button"
                        onClick={() => setSelectedPackId(pack.id)}
                        className={`p-4 rounded-[20px] border flex items-center justify-between text-left transition cursor-pointer relative ${
                          isSelected
                            ? 'border-[#A68A56] bg-[#FAF9F6] ring-1 ring-[#A68A56]'
                            : 'border-black/5 hover:border-[#A68A56]/40 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-[#A68A56] text-white' : 'bg-[#FAF9F6] text-[#2C2C2C]'}`}>
                            {pack.credits}x
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-serif italic font-semibold text-[#2C2C2C] text-sm">
                                {pack.credits} {pack.credits === 1 ? 'Crédito' : 'Créditos'}
                              </span>
                              {pack.tag && (
                                <span className="text-[10px] bg-[#A68A56]/15 text-[#A68A56] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  {pack.tag}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#2C2C2C] opacity-50">
                              {pack.credits === 1 ? '1 arte final' : `${pack.credits} artes finais sem marca`}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          {pack.originalPriceBrl && (
                            <span className="text-xs text-[#2C2C2C] opacity-40 line-through block">
                              R$ {pack.originalPriceBrl.toFixed(2)}
                            </span>
                          )}
                          <span className="text-sm font-serif italic font-bold text-[#A68A56]">
                            R$ {pack.priceBrl.toFixed(2)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Switch */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`py-2.5 px-4 rounded-full border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    paymentMethod === 'pix'
                      ? 'border-[#A68A56] bg-[#FAF9F6] text-[#2C2C2C] font-bold ring-1 ring-[#A68A56]'
                      : 'border-black/5 text-[#2C2C2C]'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-[#A68A56]" />
                  <span>Pix Mercado Pago</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2.5 px-4 rounded-full border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-[#A68A56] bg-[#FAF9F6] text-[#2C2C2C] font-bold ring-1 ring-[#A68A56]'
                      : 'border-black/5 text-[#2C2C2C]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#A68A56]" />
                  <span>Cartão de Crédito</span>
                </button>
              </div>

              {errorMessage && (
                <p className="text-xs text-red-600">{errorMessage}</p>
              )}

              {/* Action */}
              <button
                type="button"
                onClick={handleStartPurchase}
                disabled={isProcessing}
                className="w-full bg-[#2C2C2C] hover:bg-[#A68A56] text-white font-medium py-3.5 px-6 rounded-full shadow-sm transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-[#A68A56]" />
                <span>Continuar para Pagamento</span>
              </button>
            </>
          ) : (
            /* Active Payment Details */
            <div className="space-y-4">
              <div className="bg-[#FAF9F6] border border-black/5 rounded-[24px] p-5 text-center space-y-4">
                <span className="text-[10px] font-bold text-[#2C2C2C] opacity-60 uppercase tracking-widest">
                  Pague R$ {activePayment.amountBrl.toFixed(2)} com Pix
                </span>

                <div className="bg-white p-3 rounded-[20px] border border-black/5 w-40 h-40 mx-auto flex items-center justify-center shadow-inner">
                  <QrCode className="w-32 h-32 text-[#2C2C2C]" />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#2C2C2C] mb-1">
                    Código Pix Copia e Cola:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={activePayment.pixCopyPaste || ''}
                      className="w-full bg-white border border-black/10 px-3.5 py-2.5 rounded-full text-xs outline-none select-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="bg-[#2C2C2C] hover:bg-[#A68A56] text-white p-2.5 rounded-full transition shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  {copiedPix && (
                    <span className="text-xs text-[#A68A56] font-semibold block mt-1">
                      Copiado!
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSimulateApproval}
                  disabled={isProcessing}
                  className="w-full bg-[#2C2C2C] hover:bg-[#A68A56] text-white font-medium py-3 px-4 rounded-full text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-[#A68A56]" />
                  <span>Simular Pagamento Aprovado (Teste Instantâneo)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActivePayment(null)}
                className="w-full text-xs text-[#2C2C2C] opacity-60 hover:opacity-100 text-center transition cursor-pointer"
              >
                Voltar e escolher outro pacote
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
