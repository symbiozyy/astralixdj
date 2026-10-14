# Astralix · Full On Night

Site oficial do **Astralix**, projeto de Full On Night do DJ paulistano Caique Souza.
Booking via **Echoes of Gaia**.

## Estrutura

- `index.html` — página única (hero, release/bio, vídeos, jornada, galeria, booking, press kit)
- `assets/css/style.css` — identidade visual (ouro do sigilo + luz negra UV)
- `assets/js/main.js` — intro, vórtice de estrelas, idioma PT/EN, lightbox, pedido de booking
- `assets/video/` — releases em vídeo (H.264, otimizados para web) e loop do hero
- `assets/img/` — fotos, frames dos vídeos, logo e sigilo
- `assets/press/` — arquivos para download no press kit

## Publicar no GitHub Pages

Settings → Pages → *Deploy from a branch* → `main` / `(root)`.
O site fica em `https://symbiozyy.github.io/astralixdj/`.

## Rodar localmente

```sh
python3 -m http.server 8000
```
