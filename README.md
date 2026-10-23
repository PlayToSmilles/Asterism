# ASTERISM — Worldbuilding for Anything

Ambiente visual de worldbuilding para escritores, mestres de RPG e criadores de universos. O objetivo é transformar personagens, lugares, facções, magias, eventos e ideias em cards conectados por relações significativas, tanto para começar um mundo quanto para organizar uma lore existente.

Um produto PlayToSmilles. O protótipo é uma aplicação local com React, TypeScript strict, Vite e React Flow. Não possui backend, autenticação ou IA.

## Funcionalidades atuais

- Biblioteca responsiva de universos locais, com capas em destaque, criação, importação e exclusão confirmada. Abertura e retorno espaciais preservam a rolagem e respeitam movimento reduzido. Demonstração independente de Nyvorn.
- Cards visuais com título e categoria sobre imagem opcional por URL HTTP/HTTPS, fallback e formato conforme a categoria. Descrição completa e edição ficam no painel lateral.
- Conexões flutuantes direcionais, recíprocas ou associativas, com rótulos editáveis, relações paralelas e auto-relações; excluir um elemento remove suas relações incidentes.
- Documentos vinculados no inspector, derivados das conexões, com acesso direto ao editor. Superfícies suaves e painéis translúcidos com blur moderado.
- Elementos Documento com editor amplo: parágrafos, títulos/subtítulos, negrito, itálico, listas e desfazer/refazer durante a sessão de escrita. Conteúdo estruturado incluído no JSON.
- Canvas com constelações visuais por categoria, foco de vizinhança e Canvas livre com detalhe progressivo conforme o zoom. Arrasto, pan, enquadramento e minimapa preservados.
- Organização automática com prévia e Modo dinâmico opcional: arrastar influencia os vizinhos e as posições são salvas ao estabilizar.
- Persistência local de conteúdo, posições confirmadas e câmera; importação validada e exportação JSON.
- Busca universal no universo aberto: lupa ou Ctrl/Cmd+K, pesquisa sem acentos em elementos/documentos/relações e nomes de PDFs; setas e Enter navegam ao resultado, Esc fecha. A busca não lê o conteúdo dos PDFs nem mantém histórico.
- Biblioteca de Referências por universo: adicionar, consultar, substituir e remover PDFs locais, com visualizador nativo e opções para abrir separadamente ou baixar.

Esses recursos estão implementados. Evidências de verificação, pendências e limitações estão em [PROJECT_STATUS](docs/PROJECT_STATUS.md).

## Instalar e executar

Na biblioteca, use **Criar universo**, **Importar projeto** ou abra um universo existente. A lixeira de cada projeto abre uma confirmação com seu nome. Apagar remove o universo e seus PDFs locais; os outros universos não são afetados. A demonstração aparece como um universo na biblioteca; quando ela está vazia, **Abrir demonstração** cria uma instância independente. Exporte backups antes de apagar: o JSON preserva os dados do universo, mas não inclui PDFs. Se a limpeza dos PDFs falhar, o diálogo permite tentar novamente.

Use Node.js 24 e npm. O manifesto também aceita Node 22.12+ da linha 22 ou Node 26+.

```sh
npm ci
npm run dev
```

Abra o endereço mostrado pelo Vite. Crie um universo ou abra Nyvorn. Use **Novo elemento**, escolha categoria e título. Selecione um elemento para editar; arraste o ponto direito até o ponto esquerdo de outro elemento para conectar (ou clique nos dois pontos em sequência). As linhas acompanham as bordas automaticamente. Selecione a linha/rótulo para editar a relação. Arraste o fundo para navegar e use a rolagem ou os controles inferiores para zoom e enquadramento.

Títulos, nomes, URLs de imagem e rótulos são confirmados ao sair do campo; descrições e categorias são atualizadas imediatamente. Apague a URL para remover uma imagem. Exporte backups: os projetos ficam neste navegador e não sincronizam dispositivos. O conteúdo de Nyvorn é ilustrativo, não lore oficial.

