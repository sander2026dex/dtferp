/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  DEFAULT_CUSTOS, 
  DEFAULT_VENDAS, 
  DEFAULT_PRODUTOS, 
  DEFAULT_CLIENTES,
  DEFAULT_FORNECEDORES
} from './defaultData';
import { Custo, Venda, Produto, Cliente, TabType, Fornecedor } from './types';

// Tab Components
import DashboardTab from './components/DashboardTab';
import CustosTab from './components/CustosTab';
import VendasTab from './components/VendasTab';
import ProdutosTab from './components/ProdutosTab';
import ClientesTab from './components/ClientesTab';
import RelatoriosTab from './components/RelatoriosTab';
import FornecedoresTab from './components/FornecedoresTab';
import OrcamentosTab from './components/OrcamentosTab';
import AdminTab from './components/AdminTab';

// Auth & Landing Components
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import { 
  UserAccount, 
  loadUserDatabase, 
  saveUserDatabase, 
  getGlobalUsers, 
  saveGlobalUsers 
} from './utils/db';

import { 
  TrendingUp, 
  Wallet, 
  Users, 
  Archive, 
  Database,
  Grid3X3,
  Globe,
  Truck,
  FileText,
  LogOut,
  Settings,
  Lock,
  MessageSquare
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Multi-tenant Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('dtf_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'register'>('landing');

  // Core Workbook States (Loaded dynamically based on currentUser)
  const [custos, setCustos] = useState<Custo[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);

  // Sync state with tenant DB
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dtf_current_user', JSON.stringify(currentUser));
      
      const db = loadUserDatabase(currentUser.email);
      // Seed initial dummy data if they are a newly registered tenant
      if (db.custos.length === 0 && db.vendas.length === 0 && db.produtos.length === 0) {
        setCustos(DEFAULT_CUSTOS);
        setVendas(DEFAULT_VENDAS);
        setProdutos(DEFAULT_PRODUTOS);
        setClientes(DEFAULT_CLIENTES);
        setFornecedores(DEFAULT_FORNECEDORES);
        
        saveUserDatabase(currentUser.email, {
          custos: DEFAULT_CUSTOS,
          vendas: DEFAULT_VENDAS,
          produtos: DEFAULT_PRODUTOS,
          clientes: DEFAULT_CLIENTES,
          fornecedores: DEFAULT_FORNECEDORES
        });
      } else {
        setCustos(db.custos);
        setVendas(db.vendas);
        setProdutos(db.produtos);
        setClientes(db.clientes);
        setFornecedores(db.fornecedores);
      }
    } else {
      localStorage.removeItem('dtf_current_user');
    }
  }, [currentUser]);

  // Persistent Tenant Auto-Save Effect
  useEffect(() => {
    if (currentUser) {
      saveUserDatabase(currentUser.email, {
        custos,
        vendas,
        produtos,
        clientes,
        fornecedores
      });
    }
  }, [custos, vendas, produtos, clientes, fornecedores, currentUser]);

  // Check if current user trial has expired (1 day = 24 hours)
  const isTrialExpired = currentUser && 
    currentUser.status === 'trial' && 
    (Date.now() - currentUser.createdAt > 24 * 60 * 60 * 1000);

  // Quick action helper for simulating fast-forward of trial for testing
  const handleSimulateTrialExpiration = () => {
    if (!currentUser) return;
    const expiredTime = currentUser.createdAt - (25 * 60 * 60 * 1000); // 25 hours ago
    
    // Update local state
    const updatedUser: UserAccount = {
      ...currentUser,
      createdAt: expiredTime
    };
    setCurrentUser(updatedUser);
    
    // Update central database
    const usersList = getGlobalUsers();
    const updatedList = usersList.map(u => u.email.toLowerCase() === currentUser.email.toLowerCase() ? { ...u, createdAt: expiredTime } : u);
    saveGlobalUsers(updatedList);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    setActiveTab('dashboard');
  };

  // Check admin status
  const isAdminUser = currentUser && (
    currentUser.email.toLowerCase() === 'xboxcarioca@gmail.com' || 
    currentUser.email.toLowerCase() === 'admin@dtf.com'
  );

  // --- CRUD OPERATORS ---

  // Costs
  const handleAddCusto = (newCusto: Omit<Custo, 'id'>) => {
    const item: Custo = {
      ...newCusto,
      id: `c_${Date.now()}`
    };
    setCustos(prev => [item, ...prev]);
  };

  const handleEditCusto = (updatedCusto: Custo) => {
    setCustos(prev => prev.map(c => c.id === updatedCusto.id ? updatedCusto : c));
  };

  const handleDeleteCusto = (id: string) => {
    setCustos(prev => prev.filter(c => c.id !== id));
  };

  // Sales
  const handleAddVenda = (newVenda: Omit<Venda, 'id'>) => {
    const item: Venda = {
      ...newVenda,
      id: `v_${Date.now()}`
    };
    setVendas(prev => [item, ...prev]);
  };

  const handleEditVenda = (updatedVenda: Venda) => {
    setVendas(prev => prev.map(v => v.id === updatedVenda.id ? updatedVenda : v));
  };

  const handleDeleteVenda = (id: string) => {
    setVendas(prev => prev.filter(v => v.id !== id));
  };

  const handleToggleVendaStatus = (id: string) => {
    setVendas(prev => prev.map(v => {
      if (v.id === id) {
        return {
          ...v,
          status: v.status === 'Concluído' ? 'Pendente' : 'Concluído'
        };
      }
      return v;
    }));
  };

  // Products
  const handleAddProduto = (newProd: Omit<Produto, 'id'>) => {
    const item: Produto = {
      ...newProd,
      id: `p_${Date.now()}`
    };
    setProdutos(prev => [...prev, item]);
  };

  const handleEditProduto = (updatedProd: Produto) => {
    setProdutos(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
  };

  const handleDeleteProduto = (id: string) => {
    setProdutos(prev => prev.filter(p => p.id !== id));
  };

  // Clients
  const handleAddCliente = (newClient: Omit<Cliente, 'id'>) => {
    const item: Cliente = {
      ...newClient,
      id: `cl_${Date.now()}`
    };
    setClientes(prev => [...prev, item]);
  };

  const handleEditCliente = (updatedClient: Cliente) => {
    setClientes(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const handleDeleteCliente = (id: string) => {
    setClientes(prev => prev.filter(c => c.id !== id));
  };

  // Suppliers
  const handleAddFornecedor = (newForn: Omit<Fornecedor, 'id'>) => {
    const item: Fornecedor = {
      ...newForn,
      id: `f_${Date.now()}`
    };
    setFornecedores(prev => [...prev, item]);
  };

  const handleEditFornecedor = (updatedForn: Fornecedor) => {
    setFornecedores(prev => prev.map(f => f.id === updatedForn.id ? updatedForn : f));
  };

  const handleDeleteFornecedor = (id: string) => {
    setFornecedores(prev => prev.filter(f => f.id !== id));
  };

  // Reset core states to starting template spreadsheet
  const handleResetToDefaults = () => {
    setCustos(DEFAULT_CUSTOS);
    setVendas(DEFAULT_VENDAS);
    setProdutos(DEFAULT_PRODUTOS);
    setClientes(DEFAULT_CLIENTES);
    setFornecedores(DEFAULT_FORNECEDORES);
    setActiveTab('dashboard');
  };

  // Backup Import
  const handleImportBackup = (backup: {
    custos: Custo[];
    vendas: Venda[];
    produtos: Produto[];
    clientes: Cliente[];
    fornecedores?: Fornecedor[];
  }) => {
    setCustos(backup.custos);
    setVendas(backup.vendas);
    setProdutos(backup.produtos);
    setClientes(backup.clientes);
    if (backup.fornecedores) {
      setFornecedores(backup.fornecedores);
    }
  };

  // Redirect to WhatsApp when locked
  const handleWhatsAppUnlockRedirect = () => {
    const msg = encodeURIComponent("Quero comprar sistema do dtf textil");
    window.open(`https://api.whatsapp.com/send?phone=5511943152441&text=${msg}`, '_blank');
  };

  // --- VIEW RENDERING LOGIC ---

  // 1. Not Logged In View Router
  if (!currentUser) {
    if (currentView === 'landing') {
      return (
        <LandingPage 
          onStartTrial={() => setCurrentView('register')} 
          onGoToLogin={() => setCurrentView('login')} 
        />
      );
    }
    
    return (
      <AuthScreen 
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
        onGoBack={() => setCurrentView('landing')}
        initialMode={currentView === 'register' ? 'register' : 'login'}
      />
    );
  }

  // 2. Logged In: Check Trial Expiration View block
  if (isTrialExpired) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center px-6 py-12 font-sans text-center" id="trial-blocked-viewport">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl space-y-6">
          <div className="inline-flex p-4 bg-indigo-600 rounded-full text-white animate-pulse">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight">Seu período de teste expirou!</h2>
            <p className="text-sm text-slate-300">
              Obrigado por experimentar o **Sistema DTF Têxtil**. Seu período de testes grátis de 1 dia foi concluído.
            </p>
          </div>

          <div className="p-4 bg-indigo-950/40 rounded-2xl border border-indigo-500/20 text-indigo-300 text-xs text-left leading-relaxed">
            🚀 <strong>Vamos desbloquear seu sistema?</strong> Ao assinar por apenas **R$ 25 por mês**, você garante acesso vitalício, salvamento individual em nuvem e suporte premium para sua estamparia!
          </div>

          <button
            onClick={handleWhatsAppUnlockRedirect}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-5050 text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-emerald-600/15 flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4.5 h-4.5" /> Adquirir Sistema - Desbloquear Agora
          </button>

          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Sair da Conta
          </button>
        </div>
      </div>
    );
  }

  // 3. Normal ERP Workbook View
  const workbookTabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: TrendingUp, color: 'text-indigo-600' },
    { id: 'custos', label: '💸 Custos', icon: Wallet, color: 'text-rose-600' },
    { id: 'vendas', label: '💰 Vendas', icon: TrendingUp, color: 'text-emerald-600' },
    { id: 'produtos', label: '📦 Produtos', icon: Archive, color: 'text-blue-600' },
    { id: 'clientes', label: '👥 Clientes', icon: Users, color: 'text-purple-600' },
    { id: 'fornecedores', label: '🏭 Fornecedores', icon: Truck, color: 'text-amber-600' },
    { id: 'orcamentos', label: '📄 Orçamentos', icon: FileText, color: 'text-teal-600' },
    { id: 'relatorios', label: '📋 Relatórios', icon: Database, color: 'text-pink-600' },
  ];

  if (isAdminUser) {
    workbookTabs.push({ id: 'admin', label: '⚙️ Painel Admin', icon: Settings, color: 'text-slate-800' });
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans" id="app-root-container">
      
      {/* Trial simulation banner */}
      {currentUser.status === 'trial' && (
        <div className="bg-amber-600 text-white text-xs py-2 px-4 flex justify-between items-center gap-4 font-semibold" id="trial-simulation-banner">
          <span>⏱️ Você está no período de teste de 1 dia grátis. Aproveite todos os recursos!</span>
          <button
            onClick={handleSimulateTrialExpiration}
            className="px-3 py-1 bg-white hover:bg-slate-100 text-amber-700 font-bold rounded-lg text-[10px] uppercase transition-all cursor-pointer shadow-xs"
          >
            Simular Expiração de 1 Dia
          </button>
        </div>
      )}

      {/* Premium System Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/65 shadow-xs" id="app-header">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-600/15" id="brand-logo">
              <Grid3X3 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Sistema DTF Têxtil</span>
              <h1 className="text-lg font-extrabold text-slate-900 font-display tracking-tight">
                Planilha de Gestão Integrada
              </h1>
            </div>
          </div>

          {/* Connected indicators & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800">{currentUser.nome}</span>
              <span className="text-[10px] font-mono text-slate-400">{currentUser.email}</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-100" id="sync-badge">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Individual DB Ativo</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition-all border border-slate-200/80 cursor-pointer"
              title="Sair do Sistema"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Sheet Sheet-Worksheets Tabs Switching Bar */}
      <div className="bg-white border-b border-slate-200/50 shadow-xs sticky top-[77px] z-30" id="sheet-nav-bar">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <nav className="flex overflow-x-auto gap-1 py-1" id="workbook-sheets-list">
            {workbookTabs.map(tab => {
              const isActive = activeTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4.5 py-3 text-sm font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'border-indigo-600 bg-indigo-50/30 text-indigo-700' 
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  id={`sheet-tab-button-${tab.id}`}
                >
                  <TabIcon className={`w-4 h-4 ${tab.color}`} />
                  <span>{tab.label.split(' ')[1]}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Sheet Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8" id="sheet-stage">
        {activeTab === 'dashboard' && (
          <DashboardTab 
            custos={custos} 
            vendas={vendas} 
            produtos={produtos} 
            clientes={clientes} 
            onTabChange={setActiveTab}
          />
        )}
        {activeTab === 'custos' && (
          <CustosTab 
            custos={custos} 
            onAddCusto={handleAddCusto} 
            onEditCusto={handleEditCusto} 
            onDeleteCusto={handleDeleteCusto} 
          />
        )}
        {activeTab === 'vendas' && (
          <VendasTab 
            vendas={vendas} 
            produtos={produtos} 
            clientes={clientes} 
            onAddVenda={handleAddVenda} 
            onEditVenda={handleEditVenda} 
            onDeleteVenda={handleDeleteVenda} 
            onToggleStatus={handleToggleVendaStatus}
          />
        )}
        {activeTab === 'produtos' && (
          <ProdutosTab 
            produtos={produtos} 
            onAddProduto={handleAddProduto} 
            onEditProduto={handleEditProduto} 
            onDeleteProduto={handleDeleteProduto} 
          />
        )}
        {activeTab === 'clientes' && (
          <ClientesTab 
            clientes={clientes} 
            vendas={vendas} 
            onAddCliente={handleAddCliente} 
            onEditCliente={handleEditCliente} 
            onDeleteCliente={handleDeleteCliente} 
          />
        )}
        {activeTab === 'fornecedores' && (
          <FornecedoresTab 
            fornecedores={fornecedores} 
            onAddFornecedor={handleAddFornecedor} 
            onEditFornecedor={handleEditFornecedor} 
            onDeleteFornecedor={handleDeleteFornecedor} 
          />
        )}
        {activeTab === 'orcamentos' && (
          <OrcamentosTab 
            clientes={clientes} 
            produtos={produtos} 
          />
        )}
        {activeTab === 'relatorios' && (
          <RelatoriosTab 
            custos={custos} 
            vendas={vendas} 
            produtos={produtos} 
            clientes={clientes} 
            fornecedores={fornecedores}
            onResetToDefaults={handleResetToDefaults}
            onImportBackup={handleImportBackup}
          />
        )}
        {activeTab === 'admin' && isAdminUser && (
          <AdminTab />
        )}
      </main>

      {/* Small Spreadsheet Status Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 mt-12 text-center text-xs text-slate-400" id="workbook-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 DTF Têxtil. Planilha de Gestão Inteligente e integrada.</p>
          <p className="font-mono text-[10px] text-slate-300">ESTADO DO LIVRO: PRONTO | FÓRMULAS: ATIVAS</p>
        </div>
      </footer>
    </div>
  );
}
