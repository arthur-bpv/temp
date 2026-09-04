# Capability — narrativa contínua mobile-first

## CAPABILITY

Um decisor da Square consegue abrir a PHOTOMACHINE por link em celular ou desktop, compreender toda a tese em uma única jornada contínua e explorar as demonstrações essenciais sem aprender controles de apresentação. O resultado muda de “deck interativo” para “landing page de decisão”, mantendo integralmente conteúdo, números, ressalvas e autoria humana.

## CONSTRAINTS

- Todas as informações exibidas na versão-base permanecem presentes e semanticamente equivalentes.
- Não há slides, paginação, scroll snap, tela cheia obrigatória ou rolagem interna por capítulo.
- A estrutura é mobile-first e expande progressivamente para tablet e desktop.
- A página permanece estática, offline-capable e publicável diretamente no Render.
- Não há chamadas de API, coleta de dados, autenticação ou dependência de CDN.
- Interações complementam a leitura; conteúdo e fluxo principal funcionam sem JavaScript.
- Originais imutáveis, revisão humana, edição não destrutiva e aprovação antes do envio continuam como invariantes de produto.
- `main` permanece a linha de produção; a reformulação fica isolada em branch até revisão.

## IMPLEMENTATION CONTRACT

### Atores

- Visitante/decisor: lê a tese, explora provas e ajusta o cenário financeiro.
- Operador Square: reconhece controles, critérios e ressalvas operacionais.
- Equipe de produto: revisa conteúdo, performance e consistência visual.

### Superfícies

- Cabeçalho fixo com navegação por âncoras e menu móvel.
- Jornada contínua: tese, problema, máquina, fluxo, provas, integração, impacto, vantagem, plano e valor.
- Demos: seleção contextual, comparação RAW/receita, revisão humana e calculadora.
- Rodapé/fechamento de valor.

### Estados e transições

- Menu móvel: fechado ↔ aberto; fecha por seleção, Escape e clique fora.
- Seleção: uma imagem ativa; atualiza justificativa e critérios.
- Edição: divisor 0–100 e um estilo ativo.
- Revisão: cada amostra mantida/removida; aprovação gera confirmação local, sem publicar.
- Calculadora: valores limitados por `min`, `max` e `step`; resultados recalculados localmente.

### Interfaces e dados

- Conteúdo está no HTML semântico.
- Tokens e componentes visuais ficam em `styles.css`.
- Comportamento progressivo fica em `app.js` com `defer`.
- Ativos continuam em `assets/photomachine/`.
- O deploy usa `render.yaml`, publica `./` e acompanha commits na `main`.

### Qualidade e observabilidade

- Sem erros de console e sem requests 404.
- Validação visual em 390×844, 768×1024 e 1366×768.
- Teste de teclado para menu, escolhas, range, revisão e calculadora.
- `prefers-reduced-motion`, foco visível e landmarks semânticos.
- Comparação de peso e estrutura com o commit-base.

## NON-GOALS

- Implementar backend, pagamento, galeria real, integração com provedores ou IA operacional.
- Validar comercialmente as estimativas; elas continuam ilustrativas e explicitamente rotuladas.
- Garantir SEO de campanha final sem domínio, imagem social e decisão de indexação.

## OPEN QUESTIONS

- Domínio final e imagem Open Graph ainda não foram definidos.
- A instrumentação de leitura/conversão depende de decisão explícita de privacidade.
- Uma CTA externa depende do destino comercial e não será inventada.

## HANDOFF

Pronto para implementação direta na branch `redesign/mobile-first-landing`, seguida de verificação visual, funcional e de performance antes de qualquer merge.
