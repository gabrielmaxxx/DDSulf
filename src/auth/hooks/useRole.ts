import { useAuth } from './useAuth';
import { Role } from '../types';

export function useRole() {
  const { role, updateProfileState } = useAuth();

  const changeRoleSimulation = (newRole: Role) => {
    // Allows local dynamic role simulation for test users and live playgrounds
    updateProfileState({ role: newRole });
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
