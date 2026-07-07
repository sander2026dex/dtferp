/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Trash2, Edit2, Download, AlertTriangle, Filter, Check, X, Calendar, DollarSign, Tag, Info } from 'lucide-react';
import { Custo } from '../types';

interface CustosTabProps {
  custos: Custo[];
  onAddCusto: (custo: Omit<Custo, 'id'>) => void;
  onEditCusto: (custo: Custo) => void;
  onDeleteCusto: (id: string) => void;
}

export default function CustosTab({ custos, onAddCusto, onEditCusto, onDeleteCusto }: CustosTabProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCusto, setEditingCusto] = useState<Custo | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    categoria: 'Filme PET',
    descricao: '',
    valor: '',
  });

  const categories = ['Filme PET', 'Tinta DTF', 'Pó Adesivo', 'Energia Elétrica', 'Manutenção', 'Embalagens', 'Outros'];

  // Total Costs
  const totalCusto = custos.reduce((acc, curr) => acc + curr.valor, 0);
  const maxCusto = custos.reduce((max, curr) => curr.valor > max ? curr.valor : max, 0);

  // Filtered Costs
  const filteredCustos = custos.filter(c => {
    const matchesSearch = c.descricao.toLowerCase().includes(search.toLowerCase()) || 
                          c.categoria.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || c.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao || !formData.valor || isNaN(Number(formData.valor))) return;

    const payload = {
      data: formData.data,
      categoria: formData.categoria,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
    };

    if (editingCusto) {
      onEditCusto({
        ...editingCusto,
        ...payload,
      });
    } else {
      onAddCusto(payload);
    }

    // Reset Form
    setFormData({
      data: new Date().toISOString().split('T')[0],
      categoria: 'Filme PET',
      descricao: '',
      valor: '',
    });
    setEditingCusto(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (custo: Custo) => {
    setEditingCusto(custo);
    setFormData({
      data: custo.data,
      categoria: custo.categoria,
      descricao: custo.descricao,
      valor: custo.valor.toString(),
    });
    setIsFormOpen(true);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6" id="custos-tab-container">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="custos-stats-grid">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-2" id="custos-stat-total">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Custo Total Acumulado</span>
          <span className="text-2xl font-bold font-mono text-rose-600 block">{formatCurrency(totalCusto)}</span>
          <span className="text-xs text-slate-500 block">{custos.length} despesas lançadas no total</span>
        </div>
        
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-2" id="custos-stat-max">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Maior Gasto Único</span>
          <span className="text-2xl font-bold font-mono text-slate-800 block">{formatCurrency(maxCusto)}</span>
          <span className="text-xs text-slate-500 block">Item de maior impacto no caixa</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between" id="custos-stat-action">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">Nova Despesa</h4>
            <p className="text-xs text-slate-500">Registre saídas de caixa e insumos</p>
          </div>
          <button
            onClick={() => {
              setEditingCusto(null);
              setFormData({
                data: new Date().toISOString().split('T')[0],
                categoria: 'Filme PET',
                descricao: '',
                valor: '',
              });
              setIsFormOpen(true);
            }}
            className="p-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-600/10 flex items-center gap-1.5 text-xs font-bold"
            id="add-cost-trigger-btn"
          >
            <Plus className="w-4 h-4" /> Registrar
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center" id="custos-filters-bar">
        {/* Search */}
        <div className="relative w-full md:w-80" id="search-input-wrapper">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar custos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-slate-800"
            id="custo-search-input"
          />
        </div>

        {/* Category Selector Buttons */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto" id="custos-category-filters">
          <button
            onClick={() => setSelectedCategory('Todas')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              selectedCategory === 'Todas'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todas
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Form Dialog (Modal or Inline Panel) */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            id="custo-form-modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-2xl relative space-y-6"
            >
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all absolute top-6 right-6 cursor-pointer"
                id="close-custo-modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {editingCusto ? 'Editar Registro de Custo' : 'Registrar Novo Custo'}
                </h3>
                <p className="text-xs text-slate-500">
                  Insira as informações operacionais de despesa abaixo.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" id="custo-input-form">
                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Data
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full px-4.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-slate-800"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" /> Categoria
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-4.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-slate-800 cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-400" /> Descrição
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Compra de 100m de filme PET"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full px-4.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-slate-800"
                  />
                </div>

                {/* Value */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="w-full px-4.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-slate-800 font-mono"
                  />
                </div>

                {/* Form Buttons */}
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
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-600/15"
                  >
                    {editingCusto ? 'Salvar' : 'Registrar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Costs Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden" id="custos-table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" id="custos-data-table">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-semibold tracking-wider uppercase text-left">
                <th className="py-4 px-6 font-semibold">Data</th>
                <th className="py-4 px-6 font-semibold">Categoria</th>
                <th className="py-4 px-6 font-semibold">Descrição</th>
                <th className="py-4 px-6 font-semibold text-right">Valor</th>
                <th className="py-4 px-6 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredCustos.length > 0 ? (
                filteredCustos.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors" id={`custo-row-${c.id}`}>
                    <td className="py-4 px-6 font-mono text-slate-500 text-xs">
                      {c.data.split('-').reverse().join('/')}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg">
                        {c.categoria}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">
                      {c.descricao}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold font-mono text-rose-600">
                      {formatCurrency(c.valor)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(c)}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCusto(c.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 px-6 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <AlertTriangle className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-sm">Nenhum custo encontrado</p>
                      <p className="text-xs">Tente ajustar sua busca ou filtro de categoria.</p>
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
