# CardStackSelector design proposal

2026-11-08. Status: implemented; device accessibility and release profiling pending. Development time not measured.

Generic items with stable IDs and custom rendering; controlled/uncontrolled selection and expansion. Uniform cardHeight >=48; spacing >=0; collapsedOffset 0..half height. Empty collection renders nothing; missing selection falls back to first item without callback; expanded order follows items. Selected item is primary when collapsed. Recommend up to ten cards pending release profiling. Parent ScrollView owns overflow.

A shared expansion progress coordinates transforms and container height. Shared selection position interpolates collapsed ranks. Spring stiffness 260, damping 30, mass 1, overshoot clamped, system reduced motion. Native Pressable provides accessible tap activation; swipe is deferred pending cancellation and scroll-conflict validation. Consumer card content is presentation only; nested controls unsupported. Hidden overlapped cards are excluded from accessibility and touch. No shared framework or changes to ExpandableTransactionCard.

States: collapsed/expanding/expanded/selecting/collapsing. React owns stable requested state, shared values own motion; new requests retarget existing springs. Callbacks report user requests, not completion. Validate zero/one/three/five/ten cards, dynamic collection updates, requests, existing tests, packed consumer, native builds/runtimes. Screen reader focus and release frame timing need device verification.
