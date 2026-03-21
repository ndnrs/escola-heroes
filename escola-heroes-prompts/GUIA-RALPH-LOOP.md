# Escola Heroes — Guia Ralph Loop

## 1. Setup inicial (uma vez)

```bash
cd ~/Dev/pessoal
mkdir escola-heroes
cd escola-heroes
git init
mkdir -p src/scenes src/entities src/ui src/systems assets/sprites assets/audio assets/maps
cp ~/Dev/pessoal/morfeus/escola-heroes/escola-heroes-prompts/GAME-DESIGN.md ./GAME-DESIGN.md
git add -A && git commit -m "initial setup"
```

---

## 2. Executar fase a fase

Abrir o Claude Code dentro da pasta `escola-heroes/` e executar cada fase.
Sessao NOVA do Claude Code para cada fase.

### Testar entre fases

```bash
npx serve .
# abre localhost:3000 no browser
```

---

### FASE 1 — Menu + Seleccao

```
/ralph-loop "Lê o ficheiro escola-heroes-prompts/GAME-DESIGN.md e depois lê ~/Dev/pessoal/escola-heroes/escola-heroes-prompts/PROMPT-FASE-1.md. Executa TUDO o que está descrito. Cria todos os ficheiros. Verifica todos os critérios de sucesso. Quando TODOS estiverem cumpridos, output <promise>FASE 1 COMPLETE</promise>" --completion-promise "FASE 1 COMPLETE" --max-iterations 20
```

Testar no browser. Se OK:
```bash
git add -A && git commit -m "fase 1: menu e seleccao personagem"
```

---

### FASE 2 — Mecanicas Core

```
/ralph-loop "Lê escola-heroes-prompts/GAME-DESIGN.md e ~/Dev/pessoal/escola-heroes/escola-heroes-prompts/PROMPT-FASE-2.md. Executa TUDO. NAO apagues código anterior. Verifica todos os critérios. Quando cumpridos, output <promise>FASE 2 COMPLETE</promise>" --completion-promise "FASE 2 COMPLETE" --max-iterations 25
```

Testar no browser. Se OK:
```bash
git add -A && git commit -m "fase 2: mecanicas core"
```

---

### FASE 3 — Nivel 1: Cantina

```
/ralph-loop "Lê escola-heroes-prompts/GAME-DESIGN.md e ~/Dev/pessoal/escola-heroes/escola-heroes-prompts/PROMPT-FASE-3.md. Executa TUDO. NAO apagues código anterior. Verifica todos os critérios. Quando cumpridos, output <promise>FASE 3 COMPLETE</promise>" --completion-promise "FASE 3 COMPLETE" --max-iterations 20
```

Testar no browser. Se OK:
```bash
git add -A && git commit -m "fase 3: nivel cantina"
```

---

### FASE 4 — Nivel 2: Pavilhao Desportivo

```
/ralph-loop "Lê escola-heroes-prompts/GAME-DESIGN.md e ~/Dev/pessoal/escola-heroes/escola-heroes-prompts/PROMPT-FASE-4.md. Executa TUDO. NAO apagues código anterior. Verifica todos os critérios. Quando cumpridos, output <promise>FASE 4 COMPLETE</promise>" --completion-promise "FASE 4 COMPLETE" --max-iterations 20
```

Testar no browser. Se OK:
```bash
git add -A && git commit -m "fase 4: nivel pavilhao desportivo"
```

---

### FASE 5 — Nivel 3: Salas de Aula

```
/ralph-loop "Lê escola-heroes-prompts/GAME-DESIGN.md e ~/Dev/pessoal/escola-heroes/escola-heroes-prompts/PROMPT-FASE-5.md. Executa TUDO. NAO apagues código anterior. Verifica todos os critérios. Quando cumpridos, output <promise>FASE 5 COMPLETE</promise>" --completion-promise "FASE 5 COMPLETE" --max-iterations 20
```

Testar no browser. Se OK:
```bash
git add -A && git commit -m "fase 5: nivel salas de aula"
```

---

### FASE 6 — Boss Final: Patio da Escola

```
/ralph-loop "Lê escola-heroes-prompts/GAME-DESIGN.md e ~/Dev/pessoal/escola-heroes/escola-heroes-prompts/PROMPT-FASE-6.md. Executa TUDO. NAO apagues código anterior. Verifica todos os critérios. Quando cumpridos, output <promise>FASE 6 COMPLETE</promise>" --completion-promise "FASE 6 COMPLETE" --max-iterations 20
```

Testar no browser. Se OK:
```bash
git add -A && git commit -m "fase 6: boss final e vitoria"
```

---

### FASE 7 — Polish Final

```
/ralph-loop "Lê escola-heroes-prompts/GAME-DESIGN.md e ~/Dev/pessoal/escola-heroes/escola-heroes-prompts/PROMPT-FASE-7.md. Executa TUDO. NAO apagues código anterior. Verifica todos os critérios. Quando cumpridos, output <promise>FASE 7 COMPLETE</promise>" --completion-promise "FASE 7 COMPLETE" --max-iterations 20
```

Testar no browser. Se OK:
```bash
git add -A && git commit -m "fase 7: polish final - jogo completo"
```

---

## 3. Resolucao de problemas

### Ralph atingiu max-iterations sem completar
```
/cancel-ralph
```
Testar o que ficou feito. Duas opcoes:
- Relançar o mesmo `/ralph-loop` (ele ve o trabalho anterior e continua)
- Corrigir manualmente e avancar para a proxima fase

### Algo ficou partido
Reverter ao ultimo commit:
```bash
git checkout .
```
Relancar a fase.

### Cancelar um Ralph activo
```
/cancel-ralph
```

---

## 4. Apos concluir tudo

Personalizar creditos (Fase 7 deixa placeholder "[NOME]"):
- Abrir os ficheiros e substituir `[NOME]` pelo nome da tua filha

Servir o jogo:
```bash
cd escola-heroes
npx serve .
```

Abrir no telemovel: usar o IP local (ex: `http://192.168.1.X:3000`)
