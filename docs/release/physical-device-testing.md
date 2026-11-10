# Guided physical-device testing

Target 0.1.0-beta.1. Test one platform and one stage at a time; require tool evidence or owner confirmation after every major stage. Record Passed, Failed or Not Tested, the observer, model/OS/build/artifact and actual steps. Never infer physical validation from a simulator or semantics tree. Do not collect personal data or wipe/reset/uninstall unrelated apps.

## Android — stage1 connection

Enable Developer Options (usually tap Build number seven times), enable USB Debugging, connect a data-capable cable, unlock and accept this Mac's authorization prompt. Run adb devices -l; require the phone state device. For unauthorized/offline check the phone prompt, cable and USB data mode; do not reset authorizations globally. Always select the phone using adb -s DEVICE because an emulator may coexist. Confirm connection before installing.

## Android — stage2 installation

Build the showcase Release with JDK17 and the device ABI (arm64-v8a on the currently detected phone). Install its actual APK using adb -s DEVICE install -r android/app/build/outputs/apk/release/app-release.apk from the showcase root. Launch adb -s DEVICE shell am start -n com.microinteractions.showcase/.MainActivity. This test Release uses existing example debug signing and embeds JS; it is not store distribution and needs no Metro. Stop on signature mismatch rather than uninstalling data without approval. Confirm app launch and all six sections before interaction testing.

For Debug: npm start, adb -s DEVICE reverse tcp:8081 tcp:8081, then target that device with the installed CLI's run-android options (check --help). Verify the server and USB route before reloading/resetting caches. For logs read only this app's PID with adb -s DEVICE shell pidof -s com.microinteractions.showcase and capture adb -s DEVICE logcat --pid=PID -d. Redact personal paths/serials/text; do not share unrelated phone logs.

## iPhone — stage1 connection/readiness

Connect a data cable, unlock, accept Trust This Computer and enter passcode only on the phone. Confirm readiness in Xcode Devices and Simulators/Device Hub. If required the owner enables Settings > Privacy & Security > Developer Mode, restarts and confirms on the phone. Do not share passcodes. Verify Xcode supports the phone OS and has the required developer image; an xctrace listing alone is not readiness. Confirm before signing.

## iPhone — stage2 signing/install

Run pod install in showcase ios and open MicrointeractionsShowcase.xcworkspace. In the app target's Signing & Capabilities, the owner selects their actual Development Team and appropriate automatic signing, then selects the physical iPhone destination and Run. Sign in directly through Xcode Settings > Accounts. Never share Apple credentials, keys, provisioning profiles or signing secrets. Stop and diagnose signing/OS-support errors; do not blindly change deployment targets, bundle IDs or account resources. Use an owner-approved unique bundle ID only if necessary.

A free Personal Team supports ordinary local device testing with periodic reprovisioning and limits. Paid membership is needed for distribution/additional capabilities; local testing does not require TestFlight or App Store publication. Apple's current rules are linked below. Confirm successful launch before tests.

## iPhone — stage3 Metro/logs

For Debug, start Metro on the Mac. Verify phone-to-Mac development-server connectivity on the trusted local network, including local-network permission, firewall/VPN routing and port 8081/status. USB trust alone does not guarantee Metro networking. Use this app's Dev Menu host configuration if discovery fails; never expose Metro publicly. Release embeds JS and avoids Metro but still requires signing. Use Xcode's device app console/crash report, redact personal details and collect only relevant logs. Confirm each stage instead of assuming completion.

## Focused scenarios — each platform

| Component                 | Checklist                                                                                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ExpandableTransactionCard | Expand/collapse, rapid interruption, changed detail height, reduced motion, screen-reader toggle/focus and hidden detail exclusion.                                        |
| CardStackSelector         | Expand/select, reorder, remove selected, empty/single collection, large text and spoken selection.                                                                         |
| SwipeToPay                | Partial/full drag, reversal/cancellation, duplicate prevention, processing/error/reset and VoiceOver/TalkBack confirmation alternative.                                    |
| AnimatedBalance           | Increase/decrease, decimals,999.99→1000.00 carry, rapid retarget, large/negative values, reduced motion and one complete accessible amount.                                |
| HoldToConfirm             | Early/full hold, move outside, rapid attempts, background before completion, processing/error/reset and accessible confirmation.                                           |
| InteractivePurchaseSheet  | Open/close, real handle pans, body scroll/top no-handoff, keyboard expand/restore, safe areas, backdrop, Android Back, focus containment/return and accessible size/close. |

## Accessibility — learn exit before enabling

Owner enables VoiceOver at iPhone Settings > Accessibility > VoiceOver; use a configured side-button accessibility shortcut or the settings switch to exit. Swipe left/right moves focus, double-tap activates, rotor/actions expose adjustable/custom actions and three-finger swipes scroll. Normal one-finger dragging is not a screen-reader test.

Owner enables TalkBack in Android Settings > Accessibility (manufacturer labels differ). Learn the configured shortcut or settings switch first; the volume-key shortcut works only if already configured. Swipe left/right to focus, double-tap to activate and two fingers to scroll. Keep a second exit method and stop if navigation becomes confusing.

Verify critical completion without exclusive drag/hold: disclosure button, card selection, intent accessible activation with disabled/processing rejection, full balance value, sheet increment/decrement/dismiss/visible close. Record speech, order, hidden content, background isolation and return focus; semantics/unit tests alone do not pass these.

Then test iPhone Reduce Motion (Accessibility > Motion), Larger Text (Display & Text Size), Android Remove animations and font/display scaling. The owner records original preferences and restores them after testing. Verify readable/reachable controls, unchanged confirmation semantics and scrolling. Do not change unrelated settings.

## Evidence

Use date, model/OS, configuration, candidate SHA256, scenario, physical touch versus accessibility action, expected/actual result, Passed/Failed/Not Tested, tool-observed or owner-confirmed, redacted evidence, severity and follow-up. A report of a defect blocks the affected release gate until reproduced/mitigated. No unobserved test is Passed.

Primary guidance: [React Native on device](https://reactnative.dev/docs/running-on-device), [Apple Personal Team](https://developer.apple.com/help/account/basics/about-your-developer-account/), [Apple Developer Mode](https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device/), [Android hardware setup](https://developer.android.com/studio/run/device). Check current platform/account limits when troubleshooting.
