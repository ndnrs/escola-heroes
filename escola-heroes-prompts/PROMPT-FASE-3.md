# FASE 3 — Nivel 1: Cantina

> Le GAME-DESIGN.md PRIMEIRO. Esse documento e a fonte de verdade para todo o jogo.
> NAO apagar ou reescrever codigo das fases anteriores. Construir em cima do existente.

## Objectivo

Criar o primeiro nivel jogavel completo — a Cantina. Incluir waves de monstros, mini-boss, e ecra de nivel completo.

## Contexto

Fase 2 criou: Player, Projectile, Monster, MonsterTypes, PowerUp, HUD, controlos mobile, TestScene. Todas as mecanicas core funcionam.

## O que CRIAR nesta fase

### 1. `src/scenes/CantinScene.js`
- Background: cantina da escola desenhada com Graphics
  - Chao: rectangulo bege/castanho claro
  - Paredes: rectangulo creme/amarelo claro atras
  - Mesas: 4-6 rectangulos castanhos espalhados (NAO colisores, apenas visuais)
  - Tabuleiros nas mesas: pequenos rectangulos coloridos
  - Cozinha ao fundo: rectangulo cinza com detalhes (panelas = circulos)
  - Janelas: rectangulos azul claro no topo da parede
  - Decoracao: posters coloridos nas paredes (rectangulos pequenos)
- Criar jogador usando Player com dados do registry
- Lancar HUDScene com nome "CANTINA"
- Sistema de waves:
  - Wave 1: 5 Gosmas Verdes (entram pela direita)
  - Wave 2: 3 Gosmas + 2 Morcegos (entram por cima e direita)
  - Wave 3: 2 Gosmas + 3 Morcegos (entram por todos os lados)
  - Intervalo entre waves: 3 segundos com texto "WAVE 2!" animado
  - Monstros entram com tween (slide do exterior do ecra)
- Mini-boss: Gosma Gigante
  - Aparece apos wave 3 com fanfarra (texto "BOSS!" + screenshake)
  - HP 150, tamanho 2x de uma gosma normal
  - Comportamento: move-se lentamente para o jogador, dispara bolas de lodo (projecteis verdes) a cada 2 segundos
  - Barra de vida do boss: barra vermelha acima dele
  - Ao morrer: explosao grande de particulas, drop garantido de power-up coracao
- Nivel completo quando mini-boss morre

### 2. `src/scenes/LevelCompleteScene.js`
- Overlay semi-transparente escuro
- Texto "NIVEL COMPLETO!" grande, bold, com animacao (bounce in)
- Estrelas decorativas animadas (3 estrelas que rodam, amarelas)
- Stats:
  - Monstros derrotados: X/15
  - HP restante: X/100
  - Tempo: X:XX
- Guardar stats no registry para uso futuro
- Botao "PROXIMO NIVEL" verde, bold
  - Na Fase 3, este botao pode mostrar "EM BREVE..." (niveis seguintes nao existem ainda)
  - Ou navegar para uma scene placeholder
- Botao "MENU" para voltar ao MenuScene
- HP do jogador e restaurado a 100 para o proximo nivel

### 3. `src/scenes/GameOverScene.js`
- Overlay escuro
- Texto "OH NAO!" grande com animacao triste (shake ou drop)
- Stats do nivel (monstros derrotados, tempo jogado)
- Botao "TENTAR OUTRA VEZ" — reinicia CantinScene com HP 100
- Botao "MENU" — volta ao MenuScene
- Visual: tons vermelhos/escuros, contrastando com o colorido do jogo

### 4. Actualizar `src/main.js`
- Registar novas scenes: CantinScene, LevelCompleteScene, GameOverScene
- SelectScene deve navegar para CantinScene (nao para TestScene)
- TestScene pode ser mantida mas comentada/removida do fluxo principal

### 5. Sistema de waves (`src/systems/WaveManager.js` ou dentro de CantinScene)
- Classe ou funcao que gere waves de monstros
- Input: array de wave configs `[{ type: 'gosma', count: 3, delay: 500, entryFrom: 'right' }]`
- Spawn monstros com delay entre cada um
- Eventos: `waveStart`, `waveComplete`, `allWavesComplete`
- Verificar wave completa quando todos os monstros da wave estao mortos
- Mostrar contador de monstros restantes no HUD (opcional)

## Restricoes tecnicas

- NAO modificar Player, Monster, Projectile, PowerUp, HUD (ja funcionam da Fase 2)
- NAO modificar MenuScene, SelectScene (ja funcionam da Fase 1)
- Manter consistencia com constants.js — usar constantes, nao valores magicos
- Spawns de monstros devem vir de FORA do ecra (nao aparecer do nada)
- Mini-boss deve ter barra de vida propria (nao usar a do HUD)
- Level timer: iniciar ao entrar na scene, parar ao completar/game over
- Monstros mortos devem incrementar special charge do jogador (via Player.addSpecialCharge)
- Power-ups do GAME-DESIGN: 15% drop chance em monstros normais, 100% no mini-boss

## Criterios de sucesso (TODOS devem ser verdade)

1. Menu → Seleccao → Cantina: fluxo completo funciona
2. Background da cantina e visualmente reconhecivel (mesas, cozinha, decoracao)
3. Wave 1 inicia automaticamente com 5 gosmas entrando pela direita
4. Texto "WAVE X!" aparece entre waves
5. Waves 2 e 3 introduzem morcegos com comportamento zig-zag
6. Mini-boss Gosma Gigante aparece apos wave 3 com anuncio visual
7. Mini-boss dispara projecteis verdes e tem barra de vida propria
8. Nivel completo quando mini-boss morre — LevelCompleteScene mostra stats
9. Game over funciona — GameOverScene com retry e menu
10. Retry reinicia o nivel com HP 100
11. Power-ups continuam a funcionar correctamente
12. Especial funciona durante o nivel
13. HUD mostra "CANTINA" como nome do nivel
14. Zero erros na consola do browser
15. Jogavel do inicio ao fim sem bugs bloqueantes

## Quando terminar

Verifica TODOS os criterios acima. Quando todos estiverem cumpridos, output:

<promise>FASE 3 COMPLETE</promise>
