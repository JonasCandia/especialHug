import React from 'react';
import { X, ShieldCheck, Heart, FileText, Lock, Clock } from 'lucide-react';

interface LgpdTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LgpdTermsModal: React.FC<LgpdTermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] border border-black/5 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#FAF9F6] p-6 text-[#2C2C2C] border-b border-black/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#A68A56] text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif italic text-xl font-semibold text-[#2C2C2C]">Privacidade (LGPD) & Termos de Uso</h3>
              <p className="text-xs text-[#2C2C2C] opacity-60">Transparência, respeito e proteção aos seus dados afetivos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#2C2C2C] opacity-50 hover:opacity-100 p-2 rounded-full hover:bg-black/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#2C2C2C] text-xs leading-relaxed">
          
          <section className="space-y-2">
            <h4 className="font-serif italic text-sm font-semibold text-[#2C2C2C] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#A68A56]" />
              <span>1. Conformidade com a Lei Geral de Proteção de Dados (LGPD)</span>
            </h4>
            <p className="opacity-80">
              A plataforma <strong>Abraço</strong> trata com extremo sigilo e zelo todas as fotografias e dados pessoais fornecidos pelos usuários. As imagens enviadas são utilizadas exclusivamente para a finalidade de composição artística e processamento pela Inteligência Artificial.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-serif italic text-sm font-semibold text-[#2C2C2C] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#A68A56]" />
              <span>2. Prazo de Retenção e Exclusão Automática (30 Dias)</span>
            </h4>
            <p className="opacity-80">
              Em respeito à sua privacidade, todas as fotos originais enviadas pelo usuário são armazenadas em ambiente seguro e são <strong>excluídas definitivamente de nossos servidores no prazo máximo de 30 dias</strong> após a criação do pedido.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-serif italic text-sm font-semibold text-[#2C2C2C] flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#A68A56]" />
              <span>3. Respeito e Sensibilidade com Entes Queridos e Pets</span>
            </h4>
            <p className="opacity-80">
              O tema <em>"Ente querido que já se foi"</em> foi desenvolvido como uma homenagem afetiva e memorial. O usuário declara e garante que possui a titularidade, parentesco ou a devida autorização moral dos familiares responsáveis para o envio da foto da pessoa homenageada.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-serif italic text-sm font-semibold text-[#2C2C2C] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#A68A56]" />
              <span>4. Links de Download Assinados (Validade de 48 Horas)</span>
            </h4>
            <p className="opacity-80">
              Após a confirmação do pagamento (Mercado Pago Pix ou Cartão) ou o uso de 1 crédito, o link de download em alta resolução sem marca d'água permanece ativo por <strong>48 horas</strong>. Após este período, o link expira por razões de segurança, podendo o usuário solicitar reenvio mediante autenticação pelo e-mail do pedido.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-serif italic text-sm font-semibold text-[#2C2C2C] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#A68A56]" />
              <span>5. Proteção de Marca d'Água e Arquivo Master</span>
            </h4>
            <p className="opacity-80">
              A prévia visualizada antes do pagamento contém uma marca d'água indelével gerada no servidor. O arquivo original em alta definição nunca é tornado público antes da quitação ou validação de créditos.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF9F6] border-t border-black/5 text-right shrink-0">
          <button
            onClick={onClose}
            className="bg-[#2C2C2C] hover:bg-[#A68A56] text-white font-medium py-2.5 px-6 rounded-full text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Entendido e Concordo
          </button>
        </div>

      </div>
    </div>
  );
};
