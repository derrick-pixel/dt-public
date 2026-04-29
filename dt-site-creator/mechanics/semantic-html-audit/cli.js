#!/usr/bin/env node
/**
 * semantic-html-audit — Node CLI
 *
 * Usage:
 *   node cli.js <path-to-html-file>            # one file → JSON on stdout
 *   node cli.js <dir>                          # walks dir, audits *.html
 *   node cli.js <path> --format=summary        # human-readable summary
 *
 * Returns JSON of: { file, score, violations, stats } per file.
 *
 * Pure-JS implementation (no DOM library) using lightweight regex-based parsing.
 * Good enough for shipping-fleet audit. For high-fidelity DOM audit, use the
 * browser snippet on the live page.
 */

const fs = require('fs');
const path = require('path');

function audit(html, file) {
  const violations = [];

  // ---- Heading hierarchy ------------------------------------------------
  const headingMatches = [...html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)];
  const headings = headingMatches.map(m => ({
    level: parseInt(m[1].substring(1), 10),
    text: m[2].replace(/<[^>]+>/g, '').trim()
  }));
  const h1Count = headings.filter(h => h.level === 1).length;
  if (h1Count === 0) violations.push({ id: 'seo-no-h1', severity: 'high', message: 'No <h1> on page' });
  else if (h1Count > 1) violations.push({ id: 'seo-multiple-h1', severity: 'high', message: `${h1Count} <h1> elements (should be exactly 1)`, count: h1Count });

  let prev = 0;
  for (const h of headings) {
    if (prev > 0 && h.level > prev + 1) {
      violations.push({ id: 'seo-heading-skip', severity: 'medium', message: `Heading skipped from h${prev} to h${h.level}`, near_text: h.text.slice(0, 60) });
    }
    prev = h.level;
  }

  // ---- Landmarks --------------------------------------------------------
  const has = tag => new RegExp(`<${tag}\\b`, 'i').test(html);
  const mainCount = (html.match(/<main\b/gi) || []).length;
  if (mainCount === 0) violations.push({ id: 'seo-no-main', severity: 'high', message: 'No <main> landmark' });
  else if (mainCount > 1) violations.push({ id: 'seo-multiple-main', severity: 'medium', message: `${mainCount} <main> landmarks` });
  if (!has('header')) violations.push({ id: 'seo-no-header', severity: 'low', message: 'No <header> landmark' });
  if (!has('footer')) violations.push({ id: 'seo-no-footer', severity: 'low', message: 'No <footer> landmark' });
  if (!has('nav'))    violations.push({ id: 'seo-no-nav',    severity: 'low', message: 'No <nav> landmark' });

  // ---- Images -----------------------------------------------------------
  const imgMatches = [...html.matchAll(/<img\b([^>]*)>/gi)];
  let noAlt = 0, noDim = 0;
  for (const m of imgMatches) {
    const attrs = m[1];
    if (!/\balt\s*=/i.test(attrs)) noAlt++;
    if (!/\bwidth\s*=/i.test(attrs) || !/\bheight\s*=/i.test(attrs)) noDim++;
  }
  if (noAlt > 0) violations.push({ id: 'seo-img-no-alt', severity: 'high', message: `${noAlt} <img> missing alt attribute`, count: noAlt });
  if (noDim > 0) violations.push({ id: 'seo-img-no-dimensions', severity: 'medium', message: `${noDim} <img> missing width/height (CLS risk)`, count: noDim });

  // ---- Lang attribute ---------------------------------------------------
  const htmlOpen = html.match(/<html\b([^>]*)>/i);
  if (!htmlOpen || !/\blang\s*=\s*["'][^"']+["']/i.test(htmlOpen[1] || '')) {
    violations.push({ id: 'seo-no-lang-attr', severity: 'medium', message: '<html> missing lang attribute' });
  }

  // ---- Title + meta description ----------------------------------------
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const titleText = titleMatch ? titleMatch[1].trim() : '';
  if (!titleText) {
    violations.push({ id: 'seo-no-title', severity: 'high', message: '<title> empty or missing' });
  } else if (titleText.length < 10 || titleText.length > 80) {
    violations.push({ id: 'seo-title-length', severity: 'low', message: `<title> length ${titleText.length} (target 30–70 chars)` });
  }
  const metaMatch = html.match(/<meta\b[^>]*name\s*=\s*["']description["'][^>]*>/i);
  let metaDescContent = '';
  if (metaMatch) {
    const c = metaMatch[0].match(/content\s*=\s*["']([^"']*)["']/i);
    metaDescContent = c ? c[1].trim() : '';
  }
  if (!metaDescContent) {
    violations.push({ id: 'seo-no-meta-description', severity: 'high', message: '<meta name="description"> empty or missing' });
  } else if (metaDescContent.length < 50 || metaDescContent.length > 200) {
    violations.push({ id: 'seo-meta-description-length', severity: 'low', message: `meta description length ${metaDescContent.length} (target 80–160 chars)` });
  }
  if (titleText && metaDescContent && titleText === metaDescContent) {
    violations.push({ id: 'seo-meta-description-duplicates-title', severity: 'medium', message: 'meta description identical to <title>' });
  }

  // ---- JSON-LD presence (cross-references schema-jsonld mechanic) ------
  const ldCount = (html.match(/type\s*=\s*["']application\/ld\+json["']/gi) || []).length;
  if (ldCount === 0) {
    violations.push({ id: 'seo-no-jsonld', severity: 'high', message: 'No JSON-LD structured data on page' });
  }

  // ---- Internal linking + anchor text ----------------------------------
  const anchorMatches = [...html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const internal = anchorMatches.filter(m => {
    const href = m[1];
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    if (/^https?:\/\//i.test(href)) return false; // external (no host context in CLI)
    return true;
  });
  if (internal.length < 3) {
    violations.push({ id: 'seo-no-internal-links', severity: 'low', message: `Only ${internal.length} internal link(s) (target ≥3)` });
  }
  const badAnchorPatterns = /^(click here|read more|learn more|here|more|link|this)$/i;
  const badAnchors = anchorMatches.filter(m => badAnchorPatterns.test(m[2].replace(/<[^>]+>/g, '').trim()));
  if (badAnchors.length > 0) {
    violations.push({ id: 'seo-bad-anchor-text', severity: 'low', message: `${badAnchors.length} non-descriptive anchor(s)`, count: badAnchors.length });
  }

  // ---- Content thinness -------------------------------------------------
  const mainSlice = html.match(/<main\b[\s\S]*?<\/main>/i);
  const bodyForCount = mainSlice ? mainSlice[0] : (html.match(/<body\b[\s\S]*?<\/body>/i) || [html])[0];
  const text = bodyForCount.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = text ? text.split(/\s+/).length : 0;
  if (wordCount < 100) {
    violations.push({ id: 'seo-thin-content', severity: 'medium', message: `<main>/<body> has ${wordCount} words (target ≥100; ≥300 ideal)` });
  }

  // ---- Stats + score ----------------------------------------------------
  const stats = {
    h1_count: h1Count,
    heading_count: headings.length,
    img_count: imgMatches.length,
    img_missing_alt: noAlt,
    img_missing_dimensions: noDim,
    internal_links: internal.length,
    external_or_anchor_links: anchorMatches.length - internal.length,
    bad_anchors: badAnchors.length,
    word_count: wordCount,
    jsonld_blocks: ldCount,
    has_main: mainCount > 0,
    has_header: has('header'),
    has_footer: has('footer'),
    has_nav: has('nav'),
    has_lang_attr: !!(htmlOpen && /\blang\s*=/i.test(htmlOpen[1] || '')),
    title_chars: titleText.length,
    meta_desc_chars: metaDescContent.length
  };
  const weights = { critical: 25, high: 12, medium: 6, low: 2 };
  const score = Math.max(0, 100 - violations.reduce((s, v) => s + (weights[v.severity] || 2), 0));

  return { file, score, violations, stats };
}

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (['node_modules', '.git', '.next', 'dist', 'build'].includes(name)) continue;
      out.push(...walk(p));
    } else if (name.endsWith('.html')) {
      out.push(p);
    }
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node cli.js <path-to-html-or-dir> [--format=summary]');
    process.exit(1);
  }
  const target = args[0];
  const format = (args.find(a => a.startsWith('--format=')) || '--format=json').split('=')[1];

  const stat = fs.statSync(target);
  const files = stat.isDirectory() ? walk(target) : [target];
  const reports = files.map(f => audit(fs.readFileSync(f, 'utf8'), f));

  if (format === 'summary') {
    for (const r of reports) {
      console.log(`\n=== ${r.file} ===`);
      console.log(`Score: ${r.score} · ${r.violations.length} violation(s)`);
      for (const v of r.violations) {
        console.log(`  [${v.severity}] ${v.id} — ${v.message}`);
      }
    }
    const avg = reports.reduce((s, r) => s + r.score, 0) / reports.length;
    console.log(`\nAverage score across ${reports.length} file(s): ${avg.toFixed(1)}`);
  } else {
    console.log(JSON.stringify(reports.length === 1 ? reports[0] : reports, null, 2));
  }
}

if (require.main === module) main();
module.exports = { audit, walk };
