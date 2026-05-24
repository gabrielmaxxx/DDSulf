# Diretrizes de Governança, Aprendizado e Arquitetura de Conhecimento Operacional — DDSulf

Este documento oficial regula o ciclo de vida documental, os padrões de auditoria para Instruções Técnicas e POPs (Procedimentos Operacionais Padrão) e as metas de onboarding educacional acelerado dos técnicos em campo e parceiros franqueados do DDSulf.

---

## 1. Regras de Entrada e Ciclo de Vida do Conhecimento (Knowledge Lifecycle)

Para manter a consistência e estrita conformidade com as exigências da Anvisa (Agência Nacional de Vigilância Sanitária) e do Ibama (Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis), toda inclusão ou modificação documental passa pelo seguinte fluxo de alçadas:

1. **Rascunho Técnico (Draft):** Criado por supervisores operacionais, engenheiros agrônomos ou consultores educacionais.
2. **Revisão Obrigatória de EPIs (Safety Check):** Verificação de riscos ocupacionais, formulação da calda, dosagem e listagem das classes de equipamentos protetivos individuais requeridos.
3. **Double-Approval para Químicos Críticos:** Alterações nos procedimentos envolvendo o manejo de organofosforados de uso controlado demandam auditoria paralela do Responsável Técnico (RT) e do Diretor de Operações Logísticas.
4. **Homologação & Versionamento:** Uma nova versão incremental (ex: v2 -> v3) é estampada e distribuída às cargas de cache offline dos PWAs móveis dos técnicos ativados na região correspondente.

---

## 2. Padrões de Qualidade de Artigos e POPs (Procedure Standards)

Não toleramos documentação superficial, descritores soltos ou artigos estáticos sem propósito executável. Todo POP introduzido deve assegurar:

* **Passos Acionáveis Claros:** Cada atividade operacional em campo listará a sequência lógica de atuações, checklists explícitos e sinalizadores de perigo tóxico.
* **Provas Fotográficas em Alta Relevância:** Identificar quais etapas requerem registro fotográfico imediato (como selos físicos de ralo ou isolamento de silagem) com o intuito de evitar negligências.
* **Fórmula Proporcional Integrada:** Definição matemática estrita da diluição da calda química ativa (ex: volume de diluente por metro quadrado).

---

## 3. Trilhas de Aprendizado e Onboarding Educacional (Learning Paths)

* **Certificação Teórica Prévia:** Nenhum novo técnico receberá ordens de serviços ativas (OS) antes de concluir a trilha de "Onboarding Operacional para Técnicos DDSulf", alcançando score mínimo de **80/100** na bateria final de quizzes regulatórios.
* **Gamificação e Engajamento (XP Premium):** Conclusões de novos módulos de biologia de vetores ou descarte ecológico concedem pontos de experiência tática (XP Premium) que promovem os operadores em painéis de destaque corporativos e recompensas sazonais.
* **Reciclagem Semestral Mandatária:** Artigos com categorização `chemical_handling` passam por expiração periódica automática, demandando novas sessões interativas das equipes técnicas para mitigação de sinistros e acidentes laborais.

---

## 4. Auditoria, Telemetria e Latências de Conteúdo (Observability Rules)

O DDSulf protege a operação mapeando os hábitos de leitura da equipe por meio de indexadores analíticos:

* **Tempo de Absorção de Conteúdo:** Registro em milissegundos da leitura ativa do documento no PWA técnico para monitorar o engajamento genuíno contra cliques rápidos ("cliques fantasmas").
* **Mapeamento de Gargalos (Failed Steps Ratio):** Se mais de 15% dos operadores em campo marcarem uma mesma etapa como "Inexequível" ou "Ponto de Obstrução", o procedimento correlato é bloqueado preventivamente pela central e direcionado a novos testes de campo com o RT agrônomo.
