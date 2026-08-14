import React from 'react';
import { Sparkles, Camera, ShieldCheck, Heart, ArrowRight, Clock, Star, CheckCircle2 } from 'lucide-react';
import type { Theme } from '../types.js';

interface ThemeCatalogProps {
  themes: Theme[];
  onSelectTheme: (theme: Theme) => void;
  onOpenCreditsModal: () => void;
  onOpenTerms: () => void;
}

export const ThemeCatalog: React.FC<ThemeCatalogProps> = ({
  themes,
  onSelectTheme,
  onOpenCreditsModal,
  onOpenTerms
}) => {
  return (
    <div className="w-full pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-16 pb-14 bg-gradient-to-b from-[#EAE8E1]/40 via-[#FAF9F6] to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-[#A68A56]/30 text-[#A68A56] text-[11px] font-bold uppercase tracking-widest mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#A68A56]" />
            <span>Tecnologia de IA Sensível & Resolução HD</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#2C2C2C] leading-[1.15] mb-5 tracking-tight">
            Dê vida às suas memórias mais{' '}
            <span className="italic text-[#A68A56] font-light">
              preciosas
            </span>
            .
          </h1>

          <p className="text-base sm:text-lg text-[#2C2C2C] opacity-70 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Nossa Inteligência Artificial cria conexões visuais únicas entre você e quem você ama. 
            Você só paga após visualizar e se emocionar com a prévia artística.
          </p>

          {/* Value props pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="flex items-start gap-3 bg-white p-5 rounded-[24px] border border-black/5 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#A68A56]/20 flex items-center justify-center text-[#A68A56] shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif italic font-semibold text-[#2C2C2C] text-sm mb-0.5">Prévia Gratuita</h3>
                <p className="text-xs text-[#2C2C2C] opacity-60 leading-relaxed">Veja a arte com marca d'água antes do pagamento.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-5 rounded-[24px] border border-black/5 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#A68A56]/20 flex items-center justify-center text-[#A68A56] shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif italic font-semibold text-[#2C2C2C] text-sm mb-0.5">1 Crédito por Arte</h3>
                <p className="text-xs text-[#2C2C2C] opacity-60 leading-relaxed">R$ 5,00 avulso ou R$ 10,00 no pacote com 3 créditos.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-5 rounded-[24px] border border-black/5 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#A68A56]/20 flex items-center justify-center text-[#A68A56] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif italic font-semibold text-[#2C2C2C] text-sm mb-0.5">Privacidade LGPD</h3>
                <p className="text-xs text-[#2C2C2C] opacity-60 leading-relaxed">Fotos originais apagadas automaticamente em 30 dias.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 mt-4">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-black/5 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 text-[#2C2C2C] block mb-1">
              Catálogo Oficial
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#2C2C2C] italic">Escolha o Tema do seu Abraço</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#2C2C2C] opacity-60 max-w-md">
            Algoritmos sensíveis especialmente afinados para recriar o clima afetivo e memorial com harmonia estética.
          </p>
        </div>

        {/* Catalog Theme Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {themes.map((theme) => (
            <div
              key={theme.id}
              id={`theme-card-${theme.id}`}
              className="group relative bg-white rounded-[32px] p-6 shadow-sm border border-black/5 hover:border-[#A68A56]/40 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Preview Container */}
              <div className="aspect-[4/3] bg-[#E5E2DA] rounded-[24px] mb-6 overflow-hidden relative">
                <img
                  src={theme.exampleImage}
                  alt={theme.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {theme.badge && (
                    <span className="bg-[#A68A56] text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                      {theme.badge}
                    </span>
                  )}
                  <span className="bg-white/90 backdrop-blur-md text-[#2C2C2C] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Camera className="w-3 h-3 text-[#A68A56]" />
                    <span>{theme.photosRequired === 1 ? '1 Foto Necessária' : '2 Fotos Necessárias'}</span>
                  </span>
                </div>

                {/* Emotional quote bottom overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs text-white/95 italic font-serif leading-snug drop-shadow-sm">
                    "{theme.emotionalCopy}"
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-serif italic text-[#2C2C2C] mb-1 group-hover:text-[#A68A56] transition-colors">
                    {theme.name}
                  </h3>
                  
                  <p className="text-xs font-semibold text-[#A68A56] mb-3">
                    {theme.subtitle}
                  </p>

                  <p className="text-xs text-[#2C2C2C] opacity-65 leading-relaxed mb-5">
                    {theme.description}
                  </p>

                  {/* Styles pill list */}
                  <div className="mb-6">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 block mb-2">
                      Estilos Disponíveis:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {theme.availableStyles.map((style) => (
                        <span
                          key={style.id}
                          className="text-[11px] bg-[#FAF9F6] text-[#2C2C2C] border border-black/5 px-2.5 py-1 rounded-full font-medium"
                        >
                          {style.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                <button
                  id={`cta-select-theme-${theme.id}`}
                  onClick={() => onSelectTheme(theme)}
                  className="w-full py-3.5 px-5 bg-[#2C2C2C] text-white rounded-full font-medium tracking-wide hover:bg-[#A68A56] transition-colors duration-200 flex items-center justify-center gap-2 group/btn cursor-pointer text-sm shadow-sm active:scale-98"
                >
                  <span>Escolher este tema</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>

              </div>
            </div>
          ))}
        </div>

      </section>

      {/* How it Works Step-by-Step */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 mt-20 pt-12 border-t border-black/5">
        <div className="text-center mb-12">
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 block mb-2">
            Transparência & Processo
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif italic text-[#2C2C2C]">Como funciona o Abraço</h2>
          <p className="text-xs sm:text-sm text-[#2C2C2C] opacity-60 max-w-xl mx-auto mt-2">
            Simples, delicado e seguro. Você tem controle total em cada etapa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-[28px] border border-black/5 shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#A68A56]/30 text-[#A68A56] font-serif italic font-bold flex items-center justify-center text-base mb-4">
              1
            </div>
            <h4 className="font-serif italic font-semibold text-[#2C2C2C] text-base mb-1.5">Escolha o Tema</h4>
            <p className="text-xs text-[#2C2C2C] opacity-60 leading-relaxed">Selecione entre Jesus, Ente Querido ou Companheiro Pet.</p>
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-black/5 shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#A68A56]/30 text-[#A68A56] font-serif italic font-bold flex items-center justify-center text-base mb-4">
              2
            </div>
            <h4 className="font-serif italic font-semibold text-[#2C2C2C] text-base mb-1.5">Envie as Fotos</h4>
            <p className="text-xs text-[#2C2C2C] opacity-60 leading-relaxed">Envie 1 ou 2 fotos nítidas do seu celular ou computador.</p>
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-black/5 shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#A68A56]/30 text-[#A68A56] font-serif italic font-bold flex items-center justify-center text-base mb-4">
              3
            </div>
            <h4 className="font-serif italic font-semibold text-[#2C2C2C] text-base mb-1.5">Veja a Prévia</h4>
            <p className="text-xs text-[#2C2C2C] opacity-60 leading-relaxed">A IA gera a composição com marca d'água para você avaliar.</p>
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-black/5 shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-[#A68A56] text-white font-serif italic font-bold flex items-center justify-center text-base mb-4 shadow-sm">
              4
            </div>
            <h4 className="font-serif italic font-semibold text-[#2C2C2C] text-base mb-1.5">Libere em Alta Resolução</h4>
            <p className="text-xs text-[#2C2C2C] opacity-60 leading-relaxed">Use 1 crédito ou pague R$ 5 para baixar o arquivo master sem marcas.</p>
          </div>

        </div>

        {/* LGPD Banner */}
        <div className="mt-12 bg-white rounded-[28px] border border-[#A68A56]/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-[#A68A56]/30 text-[#A68A56] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif italic font-semibold text-[#2C2C2C] text-base">Privacidade & Respeito Memorial (LGPD)</h4>
              <p className="text-xs text-[#2C2C2C] opacity-60 max-w-xl mt-0.5 leading-relaxed">
                Suas fotos são tratadas com sigilo moral absoluto e serão apagadas em até 30 dias.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenTerms}
            className="text-xs font-bold uppercase tracking-widest text-[#A68A56] hover:text-[#8F7444] underline shrink-0 transition"
          >
            Termos & LGPD
          </button>
        </div>

      </section>
    </div>
  );
};
