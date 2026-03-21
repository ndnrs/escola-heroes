# FASE 1 — Setup + Menu + Seleccao de Personagem

> Le GAME-DESIGN.md PRIMEIRO. Esse documento e a fonte de verdade para todo o jogo.

## Objectivo

Criar a base do projecto Phaser 3 com menu principal e seleccao de personagem funcional.

## Contexto

Estamos a construir "Escola Heroes" — um side-scroller shooter 2D para criancas de 10 anos. Phaser 3 via CDN, sem build tools, estilo cartoon colorido. Tudo gerado via codigo (sem assets externos).

## O que CRIAR nesta fase

### 1. `index.html`
- Carregar Phaser 3.80.1 via CDN jsdelivr
- Carregar todos os scripts `src/` via tags `<script>` na ordem correcta
- Background preto, sem margens, fullscreen
- Meta viewport para mobile
- Titulo "Escola Heroes"

### 2. `src/main.js`
- Config Phaser: type AUTO, 800x600, arcade physics, scale FIT + CENTER_BOTH
- Background color: `#87CEEB` (azul ceu)
- Registar todas as scenes: Boot, Menu, Select
- Scene inicial: Boot

### 3. `src/constants.js`
- PLAYER_STATS: hp(100), speed(200), fireRate(300), projectileDamage(10), specialDamage(30)
- CHARACTERS array com: name, color hex, projectileColor, specialName, specialDescription
  - Matilde: rosa #FF69B4, estrelas rosa, "Estrela Gigante"
  - Riana: azul #4A90D9, bolhas agua, "Onda Congelante"
  - Violeta: roxo #9B59B6, raios magicos, "Escudo Violeta"
  - Leonor: verde #2ECC71, folhas magicas, "Chuva de Folhas"
- POWERUPS configs
- LEVELS configs (nomes, cores)

### 4. `src/scenes/BootScene.js`
- Mostrar texto "A carregar..." centrado
- Simular loading (barra de progresso com graphics)
- Apos 1 segundo, transicao para MenuScene
- Pre-criar texturas via `this.textures.createCanvas()` ou `generateTexture`:
  - Gerar sprites de cada personagem via Graphics (circulo cabeca + rectangulo corpo + olhos + cabelo colorido)
  - Gerar sprite dos projecteis (circulo pequeno colorido com trail)
  - Gerar backgrounds simples

### 5. `src/scenes/MenuScene.js`
- Background: gradiente azul ceu → verde (simulado com rectangulos)
- Desenhar frente de escola simplificada (rectangulos — edificio, porta, janelas, telhado)
- Monstros cartoon a espreitar (2-3 formas com olhos, animacao bobbing sutil com tweens)
- Titulo "ESCOLA HEROES" grande, bold, com sombra — usar texto Phaser com stroke
- Estilo do titulo: fill branco, stroke preto 6px, fontSize 64, fontFamily 'Arial Black'
- Botao "JOGAR": rectangulo arredondado verde com texto branco bold, hover/tap feedback (escala 1.1 com tween)
- Botao "COMO JOGAR": igual mas azul, abre HowToPlayScene
- Animacao de entrada: titulo cai de cima com ease bounce, botoes aparecem com fade

### 6. `src/scenes/HowToPlayScene.js`
- Background semi-transparente sobre o menu
- Caixa central com instrucoes:
  - "WASD ou Setas: Mover"
  - "Espaco: Disparar"
  - "Q: Ataque Especial"
  - "Mobile: Joystick + Botoes"
  - "Derrota os monstros e salva a escola!"
- Botao "VOLTAR" que regressa ao MenuScene
- Icones simples desenhados com Graphics junto a cada instrucao

### 7. `src/scenes/SelectScene.js`
- Titulo "ESCOLHE A TUA HEROINA" com estilo bold
- 4 cards (2x2 grid, responsive):
  - Background: rectangulo arredondado com a cor tema da personagem (alpha 0.3)
  - Borda: cor tema solida
  - Personagem desenhada com Graphics (circulo cabeca + corpo + olhos + cabelo da cor tema)
  - Nome em bold abaixo da personagem
  - Descricao do especial em texto pequeno
- Interaccao nos cards:
  - Hover (desktop): scale 1.05 com tween, borda brilha (alpha 1)
  - Tap/click: selecciona — flash branco + som (ou feedback visual) + transicao para o nivel 1
- Mobile: cards devem ser suficientemente grandes para tocar
- Guardar personagem seleccionada em `this.registry.set('selectedCharacter', characterData)`

## Restricoes tecnicas

- NAO usar import/export — scripts classicos com variaveis globais ou namespaces (window.EscolaHeroes = {})
- NAO usar assets externos (imagens, sons) — TUDO desenhado com Phaser Graphics API
- NAO usar npm, webpack, vite, ou qualquer bundler
- Phaser 3.80.1 via CDN: `https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js`
- Testar que funciona abrindo index.html directamente no browser (file:// protocol)
- TODA a arte deve ser gerada via `this.add.graphics()` ou `this.make.graphics()` + `generateTexture()`

## Criterios de sucesso (TODOS devem ser verdade)

1. `index.html` abre no browser sem erros na consola
2. BootScene mostra loading e transiciona para MenuScene
3. MenuScene mostra titulo, escola desenhada, monstros animados, e 2 botoes
4. Botao "JOGAR" navega para SelectScene
5. Botao "COMO JOGAR" mostra instrucoes com botao voltar funcional
6. SelectScene mostra 4 cards de personagem com nomes correctos (Matilde, Riana, Violeta, Leonor)
7. Cards tem interaccao visual (hover/tap feedback)
8. Ao seleccionar personagem, dados sao guardados no registry
9. Layout funciona em desktop (800x600) e mobile (responsive, scale FIT)
10. Zero erros na consola do browser
11. Codigo organizado nos ficheiros correctos conforme estrutura do GAME-DESIGN.md

## Quando terminar

Verifica TODOS os criterios acima. Quando todos estiverem cumpridos, output:

<promise>FASE 1 COMPLETE</promise>
