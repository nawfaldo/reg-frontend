import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/client/company/$companyName/geo-tag/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/client/company/$companyName/geo-tag/create"!</div>
}
