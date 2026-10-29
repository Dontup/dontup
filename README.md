# Dontup · página de lançamento

Página de vendas do Dontup, sistema de gestão para clínicas odontológicas. HTML, CSS e JavaScript puros, sem build e sem dependências.

## Publicar no GitHub Pages

1. No repositório, abra **Settings → Pages**.
2. Em **Build and deployment**, escolha **Deploy from a branch**, branch `main` e pasta `/ (root)`.
3. Salve. Em um ou dois minutos a página fica em `https://muamorim.github.io/dontup/`.

Para usar o domínio próprio depois, informe `dontup.com.br` em **Custom domain** e crie no Registro.br um registro CNAME `www` apontando para `muamorim.github.io`.

## Configurar

Tudo o que muda com o tempo fica em [`js/config.js`](js/config.js):

| Campo | Para que serve |
|---|---|
| `sistemaUrl` | Endereço do sistema. Vazio: o botão "Acessar sistema" fica bloqueado com o aviso "Liberado no dia da inauguração". |
| `listaEsperaUrl` | Link de um formulário (Google Forms, Tally) para a lista de espera. |
| `whatsapp` | Número comercial, só dígitos com DDI e DDD. Usado se não houver formulário. |
| `inauguracao` | Texto do selo, como "Inauguração em 2 de fevereiro". |

## Ver no computador

Abra `index.html` no navegador ou rode um servidor estático na pasta, por exemplo `npx serve .`.

## Estrutura

- `index.html`: conteúdo da página.
- `css/style.css`: cores, tipografia, layout e animações (respeita "reduzir movimento" do sistema).
- `js/main.js`: funil animado, abas de recursos, formulário demonstrativo e revelações ao rolar.
- `assets/favicon.svg`: ícone.
