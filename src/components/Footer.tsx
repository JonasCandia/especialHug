import React from 'react';
import { Heart, ShieldCheck, FileText, Lock, Sparkles } from 'lucide-react';

interface FooterProps {
  onOpenTerms: () => void;
  onOpenAdmin: () => void;
  onOpenCreditsModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenTerms,
  onOpenAdmin,
  onOpenCreditsModal
}) => {
  return (
    <footer className="bg-[#FAF9F6] text-[#2C2C2C] border-t border-black/5 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-black/5">
          
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 block mb-1">
              Segurança
            </span>
            <p className="text-xs opacity-60 leading-relaxed">
              Pagamentos criptografados de ponta a ponta via Mercado Pago Oficial com liberação instantânea via Pix ou Cartão.
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 block mb-1">
              Qualidade
            </span>
            <p className="text-xs opacity-60 leading-relaxed">
              Resolução ultra-HD com algoritmos artísticos sensíveis afinados para máxima fidelidade e afeto memorial.
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 block mb-1">
              Privacidade LGPD
            </span>
            <p className="text-xs opacity-60 leading-relaxed">
              Fotos originais com exclusão automatizada em 30 dias. Sigilo moral e conformidade total com a Lei Geral de Proteção de Dados.
            </p>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-60">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#A68A56] text-white flex items-center justify-center text-xs">
              <Heart className="w-3.5 h-3.5 fill-white" />
            </div>
            <span className="font-serif italic font-semibold text-sm text-[#2C2C2C]">Abraço</span>
            <span className="text-[11px] opacity-70">© {new Date().getFullYear()} — Fotos com IA por Temas.</span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <button
              onClick={onOpenCreditsModal}
              className="hover:text-[#A68A56] transition cursor-pointer"
            >
              Recarga de Créditos
            </button>
            <button
              onClick={onOpenTerms}
              className="hover:text-[#A68A56] transition cursor-pointer"
            >
              Termos de Uso & LGPD
            </button>
            <button
              onClick={onOpenAdmin}
              className="hover:text-[#A68A56] opacity-60 hover:opacity-100 transition cursor-pointer text-[11px]"
            >
              Admin
            </button>
          </div>
        </div>

        <p className="text-[11px] opacity-40 text-center italic mt-8">
          "Eternizando o afeto, a memória e a saudade com delicadeza e sensibilidade artística."
        </p>

      </div>
    </footer>
  );
};
