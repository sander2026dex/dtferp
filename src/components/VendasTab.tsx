/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Trash2, Edit2, CheckCircle2, Clock, AlertTriangle, Calendar, User, ShoppingBag, DollarSign, Layers, X } from 'lucide-react';
import { Venda, Produto, Cliente } from '../types';

interface VendasTabProps {
  vendas: Venda[];
  produtos: Produto[];
  clientes: Cliente[];
  onAddVenda: (venda: Omit<Venda, 'id'>) => void;
  onEditVenda: (venda: Venda) => void;
  onDeleteVenda: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function VendasTab({
  vendas,
  produtos,
  clientes,
  onAddVenda,
  onEditVenda,
  onDeleteVenda,
  onToggleStatus,
}: VendasTabProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Concluído' | 'Pendente'>('Todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVenda, setEditingVenda] = useState<Venda | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    cliente: '',
    produto: '',
    quantidade: '1',
    valorUnitario: '',
    status: 'Concluído' as 'Concluído' | 'Pendente',
  });

  // Calculate statistics
  const totalReceita = vendas
    .filter(v => v.status === 'Concluído')
    .reduce((acc, curr) => acc + (curr.quantidade * curr.valorUnitario), 0);

  const totalPendente = vendas
    .filter(v => v.status === 'Pendente')
    .reduce((acc, curr) => acc + (curr.quantidade * curr.valorUnitario), 0);

  const totalPedidos = vendas.length;

  // Filtered Vendas
  const filteredVendas = vendas.filter(v => {
    const matchesSearch = v.cliente.toLowerCase().includes(search.toLowerCase()) || 
                          v.produto.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Smart Handler when Product is selected
  const handleProductChange = (prodNome: string) => {
    const product = produtos.find(p => p.nome === prodNome);
    setFormData(prev => ({
      ...prev,
      produto: prodNome,
      valorUnitario: product ? product.precoVenda.toString() : prev.valorUnitario
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cliente || !formData.produto || !formData.quantidade || !formData.valorUnitario) return;

    const payload = {
      data: formData.data,
      cliente: formData.cliente,
      produto: formData.produto,
      quantidade: parseInt(formData.quantidade),
      valorUnitario: parseFloat(formData.valorUnitario),
      status: formData.status,
    };

    if (editingVenda) {
      onEditVenda({
        ...editingVenda,
        ...payload,
      });
    } else {
      onAddVenda(payload);
    }

    // Reset Form
    setFormData({
      data: new Date().toISOString().split('T')[0],
      cliente: '',
      produto: '',
      quantidade: '1',
      valorUnitario: '',
      status: 'Concluído',
    });
    setEditingVenda(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (venda: Venda) => {
    setEditingVenda(venda);
    setFormData({
      data: venda.data,
      cliente: venda.cliente,
      produto: venda.produto,
      quantidade: venda.quantidade.toString(),
      valorUnitario: venda.valorUnitario.toString(),
      status: venda.status,
    });
    setIsFormOpen(true);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6" id="vendas-tab-container">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="vendas-stats-grid">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-2" id="vendas-stat-completed">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Receita Concluída</span>
          <span className="text-2xl font-bold font-mono text-emerald-600 block">{formatCurrency(totalReceita)}</span>
          <span className="text-xs text-slate-500 block">
            {vendas.filter(v => v.status === 'Concluído').length} de {totalPedidos} vendas
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-2" id="vendas-stat-pending">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Faturamento Pendente</span>
          <span className="text-2xl font-bold font-mono text-amber-500 block">{formatCurrency(totalPendente)}</span>
          <span className="text-xs text-slate-500 block">
            {vendas.filter(v => v.status === 'Pendente').length} pedidos em aberto
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between" id="vendas-stat-action">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">Nova Venda</h4>
            <p className="text-xs text-slate-500">Registre novos pedidos de DTF</p>
          </div>
          <button
            onClick={() => {
              setEditingVenda(null);
              setFormData({
                data: new Date().toISOString().split('T')[0],
                cliente: clientes[0]?.nome || '',
                produto: produtos[0]?.nome || '',
                quantidade: '1',
                valorUnitario: produtos[0]?.precoVenda.toString() || '',
                status: 'Concluído',
              });
              setIsFormOpen(true);
            }}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/10 flex items-center gap-1.5 text-xs font-bold"
            id="add-venda-trigger-btn"
          >
            <Plus className="w-4 h-4" /> Registrar Venda
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center" id="vendas-filter-bar">
        {/* Search */}
        <div className="relative w-full md:w-80" id="vendas-search-wrapper">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por cliente ou produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
            id="venda-search-input"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-2" id="status-filters">
          {(['Todos', 'Concluído', 'Pendente'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Add/Edit Dialog */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            id="venda-form-modal"
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
                id="close-venda-modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {editingVenda ? 'Editar Registro de Venda' : 'Registrar Nova Venda'}
                </h3>
                <p className="text-xs text-slate-500">
                  Lançamento de faturamento e quantidade de produtos vendidos.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" id="venda-input-form">
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
                    className="w-full px-4 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                  />
                </div>

                {/* Client Select / Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Cliente
                  </label>
                  {clientes.length > 0 ? (
                    <select
                      value={formData.cliente}
                      onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 cursor-pointer"
                    >
                      <option value="">Selecione um cliente...</option>
                      {clientes.map(cl => (
                        <option key={cl.id} value={cl.nome}>{cl.nome} ({cl.tipo})</option>
                      ))}
                      <option value="Outro">Outro / Avulso (Inserir manualmente abaixo)</option>
                    </select>
                  ) : null}

                  {/* Fallback to text input if "Outro" or no clients */}
                  {(clientes.length === 0 || formData.cliente === 'Outro' || !clientes.some(c => c.nome === formData.cliente)) && (
                    <input
                      type="text"
                      placeholder="Nome do Cliente"
                      required
                      value={formData.cliente === 'Outro' ? '' : formData.cliente}
                      onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 mt-2"
                    />
                  )}
                </div>

                {/* Product Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-400" /> Produto
                  </label>
                  {produtos.length > 0 ? (
                    <select
                      value={formData.produto}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 cursor-pointer"
                    >
                      <option value="">Selecione um produto...</option>
                      {produtos.map(p => (
                        <option key={p.id} value={p.nome}>{p.nome}</option>
                      ))}
                      <option value="Outro">Produto Customizado (Inserir manualmente abaixo)</option>
                    </select>
                  ) : null}

                  {/* Fallback text input */}
                  {(produtos.length === 0 || formData.produto === 'Outro' || !produtos.some(p => p.nome === formData.produto)) && (
                    <input
                      type="text"
                      placeholder="Nome do Produto"
                      required
                      value={formData.produto === 'Outro' ? '' : formData.produto}
                      onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 mt-2"
                    />
                  )}
                </div>

                {/* Quantity and Unit Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" /> Qtd
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.quantidade}
                      onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Vlr Unit. (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0,00"
                      value={formData.valorUnitario}
                      onChange={(e) => setFormData({ ...formData, valorUnitario: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 font-mono"
                    />
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">Status da Venda</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'Concluído' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        formData.status === 'Concluído'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'Pendente' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        formData.status === 'Pendente'
                          ? 'bg-amber-50 border-amber-300 text-amber-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" /> Pendente
                    </button>
                  </div>
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
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/15"
                  >
                    {editingVenda ? 'Salvar Alterações' : 'Confirmar Venda'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sales Data Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden" id="vendas-table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" id="vendas-data-table">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-semibold tracking-wider uppercase text-left">
                <th className="py-4 px-6 font-semibold">Data</th>
                <th className="py-4 px-6 font-semibold">Cliente</th>
                <th className="py-4 px-6 font-semibold">Produto</th>
                <th className="py-4 px-6 font-semibold text-center">Quantidade</th>
                <th className="py-4 px-6 font-semibold text-right">Valor Unitário</th>
                <th className="py-4 px-6 font-semibold text-right">Valor Total</th>
                <th className="py-4 px-6 font-semibold text-center">Status</th>
                <th className="py-4 px-6 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredVendas.length > 0 ? (
                filteredVendas.map((v) => {
                  const valorTotal = v.quantidade * v.valorUnitario;
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors" id={`venda-row-${v.id}`}>
                      <td className="py-4 px-6 font-mono text-slate-500 text-xs">
                        {v.data.split('-').reverse().join('/')}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {v.cliente}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {v.produto}
                      </td>
                      <td className="py-4 px-6 text-center font-semibold font-mono text-slate-700">
                        {v.quantidade}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-slate-600">
                        {formatCurrency(v.valorUnitario)}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold font-mono text-emerald-600">
                        {formatCurrency(valorTotal)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => onToggleStatus(v.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            v.status === 'Concluído'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                          title="Clique para alternar o status"
                        >
                          {v.status === 'Concluído' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 font-bold" /> Pendente
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(v)}
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteVenda(v.id)}
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
                  <td colSpan={8} className="py-12 px-6 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <AlertTriangle className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-sm">Nenhuma venda encontrada</p>
                      <p className="text-xs">Registre novas vendas ou ajuste os filtros.</p>
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
