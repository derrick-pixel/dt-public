# copy-deck — Example usage

## Pattern: bind on page load

```html
<!DOCTYPE html>
<html>
<head>
  <title data-copy="global.site_title"></title>
</head>
<body>
  <nav>
    <strong data-copy="global.site_title"></strong>
  </nav>
  <main>
    <section class="hero">
      <h1 data-copy="pages.home.hero_headline"></h1>
      <p data-copy="pages.home.hero_subhead"></p>
      <div class="cta-row">
        <button data-copy="pages.home.hero_cta_primary"></button>
        <button data-copy="pages.home.hero_cta_secondary"></button>
      </div>
    </section>

    <section class="value-prop">
      <h2 data-copy="pages.home.sections.0.heading"></h2>
      <div data-copy-md="pages.home.sections.0.body"></div>
    </section>

    <section class="faq">
      <!-- FAQ rendered dynamically (see below) -->
      <div id="faq-list"></div>
    </section>
  </main>

  <div class="toast" data-copy="microcopy.toast_save_success"></div>

  <script type="module">
    import { bindCopy, loadCopy } from './assets/js/copy-deck.js';

    const copy = await loadCopy();
    bindCopy(document.body, copy);

    // FAQ list rendered dynamically
    const faqList = document.getElementById('faq-list');
    copy.faq.forEach((entry, i) => {
      const item = document.createElement('details');
      const q = document.createElement('summary');
      q.textContent = entry.q;
      const a = document.createElement('div');
      a.setAttribute('data-copy-md', `faq.${i}.a`);
      item.appendChild(q);
      item.appendChild(a);
      faqList.appendChild(item);
    });
    bindCopy(faqList, copy);  // re-bind to pick up the dynamic data-copy-md
  </script>
</body>
</html>
```

## Pattern: A/B testing via copy variants

```js
const variant = Math.random() < 0.5 ? 'a' : 'b';
const copy = await loadCopy(`/data/copy-${variant}.json`);
bindCopy(document.body, copy);
```

## Pattern: i18n

```js
const lang = navigator.language.startsWith('zh') ? 'zh' : 'en';
const copy = await loadCopy(`/data/copy-${lang}.json`);
bindCopy(document.body, copy);
```

## Sourced from

(new mechanic shipped with dt-site-creator v2 — 2026-04-28)
