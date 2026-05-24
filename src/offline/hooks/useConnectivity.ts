/**
 * React state hook linking components to High-Resolution Connectivity Monitors
 */

import { useState, useEffect } from 'react';
import { ConnectivityService } from '../connectivity';
import { ConnectivityState } from '../types';

export function useConnectivity(): ConnectivityState {
  const [state, setState] = useState<ConnectivityState>(ConnectivityService.getState());

  useEffect(() => {
    const unsubscribe = ConnectivityService.subscribe((connState) => {
      setState(connState);
    });
    return unsubscribe;
  }, []);

  return state;
}

export default useConnectivity;
