/* ===========================================================================
 * site-videos.js  ->  /site-videos.js
 * Added 2026-11-05. Generalized to the content system 2026-11-19.
 *
 * Fills the website's content zones from the app. In Grow Avolv > Website
 * content, Shane adds blocks (video, image, story, or article) to a zone on a
 * page, orders them, and publishes. This script reads the published blocks and
 * renders each one, in order, into its zone.
 *
 * A zone is any element with data-avolv-zone="<slot>" (new) or
 * data-avolv-video="<slot>" (the original attribute, still honored). It starts
 * hidden (inline display:none) so there is no empty gap before the feed loads;
 * this script reveals and fills only the zones that have published blocks. A
 * wrapper marked data-avolv-video-section is revealed only when something inside
 * it filled, so an empty section never shows.
 *
 * Graceful failure: if the feed is slow or down, the zones simply stay hidden
 * and the page is unaffected.
 * ========================================================================= */
(function () {
  var FEED = 'https://api.avolv.ai/api/public/site-videos';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function injectStyles() {
    if (document.getElementById('av-video-styles')) return;
    var css = [
      '.av-block{max-width:1100px;margin:48px auto;padding:0 24px}',
      // Video
      '.av-vid-row{display:grid;grid-template-columns:1.05fr .95fr;gap:40px;align-items:center}',
      '.av-vid-row.rev .av-vid-media{order:2}',
      '.av-vid-media{position:relative;border-radius:16px;overflow:hidden;background:#0b1b33;box-shadow:0 24px 60px -30px rgba(10,30,70,.6)}',
      '.av-vid-media video{display:block;width:100%;height:auto;background:#0b1b33}',
      '.av-vid-eyebrow{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--av-brand,#2265E6);margin-bottom:12px}',
      '.av-vid-headline{font-size:clamp(26px,3.2vw,38px);font-weight:800;line-height:1.1;letter-spacing:-.02em;margin:0 0 14px;color:var(--av-ink,#0F2C57)}',
      '.av-vid-body{font-size:17px;line-height:1.6;color:var(--av-muted,#51607a);margin:0 0 22px;max-width:48ch}',
      '.av-vid-actions{display:flex;flex-wrap:wrap;align-items:center;gap:16px}',
      '.av-vid-cta{display:inline-flex;align-items:center;gap:8px;background:var(--av-brand,#2265E6);color:#fff;font-weight:700;font-size:15px;padding:13px 22px;border-radius:10px;text-decoration:none}',
      '.av-vid-cta:hover{background:var(--av-brand-700,#1853C3)}',
      '.av-vid-full{font-weight:700;font-size:14px;color:var(--av-brand,#2265E6);text-decoration:none}',
      '.av-vid-full:hover{text-decoration:underline}',
      '.av-vid-langs{display:inline-flex;gap:6px;margin-left:auto}',
      '.av-vid-langs button{font-size:12px;font-weight:700;border:1px solid var(--av-border,#e3e8ef);background:#fff;color:#51607a;border-radius:999px;padding:5px 12px;cursor:pointer}',
      '.av-vid-langs button.on{background:var(--av-brand,#2265E6);border-color:var(--av-brand,#2265E6);color:#fff}',
      '@media (max-width:820px){.av-vid-row{grid-template-columns:1fr;gap:24px}.av-vid-row.rev .av-vid-media{order:0}}',
      // Image
      '.av-img-block img.av-img{display:block;width:100%;height:auto;border-radius:16px}',
      '.av-img-cap{margin-top:16px;text-align:center}',
      '.av-img-cap .av-vid-body{margin:0 auto}',
      // Story (quote card)
      '.av-story{max-width:760px;text-align:center}',
      '.av-story-quote{font-size:clamp(20px,2.6vw,28px);font-weight:700;line-height:1.4;color:var(--av-ink,#0F2C57);margin:0 0 18px}',
      '.av-story-logo{height:40px;width:auto;object-fit:contain;margin:0 auto 10px;display:block}',
      '.av-story-who{font-size:14px;font-weight:700;color:var(--av-muted,#51607a)}',
      // Article (link card)
      '.av-article{display:grid;grid-template-columns:260px 1fr;gap:24px;align-items:center;text-decoration:none;border:1px solid var(--av-border,#e3e8ef);border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 10px 30px -18px rgba(10,30,70,.4)}',
      '.av-article.noimg{grid-template-columns:1fr}',
      '.av-article-img{align-self:stretch}',
      '.av-article-img img{display:block;width:100%;height:100%;min-height:150px;object-fit:cover}',
      '.av-article-body{padding:20px 24px 20px 0}',
      '.av-article.noimg .av-article-body{padding:22px 24px}',
      '.av-article-title{font-size:20px;font-weight:800;color:var(--av-ink,#0F2C57);margin:0 0 8px}',
      '.av-article-excerpt{font-size:15px;line-height:1.6;color:var(--av-muted,#51607a);margin:0 0 12px}',
      '.av-article-cta{font-weight:700;font-size:14px;color:var(--av-brand,#2265E6)}',
      '@media (max-width:820px){.av-article{grid-template-columns:1fr}.av-article-body{padding:0 20px 20px}}',
    ].join('\n');
    var el = document.createElement('style');
    el.id = 'av-video-styles';
    el.textContent = css;
    document.head.appendChild(el);
  }

  function videoHtml(v, index) {
    var rev = index % 2 === 1;
    var hasCaps = !!(v.captionsEnUrl || v.captionsEsUrl);
    var tracks = '';
    if (v.captionsEnUrl) tracks += '<track kind="subtitles" srclang="en" label="English" src="' + esc(v.captionsEnUrl) + '" default>';
    if (v.captionsEsUrl) tracks += '<track kind="subtitles" srclang="es" label="Espanol" src="' + esc(v.captionsEsUrl) + '">';

    var p = [];
    p.push('<div class="av-block"><div class="av-vid-row' + (rev ? ' rev' : '') + '">');
    // preload="metadata" shows the first frame when no poster is set, so a clip
    // without a poster image is not a black rectangle.
    p.push('<div class="av-vid-media"><video controls playsinline preload="metadata"' + (v.posterUrl ? ' poster="' + esc(v.posterUrl) + '"' : '') + '><source src="' + esc(v.videoUrl) + '">' + tracks + '</video></div>');
    p.push('<div class="av-vid-copy">');
    p.push('<span class="av-vid-eyebrow">See it in action</span>');
    p.push('<h3 class="av-vid-headline">' + esc(v.headline || v.title) + '</h3>');
    if (v.body) p.push('<p class="av-vid-body">' + esc(v.body) + '</p>');
    p.push('<div class="av-vid-actions">');
    if (v.ctaLabel && v.ctaHref) p.push('<a class="av-vid-cta" href="' + esc(v.ctaHref) + '">' + esc(v.ctaLabel) + '</a>');
    if (v.shareUrl) p.push('<a class="av-vid-full" href="' + esc(v.shareUrl) + '" target="_blank" rel="noopener">Watch the full version</a>');
    if (hasCaps) p.push('<span class="av-vid-langs"><button data-lang="en" class="on">English</button><button data-lang="es">Espanol</button></span>');
    p.push('</div></div></div></div>');
    return p.join('');
  }

  function imageHtml(v) {
    if (!v.imageUrl) return '';
    var img = '<img class="av-img" src="' + esc(v.imageUrl) + '" alt="' + esc(v.imageAlt || '') + '" loading="lazy">';
    if (v.ctaHref) img = '<a href="' + esc(v.ctaHref) + '">' + img + '</a>';
    var cap = '';
    if (v.headline || v.body) {
      cap = '<div class="av-img-cap">'
        + (v.headline ? '<h3 class="av-vid-headline">' + esc(v.headline) + '</h3>' : '')
        + (v.body ? '<p class="av-vid-body">' + esc(v.body) + '</p>' : '')
        + '</div>';
    }
    return '<div class="av-block av-img-block">' + img + cap + '</div>';
  }

  function storyHtml(v) {
    var logo = v.imageUrl ? '<img class="av-story-logo" src="' + esc(v.imageUrl) + '" alt="">' : '';
    var who = v.title ? '<div class="av-story-who">' + esc(v.title) + '</div>' : '';
    return '<div class="av-block av-story">' + logo
      + '<blockquote class="av-story-quote">“' + esc(v.body || '') + '”</blockquote>'
      + who + '</div>';
  }

  function articleHtml(v) {
    var hasImg = !!v.imageUrl;
    var imgDiv = hasImg ? '<div class="av-article-img"><img src="' + esc(v.imageUrl) + '" alt="' + esc(v.imageAlt || '') + '" loading="lazy"></div>' : '';
    var href = v.ctaHref || '#';
    var cta = v.ctaLabel || 'Read more';
    return '<div class="av-block"><a class="av-article' + (hasImg ? '' : ' noimg') + '" href="' + esc(href) + '">'
      + imgDiv
      + '<div class="av-article-body"><h3 class="av-article-title">' + esc(v.title || '') + '</h3>'
      + (v.body ? '<p class="av-article-excerpt">' + esc(v.body) + '</p>' : '')
      + '<span class="av-article-cta">' + esc(cta) + ' →</span></div></a></div>';
  }

  function blockHtml(b, index) {
    var t = b.type || 'video';
    if (t === 'image') return imageHtml(b);
    if (t === 'story') return storyHtml(b);
    if (t === 'article') return articleHtml(b);
    return (b.videoUrl ? videoHtml(b, index) : '');
  }

  // Wire the caption language toggle for any video blocks inside a filled zone.
  function wireCaptions(container) {
    container.querySelectorAll('.av-vid-row').forEach(function (row) {
      var langs = row.querySelector('.av-vid-langs');
      if (!langs) return;
      var video = row.querySelector('video');
      langs.querySelectorAll('button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var lang = btn.getAttribute('data-lang');
          langs.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b === btn); });
          var tl = (video && video.textTracks) || [];
          for (var i = 0; i < tl.length; i++) tl[i].mode = (tl[i].language === lang ? 'showing' : 'disabled');
        });
      });
    });
  }

  // Relocate a revealed section up the page by `offset` sections, counted from
  // the bottom (0 = leave it where the page authored it). The spot among the
  // sibling <section> elements is recomputed live, so the app never needs to
  // know how many sections a page has.
  function relocateSection(sec, offset) {
    var parent = sec.parentNode;
    if (!parent) return;
    var sibs = Array.prototype.slice.call(parent.children).filter(function (el) {
      return el !== sec && el.tagName === 'SECTION';
    });
    var L = sibs.length;
    if (!L) return;
    var p = Math.max(0, Math.min(offset, L));
    if (p === 0) return;
    var ref = sibs[L - p];
    if (ref) parent.insertBefore(sec, ref);
  }

  // Build a standalone page section for a content block (video, image, story,
  // article) the page-order editor placed. `.av-block` self-centers, so a bare
  // section is enough.
  function buildContentSection(entry, index) {
    var html = blockHtml(entry, index);
    if (!html) return null;
    var sec = document.createElement('section');
    sec.className = 'av-content-section';
    sec.setAttribute('data-avolv-content', '1');
    sec.innerHTML = html;
    wireCaptions(sec);
    return sec;
  }

  // Page builder: arrange the page's hand-coded sections and injected content
  // blocks into one saved order. Native entries move (or hide) the existing
  // <section data-avolv-section="..."> nodes; content entries are rendered in
  // place. Runs only when the app has a saved layout for this page; otherwise the
  // page renders exactly as authored.
  function applyLayout(entries) {
    var natives = {};
    Array.prototype.forEach.call(document.querySelectorAll('[data-avolv-section]'), function (el) {
      natives[el.getAttribute('data-avolv-section')] = el;
    });
    var anchor = null;
    for (var k in natives) {
      var el = natives[k];
      if (!anchor) { anchor = el; continue; }
      if (anchor.compareDocumentPosition(el) & 2 /* PRECEDING */) anchor = el;
    }
    if (!anchor || !anchor.parentNode) return;
    var parent = anchor.parentNode;
    var marker = document.createComment('avolv-layout');
    parent.insertBefore(marker, anchor);
    var frag = document.createDocumentFragment();
    var ci = 0;
    entries.forEach(function (entry) {
      if (!entry) return;
      if (entry.kind === 'native') {
        var node = natives[entry.nativeKey];
        if (!node) return;
        node.style.display = entry.hidden ? 'none' : '';
        frag.appendChild(node);
      } else {
        if (entry.hidden) return;
        var sec = buildContentSection(entry, ci++);
        if (sec) frag.appendChild(sec);
      }
    });
    parent.insertBefore(frag, marker);
    parent.removeChild(marker);
  }

  function run() {
    var containers = Array.prototype.slice.call(document.querySelectorAll('[data-avolv-zone],[data-avolv-video]'));
    var pageSlug = document.body ? document.body.getAttribute('data-avolv-page') : null;
    if (!containers.length && !pageSlug) return;
    injectStyles();

    fetch(FEED, { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (json) {
        var data = (json && json.data) || {};
        var blocks = data.blocks || data.videos || [];
        var bySlot = {};
        blocks.forEach(function (b) {
          if (!b || !b.slot) return;
          (bySlot[b.slot] = bySlot[b.slot] || []).push(b);
        });

        var filledAny = false;
        containers.forEach(function (c) {
          var slot = c.getAttribute('data-avolv-zone') || c.getAttribute('data-avolv-video');
          var list = bySlot[slot];
          if (!list || !list.length) return;
          var html = list.map(function (b, i) { return blockHtml(b, i); }).join('');
          if (!html) return;
          c.innerHTML = html;
          c.style.display = '';
          wireCaptions(c);
          filledAny = true;
        });

        var layout = (pageSlug && data.layout && data.layout[pageSlug]) || null;
        var hasLayout = !!(layout && layout.length);

        document.querySelectorAll('[data-avolv-video-section]').forEach(function (sec) {
          var has = sec.querySelector('[data-avolv-zone],[data-avolv-video]');
          if (has && has.style.display !== 'none') {
            sec.style.display = '';
            // Legacy single-section move. The page builder (below) owns ordering
            // when a layout exists, so only run this when it does not.
            if (!hasLayout) {
              var slot = has.getAttribute('data-avolv-zone') || has.getAttribute('data-avolv-video');
              var list = (slot && bySlot[slot]) || [];
              var offset = 0;
              list.forEach(function (b) { var p = (b && b.pagePosition) || 0; if (p > offset) offset = p; });
              if (offset > 0) relocateSection(sec, offset);
            }
          }
        });

        // Page builder: apply the saved top-to-bottom order for this page.
        if (hasLayout) applyLayout(layout);
      })
      .catch(function () { /* feed down: zones stay hidden, page is unaffected */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
