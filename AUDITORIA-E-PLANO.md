# PHOTOMACHINE — auditoria inicial e plano de reformulação

Data da auditoria: 4 de setembro de 2026  
Branch auditada: `main`  
Commit de referência: `7b16897` — `Improve responsive presentation layout`

## Resumo executivo

O projeto pode ser publicado diretamente no Render como **Static Site**. Não há servidor, banco, etapa de compilação ou dependência de rede em tempo de execução. O ponto de entrada é `index.html`, e todos os recursos usados pela apresentação estão versionados no repositório.

A experiência atual é uma apresentação interativa de 17 capítulos, com direção visual escura/premium, tipografia editorial, navegação por teclado, toque e controles em tela, comparadores e simuladores. A execução local foi validada no navegador, inclusive com navegação até o encerramento.

O principal risco não é de deploy; é de evolução. HTML, CSS, controladores de interface e uma distribuição minificada do Three.js estão reunidos em um único arquivo de aproximadamente 869 KB e 8 mil linhas. Uma reformulação pesada deve primeiro separar responsabilidades e criar uma linha de base testável, mantendo o commit atual como rollback inequívoco.

## Inventário

- `index.html`: documento completo, estilos, lógica da apresentação e runtime 3D embutido.
- `assets/photomachine/`: quatro imagens locais e quatro arquivos de fonte WOFF2.
- `LEIA-ME.txt`: instruções para execução local/offline.
- Sem `package.json`, bundler, framework, chamadas de API, autenticação ou armazenamento no navegador.
- Sem rotas reais: os capítulos são âncoras `#slide-1` a `#slide-17`.
- Peso aproximado do conteúdo publicado: 3,2 MB, dos quais a imagem PNG de edição representa cerca de 1,8 MB.

## O que já funciona bem

### Visual e narrativa

- Identidade consistente: fundo quase preto, acentos dourado/ciano, serif para momentos editoriais e sans/mono para operação e dados.
- A abertura e o encerramento têm hierarquia clara e composição de alto contraste.
- A narrativa progride de problema para solução, operação, prova, vantagem, cronograma e valor.
- Interações não são decorativas apenas: seleção contextual, comparação de edição, aprovação e calculadora ajudam a demonstrar o produto.

### Front-end e acessibilidade

- Sem dependência de CDN; a apresentação funciona offline.
- Estrutura semântica razoável: um `h1`, títulos de capítulo, `section`, labels, estados ARIA e barra de progresso.
- Link de salto, foco visível, teclado, toque e botões com descrições acessíveis.
- Tratamento de `prefers-reduced-motion`.
- Layout móvel permite rolagem interna no conteúdo dos slides, evitando perda completa de conteúdo em telas estreitas.
- Renderização 3D possui fallback quando WebGL falha.

## Problemas e riscos encontrados

### Prioridade alta

1. **Arquivo monolítico.** Alterações pequenas exigem navegar e revisar milhares de linhas. CSS de capítulos, controller da apresentação e Three.js não têm fronteiras claras.
2. **Runtime de terceiro embutido sem cadeia de origem explícita.** O arquivo contém Three.js revisão 155 minificado, mas o repositório não registra pacote, lockfile, fonte de build ou licença dessa dependência.
3. **Orçamento de desempenho não definido.** O PNG de comparação tem ~1,8 MB; o 3D solicita GPU de alta performance, antialiasing, sombras 2048² e pixel ratio até 2. Em dispositivos modestos isso pode elevar tempo de abertura, memória e bateria.
4. **Slides densos em telas pequenas.** A estratégia atual troca a apresentação de tela fixa por rolagem interna. É funcional, mas a navegação fixa e a quantidade de conteúdo disputam área útil; a auditoria visual móvel deve cobrir todos os 17 capítulos antes do redesign ser aprovado.

### Prioridade média

5. **Ausência de automação de qualidade.** Não há validação de HTML, testes de teclado/interações, teste de links/ativos, auditoria Lighthouse ou comparação visual.
6. **Separação entre conteúdo e layout.** Textos, números, labels e componentes estão acoplados ao markup, tornando revisão editorial e criação de versões mais arriscadas.
7. **SEO/social mínimo.** Há título e descrição, mas faltam canonical, Open Graph, Twitter cards, imagem social e favicon real.
8. **Política de segurança limitada pelo inline.** Uma CSP rigorosa exigirá mover estilos/scripts para arquivos ou manter hashes complexos.
9. **Mensuração inexistente.** Não há telemetria — positivo para privacidade, mas significa que a equipe não sabe onde a apresentação é abandonada ou quais demos são usadas. Qualquer instrumentação futura deve ser opcional e consentida.

### Prioridade baixa

10. O texto `LEIA-ME.txt` descreve apenas distribuição por ZIP e não o deploy web.
11. O nome do projeto e metadados de edição poderiam ser centralizados para evitar divergência entre cabeçalho, título da aba e assinatura.

## Deploy automático no Render

### Viabilidade

