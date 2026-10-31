/* ===========================================================================
 * proof-band.js  ->  /proof-band.js
 * Added 2026-10-31.
 *
 * Fills the homepage "Operators already running their book on Avolv" band from
 * the live stories feed. Shane picks who shows here with the "Feature on
 * homepage" toggle on each reference in the app; nothing here is hand-coded.
 *
 * The static cards in index.html stay as the fallback: if the feed is slow,
 * empty, or down, they remain, so the homepage is never blank and search
 * engines always see real content. Once the feed returns featured customers,
 * their cards replace the fallback.
 * ========================================================================= */
(function () {
  var FEED = 'https://api.avolv.ai/api/public/stories';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function personLine(t) {
    var title = t.title || 'Owner';
    var loc = t.cardLocation || t.vertical || '';
    return esc(title) + (t.company ? ', ' + esc(t.company) : '') + (loc ? ' &middot; ' + esc(loc) : '');
  }

  function card(t) {
    var parts = [];
    parts.push('<div class="proof-card">');
    parts.push('<div class="proof-person"><div><div class="pn">' + esc(t.name || t.company || '') + '</div>');
    parts.push('<div class="pr">' + personLine(t) + '</div></div></div>');
    if (t.cardQuote) parts.push('<p class="proof-quote">"' + esc(t.cardQuote) + '"</p>');
    var metrics = Array.isArray(t.cardMetrics) ? t.cardMetrics.filter(Boolean) : [];
    if (metrics.length) {
      parts.push('<div class="proof-metrics">');
      metrics.forEach(function (m) { parts.push('<span class="proof-metric">' + esc(m) + '</span>'); });
      parts.push('</div>');
    }
    if (t.cardSource) parts.push('<div class="proof-source">' + esc(t.cardSource) + '</div>');
    if (t.storyUrl) {
      parts.push('<a class="proof-link" href="' + esc(t.storyUrl) + '">Read the story <i data-lucide="arrow-right" style="width:16px;height:16px"></i></a>');
    }
    parts.push('</div>');
    return parts.join('');
  }

  function render(featured) {
    var wrap = document.getElementById('proof-cards');
    if (!wrap) return;
    wrap.innerHTML = featured.map(card).join('');
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
