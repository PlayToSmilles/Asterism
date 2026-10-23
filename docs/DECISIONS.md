# Decisões arquiteturais

## D20 — Biblioteca retida e passagem pela capa

**Problema:** desmontar a home após apenas ampliar/apagar a cena impedia continuidade espacial e perdia seu contexto de rolagem.

**Escolha:** manter a biblioteca real oculta e inerte durante a edição; evoluir o antigo hook de zoom com os mecanismos de prontidão/duas camadas da transição de constelações. Uma cópia exclusivamente decorativa da capa acompanha a expansão, enquanto o workspace real é revelado por máscara, sem escalar nodes ou duplicar conteúdo interativo. Retorno mantém o editor até a contração e restaura foco sem scroll.

**Consequências:** pequeno custo de manter os cards da biblioteca montados; nenhuma segunda fonte de dados. Movimento reduzido, APIs ausentes e origem invisível usam troca direta segura. Sem View Transition API, dependência nova ou captura de conteúdo privado. O limite de espera é apenas recuperação de falha; a animação normal começa pela prontidão real. Não há promessa de fluidez em todos os dispositivos; Safari/iPhone continuam exigindo validação própria.

## D19 — Pesquisa transitória e navegação pelos mecanismos existentes

**Problema:** encontrar conteúdo em várias categorias/documentos e chegar ao canvas sem enquadrar posições ainda não preparadas.

**Escolha:** índice simples em memória, normalização determinística e ranking local, separado do dialog e da resolução de destinos. Reutilizar navegação/foco existentes com uma conclusão explícita após câmera/portal, em vez de criar outro canvas ou disparar timers de enquadramento. Dialog nativo oferece modalidade e contenção de foco; PDFs contribuem apenas com nomes obtidos do armazenamento atual.

**Consequências:** sem biblioteca nova, migração, histórico ou gravação da pesquisa. Mudanças no projeto aparecem ao pesquisar na mesma sessão. A lista é limitada a 60 itens; refinar a consulta permite encontrar os demais. Metadados de PDFs são atualizados ao abrir o dialog; não existe interpretação de conteúdo. O visualizador PDF nativo pode capturar atalhos quando possui foco: a lupa do aplicativo permanece disponível. Grafos maiores e tecnologias assistivas ainda exigem validação adicional.

## D18 — Passagem circular desacoplada do React Flow

**Problema:** ampliar apenas a cena de saída não cria uma passagem reversível e pode revelar o destino antes de seu enquadramento.

**Escolha revisada:** WAAPI com clip-path na própria camada de destino e contorno SVG transparente, sincronizados com o sinal de câmera pronta. A primeira implementação aguardava a expansão de um overlay opaco antes de preparar o destino; isso produzia uma pausa de gradiente vazio. Agora a origem permanece montada durante a preparação e a revelação se sobrepõe à expansão do círculo real. No retorno, preservar o canvas projetado até terminar a contração evita trocar suas posições durante a saída. Não usar snapshots da View Transition API nesta etapa: as duas vistas reais permitem controlar a espera sem clonagem de conteúdo interativo nem ampliação dos nodes.

**Consequências:** posição, tamanho medido e persistência dos nodes permanecem independentes da animação. Navegação é serializada, Esc/resize concluem e desmontagem cancela. O custo de clip-path e a fluidez ainda dependem do navegador; fallback imediato respeita movimento reduzido. Cards completos na categoria priorizam leitura, podendo continuar pequenos em categorias muito numerosas.

## D17 — Coreografia orbital decorativa com WAAPI

**Problema:** animar os pontos sem mover o grafo, sem retornos bruscos e sem renderização React contínua.

**Escolha:** controlador isolado com quatro fases, animações nativas de transform e trajetórias amostradas; transições partem da posição/velocidade corrente. Uma rotação CSS única foi descartada porque sincronizaria rigidamente os pontos e dificultaria o retorno individual. A física do Canvas livre permanece independente.

**Consequências:** sem dependências ou dados persistentes novos. Seleção pode manter uma categoria animada; movimento reduzido cancela a coreografia. Amostragem finita aproxima curvas suaves; a comparação visual em outros navegadores continua necessária.

## D16 — Física como preferência do Canvas livre e navegação unificada

