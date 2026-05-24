/**
 * Custom React Hook: useCustomerPortal
 * Simplifies and feeds structural customer timelines, profile changes, and interactive portals actions.
 */

import { useState, useEffect } from 'react';
import { CustomerProfile, ServiceHistoryItem } from '../types';
import { CustomerRelationshipService } from '../services/customerService';

export function useCustomerPortal() {
  const [profiles, setProfiles] = useState<CustomerProfile[]>([]);
  const [history, setHistory] = useState<ServiceHistoryItem[]>([]);
  const [activeCustomerId, setActiveCustomerId] = useState<string>('');

  const reload = () => {
    const list = CustomerRelationshipService.getProfiles();
    setProfiles(list);
    setHistory(CustomerRelationshipService.getHistory());
    if (list.length > 0 && !activeCustomerId) {
      setActiveCustomerId(list[0].id);
    }
  };

  useEffect(() => {
    reload();
    const unsub = CustomerRelationshipService.subscribe(reload);
    return () => unsub();
  }, []);

  const activeProfile = profiles.find(p => p.id === activeCustomerId);
  const activeCustomerHistory = history.filter(h => h.customerId === activeCustomerId);

  const addNewClient = (client: Omit<CustomerProfile, 'id' | 'firstContractAt' | 'lastServiceAt' | 'totalServicesCompleted' | 'lifeTimeValue'>) => {
    CustomerRelationshipService.addCustomer(client);
  };

  return {
    profiles,
    history,
    activeCustomerId,
    setActiveCustomerId,
    activeProfile,
    activeCustomerHistory,
    addNewClient
  };
}

export default useCustomerPortal;
