import { useLocation, Link } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { useState } from "react"
import PrimaryButton from "../buttons/PrimaryButton"
import { usePermissions } from "../../hooks/usePermissions"

const MemberHeader = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const location = useLocation()
    
    const pathMatch = location.pathname.match(/\/company\/([^/]+)/)
    const companyName = pathMatch ? pathMatch[1] : ''
    const params = { companyName }
    const { hasPermission } = usePermissions(companyName)
    
    const isUserPage = location.pathname.includes('/member/user')
    const isRolePage = location.pathname.includes('/member/role')
    const isPermissionPage = location.pathname.includes('/member/permission')
    
    // Check permissions for each tab
    const canViewUsers = hasPermission('member:user:view')
    const canViewRoles = hasPermission('member:role:view')
    const canViewPermissions = hasPermission('member:permission:view')
  
    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault()
      console.log('Search:', searchQuery)
    }
  
    const handleMemberButton = () => {
      window.location.href = `/client/company/${companyName}/member/user/create`
    }
  
    const handleRoleButton = () => {
      window.location.href = `/client/company/${companyName}/member/role/create`
    }
  
    const handlePermissionButton = () => {
      window.location.href = `/client/company/${companyName}/member/permission/create`
    }
  
    const getButtonConfig = () => {
      if (isUserPage && hasPermission('member:user:create')) {
        return { title: 'Tambah', handle: handleMemberButton }
      } else if (isRolePage && hasPermission('member:role:create')) {
        return { title: 'Tambah', handle: handleRoleButton }
      } else if (isPermissionPage && hasPermission('member:permission:create')) {
        return { title: 'Tambah', handle: handlePermissionButton }
      }
      return null
    }
  
    const buttonConfig = getButtonConfig()

    return (
        <div className="pb-4">
            <div className="flex items-center space-x-10">
            <h1 className="text-2xl font-bold text-black">Admin</h1>
            <div className="flex items-center gap-3 h-full">
                {canViewUsers && (
                  <>
                <Link
                to="/client/company/$companyName/member/user"
                      params={params}
                className={`text-black pb-1 pt-[13px] ${
                    isUserPage ? 'border-b-2 border-black font-regular' : 'font-light border-b-2 border-transparent'
                }`}
                >
                Pengguna
                </Link>
                    {(canViewRoles || canViewPermissions) && <div className="w-px h-3 bg-gray-300 self-center mt-[8px]"></div>}
                  </>
                )}
                {canViewRoles && (
                  <>
                <Link
                to="/client/company/$companyName/member/role"
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
                to="/client/company/$companyName/member/permission"
                    params={params}
                className={`text-black pb-1 pt-[13px] ${
                    isPermissionPage ? 'border-b-2 border-black font-regular' : 'font-light border-b-2 border-transparent'
                }`}
                >
                Perizinan
                </Link>
                )}
            </div>
            <div>
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
                </div>
                {buttonConfig && (
                <div className="mt-3 ml-auto">
                <PrimaryButton title={buttonConfig.title} handle={buttonConfig.handle} />
                </div>
                )}
            </div>
        </div>
    )
}

export default MemberHeader;