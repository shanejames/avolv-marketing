/*
 * HeyCatch analytics loader for the Avolv.ai marketing site.
 *
 * Loads the HeyCatch SDK (pinned) and starts autocapture on every page that
 * includes this file in its <head>:
 *   <script type="module" src="/heycatch-analytics.js"></script>
 *
 * - framework "web": this is a plain, static HTML site.
 * - requestBatching false: every page navigation is a full page load, so events
 *   are sent immediately instead of batched. Without this, events can be lost
 *   when a visitor leaves a page quickly, especially on iOS Safari.
 *
 * The projectKey below is a publishable, client-side key. It is meant to ship in
 * the page source and is safe to commit.
 */
import { analytics } from "https://esm.sh/@heycatch/sdk@0.8.3";

analytics.init({
  projectKey: "hck_pk_fRnIq7I_hRB-2yyUEEPicWPqI3nAAh0S",
  framework: "web",
  requestBatching: false,
  agent: "claude-code"
});
