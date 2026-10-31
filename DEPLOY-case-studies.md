# Dynamic homepage stories + case studies: deploy notes

Added 2026-10-31. This is what changed on the marketing site and the one manual
step to finish it.

## What changed here

- `index.html` — the "Operators already running their book on Avolv" band now
  fills from the live stories feed. The two cards still in the HTML are the
  fallback shown before the feed loads or if it is ever down.
- `proof-band.js` — fetches the feed, shows the customers Shane featured in the
  app, and links each "Read the story" to that customer's case-study page.
- `case-study.html` — one template that renders any customer's case-study page
  from the feed. Reuses the Resort Pool Services layout, so every page looks the
  same.

Nothing else needs editing to add a new homepage story or case study. That all
happens in the app, under References, with "Feature on homepage" and the
"Case study page" editor.

## The one manual step: clean URLs on Render

Case-study pages are meant to live at `avolv.ai/case-studies/<slug>`. On a static
site that needs one rewrite rule so those paths serve `case-study.html`.

In the Render dashboard for the `avolv-app` / marketing static site:
Settings -> Redirects and Rewrites -> Add Rule:

- Source:      `/case-studies/:slug`
- Destination: `/case-study.html`
- Action:      Rewrite

The existing physical file `case-studies/resort-pool-services.html` keeps serving
at its own `.html` URL (static files are served before rewrites), so nothing
breaks while you transition.

### Works with no rewrite too

`case-study.html` also reads the slug from a query string, so
`avolv.ai/case-study.html?c=<slug>` works immediately, before you add the rule.
The app's "Preview" button uses this form on purpose.

## Optional cleanup (do this after you run the seed)

Once the seed script has ported Resort into the system and you have confirmed
`avolv.ai/case-studies/resort-pool-services` renders, you can replace the old
`case-studies/resort-pool-services.html` with a one-line redirect to the clean
URL, so there is a single source of truth. Ask and I will give you that stub.
Until then, leave the file in place.