**Aprovado.** O Render pode conectar o repositório GitHub e publicar a raiz como Static Site. Cada push na branch configurada pode disparar um novo deploy automático. Como os arquivos são estáticos, não é necessário serviço Web, Docker, runtime ou variável secreta.

### Configuração recomendada na interface do Render

- Service type: **Static Site**
- Repository: `https://github.com/arthur-bpv/temp`
- Branch: `main`
- Root directory: vazio (raiz do repositório)
- Build command: vazio; se a interface exigir valor, `echo Static site - no build step`
- Publish directory: `.`
- Auto-deploy: habilitado para commits na `main`
- Pull Request Previews: recomendado durante a reformulação

O arquivo `render.yaml` adicionado ao repositório representa a mesma configuração como Blueprint e mantém as decisões de deploy sob controle de versão.

### Rotas e cabeçalhos

Não é necessário rewrite para os capítulos atuais, pois eles usam fragmentos (`/#slide-7`) e o navegador sempre solicita `/`. Se no futuro houver URLs como `/capitulos/selecao`, deve-se adicionar rewrite para `/index.html` ou gerar páginas estáticas reais.

Foram recomendados cabeçalhos seguros e compatíveis com o estado atual. Uma Content Security Policy completa ficou fora da primeira configuração porque os scripts e estilos inline exigiriam `unsafe-inline` ou hashes; a correção estrutural é externalizar esses blocos antes de fechar a CSP.

### Fluxo de entrega seguro

1. Manter `main` como produção.
2. Criar uma branch de redesign a partir do commit auditado.
3. Ativar previews de Pull Request no Render.
4. Comparar visualmente os 17 capítulos em desktop, tablet e celular.
5. Só integrar quando os testes de navegação, acessibilidade e ativos estiverem verdes.

Rollback: no Render, selecionar um deploy anterior; no Git, reverter o commit de merge. O commit `7b16897` é a linha de base visual desta auditoria.

## Direção proposta para a reformulação pesada

### Princípios

- Preservar o tom premium e autoral, reduzindo ruído e repetição.
- Transformar a apresentação em uma história de decisão, não em uma sequência uniforme de cards.
- Usar movimento para explicar causa e efeito; nunca como atraso ornamental.
- Projetar primeiro a legibilidade em 390×844 e 1366×768, depois expandir.
- Manter a experiência sem dependência de framework até existir necessidade comprovada.

### Arquitetura-alvo

```text
/
├─ index.html                 estrutura semântica e metadados
├─ styles/
│  ├─ tokens.css             cor, tipo, espaçamento, movimento
│  ├─ base.css               reset, acessibilidade, chrome
│  ├─ components.css         cards, gráficos, controles
│  └─ chapters.css           composições específicas
├─ scripts/
│  ├─ presentation.js        navegação e estado global
│  ├─ interactions.js        seleção, edição, aprovação, cálculo
│  └─ machine.js             cena 3D e fallback
├─ vendor/                   dependência 3D com versão/licença claras
└─ assets/
```

Esta separação pode ser feita sem framework e sem alterar URLs. Caso a equipe queira edição frequente de conteúdo, uma segunda etapa pode mover os capítulos para dados estruturados e introduzir uma etapa de build mínima.

### Novo sistema visual

- Definir escala tipográfica e de espaçamento curta, com limites por densidade de capítulo.
- Reservar serif para teses e perguntas; usar sans para evidência e instrução; mono apenas para estados/dados.
- Criar três ritmos de página: **impacto**, **prova** e **decisão**, evitando que 17 telas pareçam variações da mesma grade.
- Aumentar contraste dos textos secundários e limitar largura de parágrafo.
- Reduzir bordas e caixas; usar espaço, escala e alinhamento como hierarquia principal.
- Criar imagens de fallback para a máquina e para demos quando WebGL ou movimento reduzido estiverem ativos.

### Sequência recomendada

1. Congelar capturas da linha de base e definir critérios de aceite.
2. Extrair CSS/JS/vendor sem mudar pixels ou comportamento.
3. Otimizar `editing-square-recipe.png` e definir orçamento de peso.
4. Refazer primeiro os capítulos 1, 2, 4, 7, 11 e 17 como sistema piloto.
5. Validar narrativa com stakeholders; então aplicar o sistema aos demais capítulos.
6. Adicionar testes automatizados e revisão visual no preview do Render.

## Critérios de aceite para a próxima fase

- Todos os 17 capítulos acessíveis por setas, toque, controles e links com hash.
- Nenhum conteúdo essencial cortado em 390×844, 768×1024 e 1366×768.
- Foco visível e ordem de tabulação coerente.
- Experiência completa com movimento reduzido e fallback sem WebGL.
- Sem erros de console ou ativos ausentes.
- HTML, CSS, JS autoral e vendor separados e versionados.
- Peso inicial e métricas de carregamento medidos antes e depois.
- Preview do Render por Pull Request e rollback documentado.

## Fontes operacionais

- Render — Static Sites: https://render.com/docs/static-sites
- Render — Blueprints: https://render.com/docs/blueprint-spec

