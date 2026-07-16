/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  KeyRound, 
  Plus, 
  Smartphone, 
  Trash2, 
  Check, 
  Ban, 
  Lock, 
  Unlock, 
  Coins, 
  TrendingUp, 
  Mail, 
  Phone,
  Grid3X3,
  Search,
  Zap,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { 
  getGlobalUsers, 
  saveGlobalUsers, 
  getGlobalSerials, 
  saveGlobalSerials, 
  generateSerialKey, 
  registerUser,
  deleteGlobalUser,
  UserAccount,
  SerialKey
} from '../utils/db';

export default function AdminTab() {
  const [users, setUsers] = useState<UserAccount[]>(() => getGlobalUsers());
  const [serials, setSerials] = useState<SerialKey[]>(() => getGlobalSerials());

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for manual registration
  const [manualNome, setManualNome] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualCelular, setManualCelular] = useState('');
  const [manualPassword, setManualPassword] = useState('123456'); // default password
  const [autoGenSerial, setAutoGenSerial] = useState(true);

  // Success / Error messages
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const refreshData = () => {
    setUsers(getGlobalUsers());
    setSerials(getGlobalSerials());
  };

  // Generate serial
  const handleGenerateSerial = () => {
    const adminEmail = 'admin@dtf.com';
    generateSerialKey(adminEmail);
    refreshData();
  };

  // Manual User Creation
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!manualNome || !manualEmail || !manualCelular) {
      setFormError('Preencha os campos obrigatórios!');
      return;
    }

    let serialToUse = '';
    if (autoGenSerial) {
      // First generate one
      const adminEmail = 'admin@dtf.com';
      serialToUse = generateSerialKey(adminEmail);
    }

    const result = registerUser(manualNome, manualEmail, manualCelular, manualPassword, serialToUse || undefined);
    
    if (result.success) {
      setFormSuccess(`Conta criada com sucesso para ${manualNome}! Password temporária: ${manualPassword}. ${serialToUse ? `Serial ativado: ${serialToUse}` : 'Iniciado em teste grátis.'}`);
      setManualNome('');
      setManualEmail('');
      setManualCelular('');
      refreshData();
    } else {
      setFormError(result.message);
    }
  };

  // Reset device fingerprint lock
  const handleResetDeviceLock = (email: string, serialKeyStr?: string) => {
    if (!serialKeyStr) return;
    const globalSerials = getGlobalSerials();
    const foundIdx = globalSerials.findIndex(s => s.key === serialKeyStr);
    if (foundIdx !== -1) {
      globalSerials[foundIdx].deviceId = undefined;
      saveGlobalSerials(globalSerials);
      alert(`Dispositivo físico liberado com sucesso para o serial ${serialKeyStr}! O usuário poderá logar a partir de qualquer nova máquina.`);
      refreshData();
    }
  };

  // Delete user account permanently
  const handleDeleteUser = (email: string, name: string) => {
    const lowerEmail = email.toLowerCase();
    if (lowerEmail === 'admin@dtf.com' || lowerEmail === 'xboxcarioca@gmail.com') {
      alert('Não é possível excluir a conta de administrador mestra do sistema.');
      return;
    }
    if (confirm(`⚠️ ATENÇÃO: Tem certeza que deseja EXCLUIR permanentemente o cliente ${name} (${email})?\n\nIsso apagará em definitivo seu registro de acesso e todos os dados salvos em nuvem de custos, produtos, clientes e vendas.`)) {
      deleteGlobalUser(email);
      refreshData();
    }
  };

  // Customizable billing message template
  const [billingTemplate, setBillingTemplate] = useState(() => {
    return localStorage.getItem('dtf_billing_template') || 
      `Olá, {nome}! 🚀\n\nIdentificamos que está na hora de renovar sua assinatura do *Sistema DTF Têxtil* para continuarmos juntos com força total! 📈\n\n*Vamos renovar?*\n📧 Usuário de Acesso: {email}\n💰 Valor da Licença: R$ 25,00/mês\n\n🔑 *Chave PIX de Renovação (Celular):* 11943152441 (Roberto)\n\nSeu acesso em nuvem garante salvamento individual de orçamentos, estoque e painel de vendas. Assim que realizar a transferência, basta enviar o comprovante por aqui!\n\nBoas vendas e muito sucesso! 🤝`;
  });

  const handleSaveTemplate = (text: string) => {
    setBillingTemplate(text);
    localStorage.setItem('dtf_billing_template', text);
  };

  // WhatsApp Billing
  const handleWhatsAppBilling = (user: UserAccount) => {
    const text = billingTemplate
      .replace(/{nome}/g, user.nome)
      .replace(/{email}/g, user.email);
    
    const cleanPhone = user.celular.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    window.open(`https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(text)}`, '_blank');
  };

  // Email Billing
  const handleEmailBilling = (user: UserAccount) => {
    const text = billingTemplate
      .replace(/{nome}/g, user.nome)
      .replace(/{email}/g, user.email);
      
    const subject = encodeURIComponent('Renovação da Assinatura - Planilha DTF Têxtil 🚀');
    const body = encodeURIComponent(text);
    window.open(`mailto:${user.email}?subject=${subject}&body=${body}`, '_blank');
  };

  // Toggle user status manually
  const handleToggleUserStatus = (email: string, currentStatus: string) => {
    const globalUsers = getGlobalUsers();
    const updated = globalUsers.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        let nextStatus: 'active' | 'trial' | 'blocked' | 'expired' = 'active';
        if (currentStatus === 'active') nextStatus = 'blocked';
        else if (currentStatus === 'blocked') nextStatus = 'active';
        else if (currentStatus === 'trial') nextStatus = 'expired';
        else nextStatus = 'active';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    saveGlobalUsers(updated);
    refreshData();
  };

  // Calculate stats
  const totalUsers = users.length;
  const trialUsers = users.filter(u => u.status === 'trial').length;
  const activeProUsers = users.filter(u => u.status === 'active' && u.serialKey).length;
  const blockedUsers = users.filter(u => u.status === 'blocked').length;
  const estimatedRevenue = (activeProUsers + users.filter(u => u.status === 'active' && !u.serialKey).length) * 25;

  const filteredUsers = users.filter(u => 
    u.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.celular.includes(searchQuery) ||
    (u.serialKey && u.serialKey.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6" id="admin-tab-root">
      
      {/* Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl" id="admin-header-banner">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-extrabold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> Painel de Controle Administrativo (SaaS)
          </div>
          <h2 className="text-xl font-extrabold font-display tracking-tight mt-1.5 flex items-center gap-2">
            ⚙️ Gestão de Licenças e Vendas da Plataforma
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Crie novos usuários, monitore o faturamento mensal estimado (R$ 25/mês por cliente), gere chaves seriais e libere ou bloqueie acessos multi-dispositivo.
          </p>
        </div>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Atualizar Dados
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="admin-stats-row">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Total de Usuários</span>
            <strong className="text-xl font-extrabold text-slate-900">{totalUsers}</strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Acessos em Teste</span>
            <strong className="text-xl font-extrabold text-slate-900">{trialUsers}</strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Licenças Pro Ativas</span>
            <strong className="text-xl font-extrabold text-slate-900">{activeProUsers}</strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Receita Recorrente</span>
            <strong className="text-xl font-extrabold text-indigo-700">R$ {estimatedRevenue.toFixed(2)} / mês</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="admin-main-grid">
        
        {/* Left Side: Create User Form & Serial Generator */}
        <div className="lg:col-span-5 space-y-6" id="admin-left-panel">
          
          {/* Manual creation */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2 pb-2 border-b border-slate-100">
              <Plus className="w-4 h-4 text-indigo-600" /> Cadastrar Novo Cliente DTF
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold rounded-xl">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl leading-relaxed">
                  {formSuccess}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Roberto Carlos da Silva"
                  value={manualNome}
                  onChange={(e) => setManualNome(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="cliente@email.com"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Celular / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    value={manualCelular}
                    onChange={(e) => setManualCelular(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Senha Inicial</label>
                  <input
                    type="text"
                    required
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="auto-gen-check"
                    checked={autoGenSerial}
                    onChange={(e) => setAutoGenSerial(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="auto-gen-check" className="text-xs font-semibold text-slate-600 cursor-pointer">Gerar Serial Pro</label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4.5 h-4.5" /> Cadastrar Cliente
              </button>
            </form>
          </div>

          {/* Serial Generator */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600" /> Chaves Seriais Disponíveis
              </h3>
              <button
                onClick={handleGenerateSerial}
                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 border border-emerald-200"
              >
                <Plus className="w-3.5 h-3.5" /> Gerar Nova
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1" id="serials-scroll-area">
              {serials.map((s, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold font-mono tracking-wider text-slate-800 block uppercase">{s.key}</span>
                    <span className="text-[9px] text-slate-400 block">
                      {s.assignedTo ? `Atribuído a: ${s.assignedTo}` : 'Não associado a nenhum cliente'}
                    </span>
                  </div>
                  <div>
                    {s.deviceId ? (
                      <span className="inline-flex px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded-full border border-indigo-100 uppercase">
                        Vínculo Físico Ativo
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded-full border border-slate-200 uppercase">
                        Sem Dispositivo
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {serials.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-4">Nenhuma chave serial cadastrada.</p>
              )}
            </div>
          </div>

          {/* Configuração de Mensagem de Cobrança / Renovação */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2 pb-2 border-b border-slate-100">
              <MessageSquare className="w-4 h-4 text-indigo-600" /> Mensagem de Cobrança / Renovação
            </h3>
            <p className="text-[11px] text-slate-400">
              Personalize o texto que será usado para cobrança direta via WhatsApp ou E-mail. Use as tags dinâmicas <strong className="text-slate-600">{`{nome}`}</strong> e <strong className="text-slate-600">{`{email}`}</strong> para substituição automática do destinatário.
            </p>
            <div className="space-y-2">
              <textarea
                value={billingTemplate}
                onChange={(e) => handleSaveTemplate(e.target.value)}
                rows={7}
                placeholder="Insira a mensagem de cobrança..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-sans leading-relaxed resize-y"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                <span>Salvamento automático ativo</span>
                <span>Contém frase: <strong className="text-indigo-600">vamos renovar</strong></span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Registered clients & Multi-device control list */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4" id="admin-right-panel">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" /> Lista Geral de Clientes do Sistema (Tenants)
            </h3>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Pesquisar por nome, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200/65 text-left text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5">Cliente</th>
                  <th className="py-2.5">Contato</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Chave / Dispositivo</th>
                  <th className="py-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((u) => {
                  const hasSerial = !!u.serialKey;
                  const isTrial = u.status === 'trial';
                  const isBlocked = u.status === 'blocked';
                  const isExpired = u.status === 'expired';
                  
                  // Device linked status
                  const associatedSerial = serials.find(s => s.key === u.serialKey);
                  const hasDeviceBound = associatedSerial && !!associatedSerial.deviceId;

                  return (
                    <tr key={u.email} className="hover:bg-slate-50/50">
                      <td className="py-3.5 pr-3 font-semibold text-slate-850">
                        <div>
                          <p>{u.nome}</p>
                          <span className="text-[10px] text-slate-400 font-medium">Cadastrado em {new Date(u.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600 font-mono text-[11px]">
                        <p className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {u.email}</p>
                        <p className="flex items-center gap-1 mt-0.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {u.celular}</p>
                      </td>
                      <td className="py-3.5">
                        {u.status === 'active' && (
                          <span className="inline-flex px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-full border border-emerald-100 uppercase tracking-wide">
                            Ativo
                          </span>
                        )}
                        {isTrial && (
                          <span className="inline-flex px-2.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-extrabold rounded-full border border-amber-100 uppercase tracking-wide">
                            Teste (1 dia)
                          </span>
                        )}
                        {isBlocked && (
                          <span className="inline-flex px-2.5 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-extrabold rounded-full border border-rose-100 uppercase tracking-wide">
                            Bloqueado
                          </span>
                        )}
                        {isExpired && (
                          <span className="inline-flex px-2.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-extrabold rounded-full border border-slate-200 uppercase tracking-wide">
                            Expirado
                          </span>
                        )}
                      </td>
                      <td className="py-3.5">
                        {hasSerial ? (
                          <div className="space-y-1">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-sm block text-center font-bold">
                              {u.serialKey}
                            </span>
                            {hasDeviceBound ? (
                              <span className="text-[9px] text-indigo-600 font-bold block flex items-center gap-0.5 justify-center">
                                <Lock className="w-3 h-3 shrink-0" /> Travado na Máquina
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400 block text-center">
                                Aguardando login...
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-450 italic text-[10px]">Sem Chave Pro</span>
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex justify-end gap-1.5 flex-wrap">
                          {/* Toggle access activation */}
                          <button
                            onClick={() => handleToggleUserStatus(u.email, u.status)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                              isBlocked 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100' 
                                : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                            }`}
                            title={isBlocked ? 'Desbloquear Acesso' : 'Bloquear Acesso'}
                          >
                            {isBlocked ? <Check className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>

                          {/* Reset device hardware lock */}
                          {hasDeviceBound && (
                            <button
                              onClick={() => handleResetDeviceLock(u.email, u.serialKey)}
                              className="p-1.5 bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                              title="Resetar Trava de Dispositivo Físico"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* WhatsApp Billing */}
                          <button
                            onClick={() => handleWhatsAppBilling(u)}
                            className="p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                            title="Cobrar via WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Email Billing */}
                          <button
                            onClick={() => handleEmailBilling(u)}
                            className="p-1.5 bg-sky-50 border border-sky-200 text-sky-600 hover:bg-sky-100 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                            title="Cobrar via E-mail"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          {/* Exclude Client */}
                          <button
                            onClick={() => handleDeleteUser(u.email, u.nome)}
                            className="p-1.5 bg-red-55/60 border border-red-200 text-red-600 hover:bg-red-100 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                            title="Excluir Cliente Permanentemente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 italic">
                      Nenhum cliente registrado correspondente aos critérios de busca.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
