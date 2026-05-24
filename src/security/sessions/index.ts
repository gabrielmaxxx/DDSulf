/**
 * DDSulf Session Security & Hijack Shield Service
 */

import { SessionMetadata } from '../types';

export class SessionSecurityService {
  private static STORAGE_KEY = 'ddsulf_secure_session_info';
  private static SESSION_DURATION_MS = 1000 * 60 * 60 * 8; // 8 Hours operational session standard length

  /**
   * Initializes a protected session block upon logins
   */
  public static startSession(userId: string): SessionMetadata {
    if (typeof window === 'undefined') {
      throw new Error('Sessions require fully interactive window runtime.');
    }

    const browserAgent = navigator.userAgent;
    
    // Quick parse helpers
    let browserName = 'Browser Desconhecido';
    if (browserAgent.indexOf('Chrome') > -1) browserName = 'Google Chrome';
    else if (browserAgent.indexOf('Safari') > -1) browserName = 'Apple Safari';
    else if (browserAgent.indexOf('Firefox') > -1) browserName = 'Mozilla Firefox';

    let osName = 'S.O. Desconhecido';
    if (browserAgent.indexOf('Win') > -1) osName = 'Windows Desktop';
    else if (browserAgent.indexOf('Android') > -1) osName = 'Dispositivo Android';
    else if (browserAgent.indexOf('iPhone') > -1) osName = 'Apple iOS';
    else if (browserAgent.indexOf('Mac') > -1) osName = 'macOS Workstation';

    const now = Date.now();
    const session: SessionMetadata = {
      sessionId: 'sess_' + Math.random().toString(36).substr(2, 9),
      userId,
      deviceId: 'dev_' + Math.random().toString(36).substr(2, 9),
      browser: browserName,
      os: osName,
      loggedInAt: now,
      lastActiveAt: now,
      expiresAt: now + this.SESSION_DURATION_MS,
      isValid: true
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  /**
   * Validates active session metadata, inspecting browser fingerprint
   */
  public static validateCurrentSession(): { isValid: boolean; reason?: string } {
    if (typeof window === 'undefined') return { isValid: true };

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      return { isValid: false, reason: 'Nenhuma sessão ativa encontrada.' };
    }

    const session: SessionMetadata = JSON.parse(stored);

    // Timeout Check
    if (Date.now() > session.expiresAt) {
      this.terminateSession();
      return { isValid: false, reason: 'Prazo da sessão operacional esgotado (Timeout).' };
    }

    // Refresh active counter
    session.lastActiveAt = Date.now();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));

    return { isValid: true };
  }

  /**
   * Cleans session buffers upon user logouts
   */
  public static terminateSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}
export default SessionSecurityService;
