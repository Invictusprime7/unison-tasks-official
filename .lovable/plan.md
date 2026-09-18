# Repair saved-project Live Preview styles

## Goal
Stop saved projects from failing with `/index.css:1:117: Unknown word` and restore already-affected drafts.

## Changes
- Fix the theme-font replacement so semicolons inside Google Fonts weight lists cannot leave duplicated CSS fragments.
- Add a narrow compatibility repair at the canonical preview boundary for styles already saved with this exact malformed first line.
- Add regression tests covering repeated theme updates and saved malformed styles.
- Repair the affected saved draft records, including their canonical snapshots, without changing page content or layout.

## Verification
- Run the focused stylesheet and preview tests.
- Confirm the current saved project compiles in Live Preview.
- Confirm the app build remains clean.
