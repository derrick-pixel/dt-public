# Wizard Form

Multi-step form with progress bar, Next/Back navigation, and a configurable step schema.

## What it does
Renders a form as a sequence of steps. Each step has a title and fields. Fields can be `text`, `number`, `textarea`, `radio`, or `likert` (1-5 scale). Users navigate with Back / Next buttons; final step shows Submit. On submit, calls your `onSubmit(answers)` with all collected values.

Built via safe DOM APIs (`createElement` / `textContent` / `addEventListener`) — no innerHTML interpolation.

## When to plug in
- **Transactional** (core): multi-step checkout, donation flows.
- **Simulator / Educational** (core): quiz engines, diagnostics, calculators.
- **Game** (core): character creation / onboarding flows.

## Trade-offs
- **Pro:** Zero deps. Declarative step schema makes it easy to rearrange.
- **Pro:** State is just a JS object — easy to persist via localstorage-state mechanic.
- **Con:** Validation is caller's responsibility (no required-field handling out of the box).
- **Con:** No conditional branching (if you answer X, skip step Y) — add that as a v2 extension.

## How to use (3 steps)

1. Drop `<div id="wizard-form-root"></div>` where you want the form.
2. Drop the snippet.
3. Call:
   ```javascript
   renderWizardForm({
     steps: [ /* your schema */ ],
     onSubmit: (answers) => {
       // Handle the collected answers
     }
   });
   ```

## Step schema

```javascript
[
  {
    title: 'About you',
    fields: [
      { id: 'name', type: 'text', label: 'Your name' },
      { id: 'email', type: 'text', label: 'Email' }
    ]
  },
  {
    title: 'Preferences',
    fields: [
      { id: 'plan', type: 'radio', label: 'Plan?', options: ['Free', 'Pro', 'Enterprise'] }
    ]
  }
]
```

## Sourced from
`wsg_jrplus/diagnostic.html` (radar-chart wizard), `ELIX-resume/editor.js` (section wizard), `studioelitez_quotation_preparer` (upload → extraction → export wizard).
