/**
 * DDSulf design tokens foundation for spacing, grids, shadows & focus-rings
 */
export const DESIGN_TOKENS = {
  colors: {
    brand: {
      black: '#000000',
      slate: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        500: '#64748B',
        900: '#0F172A'
      },
      emerald: {
        500: '#10B981',
        600: '#059669'
      }
    }
  },
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    premium: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
    hover: 'hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]'
  },
  animations: {
    fade: 'animate-in fade-in duration-300',
    slideUp: 'animate-in fade-in slide-in-from-bottom-4 duration-500',
    scale: 'active:scale-95 transition-all duration-150'
  }
};
export default DESIGN_TOKENS;
