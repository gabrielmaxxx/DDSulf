import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || 'Usuário',
          role: 'admin',
          createdAt: new Date().toISOString()
        });
      }

      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F9FAFB] font-sans selection:bg-black selection:text-white">
      {/* Left side - Aesthetic Branding */}
      <div className="hidden md:flex flex-1 bg-black p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
           <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 p-1.5 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                 <img src="/brand/logo-icon.svg" alt="PestFlow" className="size-full object-contain" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">PestFlow</span>
           </div>
        </div>

        <div className="relative z-10 space-y-6">
           <h1 className="text-5xl font-black text-white tracking-tightest leading-none">
              O futuro da<br/>inteligência<br/>operacional.
           </h1>
           <p className="text-white/50 font-medium max-w-sm text-lg">
              Sistema operacional para empresas de controle de pragas que buscam excelência técnica e financeira.
           </p>
        </div>

        <div className="relative z-10">
           <div className="flex gap-8">
              <div className="space-y-1">
                 <div className="text-2xl font-black text-white">99%</div>
                 <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Precisão de Margem</div>
              </div>
              <div className="space-y-1">
                 <div className="text-2xl font-black text-white">PWA</div>
                 <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Acesso em Campo</div>
              </div>
           </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-full opacity-20">
           <div className="absolute top-[-10%] right-[-10%] w-96 h-96 border border-white/20 rounded-full" />
           <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Right side - Login Box */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-12"
        >
          <div className="space-y-4">
             <div className="md:hidden flex items-center gap-3 mb-8">
                <div className="size-9 rounded-xl bg-emerald-950 p-1 flex items-center justify-center">
                   <img src="/brand/logo-icon.svg" alt="PestFlow" className="size-full object-contain" />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">PestFlow</span>
             </div>
             <h2 className="text-4xl font-black text-black tracking-tightest">Acesso Restrito</h2>
             <p className="text-[#6B7280] font-medium text-lg leading-snug">
                Bem-vindo ao centro operacional inteligente do PestFlow.
             </p>
          </div>

          <div className="space-y-4">
             <Button 
               onClick={handleGoogleLogin} 
               disabled={loading}
               className="w-full h-14 bg-black text-white hover:bg-black/90 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-between px-8 shadow-xl transition-all active:scale-95"
             >
               {loading ? 'Validando Acesso...' : 'Entrar com Conta Google'}
               <ArrowRight className="size-4" />
             </Button>

             <div className="flex items-center gap-2 pt-4 px-2">
                <Lock className="size-3 text-[#9CA3AF]" />
                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Criptografia de Ponta a Ponta</span>
             </div>
          </div>

          <div className="pt-12">
             <p className="text-[10px] font-medium text-[#9CA3AF] leading-relaxed uppercase tracking-wider">
                Exclusivo para parceiros e colaboradores autorizados.<br/>
                PestFlow Group © 2026
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
