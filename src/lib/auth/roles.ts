export type UserRole = 'buyer' | 'lister' | 'admin'

export function hasRole(userRole: string | null | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false

  const roleHierarchy: Record<UserRole, number> = {
    buyer: 1,
    lister: 2,
    admin: 3,
  }

  return roleHierarchy[userRole as UserRole] >= roleHierarchy[requiredRole]
}

export function isAdmin(role: string | null | undefined): boolean {
  return role === 'admin'
}

export function isLister(role: string | null | undefined): boolean {
  return role === 'lister' || role === 'admin'
}
