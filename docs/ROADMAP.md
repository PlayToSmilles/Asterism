# ASTERISM · Roadmap vivo até a v1.0.0

**O criador é o protagonista. O ASTERISM é sua massa de modelar.**

Planejamento aprovado em 2026-10-24. Este arquivo reúne tarefas e progresso do produto; [PROJECT_STATUS](PROJECT_STATUS.md) concentra evidências e limitações, [CHANGELOG](CHANGELOG.md) registra mudanças e versões efetivamente entregues, e [DECISIONS](DECISIONS.md) explica decisões técnicas. Nenhum marco aqui cria uma release, tag ou autorização de publicação. O pacote continua em `0.1.0`.

## Resumo automático

<!-- roadmap:summary:start -->
Resumo gerado por `npm run roadmap:sync`; edite as tarefas abaixo, não esta tabela.

| Marco | Estado | Tarefas | Progresso |
| --- | --- | ---: | --- |
| v0.1.0 Beta — Fundação | concluída | 10/10 | ■■■■■■■■■■ 100% |
| v0.2.0 — A Primeira Faísca | planejada | 0/5 | □□□□□□□□□□ 0% |
| v0.3.0 — Descoberta Criativa | planejada | 0/6 | □□□□□□□□□□ 0% |
| v0.4.0 — Liberdade de Modelar | planejada | 0/5 | □□□□□□□□□□ 0% |
| v0.5.0 — Criar sem Medo | planejada | 0/5 | □□□□□□□□□□ 0% |
| v0.6.0 — Seu Mundo é Seu | planejada | 0/6 | □□□□□□□□□□ 0% |
| v0.9.0 Release Candidate — Estabilização | planejada | 0/7 | □□□□□□□□□□ 0% |
| v1.0.0 — O Estúdio de Universos | planejada | 0/5 | □□□□□□□□□□ 0% |

**Geral até a v1.0.0:** 10/49 tarefas (20%).
Cada checkbox tem o mesmo peso; o percentual não estima esforço, prazo ou maturidade.

**Fase atual / próxima a iniciar:** v0.2.0 — A Primeira Faísca (planejada).
**Na sequência:** v0.3.0 → v0.4.0 → v0.5.0 → v0.6.0 → v0.9.0 → v1.0.0.
<!-- roadmap:summary:end -->

## Como acompanhar

```sh
npm run roadmap:status
npm run roadmap:sync
```

O primeiro comando consulta os checkboxes atuais sem escrever arquivos; o segundo substitui somente o bloco entre os marcadores do resumo. Ambos funcionam sem rede ou dependências adicionais. Versionar este arquivo junto às alterações autorizadas mantém o histórico no GitHub; os comandos não fazem operações Git.

Para verificar o script isoladamente: `npm run roadmap:test`. Os testes usam o runner nativo do Node, separados da suíte Vitest do aplicativo.

Marque uma tarefa com `[x]` somente depois de verificar seus critérios; desmarque com `[ ]` se houver regressão. Depois rode `roadmap:sync` e revise o diff. Estado e percentual de cada versão são derivados: nenhum item concluído significa planejada; parte significa em andamento; todos significa concluída. Não mantenha percentuais ou estados paralelos nas seções manuais. Uma fase posterior pode avançar antes da anterior; a fase atual indicada é sempre a primeira ainda incompleta na ordem do documento.

Use títulos `## vMAJOR.MINOR.PATCH — Nome` (com `Beta` ou `Release Candidate` opcionais após a versão) e tarefas Markdown sob cada marco. Checkboxes aninhados também contam individualmente; prefira tarefas planas, verificáveis e sem subtotais duplicados. Exemplos em blocos de código e tarefas fora dos marcos não contam. Não remova nem duplique os marcadores. Ajustar o planejamento exige uma nota breve, não a implementação antecipada das funcionalidades. Ideias futuras não entram na contagem.

## v0.1.0 Beta — Fundação

**Propósito e experiência:** organizar, explorar e escrever universos num protótipo local-first utilizável. Marco de fundação concluído por decisão expressa do autor, com base nas implementações e validações documentadas; isso não declara um lançamento formal nem inclui automaticamente todo Unreleased numa release.

