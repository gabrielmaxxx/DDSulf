import { useIsMobile } from '../use-mobile';

export function useMobile() {
  const isMobile = useIsMobile();
  
  return {
    isMobile,
    isTablet: !isMobile && typeof window !== 'undefined' && window.innerWidth < 1024,
    isDesktop: typeof window !== 'undefined' && window.innerWidth >= 1024
  };
}

export default useMobile;
