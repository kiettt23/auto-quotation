/**
 * Role-Based Access Control helpers
 * Role hierarchy: OWNER > ADMIN > MEMBER > VIEWER
 */

const ROLE_HIERARCHY = { OWNER: 4, ADMIN: 3, MEMBER: 2, VIEWER: 1 } as const;
type Role = keyof typeof ROLE_HIERARCHY;

/**
 * Throws Vietnamese error if user doesn't have the minimum required role.
 * Use in server actions / services before write operations.
 */
export function requireRole(userRole: string, minRole: Role): void {
  const level = ROLE_HIERARCHY[userRole as Role] ?? 0;
  if (level < ROLE_HIERARCHY[minRole]) {
    throw new Error("Bạn không có quyền thực hiện thao tác này");
  }
}

/**
 * Returns true if the user has at least the minimum required role.
 * Use for conditional rendering.
 */
export function hasPermission(userRole: string, minRole: Role): boolean {
  return (ROLE_HIERARCHY[userRole as Role] ?? 0) >= ROLE_HIERARCHY[minRole];
}
