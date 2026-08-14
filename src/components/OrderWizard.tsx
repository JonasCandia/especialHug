import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Trash2,
  HelpCircle,
  Info,
  Loader2,
  Heart
} from 'lucide-react';
import type { Theme } from '../types.js';

interface OrderWizardProps {
  theme: Theme;
  userEmail: string;
  onBack: () => void;
  onOrderCreated: (orderId: string) => void;
}

export const OrderWizard: React.FC<OrderWizardProps> = ({
  theme,
  userEmail,
  onBack,
  onOrderCreated
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string>(
    theme.availableStyles[0]?.id || ''
  );
  const [photos, setPhotos] = useState<string[]>([]);
  const [customerEmail, setCustomerEmail] = useState<string>(userEmail || '');
  const [customerName, setCustomerName] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [consentAccepted, setConsentAccepted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Emotional loading messages
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const loadingMessages = [
    'Analisando as fotos enviadas e identificando traços...',
    'Harmonizando iluminação divina e tons acolhedores...',
    'Compondo o abraço afetuoso com máxima delicadeza...',
    'Pintando detalhes e expressões com sentimento...',
    'Finalizando prévia artística com marca d\'água segura...'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSubmitting) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isSubmitting]);

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor, selecione um arquivo de imagem válido (JPG, PNG ou WebP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('A foto não pode ultrapassar 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPhotos((prev) => {
        const updated = [...prev];
        updated[index] = base64;
        return updated;
      });
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    const validPhotos = photos.filter((p) => Boolean(p));
    if (validPhotos.length < theme.photosRequired) {
      setErrorMessage(`Por favor, envie todas as ${theme.photosRequired} foto(s) necessárias para este tema.`);
      return;
    }

    if (!customerEmail || !customerEmail.includes('@')) {
      setErrorMessage('Por favor, informe um e-mail válido para receber o seu pedido.');
      return;
    }

    if (!consentAccepted) {
      setErrorMessage('Você deve declarar a titularidade/autorização das fotos e aceitar os Termos.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: theme.id,
          photos: validPhotos,
          styleChosen: selectedStyle,
          customerEmail: customerEmail.trim(),
          customerName: customerName.trim(),
          customNotes: customNotes.trim()
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Erro ao processar pedido');
      }

      onOrderCreated(data.order.id);
    } catch (err: any) {
      console.error('Submit order error:', err);
      setErrorMessage(err?.message || 'Falha ao criar o pedido. Verifique sua conexão e tente novamente.');
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-black/5 shadow-sm relative overflow-hidden">
          
          <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-[#FAF9F6] border border-[#A68A56]/30 flex items-center justify-center text-[#A68A56] shadow-sm animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>

          <h2 className="text-3xl font-serif italic text-[#2C2C2C] mb-2">
            Criando seu Abraço com IA...
          </h2>
          
          <p className="text-xs uppercase tracking-widest font-bold text-[#A68A56] mb-8">
            {theme.name} • {theme.subtitle}
          </p>

          {/* Progress Animation */}
          <div className="w-full bg-[#EAE8E1] rounded-full h-2 mb-6 overflow-hidden">
            <div className="bg-[#A68A56] h-2 rounded-full animate-[progress_15s_ease-in-out_infinite]" />
          </div>

          <div className="flex items-center justify-center gap-2.5 text-[#2C2C2C] text-xs font-medium bg-[#FAF9F6] border border-black/5 py-3 px-5 rounded-full max-w-lg mx-auto">
            <Loader2 className="w-4 h-4 text-[#A68A56] animate-spin shrink-0" />
            <span className="italic">{loadingMessages[loadingStep]}</span>
          </div>

          <p className="text-[11px] text-[#2C2C2C] opacity-50 mt-6">
            A geração costuma levar cerca de 10 a 20 segundos. Sua prévia segura será exibida a seguir.
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Header Back Link */}
      <button
        id="wizard-back-btn"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#2C2C2C] opacity-60 hover:opacity-100 hover:text-[#A68A56] mb-6 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao catálogo de temas</span>
      </button>

      {/* Main Form Container */}
      <div className="bg-white rounded-[32px] border border-black/5 shadow-sm overflow-hidden">
        
        {/* Banner Top */}
        <div className="bg-[#2C2C2C] p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#A68A56] block mb-1">
                Configuração do Pedido
              </span>
              <h1 className="text-3xl font-serif italic tracking-tight">
                {theme.name}
              </h1>
              <p className="text-xs text-white/70 mt-1 max-w-xl">
                {theme.subtitle}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shrink-0 self-start sm:self-auto">
              <span className="text-[10px] uppercase tracking-widest text-white/60 block">Requisito</span>
              <strong className="text-xs text-white font-bold">{theme.photosRequired} {theme.photosRequired === 1 ? 'Foto' : 'Fotos'}</strong>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          
          {/* Section 1: Style Selection */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#FAF9F6] border border-[#A68A56]/30 text-[#A68A56] font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h2 className="text-xl font-serif italic text-[#2C2C2C]">Escolha o Estilo Artístico</h2>
            </div>
            <p className="text-xs text-[#2C2C2C] opacity-60 mb-4">
              Cada estilo define o tratamento de luz, delicadeza e textura da pintura digital.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {theme.availableStyles.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    id={`style-opt-${style.id}`}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 rounded-[20px] border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-[#A68A56] bg-[#FAF9F6] shadow-sm ring-1 ring-[#A68A56]'
                        : 'border-black/5 hover:border-[#A68A56]/30 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3.5 right-3.5 text-[#A68A56]">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                    <h3 className="font-serif italic font-semibold text-[#2C2C2C] text-sm mb-1">{style.name}</h3>
                    <p className="text-xs text-[#2C2C2C] opacity-60 leading-snug">{style.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Photo Uploads (1 or 2 slots) */}
          <div className="pt-6 border-t border-black/5">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#FAF9F6] border border-[#A68A56]/30 text-[#A68A56] font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="text-xl font-serif italic text-[#2C2C2C]">
                Envio das Fotos ({theme.photosRequired} {theme.photosRequired === 1 ? 'Foto' : 'Fotos'})
              </h2>
            </div>
            
            {/* Sensitive theme respectful notice */}
            {theme.id === 'ente-querido' && (
              <div className="mb-6 bg-[#FAF9F6] border border-[#A68A56]/20 rounded-[20px] p-4 flex items-start gap-3">
                <Heart className="w-5 h-5 text-[#A68A56] shrink-0 mt-0.5" />
                <div className="text-xs text-[#2C2C2C] opacity-80 leading-relaxed">
                  <strong>Espaço Memorial de Acolhimento:</strong> Sabemos o quanto esta memória é preciosa. Tratamos as fotos com máximo zelo e respeito emocional para criar uma homenagem digna e reconfortante.
                </div>
              </div>
            )}

            {/* Photo Slots Grid */}
            <div className={`grid grid-cols-1 ${theme.photosRequired === 2 ? 'sm:grid-cols-2' : ''} gap-6`}>
              {Array.from({ length: theme.photosRequired }).map((_, index) => {
                const photoSrc = photos[index];
                const label = theme.photoLabels[index] || `Foto ${index + 1}`;
                const tip = theme.photoTips[index] || 'Envie uma foto clara';

                return (
                  <div
                    key={index}
                    className="border-2 border-dashed border-[#A68A56]/30 hover:border-[#A68A56] bg-[#FAF9F6] rounded-[24px] p-5 transition text-center flex flex-col items-center justify-between"
                  >
                    <div className="w-full mb-3 text-left">
                      <span className="text-[10px] font-bold text-[#A68A56] uppercase tracking-widest block">
                        Slot {index + 1}: {label}
                      </span>
                      <p className="text-[11px] text-[#2C2C2C] opacity-60">{tip}</p>
                    </div>

                    {photoSrc ? (
                      <div className="relative w-full aspect-square max-h-56 rounded-[18px] overflow-hidden border border-[#A68A56]/30 shadow-sm group">
                        <img
                          src={photoSrc}
                          alt={`Foto enviada ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="bg-[#2C2C2C] text-white p-2.5 rounded-full text-xs flex items-center gap-1.5 hover:bg-red-700 shadow transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Trocar Foto</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full aspect-square max-h-56 rounded-[18px] bg-white border border-black/5 hover:border-[#A68A56]/40 transition flex flex-col items-center justify-center p-6 cursor-pointer group">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(index, e)}
                        />
                        <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-[#A68A56]/30 text-[#A68A56] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="font-serif italic font-semibold text-[#2C2C2C] text-sm mb-1">
                          Selecionar Foto
                        </span>
                        <span className="text-[11px] text-[#2C2C2C] opacity-50">JPG, PNG ou WebP até 15MB</span>
                      </label>
                    )}

                    {photoSrc && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#A68A56] font-semibold mt-3">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Foto carregada com sucesso</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Contact & LGPD */}
          <div className="pt-6 border-t border-black/5 space-y-4">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#FAF9F6] border border-[#A68A56]/30 text-[#A68A56] font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h2 className="text-xl font-serif italic text-[#2C2C2C]">Seus Dados & Termos de Uso</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2C2C2C] mb-1.5">
                  Seu E-mail (para vincular aos créditos e pedidos) *
                </label>
                <input
                  type="email"
                  required
                  id="wizard-input-email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full px-4 py-3 rounded-full border border-black/10 focus:border-[#A68A56] focus:ring-1 focus:ring-[#A68A56] text-sm outline-none bg-[#FAF9F6]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C2C2C] mb-1.5">
                  Seu Nome ou Como gostaria de ser chamado(a) (opcional)
                </label>
                <input
                  type="text"
                  id="wizard-input-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Maria Silva"
                  className="w-full px-4 py-3 rounded-full border border-black/10 focus:border-[#A68A56] focus:ring-1 focus:ring-[#A68A56] text-sm outline-none bg-[#FAF9F6]/50"
                />
              </div>
            </div>

            {/* LGPD Consent Checkbox */}
            <div className="bg-[#FAF9F6] border border-[#A68A56]/20 rounded-[24px] p-5 mt-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="wizard-consent-checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#A68A56] accent-[#A68A56] rounded border-black/20 focus:ring-[#A68A56]"
                />
                <span className="text-xs text-[#2C2C2C] opacity-80 leading-relaxed">
                  <strong>Declaração de Consentimento & LGPD:</strong> Declaro que sou o titular ou possuo autorização legítima das imagens enviadas neste pedido (incluindo terceiros, pessoas falecidas ou pets). Concordo que as fotos serão utilizadas exclusivamente para a composição de IA e serão excluídas automaticamente em 30 dias.
                </span>
              </label>
            </div>
          </div>

          {/* Error Banner if any */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#2C2C2C] opacity-60 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#A68A56] shrink-0" />
              <span>Você verá a prévia artística com marca d'água antes de pagar.</span>
            </div>

            <button
              type="submit"
              id="wizard-submit-generate-btn"
              className="w-full sm:w-auto py-4 px-8 bg-[#2C2C2C] text-white rounded-full font-medium tracking-wide hover:bg-[#A68A56] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 text-sm"
            >
              <Sparkles className="w-4 h-4 text-[#A68A56]" />
              <span>Gerar Prévia Artística</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
