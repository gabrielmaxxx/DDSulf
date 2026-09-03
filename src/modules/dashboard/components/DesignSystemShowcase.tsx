import React from 'react';
import { 
  Paintbrush, 
  Command, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  Monitor, 
  Smartphone, 
  Tv, 
  Info,
  Layers,
  Palette,
  Eye,
  CheckCircle,
  TrendingUp,
  Sliders,
  Play
} from 'lucide-react';
import { 
  useTheme, 
  useResponsiveLayout, 
  useCommandPalette, 
  useMotionPreferences, 
  useAdaptiveDensity,
  CommandPaletteOverlay,
  PremiumGlassCard
} from '@/design-system';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function DesignSystemShowcase() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { device, isMobile, touchTargetMinHeight } = useResponsiveLayout();
  const { density, setDensity, getSpacingClass } = useAdaptiveDensity('comfortable');
  const { prefersReducedMotion } = useMotionPreferences();

  // Command palette configuration
  const { isOpen, setIsOpen, shortcuts } = useCommandPalette([
    {
      key: 'S',
      description: 'Sincronizar dados operacionais com Firestore',
      action: () => toast.success('Comando executado: Enviar dados ao Cloud Run!')
    },
    {
      key: 'N',
      description: 'Filtrar por Clientes em Churn em Erechim',
      action: () => toast.success('Comando executado: Filtro Churn Ativado!')
    },
    {
      key: 'C',
      description: 'Limpar todos os caches locais de telemetria',
      action: () => toast.success('Comando executado: Memória limpa.')
    }
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-600">
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">PestFlow UI/UX Standard Specification</span>
        <h2 className="text-3xl font-black text-black">Design System & Experiência Operacional</h2>
        <p className="text-gray-500 text-sm max-w-3xl">Auditoria visual de Tokens, layout adaptativo, paleta de cores unificada, e paleta de comandos de teclado de alta performance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Color Palette Widget */}
        <PremiumGlassCard className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Palette className="size-4 text-indigo-500" />
            <h4 className="text-xs font-black uppercase tracking-widest text-black">Paleta de Cores Premium</h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="font-bold">Primary Obsidian</span>
              <div className="size-5 bg-black rounded-lg border border-gray-200" />
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="font-bold">Nordic Off-White</span>
              <div className="size-5 bg-[#FAFAf9] rounded-lg border border-gray-200" />
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="font-bold">Indigo Accent</span>
              <div className="size-5 bg-[#4F46E5] rounded-lg border border-gray-200" />
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="font-bold">Nordic Mint Green</span>
              <div className="size-5 bg-[#10B981] rounded-lg border border-gray-200" />
            </div>
          </div>
        </PremiumGlassCard>

        {/* Command shortcuts trigger card */}
        <PremiumGlassCard className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Command className="size-4 text-indigo-500" />
            <h4 className="text-xs font-black uppercase tracking-widest text-black">Atalhos do Teclado PRO</h4>
          </div>
          
          <p className="text-xs text-gray-500 leading-relaxed font-semibold">
            Pressione <kbd className="bg-gray-100 border border-gray-200 px-1 py-0.5 rounded text-[10px] font-mono">⌘ + K</kbd> ou clique no botão abaixo para abrir a central de controle operacional imediato.
          </p>

          <Button 
            onClick={() => setIsOpen(true)}
            className="w-full h-11 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Abrir Central de Comandos
          </Button>
        </PremiumGlassCard>

        {/* Adaptive Layout diagnostics */}
        <PremiumGlassCard className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Sliders className="size-4 text-indigo-500" />
            <h4 className="text-xs font-black uppercase tracking-widest text-black">Responsividade & Densidade</h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Dispositivo Ativo:</span>
              <span className="font-mono font-bold uppercase">{device}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Altura de Toque (Touch):</span>
              <span className="font-mono font-bold uppercase text-emerald-600">{touchTargetMinHeight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Otimização Low-end:</span>
              <span className="font-mono font-bold uppercase">{prefersReducedMotion ? 'Ativo' : 'Não necessária'}</span>
            </div>
          </div>
        </PremiumGlassCard>
      </div>

      {/* Spacing & Density Playground Panel */}
      <PremiumGlassCard className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-black">Simulador de Densidade Adaptativa PestFlow</h3>
            <p className="text-xs text-gray-400">Personalize a escala visual para atender desde displays robustos até comandos rápidos de campo em Android celular.</p>
          </div>

          {/* Density Control Segment list */}
          <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
            {['comfortable', 'compact', 'dense_operational'].map(d => (
              <button
                key={d}
                onClick={() => setDensity(d as any)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  density === d ? 'bg-white text-black shadow-xs' : 'text-gray-400 hover:text-black'
                }`}
              >
                {d.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic preview block */}
        <div className={`border border-[#E5E7EB] bg-gray-50/50 rounded-2xl ${getSpacingClass('card')} transition-all`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Visual Preview Sandbox</span>
            <span className="size-2 bg-emerald-500 rounded-full" />
          </div>

          <div className="space-y-4">
            <h4 className="text-xl font-black text-black">Linha de Produção & Inspeções</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              Este componente adapta seu padding interno, tamanho de cabeçalho e espaçamento de lista de acordo com o token de densidade ativo: <span className="text-black font-black uppercase font-mono">{density}</span>.
            </p>

            <div className="grid gap-2 text-xs">
              <div className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <p className="font-bold">Inspeção de Silo #412</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Técnico: Marcos Silveira</p>
                </div>
                <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                  EM ANDAMENTO
                </span>
              </div>
            </div>
          </div>
        </div>
      </PremiumGlassCard>

      {/* Floating command component renderer */}
      <CommandPaletteOverlay 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        shortcuts={shortcuts}
      />
    </div>
  );
}
