/**
 * Communication Utilities for formatting, timeAgo displays and latency logs
 */

export function formatTimeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  if (diffMs < 60000) {
    return 'Agora mesmo';
  }
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) {
    return `Há ${diffMins} min`;
  }
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `Há ${diffHours} h`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `Há ${diffDays} dias`;
}

export function formatLatency(latencyMs?: number): string {
  if (latencyMs === undefined) return 'N/E';
  if (latencyMs < 1000) {
    return `${latencyMs}ms`;
  }
  return `${(latencyMs / 1000).toFixed(2)}s`;
}

export function generateUUID(): string {
  return 'comm_uuid_' + Math.random().toString(36).substring(2, 12);
}
