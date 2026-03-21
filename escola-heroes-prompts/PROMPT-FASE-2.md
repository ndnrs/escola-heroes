# FASE 2 — Mecanica Core (Movimento, Tiro, Monstros, Power-ups)

> Le GAME-DESIGN.md PRIMEIRO. Esse documento e a fonte de verdade para todo o jogo.
> NAO apagar ou reescrever codigo das fases anteriores. Construir em cima do existente.

## Objectivo

Implementar todas as mecanicas de jogo: jogador, movimento, tiro, monstros, colisoes, power-ups, HUD, e controlos mobile. Usar uma scene de teste temporaria para validar tudo.

## Contexto

Fase 1 criou: index.html, main.js, constants.js, BootScene, MenuScene, HowToPlayScene, SelectScene. A personagem seleccionada esta em `this.registry.get('selectedCharacter')`.

## O que CRIAR nesta fase

### 1. `src/entities/Player.js`
- Classe Player (nao Phaser.Scene, apenas logica da entidade)
- Criar sprite via Graphics no `create()` da scene: circulo cabeca + rectangulo corpo + olhos + cabelo (cor do personagem seleccionado)
- Gerar textura com `generateTexture()` e criar sprite de fisica arcade
- Propriedades: hp(100), speed(200), fireRate(300), damage(10), specialCharge(0), specialMax(10), isShielded(false), isDamageBoost(false)
- Metodos:
  - `update(cursors, time)`: movimento 8 direcoes, actualizar facing direction
  - `shoot(time)`: criar projectil se cooldown passou, na direcao do facing
  - `takeDamage(amount)`: reduzir HP, flash branco (tween alpha), invencibilidade 500ms, verificar game over
  - `heal(amount)`: recuperar HP (max 100)
  - `activateShield(duration)`: invencibilidade temporaria com visual (tint azul pulsante)
  - `activateDamageBoost(duration)`: dano x3 temporario com visual (tint dourado)
  - `activateSpeed(duration)`: velocidade x1.5 com visual
  - `addSpecialCharge()`: incrementar carga, verificar se cheio
  - `useSpecial()`: se carga cheia, executar ataque especial da personagem

### 2. `src/entities/Projectile.js`
- Classe para projecteis do jogador
- Sprite: circulo pequeno (8px) da cor do personagem com trail (particulas ou tween alpha)
- Velocidade: 400 px/s na direcao do facing do jogador
- Destroi-se ao sair do ecra (outOfBoundsKill) ou ao acertar monstro
- Usar `this.physics.add.group({ classType: Projectile })` na scene

### 3. `src/entities/Monster.js`
- Classe base Monster
- Sprite: forma geometrica com olhos (gerada via Graphics + generateTexture)
- Propriedades: hp, speed, damage, scoreValue, type
- Metodos:
  - `update()`: comportamento de movimento (override por tipo)
  - `takeDamage(amount)`: reduzir HP, flash vermelho, verificar morte
  - `die()`: animacao de morte (escala 0 + particulas coloridas), chance de drop power-up (15%)
- IA basica: mover-se em direcao ao jogador (com variacao para nao ser linear)

### 4. `src/entities/MonsterTypes.js`
- Configs para cada tipo de monstro (referencia GAME-DESIGN.md):
  - GosmaVerde: HP 30, speed 60, circulo/elipse verde, movimento lento direccional
  - Morcego: HP 20, speed 120, triangulos cinza + olhos vermelhos, movimento zig-zag (seno)
  - AranhaSaltitona: HP 25, speed 80, corpo arredondado + patas, salta (tween y periodico)
  - Fantasma: HP 40, speed 70, forma branca semi-transparente, aparece/desaparece (tween alpha)
  - LivroVoador: HP 35, speed 90, rectangulo castanho, dispara projecteis (letras)
  - Sombra: HP 45, speed 150, forma escura, rapido + muda direcao

### 5. `src/entities/PowerUp.js`
- Tipos: heart (vermelho, +25HP), shield (azul, invencivel 5s), damage (dourado, x3 8s), speed (verde, x1.5 6s)
- Sprite: forma geometrica colorida com animacao pulsante (tween scale)
- Flutua no local do monstro morto durante 5 segundos, depois desaparece (tween alpha + destroy)
- Ao ser apanhado (overlap com jogador): aplicar efeito, feedback visual (texto "+25 HP" flutuante), destroy

