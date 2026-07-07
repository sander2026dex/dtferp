/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Trash2, Edit2, AlertTriangle, X, DollarSign, Archive, Clock, Percent, Smile } from 'lucide-react';
import { Produto } from '../types';

interface ProdutosTabProps {
  produtos: Produto[];
  onAddProduto: (produto: Omit<Produto, 'id'>) => void;
  onEditProduto: (produto: Produto) => void;
  onDeleteProduto: (id: string) => void;
}

export default function ProdutosTab({ produtos, onAddProduto, onEditProduto, onDeleteProduto }: ProdutosTabProps) {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    custoUnitario: '',
    precoVenda: '',
    tempoProducao: '15',
  });

  // Calculate high-level stats
  const totalProdutos = produtos.length;
  
  const averageMargin = produtos.length > 0 
    ? (produtos.reduce((acc, curr) => {
        const profit = curr.precoVenda - curr.custoUnitario;
        const margin = curr.precoVenda > 0 ? (profit / curr.precoVenda) * 100 : 0;
        return acc + margin;
      }, 0) / produtos.length)
    : 0;

  const mostProfitable = produtos.reduce((best, curr) => {
    const currProfit = curr.precoVenda - curr.custoUnitario;
    const bestProfit = best ? (best.precoVenda - best.custoUnitario) : -Infinity;
    return currProfit > bestProfit ? curr : best;
  }, null as Produto | null);

  // Filtered Products
  const filteredProdutos = produtos.filter(p => 
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.custoUnitario || !formData.precoVenda || !formData.tempoProducao) return;

    const payload = {
      nome: formData.nome,
      custoUnitario: parseFloat(formData.custoUnitario),
      precoVenda: parseFloat(formData.precoVenda),
      tempoProducao: parseInt(formData.tempoProducao),
    };

    if (editingProduto) {
      onEditProduto({
        ...editingProduto,
        ...payload,
      });
    } else {
      onAddProduto(payload);
    }

    // Reset Form
    setFormData({
      nome: '',
      custoUnitario: '',
      precoVenda: '',
      tempoProducao: '15',
    });
    setEditingProduto(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome,
      custoUnitario: produto.custoUnitario.toString(),
      precoVenda: produto.precoVenda.toString(),
      tempoProducao: produto.tempoProducao.toString(),
    });
    setIsFormOpen(true);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6" id="produtos-tab-container">
      {/* Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="produtos-stats-grid">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-2" id="produtos-stat-total">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Catálogo Ativo</span>
          <span className="text-2xl font-bold font-mono text-indigo-600 block">{totalProdutos} itens</span>
          <span className="text-xs text-slate-500 block">Total de produtos e estampas</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-2" id="produtos-stat-margin">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Margem Média de Lucro</span>
          <span className="text-2xl font-bold font-mono text-slate-800 block">{averageMargin.toFixed(2).replace('.', ',')}%</span>
          <span className="text-xs text-slate-500 block">Média ponderada do portfólio</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between" id="produtos-stat-action">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">Novo Produto</h4>
            <p className="text-xs text-slate-500">Adicione itens ao portfólio</p>
          </div>
          <button
            onClick={() => {
              setEditingProduto(null);
              setFormData({
                nome: '',
                custoUnitario: '',
                precoVenda: '',
                tempoProducao: '15',
              });
              setIsFormOpen(true);
            }}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10 flex items-center gap-1.5 text-xs font-bold"
            id="add-produto-trigger-btn"
          >
            <Plus className="w-4 h-4" /> Cadastrar Produto
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center" id="produtos-filter-bar">
        <div className="relative w-full md:w-80" id="produtos-search-wrapper">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por nome do produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
            id="produto-search-input"
          />
        </div>

        {mostProfitable && (
          <div className="text-xs text-slate-500 bg-indigo-50/50 border border-indigo-100/50 px-3 py-2 rounded-xl flex items-center gap-2" id="most-profitable-alert">
            <Smile className="w-4 h-4 text-indigo-600" />
            <span>Produto mais lucrativo: <strong>{mostProfitable.nome}</strong> (+ {formatCurrency(mostProfitable.precoVenda - mostProfitable.custoUnitario)} por unidade)</span>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            id="produto-form-modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-2xl relative space-y-5"
            >
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all absolute top-6 right-6 cursor-pointer"
                id="close-produto-modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {editingProduto ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure preços de venda e custos de produção para o catálogo.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" id="produto-input-form">
                {/* Nome */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Archive className="w-3.5 h-3.5 text-slate-400" /> Nome do Produto
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Caneca Resinada"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                  />
                </div>

                {/* Custo Unitario */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Custo Unitário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={formData.custoUnitario}
                    onChange={(e) => setFormData({ ...formData, custoUnitario: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-mono"
                  />
                </div>

                {/* Preço Venda */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Preço de Venda (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={formData.precoVenda}
                    onChange={(e) => setFormData({ ...formData, precoVenda: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-mono"
                  />
                </div>

                {/* Tempo Produção */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Tempo de Produção (minutos)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.tempoProducao}
                    onChange={(e) => setFormData({ ...formData, tempoProducao: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-mono"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/15"
                  >
                    {editingProduto ? 'Salvar' : 'Cadastrar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Catalog Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden" id="produtos-table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" id="produtos-data-table">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-semibold tracking-wider uppercase text-left">
                <th className="py-4 px-6 font-semibold">Nome do Produto</th>
                <th className="py-4 px-6 font-semibold text-right">Custo Unitário</th>
                <th className="py-4 px-6 font-semibold text-right">Preço de Venda</th>
                <th className="py-4 px-6 font-semibold text-right">Lucro Unitário</th>
                <th className="py-4 px-6 font-semibold text-right">Margem de Lucro</th>
                <th className="py-4 px-6 font-semibold text-center">Tempo de Produção</th>
                <th className="py-4 px-6 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredProdutos.length > 0 ? (
                filteredProdutos.map((p) => {
                  const lucroUnitario = p.precoVenda - p.custoUnitario;
                  const margemLucro = p.precoVenda > 0 ? (lucroUnitario / p.precoVenda) * 100 : 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors" id={`produto-row-${p.id}`}>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {p.nome}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-rose-600">
                        {formatCurrency(p.custoUnitario)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-emerald-600">
                        {formatCurrency(p.precoVenda)}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold font-mono text-blue-600">
                        {formatCurrency(lucroUnitario)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg font-mono">
                          {margemLucro.toFixed(2).replace('.', ',')}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-slate-600 font-mono text-xs">
                        {p.tempoProducao} min
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduto(p.id)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 px-6 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <AlertTriangle className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-sm">Nenhum produto cadastrado</p>
                      <p className="text-xs">Registre itens do portfólio para habilitá-los nas vendas.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
