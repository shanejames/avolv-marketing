/* ============================================================================
   Avolv universal site footer.
   Edit THIS file once and the footer updates on every page that includes it.

   To use on any page: place this where you want the footer, near the end of <body>:
     <div id="site-footer"></div>
     <script src="/site-footer.js"></script>
   If the #site-footer div is present, the footer replaces it. Otherwise it is
   appended to the end of <body>.

   All classes are namespaced with "avf-" so they never collide with a page's
   own CSS. The footer brings its own styling and uses the shared brand colors.
   ========================================================================== */
(function () {
  "use strict";

  var CSS = [
    ".avf-footer{background:#0F2C57;color:rgba(255,255,255,0.72);padding:56px 0 36px;font-size:14px;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;}",
    ".avf-in{max-width:1120px;margin:0 auto;padding:0 24px;}",
    ".avf-grid{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:32px;padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.1);}",
    ".avf-logo{font-weight:800;font-size:22px;color:#fff;letter-spacing:-0.02em;}",
    ".avf-brand p{margin:12px 0;max-width:300px;color:rgba(255,255,255,0.66);line-height:1.6;}",
    ".avf-brand a{color:rgba(255,255,255,0.85);font-weight:600;text-decoration:none;}",
    ".avf-brand a:hover{color:#93C5FD;}",
    ".avf-addr{font-size:13px;margin-top:12px;color:rgba(255,255,255,0.55);line-height:1.7;}",
    ".avf-col h4{color:#fff;font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:14px;}",
    ".avf-col a{display:block;color:rgba(255,255,255,0.72);margin-bottom:9px;text-decoration:none;}",
    ".avf-col a:hover{color:#93C5FD;}",
    ".avf-bottom{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-top:24px;color:rgba(255,255,255,0.6);}",
    ".avf-bottom a{color:rgba(255,255,255,0.6);text-decoration:none;}",
    ".avf-bottom a:hover{color:#93C5FD;}",
    "@media(max-width:900px){.avf-grid{grid-template-columns:1fr 1fr;}}"
  ].join("");

  var HTML =
    '<footer class="avf-footer"><div class="avf-in">' +
      '<div class="avf-grid">' +
        '<div class="avf-brand">' +
          '<div class="avf-logo">AVOLV.AI</div>' +
          '<p>Field service software for pool and home service companies. One system, month to month, no contract.</p>' +
          '<a href="tel:8135196910">(813) 519-6910</a><br>' +
          '<a href="mailto:sales@avolv.ai">sales@avolv.ai</a> &middot; <a href="mailto:support@avolv.ai">support@avolv.ai</a>' +
          '<div class="avf-addr">Avolv.ai &middot; 5914 Menorca Lane &middot; Apollo Beach, FL 33572<br>Support: Mon-Fri, 9am-5pm ET</div>' +
        '</div>' +
        '<div class="avf-col"><h4>Platform</h4>' +
          '<a href="/pricing.html">Booking &amp; Scheduling</a>' +
          '<a href="/pricing.html">Customer Follow-up</a>' +
          '<a href="/pricing.html">Lead Generation</a>' +
          '<a href="/pricing.html">AI Content Creator</a>' +
        '</div>' +
        '<div class="avf-col"><h4>Industries</h4>' +
          '<a href="/pools.html">Pool Services</a>' +
          '<a href="/cleaning.html">Cleaning Services</a>' +
          '<a href="/route-based-services.html">Route-Based Services</a>' +
          '<a href="/route-based-services.html">Home Services</a>' +
        '</div>' +
        '<div class="avf-col"><h4>Company</h4>' +
          '<a href="/pricing.html">Pricing</a>' +
          '<a href="/case-studies/resort-pool-services.html">Case Studies</a>' +
          '<a href="/about/shane-james.html">About Shane</a>' +
          '<a href="/vs/skimmer.html">Compare</a>' +
          '<a href="/get-started.html">Get Started</a>' +
          '<a href="https://university.avolv.ai" target="_blank" rel="noopener noreferrer">Avolv University</a>' +
        '</div>' +
      '</div>' +
      '<div class="avf-bottom">' +
        '<div>&copy; 2026 Avolv.ai. All rights reserved.</div>' +
        '<div><a href="/privacy-policy.html">Privacy</a> &middot; <a href="/terms-of-service.html">Terms</a> &middot; <a href="/sms-consent.html">SMS Terms</a></div>' +
      '</div>' +
    '</div></footer>';

  var style = document.createElement("style");
  style.setAttribute("data-avolv-footer", "");
  style.textContent = CSS;
  document.head.appendChild(style);

  var mount = document.getElementById("site-footer");
  if (mount && mount.parentNode) {
    mount.insertAdjacentHTML("beforebegin", HTML);
    mount.parentNode.removeChild(mount);
  } else {
    document.body.insertAdjacentHTML("beforeend", HTML);
  }
})();
