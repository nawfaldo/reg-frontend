import { useLocation, Link } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { useState } from "react"
import PrimaryButton from "../buttons/PrimaryButton"
import { usePermissions } from "../../hooks/usePermissions"
import Skeleton from "../Skeleton"

interface WorkerHeaderProps {
  isLoading?: boolean
}

const WorkerHeader = ({ isLoading = false }: WorkerHeaderProps) => {
    const [searchQuery, setSearchQuery] = useState('')
    const location = useLocation()
    
    const pathMatch = location.pathname.match(/\/company\/([^/]+)/)
    const companyName = pathMatch ? pathMatch[1] : ''
    const params = { companyName }
    const { hasPermission } = usePermissions(companyName)
    
    const isIndividualPage = location.pathname.includes('/worker/individual')
    const isGroupPage = location.pathname.includes('/worker/group')
    
    // Check permissions for each tab
    const canViewGroups = hasPermission('worker:group:view')
    const canViewIndividuals = hasPermission('worker:individual:view')
  
    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault()
      console.log('Search:', searchQuery)
    }
  
    const handleIndividualButton = () => {
      window.location.href = `/client/company/${companyName}/worker/individual/create`
    }
  
    const handleGroupButton = () => {
      window.location.href = `/client/company/${companyName}/worker/group/create`
    }
  
    const getButtonConfig = () => {
      if (isIndividualPage && hasPermission('worker:individual:create')) {
        return { title: 'Tambah', handle: handleIndividualButton }
      } else if (isGroupPage && hasPermission('worker:group:create')) {
        return { title: 'Tambah', handle: handleGroupButton }
      }
      return null
    }
  
    const buttonConfig = getButtonConfig()

    return (
        <div className="pb-4">
            <div className="flex items-center space-x-10">
            <h1 className="text-2xl font-bold text-black">Pekerja</h1>
            {isLoading ? (
              <div className="flex items-center gap-3 h-full pt-[13px]">
                <Skeleton width={70} height={20} />
                <Skeleton width={1} height={12} />
                <Skeleton width={90} height={20} />
              </div>
            ) : (
              <div className="flex items-center gap-3 h-full">
                {canViewGroups && (
                  <>
                    <Link
                      to={"/client/company/$companyName/worker/group" as any}
                      params={params as any}
                      className={`text-black pb-1 pt-[13px] ${
                          isGroupPage ? 'border-b-2 border-black font-regular' : 'font-light border-b-2 border-transparent'
                      }`}
                    >
                      Kelompok 
                    </Link>
                    {canViewIndividuals && <div className="w-px h-3 bg-gray-300 self-center mt-[8px]"></div>}
                  </>
                )}
                {canViewIndividuals && (
                  <Link
                    to={"/client/company/$companyName/worker/individual" as any}
                    params={params as any}
                    className={`text-black pb-1 pt-[13px] ${
                        isIndividualPage ? 'border-b-2 border-black font-regular' : 'font-light border-b-2 border-transparent'
                    }`}
                  >
                    Perorangan
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

export default WorkerHeader;