### 6. `src/ui/HealthBar.js`
- Barra de vida: fundo cinza escuro + preenchimento gradiente (verde >60%, amarelo >30%, vermelho <=30%)
- Posicao: topo centro, 200px largura, 20px altura
- Animacao suave ao mudar valor (tween width)
- Texto HP numerico opcional (ex: "75/100")

### 7. `src/ui/SpecialBar.js`
- Barra de carga especial: fundo cinza + preenchimento da cor do personagem
- Posicao: baixo centro, 150px largura, 12px altura
- Texto "ESPECIAL" quando cheia (pulsante)
- Dividida em 10 segmentos visuais (1 por kill necessaria)

### 8. `src/ui/VirtualJoystick.js`
- Joystick virtual para mobile (canto inferior esquerdo)
- Base: circulo cinza semi-transparente (radius 60)
- Thumb: circulo branco menor (radius 25)
- Arrastar o thumb retorna direcao normalizada (x, y entre -1 e 1)
- Implementar com pointer events do Phaser (pointerdown, pointermove, pointerup)
- Zona morta central de 10px (evita drift)
- So visivel em dispositivos touch

### 9. `src/ui/MobileButtons.js`
- Botao de tiro: circulo vermelho semi-transparente (radius 40), canto inferior direito
- Botao especial: circulo menor (radius 30) acima do botao de tiro, cor do personagem, so activo quando barra cheia
- So visiveis em dispositivos touch
- Usar pointer events, nao DOM elements

### 10. `src/scenes/HUDScene.js`
- Scene paralela (lancada com `this.scene.launch('HUD')`)
- Contem: HealthBar, SpecialBar, avatar+nome personagem (topo esquerda), nome nivel (topo direita)
- Mobile: contem VirtualJoystick e MobileButtons
- Recebe eventos da game scene via `this.scene.get('HUD').events.emit()`
- Metodos: updateHP(value), updateSpecial(value), setLevel(name)

### 11. `src/scenes/TestScene.js` (TEMPORARIA — sera removida nas fases seguintes)
- Scene de teste com fundo liso
- Spawn do jogador ao centro
- Botao ou tecla para spawnar monstros de teste (1 de cada tipo)
- Testar: movimento, tiro, colisoes, dano, morte monstro, power-up drops, especial, game over
- HUD funcional (HP bar, special bar, mobile controls)
- Registar TestScene no main.js, SelectScene navega para TestScene apos seleccao

## Restricoes tecnicas

- NAO modificar MenuScene, HowToPlayScene, SelectScene (ja funcionam da Fase 1)
- NAO usar import/export — manter padrao de scripts classicos da Fase 1
- NAO usar assets externos — TUDO via Graphics API
- Usar namespacing consistente: `window.EscolaHeroes.Player`, `window.EscolaHeroes.Monster`, etc.
- Colisoes via `this.physics.add.overlap()` — NAO via distance checks manuais
- Projecteis e monstros em `Phaser.Physics.Arcade.Group` para performance
- Power-ups em grupo separado
- Mobile detection: `this.sys.game.device.input.touch`
- Manter constants.js como SSOT para todos os valores numericos

## Criterios de sucesso (TODOS devem ser verdade)

1. Menu e seleccao de personagem continuam a funcionar (Fase 1 intacta)
2. TestScene abre apos seleccao de personagem
3. Jogador aparece com visual correcto da personagem escolhida
4. Movimento 8 direcoes funciona (WASD e Arrow Keys)
5. Tiro dispara projecteis na direcao correcta com cadencia limitada
6. Monstros de teste aparecem e movem-se em direcao ao jogador
7. Projecteis destroem monstros (dano aplicado, animacao morte, particulas)
8. Monstros causam dano ao tocar no jogador (HP bar actualiza)
9. Power-ups aparecem ao matar monstros (~15% chance)
10. Cada power-up funciona: coracao(+HP), escudo(invencivel), ataque(x3), velocidade(x1.5)
11. Barra de especial enche com kills, ataque especial funciona ao carregar Q
12. HUD mostra HP bar, special bar, nome personagem, nome nivel
13. Em mobile (ou simulando touch no DevTools): joystick e botoes aparecem e funcionam
14. Game over quando HP = 0 (pode ser alerta simples por agora)
15. Zero erros na consola do browser

## Quando terminar

Verifica TODOS os criterios acima. Quando todos estiverem cumpridos, output:

<promise>FASE 2 COMPLETE</promise>
