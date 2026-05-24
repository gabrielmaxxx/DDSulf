/**
 * DevOps shared auxiliary formats and calculations
 */

export function formatTimeRelative(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'agora mesmo';
  if (diffSec < 3600) return `há ${Math.floor(diffSec / 60)} min`;
  if (diffSec < 86400) return `há ${Math.floor(diffSec / 3600)} h`;
  return `há ${Math.floor(diffSec / 86400)} d`;
}

export function truncateSha(sha: string): string {
  if (!sha || sha.length <= 7) return sha;
  return sha.substring(0, 7);
}

export function getCanaryStatusDescription(weight: number): string {
  if (weight === 0) return 'Rollout suspenso / Tráfego desviado';
  if (weight < 30) return 'Fase de Teste Canário Inicial (Sandbox restrita)';
  if (weight < 100) return `Rollout progressivo canário ativo (${weight}% tráfego)`;
  return 'Lançado a 100%: Totalidade da Rede DDSulf alimentada';
}