- [x] Biblioteca de universos com criação, abertura e importação independente.
- [x] Canvas livre e visão Constelações com navegação entre categorias.
- [x] Elementos e relações semânticas editáveis.
- [x] Escrita e Documentos vinculados ao universo.
- [x] Biblioteca de referências PDF com armazenamento separado.
- [x] Busca Universal pelos conteúdos suportados.
- [x] Persistência local e exportação/importação JSON.
- [x] Interface desktop e mobile, com suporte PWA experimental.
- [x] Publicação web e repositório open-source, conforme conclusão informada pelo autor.
- [x] Separação de licenças do código, documentação, artes e narrativa.

**Critério de conclusão:** os fluxos da fundação existem e têm evidências registradas em PROJECT_STATUS; validação visual/offline também foi confirmada pelo autor. **Limitações preservadas:** JSON não inclui PDFs; dados não sincronizam entre dispositivos; compatibilidade móvel e tecnologias assistivas continuam exigindo validação específica. Notas históricas de preparação privada não são uma consulta atual à publicação.

## v0.2.0 — A Primeira Faísca

**Propósito e experiência:** tornar intuitivo começar um universo vazio, oferecendo ajuda sem exigir familiaridade com grafos.

- [ ] Oferecer acolhimento criativo opcional e dispensável.
- [ ] Oferecer caminhos para inspiração, criação direta e exploração livre.
- [ ] Permitir nomes provisórios e renomeação no fluxo inicial.
- [ ] Ajudar a criar o primeiro conteúdo sem exigir conhecimento de grafos.
- [ ] Validar os caminhos de entrada e preservar integralmente o fluxo livre existente.

**Critério de conclusão:** é possível começar com ou sem orientação, dispensá-la e criar/renomear o universo sem bloqueios ou perda de dados. A validação deve cobrir desktop e mobile. **Nota:** a renomeação já existente é base a reutilizar, não comprovação de que o novo fluxo está concluído. Este marco substitui a antiga proposta informal “Cards 0.2” como planejamento da próxima versão; não renumera entregas passadas.

## v0.3.0 — Descoberta Criativa

**Propósito e experiência:** inspirar sem substituir a criatividade do usuário, sem IA.

- [ ] Criar uma biblioteca de perguntas abertas.
- [ ] Adequar sugestões ao estágio de criação.
- [ ] Permitir trocar, ignorar, fechar e retomar perguntas.
- [ ] Converter respostas em elementos somente com aprovação do usuário.
- [ ] Oferecer inspirações contextuais para desenvolver conexões.
- [ ] Validar liberdade de escolha, retomada e ausência de criação automática.

**Critério de conclusão:** sugestões são opcionais e retomáveis; ignorá-las não bloqueia o editor e nenhuma resposta vira conteúdo persistido sem decisão do criador. **Nota:** inspiração é apoio editorial, não geração de lore.

## v0.4.0 — Liberdade de Modelar

**Propósito e experiência:** permitir que cada usuário organize o mundo à sua maneira.

- [ ] Permitir categorias personalizadas.
- [ ] Permitir registrar ideias ainda não classificadas.
- [ ] Alterar categorias sem perda de conteúdo.
- [ ] Reorganizar elementos e relações com flexibilidade.
- [ ] Validar compatibilidade com universos e backups existentes.

**Critério de conclusão:** projetos antigos continuam abrindo; mudanças de categoria preservam IDs, textos e relações; ida e volta pelo backup não perde informações. **Nota:** mudanças do modelo exigem decisão técnica e validação de migração antes de implementação.

## v0.5.0 — Criar sem Medo

**Propósito e experiência:** experimentar e corrigir escolhas com segurança.

- [ ] Tornar reversíveis as operações críticas definidas na revisão do marco.
- [ ] Avaliar desfazer/refazer estrutural e registrar escopo e decisão.
- [ ] Melhorar o feedback de salvamento.
- [ ] Melhorar recuperação e tratamento de erros.
- [ ] Proteger contra perda ou exclusão acidental de conteúdo e validar os cenários críticos.

