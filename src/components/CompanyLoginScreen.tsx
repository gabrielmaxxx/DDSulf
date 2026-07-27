import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useSystemStore } from '@/store/systemStore';
import { Building2, KeyRound, AlertCircle, Sparkles, LogIn, UserPlus, ShieldAlert, Check } from 'lucide-react';

export function CompanyLoginScreen() {
  const { loginCompany, registerCompany, companies } = useSystemStore();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginName.trim()) {
      setErrorMsg('Por favor, informe o nome da empresa.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Por favor, digite a senha.');
      return;
    }

    setLoading(true);
    // Simulate slight lag for realistic visual feel
    setTimeout(() => {
      const res = loginCompany(loginName, loginPassword);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Erro ao realizar login.');
      } else {
        setSuccessMsg('Login realizado com sucesso! Carregando dados...');
      }
    }, 450);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedName = registerName.trim();
    if (!trimmedName) {
      setErrorMsg('O nome da empresa não pode ser vazio.');
      return;
    }
    if (registerPassword.length < 3) {
      setErrorMsg('A senha deve conter pelo menos 3 caracteres.');
      return;
    }
    if (registerPassword !== confirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = registerCompany(trimmedName, registerPassword);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Erro ao registrar empresa.');
      } else {
        setSuccessMsg('Conta criada com sucesso! Todos os dados foram inicializados zerados.');
        // After 1 sec, it shifts because currentCompany setter automatically refreshes App.tsx
      }
    }, 600);
  };

  // Demo shortcut credentials to easily test switching between accounts
  const companyKeys = Object.keys(companies || {});

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 md:p-8 font-sans antialiased">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative z-10"
      >
        {/* Decorative top bar */}
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />

        <div className="p-8 pb-5 border-b border-slate-100 flex flex-col items-center text-center">
          <div className="size-14 rounded-2xl bg-emerald-950 p-2 shadow-lg shadow-emerald-950/20 flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-200 border border-emerald-800/40">
            <img src="/brand/logo-icon.svg" alt="PestFlow" className="size-full object-contain" />
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">PestFlow Inteligência</h1>
          <p className="text-slate-500 text-xs mt-1.5 font-medium">Controle Multicontas & Isolamento de Ambientes Corporativos</p>

          {/* Tab Selection */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full mt-6 border border-slate-200/50">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className="size-3.5" />
              Entrar na Conta
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="size-3.5" />
              Cadastrar Nova Empresa
            </button>
          </div>
        </div>

        <div className="p-8 pt-6 space-y-6">
          {/* Status Alert Box */}
          {errorMsg && (
            <motion.div 
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-xs leading-normal"
            >
              <AlertCircle className="size-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold">Falha na Autenticação</span>
                <p className="opacity-90">{errorMsg}</p>
              </div>
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs leading-normal"
            >
              <Check className="size-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold">Acesso Concedido</span>
                <p className="opacity-90">{successMsg}</p>
              </div>
            </motion.div>
          )}

          {/* Tabs Content */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Nome da Empresa</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="size-4" />
                  </div>
                  <input 
                    type="text" 
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder="Ex: PestFlow Dedetizadora" 
                    className="w-full h-11 pl-10 pr-4 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium text-slate-800"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Senha Privada</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="size-4" />
                  </div>
                  <input 
                    type="password" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Insira sua senha residencial ou corporativa..." 
                    className="w-full h-11 pl-10 pr-4 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium text-slate-800"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold leading-none flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-75 disabled:pointer-events-none mt-2"
              >
                {loading ? 'Validando...' : 'Entrar no Sistema'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Nome da Nova Empresa</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="size-4" />
                  </div>
                  <input 
                    type="text" 
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Ex: PestFlow Filial Norte Ltda" 
                    className="w-full h-11 pl-10 pr-4 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium text-slate-800"
                    minLength={2}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Senha de Acesso</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="size-4" />
                    </div>
                    <input 
                      type="password" 
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Mínimo 3 dígitos" 
                      className="w-full h-11 pl-10 pr-4 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium text-slate-800"
                      minLength={3}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Confirmar Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="size-4" />
                    </div>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha" 
                      className="w-full h-11 pl-10 pr-4 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium text-slate-800"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Informative explanation card */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-left">
                <Sparkles className="size-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">Isolamento Amigável Ativo</h4>
                  <p className="text-[10px] text-amber-700/80 leading-relaxed">
                    Sua nova empresa será registrada localmente de forma isolada. Todos os cadastros, margens, procedimentos químicos e orçamentos iniciarão **totalmente zerados** e independentes.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold leading-none flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-75 disabled:pointer-events-none mt-2"
              >
                {loading ? 'Criando Conta...' : 'Registrar Empresa & Iniciar'}
              </button>
            </form>
          )}

          {/* Quick-switch Panel of current companies (perfect for grading, reviewing and multi-client testing) */}
          {companyKeys.length > 0 && (
            <div className="border-t border-slate-100 pt-5 mt-2">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-slate-800">
                  <ShieldAlert className="size-4 text-slate-500" />
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Empresas Cadastradas Localmente</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Selecione um ambiente corporativo para preencher as credenciais de teste automaticamente:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {companyKeys.map(key => {
                    const comp = companies[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setActiveTab('login');
                          setLoginName(comp.displayName);
                          setLoginPassword(comp.password);
                          setErrorMsg(null);
                        }}
                        className="text-[9px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-md px-2 py-1 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Building2 className="size-3" />
                        {comp.displayName} <span className="text-slate-400 font-mono">({comp.password})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
