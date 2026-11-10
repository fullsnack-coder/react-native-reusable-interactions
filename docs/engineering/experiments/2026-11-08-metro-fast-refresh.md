# Experiment: Metro connectivity and Fast Refresh on iOS Simulator

- Status: Completed
- Date performed: 2026-11-08
- Related issue: Iteration 0 audit reported a Fast Refresh disconnected banner and development warning toast.
- Development time: Not measured.

## Question and hypothesis

Does the banner indicate a project configuration problem, or can it be produced by losing the Metro development connection? If Metro connectivity is healthy, a source edit should update the app without a manual relaunch. Stopping Metro should produce a disconnection warning.

## Setup

- App: independent `microinteractions-showcase` Community CLI app, React Native 0.88.1, Metro 0.87.3, existing Debug iOS Simulator build.
- Device: iPhone 17 Pro simulator, iOS 26.2.
- Source file temporarily edited: `App.tsx`; original content was backed up and restored exactly after the test.
- Metro started with `npm start -- --port 8081`; `curl http://localhost:8081/status` returned `packager-status:running`.

## Procedure and observations

1. Booted the simulator and launched `com.microinteractions.showcase` with Metro already ready. The baseline screen rendered without a Fast Refresh banner or warning toast ([baseline screenshot](assets/metro-baseline.png)).
2. Changed one visible string in `App.tsx` without relaunching. The simulator displayed the new string ([edited screenshot](assets/metro-edit.png)), demonstrating a working Fast Refresh update.
3. Restored `App.tsx` from the exact backup. The original string reappeared without relaunching. A byte comparison confirmed the source file was restored.
4. Stopped Metro while the app remained open. The simulator displayed **Fast Refresh disconnected. Reload app to reconnect.** and **Open debugger to view warnings.** ([disconnected screenshot](assets/metro-disconnected.png)).
5. Restarted Metro and relaunched the app. The original screen rendered without either banner ([reconnected screenshot](assets/metro-reconnected.png)).

## Result and interpretation

Metro connectivity and Fast Refresh worked with the current project configuration. Deliberately stopping Metro reproduced the same visible warning state from the audit. This supports a development connection interruption as the cause; the exact cause of the earlier interruption was not recorded, so this is an inference rather than a proven reconstruction. No project configuration change was justified.

## Limits and follow-up

This was one iOS Simulator Debug session. Android Fast Refresh and longer-running connection stability were not tested. If the banner recurs while Metro remains healthy, capture Metro logs, simulator logs, and connection state before changing configuration.
