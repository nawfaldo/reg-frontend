import { createFileRoute, useParams, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Eye, Pencil, User } from 'lucide-react'
import MemberHeader from '../../../../../../component/headers/MemberHeader'
import { usePermissions } from '../../../../../../hooks/usePermissions'

export const Route = createFileRoute('/client/company/$companyName/member/user/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/member/user/' })
  const { hasPermission } = usePermissions(companyName)

  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company', companyName],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3000/api/company/name/${encodeURIComponent(companyName)}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch company');
      }
      return response.json();
    },
  });

  const { data: membersData, isLoading: isLoadingMembers, error } = useQuery({
    queryKey: ['company', companyData?.company?.id, 'members'],
    queryFn: async () => {
      if (!companyData?.company?.id) return null;
      const response = await fetch(`http://localhost:3000/api/company/${companyData.company.id}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch members');
      }
      return response.json();
    },
    enabled: !!companyData?.company?.id,
  });

  if (isLoadingCompany || isLoadingMembers) {
    return (
      <div className="px-6 pt-6 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 pt-6 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  // Check permission to view users
  if (!hasPermission('member:user:view')) {
    return (
      <div className="px-6 pt-6 h-full bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Anda tidak memiliki izin untuk melihat daftar anggota</p>
        </div>
      </div>
    );
  }

  const members = membersData?.company?.members || [];

  return (
    <div className="px-6 h-full bg-white">
      <MemberHeader />
<div className="overflow-x-auto">
  <table className="w-full border-collapse">
    <colgroup>
      <col className="w-[250px]" />
      <col className="w-[250px]" />
      <col className="w-[150px]" />
      <col className="w-[100px]" />
      <col className="w-auto" />
    </colgroup>
    
    <thead>
      <tr className="border border-gray-200 bg-gray-100">
        <th className="text-left py-3 pl-5 pr-1 text-sm font-medium text-black">Nama</th>
        <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Email</th>
        <th className="text-left py-3 pl-1 pr-1 text-sm font-medium text-black">Role</th>
        <th className="text-left py-3 pl-1 pr-2 text-sm font-medium text-black">Aksi</th>
        <th className="py-3"></th>
      </tr>
    </thead>
    
    <tbody>
      {members.length === 0 ? (
        <tr>
          <td colSpan={5} className="py-8 px-2 text-center text-gray-500">
            Tidak ada anggota
          </td>
        </tr>
      ) : (
        members.map((member: any) => (
          <tr key={member.id} className="border-b border-gray-200">
            <td className="py-3 pl-5 pr-1">
              <div className="flex items-center gap-2">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-[22px] h-[22px] rounded-[7px] object-cover"
                  />
                ) : (
                  <div className="w-[22px] h-[22px] rounded-[7px] bg-gray-200 flex items-center justify-center">
                    <User className="w-3 h-3 text-gray-400" />
                  </div>
                )}
                <span className="text-sm text-black">{member.name}</span>
              </div>
            </td>
            <td className="py-3 pl-1 pr-1">
              <span className="text-sm text-black">{member.email}</span>
            </td>
            <td className="py-3 pl-1 pr-1">
              <div className="flex flex-wrap gap-1">
                {member.roles && member.roles.length > 0 ? (
                  member.roles.map((role: any, index: number) => (
                    <span key={role.id || index} className="text-sm text-black capitalize">
                      {role.name}{index < member.roles.length - 1 ? ',' : ''}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-black capitalize">{member.role || '-'}</span>
                )}
              </div>
            </td>
            <td className="py-3 pl-1 pr-2">
              <div className="flex items-center gap-2">
                {hasPermission('member:user:view') && (
                  <Link
                    to="/client/company/$companyName/member/user/$userId"
                    params={{ companyName, userId: member.id }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Lihat"
                  >
                    <Eye className="w-4 h-4 text-black" />
                  </Link>
                )}
                {hasPermission('member:user:update') && (
                  <Link
                    to="/client/company/$companyName/member/user/$userId/edit"
                    params={{ companyName, userId: member.id }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 text-black" />
                  </Link>
                )}
              </div>
            </td>
            <td className="py-3"></td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>
    </div>
  )
}
