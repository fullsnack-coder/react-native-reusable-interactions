# Component acceptance and maturity

| Maturity     | Meaning                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| Proposed     | Reviewed problem/API direction; implementation is not promised.                                            |
| Experimental | Work in progress; unsupported behavior and API churn explicit.                                             |
| Beta         | Typed implementation and documented tests exist; remaining device/release gates disclosed.                 |
| Stable       | Maintainer-approved API and critical native/accessibility/device coverage, supported by recorded evidence. |
| Deprecated   | Replacement/migration and support boundary documented.                                                     |

Maturity is independent of package SemVer. The initial six components are Beta candidates; none is declared Stable.

Accept a component only with a focused use case, typed root exports, documented state ownership, safe interruption/unmount, no duplicate intent, usable non-gesture alternative, reduced motion, scalable text/touch targets, Android/iOS contract, meaningful automated tests, actual native evidence or explicit pending gates, performance method, public docs and the five Engineering Journal records. Installation, critical gesture/accessibility and data-integrity defects block release. Missing tests are not Passed. Owner/maintainer review is required; acceptance is not publication.
