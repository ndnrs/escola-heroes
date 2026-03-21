# Como usar estes prompts com Ralph Loop

## Setup inicial

1. Criar a pasta do projecto e inicializar git:
```bash
mkdir escola-heroes
cd escola-heroes
git init
```

2. Copiar `GAME-DESIGN.md` para a raiz do projecto:
```bash
cp /caminho/para/escola-heroes-prompts/GAME-DESIGN.md ./GAME-DESIGN.md
```

3. Criar a estrutura de pastas:
```bash
mkdir -p src/scenes src/entities src/ui src/systems assets/sprites assets/audio assets/maps
```

## Executar cada fase

Para cada fase (1 a 7), copiar o prompt correspondente e executar o Ralph Loop:

### Fase 1
```bash
cp /caminho/para/escola-heroes-prompts/PROMPT-FASE-1.md ./PROMPT.md
/ralph-loop "$(cat PROMPT.md)" --completion-promise "FASE 1 COMPLETE" --max-iterations 20
```

### Fase 2
```bash
cp /caminho/para/escola-heroes-prompts/PROMPT-FASE-2.md ./PROMPT.md
/ralph-loop "$(cat PROMPT.md)" --completion-promise "FASE 2 COMPLETE" --max-iterations 25
```

### Fase 3
```bash
cp /caminho/para/escola-heroes-prompts/PROMPT-FASE-3.md ./PROMPT.md
/ralph-loop "$(cat PROMPT.md)" --completion-promise "FASE 3 COMPLETE" --max-iterations 20
```

### Fase 4
```bash
cp /caminho/para/escola-heroes-prompts/PROMPT-FASE-4.md ./PROMPT.md
/ralph-loop "$(cat PROMPT.md)" --completion-promise "FASE 4 COMPLETE" --max-iterations 20
```

### Fase 5
```bash
cp /caminho/para/escola-heroes-prompts/PROMPT-FASE-5.md ./PROMPT.md
/ralph-loop "$(cat PROMPT.md)" --completion-promise "FASE 5 COMPLETE" --max-iterations 20
```

### Fase 6
```bash
cp /caminho/para/escola-heroes-prompts/PROMPT-FASE-6.md ./PROMPT.md
/ralph-loop "$(cat PROMPT.md)" --completion-promise "FASE 6 COMPLETE" --max-iterations 20
```

### Fase 7 (Polish)
```bash
cp /caminho/para/escola-heroes-prompts/PROMPT-FASE-7.md ./PROMPT.md
/ralph-loop "$(cat PROMPT.md)" --completion-promise "FASE 7 COMPLETE" --max-iterations 20
```

## Dicas

- **Commit entre fases**: faz `git add -A && git commit -m "Fase X completa"` apos cada fase
- **Testar entre fases**: abre `index.html` no browser e verifica que tudo funciona
- **Se uma fase falhar**: cancela com `/cancel-ralph`, reverte com `git checkout .`, e tenta outra vez
- **Ajustar iteracoes**: se 20 nao chegar, aumenta para 30
- **Personalizar**: edita GAME-DESIGN.md antes de comecar para mudar nomes, cores, mecanicas

## Testar o jogo

Apos cada fase, basta abrir `index.html` no browser:
```bash
# Opcao 1: abrir directamente
open index.html

# Opcao 2: servidor local (melhor para debug)
npx serve .
# ou
python3 -m http.server 8000
```

## Personalizar creditos

Na Fase 7, o jogo tera um placeholder "[NOME]" nos creditos. Edita para colocar o nome da tua filha.
