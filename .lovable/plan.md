# Rename Belong pillar to Connect

## Changes
- Rename the fifth pillar’s user-facing title to **CONNECT / تواصل** while keeping its existing icon, sections, content, and styling.
- Add `/connect` as the canonical category route with Connect-specific page metadata.
- Keep `/belong` working as a backward-compatible redirect to `/connect`, including deep-link hashes.
- Update the homepage card, all seven sub-item links, category navigation, header navigation, breadcrumbs, and other visible pillar labels to use Connect and point to `/connect`.
- Preserve internal journey-stage and Settlement Graph identifiers where changing them could affect orchestration; update only their visible Belong labels to Connect.

## Validation
- Check homepage and category navigation in English and Arabic RTL.
- Verify `/connect` and section deep links, plus `/belong` redirects.
- Check desktop and mobile layouts, internal links, preview errors, and build/typecheck status.

## Technical details
- The shared pillar data identifier will become `connect`, so existing reusable category-page rendering continues unchanged.
- The legacy route will use a router redirect rather than duplicating page content or metadata.