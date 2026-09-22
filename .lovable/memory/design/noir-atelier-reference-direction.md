---
name: Noir Atelier art direction (owner reference image)
description: Salon-first dark studio direction derived from the owner's uploaded Stellar salon reference; certified 21st implementations only.
type: design
---

Owner supplied a reference screenshot (dark luxury salon: unlit ground,
perspective band of interior photography behind a monumental uppercase display
lockup with a serif-italic accent line, one warm coral signal on the booking
action, dark service tiles with a circled arrow, thin uppercase icon proof row).

Encoded as the `noir-atelier` art direction pack in
`src/sections/variants/artDirectionPacks.ts`:

- hero order `hero:image-stream` → `hero:prisma-cinematic` → `hero:full-bleed`
- services `services:product-cards` first; stats `stats:proof-grid` first
- navbar `navbar:minimal-dark`; gradient `ink-fade`; accent `radial-bloom`
- display weight 800, line-height 0.94, eyebrow tracking 0.28em, uppercase
- rhythm `expansive`, media `full-bleed`, motion profile `gallery-inspection`

Rules:
- The pack states ORDER only. Every entry is an already-certified 21st source
  implementation; the reference never authorises a new hand-built component.
- The reference is direction, never content: no colour, copy or image from the
  screenshot is reproduced.
- First preferred direction for `salon` in both `INDUSTRY_TO_PACKS` and
  `INDUSTRY_CREATIVE_PROFILES`; not attached to any theme preset family, so
  preset-led resolution is unchanged.
