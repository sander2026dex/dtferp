/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  FileCheck, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Save, 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  Phone, 
  Mail, 
  Award, 
  BadgePercent, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { UserAccount, Vendedor, UserData } from '../utils/db';

interface ConfigTabProps {
  currentUser: UserAccount;
  onUpdateCurrentUser: (user: UserAccount) => void;
  vendedores: Vendedor[];
  onAddVendedor: (vendedor: Omit<Vendedor, 'id' | 'createdAt'>) => void;
  onEditVendedor: (vendedor: Vendedor) => void;
  onDeleteVendedor: (id: string) => void;
  vendas: any[];
}

export function formatGoogleDriveLink(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  // Check if it's a Google Drive share link
  if (trimmed.includes('drive.google.com')) {
    const matchId = trimmed.match(/\/file\/d\/([a-zA-Z0-9-_]+)/) || trimmed.match(/id=([a-zA-Z0-9-_]+)/);
    if (matchId && matchId[1]) {
      // lh3.googleusercontent.com/d/FILE_ID serves ONLY the raw image directly, perfect as a logo img src
      return `https://lh3.googleusercontent.com/d/${matchId[1]}`;
    }
  }
  return trimmed;
}

export default function ConfigTab({
  currentUser,
  onUpdateCurrentUser,
  vendedores = [],
  onAddVendedor,
  onEditVendedor,
  onDeleteVendedor,
  vendas = []
}: ConfigTabProps) {
  // Company Form State
  const [empresaNome, setEmpresaNome] = useState(currentUser.empresaNome || '');
  const [empresaCnpj, setEmpresaCnpj] = useState(currentUser.empresaCnpj || '');
  const [empresaLogo, setEmpresaLogo] = useState(currentUser.empresaLogo || '');
  const [chavePix, setChavePix] = useState(currentUser.chavePix || '');
  const [companySuccess, setCompanySuccess] = useState('');
  const [companyError, setCompanyError] = useState('');

  // Vendedor Form State
  const [isVendedorFormOpen, setIsVendedorFormOpen] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState<Vendedor | null>(null);
  const [vendedorForm, setVendedorForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    comissao: '5', // Default 5%
    registro: '',
    senha: '',
    status: 'Ativo' as 'Pendente' | 'Ativo' | 'Bloqueado'
  });
  const [vendedorError, setVendedorError] = useState('');
  const [vendedorSuccess, setVendedorSuccess] = useState('');
  const [copiedVendedorId, setCopiedVendedorId] = useState<string | null>(null);

  const handleCopyAccessLink = (v: Vendedor) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const accessLink = `${baseUrl}?vEmail=${encodeURIComponent(v.email || v.registro)}&vPass=${encodeURIComponent(v.senha || '123456')}&vendedor=true`;
    
    // Copy a complete formatted WhatsApp/Email invitation message
    const inviteText = `Olá, ${v.nome}! 🚀\nSeu acesso como Vendedor(a) foi criado no sistema *${currentUser.empresaNome || 'DTF Têxtil'}*.\n\nUse o link de acesso abaixo para entrar automaticamente sem precisar digitar suas credenciais:\n🔗 *Link de Acesso:* ${accessLink}\n\n*Dados de login caso precise:*\n📧 E-mail/Registro: ${v.email || v.registro}\n🔑 Senha: ${v.senha || '123456'}\n\nBoas vendas! 📈`;
    
    navigator.clipboard.writeText(inviteText);
    setCopiedVendedorId(v.id);
    setTimeout(() => {
      setCopiedVendedorId(null);
    }, 2000);
  };

  // Save Company settings
  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanySuccess('');
    setCompanyError('');

    try {
      const updated: UserAccount = {
        ...currentUser,
        empresaNome: empresaNome.trim() || undefined,
        empresaCnpj: empresaCnpj.trim() || undefined,
        empresaLogo: empresaLogo.trim() || undefined,
        chavePix: chavePix.trim() || undefined
      };
      
      onUpdateCurrentUser(updated);
      setCompanySuccess('Dados da empresa atualizados com sucesso!');
      setTimeout(() => setCompanySuccess(''), 4000);
    } catch (err) {
      setCompanyError('Erro ao salvar configurações.');
    }
  };

  // Submit Vendedor form
  const handleVendedorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVendedorError('');
    setVendedorSuccess('');

    if (!vendedorForm.nome || !vendedorForm.registro) {
      setVendedorError('Nome e Registro/Matrícula são obrigatórios.');
      return;
    }

    const commissionNum = parseFloat(vendedorForm.comissao);
    if (isNaN(commissionNum) || commissionNum < 0 || commissionNum > 100) {
      setVendedorError('A comissão deve ser um valor numérico entre 0 e 100.');
      return;
    }

    const payload = {
      nome: vendedorForm.nome.trim(),
      email: vendedorForm.email.trim(),
      telefone: vendedorForm.telefone.trim(),
      comissao: commissionNum,
      registro: vendedorForm.registro.trim(),
      senha: vendedorForm.senha.trim() || '123456', // Default simple password if empty
      status: vendedorForm.status,
      autorizadoPor: currentUser.nome, // Record the name of the user who authorized
      tenantEmail: currentUser.email
    };

    if (editingVendedor) {
      onEditVendedor({
        ...editingVendedor,
        ...payload
      });
      setVendedorSuccess(`Vendedor "${payload.nome}" atualizado com sucesso!`);
    } else {
      onAddVendedor(payload);
      setVendedorSuccess(`Vendedor "${payload.nome}" cadastrado com sucesso!`);
    }

    // Reset Form
    setVendedorForm({
      nome: '',
      email: '',
      telefone: '',
      comissao: '5',
      registro: '',
      senha: '',
      status: 'Ativo'
    });
    setEditingVendedor(null);
    setIsVendedorFormOpen(false);
    setTimeout(() => setVendedorSuccess(''), 4000);
  };

  // Click edit button
  const handleEditVendedorClick = (v: Vendedor) => {
    setEditingVendedor(v);
    setVendedorForm({
      nome: v.nome,
      email: v.email,
      telefone: v.telefone,
      comissao: v.comissao.toString(),
      registro: v.registro,
      senha: v.senha || '',
      status: v.status || 'Ativo'
    });
    setIsVendedorFormOpen(true);
  };

  // Calculate salesperson stats
  const getSalespersonStats = (name: string) => {
    const sVendas = vendas.filter(v => v.vendedor === name && v.status === 'Concluído');
    const totalVendido = sVendas.reduce((acc, curr) => acc + (curr.quantidade * curr.valorUnitario), 0);
    return {
      quantidade: sVendas.length,
      totalVendido
    };
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Image URL direct preview
  const formattedLogoUrl = formatGoogleDriveLink(empresaLogo);

  return (
    <div className="space-y-10" id="config-tab-container">
      
      {/* Tab Header Banner */}
      <div className="bg-linear-to-r from-indigo-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="config-header-banner">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight font-display">Minha Empresa e Equipe</h2>
          <p className="text-xs text-indigo-200 max-w-xl">
            Configure a identidade visual da sua estamparia para sair nos orçamentos, relatórios e controle a comissão de seus vendedores cadastrados.
          </p>
        </div>
        
        {formattedLogoUrl && (
          <div className="bg-white/10 backdrop-blur-xs p-2 rounded-2xl border border-white/20 shrink-0">
            <img 
              src={formattedLogoUrl} 
              alt="Logo Empresa" 
              referrerPolicy="no-referrer"
              className="h-14 w-auto max-w-[150px] object-contain rounded-lg" 
              onError={(e) => {
                // If fails to load, falls back to text or hidden
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="config-grid">
        
        {/* Left Side: Company Identity Profile */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6" id="company-profile-card">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Dados da Estamparia (Empresa)</h3>
              <p className="text-[10px] text-slate-400">Identificação para cabeçalhos e orçamentos</p>
            </div>
          </div>

          <form onSubmit={handleSaveCompany} className="space-y-4">
            {companySuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{companySuccess}</span>
              </div>
            )}
            
            {companyError && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{companyError}</span>
              </div>
            )}

            {/* Nome da Empresa */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                Nome da Empresa (Razão Social/Fantasia)
              </label>
              <input
                type="text"
                value={empresaNome}
                onChange={(e) => setEmpresaNome(e.target.value)}
                placeholder="Ex: Estamparia Central Têxtil"
                className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-medium"
              />
            </div>

            {/* CNPJ */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                CNPJ da Empresa
              </label>
              <input
                type="text"
                value={empresaCnpj}
                onChange={(e) => setEmpresaCnpj(e.target.value)}
                placeholder="Ex: 12.345.678/0001-99"
                className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-medium"
              />
            </div>

            {/* Logo Link */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Link do Logo (Imagem / Google Drive)</span>
                <span className="text-[10px] text-indigo-600 font-medium">Auto-convert</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <LinkIcon className="w-3.5 h-3.5" />
                </div>
                <input
                  type="url"
                  value={empresaLogo}
                  onChange={(e) => setEmpresaLogo(e.target.value)}
                  placeholder="Cole o link do Google Drive compartilhável"
                  className="block w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-mono text-[11px]"
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Faça o upload do logo no Google Drive, clique em <strong>Compartilhar (Qualquer pessoa com o link pode ler)</strong> e cole o link aqui. Nosso sistema converte o link para exibição direta.
              </p>
            </div>

            {/* Chave Pix */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                Chave PIX (Chave Aleatória para cobrança automática)
              </label>
              <input
                type="text"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                placeholder="Cole sua chave PIX aleatória (Ex: f89a7410-ecb8-47bc-87c2...)"
                className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-mono text-[11px]"
              />
              <p className="text-[10px] text-slate-400 leading-normal">
                Essa chave será utilizada nos orçamentos gerados e nas cobranças automáticas por WhatsApp e E-mail.
              </p>
            </div>

            {/* Logo Visual Live Preview */}
            {empresaLogo.trim() !== '' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Pré-visualização do Logotipo</span>
                {formattedLogoUrl ? (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs max-h-[120px] max-w-full flex items-center justify-center">
                    <img 
                      src={formattedLogoUrl} 
                      alt="Logo Empresa" 
                      referrerPolicy="no-referrer"
                      className="max-h-[100px] object-contain" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        setCompanyError('O link fornecido não pôde ser carregado como imagem. Verifique se o compartilhamento está público.');
                      }}
                      onLoad={() => {
                        setCompanyError('');
                      }}
                    />
                  </div>
                ) : (
                  <span className="text-xs text-rose-500 font-semibold">Link inválido ou não detectado.</span>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2"
              id="save-company-btn"
            >
              <Save className="w-4 h-4" /> Salvar Identidade da Empresa
            </button>
          </form>
        </div>

        {/* Right Side: Salespeople management list and commission structure */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col" id="vendedores-card">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Cadastro de Vendedores</h3>
                <p className="text-[10px] text-slate-400">Gerencie sua equipe, matrículas e comissões</p>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingVendedor(null);
                setVendedorForm({ nome: '', email: '', telefone: '', comissao: '5', registro: `VND-${Math.floor(1000 + Math.random() * 9000)}` });
                setIsVendedorFormOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10 flex items-center gap-1.5 shrink-0"
              id="add-vendedor-btn"
            >
              <Plus className="w-4 h-4" /> Cadastrar Vendedor
            </button>
          </div>

          {vendedorSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{vendedorSuccess}</span>
            </div>
          )}

          {/* Vendedor input form popup/collapsible */}
          <AnimatePresence>
            {isVendedorFormOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 overflow-hidden space-y-4"
                id="vendedor-form-container"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <h4 className="text-xs font-bold text-slate-800">
                    {editingVendedor ? `Editar Vendedor: ${editingVendedor.nome}` : 'Novo Cadastro de Vendedor'}
                  </h4>
                  <button
                    onClick={() => {
                      setIsVendedorFormOpen(false);
                      setEditingVendedor(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 text-xs font-extrabold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                {vendedorError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{vendedorError}</span>
                  </div>
                )}

                <form onSubmit={handleVendedorSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">Nome do Vendedor *</label>
                    <input
                      type="text"
                      required
                      value={vendedorForm.nome}
                      onChange={(e) => setVendedorForm({...vendedorForm, nome: e.target.value})}
                      placeholder="Ex: Carlos Oliveira"
                      className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>

                  {/* Registro/Matrícula */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">Código de Registro / Matrícula *</label>
                    <input
                      type="text"
                      required
                      value={vendedorForm.registro}
                      onChange={(e) => setVendedorForm({...vendedorForm, registro: e.target.value})}
                      placeholder="Ex: VND-3415"
                      className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-mono"
                    />
                  </div>

                  {/* Comissão % */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      Comissão de Venda (%) * <BadgePercent className="w-3.5 h-3.5 text-indigo-500" />
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      step="0.1"
                      value={vendedorForm.comissao}
                      onChange={(e) => setVendedorForm({...vendedorForm, comissao: e.target.value})}
                      placeholder="Ex: 5"
                      className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-mono"
                    />
                  </div>

                  {/* Telefone */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">Telefone / WhatsApp</label>
                    <input
                      type="tel"
                      value={vendedorForm.telefone}
                      onChange={(e) => setVendedorForm({...vendedorForm, telefone: e.target.value})}
                      placeholder="Ex: (11) 99999-8888"
                      className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">Endereço de E-mail</label>
                    <input
                      type="email"
                      value={vendedorForm.email}
                      onChange={(e) => setVendedorForm({...vendedorForm, email: e.target.value})}
                      placeholder="Ex: carlos@estamparia.com"
                      className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>

                  {/* Senha de Acesso */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">Senha de Acesso *</label>
                    <input
                      type="text"
                      required
                      value={vendedorForm.senha}
                      onChange={(e) => setVendedorForm({...vendedorForm, senha: e.target.value})}
                      placeholder="Senha do vendedor (Ex: 123456)"
                      className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">Status da Conta *</label>
                    <select
                      value={vendedorForm.status}
                      onChange={(e) => setVendedorForm({...vendedorForm, status: e.target.value as any})}
                      className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    >
                      <option value="Ativo">Ativo (Permitir Acesso)</option>
                      <option value="Pendente">Pendente (Aguardando Liberação)</option>
                      <option value="Bloqueado">Bloqueado (Negar Acesso)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 pt-2 flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsVendedorFormOpen(false);
                        setEditingVendedor(null);
                      }}
                      className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                    >
                      {editingVendedor ? 'Salvar Alterações' : 'Adicionar Vendedor'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vendedores List */}
          <div className="flex-1 overflow-x-auto" id="vendedores-table-container">
            {vendedores.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <div className="inline-flex p-4 bg-slate-50 border border-slate-100 rounded-full text-slate-300">
                  <Users className="w-8 h-8" />
                </div>
                <p className="text-xs font-bold text-slate-500">Nenhum vendedor cadastrado ainda.</p>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                  Cadastre seus parceiros e selecione-os no lançamento de vendas para gerar relatórios de comissões.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th className="pb-3 pl-2">Registro</th>
                    <th className="pb-3">Vendedor</th>
                    <th className="pb-3">Credenciais</th>
                    <th className="pb-3">Autorização</th>
                    <th className="pb-3 text-center">Comissão</th>
                    <th className="pb-3 text-right">Vendas / Comissões</th>
                    <th className="pb-3 pr-2 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {vendedores.map(v => {
                    const stats = getSalespersonStats(v.nome);
                    const comissaoDevida = (stats.totalVendido * v.comissao) / 100;
                    
                    // Status styling badge
                    let statusBadge = (
                      <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-emerald-50 text-emerald-700 uppercase">Ativo</span>
                    );
                    if (v.status === 'Pendente') {
                      statusBadge = (
                        <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-amber-50 text-amber-700 uppercase">Pendente</span>
                      );
                    } else if (v.status === 'Bloqueado') {
                      statusBadge = (
                        <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-rose-50 text-rose-700 uppercase">Bloqueado</span>
                      );
                    }

                    return (
                      <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 pl-2">
                          <div className="font-mono font-bold text-indigo-600">{v.registro}</div>
                          <div className="mt-1">{statusBadge}</div>
                        </td>
                        <td className="py-3">
                          <div className="font-semibold text-slate-800">{v.nome}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: {v.id}</div>
                        </td>
                        <td className="py-3 text-slate-500">
                          <div className="flex flex-col gap-0.5 font-mono text-[10px]">
                            {v.email && <span className="text-slate-600">{v.email}</span>}
                            <span className="text-indigo-600 font-bold">Senha: {v.senha || '123456'}</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-500">
                          <div className="text-[10px]">
                            <p className="font-bold text-slate-600">Autorizado por:</p>
                            <p className="text-indigo-600 font-medium">{v.autorizadoPor || 'Gerente Master'}</p>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span className="inline-block font-bold font-mono text-indigo-600 bg-indigo-50/40 px-2.5 py-1 rounded-lg">{v.comissao}%</span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="font-mono font-medium text-slate-700">{stats.quantidade} ped. ({formatCurrency(stats.totalVendido)})</div>
                          <div className="text-[10px] font-bold text-emerald-600 font-mono mt-0.5">Comissão: {formatCurrency(comissaoDevida)}</div>
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleCopyAccessLink(v)}
                              className={`p-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 text-[10px] font-bold ${
                                copiedVendedorId === v.id
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-250/50'
                                  : 'hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 border border-indigo-100/30'
                              }`}
                              title="Gerar e Copiar Link de Acesso com Credenciais para WhatsApp"
                            >
                              {copiedVendedorId === v.id ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <LinkIcon className="w-3 h-3" />
                                  <span>Gerar Link</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleEditVendedorClick(v)}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-850 rounded-lg transition-colors cursor-pointer"
                              title="Editar Vendedor"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir o vendedor "${v.nome}"?`)) {
                                  onDeleteVendedor(v.id);
                                }
                              }}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Excluir Vendedor"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
