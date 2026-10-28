# Sprites do jogador

Converte as folhas de arte em `art/jogador/` (geradas por IA, fundo magenta #FF00FF) nos quadros usados pelo jogo.

```
python3 tools/sprites/build.py      # recorta, reduz para a grade de pixels original e alinha pelo chão (sombra)
python3 tools/sprites/roles.py      # separa camisa, short, pele, cabelo, tênis e raquete (para recolorir)
python3 tools/sprites/export_js.py  # grava os dados no topo de src/15g-sprites.js
python3 tools/build.py
```

Arquivos intermediários e prévias ficam em `tools/sprites/out/` (fora do jogo). Para trocar uma pose, substitua a folha e ajuste a tabela `PICK` em `build.py` (folha, linha, coluna → nome do quadro) e o lado da raquete em `SIDE` de `export_js.py`.
