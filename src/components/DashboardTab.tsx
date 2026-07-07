/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, DollarSign, Wallet, Percent, ShoppingBag, Award, ChevronRight, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Custo, Venda, Produto, Cliente, TabType } from '../types';

interface DashboardTabProps {
  custos: Custo[];
  vendas: Venda[];
  produtos: Produto[];
  clientes: Cliente[];
  onTabChange: (tab: TabType) => void;
}

export default function DashboardTab({ custos, vendas, produtos, clientes, onTabChange }: DashboardTabProps) {
  // Calculations
  const receitaTotal = vendas
    .filter(v => v.status === 'Concluído')
    .reduce((acc, curr) => acc + (curr.quantidade * curr.valorUnitario), 0);

  const custoTotal = custos.reduce((acc, curr) => acc + curr.valor, 0);
  const lucroTotal = receitaTotal - custoTotal;
  const margemLucro = receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0;
  const totalPedidos = vendas.filter(v => v.status === 'Concluído').length;
  const ticketMedio = totalPedidos > 0 ? receitaTotal / totalPedidos : 0;

  // Format Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Quick stats
  const pendingOrdersCount = vendas.filter(v => v.status === 'Pendente').length;
  const pendingRevenue = vendas
    .filter(v => v.status === 'Pendente')
    .reduce((acc, curr) => acc + (curr.quantidade * curr.valorUnitario), 0);

  const kpis = [
    {
      id: 'receita',
      title: 'Receita Total',
      value: formatCurrency(receitaTotal),
      sub: `${vendas.length} pedidos registrados`,
      color: 'border-emerald-100 bg-emerald-50/50 text-emerald-700',
      icon: DollarSign,
      iconColor: 'bg-emerald-100 text-emerald-600',
    },
    {
      id: 'custos',
      title: 'Custo Total',
      value: formatCurrency(custoTotal),
      sub: `${custos.length} despesas lançadas`,
      color: 'border-rose-100 bg-rose-50/50 text-rose-700',
      icon: Wallet,
      iconColor: 'bg-rose-100 text-rose-600',
    },
    {
      id: 'lucro',
      title: 'Lucro Total',
      value: formatCurrency(lucroTotal),
      sub: lucroTotal >= 0 ? 'Resultado líquido positivo' : 'Resultado líquido negativo',
      color: 'border-blue-100 bg-blue-50/50 text-blue-700',
      icon: TrendingUp,
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'margem',
      title: 'Margem de Lucro',
      value: `${margemLucro.toFixed(2).replace('.', ',')}%`,
      sub: 'Retorno sobre receita',
      color: 'border-amber-100 bg-amber-50/50 text-amber-700',
      icon: Percent,
      iconColor: 'bg-amber-100 text-amber-600',
    },
    {
      id: 'pedidos',
      title: 'Total de Pedidos',
      value: totalPedidos,
      sub: `${pendingOrdersCount} pendentes de conclusão`,
      color: 'border-purple-100 bg-purple-50/50 text-purple-700',
      icon: ShoppingBag,
      iconColor: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'ticket',
      title: 'Ticket Médio',
      value: formatCurrency(ticketMedio),
      sub: 'Média por venda concluída',
      color: 'border-pink-100 bg-pink-50/50 text-pink-700',
      icon: Award,
      iconColor: 'bg-pink-100 text-pink-600',
    },
  ];

  return (
    <div className="space-y-8" id="dashboard-tab-container">
      {/* Top Banner / Hero */}
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl" id="dashboard-hero-banner">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-600 rounded-full filter blur-3xl opacity-10 -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-sm font-medium tracking-wide uppercase mb-2">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>Visão Geral do Negócio</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight mb-2">
              Dashboard DTF Têxtil
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Bem-vindo ao sistema de controle financeiro e operacional. Monitore receitas, custos, vendas, produtos e clientes em tempo real.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => onTabChange('vendas')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 transition-all rounded-xl text-sm font-medium border border-white/10 flex items-center gap-2 cursor-pointer"
              id="quick-sales-btn"
            >
              Ver Vendas <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onTabChange('relatorios')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 transition-all rounded-xl text-sm font-medium text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
              id="quick-reports-btn"
            >
              Relatórios Completos <TrendingUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="kpi-grid">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              key={kpi.id}
              className={`p-6 rounded-2xl border bg-white flex items-start justify-between shadow-xs transition-all hover:shadow-md ${kpi.color}`}
              id={`kpi-card-${kpi.id}`}
            >
              <div className="space-y-3">
                <span className="text-sm font-medium text-slate-500 block">{kpi.title}</span>
                <span className="text-2xl font-bold font-mono tracking-tight block text-slate-900">
                  {kpi.value}
                </span>
                <span className="text-xs text-slate-400 block">{kpi.sub}</span>
              </div>
              <div className={`p-3 rounded-xl ${kpi.iconColor}`} id={`kpi-icon-wrapper-${kpi.id}`}>
                <Icon className="w-6 h-6" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-insights-grid">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4" id="insights-panel">
          <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
            💡 Insights Financeiros e Operacionais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="insights-list">
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100" id="insight-profit">
              <div className="flex items-center gap-2 text-indigo-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="font-semibold text-sm">Margem de Lucro Atual</span>
              </div>
              <p className="text-xs text-slate-500">
                Sua margem está em <strong className="text-slate-800">{margemLucro.toFixed(2)}%</strong>. 
                {margemLucro > 50 
                  ? " Uma excelente margem para o setor têxtil. Continue mantendo custos operacionais controlados." 
                  : " Considere otimizar seus custos com insumos para elevar a rentabilidade acima de 50%."}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100" id="insight-pending">
              <div className="flex items-center gap-2 text-amber-600">
                <Activity className="w-4 h-4" />
                <span className="font-semibold text-sm">Faturamento Pendente</span>
              </div>
              <p className="text-xs text-slate-500">
                Há <strong className="text-slate-800">{pendingOrdersCount}</strong> {pendingOrdersCount === 1 ? 'pedido pendente' : 'pedidos pendentes'}, somando <strong className="text-slate-800">{formatCurrency(pendingRevenue)}</strong> que podem entrar como receita ativa uma vez concluídos.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100" id="insight-product">
              <div className="flex items-center gap-2 text-emerald-600">
                <Award className="w-4 h-4" />
                <span className="font-semibold text-sm">Eficiência Operacional</span>
              </div>
              <p className="text-xs text-slate-500">
                O portfólio possui <strong className="text-slate-800">{produtos.length}</strong> produtos cadastrados. O tempo médio de produção estimado é de <strong className="text-slate-800">{(produtos.reduce((acc, p) => acc + p.tempoProducao, 0) / (produtos.length || 1)).toFixed(1)} minutos</strong> por item.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100" id="insight-clients">
              <div className="flex items-center gap-2 text-purple-600">
                <ShoppingBag className="w-4 h-4" />
                <span className="font-semibold text-sm">Perfil de Clientes</span>
              </div>
              <p className="text-xs text-slate-500">
                Sua base de <strong className="text-slate-800">{clientes.length} clientes</strong> está dividida em <strong className="text-slate-800">{clientes.filter(c => c.tipo === 'PF').length} PF</strong> e <strong className="text-slate-800">{clientes.filter(c => c.tipo === 'PJ').length} PJ</strong>. Clientes corporativos (PJ) costumam realizar pedidos de maior volume.
              </p>
            </div>
          </div>
        </div>

        {/* Small Action Card */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 flex flex-col justify-between shadow-xs" id="cta-card">
          <div className="space-y-3">
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full inline-block">
              INTEGRAÇÃO DIRETA
            </span>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Exportar para o Microsoft Excel
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Você pode baixar uma cópia desta planilha com a formatação e as fórmulas originais configuradas para o Excel (.xls) a qualquer momento.
            </p>
          </div>
          <button 
            onClick={() => onTabChange('relatorios')}
            className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-2"
            id="go-to-export-btn"
          >
            Exportar na aba de Relatórios
          </button>
        </div>
      </div>
    </div>
  );
}
