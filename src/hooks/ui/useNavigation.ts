import { useUIStore } from '@/store/useUIStore';

export function useNavigation() {
  const activeTab = useUIStore((state) => state.activeTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);

  return {
    activeTab,
    navigateTo: setActiveTab
  };
}

export default useNavigation;
