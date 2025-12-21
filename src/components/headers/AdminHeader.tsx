import { useLocation, Link } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { useState } from "react"
import PrimaryButton from "../buttons/PrimaryButton"
import { usePermissions } from "../../hooks/usePermissions"
import Skeleton from "../Skeleton"

interface AdminHeaderProps {
  isLoading?: boolean
}

const AdminHeader = ({ isLoading = false }: AdminHeaderProps) => {
    const [searchQuery, setSearchQuery] = useState('')
    const location = useLocation()
    
    const pathMatch = location.pathname.match(/\/company\/([^/]+)/)
    const companyName = pathMatch ? pathMatch[1] : ''
    const params = { companyName }
    const { hasPermission } = usePermissions(companyName)
    
    const isUserPage = location.pathname.includes('/admin/user')
    const isRolePage = location.pathname.includes('/admin/role')
    const isPermissionPage = location.pathname.includes('/admin/permission')
    
    // Check permissions for each tab
    const canViewUsers = hasPermission('admin:user:view')
    const canViewRoles = hasPermission('admin:role:view')
    const canViewPermissions = hasPermission('admin:permission:view')
  
    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault()
      console.log('Search:', searchQuery)
    }
  
    const handleUserButton = () => {
      window.location.href = `/client/company/${companyName}/admin/user/create`
    }
  
    const handleRoleButton = () => {
      window.location.href = `/client/company/${companyName}/admin/role/create`
    }
  
    const handlePermissionButton = () => {
      window.location.href = `/client/company/${companyName}/admin/permission/create`
    }
  
    const getButtonConfig = () => {
      if (isUserPage && hasPermission('admin:user:create')) {
        return { title: 'Tambah', handle: handleUserButton }
      } else if (isRolePage && hasPermission('admin:role:create')) {
        return { title: 'Tambah', handle: handleRoleButton }
      } else if (isPermissionPage && hasPermission('admin:permission:create')) {
        return { title: 'Tambah', handle: handlePermissionButton }
      }
      return null
    }
  
    const buttonConfig = getButtonConfig()

    return (
        <div className="pb-4">
            <div className="flex items-center space-x-10">
            <h1 className="text-2xl font-bold text-black">Admin</h1>
            {isLoading ? (
              <div className="flex items-center gap-3 h-full pt-[13px]">
                <Skeleton width={50} height={20} />
                <Skeleton width={1} height={12} />
                <Skeleton width={50} height={20} />
                <Skeleton width={1} height={12} />
                <Skeleton width={70} height={20} />
              </div>
            ) : (
              <div className="flex items-center gap-3 h-full">
                {canViewUsers && (
                  <>
                <Link
                to="/client/company/$companyName/admin/user"
                      params={params}
                className={`text-black pb-1 pt-[13px] ${
                    isUserPage ? 'border-b-2 border-black font-regular' : 'font-light border-b-2 border-transparent'
                }`}
                >
                Akun
                </Link>
                    {(canViewRoles || canViewPermissions) && <div className="w-px h-3 bg-gray-300 self-center mt-[8px]"></div>}
                  </>
                )}
                {canViewRoles && (
                  <>
                <Link
                to="/client/company/$companyName/admin/role"
                      params={params}
                className={`text-black pb-1 pt-[13px] ${
                    isRolePage ? 'border-b-2 border-black font-regular' : 'font-light border-b-2 border-transparent'
                }`}
                >
                Peran
                </Link>
                    {canViewPermissions && <div className="w-px h-3 bg-gray-300 self-center mt-[8px]"></div>}
                  </>
                )}
                {canViewPermissions && (
                <Link
                to="/client/company/$companyName/admin/permission"
                    params={params}
                className={`text-black pb-1 pt-[13px] ${
                    isPermissionPage ? 'border-b-2 border-black font-regular' : 'font-light border-b-2 border-transparent'
                }`}
                >
                Perizinan
                </Link>
                )}
            </div>
            )}
            <div>
                {isLoading ? (
                  <div className="mt-3">
                    <Skeleton width={200} height={36} borderRadius={0} />
                  </div>
                ) : (
                  <form onSubmit={handleSearch} className='mt-3'>
                    <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari..."
                        className="w-full pl-9 pr-16 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-1 font-medium text-black text-sm bg-white border border-gray-300 border-b-5 hover:bg-gray-50 active:border-b-0 active:translate-y-1 transition-all"
                    >
                        Go!
                    </button>
                    </div>
                </form>
                )}
                </div>
                {isLoading ? (
                  <div className="mt-3 ml-auto">
                    <Skeleton width={90} height={36} borderRadius={4} />
                  </div>
                ) : buttonConfig && (
                <div className="mt-3 ml-auto">
                <PrimaryButton title={buttonConfig.title} handle={buttonConfig.handle} />
                </div>
                )}
            </div>
        </div>
    )
}

export default AdminHeader;