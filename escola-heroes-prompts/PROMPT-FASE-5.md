# FASE 5 — Nivel 3: Salas de Aula

> Le GAME-DESIGN.md PRIMEIRO. Esse documento e a fonte de verdade para todo o jogo.
> NAO apagar ou reescrever codigo das fases anteriores. Construir em cima do existente.

## Objectivo

Criar o terceiro nivel — Salas de Aula (corredor) — com monstros mais desafiantes e mini-boss que invoca reforcos.

## Contexto

Fases anteriores criaram: niveis 1 (Cantina) e 2 (Pavilhao) completos, todos os sistemas de jogo funcionais. 4 tipos de monstro implementados.

## O que CRIAR nesta fase

### 1. `src/scenes/ClassroomScene.js`
- Background: corredor de escola desenhado com Graphics
  - Chao: rectangulo cinza claro (ladrilhos — linhas grid subtis)
  - Paredes: creme/bege com rodape castanho
  - Portas: 4-5 rectangulos castanhos com macanetas (circulos dourados), espacados ao longo do corredor
  - Janelas nas portas: pequenos rectangulos azul claro
  - Cacifos: serie de rectangulos azuis/verdes/vermelhos ao longo de uma parede
  - Quadros de avisos: rectangulos com "papeis" coloridos (pequenos rectangulos)
  - Relogio na parede: circulo com ponteiros
  - Placas de sala: "SALA 1", "SALA 2" acima das portas
- Criar jogador com HP 100
- Lancar HUDScene com nome "SALAS DE AULA"
- Waves (25 monstros total):
  - Wave 1: 5 Livros Voadores (entram pelas portas — aparecem nas posicoes das portas)
  - Wave 2: 3 Livros + 2 Sombras (entram por todos os lados)
  - Wave 3: 5 Sombras (rapidas, entram por todos os lados)
  - Wave 4: 3 Livros + 2 Sombras + 2 Gosmas (mix — mostrar que monstros anteriores voltam)
  - Wave 5: 5 misto (1 de cada tipo visto ate agora) — wave de preparacao para boss
- Mini-boss: Professor Zombie
  - HP 250, forma humanoide (rectangulo corpo verde palido + circulo cabeca + bracos)
  - Visual: gravata torta, oculos partidos (meio circulo), expressao zombie
  - Comportamento fase 1 (HP 250-150): move-se lentamente, dispara giz (projecteis brancos) em direcao ao jogador a cada 2s
  - Comportamento fase 2 (HP 150-0): mais rapido, dispara giz E invoca 1 Livro Voador a cada 5 segundos (max 3 invocados ao mesmo tempo)
  - Invocacao: animacao de "chamar" (bracos levantam) + monstro aparece numa porta
  - Barra de vida propria
  - Ao morrer: desmorona (parts caem — tween), monstros invocados morrem tambem

### 2. Novos monstros (adicionar aos existentes)
- **LivroVoador**:
  - Visual: rectangulo castanho (capa) ligeiramente aberto (2 rectangulos em V), paginas brancas visiveis, olhos zangados na capa
  - Comportamento: voa em direcao ao jogador (velocidade media), a cada 2.5 segundos dispara uma "letra" (texto "A", "B", "Z" — projectil texto) em direcao ao jogador
  - Projectil letra: texto pequeno bold que se move como projectil, dano 15 HP
  - Dano corpo: 10 HP
- **Sombra**:
  - Visual: forma escura (preto/cinza muito escuro, alpha 0.8), contorno irregular (pode ser circulo com noise visual), olhos brancos brilhantes
  - Comportamento: RAPIDO (speed 150), move-se em direcao ao jogador mas muda direcao abruptamente a cada 1.5 segundos (angulo aleatorio dentro de 45 graus da direcao ao jogador)
  - Dano ao tocar: 10 HP
  - Mais dificil de acertar por ser rapida e mudar direcao

### 3. Actualizar fluxo
- LevelCompleteScene apos Pavilhao agora navega para ClassroomScene
- ClassroomScene ao completar → LevelCompleteScene → proximo nivel (Boss Final)
- Registar ClassroomScene no main.js

## Restricoes tecnicas

- NAO modificar scenes anteriores (Cantina, Gym) — devem continuar a funcionar
- REUTILIZAR WaveManager com novos configs
- Projecteis dos monstros (giz, letras) devem usar o mesmo sistema de colisao que os do jogador
- Monstros invocados pelo Professor Zombie devem ser adicionados ao grupo existente de monstros
- Limite de monstros invocados: max 3 ao mesmo tempo (verificar grupo antes de invocar)

## Criterios de sucesso (TODOS devem ser verdade)

1. Niveis 1 e 2 continuam a funcionar sem alteracoes
2. Apos Pavilhao, botao "PROXIMO NIVEL" leva as Salas de Aula
3. Background do corredor e reconhecivel (portas, cacifos, quadros)
4. Livros Voadores voam e disparam letras como projecteis
5. Sombras sao rapidas e mudam direcao (dificeis de acertar)
6. 5 waves funcionam com mix de monstros
7. Professor Zombie aparece com visual zombie comico
8. Fase 1 boss: dispara giz em direcao ao jogador
9. Fase 2 boss: invoca Livros Voadores pelas portas (max 3)
10. Boss morre com animacao de desmoronamento + invocados morrem
11. LevelCompleteScene com stats correctos
12. Retry e menu funcionam
13. Power-ups e especial funcionam
14. Zero erros na consola do browser
15. Fluxo completo: Menu → Cantina → Pavilhao → Salas de Aula jogavel

## Quando terminar

Verifica TODOS os criterios acima. Quando todos estiverem cumpridos, output:

<promise>FASE 5 COMPLETE</promise>
