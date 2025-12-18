import { useQuery } from '@tanstack/react-query'
import { hasPermission } from '../lib/permissions'

export function usePermissions(companyName: string | undefined) {
  const { data: companyData } = useQuery({
    queryKey: ['company', companyName],
    queryFn: async () => {
      if (!companyName) return null;
      const response = await fetch(`https://reg-backend-psi.vercel.app/api/company/name/${encodeURIComponent(companyName)}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        return null;
      }
      return response.json();
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

