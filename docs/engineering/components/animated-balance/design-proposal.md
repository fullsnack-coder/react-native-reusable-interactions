# AnimatedBalance design proposal

Recorded 2026-11-08 before implementation. Final status: implemented; release validation pending (2026-11-09). Development time not measured.

## Need and scope

Native numeric presentation controlled by an authoritative decimal string. No monetary arithmetic, data fetching, reconciliation or backend. Keep the three existing components and their APIs intact. New implementation may proceed under AGENTS.md with prior release validation gaps carried into a cumulative release matrix.

## Representation and formatting proposal

Choose decimal strings only, canonical optional minus, integer and optional fractional digits; maximum 15 integer digits and 6 input fraction digits. Reject malformed/unsupported input deterministically. Numbers are ergonomic but expose binary precision; minor units require currency-dependent units. A bounded decimal string avoids ambiguous units and lossy fractions with no decimal dependency. See accepted ADR 0006.

Use Intl.NumberFormat for grouping, symbols, sign, decimal separator and placement. Only the integer magnitude (at most 999999999999999, exactly representable) is converted to Number; replace the fraction part with exact padded/localized input digits. Default precision comes from currency metadata, or 2 for decimal counters. Optional fractionDigits 0..6. Reject significant excess decimals instead of rounding; insignificant trailing zeros may be omitted. Normalize negative mathematical zero. Unsupported locales/Intl capabilities must throw; verify Hermes separately from Node.

## API proposal

Required value: string. Optional currency, locale (default en-US), fractionDigits, duration (default 450 ms, finite 0..2000), textStyle, style, accessibilityLabel, testID. No count mode, initial animation, callbacks or internal values exposed. Presentation only. Currency codes must be three uppercase ASCII letters; unknown ISO-like codes follow Intl's generic display rather than a bespoke currency database.

## Rolling model

Each integer digit keyed by place from the decimal point, each fraction digit keyed by fraction place. Group/non-numeric tokens remain static; insert/remove columns discretely when formatted shape changes. Use measured maximum digit width, tabular-numeral preference, explicit line height and OS font scale. Render a bounded repeated digit strip in one Text per column, animated by one shared offset/transform per column. A cyclic normalized position allows interrupted transitions to continue from current UI progress with at most one revolution to the new target. Increase rolls up, decrease down; unchanged digits do not restart. New columns appear at their target, removed columns disappear. No unbounded queues/history, formatting per frame or stale completion callbacks.

Snap first mount. Cancel active animation on unmount and snap to latest digits for system reduced motion or duration zero. Formatting/typography changes remount the face rather than roll unrelated currencies/separators. Non-Latin numbering systems and directional literals use a whole native Text fallback to preserve bidi shaping; no unverified RTL rolling claim. Layout is a single unwrapped amount in a bounded horizontal ScrollView; overflow can be scrolled, never ellipsized. Custom fonts and extreme labels need consuming-app validation.

## Accessibility and validation

Expose the latest complete formatted amount as one native text accessibility element, optionally prefixed by a custom label. Hide digit/probe descendants; no automatic/live per-frame announcements. Application owns announcement cadence. Respect initial and changed OS reduced-motion preferences; default to no motion until preference is known.

Test exact formats, limits, negative subunits, locale/currency/precision changes, carries, positional identity, no-change, rapid updates/interruption, reduced motion, native measurement, cleanup and single accessibility label. Verify Android Release and iOS Debug builds, native representative outcomes and glyph alignment where observation is available. Reuse gfxinfo window-level profiling with explicit limits. Never treat mocked motion or inaccessible iOS drag tooling as native evidence. Maintain cumulative release matrix and separate implementation from release readiness.

## Implementation revision — 2026-11-09

The proposed formatToParts dependency failed on the available iOS Hermes runtime. Final formatting uses Intl.format on the exact integer, verifies its localized numeric glyphs against the integer and expected zero fraction, then substitutes exact fractional glyphs while preserving all locale literals. Negative subunits probe -1 and substitute integer zero, avoiding a signed-zero capability assumption. The representation, limits and API are unchanged; see ADR 0006 and actual validation evidence.
