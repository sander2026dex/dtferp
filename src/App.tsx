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
import ConfigTab from './components/ConfigTab';

// Auth & Landing Components
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import { 
  UserAccount, 
  loadUserDatabase, 
  saveUserDatabase, 
  getGlobalUsers, 
  saveGlobalUsers,
  Vendedor,
  updateGlobalUser
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
  Unlock,
  MessageSquare
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Multi-tenant Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('dtf_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentVendedor, setCurrentVendedor] = useState<Vendedor | null>(() => {
    const saved = localStorage.getItem('dtf_current_vendedor');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentVendedor) {
      localStorage.setItem('dtf_current_vendedor', JSON.stringify(currentVendedor));
    } else {
      localStorage.removeItem('dtf_current_vendedor');
    }
  }, [currentVendedor]);

  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'register'>('landing');

  // Path routing state (to handle `/admin` and navigation)
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname;
  });

  // Also track if admin is authenticated via the master password
  const [isAdminSessionActive, setIsAdminSessionActive] = useState(() => {
    return sessionStorage.getItem('dtf_admin_authorized') === 'true';
  });

  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // Handle location changes (URL paths and hashes)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    
    // Support hash navigation fallback (for Netlify/SPA compatibility)
    const handleHashChange = () => {
      if (window.location.hash === '#/admin' || window.location.hash === '#admin') {
        setCurrentPath('/admin');
      } else if (window.location.hash === '#/' || window.location.hash === '') {
        setCurrentPath('/');
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    // Initial check for hash
    if (window.location.hash === '#/admin' || window.location.hash === '#admin') {
      setCurrentPath('/admin');
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    
    try {
      const msgBuffer = new TextEncoder().encode(adminPasswordInput);                    
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));             
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const expectedHash = '1af42ed9bd00df06dc1528192d68f208146d6c42ab2959cd0658c4fa00371e31';
      
      if (hashHex === expectedHash) {
        setIsAdminSessionActive(true);
        sessionStorage.setItem('dtf_admin_authorized', 'true');
        setAdminPasswordInput('');
        
        // Log them in as default admin@dtf.com if not already logged in
        const defaultAdmin: UserAccount = {
          email: 'admin@dtf.com',
          nome: 'Administrador',
          celular: '11943152441',
          passwordHash: 'admin123',
          createdAt: Date.now(),
          status: 'active'
        };
        setCurrentUser(defaultAdmin);
        setActiveTab('admin');
      } else {
        setAdminLoginError('Senha administrativa incorreta!');
      }
    } catch (err) {
      console.error(err);
      setAdminLoginError('Erro de processamento na validação da senha.');
    }
  };

  // Core Workbook States (Loaded dynamically based on currentUser)
  const [custos, setCustos] = useState<Custo[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);

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
        setVendedores([]);
        
        saveUserDatabase(currentUser.email, {
          custos: DEFAULT_CUSTOS,
          vendas: DEFAULT_VENDAS,
          produtos: DEFAULT_PRODUTOS,
          clientes: DEFAULT_CLIENTES,
          fornecedores: DEFAULT_FORNECEDORES,
          vendedores: []
        });
      } else {
        setCustos(db.custos);
        setVendas(db.vendas);
        setProdutos(db.produtos);
        setClientes(db.clientes);
        setFornecedores(db.fornecedores);
        setVendedores(db.vendedores || []);
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
        fornecedores,
        vendedores
      });
    }
  }, [custos, vendas, produtos, clientes, fornecedores, vendedores, currentUser]);

  // Synchronize database across tabs if localStorage changes (e.g. salesperson deleted by admin in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (currentUser && e.key === `dtf_user_db_${currentUser.email.toLowerCase()}`) {
        const db = loadUserDatabase(currentUser.email);
        setCustos(db.custos);
        setVendas(db.vendas);
        setProdutos(db.produtos);
        setClientes(db.clientes);
        setFornecedores(db.fornecedores);
        setVendedores(db.vendedores || []);
      }
      if (e.key === 'dtf_current_vendedor' && !e.newValue) {
        setCurrentVendedor(null);
        setCurrentView('landing');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser]);

  // If a salesperson is logged in, continuously check if they still exist in the database.
  // If they were deleted, log them out immediately!
  useEffect(() => {
    if (currentVendedor && currentUser) {
      const stillExists = vendedores.some(v => v.id === currentVendedor.id);
      // Wait: only check ifendedores state has been initialized and populated
      // If we have sellers in localStorage but state is empty, wait for sync.
      const db = loadUserDatabase(currentUser.email);
      const dbSellersList = db.vendedores || [];
      const stillInDb = dbSellersList.some(v => v.id === currentVendedor.id);
      
      if (!stillInDb) {
        handleLogout();
      }
    }
  }, [vendedores, currentVendedor, currentUser]);

  // Salespeople CRUD handlers
  const handleAddVendedor = (newV: Omit<Vendedor, 'id' | 'createdAt'>) => {
    const payload: Vendedor = {
      ...newV,
      id: `vnd_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now()
    };
    setVendedores(prev => [...prev, payload]);
  };

  const handleEditVendedor = (updatedV: Vendedor) => {
    setVendedores(prev => prev.map(v => v.id === updatedV.id ? updatedV : v));
  };

  const handleDeleteVendedor = (id: string) => {
    setVendedores(prev => {
      const updated = prev.filter(v => v.id !== id);
      if (currentVendedor && currentVendedor.id === id) {
        // Log them out!
        setTimeout(() => {
          handleLogout();
        }, 50);
      }
      return updated;
    });
  };

  // Profile updater
  const handleUpdateCurrentUser = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('dtf_current_user', JSON.stringify(updatedUser));
    updateGlobalUser(updatedUser.email, updatedUser);
  };

  // Real-time trial countdown timer state and effect
  const [trialTimeLeft, setTrialTimeLeft] = useState('');

  useEffect(() => {
    if (!currentUser || currentUser.status !== 'trial') {
      setTrialTimeLeft('');
      return;
    }

    const updateTimer = () => {
      const msLeft = (currentUser.createdAt + 24 * 60 * 60 * 1000) - Date.now();
      if (msLeft <= 0) {
        setTrialTimeLeft('Expirado');
        return;
      }

      const totalSeconds = Math.floor(msLeft / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setTrialTimeLeft(formatted);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [currentUser]);

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
    setCurrentVendedor(null);
    setCurrentView('landing');
    setActiveTab('dashboard');
    setIsAdminSessionActive(false);
    sessionStorage.removeItem('dtf_admin_authorized');
    window.history.pushState(null, '', '/');
    setCurrentPath('/');
    window.location.hash = '';
  };

  // Check admin status
  const isAdminUser = isAdminSessionActive || (currentUser && (
    currentUser.email.toLowerCase() === 'xboxcarioca@gmail.com' || 
    currentUser.email.toLowerCase() === 'admin@dtf.com'
  ));

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

  // A. Admin Login Interception (Path matches /admin and session not active)
  if (currentPath === '/admin' && !isAdminSessionActive) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-6 py-12 font-sans" id="admin-auth-viewport">
        <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle glowing absolute background gradient */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"></div>

          <div className="text-center space-y-4 relative">
            <div className="inline-flex p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-full text-indigo-400">
              <Lock className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block">Sistema de Gestão DTF</span>
              <h2 className="text-xl font-extrabold tracking-tight text-white font-display">Acesso Administrativo Restrito</h2>
              <p className="text-xs text-slate-400">
                Este terminal é de acesso restrito. Insira a senha mestra para gerenciar licenças, usuários e faturamento.
              </p>
            </div>
          </div>

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 relative">
            {adminLoginError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold rounded-xl text-center">
                ⚠️ {adminLoginError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Senha Mestra de Acesso</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-200 font-mono placeholder:text-slate-700"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" /> Autenticar e Acessar
            </button>
          </form>

          <div className="text-center pt-2 relative">
            <button
              onClick={() => {
                window.history.pushState(null, '', '/');
                setCurrentPath('/');
                window.location.hash = '';
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
            >
              Voltar para a Landpage
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        onAuthSuccess={(user, vendedor) => {
          setCurrentUser(user);
          if (vendedor) {
            setCurrentVendedor(vendedor);
            setActiveTab('orcamentos');
          } else {
            setCurrentVendedor(null);
            setActiveTab('dashboard');
          }
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
  const workbookTabs = currentVendedor
    ? [
        { id: 'orcamentos', label: '📄 Orçamentos', icon: FileText, color: 'text-teal-600' },
        { id: 'vendas', label: '💰 Minhas Vendas', icon: TrendingUp, color: 'text-emerald-600' },
      ]
    : [
        { id: 'dashboard', label: '📊 Dashboard', icon: TrendingUp, color: 'text-indigo-600' },
        { id: 'custos', label: '💸 Custos', icon: Wallet, color: 'text-rose-600' },
        { id: 'vendas', label: '💰 Vendas', icon: TrendingUp, color: 'text-emerald-600' },
        { id: 'produtos', label: '📦 Produtos', icon: Archive, color: 'text-blue-600' },
        { id: 'clientes', label: '👥 Clientes', icon: Users, color: 'text-purple-600' },
        { id: 'fornecedores', label: '🏭 Fornecedores', icon: Truck, color: 'text-amber-600' },
        { id: 'orcamentos', label: '📄 Orçamentos', icon: FileText, color: 'text-teal-600' },
        { id: 'relatorios', label: '📋 Relatórios', icon: Database, color: 'text-pink-600' },
        { id: 'config', label: '⚙️ Minha Empresa', icon: Settings, color: 'text-indigo-600' },
      ];

  if (isAdminUser && !currentVendedor) {
    workbookTabs.push({ id: 'admin', label: '⚙️ Painel Admin', icon: Settings, color: 'text-slate-800' });
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans" id="app-root-container">
      
      {/* Trial simulation banner */}
      {currentUser.status === 'trial' && (
        <div className="bg-amber-600 text-white text-xs py-2.5 px-4 flex flex-col md:flex-row justify-between items-center gap-3 font-semibold shadow-inner border-b border-amber-500" id="trial-simulation-banner">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="flex items-center gap-1.5 bg-amber-700/50 px-2 py-0.5 rounded-md border border-amber-500/40 font-bold uppercase text-[10px]">
              ⏱️ Período de Teste
            </span>
            <span>
              Você está aproveitando o período de 1 dia grátis! Tempo restante antes de expirar: 
              <span className="font-mono bg-amber-950/40 px-2 py-0.5 rounded-md font-bold text-[13px] ml-1.5 border border-amber-950/20 text-yellow-100 tracking-wider">
                {trialTimeLeft || 'Calculando...'}
              </span>
            </span>
          </div>
          <button
            onClick={handleSimulateTrialExpiration}
            className="px-3 py-1 bg-white hover:bg-amber-50 text-amber-800 font-extrabold rounded-lg text-[10px] uppercase transition-all cursor-pointer shadow-xs border border-amber-200"
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
              {currentVendedor ? (
                <>
                  <span className="text-xs font-bold text-indigo-600">💼 {currentVendedor.nome}</span>
                  <span className="text-[9px] font-semibold text-slate-400">Vendedor ({currentVendedor.registro})</span>
                </>
              ) : (
                <>
                  <span className="text-xs font-bold text-slate-800">{currentUser.nome}</span>
                  <span className="text-[10px] font-mono text-slate-400">{currentUser.email}</span>
                </>
              )}
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
            vendedores={vendedores}
            currentUser={currentUser}
            currentVendedor={currentVendedor}
            onAddVenda={handleAddVenda} 
            onEditVenda={handleEditVenda} 
            onDeleteVenda={handleDeleteVenda} 
            onToggleStatus={handleToggleVendaStatus}
            onAddVendedor={handleAddVendedor}
            onEditVendedor={handleEditVendedor}
            onDeleteVendedor={handleDeleteVendedor}
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
            currentUser={currentUser}
            currentVendedor={currentVendedor}
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
        {activeTab === 'config' && (
          <ConfigTab 
            currentUser={currentUser}
            onUpdateCurrentUser={handleUpdateCurrentUser}
            vendedores={vendedores}
            onAddVendedor={handleAddVendedor}
            onEditVendedor={handleEditVendedor}
            onDeleteVendedor={handleDeleteVendedor}
            vendas={vendas}
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
