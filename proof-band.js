/* ===========================================================================
 * proof-band.js  ->  /proof-band.js
 * Added 2026-10-31. Redesigned to the navy, photo-led layout 2026-10-31.
 *
 * Fills the homepage "Operators already running their book on Avolv" band from
 * the live stories feed. Shane picks who shows here with the "Feature on
 * homepage" toggle in the app, and uploads each one's story photo there too.
 *
 * When there are featured customers, this turns the band navy and renders one
 * story per row: photo on one side, and on the other an eyebrow, headline,
 * description, metric chips, a quote box with attribution, and a link to the
 * full case study. Rows alternate the photo side.
 *
 * The static cards in index.html stay as the fallback: if the feed is slow,
 * empty, or down, they remain, so the homepage is never blank and search
 * engines always see real content.
 * ========================================================================= */
(function () {
  var FEED = 'https://api.avolv.ai/api/public/stories';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function attribution(t) {
    var bits = [t.name, t.title, t.company].filter(Boolean).map(esc);
    return bits.length ? '&mdash; ' + bits.join(', ') : '';
  }

  // Point case-study links at the query form (case-study.html?c=slug), which
  // works with no server rewrite. A clean /case-studies/<slug> path only works
  // once the Render rewrite is set on the avolv.ai site; this avoids depending
  // on it. Non case-study links (an override like /cleaning.html) pass through.
  function storyHref(url) {
    if (!url) return '';
    var m = /^\/case-studies\/(.+?)\/?$/.exec(url);
    return m ? '/case-study.html?c=' + encodeURIComponent(m[1]) : url;
  }

  function row(t, i) {
    var hasImg = !!t.cardImageUrl;
    var rev = i % 2 === 1; // alternate the photo side
    var parts = [];
    // With a photo: two columns, alternating side. Without one: a single
    // centered column so the card is never squeezed into an empty image slot.
    var cls = hasImg ? ('op-row' + (rev ? ' rev' : '')) : 'op-row solo';
    parts.push('<div class="' + cls + '">');
    if (hasImg) {
      parts.push('<div class="op-media"><img src="' + esc(t.cardImageUrl) + '" alt="' + esc(t.company || t.name || 'Customer') + '" loading="lazy"></div>');
    }
    parts.push('<div class="op-content' + (hasImg ? '' : ' full') + '">');
    var eyebrow = t.vertical || 'Customer Success';
    parts.push('<span class="op-eyebrow">' + esc(eyebrow) + '</span>');
    parts.push('<h3 class="op-headline">' + esc(t.cardHeadline || t.company || t.name || '') + '</h3>');
    if (t.cardDescription) parts.push('<p class="op-desc">' + esc(t.cardDescription) + '</p>');
    var metrics = Array.isArray(t.cardMetrics) ? t.cardMetrics.filter(Boolean) : [];
    if (metrics.length) {
      parts.push('<div class="op-metrics">');
      metrics.forEach(function (m) { parts.push('<span class="op-metric">' + esc(m) + '</span>'); });
      parts.push('</div>');
    }
    if (t.cardQuote) {
      parts.push('<div class="op-quote"><p>"' + esc(t.cardQuote) + '"</p>');
      var attr = attribution(t);
      if (attr) parts.push('<div class="op-attr">' + attr + '</div>');
      parts.push('</div>');
    }
    if (t.cardSource) parts.push('<div class="op-source">' + esc(t.cardSource) + '</div>');
    if (t.storyUrl) {
      parts.push('<a class="op-link" href="' + esc(storyHref(t.storyUrl)) + '">Read the story <i data-lucide="arrow-right" style="width:16px;height:16px"></i></a>');
    }
    parts.push('</div>');
    parts.push('</div>');
    return parts.join('');
  }

  function render(featured) {
    var wrap = document.getElementById('proof-cards');
    if (!wrap) return;
    var band = document.getElementById('proof-band');
    if (band) band.classList.add('op-navy');
    wrap.className = 'op-stack';
    wrap.innerHTML = featured.map(row).join('');
    var sub = document.getElementById('proof-sub');
    if (sub) sub.textContent = 'The companies Avolv runs today, and what changed after they switched.';
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  fetch(FEED, { headers: { Accept: 'application/json' } })
    .then(function (r) { if (!r.ok) throw new Error('feed ' + r.status); return r.json(); })
    .then(function (data) {
      var written = Array.isArray(data.testimonials) ? data.testimonials : [];
      var featured = written.filter(function (t) { return t && t.homepageFeatured; });
      // Only take over the band when there is something to show. Otherwise the
      // static fallback in the HTML stays exactly as it is.
      if (featured.length) render(featured);
    })
    .catch(function () { /* keep the static fallback */ });
})();
