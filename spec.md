# PressWala

## Current State
The app has four role-based panels:
- **Customer** (`/customer`) — place orders, track deliveries
- **Partner** (`/partner`) — accept orders, update status, view earnings
- **Shop Owner** (`/owner/dashboard`, `/owner/register`) — manage shop
- **Admin** (`/admin` and sub-routes) — full platform control

The `RoleSelectModal` shows 4 roles: Customer, Partner, Shop Owner, Admin.
The `AppRole` type includes `'partner'`.
`LandingPage.tsx` has partner redirect logic.
`App.tsx` registers a `/partner` route using `PartnerPage`.
Partner-specific components: `PartnerPage.tsx`, `PartnerDashboard.tsx`, `PartnerEarnings.tsx`, `PartnerBottomNav.tsx`, `PartnerOrderCard.tsx`.

## Requested Changes (Diff)

### Add
- Nothing new to add.

### Modify
- `RoleSelectModal.tsx` — remove the Partner role option from the grid (keep Customer, Shop Owner, Admin).
- `App.tsx` — remove `partnerRoute` and all partner imports.
- `LandingPage.tsx` — remove `partner` branch from `handleRoleSelect` and `useEffect` redirect logic.
- `roleStorage.ts` — remove `'partner'` from `AppRole` type union.

### Remove
- `src/pages/PartnerPage.tsx`
- `src/components/PartnerDashboard.tsx`
- `src/components/PartnerEarnings.tsx`
- `src/components/PartnerBottomNav.tsx`
- `src/components/PartnerOrderCard.tsx`

## Implementation Plan
1. Delete the 5 partner component/page files.
2. Remove partner import and route from `App.tsx`.
3. Remove partner role from `RoleSelectModal.tsx` roles array.
4. Remove partner branch from `LandingPage.tsx` handleRoleSelect and useEffect.
5. Remove `'partner'` from `AppRole` type in `roleStorage.ts`.
6. Typecheck and build to confirm no errors.

## UX Notes
- The role selection modal will now show 3 roles in a grid: Customer, Shop Owner, Admin.
- All other panels (Customer, Shop Owner, Admin) remain completely unchanged.
