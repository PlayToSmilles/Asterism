# Changelog

> Prosa original: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), com [escopo e exclusões](DOCUMENTATION_LICENSE.md).

Registra somente evolução comprovada. Datas de lançamento, tags e versões anteriores não são inferidas a partir de arquivos ou capturas. A versão declarada e as evidências de verificação estão em [PROJECT_STATUS](PROJECT_STATUS.md).

## Unreleased

- Autor confirmou a autoria e autorizou o uso limitado da narrativa demonstrativa: distribuição no aplicativo original e consulta/edição/exportação em projetos pessoais, sem licença geral para outros produtos ou forks. Crédito da documentação definido como “Projeto ASTERISM”, sem nome civil. Validação visual/offline concluída conforme relato do autor; testes técnicos anteriores não repetidos nesta atualização documental.

- Prosa original de sete documentos sob CC BY 4.0, com escopo/exclusões e crédito nominal ainda a indicar. Dados de Ny’vorn extraídos para JSON reservado, fábrica MPL preservada e três testes de equivalência/isolamento/serialização. Minuta narrativa separada, pendente de confirmação de poderes do titular.
- Rodapé com acesso à página legal; Vite serve/emite licenças, avisos de terceiros e identificação Git do fonte, incluídos no precache. Sem publicação do código correspondente ou mudança de visibilidade automática; artes, versão e dependências preservadas.

- Finalização documental: autoria das dez artes confirmada expressamente, incluindo wallpaper; direitos reservados com permissão limitada no aplicativo original e compartilhamento das quatro capturas oficiais inalteradas com atribuição/sem endosso. Propostas de CC BY 4.0 para a prosa e de separação/permissão da narrativa continuam para aprovação; sem cessão presumida à organização ou alteração funcional.

- Decisões do autor registradas em ASSETS_LICENSE: artes/logotipos próprios com direitos reservados, marcas preservadas e conteúdo dos usuários com seus titulares. Inventário dos 14 arquivos visuais, dúvidas de origem, avaliação das capturas e proposta de separar código/narrativa da demonstração; sem mudança no aplicativo ou adoção de licença para material de terceiro.

- Preparação local da MPL 2.0: texto oficial integral em LICENSE, avisos SPDX no código, metadados do pacote e avisos de terceiros preservados. Escopo, exceção da demonstração e proposta ainda não adotada para marcas/artes documentados em LICENSING. Sem publicação, mudança funcional, dependências ou versão.

- README como apresentação pública do ASTERISM, com endereço web, quatro capturas reais de conteúdo sintético e explicação local-first. Instruções detalhadas de uso, desenvolvimento e instalação experimental preservadas em USER_GUIDE. Sem alterações no aplicativo, versão, licença ou dependências.

- Preparação para GitHub: regras de exclusão para ambientes/credenciais, dados pessoais, artefatos gerados e capturas de QA; normalização de texto e preservação binária das artes. README revisado para desenvolvimento, armazenamento local-first e limites de distribuição. Git local em main sem commit/remote; sem mudança de versão, código ou dependências.

- Home 1.0: biblioteca centralizada, capas ampliadas e grid responsivo para coleções pequenas ou numerosas; ações junto ao título, assinatura centralizada e aviso local discreto. Removidos barra lateral, Todos os universos e atalho fixo Explorar Nyvorn; demonstração disponível na biblioteca vazia.
- Entrada/retorno dos universos com WAAPI a partir da capa real, revelação progressiva do workspace preparado e biblioteca preservada em memória. Foco/rolagem restaurados; bloqueio de repetição, Esc/resize, limpeza e fallback para movimento reduzido/API/origem indisponível. Sem alterações de dados, imagens, dependências ou versão.

