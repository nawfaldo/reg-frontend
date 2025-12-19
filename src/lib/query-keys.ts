/**
 * Type-safe query keys for TanStack Query
 * This ensures consistency and type safety across the application
 */
export const queryKeys = {
  me: ["me"] as const,
  company: {
    all: ["company"] as const,
    companies: ["companies"] as const,
    byName: (name: string) => ["company", name] as const,
    byId: (id: string) => ["company", id] as const,
    members: (companyId: string) => ["company", companyId, "members"] as const,
    roles: (companyId: string) => ["company", companyId, "roles"] as const,
    role: (companyId: string, roleId: string) => ["company", companyId, "roles", roleId] as const,
    permissions: ["company", "permissions"] as const,
    userSearch: (email: string) => ["company", "users", "search", email] as const,
  },
} as const;

