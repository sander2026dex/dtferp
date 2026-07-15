/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Wallet, 
  Archive, 
  Users, 
  Truck, 
  FileText, 
  CheckCircle, 
  ArrowRight,
  ShieldCheck,
  Zap,
  MessageSquare,
  HelpCircle,
  Smartphone
} from 'lucide-react';

interface LandingPageProps {
  onStartTrial: () => void;
  onGoToLogin: () => void;
}

export default function LandingPage({ onStartTrial, onGoToLogin }: LandingPageProps) {
  
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      
      const diff = midnight.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setTimeLeft(formatted);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleWhatsAppRedirect = () => {
    const message = encodeURIComponent("quero comprar sistema do dtf textil");
    window.open(`https://api.whatsapp.com/send?phone=5511943152441&text=${message}`, '_blank');
  };

  const features = [
    {
      icon: TrendingUp,
      title: 'Controle de Vendas',
      desc: 'Registre e acompanhe o status de cada venda (Pendente ou Concluída) com relatórios detalhados.',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    },
    {
      icon: Wallet,
      title: 'Fluxo de Custos',
      desc: 'Monitore insumos (Filme PET, Tintas CMYK+W, Pó Adesivo) e custos fixos com categorização inteligente.',
      color: 'bg-rose-50 text-rose-600 border-rose-100'
    },
    {
      icon: Archive,
      title: 'Catálogo de Produtos',
      desc: 'Calcule o custo unitário exato de produção, tempo de fabricação e preço ideal de venda.',
      color: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    {
      icon: Users,
      title: 'Carteira de Clientes',
      desc: 'Fichas cadastrais completas com segmentação PF/PJ e histórico consolidado de pedidos.',
      color: 'bg-purple-50 text-purple-600 border-purple-100'
    },
    {
      icon: Truck,
      title: 'Gestão de Fornecedores',
      desc: 'Controle seus parceiros de insumos de DTF, preços praticados e dados fiscais rápidos.',
      color: 'bg-amber-50 text-amber-600 border-amber-100'
    },
    {
      icon: FileText,
      title: 'Orçamentos Personalizados',
      desc: 'Gere simulações com tributação local (ICMS/ISS), notas de venda e baixe arquivos PDF limpos.',
      color: 'bg-teal-50 text-teal-600 border-teal-100'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-indigo-500 selection:text-white" id="landing-container">
      
      {/* Promo Countdown Banner */}
      <div className="bg-amber-600 text-white text-[11px] sm:text-xs py-2 px-4 font-bold text-center flex flex-wrap items-center justify-center gap-2 border-b border-amber-500 shadow-xs" id="landing-promo-banner">
        <span className="bg-amber-700/60 px-2 py-0.5 rounded-md text-[10px] uppercase font-black">PROMOÇÃO DE HOJE</span>
        <span>Aproveite o período de 1 Dia de Teste Grátis! Oferta expira em:</span>
        <span className="font-mono bg-amber-950/40 px-2.5 py-0.5 rounded-md text-amber-100 font-extrabold tracking-wider">{timeLeft}</span>
        <button 
          onClick={onStartTrial}
          className="underline hover:text-amber-100 cursor-pointer text-[11px] font-extrabold transition-colors ml-1"
        >
          Cadastrar Grátis Agora
        </button>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100" id="landing-header">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/10">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block">SOFTWARE PREMIUM</span>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">DTF Têxtil ERP</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onGoToLogin}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Entrar no Sistema
            </button>
            <button 
              onClick={onStartTrial}
              className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
            >
              Testar 1 Dia Grátis
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-linear-to-b from-white to-slate-50/50" id="landing-hero">
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" /> Lançamento de Alta Performance 2026
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display leading-tight">
              O melhor e mais prático <span className="text-indigo-600">Sistema de Gestão</span> para DTF Têxtil
            </h2>
            
            <p className="text-slate-600 text-base max-w-xl leading-relaxed">
              Monitore custos de bobinas de filme PET, tintas CMYK+W e pó termocolante adesivo. Registre suas vendas, cadastre fornecedores e clientes e emita orçamentos elegantes em segundos.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onStartTrial}
                className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-indigo-600/15 group"
              >
                Criar Conta Grátis (1 Dia de Teste) <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={handleWhatsAppRedirect}
                className="px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-emerald-600/15"
              >
                <MessageSquare className="w-4.5 h-4.5" /> Pague Aqui R$ 25/mês
              </button>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-400 font-medium pt-4">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Sem fidelidade</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> Ativação Instantânea</span>
            </div>
          </div>

          <div className="lg:col-span-5 relative" id="hero-interactive-element">
            <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl blur-3xl -z-10 transform rotate-6 scale-95"></div>
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <span className="text-xs font-bold text-slate-400 font-mono">DASHBOARD_LIVE</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Faturamento Estimado</span>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">R$ 14.850,00</p>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 block">▲ +12% em relação ao mês anterior</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Bobinas Usadas</span>
                    <strong className="text-sm text-slate-800 block mt-1">12 Rolos</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Orçamentos Emitidos</span>
                    <strong className="text-sm text-indigo-600 block mt-1">34 Ativos</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Core ERP Modules / Features */}
      <section className="py-20 bg-white border-y border-slate-100" id="landing-features">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest block">RECURSOS DO SISTEMA</span>
            <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Tudo o que sua estamparia DTF precisa para lucrar</h3>
            <p className="text-slate-500 text-xs">
              Módulos construídos de forma integrada para calcular precisamente seus lucros e organizar seu estoque de insumos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 hover:border-slate-200 transition-all flex gap-4">
                  <div className={`p-3 rounded-2xl border shrink-0 ${feat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-800">{feat.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Pricing / CTA Section */}
      <section className="py-20 bg-linear-to-b from-slate-50/50 to-white" id="landing-pricing">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-10">
          <div className="max-w-xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest block">PREÇO ÚNICO</span>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Investimento Simples e Justo</h3>
            <p className="text-slate-500 text-xs">
              Esqueça mensalidades abusivas e taxas escondidas. Ative seu sistema completo com total liberdade de cancelamento.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-white rounded-3xl border border-indigo-100 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
              Mais Vendido
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900">Plano Mensal Completo</h4>
                <p className="text-xs text-slate-400">Acesso a todos os módulos e suporte premium</p>
              </div>

              <div className="py-4 border-y border-slate-100 flex items-baseline justify-center gap-1.5">
                <span className="text-sm font-bold text-slate-400">R$</span>
                <span className="text-5xl font-extrabold text-slate-900 tracking-tight">25</span>
                <span className="text-sm font-medium text-slate-400">/ mês</span>
              </div>

              <ul className="space-y-3 text-left text-xs text-slate-600 max-w-xs mx-auto">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Individualização de dados segura</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Emissor de orçamentos fiscais</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Bloqueio de Login Multi-dispositivo</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Exportação de relatórios para CSV</li>
              </ul>

              <button
                onClick={handleWhatsAppRedirect}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-5050 text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/15"
              >
                <MessageSquare className="w-4.5 h-4.5" /> Adquirir Sistema - Chamar no WhatsApp
              </button>
              
              <button
                onClick={onStartTrial}
                className="w-full text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors py-1 cursor-pointer block"
              >
                Ou iniciar período de teste de 1 dia grátis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Safety device locked badge */}
      <section className="py-10 bg-slate-100/50 border-t border-slate-200/50" id="landing-security-badge">
        <div className="max-w-md mx-auto px-6 text-center space-y-2">
          <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
            <Smartphone className="w-3.5 h-3.5" /> Hardware Device Locking Active
          </div>
          <p className="text-[11px] text-slate-400">
            Cada licença gerada é vinculada por serial a 1 (um) único dispositivo físico para garantir a máxima segurança dos seus dados contra clonagem.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-450 py-12 mt-auto text-xs text-center border-t border-slate-800" id="landing-footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500">© 2026 DTF Têxtil ERP. Todos os direitos reservados. Suporte: WhatsApp 11 94315-2441</p>
          <div className="flex gap-4 text-slate-400 font-bold">
            <button onClick={onGoToLogin} className="hover:text-white transition-colors cursor-pointer">Login</button>
            <button onClick={onStartTrial} className="hover:text-white transition-colors cursor-pointer">Cadastro</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
