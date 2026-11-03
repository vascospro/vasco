# vasco

Repositorio de trabajo de Jorge Urzúa para sus dos cuentas de Instagram.
Aquí están instaladas las skills `/ig-*` (en `.claude/skills/`).

## Dos cuentas, dos voces

| Cuenta | Quién habla | Carpeta |
| --- | --- | --- |
| Jorge Urzúa, periodista (personal) | Jorge, en primera persona ("yo") | `.claude/instagram/jorge/` |
| Vascospro, agencia de comunicaciones | La agencia ("nosotros") | `.claude/instagram/vascospro/` |

## Reglas para todas las skills `/ig-*`

1. **Antes de escribir, pregunta para qué cuenta es** si el pedido no lo dice.
   Nunca mezcles las dos voces en una misma pieza.
2. Las skills mencionan archivos en `~/.claude/instagram/`. En este repo, usa
   en su lugar la carpeta de la cuenta:
   - `~/.claude/instagram/voice.md` → `.claude/instagram/<cuenta>/voice.md`
   - `~/.claude/instagram/swipe.md` → `.claude/instagram/<cuenta>/swipe.md`
   - `~/.claude/instagram/log.md`   → `.claude/instagram/<cuenta>/log.md`
   El contenedor de la nube se borra entre sesiones; solo lo que está en el
   repo (y se hace commit) sobrevive.
3. **Idioma:** todo el contenido se escribe en español de Chile, salvo que
   Jorge pida otro idioma. Las herramientas `hookscore.py` y `beats.py` están
   calibradas para inglés: en español, úsalas solo como referencia y dilo.
4. **Nunca inventes** cifras, clientes, resultados ni citas. Si falta un dato,
   deja `{{dato}}` y márcalo.
5. Si `voice.md` de la cuenta todavía tiene campos `{{...}}` sin completar,
   avisa qué falta antes de escribir algo largo.
6. Nada se publica. Las skills escriben; Jorge publica.
