# Regras de desenvolvimento e documentação

> Prosa original: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), com [escopo e exclusões](docs/DOCUMENTATION_LICENSE.md).

## Antes de alterar

- Trabalhar somente neste projeto. Ler `README.md`, `docs/PROJECT_STATUS.md`, `docs/ARCHITECTURE.md`, `docs/CHANGELOG.md` e `docs/DECISIONS.md`; conferir o código envolvido antes de concluir como funciona.
- Investigar a causa de defeitos e o uso do código antes de modificá-lo ou apagá-lo. Não tratar hipóteses ou recursos não verificados como fatos.
- Priorizar alterações pequenas e localizadas. Não adicionar funcionalidades fora do escopo, dependências desnecessárias ou abstrações para necessidades futuras.
- Na evolução do produto, consultar `docs/ROADMAP.md`, identificar a fase e tarefas afetadas e respeitar seu escopo. O roadmap planeja; CHANGELOG, PROJECT_STATUS e DECISIONS mantêm suas funções próprias.

## Preservar

- TypeScript strict e a separação entre modelo, interface e persistência. `src/domain/model.ts` não depende de React ou React Flow.
- IDs estáveis, validação de dados externos antes de entrar no estado e remoção de relações incidentes ao excluir cards.
- Estado transitório do canvas separado do projeto persistente, conforme `ARCHITECTURE.md`.
- Demonstração isolada de projetos do usuário. Seus textos e relações não são lore oficial.

## Registrar e verificar

- Toda alteração deve constar no relatório final, com arquivos afetados, motivo, verificações executadas e limitações.
- Registrar mudanças relevantes em `docs/CHANGELOG.md`, seção `Unreleased`. Correções pequenas não exigem novos documentos.
- Atualizar documentos somente quando os fatos correspondentes mudarem. Mudanças arquiteturais atualizam `ARCHITECTURE.md`; decisões novas ou revistas atualizam também `DECISIONS.md`.
- Evitar duplicação: README é a entrada; PROJECT_STATUS concentra estado/evidências/pendências; ARCHITECTURE descreve o funcionamento; CHANGELOG registra evolução e versionamento; DECISIONS explica escolhas e consequências. Preferir links entre eles.
- Após mudanças funcionais, executar `npm test`, `npm run lint` e `npm run build`; verificar no navegador quando disponível e relevante. Para alterações apenas documentais, conferir conteúdo, links e escopo dos arquivos; executar verificações adicionais quando necessário para sustentar uma afirmação.
- Não registrar testes como aprovados sem executá-los. Distinguir execução atual, evidência anterior e comportamento apenas inspecionado no código. Informar o que não foi verificado visualmente.
- Atualizar checkboxes do roadmap somente com conclusão comprovada pelos critérios de aceitação, não apenas código escrito; registrar brevemente decisões que alterem o planejamento e executar `npm run roadmap:sync` após mudanças. Informar no relatório final quais itens avançaram. Documentação/scripts independentes do roadmap podem ser validados com seus testes específicos, sem repetir a suíte do aplicativo.

## Branches e ambientes

- `main` é a base estável destinada à produção. Desenvolver onboarding/Constelação de Possibilidades em `feat/primeira-faisca` e o fluxo direto/ferramentas em `feat/fluxo-experiente`, nas worktrees e portas descritas em [ROADMAP](docs/ROADMAP.md#fluxos-de-desenvolvimento).
- As duas experiências compartilham o mesmo aplicativo; não duplicar modelo, persistência ou arquitetura. Conferir branch, worktree e alterações locais antes de trabalhar. Não mover alterações entre fluxos nem trocar branches com trabalho pendente sem investigar.
- Propor integração por Pull Request após revisão e verificações; atualizar a partir da main em lotes pequenos somente com autorização para as operações Git envolvidas. Não enviar experimentos à produção sem aprovação.

## Versionar somente com autorização

- Seguir a política em `docs/CHANGELOG.md`. Não aumentar a versão automaticamente; documentação por si só não exige nova versão.
- Não executar commit, push, tag, release, deploy ou publicação sem autorização explícita. Autorizar uma entrega/versionamento não autoriza implicitamente essas outras ações.
