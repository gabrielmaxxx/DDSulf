# Recurring Billing & Invoicing Governance

Controle financeiro de recorrência, faturamento proporcional e liquidação de quotas de uso SaaS.

---

## 1. Billing Intervals and Rounding Rules
- Os preços dos planos base são indexados em BRL e cobrados de forma mensal ou anual.
- Upgrades imediatos de planos recalculam quotas de forma proporcional (prorata), ativando limites imediatamente na conta do cliente.

---

## 2. Pix & Boleto Reconciliation
Sendo o ecossistema SaaS eminentemente brasileiro para controle sanitário de pragas, o aplicativo valida transações via Pix e Boleto bancário integrado por eventos síncronos (webhooks), restabelecendo contas suspensas em segundos.
