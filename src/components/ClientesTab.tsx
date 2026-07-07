/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Trash2, Edit2, AlertTriangle, X, Phone, Mail, Award, Users, ShieldAlert, Check } from 'lucide-react';
import { Cliente, Venda } from '../types';

interface ClientesTabProps {
  clientes: Cliente[];
  vendas: Venda[];
  onAddCliente: (cliente: Omit<Cliente, 'id'>) => void;
  onEditCliente: (cliente: Cliente) => void;
  onDeleteCliente: (id: string) => void;
}

export default function ClientesTab({ clientes, vendas, onAddCliente, onEditCliente, onDeleteCliente }: ClientesTabProps) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'Todos' | 'PF' | 'PJ'>('Todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    tipo: 'PF' as 'PF' | 'PJ',
  });

  // Calculate client-specific lifetime buy value (SOMASE from sales)
  const getClientTotalPurchases = (clienteNome: string) => {
    return vendas
      .filter(v => v.cliente.toLowerCase() === clienteNome.toLowerCase())
      .reduce((acc, curr) => acc + (curr.quantidade * curr.valorUnitario), 0);
  };

  // Filter clients
  const filteredClientes = clientes.filter(c => {
    const matchesSearch = c.nome.toLowerCase().includes(search.toLowerCase()) || 
                          c.email.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'Todos' || c.tipo === selectedType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) return;

    const payload = {
      nome: formData.nome,
      telefone: formData.telefone,
      email: formData.email,
      tipo: formData.tipo,
    };

    if (editingCliente) {
      onEditCliente({
        ...editingCliente,
        ...payload,
      });
    } else {
      onAddCliente(payload);
    }

    // Reset Form
    setFormData({
      nome: '',
      telefone: '',
      email: '',
      tipo: 'PF',
    });
    setEditingCliente(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email,
      tipo: cliente.tipo,
    });
    setIsFormOpen(true);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Calculate stats
  const totalClientes = clientes.length;
  const pfCount = clientes.filter(c => c.tipo === 'PF').length;
  const pjCount = clientes.filter(c => c.tipo === 'PJ').length;

  const topSpender = clientes.reduce((best, curr) => {
    const currTotal = getClientTotalPurchases(curr.nome);
    const bestTotal = best ? getClientTotalPurchases(best.nome) : -1;
    return currTotal > bestTotal ? curr : best;
  }, null as Cliente | null);

  return (
    <div className="space-y-6" id="clientes-tab-container">
      {/* Customer Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="clientes-stats-grid">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-2" id="clientes-stat-total">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Clientes Cadastrados</span>
          <span className="text-2xl font-bold font-mono text-indigo-600 block">{totalClientes}</span>
          <span className="text-xs text-slate-500 block">
            {pfCount} Pessoas Físicas | {pjCount} Jurídicas
          </span>
        </div>

        {topSpender && getClientTotalPurchases(topSpender.nome) > 0 ? (
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-2" id="clientes-stat-spender">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Cliente Top Compras</span>
            <span className="text-xl font-bold text-slate-800 truncate block">{topSpender.nome}</span>
            <span className="text-xs text-emerald-600 font-semibold block">
              Faturamento: {formatCurrency(getClientTotalPurchases(topSpender.nome))}
            </span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-2" id="clientes-stat-no-spender">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Cliente Top Compras</span>
            <span className="text-xl font-bold text-slate-400 block">Nenhum pedido concluído</span>
            <span className="text-xs text-slate-500 block">Aguardando faturamento</span>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between" id="clientes-stat-action">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">Novo Cliente</h4>
            <p className="text-xs text-slate-500">Adicione um novo cliente</p>
          </div>
          <button
            onClick={() => {
              setEditingCliente(null);
              setFormData({
                nome: '',
                telefone: '',
                email: '',
                tipo: 'PF',
              });
              setIsFormOpen(true);
            }}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10 flex items-center gap-1.5 text-xs font-bold"
            id="add-cliente-trigger-btn"
          >
            <Plus className="w-4 h-4" /> Cadastrar Cliente
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center" id="clientes-filter-bar">
        {/* Search */}
        <div className="relative w-full md:w-80" id="clientes-search-wrapper">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
            id="cliente-search-input"
          />
        </div>

        {/* Segment Tabs */}
        <div className="flex gap-2" id="client-type-filters">
          {(['Todos', 'PF', 'PJ'] as const).map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedType === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {type === 'Todos' ? 'Todos' : type === 'PF' ? 'Pessoa Física (PF)' : 'Pessoa Jurídica (PJ)'}
            </button>
          ))}
        </div>
      </div>

      {/* Client Input Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            id="cliente-form-modal"
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
                id="close-cliente-modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {editingCliente ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
                </h3>
                <p className="text-xs text-slate-500">
                  Insira as informações cadastrais para vincular vendas.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" id="cliente-input-form">
                {/* Nome */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> Nome do Cliente
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ana Costa"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                  />
                </div>

                {/* Telefone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: (11) 98888-7777"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                  />
                </div>

                {/* E-mail */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="Ex: ana@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                  />
                </div>

                {/* Tipo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">Tipo do Cliente</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo: 'PF' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        formData.tipo === 'PF'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Pessoa Física (PF)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo: 'PJ' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        formData.tipo === 'PJ'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Pessoa Jurídica (PJ)
                    </button>
                  </div>
                </div>

                {/* Submit Buttons */}
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
                    {editingCliente ? 'Salvar' : 'Cadastrar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customer Registry Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden" id="clientes-table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" id="clientes-data-table">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-semibold tracking-wider uppercase text-left">
                <th className="py-4 px-6 font-semibold">Nome</th>
                <th className="py-4 px-6 font-semibold">Telefone</th>
                <th className="py-4 px-6 font-semibold">E-mail</th>
                <th className="py-4 px-6 font-semibold text-center">Tipo</th>
                <th className="py-4 px-6 font-semibold text-right">Total de Compras</th>
                <th className="py-4 px-6 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredClientes.length > 0 ? (
                filteredClientes.map((c) => {
                  const purchases = getClientTotalPurchases(c.nome);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors" id={`cliente-row-${c.id}`}>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {c.nome}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">
                        {c.telefone || '-'}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {c.email || '-'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-lg ${
                          c.tipo === 'PF' ? 'bg-sky-50 text-sky-700' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {c.tipo}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-semibold font-mono text-emerald-600">
                        {formatCurrency(purchases)}
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
                            onClick={() => onDeleteCliente(c.id)}
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
                  <td colSpan={6} className="py-12 px-6 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <AlertTriangle className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-sm">Nenhum cliente cadastrado</p>
                      <p className="text-xs">Registre novos clientes para organizar faturamento.</p>
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
