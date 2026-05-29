---
name: ref-obsidian-vault
description: El directorio del repo Trading es también el vault de Obsidian del usuario — la memoria se lee desde Obsidian
metadata:
  type: reference
---

El directorio `C:\Users\inaki\Claude Code\Trading\Claude\` cumple dos funciones:
1. Repo git del sistema Pulse (lo que está documentado en [[project-pulse-overview]] y [[ref-supabase]]).
2. **Vault de Obsidian** del usuario.

**Implicaciones operativas:**

- La carpeta `.obsidian/` (config local de Obsidian) aparece persistente como untracked en `git status`. Es **intencional**, no es ruido a limpiar ni a commitear. No proponer borrarla, moverla o ignorarla sin preguntar.
- Los archivos de este directorio `.claude/memory/` **se renderizan en Obsidian** — el usuario los lee como notas. La sintaxis `[[name]]` actúa como wikilink navegable allí.
- Eso eleva el listón de calidad de la memoria: títulos claros, enlaces internos correctos, formato markdown bien estructurado, **frontmatter consistente** (Obsidian usa el campo `description` para preview). Evitar sintaxis exclusiva de algún renderer ajeno a Obsidian.
- Al crear nuevos memos, usar `[[slug]]` para enlazar con memos relacionados — no es decorativo, el usuario navega esas conexiones.

**Why:** confirmado el 2026-05-28 — el usuario dijo "esa [carpeta de memoria] es la que estoy usando para obsidian" al pedir actualizar memoria.

**How to apply:** cuando el usuario nombre `.obsidian/` o files con extensiones Obsidian (`.canvas`, `.excalidraw.md`), tratarlos como contenido de usuario, no como artefactos de proyecto. Al escribir/editar memoria, optimizar para lectura humana en Obsidian (no solo para futuro-Claude).