- Busca Universal local por lupa ou Ctrl/Cmd+K: títulos, categorias, descrições, texto estruturado de Documentos, relações e nomes de PDFs. Ranking, acentos, trechos destacados, homônimos e limite de 60 resultados com total informado. Navegação reaproveita categorias, transições, inspector, foco de conexão e editor existentes, aguardando a câmera preparada. Dialog acessível com teclado, mobile e movimento reduzido; sem histórico, dependências, alteração de JSON ou leitura interna dos PDFs.

- Dentro das categorias, o seletor de vistas dá lugar a “← Constelações”, preservando a transição de retorno e a identificação da categoria. O seletor completo continua na visão geral e no Canvas livre.

- Cabeçalho de Constelações reduzido ao label discreto e centralizado; removidos título grande e descrição, com espaço redistribuído para o mapa.

- Eliminada a piscada final: a visão geral é removida sincronamente antes de cancelar as animações e restaurar a camada do canvas, evitando sua reaparição por um frame.

- Corrigida a passagem imersiva: o mapa permanece montado enquanto o React Flow prepara o destino; o círculo real cresce e uma máscara revela os cards durante a expansão, sem cobertura opaca intermediária. Retorno preserva a categoria até a contração terminar. Removido o reinício do fade CSS após WAAPI. Esc/resize, foco e fallback reduzido preservados; posições salvas não mudam.

- Conexões das Constelações traçadas com WAAPI a partir da categoria em hover/foco/marcação, com brilho, chegada sutil e contagens animadas. Trocas usam fade entre duas camadas estáveis; movimento reduzido mantém destaque estático. Sem alterar geometria, direção semântica ou persistência.

- Pontos das constelações com WAAPI: repouso, dispersão, órbitas independentes e retorno exato. Interrupções preservam posição/velocidade corrente; hover, foco e marcação ativam a coreografia. Sem React por frame, novas dependências ou mudanças no grafo. Movimento reduzido mantém os pontos estáticos.

- Evento usa clock_sprite em pixel art nas constelações e nos cards; atualizado para o PNG exportado diretamente pelo usuário, preservando o arquivo original.

- Local usa o novo locale_sprite fornecido, com proporção quadrada e escalas inteiras nas constelações e nos cards.

- Constelações minimalistas: estatísticas reservam seu espaço e se revelam em 230 ms com opacidade/deslocamento, sem mover círculos ou curvas. Foco por teclado e seleção marcada são independentes; Espaço marca, Enter explora. No toque, primeiro toque revela e segundo explora. Movimento reduzido desativa a animação.

- Constelações: foco circular com halo sem fundo retangular, paleta mais luminosa compartilhada com os cards, contagens hierarquizadas e curvas orbitais ancoradas na borda dos círculos. Contagens das ligações aparecem em foco e evitam as legendas; posições persistentes e física do Canvas livre preservadas.

- Pixel art: regras compartilhadas de amostragem e proporção; árvore do cabeçalho interno em tamanho nativo, centralizada numa moldura de 40 px com o tratamento da home, e Player em escalas inteiras conforme a apresentação. Home preservada. Slots mobile pequenos usam a grade nativa. Nenhuma alteração nas artes, posições ou câmera; zoom fracionário continua sujeito à rasterização do navegador.

- Ícone de Personagem substituído pelo sprite Player fornecido, nas constelações e representações dos cards, preservando pixel art.

- Navegação com indicador deslizante nas áreas desktop e vistas do canvas; zoom de entrada em categorias e universos. Cards são revelados após preparar a câmera, evitando a viagem desde a disposição anterior. Movimento reduzido respeitado; modelo, persistência e medidas dos nodes preservados.

### Adicionado