**Problema:** o acesso ao modo dinâmico e as áreas/vistas estavam dispersos; a solicitação atual estabelece física habilitada por padrão exclusivamente no Canvas livre.

**Escolha:** uma superfície de comandos compartilha a navegação desktop existente e os controles do canvas. A preferência pertence ao navegador, fora do modelo e dos backups JSON. Vistas de leitura não iniciam física. A solicitação seguinte removeu a faixa Organização viva: a física passa a salvar coordenadas ao estabilizar e encerra a sessão até outro arrasto. A confirmação de D15 permanece somente na organização automática. Sair da vista ou desligar antes de estabilizar mantém as posições salvas anteriores.

**Consequências:** nenhuma migração/dependência nova. A preferência é compartilhada pelos universos deste navegador, sem sincronização entre abas/dispositivos. Uma simulação interrompida antes de estabilizar não é salva, conforme aviso nas configurações. Edição/criação permanecem disponíveis; o modo manual fica disponível ao desligar a física. As transições dos comandos não transformam nodes durante arrasto; a coreografia decorativa posterior está descrita em D17. Ambas respeitam movimento reduzido.

## D15 — Constelações derivadas e física com confirmação

**Problema:** dezenas de elementos e relações cruzadas exigem níveis de leitura, sem inventar grupos canônicos ou reescrever posições ao explorar. A física interativa também precisa reagir ao arrasto sem gravar cada tick.

**Escolha:** categorias existentes fornecem a primeira agregação; vizinhança e grade são projeções transitórias sobre os mesmos IDs. Medidas externas fixas e contornos de detalhe preservam a integração flutuante. Adotar `d3-force` 3 para repulsão, links e colisão, em vez de manter um motor físico próprio. Partículas/links são cópias descartáveis; o controlador interativo usa frames explícitos e cooling finito, compartilhando as forças com a prévia automática. Somente confirmação chama a operação de domínio que move entidades.

**Consequências:** nenhum grupo ou estado físico é persistido, sem migração de schema; o modo manual continua independente. A biblioteca física é lazy e entra no precache público da PWA. Agrupamento por categoria não representa filiação narrativa. Colisão é aproximada, usa superfície atual no modo dinâmico e pode precisar de acomodação durante um arrasto/limiar de zoom; não é roteamento de arestas nem empacotamento ótimo. Ao congelar/aplicar uma disposição compacta, ampliar posteriormente pode exigir ajustes manuais ou nova organização para cards completos. Grafos muito conectados ainda pedem zoom/Inspector. Sem benchmark para o limite de importação nem QA em iPhone físico.

## D14 — Painéis desktop sobre o canvas existente

**Problema:** o painel lateral consumia largura do canvas e reunia metadados, documentos e relações num formulário longo.

**Escolha:** painéis flutuantes, navegação estreita e acesso à escrita por lista derivada do projeto. Inspector usa seções sem desmontar campos. A caixa do canvas permanece constante ao selecionar, conservando medidas/estado transitório. Contornos e dimensões dos cards permanecem para não alterar a geometria flutuante; refinamento usa superfícies e tipografia. Enquadrar no desktop limita a ampliação a 1:1, com mais margem para controles.

**Consequências:** painéis podem encobrir elementos; fechar o painel ou mover a câmera libera a área. Não há resize de painel, reposicionamento automático de cards ou nova fonte de conteúdo. Navegação e seções pertencem à UI; modelo, persistência e semântica das relações seguem existentes. O formulário compartilhado ordena título/categoria antes da imagem também no mobile, preservando suas capacidades e ordem de foco. Não foram adicionados testes decorativos; a navegação foi conferida no navegador e os testes existentes preservam regras de dados/canvas.

## D13 — Exclusão durável e limpeza de anexos por universo

**Problema:** apagar um universo exige atualizar a biblioteca sem perder alterações de outros projetos nem apagar seus PDFs.

**Escolha:** gravar a lista filtrada por ID antes de publicá-la; somente depois limpar os anexos pelo índice `projectId` em uma transação IndexedDB. A confirmação nomeia o universo e inclui PDFs; falhas de gravação mantêm o projeto, falhas de limpeza permitem tentar novamente. A fábrica da demonstração permanece independente.

