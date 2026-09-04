# Product brief — PHOTOMACHINE mobile-first

## Diagnóstico

### Para quem

Decisores e operadores da Square que precisam entender, em poucos minutos e em qualquer dispositivo, por que a PHOTOMACHINE reduz a distância entre captura, seleção, edição, aprovação e venda.

### Dor

A versão atual exige comportamento de apresentação, ocupa cada tela como um capítulo isolado e concentra informação, estilo e um runtime 3D pesado em um único arquivo. No celular, o usuário encontra controles de slides, áreas roláveis dentro de áreas roláveis e conteúdo denso disputando uma viewport pequena.

### Por que agora

O material já tem narrativa, conteúdo e provas interativas suficientes. O gargalo deixou de ser “o que dizer” e passou a ser distribuição: leitura por link, navegação móvel, carregamento e manutenção.

### Versão 10 estrelas

Uma narrativa contínua, cinematográfica e rápida, que funciona como página de venda e demonstração operacional; abre instantaneamente, orienta a leitura sem exigir instruções e permite explorar seleção, edição, aprovação e cenário financeiro no próprio fluxo.

### MVP que prova a tese

Converter os 17 capítulos em uma landing page contínua, preservar todas as informações, substituir o runtime 3D por uma representação visual leve, manter as quatro interações de prova e validar a experiência em celular e desktop.

### Antiobjetivos

- Não criar uma aplicação autenticada.
- Não transformar a página em dashboard operacional real.
- Não adicionar formulário, analytics ou dependências externas.
- Não mudar números, promessas, ressalvas ou posicionamento comercial.
- Não introduzir framework ou build obrigatório sem necessidade.

### Sinais de sucesso

- Conteúdo integralmente legível em 390×844 sem controles de slide ou rolagem aninhada.
- Página funcional sem JavaScript e progressivamente aprimorada com JavaScript.
- Nenhum erro de console ou ativo ausente.
- Redução expressiva do HTML inicial e remoção do runtime Three.js embutido.
- Navegação por âncoras, foco visível e interações acessíveis por teclado.

## Riscos

- Uma página longa pode cansar se todas as seções tiverem o mesmo peso visual.
- A remoção do 3D pode reduzir impacto percebido se a nova representação da máquina não tiver presença.
- Preservar todo o texto exige controlar densidade e disclosure sem esconder informação essencial.

## Recomendação

**GO.** A mudança resolve o problema principal sem alterar a proposta do produto. A execução deve preservar o commit `7b16897` como baseline, ocorrer na branch `redesign/mobile-first-landing` e ser comparada em preview antes de integrar na `main`.

