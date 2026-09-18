# Fix Wizard Composer Footer Contract Failure

## Goal
Prevent compiler-owned footer selections from invalidating otherwise valid page compositions or blanking the preview.

## Changes
- Normalize AI composition output before catalog validation by removing navbar/footer variant choices, because canonical compilation owns site chrome.
- Keep body-section catalog validation strict; unknown IDs, wrong roles, missing pages, and malformed output still fail.
- Align the catalog matcher and diagnostics with the same compiler-owned chrome rule.
- Remove the composer’s artificial AI request deadlines so long model responses are not discarded.
- Add regression coverage for pricing, FAQ, and checkout pages that return role-ineligible footer IDs.
- Deploy the corrected composer and verify focused tests plus the preview build.

## Technical Details
The model may include a footer ID valid for another page role. Footer placement and implementation are already canonical compiler responsibilities, so these non-authoritative choices will be discarded rather than repaired or accepted. All authoritative body-family choices remain constrained to eligible IDs from the supplied registry.
