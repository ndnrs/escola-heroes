# FASE 4 — Nivel 2: Pavilhao Desportivo

> Le GAME-DESIGN.md PRIMEIRO. Esse documento e a fonte de verdade para todo o jogo.
> NAO apagar ou reescrever codigo das fases anteriores. Construir em cima do existente.

## Objectivo

Criar o segundo nivel — Pavilhao Desportivo — com novos tipos de monstros e mini-boss.

## Contexto

Fase 3 criou: CantinScene (nivel 1 completo), LevelCompleteScene, GameOverScene, WaveManager. O jogador pode jogar o nivel 1 do inicio ao fim.

## O que CRIAR nesta fase

### 1. `src/scenes/GymScene.js`
- Background: ginasio/pavilhao desportivo desenhado com Graphics
  - Chao: rectangulo castanho (madeira do ginasio) com linhas brancas (campo)
  - Paredes laterais: cinza claro com altura
  - Balizas: 2 rectangulos brancos com rede (linhas) nas extremidades
  - Cestos de basquete: tabela (rectangulo) + aro (circulo) nos lados
  - Banco sueco: rectangulo fino castanho num canto
  - Espaldar: linhas horizontais na parede (grid)
  - Bolas espalhadas: circulos coloridos no chao (decoracao)
- Criar jogador com HP 100 (restaurado no LevelComplete)
- Lancar HUDScene com nome "PAVILHAO"
- Waves (20 monstros total):
  - Wave 1: 5 Aranhas Saltitonas (entram por baixo)
  - Wave 2: 3 Aranhas + 2 Fantasmas (entram por varios lados)
  - Wave 3: 2 Aranhas + 3 Fantasmas (entram por todos os lados)
  - Wave 4: 5 Fantasmas (entram por todos os lados, mais agressivos)
- Mini-boss: Polvo Desportista
  - HP 200, corpo grande redondo roxo
  - 4 tentaculos (linhas/rectangulos que rodam) — dano ao tocar
  - Comportamento: move-se lentamente, tentaculos rodam a volta dele
  - Ataque: a cada 3 segundos, estica um tentaculo em direcao ao jogador (tween rapido)
  - Barra de vida propria acima dele
  - Ao morrer: tentaculos caem um a um (tween), depois corpo explode

### 2. Novos monstros (adicionar em MonsterTypes.js ou criar novos)
- **AranhaSaltitona**:
  - Visual: corpo oval castanho + 4 patas (linhas) de cada lado + olhos
  - Comportamento: move-se em direcao ao jogador, a cada 2 segundos salta (tween y -80px e volta)
  - Dano ao tocar: 10 HP
- **Fantasma**:
  - Visual: forma branca oval, olhos grandes, boca "O", semi-transparente (alpha 0.7)
  - Comportamento: move-se em direcao ao jogador, a cada 3 segundos fica invisivel (alpha 0.1) por 1.5 segundos — NAO pode levar dano enquanto invisivel
  - Dano ao tocar: 10 HP
  - Feedback visual claro quando esta vulneravel vs invulneravel

### 3. Actualizar fluxo
- LevelCompleteScene: botao "PROXIMO NIVEL" na Cantina agora navega para GymScene
- GymScene ao completar → LevelCompleteScene → proximo nivel (placeholder por agora)
- Registar GymScene no main.js

### 4. Reutilizar WaveManager
- O mesmo WaveManager da Fase 3 deve funcionar com os novos configs
- Se necessario, adicionar suporte para `entryFrom: 'bottom'` e outros lados

## Restricoes tecnicas

- NAO modificar CantinScene, Player, core entities (Fase 2/3 intactas)
- REUTILIZAR WaveManager — nao duplicar logica de waves
- REUTILIZAR LevelCompleteScene e GameOverScene — so actualizar se necessario para suportar navegacao entre niveis
- Novos tipos de monstro devem seguir a mesma interface que os existentes
- Mini-boss do Polvo: tentaculos podem ser implementados como sprites separados que rodam (tween angle) a volta do corpo principal
- Fantasma invisivel: desactivar hitbox durante invisibilidade (`body.enable = false`)

## Criterios de sucesso (TODOS devem ser verdade)

1. Nivel 1 (Cantina) continua a funcionar sem alteracoes
2. Apos completar Cantina, botao "PROXIMO NIVEL" leva ao Pavilhao
3. Background do ginasio e visualmente reconhecivel (campo, balizas, cestos)
4. Aranhas Saltitonas saltam periodicamente (visualmente claro)
5. Fantasmas ficam invisiveis periodicamente e nao levam dano nesse estado
6. 4 waves funcionam correctamente com texto entre waves
7. Mini-boss Polvo aparece com tentaculos que rodam
8. Tentaculos do Polvo causam dano ao tocar no jogador
9. Polvo morre com animacao (tentaculos caem + explosao)
10. Nivel completo → LevelCompleteScene com stats
11. Retry funciona (reinicia GymScene)
12. Power-ups e especial continuam a funcionar
13. Zero erros na consola do browser
14. Fluxo completo: Menu → Seleccao → Cantina → Pavilhao jogavel sem bugs

## Quando terminar

Verifica TODOS os criterios acima. Quando todos estiverem cumpridos, output:

<promise>FASE 4 COMPLETE</promise>