- Canvas 3.0: visão geral por categorias existentes, contagens de elementos e relações internas/externas, ligações agregadas com contagens por tipo e navegação para uma categoria. Sem grupos narrativos inferidos ou novos campos persistentes. Universos não vazios abrem nessa visão.
- Exploração contextual pelo Inspector, com disposição radial temporária dos vizinhos diretos, navegação entre elementos e retorno à vista/câmera anterior. Categoria usa grade de leitura temporária, com indicação de relações externas; todas as relações continuam no Inspector.
- Organização automática opcional com repulsão, atração e colisão, cálculo finito e cancelável, prévia e confirmação explícita. `d3-force` 3 e seus tipos foram adicionados para as forças, carregadas sob demanda.
- Modo dinâmico exclusivo do Canvas livre, habilitado por padrão e configurável por preferência local do navegador. Fixação temporária do nó arrastado, reação da malha e resfriamento. Aplicar confirma somente coordenadas; descartar restaura a disposição anterior. Trocar de vista, desligar ou encobrir o canvas descarta a prévia; ocultar a aba pausa. Edição/criação aguardam a decisão sobre posições.
- Nove testes novos de vistas/agrupamento, prévia automática e física interativa: integridade, medidas, cancelamento, aplicação, cooling e round-trip JSON. Sem novo schema ou alteração de versão.

- Exclusão de universos pela home, com confirmação pelo nome, bloqueio durante a operação e feedback. A lista só muda após gravar; anexos são limpos por `projectId` com opção de repetir em caso de falha. Demonstração pode ser apagada e recriada. Cinco testes novos cobrem exclusão/persistência, falha de escrita, ID ausente e commit/abort da limpeza PDF.

- PWA com `vite-plugin-pwa`/Workbox no build: manifesto standalone, nome/ícones PNG próprios (192/512 e Apple 180), metadados iOS e precache restrito ao shell público e editor carregado sob demanda. Sem cache de PDFs, dados privados ou imagens remotas.
- Aviso de disponibilidade offline e atualização na tela de universos. Atualizações aguardam todas as janelas/abas fecharem; sem recarga, `skipWaiting` ou tomada de controle automática durante a edição. Três testes de registro, espera e fallback offline.
- Adaptação até 900 px: safe areas, VisualViewport para teclado/chrome, alvos de toque de 44 px, painéis completos, barra de formatação com rolagem horizontal e menu de arquivos. Compartilhamento JSON nativo quando disponível, mantendo importação/download e armazenamento existentes.

- Tipos de relação no domínio e JSON: direcional, recíproca e associativa. Seletor no painel existente, setas em uma/duas pontas ou pontos neutros com tracejado, descrição acessível e fallback direcional para relações antigas sem tipo.
- Documentos vinculados no inspector, derivados de relações incidentes em qualquer sentido, sem duplicatas e com abertura direta no editor existente. Não há associação paralela armazenada nem interpretação automática de rótulos.

