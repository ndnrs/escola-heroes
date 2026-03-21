# Escola Heroes — Game Design Document

> Documento de referencia imutavel. TODAS as fases devem respeitar este documento.
> NAO modificar este ficheiro durante o desenvolvimento.

---

## Conceito

**Titulo:** Escola Heroes
**Genero:** Side-scroller / Shoot 'em up 2D
**Publico:** Criancas de 10 anos
**Plataforma:** Browser (desktop + mobile touch)
**Engine:** Phaser 3 (via CDN, sem build tools)
**Estilo Visual:** Cartoon colorido, personagens expressivas, monstros engraçados (nao assustadores)

---

## Historia

Monstros invadiram a escola! Quatro amigas — Matilde, Riana, Violeta e Leonor — sao as unicas que podem salvar a escola. O jogador escolhe uma heroina e avanca por 4 niveis, derrotando monstros em cada area da escola, ate enfrentar o Monstro Master no patio.

---

## Personagens Jogaveis

| Nome | Cor tema | Projectil | Especial |
|------|----------|-----------|----------|
| Matilde | Rosa (#FF69B4) | Estrelas rosa | Estrela gigante (area) |
| Riana | Azul (#4A90D9) | Bolhas de agua | Onda congelante (slow) |
| Violeta | Roxo (#9B59B6) | Raios magicos | Escudo violeta (invencibilidade 3s) |
| Leonor | Verde (#2ECC71) | Folhas magicas | Chuva de folhas (dano em area) |

### Stats base (iguais para todas)
- **HP:** 100
- **Velocidade:** 200 px/s
- **Cadencia tiro:** 1 projectil a cada 300ms
- **Dano projectil:** 10
- **Dano especial:** 30 (area)

---

## Niveis

### Nivel 1 — Cantina
- **Background:** Cantina da escola com mesas, tabuleiros, cozinha ao fundo
- **Monstros:** Gosma Verde (HP 30, lento), Morcego (HP 20, voa em zig-zag)
- **Quantidade:** 15 monstros em waves de 5
- **Boss mini:** Gosma Gigante (HP 150, dispara bolas de lodo)
- **Duracao estimada:** 2 minutos

### Nivel 2 — Pavilhao Desportivo
- **Background:** Ginasio com balizas, cestos de basquete, banco sueco
- **Monstros:** Aranha Saltitona (HP 25, salta), Fantasma (HP 40, aparece/desaparece)
- **Quantidade:** 20 monstros em waves de 5
- **Boss mini:** Polvo Desportista (HP 200, 4 tentaculos que atacam)
- **Duracao estimada:** 2.5 minutos

### Nivel 3 — Salas de Aula
- **Background:** Corredor com portas de salas, quadros, cacifos
- **Monstros:** Livro Voador (HP 35, dispara letras), Sombra (HP 45, rapido)
- **Quantidade:** 25 monstros em waves de 5
- **Boss mini:** Professor Zombie (HP 250, invoca monstros extra)
- **Duracao estimada:** 3 minutos

### Nivel 4 — Patio da Escola (Boss Final)
- **Background:** Patio amplo com arvores, bancos, portao da escola
- **Boss:** Monstro Master (HP 500)
  - Fase 1 (HP 500-300): dispara projecteis em leque (3 direcoes)
  - Fase 2 (HP 300-100): invoca monstros + projecteis mais rapidos
  - Fase 3 (HP 100-0): enraivecido — ataques mais rapidos, padrao circular
- **Monstros suporte:** Gosma Verde e Morcego (spawn continuo, max 5 no ecra)
- **Duracao estimada:** 3-4 minutos

---

## Mecanicas

### Movimento
- **Desktop:** WASD ou Arrow Keys
- **Mobile:** Joystick virtual (canto inferior esquerdo)
- **Direcao:** 8 direcoes (cima, baixo, esquerda, direita + diagonais)
- **Limites:** O jogador nao pode sair dos limites do ecra

### Combate
- **Tiro:** Automatico continuo na direcao do movimento (ou ultimo movimento)
- **Desktop:** Espaco para disparar (ou automatico com toggle)
- **Mobile:** Botao de tiro (canto inferior direito)
- **Projecteis:** Viajam em linha recta, desaparecem ao sair do ecra ou ao acertar
- **Colisao:** Projectil do jogador acerta monstro = dano. Monstro toca jogador = dano (10 HP). Projectil monstro acerta jogador = dano (15 HP)

### Barra de Vida
- **Posicao:** Topo do ecra, centrada
- **Visual:** Barra com gradiente verde→amarelo→vermelho conforme HP desce
- **HP jogador:** 100 (todas as personagens)
- **Game Over:** HP chega a 0 — opcao de retry do nivel ou voltar ao menu
- **Sem sistema de vidas** — retry ilimitado por nivel

### Power-ups (drops aleatorios ao matar monstros — 15% chance)

| Item | Icone | Efeito | Duracao |
|------|-------|--------|---------|
| Coracao | ❤ vermelho | Recupera 25 HP | Instantaneo |
| Escudo | Bolha azul brilhante | Invencibilidade | 5 segundos |
| Ataque Forte | Espada dourada | Dano x3 | 8 segundos |
| Velocidade | Bota alada | Velocidade x1.5 | 6 segundos |

- Power-ups flutuam no local onde o monstro morreu durante 5 segundos, depois desaparecem
- Feedback visual: brilho/pulsar no power-up
- Feedback ao apanhar: flash no jogador + som + texto "+25 HP" ou "ESCUDO!" etc.

### Ataque Especial
- **Carga:** Barra de especial enche ao matar monstros (precisa de 10 kills)
- **Activacao:** Desktop: tecla Q. Mobile: botao dedicado (acima do botao de tiro)
- **Visual:** Efeito unico por personagem (ver tabela de personagens)
- **Cooldown visual:** Barra esvazia e volta a encher com kills

---

## Interface (UI)

### Menu Principal
- Titulo "ESCOLA HEROES" em estilo cartoon bold
- Background: frente da escola com monstros a espreitar
- Botoes: "JOGAR", "COMO JOGAR"
- Musica de menu alegre

### Seleccao de Personagem
- 4 cards lado a lado (ou 2x2 em mobile)
- Cada card: imagem da personagem + nome + cor tema
- Hover/tap: card amplia ligeiramente + borda brilha
- Ao seleccionar: transicao para nivel 1

### HUD (em jogo)
- **Topo esquerda:** Avatar pequeno da personagem + nome
- **Topo centro:** Barra de HP (larga, visivel)
- **Topo direita:** Nivel actual ("CANTINA" etc.)
- **Baixo esquerda (mobile):** Joystick virtual
- **Baixo direita (mobile):** Botao tiro (grande) + Botao especial (menor, acima)
- **Baixo centro:** Barra de especial (carga)

### Transicoes entre niveis
- Ecra "NIVEL COMPLETO!" com estrelas
- Stats: monstros derrotados, HP restante, tempo
- Botao "PROXIMO NIVEL"
- HP restaurado a 100 entre niveis

### Game Over
- Texto "OH NAO!" com animacao
- Stats do nivel
- Botoes: "TENTAR OUTRA VEZ" (retry nivel), "MENU" (voltar ao inicio)

### Vitoria Final
- Animacao de celebracao: as 4 personagens juntas
- Texto "ESCOLA SALVA!" com confetti
- Botao "JOGAR OUTRA VEZ"

---

## Estilo Visual (CARTOON)

### Paleta de cores geral
- Backgrounds: cores pasteis vivas (nao escuro, nao assustador)
- Monstros: cores saturadas, expressoes engraçadas (nao assustadores)
- UI: bordas arredondadas, sombras suaves, fontes bold

### Personagens (quando sem sprites reais)
- Gerar personagens usando formas geometricas do Phaser (circulos, rectangulos)
- Cada personagem e um circulo (cabeca) + corpo rectangular + cor unica
- Olhos expressivos (2 circulos brancos + pupilas pretas)
- Cabelo representado por formas coloridas no topo

### Monstros (quando sem sprites reais)
- Formas geometricas com olhos e boca desenhados
- Gosma: circulo/elipse verde com olhos
- Morcego: triangulos (asas) + circulo (corpo) + olhos vermelhos
- Animacoes simples: bobbing (subir/descer), escala pulsante

### Efeitos visuais
- Particulas ao destruir monstro (explosao de circulos coloridos)
- Flash branco no jogador ao levar dano
- Trail/rasto nos projecteis
- Screenshake leve ao levar dano ou explosoes

---

## Audio (descricao para geracao ou placeholders)

| Som | Descricao |
|-----|-----------|
| Menu BGM | Melodia alegre, loop, 8-bit ou cartoon |
| Nivel BGM | Musica de accao leve, loop, por nivel |
| Boss BGM | Musica mais intensa, loop |
| Tiro | Pop/pew curto |
| Acerto monstro | Thud suave |
| Monstro morre | Pop comico + particulas |
| Jogador dano | Ouch suave |
| Power-up | Chime magico ascendente |
| Especial | Whoosh + impacto |
| Nivel completo | Fanfarra curta |
| Game over | Trombone triste (wah wah) |
| Vitoria final | Fanfarra completa + aplausos |

> NOTA: Audio pode ser implementado com Web Audio API simples (tons sintetizados) ou ficheiros placeholder. Nao bloquear o jogo por falta de audio.

---

## Estrutura de ficheiros

```
escola-heroes/
├── index.html                  # Entry point, carrega Phaser via CDN
├── assets/
│   ├── sprites/               # Sprites (ou gerados via codigo)
│   ├── audio/                 # Sons (ou sintetizados)
│   └── maps/                  # Backgrounds dos niveis
├── src/
│   ├── main.js                # Config Phaser, registo de scenes
│   ├── constants.js           # Todas as constantes do jogo (HP, velocidades, etc.)
│   ├── scenes/
│   │   ├── BootScene.js       # Preload assets
│   │   ├── MenuScene.js       # Menu principal
│   │   ├── HowToPlayScene.js  # Instrucoes
│   │   ├── SelectScene.js     # Seleccao personagem
│   │   ├── HUDScene.js        # Overlay UI (HP bar, especial bar, mobile controls)
│   │   ├── CantinScene.js     # Nivel 1
│   │   ├── GymScene.js        # Nivel 2
│   │   ├── ClassroomScene.js  # Nivel 3
│   │   ├── BossScene.js       # Nivel 4 (boss final)
│   │   ├── LevelCompleteScene.js
│   │   ├── GameOverScene.js
│   │   └── VictoryScene.js
│   ├── entities/
│   │   ├── Player.js          # Classe jogador
│   │   ├── Projectile.js      # Projecteis jogador
│   │   ├── Monster.js         # Classe base monstro
│   │   ├── MonsterTypes.js    # Configs dos tipos de monstro
│   │   ├── Boss.js            # Classe base boss
│   │   ├── BossTypes.js       # Configs dos bosses
│   │   └── PowerUp.js         # Power-ups
│   └── ui/
│       ├── HealthBar.js       # Barra de vida
│       ├── SpecialBar.js      # Barra de especial
│       ├── VirtualJoystick.js # Joystick mobile
│       └── MobileButtons.js   # Botoes mobile
└── README.md
```

---

## Regras tecnicas (Phaser 3)

1. **Carregar Phaser via CDN** no index.html: `<script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>`
2. **Todas as scenes** devem estender `Phaser.Scene`
3. **Fisica:** usar `arcade` (simples, performante, suficiente para este jogo)
4. **Grupos:** usar `this.physics.add.group()` para monstros e projecteis
5. **Colisoes:** `this.physics.add.overlap()` entre projecteis↔monstros, monstros↔jogador
6. **Mobile detection:** `this.sys.game.device.input.touch` para mostrar/esconder controlos mobile
7. **Responsive:** `scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }`
8. **Game dimensions:** 800x600 (aspect ratio 4:3, escala bem em mobile)
9. **NAO usar ES modules (import/export)** — usar scripts classicos com `<script>` tags ordenadas
10. **NAO usar npm/webpack/vite** — tudo via CDN e ficheiros locais
11. **NAO usar assets externos** — gerar TUDO via codigo Phaser (Graphics, formas geometricas, texto)
12. **Fontes:** usar fontes web-safe (Arial Bold, Impact) ou Google Fonts via CSS
