import { useAuth } from './useAuth';
import { Role } from '../types';
import { UserProfile } from '@/types/database';

export function useRole() {
  const { role, updateProfileState } = useAuth();

  const changeRoleSimulation = (newRole: Role, extraProfile?: Partial<UserProfile>) => {
    // Allows local dynamic role simulation for test users and live playgrounds
    updateProfileState({ role: newRole, ...extraProfile });
  };

  return {
    role,
    isAdmin: role === 'admin',
    isManager: role === 'manager',
    isCommercial: role === 'commercial',
    isTechnician: role === 'technician',
    isOperator: role === 'operator',
    simulateRole: changeRoleSimulation
  };
}

export default useRole;