**Limites:** LocalStorage e IndexedDB não oferecem transação conjunta. Limpar PDFs primeiro poderia perder anexos mesmo se a exclusão da biblioteca falhasse. A ordem escolhida evita isso, mas interrupção/fechamento após gravar a lista pode deixar PDFs órfãos; não há coletor automático ou lixeira/undo. A troca de marca preserva chaves e schema para não exigir migração de dados. A home passa a ser compartilhada entre desktop e mobile, reutilizando as mesmas operações.

## D12 — Navegação mobile sobre o mesmo universo

**Problema:** a barra desktop empilhada e o canvas como única entrada dificultavam consulta e escrita no telefone.

**Escolha:** composição específica até 900 px, com Universo pesquisável, Escrita, Canvas e Referências. Detalhes favorecem leitura e relações navegáveis; editar abre o Inspector existente. O canvas continua montado, oculto e inerte fora de sua área; listagem preservada sob detalhes. Estados novos descrevem somente navegação/apresentação, sem cópias editáveis do projeto. Materiais sólidos no conteúdo e vidro apenas no dock, inspirado na [hierarquia de materiais da Apple](https://developer.apple.com/design/human-interface-guidelines/materials), com ícones geométricos próprios.

**Alternativas e consequências:** apenas reduzir a interface desktop não atendia ao redesign solicitado; criar um segundo editor duplicaria regras. A composição mobile acrescenta componentes de apresentação e CSS delimitado, mantendo domínio, armazenamento e desktop. Busca limitada aos metadados; o breakpoint também inclui tablets compactos. A validação em viewport reduzido não comprova teclado, multitouch, safe areas ou desempenho em iPhone físico.

## D11 — Cache público e atualização sem ativação forçada

**Problema:** permitir abertura offline e instalação no iPhone sem misturar arquivos privados ao bundle nem interromper escrita, inclusive em outra janela.

**Escolha:** `vite-plugin-pwa`/Workbox gera o precache de assets públicos; registro nativo pequeno observa o ciclo e verifica novas versões na tela inicial. Sem skipWaiting, clientsClaim ou recarga programática. A nova versão aguarda o fechamento de todos os clientes antigos. Não há alteração de schema ou armazenamento.

**Alternativas e limites:** ativação imediata ou botão de atualizar poderia remover assets de uma sessão antiga ou interromper outra aba. Em vez de criar coordenação entre abas, aceitamos adiar a atualização até todas fecharem. Cache não substitui backup; imagens externas e leitores PDF têm limites próprios. Layout usa CSS e VisualViewport, mantendo o canvas e editor existentes. Instalação, safe areas/teclado reais e gestos iOS precisam de validação em aparelho físico.

Registro enxuto das escolhas observáveis no código e das motivações documentadas no README anterior e nesta conversa. Não atribui datas históricas, discussões ou alternativas que não foram registradas. Escolhas existentes são descritas abaixo; a política de evolução está em [CHANGELOG](CHANGELOG.md#política-de-versionamento).

## D10 — Tipo explícito de relação e documentos derivados

**Problema:** linhas uniformes não distinguiam direção, reciprocidade e associação; era necessário acessar textos relacionados sem criar uma segunda associação persistida.

**Escolha:** `Relation.kind` com três valores, opcional somente para compatibilidade com dados existentes, usando fallback direcional. Rótulo permanece livre e independente. O Inspector lista todos os Documentos ligados diretamente por relações em qualquer sentido/tipo, sem duplicatas ou inferência por palavras; abrir usa o mesmo editor e conserva a seleção de origem. Marcadores e cores pertencem à UI; geometria segue transitória.

**Alternativas e limites:** uma lista paralela de IDs de documentos duplicaria a verdade do grafo; interpretar rótulos seria frágil a idioma e edição. Nesta etapa qualquer relação direta com Documento representa vínculo, sem taxonomia de posse/menção. Filtros semânticos mais específicos exigiriam decisão futura. A lista/contagem fica no Inspector, evitando acrescentar dependências de relações aos nodes durante o arrasto. O refinamento usa CSS e blur seletivo no chrome, sem nova dependência ou filtro nos elementos móveis.

## D01 — Modelo independente do canvas

**Problema:** entidades e relações precisam existir sem depender de tipos da biblioteca visual, conforme requisito inicial.

**Escolha:** tipos e operações imutáveis em `model.ts`; adaptação para nodes/edges fica na interface e em `canvasState.ts`.

**Consequências:** IDs e regras de relações podem ser testados sem DOM. A interface precisa traduzir eventos e reconciliar sua projeção; tipos TypeScript não substituem a validação dos dados externos. Não há comparação histórica documentada com outras bibliotecas de canvas.

## D02 — Estado transitório separado do projeto persistente

**Problema comprovado na investigação anterior:** reconstruir nodes sem `measured`/`dragging`, ignorando os eventos de dimensões, apagava as medidas conhecidas pelo React Flow. A biblioteca ocultava nodes sem dimensões até nova medição. Também havia gravação síncrona de toda a biblioteca durante cada movimento.

**Escolha:** manter nodes controlados e aplicar `applyNodeChanges` no estado visual; reconciliar conteúdo preservando metadados e referências; confirmar posições no modelo apenas ao finalizar o gesto ou em movimentos sem flag de arrasto. A reconciliação é feita antes de publicar novas props, sem efeito posterior que envie primeiro nodes defasados.

**Alternativa conhecida:** a projeção integral anterior a cada posição foi substituída pelo mecanismo acima. Não foi documentada uma avaliação de stores externos ou outras arquiteturas.

**Consequências:** o modelo continua sendo a fonte de conteúdo e posições confirmadas, enquanto a posição em curso e medidas pertencem ao canvas. Fechar a página antes de soltar um card não salva esse gesto. O diagnóstico original não incluiu captura visual do piscar; evidências e testes estão em [PROJECT_STATUS](PROJECT_STATUS.md).

## D03 — LocalStorage e JSON para o protótipo

**Problema:** entregar um fluxo local pequeno e utilizável, sem autenticação, backend ou colaboração, conforme escopo inicial.

**Escolha:** biblioteca local e exportação/importação de um projeto JSON. Importar valida e abre uma cópia independente, preservando o projeto existente; campos desconhecidos não entram no estado.

**Consequências:** operação sem serviço remoto, mas sem sincronização, migração de schema ou recuperação granular da biblioteca. Posições confirmadas e edições comuns são gravadas sincronamente; a escrita de Documentos usa a evolução D09. Exige backups exportados. Não há análise histórica documentada de IndexedDB ou bancos remotos; não se presume que tenham sido descartados por comparação técnica.

## D04 — Demonstração isolada e escopo visual contido

**Problema:** demonstrar Nyvorn sem inserir essa lore nos projetos vazios e sem complexidade de upload/armazenamento de imagens.

**Escolha:** fábrica de projeto `kind: 'demo'`, separada de projetos `user`, com conteúdo ilustrativo. Capas em CSS e símbolos tipográficos, sem biblioteca de ícones ou upload. A orientação visual não implica copiar componentes do Aurelis.

**Consequências:** novos universos começam vazios; alterações na demonstração ficam no seu próprio projeto. Imagens são evolução posterior, sem sistema antecipado. Essa escolha decorre do escopo pedido, não de uma avaliação histórica de serviços de mídia.

## D05 — Pastas por responsabilidade e testes próximos dos módulos

**Problema:** todos os módulos estavam na raiz de `src`, dificultando a navegação. O usuário solicitou organizar os arquivos em pastas.

**Escolha:** agrupar os módulos existentes por responsabilidade, conforme [ARCHITECTURE](ARCHITECTURE.md#módulos-reais), mantendo testes junto dos arquivos que verificam e `main.tsx` como ponto de entrada na raiz.

**Consequências:** a organização expressa a separação já existente entre modelo, persistência e interface. Somente caminhos e imports mudam; não são adicionados aliases, camadas ou funcionalidades.

## D06 — Cards 0.2: imagem por referência e formas na superfície

**Problema:** enriquecer os cards visualmente sem upload/armazenamento de mídia e sem reintroduzir a perda de medidas no arrasto.

**Escolha:** `imageUrl` opcional com validação HTTP/HTTPS compartilhada; preservar schema 1 para aceitar projetos antigos. Usar card-base com variantes CSS por categoria e recortar apenas sua superfície, mantendo handles fora do recorte. Dimensões dependem da categoria, sem depender do carregamento da imagem. Reutilizar o painel de edição e o componente de imagem/fallback.

**Consequências:** nenhuma dependência nova ou regra de forma no domínio. O URL vai no JSON, mas os bytes da imagem permanecem na origem e podem deixar de estar disponíveis; falhas usam fallback. Limiares de clique/arrasto evitam abrir o painel depois de mover um card. O estado visual e a confirmação final das posições da D02 são preservados. Imagens por upload e outras soluções de mídia continuam fora deste marco.

## D07 — PDFs locais separados, com visualizador nativo

**Problema:** consultar documentos do universo sem extrair conteúdo, criar cards ou colocar arquivos binários no LocalStorage. Cards 0.2 foi validado antes de iniciar esta etapa.

**Escolha:** IndexedDB nativo para Blob e metadados, com índice pelo ID estável do universo; preservar o modelo/LocalStorage existentes. Usar transações para substituir/remover e confirmar apenas após commit. Visualização delegada ao leitor PDF do navegador, com abertura separada e download sempre disponíveis. URLs temporárias pertencem ao ciclo de vida da prévia.

**Alternativas e consequências:** um leitor como PDF.js ofereceria controles uniformes, mas adicionaria dependência, worker e manutenção. Nesta etapa, a escolha é o leitor nativo e seus limites explícitos, sem garantir suporte uniforme. O navegador integrado de QA não renderizou o PDF e a ferramenta bloqueou navegação para a URL blob; controles nativos e abertura separada precisam de confirmação manual em navegador compatível. O download foi validado com integridade binária.

**Limites:** arquivos até 20 MiB; validação de extensão/MIME/assinatura não substitui um parser completo. O navegador pode restringir ou apagar o armazenamento local. JSON não transporta anexos, e uma cópia importada tem biblioteca independente e vazia. Backup completo e sincronização não são implementados.

## D08 — Conexões flutuantes na camada visual

**Problema:** handles laterais fixos obrigavam curvas inadequadas quando os elementos mudavam de posição.

**Escolha:** adaptar [Floating Edges](https://reactflow.dev/examples/edges/floating-edges), consultando também [Simple Floating Edges](https://reactflow.dev/examples/edges/simple-floating-edges). Interseção com contorno aproximado, medidas e posições do estado interno atual; `BaseEdge` preserva interação e rótulos. Não mudar reconciliação/medidas ou persistir extremidades. Aceitar auto-relações e múltiplas relações identificadas independentemente; separar seus traçados.

**Alternativas e limites:** centros dos quatro lados do exemplo simples são fáceis, mas acompanham menos a direção relativa. Contorno de oito segmentos acompanha os recortes sem motor de geometria. Curvas especiais ficam restritas às paralelas e auto-relações; sobreposições, obstáculos e rótulos muito próximos ainda precisam de organização manual. Cantos arredondados são aproximados. Remover uma relação paralela pode redistribuir suas lanes.

## D09 — Documento estruturado, Tiptap e gravação agrupada

**Problema:** texto autoral longo requer seleção, listas, formatação, histórico e salvamento seguro sem implementar um editor manual ou gravar a biblioteca a cada tecla.

**Escolha:** categoria Documento no domínio, com subconjunto validável de JSON ProseMirror e tipos locais independentes da biblioteca. Tiptap 3 com integração React, pacote ProseMirror e StarterKit limitado aos recursos pedidos, carregado sob demanda. Usa semântica de headings/listas, campo multilinha identificado e botões de formatação com estado acessível. Acessibilidade completa ainda requer QA com tecnologias assistivas.

**Alternativas e justificativa atual:** textarea não atende formatação; editor manual exigiria manter seleção, composição e histórico. Lexical é uma alternativa consolidada, mas exigiria outra integração de plugins/serialização. Não houve benchmark comparativo: escolhemos Tiptap pela integração React e schema JSON documentados, aceitando o custo medido de aproximadamente 129 kB gzip no chunk do editor. Dependências diretas novas: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, linha 3.32.

**Estado e consequências:** uma sessão pequena mantém o snapshot canônico e é assinada pelo React, evitando cópias editáveis concorrentes e closures defasadas ao navegar. Texto atualiza a memória imediatamente, disco após 750 ms de pausa ou flush de saída/exportação. Histórico e seleção pertencem ao editor aberto. Importação rejeita conteúdo incompatível antes de substituir estado; nenhum HTML arbitrário é renderizado. A quota do LocalStorage, limites de importação e encerramento abrupto do processo continuam limitações do armazenamento experimental. PDFs e IndexedDB permanecem separados e seus módulos não foram modificados.
