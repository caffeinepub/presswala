# PressWala

## Current State
The app has Customer, Partner, Owner, and Admin panels all built and routed. The LandingPage handles post-login routing via a role selection modal (`RoleSelectModal`) and stored app role in localStorage.

**Bug**: Admin users (those where `isCallerAdmin()` returns true) are always auto-redirected to `/admin` in the `useEffect` on LandingPage. The `showRoleSelect` condition also has `&& !isAdmin`, so admins never see the role selection modal. This means any user who has admin privileges cannot choose Customer or Partner role — they are always forced into the admin panel.

Additionally, when the stored role is cleared (logout) and user logs back in, the same auto-redirect to `/admin` fires before the user can choose a different role.

## Requested Changes (Diff)

### Add
- A role switcher / role selection that works for ALL users including admins
- After login, if no stored role exists, always show the role selection modal (even for admins)
- Admin option in the role modal should still be present (and navigate to /admin)

### Modify
- `LandingPage.tsx`: Remove the `!isAdmin` guard from `showRoleSelect`. Let admins see the role modal too
- `LandingPage.tsx`: In the `useEffect` auto-redirect, do NOT auto-redirect to `/admin` just because `isAdmin` is true. Only auto-redirect if there is a valid `storedRole`
- `LandingPage.tsx`: If user is admin and has no stored role, show the role modal so they can choose Customer/Partner/Admin

### Remove
- Auto-redirect to `/admin` based purely on `isAdmin` flag (without an explicit stored role)

## Implementation Plan
1. In `LandingPage.tsx`, change `showRoleSelect` to NOT exclude admins: remove `&& !isAdmin`
2. In the `useEffect`, remove the block that auto-navigates to `/admin` when `isAdmin` is true without a stored role — instead fall through to the role modal
3. Ensure the stored role is still used for auto-redirect when it exists (so return visits work)
4. Ensure `handleRoleSelect` still sets the stored role before navigating

## UX Notes
- Admins can now choose to use the app as a Customer or Partner
- Admin role button in the modal still works as before (passkey required)
- On return visit, stored role still auto-navigates the user to their last-used panel
- Logout clears the stored role, so next login always shows the role modal
