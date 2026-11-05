/* ===========================================================================
 * site-videos.js  ->  /site-videos.js
 * Added 2026-11-05.
 *
 * Fills the website's video slots from the app. Shane picks the video, the slot,
 * the headline and the copy in Grow Avolv > Website videos, and hits publish.
 * This script reads the published ones and drops each into its container.
 *
 * A container is any element with data-avolv-video="<slot>". It starts hidden
 * (inline display:none) so there is no empty gap before the feed loads; this
 * script reveals and fills only the slots that have a published video. A wrapper
 * marked data-avolv-video-section is revealed only when at least one of its
 * slots filled, so an empty section never shows.
 *
 * Mirrors proof-band.js: same feed host, same self-contained approach, same
 * graceful failure (if the feed is slow or down, the slots simply stay hidden).
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
      '.av-vid-row{display:grid;grid-template-columns:1.05fr .95fr;gap:40px;align-items:center;max-width:1100px;margin:0 auto;padding:0 24px}',
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
    ].join('\n');
    var el = document.createElement('style');
    el.id = 'av-video-styles';
    el.textContent = css;
    document.head.appendChild(el);
  }

  function render(container, v, index) {
    var rev = index % 2 === 1;
    var hasCaps = !!(v.captionsEnUrl || v.captionsEsUrl);
    var tracks = '';
    if (v.captionsEnUrl) tracks += '<track kind="subtitles" srclang="en" label="English" src="' + esc(v.captionsEnUrl) + '" default>';
    if (v.captionsEsUrl) tracks += '<track kind="subtitles" srclang="es" label="Espanol" src="' + esc(v.captionsEsUrl) + '">';

    var parts = [];
    parts.push('<div class="av-vid-row' + (rev ? ' rev' : '') + '">');
    parts.push('<div class="av-vid-media"><video controls playsinline preload="metadata"' + (v.posterUrl ? ' poster="' + esc(v.posterUrl) + '"' : '') + '><source src="' + esc(v.videoUrl) + '">' + tracks + '</video></div>');
    parts.push('<div class="av-vid-copy">');
    parts.push('<span class="av-vid-eyebrow">See it in action</span>');
    parts.push('<h3 class="av-vid-headline">' + esc(v.headline || v.title) + '</h3>');
    if (v.body) parts.push('<p class="av-vid-body">' + esc(v.body) + '</p>');
    parts.push('<div class="av-vid-actions">');
    if (v.ctaLabel && v.ctaHref) parts.push('<a class="av-vid-cta" href="' + esc(v.ctaHref) + '">' + esc(v.ctaLabel) + '</a>');
    if (v.shareUrl) parts.push('<a class="av-vid-full" href="' + esc(v.shareUrl) + '" target="_blank" rel="noopener">Watch the full version</a>');
    if (hasCaps) {
      parts.push('<span class="av-vid-langs"><button data-lang="en" class="on">English</button><button data-lang="es">Espanol</button></span>');
    }
    parts.push('</div></div></div>');

    container.innerHTML = parts.join('');
    container.style.display = '';

    // Caption language toggle, when tracks exist.
    if (hasCaps) {
      var video = container.querySelector('video');
      container.querySelectorAll('.av-vid-langs button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var lang = btn.getAttribute('data-lang');
          container.querySelectorAll('.av-vid-langs button').forEach(function (b) { b.classList.toggle('on', b === btn); });
          var tl = video.textTracks || [];
          for (var i = 0; i < tl.length; i++) tl[i].mode = (tl[i].language === lang ? 'showing' : 'disabled');
        });
      });
    }
  }

  function run() {
    var containers = Array.prototype.slice.call(document.querySelectorAll('[data-avolv-video]'));
    if (!containers.length) return;
    injectStyles();

    fetch(FEED, { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (json) {
        var videos = (json && json.data && json.data.videos) || [];
        var bySlot = {};
        videos.forEach(function (v) { if (v && v.slot) bySlot[v.slot] = v; });

        var filledAny = false;
        containers.forEach(function (c, i) {
          var slot = c.getAttribute('data-avolv-video');
          var v = bySlot[slot];
          if (v && v.videoUrl) { render(c, v, i); filledAny = true; }
        });

        // Reveal any wrapper section only if something filled inside it.
        document.querySelectorAll('[data-avolv-video-section]').forEach(function (sec) {
          var has = sec.querySelector('[data-avolv-video]');
          if (has && has.style.display !== 'none') sec.style.display = '';
        });
        if (!filledAny) return; // leave everything hidden
      })
      .catch(function () { /* feed down: slots stay hidden, page is unaffected */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
