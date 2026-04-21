# DT Site Creator — Router

This file used to contain the full static-site playbook. It has been refactored into 5 archetype-specific playbooks in `archetypes/`.

## If you are Claude and you are starting a new project

1. Read [`archetypes/README.md`](./archetypes/README.md) for the decision matrix.
2. Pick the archetype that matches the user's project.
3. Read that archetype's 5-file contract: `CLAUDE.md`, `prompt.md`, `examples.md`, `mechanic-fit.md`, `pitfalls.md`.
4. Build per those rules.

## If you are a human

Open [`index.html`](./index.html) locally (after running `python3 -m http.server 8000`) or visit the live dashboard at **https://derrick-pixel.github.io/dt-site-creator/**.

## Backward compatibility

Previous *"use dt-site-creator for static site"* prompts still work — they route to [`archetypes/static-informational/CLAUDE.md`](./archetypes/static-informational/CLAUDE.md), which contains the full original playbook content (migrated verbatim).
