# Licenciamento do ASTERISM

Preparação local, sem publicação. Código próprio sob MPL 2.0; prosa original dos sete documentos identificados sob CC BY 4.0; dez artes autorais com direitos reservados e permissões limitadas; marcas preservadas e conteúdo dos usuários com seus respectivos titulares. Não há cessão presumida à organização GitHub PlayToSmilles.

## Código e terceiros

[LICENSE](../LICENSE) contém o texto oficial integral da [MPL 2.0](https://www.mozilla.org/en-US/MPL/2.0/), sem alterações, incluindo os anexos A e B. Reproduzir o anexo B no texto da licença não aplica seu aviso ao projeto. O campo license do pacote refere-se ao código coberto, não a todas as obras no repositório.

Os 92 avisos SPDX da preparação anterior foram conservados. A fábrica `src/domain/demo.ts`, seu novo teste, `scripts/legalAssets.mjs`, sua declaração de tipos e a página legal HTML também têm MPL-2.0: total atual de 97 arquivos de código com aviso. Configurações JSON próprias seguem a MPL sem comentários inválidos para JSON. O arquivo narrativo `src/content/demo/nyvorn.json` é uma exceção expressa: não recebe MPL.

`src/ui/canvas/FloatingEdge.tsx` e `src/ui/canvas/floatingGeometry.ts` preservam os avisos MPL-2.0 AND MIT: MPL para acréscimos próprios e MIT para material adaptado dos exemplos públicos do React Flow, conforme D08. Não é uma escolha alternativa de licença nem relicenciamento exclusivo de terceiros. Textos e créditos constam de [THIRD_PARTY_NOTICES](../THIRD_PARTY_NOTICES.md); dependências permanecem sob seus termos originais. A revisão de dois commits (`f433aa8`, `4f74744`) não constitui rastreamento de autoria de cada linha anterior à importação inicial.

## Artes, capturas e marcas

[ASSETS_LICENSE](../ASSETS_LICENSE.md) lista individualmente dez artes cuja autoria foi confirmada expressamente, incluindo wallpaper, e quatro capturas oficiais. Não há aviso MPL nas imagens. Um componente MPL que referencia um PNG não licencia esse PNG; o gerador de ícones é código MPL e suas saídas continuam sob os direitos da árvore original.

As restrições visuais incidem somente sobre obras separadas não cobertas pela MPL; não limitam o uso/modificação/distribuição do código MPL. Forks podem substituir as artes ou solicitar autorização. Essa combinação observa a separação de obras prevista na seção 3.3 da MPL; marcas permanecem separadas conforme a seção 2.3. Nenhuma permissão daqui substitui termos de terceiros ou transfere direitos dos usuários.

## Demonstração: separação implementada

Os dados estáticos de `src/domain/demo.ts` foram extraídos para `src/content/demo/nyvorn.json`: nome, quatro entidades, três relações, textos, IDs, posições, viewport e ordem preservados. `createDemo(): Project` continua a chamar `createProject` por criação e gera cópias independentes de arrays, entidades, posições, relações e viewport. Categorias são conferidas com o modelo, sem coerção cega. A fábrica é MPL; os dados narrativos têm direitos reservados ao respectivo titular.

TypeScript habilita resolveJsonModule e `.gitignore` permite somente esse JSON adicional, sem abrir exceção para projetos pessoais. O teste registra o digest da saída da fábrica anterior, normalizando apenas o UUID do projeto, e verifica independência das cópias e importação/exportação. Não se duplicou narrativa em fixtures.

### Autorização narrativa limitada — confirmada

O autor confirmou expressamente a criação original de toda a narrativa demonstrativa incluída no ASTERISM. A autorização em ASSETS_LICENSE identifica precisamente `src/content/demo/nyvorn.json` e permite sua distribuição inalterada no ASTERISM original, bem como consulta, edição e exportação de cópias nos projetos pessoais dos usuários, inclusive backups. Não concede licença geral de reutilização da narrativa original em outros produtos ou forks; direitos não concedidos permanecem reservados ao autor, sem cessão presumida a PlayToSmilles. A autorização é efetiva e não está mais pendente de confirmação. Não inclui a Bíblia de Lore ou outros conteúdos privados.

## Documentação textual: CC BY 4.0 aplicada

A aprovação foi implementada nos sete documentos enumerados em [DOCUMENTATION_LICENSE](DOCUMENTATION_LICENSE.md), com avisos visíveis e referência à [licença oficial](https://creativecommons.org/licenses/by/4.0/). Somente a prosa original é abrangida; código, exemplos licenciados separadamente, imagens, capturas, marcas, narrativa e direitos de terceiros estão excluídos. O crédito público aprovado é “Projeto ASTERISM”; não divulgar o nome civil nem presumir titularidade de PlayToSmilles. Não há definição de crédito pendente.

## Disponibilização de fonte e avisos

O repositório indicado é https://github.com/PlayToSmilles/Asterism; o aplicativo informado é https://asterism-164.pages.dev/. A consulta pública nesta preparação retornou 404 para o repositório; isso não distingue repositório privado de indisponibilidade. A ferramenta de consulta não conseguiu abrir o aplicativo, portanto não foi afirmada uma inspeção da versão hospedada atual.

O rodapé da biblioteca abre `legal/` em outra aba, preservando a edição. A página aponta ao repositório e aos textos locais. `scripts/legalAssets.mjs` fornece os avisos em desenvolvimento e os emite em `dist/legal/` no build: MPL integral, ASSETS_LICENSE, THIRD_PARTY_NOTICES, LICENSING, DOCUMENTATION_LICENSE e SOURCE.json. Workbox inclui esses arquivos e a página no precache, sem cache de dados privados. O aviso de terceiros conserva seus textos upstream; a cobertura não é uma auditoria de todo trecho transitivo ou de todos os pacotes opcionais.

SOURCE.json registra o commit-base e se havia alterações locais. Só oferece uma URL de revisão específica quando o checkout está limpo. Revisão desconhecida ou checkout alterado não são apresentados como correspondência comprovada; um link genérico para main não demonstra a origem exata de um build. A geração é informativa e não publica fonte nem modifica visibilidade.

Antes da distribuição: disponibilizar aos destinatários o fonte completo correspondente, incluindo modificações e configuração para construção, por revisão acessível ou arquivo equivalente; gerar o build dessa árvore; conferir a URL da revisão e os avisos no pacote/host efetivamente distribuído. Caso o build não venha de checkout limpo, fornecer e identificar o snapshot correspondente por meio adequado. Não alterar SOURCE.json para alegar falsamente checkout limpo. As seções 3.1–3.4 da MPL regem a disponibilização e preservação de avisos.

**Pendência operacional para a publicação:** disponibilizar efetivamente aos destinatários o fonte correspondente e conferir o acesso sem autenticação à revisão/snapshot distribuído. Nesta consulta pública o repositório ainda retornou 404; não foi alterada sua visibilidade. As autorizações de artes/narrativa e o crédito “Projeto ASTERISM” estão definidos. Não foi identificado novo impedimento de licenciamento no conjunto revisado, dentro das limitações de auditoria de terceiros registradas acima.

**Validação visual/offline:** o autor informou expressamente que concluiu ambas. É validação relatada pelo autor; não equivale a nova execução por este agente nem especifica navegadores/dispositivos não informados. Os 165 testes, lint, TypeScript e build da etapa técnica anterior continuam como evidência anterior, sem repetição por esta atualização documental.
