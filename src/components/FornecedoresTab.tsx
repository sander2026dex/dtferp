/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Trash2, Edit2, AlertTriangle, X, Phone, Mail, Award, Truck, ShieldAlert, Check, Landmark, Layers } from 'lucide-react';
import { Fornecedor } from '../types';

interface FornecedoresTabProps {
  fornecedores: Fornecedor[];
  onAddFornecedor: (fornecedor: Omit<Fornecedor, 'id'>) => void;
  onEditFornecedor: (fornecedor: Fornecedor) => void;
  onDeleteFornecedor: (id: string) => void;
}

export default function FornecedoresTab({
  fornecedores,
  onAddFornecedor,
  onEditFornecedor,
  onDeleteFornecedor,
}: FornecedoresTabProps) {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    cnpj: '',
    produtosFornecidos: '',
  });

  // Filter suppliers
  const filteredFornecedores = fornecedores.filter(f => {
    return (
      f.nome.toLowerCase().includes(search.toLowerCase()) ||
      f.produtosFornecidos.toLowerCase().includes(search.toLowerCase()) ||
      f.cnpj.includes(search)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) return;

    const payload = {
      nome: formData.nome,
      telefone: formData.telefone,
      email: formData.email,
      cnpj: formData.cnpj,
      produtosFornecidos: formData.produtosFornecidos,
    };

    if (editingFornecedor) {
      onEditFornecedor({
        ...editingFornecedor,
        ...payload,
      });
    } else {
      onAddFornecedor(payload);
    }

    // Reset Form
    setFormData({
      nome: '',
      telefone: '',
      email: '',
      cnpj: '',
      produtosFornecidos: '',
    });
    setEditingFornecedor(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (fornecedor: Fornecedor) => {
    setEditingFornecedor(fornecedor);
    setFormData({
      nome: proveedorClean(fornecedor.nome),
      telefone: fornecedor.telefone,
      email: fornecedor.email,
      cnpj: fornecedor.cnpj,
      produtosFornecidos: fornecedor.produtosFornecidos,
    });
    setIsFormOpen(true);
  };

  const proveedorClean = (name: string) => name;

  // Calculate stats
  const totalFornecedores = fornecedores.length;
  
  // Unique product types supplied
  const uniqueProductsSupplied = Array.from(
    new Set(fornecedores.map(f => f.produtosFornecidos.split(',').map(s => s.trim())).flat())
  ).filter(p => p.length > 0).length;

  return (
    <div className="space-y-6" id="fornecedores-tab-container">
      {/* Supplier Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="fornecedores-stats-grid">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-2" id="fornecedores-stat-total">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Fornecedores Homologados</span>
          <span className="text-2xl font-bold font-mono text-indigo-600 block">{totalFornecedores}</span>
          <span className="text-xs text-slate-500 block">
            Parceiros cadastrados para suprimentos DTF
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-2" id="fornecedores-stat-products">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Insumos Mapeados</span>
          <span className="text-2xl font-bold font-mono text-emerald-600 block">{uniqueProductsSupplied}</span>
          <span className="text-xs text-slate-500 block">
            Categorias de produtos fornecidas
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between" id="fornecedores-stat-action">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">Novo Fornecedor</h4>
            <p className="text-xs text-slate-500">Adicione um novo parceiro comercial</p>
          </div>
          <button
            onClick={() => {
              setEditingFornecedor(null);
              setFormData({
                nome: '',
                telefone: '',
                email: '',
                cnpj: '',
                produtosFornecidos: '',
              });
              setIsFormOpen(true);
            }}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10 flex items-center gap-1.5 text-xs font-bold"
            id="add-fornecedor-trigger-btn"
          >
            <Plus className="w-4 h-4" /> Cadastrar Fornecedor
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center" id="fornecedores-filter-bar">
        {/* Search */}
        <div className="relative w-full" id="fornecedores-search-wrapper">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por nome, CNPJ ou insumos/produtos fornecidos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
            id="fornecedor-search-input"
          />
        </div>
      </div>

      {/* Supplier Input Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            id="fornecedor-form-modal"
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
                id="close-fornecedor-modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {editingFornecedor ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}
                </h3>
                <p className="text-xs text-slate-500">
                  Insira os dados cadastrais da empresa fornecedora de insumos.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" id="fornecedor-input-form">
                {/* Nome */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-slate-400" /> Nome / Razão Social
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Suprimentos DTF Brasil Ltda"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                  />
                </div>

                {/* CNPJ */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5 text-slate-400" /> CNPJ
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 12.345.678/0001-90"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                  />
                </div>

                {/* Telefone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Telefone para Contato
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: (11) 99999-8888"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                  />
                </div>

                {/* E-mail */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> E-mail Comercial
                  </label>
                  <input
                    type="email"
                    placeholder="Ex: vendas@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                  />
                </div>

                {/* Produtos Fornecidos */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" /> Produtos / Insumos Fornecidos
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Filme PET, Tintas CMYK+W, Pó Hot Melt, Cabeçotes"
                    value={formData.produtosFornecidos}
                    onChange={(e) => setFormData({ ...formData, produtosFornecidos: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                  />
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
                    {editingFornecedor ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supplier Registry Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden" id="fornecedores-table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" id="fornecedores-data-table">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-semibold tracking-wider uppercase text-left">
                <th className="py-4 px-6 font-semibold">Fornecedor</th>
                <th className="py-4 px-6 font-semibold">CNPJ</th>
                <th className="py-4 px-6 font-semibold">Telefone</th>
                <th className="py-4 px-6 font-semibold">E-mail</th>
                <th className="py-4 px-6 font-semibold">Insumos Fornecidos</th>
                <th className="py-4 px-6 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredFornecedores.length > 0 ? (
                filteredFornecedores.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition-colors" id={`fornecedor-row-${f.id}`}>
                    <td className="py-4 px-6 font-bold text-slate-850">
                      {f.nome}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-500">
                      {f.cnpj || '-'}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600">
                      {f.telefone || '-'}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {f.email || '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium inline-block max-w-[200px] truncate" title={f.produtosFornecidos}>
                        {f.produtosFornecidos || 'Insumos gerais'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(f)}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteFornecedor(f.id)}
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
                  <td colSpan={6} className="py-12 px-6 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <AlertTriangle className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-sm">Nenhum fornecedor localizado</p>
                      <p className="text-xs">Registre fornecedores parceiros para organizar as compras e custos operacionais.</p>
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
