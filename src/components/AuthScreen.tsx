/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { registerUser, loginUser, loginVendedor, UserAccount, Vendedor } from '../utils/db';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  KeyRound, 
  ArrowLeft, 
  Zap, 
  AlertCircle,
  CheckCircle2,
  Smartphone,
  MessageSquare,
  Users
} from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: UserAccount, vendedor?: Vendedor | null) => void;
  onGoBack: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthScreen({ onAuthSuccess, onGoBack, initialMode = 'login' }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [isVendedorLogin, setIsVendedorLogin] = useState(false);
  
  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [celular, setCelular] = useState('');
  const [serialKey, setSerialKey] = useState('');
  const [empresaNome, setEmpresaNome] = useState('');
  const [empresaCnpj, setEmpresaCnpj] = useState('');
  const [empresaLogo, setEmpresaLogo] = useState('');
  const [showCompanyFields, setShowCompanyFields] = useState(false);
  
  // States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deviceBlocked, setDeviceBlocked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    setTimeout(() => {
      if (isLogin) {
        if (isVendedorLogin) {
          // Salesperson Login Flow
          const result = loginVendedor(email, password);
          setIsLoading(false);
          if (result.success && result.vendedor && result.tenant) {
            setSuccess(`Bem-vindo, vendedor ${result.vendedor.nome}! Carregando dados da empresa...`);
            setTimeout(() => {
              onAuthSuccess(result.tenant!, result.vendedor);
            }, 1000);
          } else {
            setError(result.message);
          }
        } else {
          // Login Flow
          const result = loginUser(email, password);
          setIsLoading(false);
          if (result.success && result.user) {
            setSuccess('Login realizado com sucesso! Carregando dados...');
            setTimeout(() => {
              onAuthSuccess(result.user!, null);
            }, 800);
          } else {
            setError(result.message);
            if (result.deviceBlocked) {
              setDeviceBlocked(true);
            }
          }
        }
      } else {
        // Register Flow
        if (!nome || !email || !celular || !password) {
          setError('Preencha todos os campos obrigatórios.');
          setIsLoading(false);
          return;
        }
        const result = registerUser(
          nome, 
          email, 
          celular, 
          password, 
          serialKey || undefined,
          showCompanyFields ? empresaNome : undefined,
          showCompanyFields ? empresaCnpj : undefined,
          showCompanyFields ? empresaLogo : undefined
        );
        setIsLoading(false);
        if (result.success && result.user) {
          setSuccess(serialKey ? 'Cadastro e ativação efetuados com sucesso!' : 'Cadastro efetuado! 1 Dia de Teste Grátis Iniciado.');
          setTimeout(() => {
            onAuthSuccess(result.user!);
          }, 1500);
        } else {
          setError(result.message);
        }
      }
    }, 600);
  };

  const handleSupportClick = () => {
    const msg = encodeURIComponent("Preciso de ajuda com o bloqueio do meu serial no sistema do dtf textil");
    window.open(`https://api.whatsapp.com/send?phone=5511943152441&text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative" id="auth-screen-viewport">
      
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={onGoBack}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-950 transition-all rounded-xl text-xs font-bold border border-slate-200/80 cursor-pointer shadow-xs"
          id="auth-back-btn"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o Site
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/10">
          <Zap className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
          {isLogin ? 'Entrar no DTF Têxtil ERP' : 'Criar Conta de Gestão'}
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {isLogin 
            ? 'Acesse seu banco de dados individual e gerencie sua estamparia.' 
            : 'Cadastre-se para iniciar seu período de testes de 1 dia ou ativar seu serial.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200/80 shadow-2xl rounded-3xl sm:px-10">
          
          <form className="space-y-4" onSubmit={handleSubmit} id="auth-form-body">
            
            {/* Success Box */}
            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-2.5 text-emerald-800 text-xs font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Error Box */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-3 text-rose-800 text-xs font-medium">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                {deviceBlocked && (
                  <div className="pt-2 border-t border-rose-200/50">
                    <p className="text-[10px] text-rose-600">
                      Detectamos que este serial já está ativado em outra máquina física. Por favor, entre em contato para resetar seu dispositivo.
                    </p>
                    <button
                      type="button"
                      onClick={handleSupportClick}
                      className="mt-2.5 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" /> Chamar Suporte no WhatsApp
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isLogin && (
              <>
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Nome Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: João da Silva Estamparia"
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                    />
                  </div>
                </div>

                {/* Cellphone number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Número de Celular</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4.5 h-4.5" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={celular}
                      onChange={(e) => setCelular(e.target.value)}
                      placeholder="Ex: (11) 99999-9999"
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                    />
                  </div>
                </div>

                {/* Optional Company Details toggle */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={showCompanyFields}
                      onChange={(e) => setShowCompanyFields(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Cadastrar dados da Empresa (CNPJ, Logo, Nome)</span>
                  </label>
                  <p className="text-[10px] text-slate-400 ml-5.5 mt-0.5">
                    Seus orçamentos e relatórios serão impressos com os dados e logotipo da sua empresa.
                  </p>
                </div>

                {showCompanyFields && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3.5 pl-4 border-l-2 border-indigo-100 mt-2"
                  >
                    {/* Company Name */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">Nome Fantasia da Empresa</label>
                      <input
                        type="text"
                        placeholder="Ex: Estamparia Digital Express"
                        value={empresaNome}
                        onChange={(e) => setEmpresaNome(e.target.value)}
                        className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                      />
                    </div>

                    {/* Company CNPJ */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">CNPJ da Empresa</label>
                      <input
                        type="text"
                        placeholder="Ex: 00.000.000/0001-00"
                        value={empresaCnpj}
                        onChange={(e) => setEmpresaCnpj(e.target.value)}
                        className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                      />
                    </div>

                    {/* Company Logo Link */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">Link do Logotipo (URL do Drive ou Imagem)</label>
                      <input
                        type="url"
                        placeholder="Ex: https://drive.google.com/..."
                        value={empresaLogo}
                        onChange={(e) => setEmpresaLogo(e.target.value)}
                        className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-mono text-[10px]"
                      />
                      <span className="text-[9px] text-slate-400 block leading-tight">
                        Cole o link de compartilhamento público de uma imagem ou link direto. O sistema converterá links do Google Drive automaticamente.
                      </span>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {isLogin && (
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl" id="login-role-selector">
                <button
                  type="button"
                  onClick={() => setIsVendedorLogin(false)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !isVendedorLogin 
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🏢 Acesso Gestor
                </button>
                <button
                  type="button"
                  onClick={() => setIsVendedorLogin(true)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isVendedorLogin 
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  💼 Acesso Vendedor
                </button>
              </div>
            )}

            {/* Email Address or Seller Registration */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {isVendedorLogin ? 'Código de Matrícula ou E-mail do Vendedor' : 'Endereço de E-mail'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  {isVendedorLogin ? <Users className="w-4.5 h-4.5" /> : <Mail className="w-4.5 h-4.5" />}
                </div>
                <input
                  type={isVendedorLogin ? "text" : "email"}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isVendedorLogin ? "Ex: VND-1234 ou carlos@email.com" : "Ex: joao@email.com"}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {isVendedorLogin ? 'Senha do Vendedor' : 'Senha de Acesso'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>
            </div>

            {!isLogin && (
              /* Serial Key (Optional) */
              <div className="space-y-1.5 pt-1 border-t border-slate-100 mt-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700">Chave Serial (Opcional)</label>
                  <span className="text-[10px] text-indigo-600 font-bold">Para clientes Pro</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type="text"
                    value={serialKey}
                    onChange={(e) => setSerialKey(e.target.value)}
                    placeholder="Ex: DTF-XXXX-YYYY-ZZZZ"
                    className="block w-full pl-10 pr-4 py-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 uppercase font-mono tracking-wider placeholder:normal-case placeholder:font-sans placeholder:tracking-normal"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Deixe em branco se você deseja apenas realizar o **teste grátis de 1 dia**. Você poderá ativar um serial a qualquer momento depois.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 disabled:opacity-50"
              id="auth-submit-btn"
            >
              {isLoading ? 'Aguarde...' : isLogin ? 'Acessar Painel' : 'Concluir Cadastro e Ativar'}
            </button>

          </form>

          {/* Toggle Login/Register footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setError('');
                setSuccess('');
                setDeviceBlocked(false);
                setIsLogin(!isLogin);
                setIsVendedorLogin(false);
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors cursor-pointer"
              id="auth-toggle-mode-btn"
            >
              {isLogin 
                ? 'Não tem uma conta? Cadastre-se para testar por 1 Dia' 
                : 'Já possui uma conta? Entre por aqui'}
            </button>
          </div>

        </div>
      </div>

      {/* Security info note */}
      <div className="mt-6 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5" id="auth-security-disclaimer">
        <Smartphone className="w-4 h-4 text-slate-400" />
        <span>Vínculo físico ativo: Sua licença só poderá ser aberta neste dispositivo.</span>
      </div>

    </div>
  );
}
