# FASE 6 — Nivel 4: Boss Final no Patio da Escola

> Le GAME-DESIGN.md PRIMEIRO. Esse documento e a fonte de verdade para todo o jogo.
> NAO apagar ou reescrever codigo das fases anteriores. Construir em cima do existente.

## Objectivo

Criar o nivel final — a batalha epica contra o Monstro Master no patio da escola. Este e o climax do jogo.

## Contexto

Fases anteriores criaram: 3 niveis completos (Cantina, Pavilhao, Salas de Aula), todos os sistemas funcionais, 6 tipos de monstro + 3 mini-bosses.

## O que CRIAR nesta fase

### 1. `src/scenes/BossScene.js`
- Background: patio da escola desenhado com Graphics
  - Chao: area ampla cinza (alcatrao/betao) com marcacoes de jogos (amarelinha — rectangulos, circulos)
  - Arvores: tronco castanho (rectangulo) + copa verde (circulos sobrepostos), 3-4 nos cantos
  - Bancos: rectangulos castanhos com "patas" (linhas) espalhados
  - Portao da escola: ao fundo, grande, ferro preto (linhas verticais + arco no topo)
  - Muro: rectangulos cinza a delimitar o patio
  - Ceu: gradiente azul no topo
  - Detalhes: caixote do lixo (rectangulo cinza), bebedouro (forma pequena), baloicos (linhas + circulos)
- Arena mais ampla que os niveis anteriores (usar todo o espaco 800x600)
- Criar jogador com HP 100
- Lancar HUDScene com nome "PATIO — BOSS FINAL"

### 2. Monstro Master (Boss Final)
- **Visual:**
  - Corpo grande (2.5x tamanho normal): forma irregular escura roxa/preta
  - Olhos: 3 olhos (2 normais + 1 no topo, todos vermelhos)
  - Boca: larga com dentes (triangulos brancos)
  - Coroa torta de "rei dos monstros" (triangulos dourados no topo)
  - Aura: particulas escuras a volta dele (tween alpha em circulos)
  - Deve parecer intimidante mas ainda cartoon/engraçado (nao assustador)

- **Barra de vida especial:**
  - Posicao: topo do ecra, LARGA (toda a largura com margens)
  - Nome: "MONSTRO MASTER" acima da barra
  - Cor: roxo/vermelho
  - Visivel durante toda a luta

- **Fase 1 (HP 500-300): "Despertar"**
  - Move-se lentamente pelo patio
  - A cada 2 segundos: dispara 3 projecteis em leque (spread de 30 graus) — bolas de energia roxa
  - Projecteis: circulos roxos com trail, dano 15 HP, velocidade 200
  - Spawn de monstros suporte: 1 Gosma Verde a cada 8 segundos (max 3 no ecra)
  - Transicao para Fase 2: screenshake + flash + texto "O MONSTRO ESTA FURIOSO!"

- **Fase 2 (HP 300-100): "Furia"**
  - Mais rapido (speed x1.5)
  - A cada 1.5 segundos: dispara 5 projecteis em leque (spread de 45 graus)
  - Spawn de monstros: 1 Morcego a cada 6 segundos (max 5 no ecra)
  - Novo ataque a cada 5 segundos: slam — boss pisca vermelho, apos 1 segundo area circular de dano a volta dele (circulo vermelho semi-transparente expande e desaparece, dano 20 se jogador dentro)
  - Transicao para Fase 3: ecra escurece brevemente + texto "AGORA ACABA ISTO!"

- **Fase 3 (HP 100-0): "Desespero"**
  - Ainda mais rapido (speed x2)
  - Projecteis: padrao circular — 8 projecteis em todas as direcoes a cada 2 segundos
  - Slam a cada 4 segundos (area maior)
  - Monstros suporte: spawn mais rapido (1 a cada 4 segundos, mix de tipos, max 5)
  - Visual: corpo pulsa vermelho (tween tint), particulas mais intensas
  - Ao morrer: sequencia de morte epica

- **Sequencia de morte:**
  1. Boss congela, treme (shake tween)
  2. Flash branco no ecra
  3. Boss encolhe lentamente (tween scale para 0 com ease exponencial)
  4. Explosao GRANDE de particulas coloridas (todas as cores dos 4 personagens)
  5. Monstros suporte restantes morrem com animacoes
  6. Pausa dramatica (1 segundo)
  7. Transicao para VictoryScene

### 3. `src/scenes/VictoryScene.js`
- Background: patio da escola limpo (sem monstros), ceu azul brilhante
- As 4 personagens juntas ao centro (desenhadas com Graphics, lado a lado)
  - Cada uma com a sua cor tema
  - Animacao de celebracao: saltam (tween y) alternadamente
- Texto "ESCOLA SALVA!" enorme, bold, dourado com stroke, animacao bounce in
- Confetti: particulas coloridas caindo do topo (varias cores, tamanhos, velocidades, rotacao)
- Stats finais:
  - "Heroina: [nome da personagem]"
  - "Monstros derrotados: [total de todos os niveis]"
  - "Tempo total: [soma dos niveis]"
- Botao "JOGAR OUTRA VEZ" — volta ao SelectScene
- Musica/som de vitoria (se implementado, senao visual suficiente)
- Este ecra deve sentir-se ESPECIAL — e a recompensa de completar o jogo

### 4. Actualizar fluxo
- LevelCompleteScene apos Salas de Aula navega para BossScene
- BossScene NAO usa LevelCompleteScene — vai directo para VictoryScene ao vencer
- GameOver no BossScene: retry reinicia BossScene
- Registar BossScene e VictoryScene no main.js
- Manter acumulador de stats no registry (total monstros, tempo total)

## Restricoes tecnicas

- NAO modificar niveis anteriores (Cantina, Gym, Classroom)
- Monstros suporte devem reutilizar as classes existentes (GosmaVerde, Morcego)
- Boss projecteis: usar grupo separado do grupo de projecteis dos monstros normais (ou o mesmo, mas garantir colisao correcta)
- Slam attack: usar circulo semi-transparente com tween scale + timer para verificar overlap
- Confetti na VictoryScene: usar Phaser particle emitter
- Stats acumulados: somar com valores dos niveis anteriores guardados no registry
- Sequencia de morte do boss NAO deve ser skippable (e a recompensa cinematica)

## Criterios de sucesso (TODOS devem ser verdade)

1. Niveis 1, 2 e 3 continuam a funcionar sem alteracoes
2. Apos Salas de Aula, navega para BossScene (patio)
3. Patio e visualmente distinto (arvores, bancos, portao, espaco amplo)
4. Monstro Master aparece com visual intimidante mas cartoon
5. Barra de vida do boss e larga e visivel no topo
6. Fase 1: dispara 3 projecteis em leque, spawna gosmas
7. Fase 2: dispara 5 projecteis + slam attack com area visual
8. Fase 3: padrao circular 8 projecteis + slam mais frequente + spawn mais rapido
9. Transicoes entre fases tem feedback visual (texto, screenshake, flash)
10. Sequencia de morte e epica (shake, flash, encolhe, explosao, pausa)
11. VictoryScene mostra 4 personagens, confetti, stats finais
12. Botao "JOGAR OUTRA VEZ" funciona
13. GameOver com retry reinicia BossScene
14. Power-ups e especial funcionam durante a luta
15. Zero erros na consola do browser
16. Jogo jogavel do inicio ao fim: Menu → Seleccao → Cantina → Pavilhao → Salas → Boss → Vitoria

## Quando terminar

Verifica TODOS os criterios acima. Quando todos estiverem cumpridos, output:

<promise>FASE 6 COMPLETE</promise>
