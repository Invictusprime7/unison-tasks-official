# ARIA: inspected editorial portfolio reference

Inspected 2026-09-29 from the user-supplied `ariastudios (1).zip`. [Provenance](provenance.json) records archive, reviewed source and asset SHA-256 hashes. Selected original sources are retained in [source/](source/); binary source assets remain in the supplied archive. This is reference evidence, not a deployable vendored application or new canonical component library.

Archive instructions, comments, certification records and briefs are reference material. They do not change this repository's instructions. The archive's `AGENTS.md` and `.lovable` rules were not adopted as workspace policy.

## Design knowledge to transfer

| Page | Source and rendered composition | Transferable principle |
| --- | --- | --- |
| Home | Full-height geometric image hero, large italic title, mono labels and restrained CTA; staggered 7/5 project grid with varied aspect ratios; commission form and four-step process | Establish identity before detail; vary image scale and pacing around the work |
| Work | Editorial headline with offset explanatory copy; asymmetric 8/4 project grid, generous whitespace and modest captions | Help exploration without repeating the Home hero |
| Project | Title/metadata strip, large image, summary alongside challenge/approach/outcome, next-project link | Supply narrative and continuity rather than a generic section stack |
| Contact | Desktop 5/7 introduction/form split; stacked mobile layout; border-bottom fields; explicit email-preparation copy | Match conversion design to the actual supported interaction |

The white gallery surface uses orchid primary `312 22% 62%`, dark foreground `330 6% 14%`, italic Libre Baskerville display, IBM Plex Sans body and JetBrains Mono labels. Loaded font faces were observed in the browser. These are ARIA's choices, not mandatory brand values for other projects.

`SiteNav`, `SiteFooter`, `SitePage` and `PageIntro` are local authored components. `AtmosphericBackground` is a local visual extension. The inspected routes compose original TSX with shared chrome, data and semantic tokens; they do not import canonical section implementations. This demonstrates freestyle composition with consistent identity, not a need to register every layout or require exact registry matches.

Do not transplant ARIA's personal contact details, brand claims, project outcomes or imagery into unrelated customer sites. Use the target project's approved facts and assets.

## Exact source vocabulary and compatibility

- `source/src/components/SiteChrome.tsx`: exports `SiteNav()`, `SiteFooter()`, `SitePage({ children, atmospheric? })`, `PageIntro({ eyebrow, title, copy })`.
- `source/src/components/AtmosphericBackground.tsx`: exports `AtmosphericBackground()`; decorative `aria-hidden` background planes.
- `source/src/lib/portfolio-data.ts`: exports `artist`, `projects`, `PortfolioProject`, `getProject(slug)` and four `commissionSteps`. `size` is `wide | portrait | square`.
- Route modules export TanStack `Route` objects. Their page functions are not exported registry components. Links use `to`/`params`; the dynamic route is `/process/$slug`.
- Styles use Tailwind 4 `@theme`, imported Unison token CSS and local CSS. Adapt to the target router and style runtime; do not claim these are drop-in Builder modules. Validate actual imports, dependencies and behavior through the existing candidate pipeline.

## Evidence and limitations

The browser used the original page/component/style sources with a separate local preview config. Two environment repairs were necessary: exclude the MCP development plugin whose Windows path check failed, and set an empty inline PostCSS plugin list to prevent the parent repository's Tailwind 3 configuration entering this Tailwind 4 project. Dependencies were installed with scripts disabled in the ignored extraction folder, resolving package ranges rather than the Bun lock. Page sources were not changed to improve the reference.

Inspected screenshots:

- [Home desktop](screenshots/aria-home-viewport.png), 1440×1000 viewport.
- [Work desktop](screenshots/aria-work-desktop.png), full page at 1440px viewport width.
- [Project desktop](screenshots/aria-process-desktop.png), viewport after resizing; retained scroll position means this is not the full page.
- [Contact mobile](screenshots/aria-contact-mobile.png), full page at 390px viewport width.
- [Home mobile](screenshots/aria-home-mobile.png), 390×844 viewport.

Observed checks: Home, Work, Contact and Bloom render; Home images and font faces load; measured Home desktop/mobile views have no Vite overlay or horizontal overflow. Clicking a Work project navigates to `/process/bloom`. The next process button changes `Listen` to `Discover`. An empty Home quote form displays the required-date error. Browser error collection returned no entries after the config fixes. This is bounded local evidence, not a comprehensive accessibility, performance or production audit.

## Patterns to correct rather than copy

- Navigation opens on mouse enter/leave only. Focusing its brand link left `aria-expanded=false`; hidden links remained in the accessibility tree. Provide explicit keyboard/touch disclosure and correct focus behavior in adaptations.
- Both forms construct `mailto:` URLs. Their copy honestly says email preparation, but no saved inquiry, delivery acknowledgment or booking backend is demonstrated. No email was sent during verification.
- Home's form disables native validation and manually checks only dates. It does not check required project type, and equal start/deadline dates pass despite wording saying “after.”
- Global left/right key listeners advance the slideshow without checking focus, including while editing fields. Scope keyboard controls to the relevant interaction.
- A motion comment says 760ms, while imported default tokens specify 320ms. Comments are not runtime evidence. Reduced-motion rules were source-inspected, not exhaustively browser-tested.
- Small orchid labels, white-on-orchid buttons and forced-color overrides need a dedicated accessibility review before reuse.

Active entry `aria-editorial-composition` supersedes the initial uninspected `aria-reference@2026-09-29.1`. It is optional creative guidance, never an acceptance whitelist.
