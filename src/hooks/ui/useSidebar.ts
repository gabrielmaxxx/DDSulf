import { useUIStore } from '@/store/useUIStore';

export function useSidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);

  return {
    isOpen: sidebarOpen,
    toggle: toggleSidebar,
    setOpen: setSidebarOpen
  };
}

export default useSidebar;
