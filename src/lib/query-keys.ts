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
    admins: (companyId: string) => ["company", companyId, "admins"] as const,
    roles: (companyId: string) => ["company", companyId, "roles"] as const,
    role: (companyId: string, roleId: string) => ["company", companyId, "roles", roleId] as const,
    permissions: ["company", "permissions"] as const,
    userSearch: (email: string) => ["company", "users", "search", email] as const,
    land: (companyId: string) => ["company", companyId, "land"] as const,
    landById: (companyId: string, landId: string) => ["company", companyId, "land", landId] as const,
    farmers: (companyId: string) => ["company", companyId, "farmers"] as const,
    farmerById: (companyId: string, farmerId: string) => ["company", companyId, "farmers", farmerId] as const,
    farmerGroups: (companyId: string) => ["company", companyId, "farmerGroups"] as const,
    farmerGroupById: (companyId: string, groupId: string) => ["company", companyId, "farmerGroups", groupId] as const,
    commodities: (companyId: string) => ["company", companyId, "commodities"] as const,
    commodityById: (companyId: string, commodityId: string) => ["company", companyId, "commodities", commodityId] as const,
    batches: (companyId: string) => ["company", companyId, "batches"] as const,
    batchById: (companyId: string, batchId: string) => ["company", companyId, "batches", batchId] as const,
    batchSources: (companyId: string, batchId: string) => ["company", companyId, "batches", batchId, "sources"] as const,
    batchSourceById: (companyId: string, batchId: string, sourceId: string) => ["company", companyId, "batches", batchId, "sources", sourceId] as const,
    batchAttributes: (companyId: string, batchId: string) => ["company", companyId, "batches", batchId, "attributes"] as const,
    batchAttributeById: (companyId: string, batchId: string, attributeId: string) => ["company", companyId, "batches", batchId, "attributes", attributeId] as const,
  },
} as const;

