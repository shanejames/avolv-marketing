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
    ".av-topbar{background:#0F2C57;color:#fff;font-size:14px;}",
    ".av-topbar-in{max-width:1280px;margin:0 auto;padding:6px 24px;display:flex;align-items:center;justify-content:space-between;}",
    ".av-topbar .av-tag{color:#93C5FD;}",
    ".av-topbar .av-contact{display:flex;gap:16px;align-items:center;}",
    ".av-topbar .av-contact a{color:#fff;font-weight:600;text-decoration:none;}",
    ".av-topbar .av-contact a:hover{color:#93C5FD;}",
    ".av-topbar .av-sep{color:#60A5FA;}",
    ".av-nav{position:relative;top:auto;left:auto;width:100%;background:rgba(255,255,255,0.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid #E2E8F0;}",
    ".av-nav-in{max-width:1280px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:24px;}",
    ".av-logo{display:inline-flex;align-items:center;font-size:22px;font-weight:800;letter-spacing:-.02em;color:#0F2C57;text-decoration:none;}",
    ".av-links{display:flex;align-items:center;gap:30px;}",
    ".av-links a{color:#334155;text-decoration:none;font-size:15px;transition:color .15s;white-space:nowrap;}",
    ".av-links a:hover,.av-links a.av-active{color:#2563EB;}",
    ".av-links .av-pool{color:#334155;font-weight:600;}",
    ".av-links .av-pool:hover,.av-links .av-pool.av-active{color:#2563EB;}",
    ".av-links .av-emer{color:#334155;font-weight:600;}",
    ".av-links .av-purp{color:#334155;font-weight:600;}",
    ".av-links .av-blue{color:#334155;font-weight:600;}",
    ".av-dd{position:relative;}",
    ".av-dd > a{cursor:pointer;}",
    ".av-dd-menu{position:absolute;top:100%;left:0;margin-top:10px;width:212px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;box-shadow:0 20px 40px rgba(15,44,87,.12);opacity:0;visibility:hidden;transform:translateY(-4px);transition:opacity .18s,visibility .18s,transform .18s;padding:8px 0;}",
    ".av-dd:hover .av-dd-menu,.av-dd:focus-within .av-dd-menu{opacity:1;visibility:visible;transform:none;}",
    ".av-dd-menu a{display:flex;align-items:center;gap:12px;padding:9px 16px;font-size:14px;color:#334155;font-weight:500;}",
    ".av-dd-menu a:hover,.av-dd-menu a.av-active{color:#2563EB;background:#EEF3FB;}",
    ".av-dd-menu .av-ic{font-size:17px;width:20px;text-align:center;}",
    ".av-right{display:flex;align-items:center;gap:14px;}",
    ".av-login{color:#334155;text-decoration:none;font-weight:600;white-space:nowrap;}",
    ".av-login:hover{color:#2563EB;}",
    ".av-cta{background:#2563EB;color:#fff;padding:10px 18px;border-radius:8px;font-weight:700;text-decoration:none;white-space:nowrap;box-shadow:0 4px 14px rgba(37,99,235,.25);transition:background .2s;}",
    ".av-cta:hover{background:#1D4ED8;}",
    // Hamburger (hidden on desktop, shown under the breakpoint).
    ".av-burger{display:none;align-items:center;justify-content:center;width:44px;height:40px;border:1px solid #E2E8F0;border-radius:10px;background:#fff;cursor:pointer;padding:0;flex:none;}",
    ".av-burger span{display:block;width:20px;height:2px;background:#0F2C57;position:relative;transition:background .2s;}",
    ".av-burger span::before,.av-burger span::after{content:'';position:absolute;left:0;width:20px;height:2px;background:#0F2C57;transition:transform .2s,top .2s;}",
    ".av-burger span::before{top:-6px;}",
    ".av-burger span::after{top:6px;}",
    ".av-header.av-open .av-burger span{background:transparent;}",
    ".av-header.av-open .av-burger span::before{top:0;transform:rotate(45deg);}",
    ".av-header.av-open .av-burger span::after{top:0;transform:rotate(-45deg);}",
    // Mobile dropdown panel.
    ".av-mobile{display:none;border-top:1px solid #E2E8F0;background:#fff;}",
    ".av-mobile-in{max-width:1280px;margin:0 auto;padding:8px 24px 18px;display:flex;flex-direction:column;}",
    ".av-mobile a{display:block;padding:11px 4px;font-size:16px;color:#334155;text-decoration:none;border-bottom:1px solid #F1F5F9;font-weight:500;}",
    ".av-mobile a:hover,.av-mobile a.av-active{color:#2563EB;}",
    ".av-mobile .av-group{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#64748B;padding:14px 4px 2px;}",
    ".av-mobile .av-sub{padding-left:18px;}",
    ".av-mobile .av-m-cta{margin-top:14px;background:#2563EB;color:#fff;text-align:center;border-radius:10px;font-weight:700;padding:13px;border-bottom:none;}",
    ".av-mobile .av-m-cta:hover{background:#1D4ED8;color:#fff;}",
    "@media(max-width:1280px){.av-links{display:none;}.av-right{display:none;}.av-burger{display:inline-flex;}.av-header.av-open .av-mobile{display:block;}}",
    "@media(max-width:980px){.av-topbar .av-tag{display:none;}.av-topbar .av-contact{margin:0 auto;}}"
  ].join("");

  var HTML =
    '<div class="av-header">' +
      '<div class="av-topbar"><div class="av-topbar-in">' +
        '<span class="av-tag">Built for Pool &amp; Home Service Operators</span>' +
        '<div class="av-contact"><a href="tel:8135196910">(813) 519-6910</a><span class="av-sep">|</span><a href="mailto:support@avolv.ai">support@avolv.ai</a></div>' +
      '</div></div>' +
      '<nav class="av-nav"><div class="av-nav-in">' +
        '<a class="av-logo" href="/">AVOLV.AI</a>' +
        '<div class="av-links">' +
          '<div class="av-dd"><a class="av-emer" href="/#features">Product \u25BE</a><div class="av-dd-menu">' +
            '<a href="/#features"><span class="av-ic">\u2728</span> Features</a>' +
            '<a href="/#how-it-works"><span class="av-ic">\u2699\uFE0F</span> How It Works</a>' +
            '<a class="' + act("/demo/").trim() + '" href="/demo/"><span class="av-ic">\u25B6\uFE0F</span> Demo</a>' +
          '</div></div>' +
          '<div class="av-dd"><a class="av-emer" href="/pools.html">Industries \u25BE</a><div class="av-dd-menu">' +
            '<a class="av-pool ' + act("/pools.html").trim() + '" href="/pools.html"><span class="av-ic">\uD83C\uDFCA</span> Pool Services</a>' +
            '<a class="' + act("/cleaning.html").trim() + '" href="/cleaning.html"><span class="av-ic">\uD83E\uDDFD</span> Cleaning</a>' +
            '<a class="' + act("/route-based-services.html").trim() + '" href="/route-based-services.html"><span class="av-ic">\uD83D\uDE9A</span> Route-Based Services</a>' +
            '<a href="https://app.avolv.ai/industries/home-services"><span class="av-ic">\uD83D\uDD27</span> Home Services</a>' +
          '</div></div>' +
          '<a class="' + act("/pricing.html").trim() + '" href="/pricing.html">Pricing</a>' +
          '<div class="av-dd"><a class="av-emer" href="#">Compare \u25BE</a><div class="av-dd-menu">' +
            '<a class="' + act("/vs/skimmer.html").trim() + '" href="/vs/skimmer.html"><span class="av-ic">\uD83C\uDFCA</span> vs Skimmer</a>' +
            '<a class="' + act("/vs/jobber.html").trim() + '" href="/vs/jobber.html"><span class="av-ic">\uD83D\uDD27</span> vs Jobber</a>' +
            '<a class="' + act("/vs/housecall-pro.html").trim() + '" href="/vs/housecall-pro.html"><span class="av-ic">\uD83C\uDFE0</span> vs Housecall Pro</a>' +
            '<a class="' + act("/vs/servicetitan.html").trim() + '" href="/vs/servicetitan.html"><span class="av-ic">\uD83C\uDFEB</span> vs ServiceTitan</a>' +
            '<a class="' + act("/vs/fieldroutes.html").trim() + '" href="/vs/fieldroutes.html"><span class="av-ic">\uD83D\uDC1C</span> vs FieldRoutes</a>' +
          '</div></div>' +
          '<div class="av-dd"><a class="av-emer" href="/about/">Company \u25BE</a><div class="av-dd-menu">' +
            '<a class="' + act("/about/").trim() + '" href="/about/"><span class="av-ic">\uD83C\uDFE2</span> About Us</a>' +
            '<a class="' + act("/careers/").trim() + '" href="/careers/"><span class="av-ic">\uD83D\uDCBC</span> Careers</a>' +
            '<a class="' + act("/customer-stories.html").trim() + '" href="/customer-stories.html"><span class="av-ic">\u2B50</span> Customer Stories</a>' +
            '<a class="' + act("/articles").trim() + '" href="/articles"><span class="av-ic">\uD83D\uDCDD</span> Articles</a>' +
            '<a href="https://university.avolv.ai" target="_blank" rel="noopener noreferrer"><span class="av-ic">\uD83C\uDF93</span> University</a>' +
          '</div></div>' +
        '</div>' +
        '<div class="av-right"><a class="av-login" href="https://app.avolv.ai/login">Log In</a><a class="av-cta" href="/get-started.html">Get Started</a></div>' +
        '<button class="av-burger" type="button" aria-label="Menu" aria-expanded="false"><span></span></button>' +
      '</div></nav>' +
      '<div class="av-mobile"><div class="av-mobile-in">' +
        '<div class="av-group">Product</div>' +
        '<a class="av-sub" href="/#features">Features</a>' +
        '<a class="av-sub" href="/#how-it-works">How It Works</a>' +
        '<a class="av-sub ' + act("/demo/").trim() + '" href="/demo/">Demo</a>' +
        '<div class="av-group">Industries</div>' +
        '<a class="av-sub ' + act("/pools.html").trim() + '" href="/pools.html">Pool Services</a>' +
        '<a class="av-sub ' + act("/cleaning.html").trim() + '" href="/cleaning.html">Cleaning</a>' +
        '<a class="av-sub ' + act("/route-based-services.html").trim() + '" href="/route-based-services.html">Route-Based Services</a>' +
        '<a class="av-sub" href="https://app.avolv.ai/industries/home-services">Home Services</a>' +
        '<a class="' + act("/pricing.html").trim() + '" href="/pricing.html">Pricing</a>' +
        '<div class="av-group">Compare</div>' +
        '<a class="av-sub ' + act("/vs/skimmer.html").trim() + '" href="/vs/skimmer.html">vs Skimmer</a>' +
        '<a class="av-sub ' + act("/vs/jobber.html").trim() + '" href="/vs/jobber.html">vs Jobber</a>' +
        '<a class="av-sub ' + act("/vs/housecall-pro.html").trim() + '" href="/vs/housecall-pro.html">vs Housecall Pro</a>' +
        '<a class="av-sub ' + act("/vs/servicetitan.html").trim() + '" href="/vs/servicetitan.html">vs ServiceTitan</a>' +
        '<a class="av-sub ' + act("/vs/fieldroutes.html").trim() + '" href="/vs/fieldroutes.html">vs FieldRoutes</a>' +
        '<div class="av-group">Company</div>' +
        '<a class="av-sub ' + act("/about/").trim() + '" href="/about/">About Us</a>' +
        '<a class="av-sub ' + act("/careers/").trim() + '" href="/careers/">Careers</a>' +
        '<a class="av-sub ' + act("/customer-stories.html").trim() + '" href="/customer-stories.html">Customer Stories</a>' +
        '<a class="av-sub ' + act("/articles").trim() + '" href="/articles">Articles</a>' +
        '<a class="av-sub" href="https://university.avolv.ai" target="_blank" rel="noopener noreferrer">University</a>' +
        '<a href="https://app.avolv.ai/login">Log In</a>' +
        '<a class="av-m-cta" href="/get-started.html">Get Started</a>' +
      '</div></div>' +
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

  // Mobile menu toggle.
  var header = document.querySelector(".av-header");
  var burger = header && header.querySelector(".av-burger");
  if (header && burger) {
    burger.addEventListener("click", function () {
      var open = header.classList.toggle("av-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    var panel = header.querySelector(".av-mobile");
    if (panel) {
      panel.addEventListener("click", function (e) {
        if (e.target && e.target.closest && e.target.closest("a")) {
          header.classList.remove("av-open");
          burger.setAttribute("aria-expanded", "false");
        }
      });
    }
  }
})();
