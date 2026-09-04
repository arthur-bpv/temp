# Deploy automático no Render

Este projeto é um site estático: não há servidor, instalação de dependências nem etapa de compilação.

## Configuração recomendada

- Tipo: **Static Site**
- Repositório: `arthur-bpv/temp`
- Branch: `main`
- Build Command: `echo Static site - no build step`
- Publish Directory: `./`
- Auto-Deploy: **On Commit**

O arquivo `render.yaml`, na raiz, registra a mesma configuração como infraestrutura declarativa. Em um serviço já criado diretamente pelo painel, ele só passa a governar o serviço se o repositório for conectado como Blueprint. Enquanto isso, a opção **On Commit** já configurada no painel continua sendo a responsável pelo deploy automático.

## Fluxo de publicação

1. Uma alteração aprovada entra na branch `main` do GitHub.
2. O Render detecta o novo commit.
3. O Render publica os arquivos da raiz do repositório.
4. A versão anterior permanece no histórico de deploys do Render e também no histórico do Git.

Não é necessário acionar um Deploy Hook no fluxo normal. Hooks devem ficar apenas em gerenciadores de segredo ou nas configurações do serviço; nunca devem ser gravados no repositório.

## Rollback

Para recuperar uma versão, use **Rollback** no histórico de deploys do Render ou reverta o commit correspondente no GitHub. O commit de rollback também será publicado automaticamente.
