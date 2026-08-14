import React from 'react';
import { Heart, Sparkles, Coins, ShoppingBag, Shield, Clock, Plus } from 'lucide-react';

interface NavbarProps {
  userEmail: string;
  userCredits: number;
  onOpenCreditsModal: () => void;
  onOpenMyOrders: () => void;
  onOpenAdmin: () => void;
  onOpenTerms: () => void;
  onSelectHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userEmail,
  userCredits,
  onOpenCreditsModal,
  onOpenMyOrders,
  onOpenAdmin,
  onOpenTerms,
  onSelectHome
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-black/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
        
        {/* Brand */}
        <button
          id="nav-brand-btn"
          onClick={onSelectHome}
          className="flex items-center gap-3 text-left group transition-transform focus:outline-none cursor-pointer"
        >
          <div className="w-10 h-10 bg-[#A68A56] rounded-full flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif italic font-semibold text-2xl tracking-tight text-[#2C2C2C]">
                Abraço
              </span>
              <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-[#EAE8E1] text-[#A68A56] border border-[#A68A56]/20">
                IA Sensível
              </span>
            </div>
          </div>
        </button>

        {/* Navigation & Actions */}
        <nav className="flex items-center gap-3 sm:gap-6">
          
          <button
            onClick={onSelectHome}
            className="hidden md:inline-block text-xs uppercase tracking-widest font-semibold text-[#2C2C2C] opacity-60 hover:opacity-100 hover:text-[#A68A56] transition"
          >
            Temas
          </button>

          <button
            onClick={onOpenTerms}
            className="hidden lg:inline-block text-xs uppercase tracking-widest font-semibold text-[#2C2C2C] opacity-60 hover:opacity-100 hover:text-[#A68A56] transition"
          >
            Como Funciona
          </button>

          <div className="hidden sm:block h-4 w-[1px] bg-[#2C2C2C] opacity-20" />

          {/* Credits Pill */}
          <div
            id="nav-credits-btn"
            onClick={onOpenCreditsModal}
            className="flex items-center gap-2.5 bg-white px-3.5 sm:px-4 py-2 rounded-full border border-[#A68A56]/30 shadow-sm hover:border-[#A68A56] transition cursor-pointer"
            title="Clique para comprar ou ver saldo de créditos"
          >
            <span className="text-[11px] sm:text-xs uppercase tracking-widest font-bold text-[#A68A56]">
              Saldo: {userCredits} {userCredits === 1 ? 'Crédito' : 'Créditos'}
            </span>
            <button
              type="button"
              className="w-5 h-5 sm:w-6 sm:h-6 bg-[#A68A56] text-white rounded-full flex items-center justify-center text-sm font-bold leading-none hover:bg-[#8F7444] transition shrink-0"
            >
              +
            </button>
          </div>

          {/* My Orders */}
          <button
            id="nav-my-orders-btn"
            onClick={onOpenMyOrders}
            className="flex items-center gap-1.5 bg-white hover:bg-[#F5F3EE] text-[#2C2C2C] border border-black/5 hover:border-[#A68A56]/30 px-3.5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition cursor-pointer shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#A68A56]" />
            <span className="hidden sm:inline">Pedidos</span>
          </button>

          {/* Admin Backoffice */}
          <button
            id="nav-admin-btn"
            onClick={onOpenAdmin}
            className="text-[10px] uppercase tracking-widest font-bold text-[#2C2C2C]/40 hover:text-[#2C2C2C] px-2.5 py-1.5 rounded-full hover:bg-black/5 transition"
            title="Painel Administrativo"
          >
            Admin
          </button>
        </nav>

      </div>
    </header>
  );
};
