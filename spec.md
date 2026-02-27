# PressWala

## Current State
The app has a LandingPage that shows a full-screen spinner while waiting for:
1. Internet Identity initialization (`isInitializing`)
2. User profile fetch (`profileLoading`)
3. Admin check (`adminLoading`) — this fires a separate backend call with retry and staleTime, causing extra delay

The `adminLoading` wait is unnecessary because the admin check is not needed to decide what to show on the landing page. The role selection modal and profile setup modal only need the profile result, not admin status.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `LandingPage.tsx`: Remove `adminLoading` from the loading gate. Only wait for `isInitializing` and `profileLoading` before rendering. The admin check still runs in the background but no longer blocks the UI.
- `useIsCallerAdmin` in `useQueries.ts`: Reduce `retry` from 1 to 0 and reduce `staleTime` from 60000ms to 10000ms to speed up when it is needed.

### Remove
- Nothing removed

## Implementation Plan
1. In `LandingPage.tsx`, remove `adminLoading` from the loading condition on line 57.
2. In `useQueries.ts`, set `retry: 0` and `staleTime: 10000` for `useIsCallerAdmin`.

## UX Notes
- Users will see the hero banner or role modal faster, without waiting for the admin check.
- Admin check still resolves in background — navigation to /admin still works via the role modal.
