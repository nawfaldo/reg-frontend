import { useQuery } from '@tanstack/react-query'
import { hasPermission } from '../lib/permissions'
import { server } from '../lib/api'
import { queryKeys } from '../lib/query-keys'

export function usePermissions(companyName: string | undefined) {
  const { data: companyData } = useQuery({
    queryKey: companyName ? queryKeys.company.byName(companyName) : ['company', companyName],
    queryFn: async () => {
      if (!companyName) return null;
      const { data, error } = await (server.api.company.name as any)({ name: companyName }).get();
      if (error) return null;
      return data;
    },
    enabled: !!companyName,
  });

  const permissions = companyData?.company?.permissions || [];
  const isOwner = companyData?.company?.isOwner || false;

  return {
    permissions,
    isOwner,
    hasPermission: (permissionName: string) => hasPermission(permissions, permissionName, isOwner),
    hasAnyMemberPermission: () => {
      if (isOwner) return true;
      return permissions.some((p: string) => p.startsWith('member:'));
    },
  };
}

