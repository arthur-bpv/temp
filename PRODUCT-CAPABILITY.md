# Capability — landing contínua com protótipo 3D

## CAPABILITY

O visitante percorre a tese PHOTOMACHINE como uma página única e contínua, preservando o nível visual da Square e podendo explorar o protótipo 3D e todas as provas interativas sem controles de apresentação.

## CONSTRAINTS

- Conteúdo, números, ressalvas e decisões humanas permanecem equivalentes à base `7b16897`.
- O 3D é funcionalidade central, não decoração descartável.
- Rolagem do navegador nunca é interceptada por setas, espaço, Page Up/Down ou swipe.
- A página permanece implantável como Static Site no Render.
- Falha de WebGL produz fallback; não bloqueia a narrativa.
- Carregamento do runtime 3D ocorre por proximidade da seção, reduzindo custo inicial.
- Histórico Git e branch dedicada mantêm comparação e rollback.

## IMPLEMENTATION CONTRACT

- Superfícies: cabeçalho leve, 17 seções contínuas, seleção, edição, aprovação, calculadora, modelo 3D e fechamento.
- Estados: seção corrente apenas para metadados; não controla rolagem. Demos mantêm estados reversíveis locais.
- Interfaces: `index.html` semântico; `styles.css`; `app.js`; `machine-loader.js`; `machine-runtime.js`; ativos locais.
- Performance: HTML não incorpora CSS nem runtime 3D; renderer só inicializa quando a seção está próxima; loop continua limitado à visibilidade.
- Qualidade: validar 390×844 e desktop, navegação nativa, 3D, interações, console e requests.

## NON-GOALS

- Backend, pagamento, autenticação, telemetria e integrações de produção.
- Mudança de posicionamento, cronograma ou estimativas financeiras.
- Novo modelo 3D conceitualmente diferente do protótipo aprovado.

## OPEN QUESTIONS

- Domínio final, imagem social e CTA comercial continuam sem definição.
- Uma otimização geométrica adicional do 3D depende de métricas em aparelhos reais.

## HANDOFF

Pronto para implementação e verificação na branch `redesign/mobile-first-landing-v2`. Só promover à `main` depois de comparação visual e funcional completa.