- Conexões flutuantes calculadas pelas medidas/posições visuais do React Flow, preservando o fluxo de arrasto. Relações paralelas e auto-relações agora são aceitas na criação e no JSON; traçados separados, direção e edição/exclusão continuam pelo painel existente.
- Elemento Documento com título, símbolo compacto e texto estruturado validado. Editor amplo com títulos/subtítulos, parágrafos, negrito, itálico, listas e desfazer/refazer. Exportação/importação inclui conteúdo completo; projetos antigos continuam aceitos.
- Tiptap 3 (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`), carregado sob demanda e limitado ao escopo de edição. Autosave agrupado e gravação pendente confirmada ao navegar, exportar e sair/ocultar a página. Biblioteca de Referências preservada.

- Biblioteca de Referências após a validação de Cards 0.2: anexos PDF por universo, adição/consulta/substituição/remoção com confirmação, armazenamento nativo IndexedDB e painel integrado que mantém o canvas montado. Visualizador nativo para páginas/zoom, abertura separada e download como alternativas de compatibilidade.
- Validação de extensão, MIME, tamanho (20 MiB) e assinatura inicial; substituição transacional, isolamento por ID do universo e limpeza de URLs temporárias. Interface e documentação informam que o JSON não inclui PDFs/metadados. Sem extração de conteúdo, IA, criação automática de cards ou novas dependências.
- Cards 0.2, candidato a v0.2.0: imagem opcional cobrindo o card, gradiente, título/categoria sobrepostos e variantes por categoria (Personagem vertical, Local horizontal, Magia octogonal, Evento recortado e retângulo padrão para as demais). Descrições completas ficam no painel existente.
- URL de imagem HTTP/HTTPS editável no mesmo painel, com prévia, remoção, validação compartilhada, fallback para ausência/falha e preservação no JSON/LocalStorage. Projetos antigos sem imagem continuam válidos no schema 1.
- Testes para URLs, compatibilidade, persistência e reconciliação de imagem/categoria durante arrasto. Limiares de clique/arrasto definidos para evitar abrir o painel ao mover cards. Sem novas dependências ou alteração de versão.

### Alterado

- Árvore junto ao nome ASTERISM ampliada para o mesmo tamanho da arte nos cards: 58 px no desktop e 40 px no mobile, com renderização pixelada e moldura proporcional.

- Cards de universos na home voltam à largura compacta de 316 px no desktop, sem esticar com a janela; distribuição em colunas conforme o espaço disponível e apresentação mobile preservada.

- Janela da home ocupa a largura disponível no desktop com margem externa uniforme de 16 px. Divisória lateral estendida até 32 px acima do rodapé, repetindo o respiro superior; layout mobile e safe areas preservados.

- Experimento de refração óptica retirado a pedido do usuário: componente, mapas SDF, bancada e capturas removidos; filtro SVG da home também removido. Mantidos o glassmorphism CSS simples, a iluminação e os alinhamentos existentes.

- Fundo da home mais vivo: luzes difusas lilás/violeta, wallpaper com mais brilho/saturação e vidro mais transparente com reflexos lilás. Efeitos estáticos, com proteção de contraste no mobile e fallback de transparência reduzida preservado.

- Home em janela flutuante translúcida, com blur e reflexos simples. Rodapé alinhado ao fim da janela e Explorar Nyvorn imediatamente acima da divisória; ações da biblioteca preservadas.

- Tela inicial com Wallpaper 2 fornecido pelo usuário, filtro de saturação/brilho e degradês escuros para integrar a pixel art à identidade visual. Fundo decorativo responsivo incluído no build/cache offline, sem alterar o editor ou as ações da biblioteca.

- Configurações desktop movidas para engrenagem no cabeçalho, à esquerda de Importar, com pixel art em tom neutro, tooltip/nome acessível e popover glass com fechamento por clique fora/Esc. Navegação Canvas/Escrita/PDFs e vistas mais compactas; controles existentes e apresentação mobile preservados.

- Botão Configurações usa o gear em pixel art fornecido pelo usuário, na variante dark para o tema atual. Asset incluído pelo Vite para disponibilidade offline, com nome acessível e área de toque preservados.

- Sprite Tree_Logo atualizado a partir do PNG fornecido na Área de Trabalho; logo compartilhada, favicon e ícones PWA/iOS regenerados com escala inteira sem suavização.

- Removida a faixa Organização viva: física salva posições ao estabilizar, sem bloquear edição/criação nem gravar por tick. Configurações fica ao lado de PDFs no desktop. Canvas livre usa renderização apenas de elementos visíveis; nenhuma dependência nova.

- Navegação desktop, vistas e configurações reunidas em uma superfície de comandos com transições discretas e respeito a movimento reduzido. Zoom/enquadramento à esquerda e minimapa à direita usam 17 px das bordas inferiores. Física não executa nas constelações/vizinhanças; após aplicar/descartar, um novo arrasto pode iniciar outra prévia. Preferência separada do modelo/exportação, com fallback para armazenamento indisponível.

- Zoom semântico com símbolos circulares, cápsulas intermediárias e cards completos de perto, mantendo as medidas externas. Contornos e handles acompanham a superfície visível; nomes de vistas de leitura conservam tamanho de tela no zoom distante.
- Canvas livre mais leve: símbolos/cápsulas sem camadas de imagem no panorama, linhas secundárias discretas e rótulos distantes não montados até hover/foco. Nodes visuais memoizados; ticks físicos atualizam somente posições que mudaram, em lotes, conservando IDs, conteúdo e metadados. Arestas e agrupamentos não são recalculados a cada tick.
- Controles e prévias empilhados no mesmo chrome responsivo para evitar sobreposição em larguras menores; enquadramento desconta a altura real dos controles e o Inspector; home, editor de Documentos e biblioteca PDF preservados.

- Canvas 2.0: relações do Inspector enquadram seus dois elementos na área livre do painel, com movimento reduzido respeitado e ação separada para abrir o elemento relacionado. Foco transitório preserva seleção e posições; no mobile o painel dá lugar ao canvas e retorna ao encerrar o foco.
- Elemento selecionado evidencia sua vizinhança; relação em foco destaca os extremos e reduz a ênfase das demais linhas. Rótulos secundários ocultos abaixo de 55% de zoom ou fora do foco, acessíveis por hover/teclado/Inspector. O rótulo em foco conserva tamanho de leitura na tela. Superfícies e contraste refinados sem mudar dimensões, contornos ou geometria flutuante.
- Zoom mínimo de 5% para enquadrar grafos e relações distantes; validação da câmera aceita esse intervalo e preserva projetos antigos. Cinco testes novos cobrem foco, enquadramento e round-trip no novo zoom. Sem dependências, alteração de versão ou layout automático.

- Workspace desktop acima de 900 px redesenhado: cabeçalho compacto com Tree_Logo, navegação Canvas/Escrita/PDFs, painéis flutuantes sem reduzir a caixa do canvas e biblioteca de acesso aos Documentos existentes. Escrita retorna à lista ou ao elemento de origem conforme o caminho de abertura.
- Inspector com seções Informações/Conexões somente no desktop, mantendo campos montados; título/categoria precedem imagem e descrição no formulário compartilhado. Cards, controles, minimapa, editor e referências receberam superfícies e tipografia coerentes com a home. Dimensões/contornos e geometria das relações preservados, sem blur nos nodes. Enquadramento desktop usa margem de 25% e zoom máximo 1:1; controles manuais de zoom permanecem. Sem dependências, schema ou versão novos.

- Marca substituída pela pixel art Tree_Logo fornecida pelo usuário, preservando o PNG original em `public/icons/tree-logo.png`. Interface com `object-fit: contain` e `image-rendering: pixelated`; favicon/ícones PWA e Apple regenerados com escala inteira sem suavização. Logo incluída no precache offline. Sem mudanças de versão ou dependências.

- Identidade visível **ASTERISM — Worldbuilding for Anything** na home, título, metadados iOS, manifesto e ícones próprios, com assinatura discreta PlayToSmilles. Home desktop/mobile unificada: biblioteca em primeiro plano, textos curtos, capas geométricas e marca de três estrelas com acento pixelado. Removidos o componente MobileHome e os estilos específicos das homes substituídas, após conferir seus usos. Chaves de armazenamento, schema e identidade técnica da PWA preservados; sem dependências ou versão novas.

- Experiência mobile autoral até 900 px: início com biblioteca de universos, navegação inferior entre Universo/Escrita/Canvas/Referências, busca por título/categoria/descrição e filtros de categoria. Leitura de elementos com capa e relações navegáveis; edição reutiliza o Inspector. Busca e rolagem permanecem ao voltar dos detalhes.
- Escrita mobile em tela própria com tipografia de leitura e formatação inferior; PDFs e criação em superfícies coerentes, controles acessíveis e layout horizontal. Vidro limitado ao dock; sem filtros nos cards móveis, dependências, alterações de domínio/schema ou versão. Canvas permanece montado e inerte quando encoberto. Três testes novos protegem busca, filtros e identidade dos dados.

- Refinamento visual: painéis translúcidos com blur seletivo de 12 px, bordas e controles mais suaves, fundo do canvas e silhuetas arredondadas por categoria. Medidas fixas e recortes de Magia/Evento preservados; aproximação geométrica dos cantos acompanha os novos raios. Sem blur nos elementos móveis, novas dependências ou mudanças na Biblioteca de Referências.

- Criação passa por categoria e título em **Novo elemento**. Novos textos da interface usam Elemento; componentes e arquivos existentes conservam seus nomes. Uma sessão em memória coordena operações e persistência, evitando gravações por tecla e atualizações baseadas em snapshots antigos.

- Arquivos de `src/` agrupados por responsabilidade em `app`, `domain`, `persistence`, `ui/canvas` e `styles`, com testes junto dos módulos e imports ajustados. Apenas `main.tsx` permanece na raiz. Sem mudança de comportamento, dependências ou versão.

### Corrigido

- Transição mobile/desktop: camadas mobile são ocultadas pelo CSS acima do breakpoint antes de sua remoção pelo React, evitando que entrem momentaneamente no layout flex e reduzam a caixa do canvas a zero. Aviso de dimensão do React Flow não voltou a aparecer na sequência de transições conferida após a correção.

- Tocar em handles não abre o inspector: o canvas permanece acessível para completar conexões por dois toques. Ordem de CSS ajustada para a biblioteca ocupar a largura disponível também na orientação horizontal. Download JSON mantém a URL temporária por 60 segundos para consumo assíncrono no Safari.

- Estado visual dos nodes preservado durante atualizações do universo, incluindo medidas e arrasto. Posições intermediárias deixam de reconstruir todos os nodes e de gravar a biblioteca inteira; a posição final é confirmada no modelo. Sete testes de regressão adicionados. Implementado, ainda sem lançamento comprovado ou aumento de versão.

### Documentação

- Fundação documental em `docs/`, README reorganizado, regras para agentes e política de versionamento. Nenhuma funcionalidade, dependência ou número de versão alterado nesta tarefa documental.

## v0.1.0 — referência declarada, lançamento não comprovado

`package.json` e `package-lock.json` contêm `0.1.0`. A implementação inicial registrada nesta conversa já declarava esse número e entregou o protótipo local com canvas, cards, relações, persistência, JSON e demonstração separada. Não há evidência de data de release ou tag nesta cópia. A correção posterior está em Unreleased; não se presume que tenha sido lançada como parte de v0.1.0.

## Política de versionamento

- Apresentação em documentos: `vMAJOR.MINOR.PATCH`. Nos manifestos npm, manter o formato numérico sem `v` e sincronizar `package.json`/`package-lock.json` somente em entrega autorizada.
- Durante 0.x: **MAJOR** para mudança estrutural incompatível ou transição de estabilidade, mediante decisão explícita; **MINOR** para nova funcionalidade relevante; **PATCH** para correção de defeito ou ajuste compatível de comportamento.
- Mudanças apenas documentais não precisam de nova versão. Não aumentar números automaticamente nem tratar `Unreleased` como uma release.
- Ao autorizar uma entrega: confirmar o escopo, executar as verificações aplicáveis, escolher o incremento, atualizar os manifestos e mover somente as entradas entregues para `## vX.Y.Z — AAAA-MM-DD`, com a data efetiva. Não criar seções de versões futuras como se já existissem.
- Em Unreleased, usar apenas categorias necessárias: Adicionado, Alterado, Corrigido, Removido ou Documentação. Registrar mudanças relevantes de comportamento e compatibilidade; detalhes de execução ficam no relatório e evidências atuais no PROJECT_STATUS.
- A proposta do próximo marco está em [PROJECT_STATUS](PROJECT_STATUS.md#próximo-marco-candidato-v020). Versionar uma entrega não autoriza commit, push, tag, release ou deploy; essas ações exigem autorização explícita.
