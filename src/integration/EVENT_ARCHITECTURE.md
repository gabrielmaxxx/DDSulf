# DDSulf Event Architecture & Integration standards (v1.2.0)

Especificação técnica e manual de governança de arquitetura distribuída orientada a eventos, orquestração de microsserviços cruzada e isolamento multi-tenant para a plataforma DDSulf.

---

## 1. Princípios da Arquitetura Orientada a Eventos (EDA)

O DDSulf adota desacoplamento estrito entre os seus módulos operacionais (Dashboard, Calculadora, Financeiro, POPs, Estoque, Inteligência Artificial) por meio do **DDSulf Enterprise Event Bus**.

### Regras de Ouro
1. **Zero Comunicação Direta:** Nenhum módulo operacional deve expor rotinas de importação de mutabilidade ou escrita síncrona diretamente a outros módulos.
2. **Propagação via Barramento:** Fluxos de trabalho dependentes ocorrem pela publicação assíncrona de eventos com tipagem estrita de payloads.
3. **Persistência de Trilha (Trace Auditing):** Todo fluxo de execução herda ou inicia uma cadeia de cabeçalho estruturada sob `correlationId` para depuração simplificada.

---

## 2. Padrões de Eventos e Esquema Contratual

Os eventos do sistema cumprem a interface reguladora do barramento:

```typescript
export interface OperationalEvent {
  id: string; // ID único auto-gerado de auditoria
  eventName: OperationalEventType; // tipo estrito de ação
  version: string; // versão de especificação contratual (atual 1.2.0)
  sourceModule: SystemModuleName; // módulo de origem de dados
  tenantId: string; // segregação estrita de multi-tenancy
  payload: any; // payload estruturado do evento
  timestamp: number; // época em milissegundos
  origin: 'client_offline' | 'client_online' | 'server_edge';
  correlationId: string; // ID de correlação distribuído
}
```

### Tipos de Evento Disponíveis

- **`pesticide.calculated`**: Propagado quando a Calculadora Estequiométrica conclui dosagem de defensivo m3/ha.
- **`pop.saved_anvisa`**: Emitido na assinatura criptográfica de laudo de segurança de aviação/campo.
- **`stock.low`**: Alerta vermelho de volumetria física residual de ingrediente ativo.
- **`ai.anomaly_detected`**: Sinalizador preventivo emitido pela heurística do motor avançado de inteligência artificial.

---

## 3. Mecanismo de Sincronismo Offline e Resiliência PWA

Em cenários adversos de plantações sem conectividade a satélite ou antenas de telefonia móvel:
- Caso o navegador detecte estado desconectado (`navigator.onLine === false`), as mensagens publicadas são retidas em fila sequencial ordenada local (`offlineQueue`).
- Após restabelecido o canal, o orquestrador realiza de-para de integridade e propaga em rajada controlada, re-executando os ganchos internos do barramento.

---

## 4. Multi-Tenant Event Isolation

Para mitigar cruzamento indevido de logs tributários e dados concorrentes rurais:
- O barramento inspeciona e valida estruturalmente o `tenantId` correspondente a cada callback.
- Conexões isoladas asseguram deparações sanitárias perfeitas.

---
*DDSulf Enterprise Systems Infrastructure © 2026*