Universos com conteúdo abrem na visão **Constelações**, uma organização visual pelas categorias existentes. Passe o ponteiro sobre o círculo ou use Tab para revelar suas estatísticas. Clique ou use Enter para explorar; Espaço marca o anel. No toque, o primeiro toque revela detalhes e o segundo abre a categoria. Também é possível entrar no **Canvas livre**. No Inspector, **Explorar vizinhança** mostra o elemento e seus vizinhos numa disposição temporária; **Voltar à disposição anterior** restaura o contexto. Essas vistas não alteram as posições salvas nem criam grupos narrativos.

No Canvas livre, o **Modo dinâmico** começa habilitado e salva as posições ao estabilizar, sem faixa de confirmação nem gravação por tick. **Configurações**, na engrenagem à esquerda de Importar no cabeçalho desktop, permite desligá-lo; a preferência fica neste navegador, fora do JSON. A disposição de Constelações e vizinhanças permanece estática. Os três pontos decorativos das categorias dispersam e orbitam ao interagir; retornam ao repouso ao perder hover/foco ou marcação. Movimento reduzido mantém esses pontos estáticos. Interromper a simulação antes de estabilizar mantém as últimas posições salvas. A organização automática continua com sua prévia própria de aplicar/cancelar. O Canvas livre renderiza apenas elementos visíveis para reduzir trabalho fora da tela; os demais continuam no modelo e na simulação.

No workspace desktop, uma barra unificada reúne **Canvas**, **Escrita** (lista dos Documentos do universo), **PDFs** e vistas do canvas. As configurações abrem em um popover pelo cabeçalho, com fechamento por clique fora ou Esc. Zoom e minimapa têm margens inferiores simétricas. As transições dos controles respeitam movimento reduzido. O painel flutuante de um elemento organiza **Informações** e **Conexões**; documentos vinculados ficam em Conexões. Os painéis podem ser fechados para liberar a visualização do canvas. **Enquadrar elementos** desconta os controles e não amplia além de 1:1; os botões de zoom continuam disponíveis.

No mobile, o universo abre na biblioteca pesquisável. A navegação inferior oferece **Universo**, **Escrita**, **Canvas** e **Referências**; o botão **＋** cria elementos. Toque em um elemento para ler e explorar relações; **Editar** abre o mesmo painel de edição. Na área Escrita, toque em um documento para abri-lo diretamente; a formatação fica embaixo. O menu **Arquivos** reúne importação, exportação e compartilhamento quando disponível.

Selecione uma conexão para escolher **Tipo de relação**: direcional (uma seta), recíproca (duas setas) ou associativa (pontos nas pontas, linha tracejada). Relações antigas sem tipo mantêm a leitura direcional. Todo Documento conectado diretamente a um elemento aparece em **Documentos vinculados**, sem duplicação por relações paralelas; o atalho abre o mesmo editor e permite voltar ao elemento de origem.

Escolha **Documento** para começar a escrever; depois, selecione sua representação no canvas e use **Abrir documento** para continuar. **Voltar ao canvas** mantém o texto e as conexões. Título e texto do editor são atualizados em memória imediatamente e gravados após 750 ms de pausa, com confirmação ao navegar, exportar e sair/ocultar a página. O histórico de desfazer/refazer pertence à sessão aberta. Documento autoral e PDF de referência são recursos distintos. Limites do formato e do armazenamento estão em [PROJECT_STATUS](docs/PROJECT_STATUS.md).

No universo, abra **Referências** e adicione um PDF de até **20 MiB**. Selecione o anexo para consultar; páginas e zoom usam os controles nativos do navegador. Se o visualizador não funcionar, use **Abrir separadamente** ou **Baixar PDF**. Selecionar um card ou criar um novo retorna ao painel de edição; o canvas permanece montado.

Os PDFs ficam no IndexedDB deste navegador, separados dos dados do universo no LocalStorage. **A exportação JSON não inclui PDFs nem seus metadados.** Importar JSON cria um novo universo sem anexos; mantenha os arquivos originais ou baixe-os individualmente. Ainda não existe backup completo que reúna universo e documentos.

## Verificações

A versão de produção é uma PWA. O cache offline é gerado somente por `npm run build`; `npm run dev` continua sem service worker para evitar interferência no desenvolvimento.

```sh
npm test
npm run lint
npm run build
```

