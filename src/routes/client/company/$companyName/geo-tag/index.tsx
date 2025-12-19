import { Link, useParams } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client/company/$companyName/geo-tag/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { companyName } = useParams({ from: '/client/company/$companyName/geo-tag/' })
  return (
    <div className="px-6 pt-1 h-full bg-white">
        <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Profil</h1>
        
        <div className="flex items-center gap-3">
            <Link
                to="/client/company/$companyName/geo-tag/create"
                params={{ companyName: companyName }}
                className="w-[90px] py-2 text-sm font-medium text-black bg-white border border-gray-300 border-b-7 hover:bg-gray-50 active:border-b-0 active:translate-y-1 transition-all text-center block"
            >
                Tambah
            </Link>
        </div>
        </div>
    </div>
    )
}
