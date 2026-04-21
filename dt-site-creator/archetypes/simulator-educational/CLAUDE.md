# Simulator / Educational Archetype Playbook (v1 thin)

Interactive learning tools, scenario engines, calculators, quiz engines. Examples: market_tracker, dtws_works, ELIX-resume.

## Inherits from
`archetypes/static-informational/CLAUDE.md` — style, layout applies.

## Additional v1 rules

1. **State persistence is mandatory.** Quiz progress, editor drafts, scenario state — all must survive tab close.
2. **Reset buttons everywhere.** Every scenario / simulation / calculator has a visible "Reset" that clears state cleanly.
3. **API rate limits must be handled.** If you hit yfinance / OpenAI / any external API, add a guest rate-limiter (session-scoped call count).
4. **PDFs break.** If generating PDFs client-side (jsPDF), test multi-page reports explicitly. Always test with >1 page of content.
5. **Streamlit / Plotly sites:** Python-based simulators are allowed here as a secondary track. Document deployment (Streamlit Cloud) separately.

## Deferred to v2
- State-machine patterns for complex scenario engines
- Quiz engine library
- Report-generator conventions
