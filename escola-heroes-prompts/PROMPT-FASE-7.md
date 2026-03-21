# FASE 7 — Polish: Audio, Efeitos, UI Final, Balanceamento

> Le GAME-DESIGN.md PRIMEIRO. Esse documento e a fonte de verdade para todo o jogo.
> NAO apagar ou reescrever codigo das fases anteriores. Melhorar o existente.

## Objectivo

Polish final do jogo: adicionar audio sintetizado, melhorar efeitos visuais, polir UI, e balancear dificuldade. O jogo deve sentir-se completo e divertido.

## Contexto

Fases 1-6 criaram o jogo completo: 4 niveis, boss final, vitoria, todas as mecanicas. O jogo e jogavel do inicio ao fim. Esta fase e sobre QUALIDADE, nao novas features.

## O que FAZER nesta fase

### 1. Audio sintetizado (Web Audio API)
Criar `src/systems/AudioManager.js`:
- Usar Web Audio API para gerar sons sintetizados (sem ficheiros audio externos)
- Iniciar AudioContext no primeiro clique/tap do utilizador (politica de browsers)
- Sons a implementar:

| Som | Implementacao |
|-----|---------------|
| Tiro jogador | Onda quadrada curta (50ms), pitch alto, decay rapido |
| Acerto monstro | Ruido branco curto (30ms) + tom grave |
| Monstro morre | Tom descendente (200ms) + ruido burst |
| Jogador dano | Tom grave curto (100ms) + vibrato |
| Power-up apanhado | Arpejo ascendente (3 notas, 300ms total) |
| Ataque especial | Sweep ascendente (500ms) + burst |
| Boss dano | Tom grave longo (150ms) + distorcao |
| Boss muda fase | Sweep descendente dramatico (1s) |
| Boss morre | Sequencia: tom grave longo → silencio → burst de notas |
| Nivel completo | Arpejo maior (Do-Mi-Sol-Do, 500ms) |
| Game over | Arpejo menor descendente (Sol-Mi-Do, 800ms) |
| Botao menu click | Click suave (onda seno 10ms) |

- Volume control: volume geral ajustavel
- Metodo `play(soundName)` simples para usar em qualquer scene
- Nao bloquear gameplay se audio falhar

### 2. Musica de fundo (SIMPLES)
- Menu: loop simples de 4 acordes (onda seno com envelope suave, 8 compassos)
- Niveis: loop percussivo simples (kick + hihat sintetizados, ritmo regular)
- Boss: mesmo loop mas mais rapido + tom menor
- Vitoria: fanfarra sintetizada (acordes maiores)
- Volume da musica mais baixo que efeitos sonoros
- Transicoes: fade out ao mudar de scene

### 3. Melhorias visuais

#### Particulas melhoradas
- Morte de monstro: mais particulas, cores variadas, physics (gravidade nas particulas)
- Power-up pickup: burst radial de particulas da cor do power-up
- Tiro do jogador: trail subtil (pequenas particulas atras do projectil)
- Especial: particulas exuberantes da cor da personagem
- Boss: particulas constantes a volta dele (aura ameaçadora)

#### Screen effects
- Screenshake: ao levar dano (leve), ao boss mudar fase (forte), ao boss morrer (muito forte)
- Flash: branco rapido ao levar dano, vermelho ao morrer monstro grande
- Slow-mo: 300ms de slow motion ao matar mini-boss/boss (time scale 0.3)
- Vignette: escurecimento dos cantos quando HP < 30% (rectangulos pretos semi-transparentes nos cantos)

#### Animacoes de personagem
- Idle: bobbing subtil (tween y, +-3px, loop)
- Mover: tilt na direcao do movimento (tween angle, +-10 graus)
- Dano: flash branco + shake pequeno
- Morte (game over): cair para o lado (tween angle 90 + alpha 0)

### 4. UI Polish

#### Menu
- Adicionar versao do jogo no canto ("v1.0")
- Adicionar creditos discretos no fundo ("Feito com ❤ para [nome]")
  - NOTA: O utilizador deve personalizar o nome — colocar placeholder "[NOME]"
- Transicoes entre scenes: fade (camera fadeIn/fadeOut)

