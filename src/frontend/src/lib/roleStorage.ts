// Stores the user's chosen app role (customer, partner, owner, or admin) in localStorage
// This is separate from the backend UserRole (which is admin/user/guest)
// All non-admin users can choose to act as customer, partner, or owner

export type AppRole = 'customer' | 'partner' | 'owner' | 'admin';

const ROLE_KEY = 'presswala_app_role';

export function getStoredAppRole(): AppRole | null {
  try {
    const val = localStorage.getItem(ROLE_KEY);
    if (val === 'customer' || val === 'partner' || val === 'owner' || val === 'admin') return val;
    return null;
  } catch {
    return null;
  }
}

export function setStoredAppRole(role: AppRole): void {
  try {
    localStorage.setItem(ROLE_KEY, role);
  } catch {
    // ignore
  }
}

export function clearStoredAppRole(): void {
  try {
    localStorage.removeItem(ROLE_KEY);
  } catch {
    // ignore
  }
}
