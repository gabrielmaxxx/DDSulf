export const formatBRL = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatPercent = (value: number, decimals = 2): string =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + '%';

export const formatDate = (dateStr: string): string => {
  const parts = dateStr.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
};