#### HUD
- HP bar: adicionar icone de coracao antes
- Nome da personagem: com cor tema
- Indicador de wave actual ("Wave 2/3") durante o nivel
- Indicador de poder activo (escudo/dano/velocidade) com timer visual

#### Ecras de transicao
- LevelCompleteScene: animacao de estrelas mais elaborada (rotacao + brilho)
- GameOverScene: background mais dramatico
- VictoryScene: confetti mais variado (estrelas, circulos, quadrados)

### 5. Balanceamento de dificuldade
Rever e ajustar se necessario (valores em constants.js):

| Parametro | Valor sugerido | Nota |
|-----------|---------------|------|
| Player HP | 100 | Manter |
| Projecto dano | 10 | Manter |
| Fire rate | 300ms | Testar se e confortavel |
| Gosma HP | 30 | OK para nivel 1 |
| Morcego HP | 20 | Rapido mas fragil |
| Mini-boss 1 HP | 150 | Rapido para nao frustrar |
| Mini-boss 2 HP | 200 | Medio |
| Mini-boss 3 HP | 250 | Mais challenge |
| Boss final HP | 500 | Epico mas nao impossivel |
| Power-up drop % | 15% | Testar — aumentar para 20% se muito dificil |
| Heal amount | 25 HP | Testar — ajustar se necessario |
| Shield duration | 5s | OK |
| Damage boost duration | 8s | OK |

- O jogo deve ser desafiante mas NAO frustrante para criancas de 10 anos
- Power-ups devem aparecer com frequencia suficiente para manter o jogador vivo
- Se necessario, ajustar: mais HP no heal, mais drop chance, menos HP nos bosses

### 6. Mobile optimization
- Testar joystick: responsivo, sem delay
- Testar botoes: tamanho adequado para dedos (min 44x44 pontos)
- Testar layout: nada cortado em aspect ratios diferentes
- Adicionar instrucao "Toca para comecar" no BootScene (necessario para iniciar AudioContext)
- Verificar performance: 60fps em mobile (reduzir particulas se necessario)

### 7. Bug sweep
- Jogar o jogo completo 3 vezes (mentalmente verificar o fluxo)
- Verificar: nao ha memory leaks (grupos limpos ao sair de scenes)
- Verificar: scene transitions limpam listeners e timers
- Verificar: retry funciona em todos os niveis sem estado residual
- Verificar: "JOGAR OUTRA VEZ" na vitoria reinicia tudo cleanly

## Restricoes tecnicas

- NAO adicionar novas features de gameplay — apenas polish
- NAO mudar mecanicas core — apenas balancear numeros
- Audio DEVE ser sintetizado (Web Audio API) — sem ficheiros .mp3/.wav/.ogg
- Particulas devem ter limite maximo (nao spawnar infinitas)
- Scenes devem chamar `this.sound?.stopAll()` ou equivalente ao sair
- Manter compatibilidade desktop + mobile
- Tudo deve funcionar sem audio (fallback silencioso se AudioContext falhar)

## Criterios de sucesso (TODOS devem ser verdade)

1. Jogo completo jogavel do inicio ao fim sem bugs
2. Sons sintetizados tocam em: tiro, acerto, morte monstro, dano jogador, power-up, especial, boss
3. Musica de fundo toca no menu e durante niveis (pode ser simples)
4. Transicoes entre scenes tem fade
5. Particulas melhoradas visiveis em mortes, power-ups, especial, boss
6. Screenshake funciona ao levar dano e em momentos dramaticos
7. HUD mostra wave actual e indicador de poder activo
8. Creditos/versao visiveis no menu
9. Mobile: joystick e botoes respondem correctamente, tamanho adequado
10. "Toca para comecar" no inicio (para activar audio em mobile)
11. Performance: sem drops visiveis de FPS (testar com DevTools)
12. Retry e "Jogar outra vez" funcionam sem estado residual
13. Game over em qualquer nivel funciona correctamente
14. Zero erros na consola do browser
15. O jogo sente-se DIVERTIDO e completo para uma crianca de 10 anos

## Quando terminar

Verifica TODOS os criterios acima. Quando todos estiverem cumpridos, output:

<promise>FASE 7 COMPLETE</promise>
