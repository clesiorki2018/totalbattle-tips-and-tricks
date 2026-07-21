# Total Battle — Dicas e Truques

Site comunitário e multilíngue com dicas, estratégias e guias para o jogo **Total Battle**.

## Acessar o site

Depois que o GitHub Pages estiver habilitado, o site ficará disponível em:

<https://clesiorki2018.github.io/totalbattle-tips-and-tricks/>

## Executar localmente

O projeto usa apenas HTML, CSS e JavaScript, sem etapa de compilação. Você pode abrir o arquivo `index.html` diretamente no navegador ou iniciar um servidor local:

```bash
python3 -m http.server 8000
```

Depois, acesse <http://localhost:8000>.

## Conteúdo e traduções

O arquivo `data/pt-BR.json` é a fonte principal das dicas e dos textos da interface. Para publicar uma nova dica, edite esse arquivo e envie a alteração para a branch `main`.

Um workflow do GitHub Actions usa o GitHub Models para atualizar automaticamente inglês, espanhol, francês, alemão, russo e polonês. Em seguida, ele publica o site no GitHub Pages. O navegador escolhe o idioma preferido do visitante, e o seletor no topo salva a escolha em `localStorage`.

Para executar a tradução manualmente no GitHub, abra **Actions → Translate and deploy → Run workflow**. Não é necessário cadastrar uma chave externa: o workflow utiliza o `GITHUB_TOKEN` temporário fornecido pelo GitHub.

## Contribuir

Contribuições são bem-vindas. Abra uma issue para sugerir uma dica ou envie um pull request com a melhoria.

Ao compartilhar estratégias, procure informar em qual versão do jogo elas foram verificadas, pois eventos e regras podem mudar.

## Aviso

Este é um projeto independente, criado por fãs, sem vínculo com os desenvolvedores ou distribuidores de Total Battle. Marcas e imagens pertencem aos seus respectivos proprietários.

## Licença

O conteúdo original e o código deste repositório são disponibilizados sob a [Licença Apache 2.0](LICENSE).
