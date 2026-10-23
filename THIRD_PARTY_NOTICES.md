# Avisos de terceiros

Inventário local de 2026-10-23, obtido do package-lock.json e dos avisos dos pacotes instalados. Dependências não recebem a MPL do ASTERISM. Os textos abaixo foram preservados integralmente, agrupados apenas quando idênticos. Abrange os pacotes sem flag dev no lock e Workbox (geração do service worker); não é uma análise de cada trecho do bundle.

## Adaptação xyflow

A decisão D08 em docs/DECISIONS.md registra adaptação dos exemplos públicos [Floating Edges](https://reactflow.dev/examples/edges/floating-edges) e [Simple Floating Edges](https://reactflow.dev/examples/edges/simple-floating-edges). Os arquivos src/ui/canvas/FloatingEdge.tsx e src/ui/canvas/floatingGeometry.ts preservam conservadoramente os termos MIT para material upstream e usam MPL-2.0 para acréscimos próprios (SPDX: MPL-2.0 AND MIT). Isso não oferece uma escolha entre as licenças nem atribui a terceiros os acréscimos do ASTERISM. O aviso de webkid GmbH é o distribuído com @xyflow/react nesta instalação, reproduzido abaixo. A política do mantenedor para o núcleo, documentação e exemplos públicos está em [Open Source at xyflow](https://xyflow.com/open-source); exemplos Pro possuem termos distintos e não foram identificados neste repositório.

## Dependências e textos preservados

| Pacote instalado | Licença declarada no lock | Aviso |
| --- | --- | --- |
| `@floating-ui/core@1.8.0` | MIT | [Texto 1](#texto-1) |
| `@floating-ui/dom@1.8.0` | MIT | [Texto 1](#texto-1) |
| `@floating-ui/utils@0.2.12` | MIT | [Texto 1](#texto-1) |
| `@tiptap/core@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-blockquote@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-bold@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-bubble-menu@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-bullet-list@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-code@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-code-block@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-document@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-dropcursor@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-floating-menu@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-gapcursor@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-hard-break@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-heading@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-horizontal-rule@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-italic@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-link@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-list@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-list-item@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-list-keymap@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-ordered-list@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-paragraph@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-strike@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-text@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extension-underline@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/extensions@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/pm@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/react@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@tiptap/starter-kit@3.32.0` | MIT | [Texto 2](#texto-2) |
| `@types/d3-color@3.1.3` | MIT | [Texto 3](#texto-3) |
| `@types/d3-drag@3.0.7` | MIT | [Texto 3](#texto-3) |
| `@types/d3-interpolate@3.0.4` | MIT | [Texto 3](#texto-3) |
| `@types/d3-selection@3.0.12` | MIT | [Texto 3](#texto-3) |
| `@types/d3-transition@3.0.9` | MIT | [Texto 3](#texto-3) |
| `@types/d3-zoom@3.0.9` | MIT | [Texto 3](#texto-3) |
| `@types/react@19.3.0` | MIT | [Texto 3](#texto-3) |
| `@types/react-dom@19.3.0` | MIT | [Texto 3](#texto-3) |
| `@types/use-sync-external-store@0.0.6` | MIT | [Texto 3](#texto-3) |
| `@xyflow/react@12.12.0` | MIT | [Texto 4](#texto-4) |
| `@xyflow/system@0.0.83` | MIT | [Texto 4](#texto-4) |
| `classcat@5.0.5` | MIT | [Texto 5](#texto-5) |
| `csstype@3.2.3` | MIT | [Texto 6](#texto-6) |
| `d3-color@3.1.0` | ISC | [Texto 7](#texto-7) |
| `d3-dispatch@3.0.1` | ISC | [Texto 8](#texto-8) |
| `d3-drag@3.0.0` | ISC | [Texto 8](#texto-8) |
| `d3-ease@3.0.1` | BSD-3-Clause | [Texto 9](#texto-9) |
| `d3-force@3.0.0` | ISC | [Texto 8](#texto-8) |
| `d3-interpolate@3.0.1` | ISC | [Texto 8](#texto-8) |
| `d3-quadtree@3.0.1` | ISC | [Texto 8](#texto-8) |
| `d3-selection@3.0.0` | ISC | [Texto 8](#texto-8) |
| `d3-timer@3.0.1` | ISC | [Texto 8](#texto-8) |
| `d3-transition@3.0.1` | ISC | [Texto 8](#texto-8) |
| `d3-zoom@3.0.0` | ISC | [Texto 8](#texto-8) |
| `fast-equals@5.4.5` | MIT | [Texto 10](#texto-10) |
| `linkifyjs@4.3.3` | MIT | [Texto 11](#texto-11) |
| `orderedmap@2.1.1` | MIT | [Texto 12](#texto-12) |
| `prosemirror-changeset@2.4.4` | MIT | [Texto 13](#texto-13) |
| `prosemirror-commands@1.7.2` | MIT | [Texto 14](#texto-14) |
| `prosemirror-dropcursor@1.8.4` | MIT | [Texto 14](#texto-14) |
| `prosemirror-gapcursor@1.4.1` | MIT | [Texto 14](#texto-14) |
| `prosemirror-history@1.5.1` | MIT | [Texto 14](#texto-14) |
| `prosemirror-inputrules@1.5.1` | MIT | [Texto 14](#texto-14) |
| `prosemirror-keymap@1.2.3` | MIT | [Texto 14](#texto-14) |
| `prosemirror-model@1.25.12` | MIT | [Texto 14](#texto-14) |
| `prosemirror-schema-list@1.5.1` | MIT | [Texto 14](#texto-14) |
| `prosemirror-state@1.4.4` | MIT | [Texto 14](#texto-14) |
| `prosemirror-tables@1.8.5` | MIT | [Texto 15](#texto-15) |
| `prosemirror-transform@1.12.2` | MIT | [Texto 14](#texto-14) |
| `prosemirror-view@1.42.6` | MIT | [Texto 14](#texto-14) |
| `react@19.3.1` | MIT | [Texto 16](#texto-16) |
| `react-dom@19.3.1` | MIT | [Texto 16](#texto-16) |
| `rope-sequence@1.3.4` | MIT | [Texto 17](#texto-17) |
| `scheduler@0.28.0` | MIT | [Texto 16](#texto-16) |
| `use-sync-external-store@1.7.0` | MIT | [Texto 16](#texto-16) |
| `w3c-keyname@2.2.8` | MIT | [Texto 12](#texto-12) |
| `workbox-background-sync@7.4.1` | MIT | [Texto 18](#texto-18) |
| `workbox-broadcast-update@7.4.1` | MIT | [Texto 18](#texto-18) |
| `workbox-build@7.4.1` | MIT | [Texto 18](#texto-18) |
| `@apideck/better-ajv-errors@0.3.7` | MIT | [Texto 19](#texto-19) |
| `ajv@8.20.0` | MIT | [Texto 20](#texto-20) |
| `json-schema-traverse@1.0.0` | MIT | [Texto 21](#texto-21) |
| `pretty-bytes@5.6.0` | MIT | [Texto 22](#texto-22) |
| `workbox-cacheable-response@7.4.1` | MIT | [Texto 18](#texto-18) |
| `workbox-core@7.4.1` | MIT | [Texto 18](#texto-18) |
| `workbox-expiration@7.4.1` | MIT | [Texto 18](#texto-18) |
| `workbox-google-analytics@7.4.1` | MIT | [Texto 18](#texto-18) |
| `workbox-navigation-preload@7.4.1` | MIT | [Texto 18](#texto-18) |
| `workbox-precaching@7.4.1` | MIT | [Texto 18](#texto-18) |
| `workbox-range-requests@7.4.1` | MIT | [Texto 18](#texto-18) |
| `workbox-recipes@7.4.1` | MIT | [Texto 18](#texto-18) |
| `workbox-routing@7.4.1` | MIT | [Texto 18](#texto-18) |
| `workbox-strategies@7.4.1` | MIT | [Texto 18](#texto-18) |
| `workbox-streams@7.4.1` | MIT | [Texto 18](#texto-18) |
| `workbox-sw@7.4.1` | MIT | [Texto 18](#texto-18) |
| `workbox-window@7.4.1` | MIT | [Texto 18](#texto-18) |
| `zustand@4.5.7` | MIT | [Texto 23](#texto-23) |

## Texto 1

- `@floating-ui/core@1.8.0 (LICENSE)`
- `@floating-ui/dom@1.8.0 (LICENSE)`
- `@floating-ui/utils@0.2.12 (LICENSE)`

```text
MIT License

Copyright (c) 2021-present Floating UI contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

## Texto 2

- `@tiptap/core@3.32.0 (LICENSE.md)`
- `@tiptap/extension-blockquote@3.32.0 (LICENSE.md)`
- `@tiptap/extension-bold@3.32.0 (LICENSE.md)`
- `@tiptap/extension-bubble-menu@3.32.0 (LICENSE.md)`
- `@tiptap/extension-bullet-list@3.32.0 (LICENSE.md)`
- `@tiptap/extension-code@3.32.0 (LICENSE.md)`
- `@tiptap/extension-code-block@3.32.0 (LICENSE.md)`
- `@tiptap/extension-document@3.32.0 (LICENSE.md)`
- `@tiptap/extension-dropcursor@3.32.0 (LICENSE.md)`
- `@tiptap/extension-floating-menu@3.32.0 (LICENSE.md)`
- `@tiptap/extension-gapcursor@3.32.0 (LICENSE.md)`
- `@tiptap/extension-hard-break@3.32.0 (LICENSE.md)`
- `@tiptap/extension-heading@3.32.0 (LICENSE.md)`
- `@tiptap/extension-horizontal-rule@3.32.0 (LICENSE.md)`
- `@tiptap/extension-italic@3.32.0 (LICENSE.md)`
- `@tiptap/extension-link@3.32.0 (LICENSE.md)`
- `@tiptap/extension-list@3.32.0 (LICENSE.md)`
- `@tiptap/extension-list-item@3.32.0 (LICENSE.md)`
- `@tiptap/extension-list-keymap@3.32.0 (LICENSE.md)`
- `@tiptap/extension-ordered-list@3.32.0 (LICENSE.md)`
- `@tiptap/extension-paragraph@3.32.0 (LICENSE.md)`
- `@tiptap/extension-strike@3.32.0 (LICENSE.md)`
- `@tiptap/extension-text@3.32.0 (LICENSE.md)`
- `@tiptap/extension-underline@3.32.0 (LICENSE.md)`
- `@tiptap/extensions@3.32.0 (LICENSE.md)`
- `@tiptap/pm@3.32.0 (LICENSE)`
- `@tiptap/react@3.32.0 (LICENSE.md)`
- `@tiptap/starter-kit@3.32.0 (LICENSE.md)`

```text
MIT License

Copyright (c) 2025, Tiptap GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Texto 3

- `@types/d3-color@3.1.3 (LICENSE)`
- `@types/d3-drag@3.0.7 (LICENSE)`
- `@types/d3-interpolate@3.0.4 (LICENSE)`
- `@types/d3-selection@3.0.12 (LICENSE)`
- `@types/d3-transition@3.0.9 (LICENSE)`
- `@types/d3-zoom@3.0.9 (LICENSE)`
- `@types/react@19.3.0 (LICENSE)`
- `@types/react-dom@19.3.0 (LICENSE)`
- `@types/use-sync-external-store@0.0.6 (LICENSE)`

```text
    MIT License

    Copyright (c) Microsoft Corporation.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE
```

## Texto 4

- `@xyflow/react@12.12.0 (LICENSE)`
- `@xyflow/system@0.0.83 (LICENSE)`

```text
MIT License

Copyright (c) 2019-2025 webkid GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Texto 5

- `classcat@5.0.5 (LICENSE.md)`

```text
Copyright © Jorge Bucaran <<https://jorgebucaran.com>>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

## Texto 6

- `csstype@3.2.3 (LICENSE)`

```text
Copyright (c) 2017-2018 Fredrik Nicol

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Texto 7

- `d3-color@3.1.0 (LICENSE)`

```text
Copyright 2010-2022 Mike Bostock

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

## Texto 8

- `d3-dispatch@3.0.1 (LICENSE)`
- `d3-drag@3.0.0 (LICENSE)`
- `d3-force@3.0.0 (LICENSE)`
- `d3-interpolate@3.0.1 (LICENSE)`
- `d3-quadtree@3.0.1 (LICENSE)`
- `d3-selection@3.0.0 (LICENSE)`
- `d3-timer@3.0.1 (LICENSE)`
- `d3-transition@3.0.1 (LICENSE)`
- `d3-zoom@3.0.0 (LICENSE)`

```text
Copyright 2010-2021 Mike Bostock

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

## Texto 9

- `d3-ease@3.0.1 (LICENSE)`

```text
Copyright 2010-2021 Mike Bostock
Copyright 2001 Robert Penner
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the author nor the names of contributors may be used to
  endorse or promote products derived from this software without specific prior
  written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

## Texto 10

- `fast-equals@5.4.5 (LICENSE)`

```text
MIT License

Copyright (c) 2025 Tony Quetano

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Texto 11

- `linkifyjs@4.3.3 (LICENSE)`

```text
Copyright (c) 2024 Nick Frasser

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## Texto 12

- `orderedmap@2.1.1 (LICENSE)`
- `w3c-keyname@2.2.8 (LICENSE)`

```text
Copyright (C) 2016 by Marijn Haverbeke <marijn@haverbeke.berlin> and others

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## Texto 13

- `prosemirror-changeset@2.4.4 (LICENSE)`

```text
Copyright (C) 2017 by Marijn Haverbeke <marijn@haverbeke.berlin> and others

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## Texto 14

- `prosemirror-commands@1.7.2 (LICENSE)`
- `prosemirror-dropcursor@1.8.4 (LICENSE)`
- `prosemirror-gapcursor@1.4.1 (LICENSE)`
- `prosemirror-history@1.5.1 (LICENSE)`
- `prosemirror-inputrules@1.5.1 (LICENSE)`
- `prosemirror-keymap@1.2.3 (LICENSE)`
- `prosemirror-model@1.25.12 (LICENSE)`
- `prosemirror-schema-list@1.5.1 (LICENSE)`
- `prosemirror-state@1.4.4 (LICENSE)`
- `prosemirror-transform@1.12.2 (LICENSE)`
- `prosemirror-view@1.42.6 (LICENSE)`

```text
Copyright (C) 2015-2017 by Marijn Haverbeke <marijn@haverbeke.berlin> and others

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## Texto 15

- `prosemirror-tables@1.8.5 (LICENSE)`

```text
Copyright (C) 2015-2016 by Marijn Haverbeke <marijnh@gmail.com> and others

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## Texto 16

- `react@19.3.1 (LICENSE)`
- `react-dom@19.3.1 (LICENSE)`
- `scheduler@0.28.0 (LICENSE)`
- `use-sync-external-store@1.7.0 (LICENSE)`

```text
MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Texto 17

- `rope-sequence@1.3.4 (LICENSE)`

```text
Copyright (C) 2016 by Marijn Haverbeke <marijn@haverbeke.berlin>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## Texto 18

- `workbox-background-sync@7.4.1 (LICENSE)`
- `workbox-broadcast-update@7.4.1 (LICENSE)`
- `workbox-build@7.4.1 (LICENSE)`
- `workbox-cacheable-response@7.4.1 (LICENSE)`
- `workbox-core@7.4.1 (LICENSE)`
- `workbox-expiration@7.4.1 (LICENSE)`
- `workbox-google-analytics@7.4.1 (LICENSE)`
- `workbox-navigation-preload@7.4.1 (LICENSE)`
- `workbox-precaching@7.4.1 (LICENSE)`
- `workbox-range-requests@7.4.1 (LICENSE)`
- `workbox-recipes@7.4.1 (LICENSE)`
- `workbox-routing@7.4.1 (LICENSE)`
- `workbox-strategies@7.4.1 (LICENSE)`
- `workbox-streams@7.4.1 (LICENSE)`
- `workbox-sw@7.4.1 (LICENSE)`
- `workbox-window@7.4.1 (LICENSE)`

```text
Copyright 2018 Google LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## Texto 19

- `@apideck/better-ajv-errors@0.3.7 (LICENSE)`

```text
MIT License

Copyright (c) 2021 Apideck

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Texto 20

- `ajv@8.20.0 (LICENSE)`

```text
The MIT License (MIT)

Copyright (c) 2015-2021 Evgeny Poberezkin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```

## Texto 21

- `json-schema-traverse@1.0.0 (LICENSE)`

```text
MIT License

Copyright (c) 2017 Evgeny Poberezkin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Texto 22

- `pretty-bytes@5.6.0 (license)`

```text
MIT License

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

## Texto 23

- `zustand@4.5.7 (LICENSE)`

```text
MIT License

Copyright (c) 2019 Paul Henschel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Ferramentas e limites

Vite, ESLint, Vitest, plugins, TypeScript e demais ferramentas mantêm seus próprios arquivos de licença/avisos em node_modules. Entre as licenças declaradas nas 586 entradas do lock original estão MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0, BlueOak-1.0.0, Python-2.0, CC-BY-4.0 e (MIT OR CC0-1.0). TypeScript é Apache-2.0; os dados caniuse-lite são CC-BY-4.0, não código próprio relicenciado como MPL. Metadados não substituem a leitura dos termos e notices correspondentes. Nada em node_modules foi alterado.

Antes de distribuir builds, conferir os componentes efetivamente incluídos (também os incorporados por ferramentas), conservar seus avisos e atribuições e disponibilizá-los junto da distribuição. O build agora emite uma cópia deste documento em legal/THIRD_PARTY_NOTICES.md, acessível pela página legal e preservada no precache. Pacotes opcionais de outras plataformas e todas as fontes transitivas não foram auditados individualmente.

## Vite core — aviso adicional de ferramenta que gera código cliente

Texto do núcleo do Vite 7.3.7, preservado do LICENSE.md instalado, inclusive para auxiliares gerados no build. Os demais avisos de componentes empacotados na ferramenta continuam no arquivo original; essa inclusão não afirma que todos eles integram o aplicativo.

# Vite core license
Vite is released under the MIT license:

MIT License

Copyright (c) 2019-present, VoidZero Inc. and Vite contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
