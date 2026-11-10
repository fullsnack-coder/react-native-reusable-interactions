# ADR-0006: Exact bounded decimal presentation

- Status: Accepted for AnimatedBalance
- Recorded: 2026-11-09
- Scope: Library numeric-presentation boundary; no change to prior APIs

## Context

AnimatedBalance must separate authoritative amounts, display formatting and animated glyph positions. JavaScript fractional numbers can lose decimal precision. Existing dependencies include Intl-capable Hermes and Reanimated; no financial arithmetic package is required for presentation.

## Decision

AnimatedBalance accepts canonical decimal strings only, at most 15 integer digits and 6 fractional digits. Convert only the integer magnitude, within the exact integer range, for Intl.NumberFormat.format. Validate all numeric glyphs against the integer plus the requested zero fraction, then substitute exact input fractional digits using a localized digit map. Preserve all intervening literals directly from Intl. Negative subunits use the -1 formatting pattern with an exact zero integer substitution, avoiding dependence on signed-zero support. Default currency precision comes from Intl, with an optional explicit 0..6 precision. Reject significant excess precision; never round or interpolate an authoritative amount. Trailing fractional zeros and negative mathematical zero may be normalized without changing its mathematical value. The application owns arithmetic, units, authorization and business validity.

Locale/currency/typography changes snap a new face. Latin digit columns use decimal-place identity and shared cyclic positions. Non-Latin/directional formats use whole native Text to preserve shaping. No automatic announcements, numeric tween API, implicit conversion of numbers, BigInt/decimal dependency or financial calculations.

## Alternatives

Number input is ergonomic but ambiguous for exact decimals. Safe integer minor units are exact within bounds but require explicit currency/unit interpretation. Arbitrary precision strings formatted through BigInt or modern Intl string conversion would depend on unverified engine capabilities; the bounded integer/parts approach needs neither. Full count interpolation would require lossy or more complex intermediate math and repeated formatting. These alternatives were evaluated as API/architecture tradeoffs, not benchmarked competitors.

## Consequences and verification

Exact supported fractional input and predictable size limits; values outside those limits fail clearly. Bounded digit count and history. Native locale availability must be checked per consuming runtime. This is presentation, not an accounting format or a currency-code registry. Native font, RTL, screen-reader and physical-device release checks remain separate gates. Formatter/component tests and actual native outcomes are recorded in the component Engineering Journal; acceptance does not imply production validation.

Native evidence changed the initial implementation: iOS Hermes raised a missing-formatToParts error. The final verified-pattern tokenizer uses Intl.format instead, without a dependency or version change. A regression test removes formatToParts and checks exact PEN, negative subunits and the maximum supported six-decimal amount. Native retest outcomes remain in the component Journal.
