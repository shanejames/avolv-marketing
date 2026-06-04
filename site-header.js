/* ============================================================================
   Avolv universal site header.
   Edit THIS file once and the top nav updates on every page that includes it.

   To use on any page: place one line as the first thing inside <body>:
     <script src="site-header.js"></script>
   (Optionally put <div id="site-header"></div> where you want it; if present,
   the header replaces that div. Otherwise it is inserted at the top of <body>.)

   Notes:
   - All classes are namespaced with "av-" so they never collide with a page's
     own CSS. The header brings its own styling and its own font.
   - The header is position: sticky, so it sits in normal flow. Pages do NOT
     need extra top padding to clear it.
   - The matching nav link for the current page is highlighted automatically.
   ========================================================================== */
(function () {
  "use strict";

  var path = (window.location.pathname || "/").toLowerCase();
  function isActive(file) {
    if (file === "/") return path === "/" || path === "" || path.endsWith("/index.html");
    return path.indexOf(file.replace(/^\//, "")) !== -1;
  }
  function act(file) { return isActive(file) ? " av-active" : ""; }

  var CSS = [
    "@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');",
    ".av-header{position:sticky;top:0;z-index:60;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;}",
    ".av-topbar{background:#059669;color:#fff;font-size:14px;}",
    ".av-topbar-in{max-width:1280px;margin:0 auto;padding:6px 24px;display:flex;align-items:center;justify-content:space-between;}",
    ".av-topbar .av-tag{color:#d1fae5;}",
    ".av-topbar .av-contact{display:flex;gap:16px;align-items:center;}",
    ".av-topbar .av-contact a{color:#fff;font-weight:600;text-decoration:none;}",
    ".av-topbar .av-contact a:hover{color:#6ee7b7;}",
    ".av-topbar .av-sep{color:#34d399;}",
    ".av-nav{background:rgba(15,23,42,0.9);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(30,41,59,0.6);}",
    ".av-nav-in{max-width:1280px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;}",
    ".av-logo img{height:30px;display:block;}",
    ".av-links{display:flex;align-items:center;gap:22px;}",
    ".av-links a{color:#94a3b8;text-decoration:none;font-size:15px;transition:color .15s;white-space:nowrap;}",
    ".av-links a:hover,.av-links a.av-active{color:#fff;}",
    ".av-links .av-pool{color:#06b6d4;font-weight:700;}",
    ".av-links .av-pool:hover,.av-links .av-pool.av-active{color:#67e8f9;}",
    ".av-links .av-emer{color:#34d399;font-weight:600;}",
    ".av-links .av-purp{color:#c084fc;font-weight:600;}",
    ".av-links .av-blue{color:#60a5fa;font-weight:600;}",
    ".av-dd{position:relative;}",
    ".av-dd > a{cursor:pointer;}",
    ".av-dd-menu{position:absolute;top:100%;left:0;margin-top:10px;width:212px;background:#0f172a;border:1px solid #1e293b;border-radius:12px;box-shadow:0 20px 40px rgba(0,0,0,.35);opacity:0;visibility:hidden;transform:translateY(-4px);transition:opacity .18s,visibility .18s,transform .18s;padding:8px 0;}",
    ".av-dd:hover .av-dd-menu,.av-dd:focus-within .av-dd-menu{opacity:1;visibility:visible;transform:none;}",
    ".av-dd-menu a{display:flex;align-items:center;gap:12px;padding:9px 16px;font-size:14px;color:#94a3b8;font-weight:500;}",
    ".av-dd-menu a:hover,.av-dd-menu a.av-active{color:#fff;background:rgba(30,41,59,.6);}",
    ".av-dd-menu .av-ic{font-size:17px;width:20px;text-align:center;}",
    ".av-right{display:flex;align-items:center;gap:14px;}",
    ".av-login{color:#94a3b8;text-decoration:none;font-weight:600;white-space:nowrap;}",
    ".av-login:hover{color:#fff;}",
    ".av-cta{background:#10b981;color:#fff;padding:10px 18px;border-radius:8px;font-weight:700;text-decoration:none;white-space:nowrap;box-shadow:0 4px 14px rgba(16,185,129,.25);transition:background .2s;}",
    ".av-cta:hover{background:#34d399;}",
    "@media(max-width:980px){.av-links{display:none;}.av-topbar .av-tag{display:none;}.av-topbar .av-contact{margin:0 auto;}}"
  ].join("");

  var HTML =
    '<div class="av-header">' +
      '<div class="av-topbar"><div class="av-topbar-in">' +
        '<span class="av-tag">Built for Pool &amp; Home Service Operators</span>' +
        '<div class="av-contact"><a href="tel:8135196910">(813) 519-6910</a><span class="av-sep">|</span><a href="mailto:support@avolv.ai">support@avolv.ai</a></div>' +
      '</div></div>' +
      '<nav class="av-nav"><div class="av-nav-in">' +
        '<a class="av-logo" href="/"><img src="https://app.avolv.ai/avolv-logo.png" alt="Avolv.ai"></a>' +
        '<div class="av-links">' +
          '<a href="/#features">Features</a>' +
          '<a href="/#how-it-works">How It Works</a>' +
          '<a class="av-pool' + act("/pools.html") + '" href="/pools.html">Pool Services</a>' +
          '<div class="av-dd"><a class="av-emer" href="/#industries">Services \u25BE</a><div class="av-dd-menu">' +
            '<a class="' + act("/cleaning.html").trim() + '" href="/cleaning.html"><span class="av-ic">\uD83E\uDDFD</span> Cleaning</a>' +
            '<a class="' + act("/lawn.html").trim() + '" href="/lawn.html"><span class="av-ic">\uD83C\uDF3F</span> Lawn Care</a>' +
            '<a class="' + act("/pest.html").trim() + '" href="/pest.html"><span class="av-ic">\uD83D\uDC1C</span> Pest Control</a>' +
            '<a class="' + act("/pressure-washing.html").trim() + '" href="/pressure-washing.html"><span class="av-ic">\uD83D\uDCA6</span> Pressure Washing</a>' +
            '<a href="https://app.avolv.ai/industries/home-services"><span class="av-ic">\uD83D\uDD27</span> Home Services</a>' +
          '</div></div>' +
          '<a class="av-emer" href="https://app.avolv.ai/demo">Demo</a>' +
          '<a class="av-purp" href="https://app.avolv.ai/prompt-genius">Prompt Genius</a>' +
          '<a class="av-blue" href="https://university.avolv.ai" target="_blank" rel="noopener noreferrer">University</a>' +
        '</div>' +
        '<div class="av-right"><a class="av-login" href="https://app.avolv.ai/login">Log In</a><a class="av-cta" href="/get-started.html">Get Started</a></div>' +
      '</div></nav>' +
    '</div>';

  var style = document.createElement("style");
  style.setAttribute("data-avolv-header", "");
  style.textContent = CSS;
  document.head.appendChild(style);

  var mount = document.getElementById("site-header");
  if (mount && mount.parentNode) {
    mount.insertAdjacentHTML("beforebegin", HTML);
    mount.parentNode.removeChild(mount);
  } else {
    document.body.insertAdjacentHTML("afterbegin", HTML);
  }
})();
