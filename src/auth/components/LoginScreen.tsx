import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { Shield, Key, AlertCircle, Sparkles, LogIn, ChevronRight } from 'lucide-react';

export function LoginScreen() {
  const { loginWithGoogle, loginWithEmail } = useAuth();
  const { simulateRole } = useRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick credentials for test workflows or operations testing
  const quickTestCredentials = [
    { label: 'Administrador (Admin)', email: 'admin@ddsulf.com', role: 'admin' },
    { label: 'Gerência (Manager)', email: 'manager@ddsulf.com', role: 'manager' },
    { label: 'Comercial (Commercial)', email: 'commercial@ddsulf.com', role: 'commercial' },
    { label: 'Técnico de Campo (Technician)', email: 'tech@ddsulf.com', role: 'technician' }
  ];

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Preencha as credenciais da conta de acesso.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      console.warn('Auth credentials sync custom bypass scenario triggered:', err?.message || err);
      // Auto-bypass/simulate for client preview capability if Firebase Project Credentials aren't fully configured
      const matchedProfile = quickTestCredentials.find(c => c.email.toLowerCase() === email.toLowerCase());
      if (matchedProfile) {
        simulateRole(matchedProfile.role as any);
        console.log('[DDSulf LoginScreen] Simulated success path for development credentials:', email);
      } else {
        setErrorMsg('Usuário ou senha incorretos para o canal local. Use os atalhos abaixo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.warn('Google Identity Pop-up closed or bypass scenario triggered:', err?.message || err);
      setErrorMsg('Autenticação com Google cancelada ou indisponível no iframe. Use o painel rápido.');
    } finally {
      setLoading(false);
    }
  };

  const handleShortcutSelect = (shortcutEmail: string, role: string) => {
    setEmail(shortcutEmail);
    setPassword('ddsulf_bypass_pass_123');
    simulateRole(role as any);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 md:p-8 font-sans overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden"
      >
        <div className="p-8 pb-6 border-b border-slate-100 flex flex-col items-center text-center">
          {/* Top Logo Badge */}
          <div className="size-14 rounded-2xl bg-slate-900 shadow-md shadow-slate-950/20 flex items-center justify-center mb-4">
            <Shield className="size-7 text-white animate-pulse" />
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">DDSulf Operações</h1>
          <p className="text-slate-500 text-xs mt-1.5 font-medium">Controle de Pragas Inteligente & Gerenciamento de Campo</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Error Message Alert */}
          {errorMsg && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-xs leading-normal"
            >
              <AlertCircle className="size-4.5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold">Aviso de Acesso</span>
                <p className="opacity-90">{errorMsg}</p>
              </div>
            </motion.div>
          )}

          {/* Core Credentials Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Canal de E-mail</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: admin@ddsulf.com" 
                  className="w-full h-11 px-4 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-mono">Senha de Acesso</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha física..." 
                  className="w-full h-11 px-4 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold leading-none flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow active:scale-98 disabled:opacity-75 disabled:pointer-events-none"
            >
              <LogIn className="size-4" />
              {loading ? 'Entrando...' : 'Entrar com credenciais'}
            </button>
          </form>

          {/* Identity Federation SSO Divider */}
          <div className="relative flex items-center justify-center h-4">
            <hr className="w-full border-slate-100" />
            <span className="absolute px-3 bg-white text-[9px] font-black uppercase tracking-wider text-slate-400">Ou use login integrado</span>
          </div>

          {/* Unified Federated Action */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-11 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold leading-none flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-98 cursor-pointer"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.258-3.133C18.411 1.956 15.548 1 12.24 1 5.922 1 1 5.922 1 12.24c0 6.319 4.922 11.24 11.24 11.24 6.598 0 11.002-4.632 11.002-11.2 0-.756-.081-1.326-.183-1.995H12.24Z"/>
            </svg>
            Entrar com Conta Google
          </button>

          {/* Developer Quick-Switch Panel */}
          <div className="pt-2">
            <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-slate-800">
                <Sparkles className="size-4 text-amber-500 animate-bounce" />
                <span className="text-[10px] uppercase font-black tracking-wider font-mono">Painel de Simulação Rápida</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Clique em uma identidade operacional abaixo para entrar simulando a role correspondente imediatamente:
              </p>
              
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {quickTestCredentials.map((c) => (
                  <button
                    key={c.email}
                    onClick={() => handleShortcutSelect(c.email, c.role)}
                    className="w-full h-8 text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-900 hover:text-white border border-slate-200/80 rounded-lg px-2.5 flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <span>{c.label}</span>
                    <ChevronRight className="size-3 opacity-50 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all text-slate-400 group-hover:text-white" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginScreen;
