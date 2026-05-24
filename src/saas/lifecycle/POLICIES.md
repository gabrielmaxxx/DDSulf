# Tenant Lifecycle Policies & Quota Management

Diretrizes relativas à suspensão, downgrade e expansão organizacional do inquilino.

---

## 1. Trial Lifecycle (Período de Demonstração)
- Novos técnicos ou empresas de desinfecção recebem status imediato `trialing` ao se autocadastrarem.
- Prazo de teste: 14 dias de acesso completo incluindo predições limitadas de mistura.
- Encerramento automático de recursos ao final do prazo de teste com sugestões de upgrades de planos.

---

## 2. Suspensions & Downgrades
- Adimplemento atrasado superior a 10 dias úteis transiciona a empresa para status de pendência (`past_due`), emitindo avisos persistentes na barra superior tática do operador.
- Bloqueio completo da emissão de POPs e receitas e encerramento da persistência de estoque químico caso as invoices persistam abertas por mais de 30 dias.