Para servir o build gerado, execute `npm run preview`. Testes automatizados não substituem a verificação visual do editor; consulte o roteiro em [PROJECT_STATUS](docs/PROJECT_STATUS.md#verificação-manual-do-fluxo-principal).

## Instalar no iPhone e usar offline

1. Abra a aplicação no Safari em uma **origem HTTPS confiável**, instalada na raiz do domínio. Nenhum endereço foi publicado por esta implementação. O preview em localhost serve para QA no computador; HTTP por IP da rede não oferece a mesma exceção segura de localhost no iPhone.
2. Use **Compartilhar → Adicionar à Tela de Início**; ative **Abrir como App da Web**, quando a opção existir, e confirme. Abra pelo ícone ASTERISM. Consulte o [guia da Apple](https://support.apple.com/en-lamr/guide/iphone/iphea86e5236/ios). Instalações anteriores podem manter nome/ícone antigos até o sistema atualizar os metadados.
3. Na primeira utilização conectada, aguarde **Aplicação disponível offline** na tela de universos. Depois, criação, escrita e arquivos locais funcionam sem rede enquanto o navegador conservar o cache e os dados.

No canvas: toque para selecionar, arraste elementos ou o fundo e use pinça para zoom. Também há botões de zoom/enquadramento. Para conectar, toque no ponto de saída e depois no ponto de entrada. Feche o painel para voltar ao canvas. Em telas pequenas, **Arquivos** reúne importação, exportação e compartilhamento JSON quando suportado; use **Salvar em Arquivos** no compartilhamento do iOS ou o download. Cancelar o compartilhamento mantém o projeto aberto.

Atualizações são verificadas ao abrir a tela de universos e **não recarregam a edição**. Quando houver aviso de nova versão, confira o estado de salvamento, exporte se houver falha, feche todas as abas/janelas desta origem (Safari e PWA) e reabra. Não há botão que force ativação sobre outras sessões abertas.

O cache contém somente aplicação e ícones, incluindo o editor de documentos; não contém projetos privados, PDFs ou Bíblia de Lore. Imagens remotas precisam de rede e podem usar fallback offline. PDFs já anexados continuam no IndexedDB, sujeitos ao leitor nativo. Não há sincronização entre dispositivos/abas; origens, portas, perfis e instalações podem ter dados separados. Se os projetos não aparecerem após instalar, importe seu backup JSON. O iOS pode restringir/apagar dados e cache; instalação não substitui backups. PDFs continuam fora do JSON.

Instalação, teclado, safe areas reais, gestos multitouch, compartilhamento e leitura PDF ainda exigem QA em iPhone físico; evidências e limitações estão em [PROJECT_STATUS](docs/PROJECT_STATUS.md).

## Arquivos do repositório

Versione código, testes, documentação, configurações, `package-lock.json` e os recursos oficiais de `src/assets/` e `public/icons/`. O `.gitignore` exclui dependências, builds, caches, logs, ambientes/credenciais, PDFs, backups e capturas locais de QA. Universos e PDFs anexados permanecem no armazenamento do navegador, fora dos arquivos-fonte.

JSONs são ignorados por padrão; as exceções atuais são os manifestos npm e os `tsconfig*.json` da raiz. Para uma configuração ou fixture sintética futura, adicione uma exceção específica após revisar seu conteúdo. Guarde exportações e documentos pessoais fora do código, por exemplo em `exports/`, `backups/` ou `private/`, também ignorados. Ignorar arquivos não remove dados já enviados ao histórico.

As evidências visuais em `docs/prints_test/` são locais e podem conter conteúdo privado; não fazem parte do repositório. A documentação conserva seus caminhos como referência às verificações anteriores.

Para o primeiro envio, use a branch `main` e crie o repositório remoto vazio e **privado** antes do envio autorizado. `private: true` em `package.json` impede publicação npm; não configura a privacidade no GitHub. Nenhuma licença open-source foi definida nesta etapa.

## Documentação

- [Estado do projeto e próximo marco](docs/PROJECT_STATUS.md).
- [Arquitetura, modelo e fluxo de dados](docs/ARCHITECTURE.md).
- [Changelog e política de versionamento](docs/CHANGELOG.md).
- [Decisões arquiteturais](docs/DECISIONS.md).
- [Regras para agentes e manutenção da documentação](AGENTS.md).

O número do produto está em `package.json`; mudanças e entregas seguem a política do changelog. Alterações documentais não aumentam a versão automaticamente.