**Critério de conclusão:** a revisão identifica operações críticas e demonstra recuperação nos cenários acordados, com falhas de gravação visíveis e sem falsa confirmação de sucesso. **Nota:** histórico do editor de texto não equivale a desfazer/refazer do universo; a avaliação não promete uma implementação global antecipadamente.

## v0.6.0 — Seu Mundo é Seu

**Propósito e experiência:** preservar e transportar o universo completo.

- [ ] Oferecer backup completo com os PDFs anexados.
- [ ] Avaliar pacote ZIP com manifesto e registrar a decisão de formato.
- [ ] Implementar importação e restauração confiáveis do backup completo.
- [ ] Preservar compatibilidade com o JSON atual.
- [ ] Tratar arquivos ausentes ou corrompidos sem descartar dados válidos silenciosamente.
- [ ] Comunicar riscos locais e validar restauração em armazenamento independente.

**Critério de conclusão:** restaurar um backup em outro armazenamento recupera os conteúdos e anexos previstos no formato, com verificações de integridade e erros compreensíveis. **Nota:** ZIP é hipótese técnica a avaliar, não dependência ou formato já aprovado; o JSON atual continua útil.

## v0.9.0 Release Candidate — Estabilização

**Propósito e experiência:** amadurecer o produto antes da entrega estável.

- [ ] Realizar testes com iniciantes e criadores experientes.
- [ ] Revisar acessibilidade e corrigir bloqueios encontrados.
- [ ] Validar responsividade nos dispositivos acordados.
- [ ] Medir desempenho e corrigir gargalos relevantes.
- [ ] Verificar integridade e migração de dados.
- [ ] Revisar documentação e orientações de uso/backup.
- [ ] Resolver problemas críticos e registrar as pendências aceitas.

**Critério de conclusão:** há evidências dos cenários e ambientes testados, sem bloqueios críticos conhecidos para os fluxos centrais; limitações residuais estão explícitas. **Nota:** os ambientes e critérios de desempenho serão definidos ao iniciar o marco, sem prometer compatibilidade ainda não testada.

## v1.0.0 — O Estúdio de Universos

**Propósito e experiência:** permitir começar, imaginar, organizar, evoluir e preservar um universo com liberdade e autonomia.

- [ ] Validar a jornada completa do universo vazio à restauração de um backup.
- [ ] Confirmar a conclusão dos marcos anteriores e revisar os princípios permanentes.
- [ ] Consolidar evidências de qualidade e limitações aceitas para a experiência central.
- [ ] Revisar documentação, licenças e disponibilidade do código correspondente à entrega.
- [ ] Obter aprovação explícita do autor para a entrega v1.0.0 e seu escopo final.

**Critério de conclusão:** experiência central validada e aprovada pelo autor, com segurança e portabilidade dos dados. Marcar o marco não autoriza commit, tag, release ou deploy. **Nota:** estabilidade não significa ausência de qualquer defeito; problemas conhecidos precisam ser avaliados e comunicados.

## Princípios permanentes

- Guiar sem obrigar; nenhuma etapa vira tutorial obrigatório.
- Inspirar sem criar pelo usuário.
- Preservar a liberdade de organização, experimentação e mudança.
- Respeitar autoria e propriedade das criações.
- Não exigir contas para começar.
- Manter funcionamento local-first.
- Priorizar segurança e portabilidade dos dados.

## Fora da v1.0.0

Somente uma decisão explícita futura altera este escopo: sincronização em nuvem; contas obrigatórias; assistente de criação com IA; colaboração em tempo real; marketplace de plugins; aplicativos nativos e distribuição nas lojas; reformulações puramente decorativas sem benefício funcional. Estas ideias não contam no progresso.

## Registro de planejamento

- 2026-10-24: marcos aprovados pelo autor incorporados. Fundação reconhecida como concluída; v0.2.0 é a próxima fase, ainda não iniciada. Nenhuma tarefa futura foi marcada apenas por já existir uma função parcial semelhante. Não há marcos v0.7.0/v0.8.0 definidos; nenhum foi inventado.

Crédito público: **Projeto ASTERISM**. Este novo documento de planejamento não amplia automaticamente a lista de obras sob CC BY 4.0 em [DOCUMENTATION_LICENSE](DOCUMENTATION_LICENSE.md); preservam-se o escopo e as exclusões existentes.
